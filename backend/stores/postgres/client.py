"""
stores/postgres/client.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pool size tuned for Supabase free tier:
    session pooler limit = 15 connections
    pool_size=3, max_overflow=2 → max 5 per process
    leaves headroom for uvicorn + celery running simultaneously

If pool is exhausted, classify_db_error maps it to
SUPABASE_POOL_EXHAUSTED with a user-facing message.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

from collections.abc import AsyncGenerator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from config.settings import get_settings


class Base(DeclarativeBase):
    pass


_engine = None
_session_factory = None


def get_engine():
    global _engine
    if _engine is None:
        settings = get_settings()
        _engine = create_async_engine(
            settings.database_url,
            # Tuned for Supabase free tier (15 connection limit):
            # uvicorn process: pool_size=3, max_overflow=2 → max 5
            # celery worker:   pool_size=3, max_overflow=2 → max 5
            # leaves 5 for Supabase internal + other tools
            pool_size=3,
            max_overflow=2,
            pool_pre_ping=True,       # detect stale connections before use
            pool_recycle=1800,        # recycle connections every 30 min
            pool_timeout=10,          # fail fast if no connection available
            echo=settings.app_debug,
        )
    return _engine


def get_session_factory():
    global _session_factory
    if _session_factory is None:
        _session_factory = async_sessionmaker(
            bind=get_engine(),
            class_=AsyncSession,
            expire_on_commit=False,
        )
    return _session_factory


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    from api.errors import classify_db_error
    factory = get_session_factory()
    async with factory() as session:
        try:
            yield session
            await session.commit()
        except Exception as exc:
            await session.rollback()
            # Re-raise as AppError if it's a known DB error
            # so FastAPI exception handler formats it properly
            msg = str(exc).lower()
            if any(k in msg for k in ("emaxconnsession", "max clients", "connection")):
                raise classify_db_error(exc) from exc
            raise


async def check_postgres_health() -> bool:
    try:
        factory = get_session_factory()
        async with factory() as session:
            await session.execute(text("SELECT 1"))
            return True
    except Exception:
        return False
    