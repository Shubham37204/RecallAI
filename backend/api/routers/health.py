import asyncio

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from config.settings import get_settings
from observability.logger import get_logger
from stores.postgres.client import check_postgres_health
from stores.qdrant.client import check_qdrant_health
from stores.redis.client import check_redis_health

router = APIRouter(tags=["health"])
logger = get_logger(__name__)
settings = get_settings()


@router.get("/health/ping")
async def ping() -> dict:
    """
    Minimal liveness probe.
    Returns immediately — no DB calls.
    Used by: Kubernetes liveness probe, uptime monitors.
    """
    return {"status": "ok"}


@router.get("/health")
async def health_check() -> JSONResponse:
    """
    Full readiness probe.
    Checks all store connections concurrently.
    Returns 200 if all healthy, 503 if any degraded.

    Response shape:
        {
            "status": "healthy" | "degraded",
            "version": "0.1.0",
            "stores": {
                "postgres": "ok" | "error",
                "redis":    "ok" | "error",
                "qdrant":   "ok" | "error"
            }
        }
    """
    postgres_ok, redis_ok, qdrant_ok = await asyncio.gather(
        check_postgres_health(),
        check_redis_health(),
        check_qdrant_health(),
        return_exceptions=False,
    )

    stores = {
        "postgres": "ok" if postgres_ok else "error",
        "redis":    "ok" if redis_ok    else "error",
        "qdrant":   "ok" if qdrant_ok   else "error",
    }

    all_healthy = all(v == "ok" for v in stores.values())
    overall = "healthy" if all_healthy else "degraded"
    status_code = 200 if all_healthy else 503

    if not all_healthy:
        logger.warning(
            "health.check.degraded",
            stores=stores,
        )
    else:
        logger.info("health.check.ok")

    return JSONResponse(
        status_code=status_code,
        content={
            "status": overall,
            "version": settings.app_version,
            "stores": stores,
        },
    )