"""
api/dependencies.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Purpose:
    Shared FastAPI dependencies injected into route handlers
    via Depends(). Centralizes common logic — DB sessions,
    settings access, pagination params.

Why FastAPI Depends():
    - Automatic lifecycle management (DB session opens/closes)
    - Testable — override in tests with fake implementations
    - DRY — same logic not repeated across 20 routes
    - Type-safe — FastAPI validates dependency return types

Usage in routes:
    @router.post("/bookmarks")
    async def create_bookmark(
        session: AsyncSession = Depends(get_session),
        settings: Settings = Depends(get_app_settings),
    ):
        ...

Dependencies defined here:
    get_session       → yields AsyncSession, auto-commits/rolls back
    get_app_settings  → returns cached Settings instance
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from config.settings import Settings, get_settings
from stores.postgres.client import get_db_session


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Yields a database session for the duration of a request.

    Lifecycle:
        1. Request arrives → session opens
        2. Route handler runs with session
        3. No exception → session commits automatically
        4. Exception raised → session rolls back automatically
        5. Request ends → session closes

    Why not use get_db_session directly in routes:
        Depends(get_session) lets us override in tests:
            app.dependency_overrides[get_session] = fake_session
    """
    async for session in get_db_session():
        yield session


def get_app_settings() -> Settings:
    """
    Returns cached Settings instance.
    Injected into routes that need config values.

    Why not import settings directly in routes:
        Depends() allows overriding in tests with custom settings.
    """
    return get_settings()
