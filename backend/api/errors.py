from __future__ import annotations

from dataclasses import dataclass
from enum import Enum

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from observability.logger import get_logger

logger = get_logger(__name__)


class ErrorCategory(str, Enum):
    TRANSIENT = "transient"   
    QUOTA     = "quota"       
    DEGRADED  = "degraded"    


@dataclass(frozen=True)
class ErrorSpec:
    code: str
    category: ErrorCategory
    http_status: int
    message: str    
    action: str       
    retryable: bool


ERRORS: dict[str, ErrorSpec] = {
    "SUPABASE_POOL_EXHAUSTED": ErrorSpec(
        code="SUPABASE_POOL_EXHAUSTED",
        category=ErrorCategory.DEGRADED,
        http_status=503,
        message="Database is temporarily at capacity.",
        action="Please wait 30 seconds and try again. This happens when too many requests hit the free tier simultaneously.",
        retryable=True,
    ),
    "SUPABASE_CONNECTION_FAILED": ErrorSpec(
        code="SUPABASE_CONNECTION_FAILED",
        category=ErrorCategory.TRANSIENT,
        http_status=503,
        message="Could not connect to the database.",
        action="Please try again in a moment.",
        retryable=True,
    ),
    "SUPABASE_PROJECT_NOT_FOUND": ErrorSpec(
        code="SUPABASE_PROJECT_NOT_FOUND",
        category=ErrorCategory.DEGRADED,
        http_status=503,
        message="Database project could not be found.",
        action="Check DATABASE_URL. The Supabase project ref, pooler host, or database user appears to be wrong or the project was deleted.",
        retryable=False,
    ),

    "REDIS_QUOTA_EXCEEDED": ErrorSpec(
        code="REDIS_QUOTA_EXCEEDED",
        category=ErrorCategory.QUOTA,
        http_status=503,
        message="Daily request limit reached for the task queue.",
        action="You've hit the free tier limit for today (10,000 requests). This resets at midnight UTC. Try again tomorrow.",
        retryable=False,
    ),
    "REDIS_CONNECTION_FAILED": ErrorSpec(
        code="REDIS_CONNECTION_FAILED",
        category=ErrorCategory.TRANSIENT,
        http_status=503,
        message="Task queue is temporarily unavailable.",
        action="Please try again in a moment.",
        retryable=True,
    ),


    "GROQ_RATE_LIMIT": ErrorSpec(
        code="GROQ_RATE_LIMIT",
        category=ErrorCategory.QUOTA,
        http_status=429,
        message="AI summarization limit reached.",
        action="The free tier allows 30 AI requests per minute. Please wait a minute before saving more bookmarks.",
        retryable=True,
    ),
    "GROQ_SERVICE_ERROR": ErrorSpec(
        code="GROQ_SERVICE_ERROR",
        category=ErrorCategory.TRANSIENT,
        http_status=503,
        message="AI service is temporarily unavailable.",
        action="Please try again in a moment. Groq may be experiencing an outage.",
        retryable=True,
    ),

    "HF_RATE_LIMIT": ErrorSpec(
        code="HF_RATE_LIMIT",
        category=ErrorCategory.QUOTA,
        http_status=429,
        message="Embedding model rate limit reached.",
        action="Set a HuggingFace token (HF_TOKEN) in your .env to increase limits, or wait a few minutes.",
        retryable=True,
    ),
    "HF_MODEL_UNAVAILABLE": ErrorSpec(
        code="HF_MODEL_UNAVAILABLE",
        category=ErrorCategory.TRANSIENT,
        http_status=503,
        message="Embedding model is temporarily unavailable.",
        action="Please try again in a moment.",
        retryable=True,
    ),

    "QDRANT_UNAVAILABLE": ErrorSpec(
        code="QDRANT_UNAVAILABLE",
        category=ErrorCategory.DEGRADED,
        http_status=503,
        message="Vector search is currently unavailable.",
        action="Qdrant may not be running. Start it with: docker start bookmark_qdrant",
        retryable=True,
    ),
    "INTERNAL_ERROR": ErrorSpec(
        code="INTERNAL_ERROR",
        category=ErrorCategory.TRANSIENT,
        http_status=500,
        message="An unexpected error occurred.",
        action="Please try again. If this persists, check the server logs.",
        retryable=True,
    ),
}


class AppError(Exception):
    """Raise this anywhere in the app to surface a structured error to the client."""

    def __init__(self, error_code: str, detail: str | None = None) -> None:
        self.spec = ERRORS.get(error_code, ERRORS["INTERNAL_ERROR"])
        self.detail = detail  
        super().__init__(self.spec.message)

    def to_response(self) -> dict:
        return {
            "error_code": self.spec.code,
            "category": self.spec.category.value,
            "message": self.spec.message,
            "action": self.spec.action,
            "retryable": self.spec.retryable,
        }


def classify_db_error(exc: Exception) -> AppError:
    """Map SQLAlchemy / asyncpg errors to AppError."""
    msg = str(exc).lower()
    if "emaxconnsession" in msg or "max clients" in msg or "pool_size" in msg:
        return AppError("SUPABASE_POOL_EXHAUSTED", detail=str(exc))
    if "enotfound" in msg or "tenant/user" in msg:
        return AppError("SUPABASE_PROJECT_NOT_FOUND", detail=str(exc))
    if "connection" in msg or "connect" in msg:
        return AppError("SUPABASE_CONNECTION_FAILED", detail=str(exc))
    return AppError("INTERNAL_ERROR", detail=str(exc))


def classify_redis_error(exc: Exception) -> AppError:
    """Map Redis / Upstash errors to AppError."""
    msg = str(exc).lower()
    if "max daily" in msg or "quota" in msg or "limit" in msg or "429" in msg:
        return AppError("REDIS_QUOTA_EXCEEDED", detail=str(exc))
    return AppError("REDIS_CONNECTION_FAILED", detail=str(exc))


def classify_groq_error(exc: Exception) -> AppError:
    """Map Groq API errors to AppError."""
    msg = str(exc).lower()
    if "rate limit" in msg or "429" in msg or "too many" in msg:
        return AppError("GROQ_RATE_LIMIT", detail=str(exc))
    return AppError("GROQ_SERVICE_ERROR", detail=str(exc))


def classify_hf_error(exc: Exception) -> AppError:
    """Map HuggingFace errors to AppError."""
    msg = str(exc).lower()
    if "rate limit" in msg or "429" in msg or "too many" in msg:
        return AppError("HF_RATE_LIMIT", detail=str(exc))
    return AppError("HF_MODEL_UNAVAILABLE", detail=str(exc))


def classify_qdrant_error(exc: Exception) -> AppError:
    """Map Qdrant errors to AppError."""
    return AppError("QDRANT_UNAVAILABLE", detail=str(exc))


def register_error_handlers(app: FastAPI) -> None:
    """Register all exception handlers on the FastAPI app."""

    @app.exception_handler(AppError)
    async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.spec.http_status,
            content=exc.to_response(),
        )

    @app.exception_handler(Exception)
    async def unhandled_error_handler(request: Request, exc: Exception) -> JSONResponse:
        from fastapi import HTTPException
        if isinstance(exc, HTTPException):
            raise exc
        logger.error(
            "unhandled.exception",
            path=str(request.url.path),
            method=request.method,
            error=str(exc),
            exc_info=True,
        )
        return JSONResponse(
            status_code=500,
            content=AppError("INTERNAL_ERROR").to_response(),
        )
    
