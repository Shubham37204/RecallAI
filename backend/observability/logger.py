"""
observability/logger.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Purpose:
    Configures structlog once at startup.
    All modules call get_logger() — never use print() or
    raw logging.getLogger() anywhere else in the codebase.

Why structlog:
    - Structured JSON logs in production (parseable by
      log aggregators like Datadog, Loki, CloudWatch)
    - Human-readable colored logs in development
    - Automatic context binding (request_id, user_id)
    - Consistent log format across all modules

Usage:
    from observability.logger import get_logger
    logger = get_logger(__name__)
    logger.info("bookmark.created", bookmark_id=str(id), user_id=user_id)

Log levels:
    DEBUG   → internal state, query details (dev only)
    INFO    → normal operations (request in, task queued)
    WARNING → unexpected but recoverable (retry attempt)
    ERROR   → failed operations (scrape failed, DB error)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

import logging
import sys

import structlog

from config.settings import get_settings


def setup_logging() -> None:
    """
    Call once at app startup (in FastAPI lifespan).
    Configures both structlog and stdlib logging to use
    same format — libraries using stdlib logging (SQLAlchemy,
    httpx) will also output structured logs.
    """
    settings = get_settings()

    log_level = getattr(logging, settings.log_level.upper(), logging.INFO)

    # ── Shared processors ─────────────────────────────────────────────────────
    # Applied to every log entry regardless of format
    shared_processors: list = [
        structlog.contextvars.merge_contextvars,        # request-scoped context
        structlog.stdlib.add_log_level,                 # level string
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),    # ISO 8601 timestamp
        structlog.processors.StackInfoRenderer(),
    ]

    if settings.log_format == "json":
        # Production: machine-readable JSON
        # Each log line = one JSON object — parseable by any log aggregator
        processors = shared_processors + [
            structlog.processors.format_exc_info,
            structlog.processors.JSONRenderer(),
        ]
    else:
        # Development: colored, human-readable
        processors = shared_processors + [
            structlog.dev.ConsoleRenderer(colors=True),
        ]

    structlog.configure(
        processors=processors,
        wrapper_class=structlog.make_filtering_bound_logger(log_level),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(sys.stdout),
        cache_logger_on_first_use=True,
    )

    # ── Stdlib logging bridge ─────────────────────────────────────────────────
    # Redirects SQLAlchemy, httpx, uvicorn logs through structlog
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=log_level,
    )

    # Silence noisy libraries in non-debug mode
    if not settings.app_debug:
        logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
        logging.getLogger("httpx").setLevel(logging.WARNING)
        logging.getLogger("httpcore").setLevel(logging.WARNING)


def get_logger(name: str) -> structlog.BoundLogger:
    """
    Returns a structlog logger bound to the calling module name.

    Usage:
        logger = get_logger(__name__)
        logger.info("event.name", key="value", other_key=123)
    """
    return structlog.get_logger(name)
