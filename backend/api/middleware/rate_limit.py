from __future__ import annotations

import time

from fastapi import Depends, HTTPException, status

from api.middleware.clerk_auth import get_current_user_id
from config.settings import get_settings
from observability.logger import get_logger
from stores.redis.client import get_redis_cache

logger = get_logger("api.rate_limit")


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
    settings = get_settings()
    limit = settings.rate_limit_per_minute
    window = settings.rate_limit_window_seconds
    redis = get_redis_cache()
    bucket = _window_bucket(window)
    key = f"rate_limit:search:{user_id}:{bucket}"

    try:
        count = await redis.incr(key)

        if count == 1:
            await redis.expire(key, window * 2)

        if count > limit:
            logger.warning(
                "rate_limit.exceeded",
                user_id=user_id,
                count=count,
                limit=limit,
                window=window,
            )
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": "rate_limit_exceeded",
                    "limit": limit,
                    "window_seconds": window,
                    "message": f"Max {limit} searches per {window}s",
                },
                headers={"Retry-After": str(window)},
            )

        logger.info(
            "rate_limit.ok",
            user_id=user_id,
            count=count,
            limit=limit,
        )

    except HTTPException:
        raise 
    except Exception as e:
        logger.error(
            "rate_limit.redis_error",
            user_id=user_id,
            error=str(e),
        )

    return user_id
