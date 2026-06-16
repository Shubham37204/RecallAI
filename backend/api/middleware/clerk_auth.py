import time
from typing import Optional

import httpx
from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from jose.exceptions import ExpiredSignatureError
from config.settings import get_settings
from observability.logger import get_logger

logger = get_logger(__name__)
settings = get_settings()

_jwks_cache: dict = {}
_CACHE_TTL_SECONDS = 3600


async def _get_jwks() -> dict:
    """
    Fetch Clerk's public keys from JWKS endpoint.
    Cached for 1 hour — not fetched on every request.
    """
    global _jwks_cache

    now = time.time()
    if _jwks_cache and (now - _jwks_cache.get("cached_at", 0)) < _CACHE_TTL_SECONDS:
        return _jwks_cache["keys"]

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(settings.clerk_jwks_url)
            response.raise_for_status()
            jwks = response.json()

        _jwks_cache = {"keys": jwks, "cached_at": now}
        logger.info("clerk.jwks.refreshed")
        return jwks

    except Exception as e:
        logger.error("clerk.jwks.fetch_failed", error=str(e))
        if _jwks_cache:
            logger.warning("clerk.jwks.using_stale_cache")
            return _jwks_cache["keys"]
        raise HTTPException(status_code=503, detail="Authentication service unavailable")


async def verify_clerk_token(token: str, request: Request) -> str:
    """
    Verify Clerk JWT, store full claims on request.state, return user_id.

    Stores decoded payload at request.state.clerk_claims so downstream
    code (e.g. bookmark router) can extract email/name without re-decoding.

    Raises 401 if invalid or expired.
    """
    jwks = await _get_jwks()

    try:
        payload = jwt.decode(
            token,
            jwks,
            algorithms=["RS256"],
            options={"verify_aud": False},
        )

        user_id: Optional[str] = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: missing sub claim")

        # Store full claims for downstream use — no re-decode needed
        request.state.clerk_claims = payload

        return user_id

    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except JWTError as e:
        logger.warning("clerk.jwt.invalid", error=str(e))
        raise HTTPException(status_code=401, detail="Invalid token")
    except HTTPException:
        raise
    except Exception as e:
        logger.error("clerk.jwt.verification_error", error=str(e))
        raise HTTPException(status_code=401, detail="Token verification failed")


_bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user_id(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
) -> str:
    """
    FastAPI dependency — verifies JWT and returns user_id.

    Dev mode: X-User-Id header accepted as fallback (no JWT needed).
              clerk_claims will be empty dict in dev bypass mode.
    Production: only Bearer JWT accepted.

    Usage in routes:
        user_id: str = Depends(get_current_user_id)
    """
    if settings.is_development:
        dev_user_id = request.headers.get("X-User-Id")
        if dev_user_id and not credentials:
            logger.warning("clerk.auth.dev_bypass", user_id=dev_user_id)
            # No JWT in dev bypass — set empty claims so downstream code
            # doesn't crash on getattr(request.state, "clerk_claims", {})
            request.state.clerk_claims = {}
            return dev_user_id

    if not credentials:
        raise HTTPException(status_code=401, detail="Authorization header required")

    return await verify_clerk_token(credentials.credentials, request)
