import redis.asyncio as aioredis

from config.settings import get_settings

settings = get_settings()

_cache_pool: aioredis.Redis | None = None


def get_redis_cache() -> aioredis.Redis:
    """
    Returns the Redis cache client (DB 1).
    Used by: rate limiter middleware, response caching.

    Called at request time — pool created once on first call.
    """
    global _cache_pool
    if _cache_pool is None:
        _cache_pool = aioredis.from_url(
            settings.redis_cache_url,
            encoding="utf-8",
            decode_responses=True,
            max_connections=20,
        )
    return _cache_pool


async def close_redis() -> None:
    """
    Gracefully close Redis pool on app shutdown.
    Called in FastAPI lifespan shutdown hook.
    """
    global _cache_pool
    if _cache_pool is not None:
        await _cache_pool.aclose()
        _cache_pool = None

async def check_redis_health() -> bool:
    try:
        client = get_redis_cache()
        result = await client.ping()
        return result is True
    except Exception:
        return False
    