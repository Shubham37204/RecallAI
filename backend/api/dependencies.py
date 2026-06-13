from collections.abc import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from config.settings import Settings, get_settings
from stores.postgres.client import get_db_session

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Yields DB session for request duration.
    Auto-commits on success, rolls back on exception.
    """
    async for session in get_db_session():
        yield session


def get_app_settings() -> Settings:
    """Returns cached Settings instance."""
    return get_settings()
