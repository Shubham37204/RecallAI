# api/middleware/rate_limit.py
"""
api/middleware/rate_limit.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Purpose:
    Redis-backed sliding window rate limiter as FastAPI dependency.

Why dependency not middleware:
    - Middleware runs on ALL routes — rate limit only needed on search
    - Dependency is explicit, testable, reusable per-route
    - Can inject different limits on different routes (search vs. other)
    - Easier to mock in tests

Algorithm: fixed window (per 60s bucket)
    - Key: rate_limit:{user_id}:{window_bucket}
    - window_bucket = unix_timestamp // window_seconds
    - INCR + EXPIRE on each request
    - If count > limit → 429

Why fixed window not sliding:
    - Sliding window needs sorted sets (higher Redis cost)
    - Fixed window sufficient for this use case
    - Burst at window boundary is acceptable tradeoff

Redis key TTL = window_seconds * 2 (safe expiry buffer)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

from __future__ import annotations

import time

from fastapi import Depends, HTTPException, status

from api.middleware.clerk_auth import get_current_user_id
from observability.logger import get_logger
from stores.redis.client import get_redis_cache

logger = get_logger("api.rate_limit")

# Search-specific limits (set at Slice 6 design)
SEARCH_RATE_LIMIT = 20       # requests
SEARCH_RATE_WINDOW = 60      # seconds


def _window_bucket(window_seconds: int) -> int:
    """Current fixed window bucket — changes every window_seconds."""
    return int(time.time()) // window_seconds


async def check_search_rate_limit(
    user_id: str = Depends(get_current_user_id),
) -> str:
    """
    FastAPI dependency — enforces 20 req/60s per user for search.

    Usage:
        @router.get("/search")
        async def search(
            user_id: str = Depends(check_search_rate_limit),
            ...
        ):

    Returns:
        user_id (pass-through — caller needs it anyway)

    Raises:
        HTTP 429 if rate limit exceeded
        HTTP 503 if Redis unavailable (fail open — don't block users)
    """
    redis = get_redis_cache()
    bucket = _window_bucket(SEARCH_RATE_WINDOW)
    key = f"rate_limit:search:{user_id}:{bucket}"

    try:
        count = await redis.incr(key)

        # Set TTL on first request in window
        if count == 1:
            await redis.expire(key, SEARCH_RATE_WINDOW * 2)

        if count > SEARCH_RATE_LIMIT:
            logger.warning(
                "rate_limit.exceeded",
                user_id=user_id,
                count=count,
                limit=SEARCH_RATE_LIMIT,
                window=SEARCH_RATE_WINDOW,
            )
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": "rate_limit_exceeded",
                    "limit": SEARCH_RATE_LIMIT,
                    "window_seconds": SEARCH_RATE_WINDOW,
                    "message": f"Max {SEARCH_RATE_LIMIT} searches per {SEARCH_RATE_WINDOW}s",
                },
                headers={"Retry-After": str(SEARCH_RATE_WINDOW)},
            )

        logger.info(
            "rate_limit.ok",
            user_id=user_id,
            count=count,
            limit=SEARCH_RATE_LIMIT,
        )

    except HTTPException:
        raise  # re-raise 429, don't swallow
    except Exception as e:
        # Redis down — fail open (don't block users for infra failure)
        logger.error(
            "rate_limit.redis_error",
            user_id=user_id,
            error=str(e),
        )

    return user_id
