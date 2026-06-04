import pytest

from config.settings import get_settings


@pytest.fixture(autouse=True)
def reset_settings_cache():
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


@pytest.fixture(scope="session", autouse=True)
def reset_store_singletons():
    """Reset ALL singletons before session starts — prevents stale cached clients."""
    import stores.postgres.client as pg
    import stores.qdrant.client as qdrant
    import stores.redis.client as redis

    # Force destroy any existing clients
    pg._engine = None
    pg._session_factory = None
    qdrant._client = None
    redis._cache_pool = None

    yield

    # Cleanup after session
    qdrant._client = None
    redis._cache_pool = None