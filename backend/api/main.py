"""
api/main.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Purpose:
    FastAPI application entry point.
    Configures:
        - Lifespan (startup + shutdown hooks)
        - CORS middleware
        - Route registration
        - Prometheus metrics endpoint
        - Global exception handling

Lifespan pattern (replaces deprecated @app.on_event):
    Modern FastAPI uses async context manager for startup/shutdown.
    On startup:  setup logging, bootstrap Qdrant collection
    On shutdown: close DB pool, Redis pool, Qdrant client

Boot command:
    uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response

from api.routers import health, bookmarks
from config.settings import get_settings
from observability.logger import get_logger, setup_logging
from observability.metrics import get_metrics_response
from stores.postgres.client import get_engine
from stores.qdrant.client import close_qdrant, ensure_collection
from stores.redis.client import close_redis

settings = get_settings()
logger = get_logger(__name__)


# ── Lifespan ──────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Runs on startup (before yield) and shutdown (after yield).

    Startup:
        1. Setup structured logging
        2. Bootstrap Qdrant collection (idempotent)
        3. Log that app is ready

    Shutdown:
        1. Close Redis connection pool
        2. Close Qdrant client
        3. Dispose SQLAlchemy engine pool
    """
    # ── Startup ───────────────────────────────────────────────────────────────
    setup_logging()
    logger.info("app.starting", env=settings.app_env, version=settings.app_version)

    # Ensure Qdrant collection exists (safe to call every boot)
    await ensure_collection()
    logger.info("qdrant.collection.ready", collection=settings.qdrant_collection_name)

    logger.info("app.ready", host=settings.app_host, port=settings.app_port)

    yield

    # ── Shutdown ──────────────────────────────────────────────────────────────
    logger.info("app.shutting_down")

    await close_redis()
    await close_qdrant()

    engine = get_engine()
    await engine.dispose()

    logger.info("app.shutdown_complete")


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Bookmark Brain API",
    description="AI-powered bookmark manager — save, summarize, search.",
    version=settings.app_version,
    docs_url="/docs" if settings.is_development else None,    # hide docs in prod
    redoc_url="/redoc" if settings.is_development else None,
    lifespan=lifespan,
)


# ── CORS ──────────────────────────────────────────────────────────────────────
# Allows frontend (Next.js on localhost:3000) to call the API.
# In production, restrict to your deployed frontend domain only.

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# ── Routes ────────────────────────────────────────────────────────────────────

app.include_router(health.router)
app.include_router(bookmarks.router)


# ── Metrics endpoint ──────────────────────────────────────────────────────────
# Prometheus scrapes GET /metrics on its own schedule (default every 15s).
# Not behind auth — typically only exposed on internal network in production.

@app.get("/metrics", include_in_schema=False)
async def metrics() -> Response:
    data, content_type = get_metrics_response()
    return Response(content=data, media_type=content_type)


# ── Global exception handler ──────────────────────────────────────────────────
# Catches any unhandled exception and returns structured JSON error.
# Prevents stack traces leaking to API consumers.

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error(
        "unhandled.exception",
        path=str(request.url.path),
        method=request.method,
        error=str(exc),
        exc_info=True,
    )
    return JSONResponse(
        status_code=500,
        content={"error": "internal_server_error", "message": "An unexpected error occurred"},
    )
