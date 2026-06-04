from collections.abc import AsyncGenerator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from config.settings import get_settings


# ── Base ──────────────────────────────────────────────────────────────────────
# Defined at module level — safe, no DB connection needed.
# All ORM models inherit from this.
class Base(DeclarativeBase):
    pass


# ── Lazy Engine ───────────────────────────────────────────────────────────────
# Engine created on first call — NOT at import time.
# This means importing models.py in unit tests does NOT trigger DB connection.
_engine = None
_session_factory = None


def get_engine():
    global _engine
    if _engine is None:
        settings = get_settings()
        _engine = create_async_engine(
            settings.database_url,
            pool_size=10,
            max_overflow=20,
            pool_pre_ping=True,
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


# ── Dependency ────────────────────────────────────────────────────────────────
# Used in FastAPI routes via Depends(get_db_session).
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    factory = get_session_factory()
    async with factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


# ── Health Check ──────────────────────────────────────────────────────────────
async def check_postgres_health() -> bool:
    try:
        factory = get_session_factory()
        async with factory() as session:
            await session.execute(text("SELECT 1"))
            return True
    except Exception:
        return False