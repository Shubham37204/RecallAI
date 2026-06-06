"""
api/main.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Purpose:
    FastAPI application entry point.
    Lifespan, CORS, routers, Swagger config.

Auth in Slice 4:
    Swagger UI shows Bearer token auth.
    Dev: X-User-Id header OR Bearer JWT both work.
    Prod: only Bearer JWT accepted.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
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


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    setup_logging()
    logger.info("app.starting", env=settings.app_env, version=settings.app_version)
    await ensure_collection()
    logger.info("qdrant.collection.ready", collection=settings.qdrant_collection_name)
    logger.info("app.ready", host=settings.app_host, port=settings.app_port)
    yield
    logger.info("app.shutting_down")
    await close_redis()
    await close_qdrant()
    engine = get_engine()
    await engine.dispose()
    logger.info("app.shutdown_complete")


app = FastAPI(
    title="Bookmark Brain API",
    description="AI-powered bookmark manager — save, summarize, search.",
    version=settings.app_version,
    docs_url="/docs" if settings.is_development else None,
    redoc_url="/redoc" if settings.is_development else None,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(bookmarks.router)


# ── Swagger auth config ───────────────────────────────────────────────────────
# Shows "Authorize" button in Swagger UI.
# Dev: enter any string in X-User-Id field to test without real JWT.
# Prod: enter real Clerk JWT token in BearerAuth field.

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )

    schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Clerk JWT token. Get from frontend after login.",
        },
        "DevUserIdHeader": {
            "type": "apiKey",
            "in": "header",
            "name": "X-User-Id",
            "description": "DEV ONLY — enter any user ID to bypass JWT auth.",
        },
    }

    for path in schema.get("paths", {}).values():
        for method in path.values():
            method["security"] = [{"BearerAuth": []}, {"DevUserIdHeader": []}]

    app.openapi_schema = schema
    return schema


app.openapi = custom_openapi


@app.get("/metrics", include_in_schema=False)
async def metrics() -> Response:
    data, content_type = get_metrics_response()
    return Response(content=data, media_type=content_type)


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