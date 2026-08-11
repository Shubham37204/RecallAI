from qdrant_client import AsyncQdrantClient
from qdrant_client.models import Distance, VectorParams

from config.settings import get_settings

_client: AsyncQdrantClient | None = None


def get_qdrant_client() -> AsyncQdrantClient:
    global _client
    if _client is None:
        settings = get_settings()
        if settings.qdrant_url:
            _client = AsyncQdrantClient(
                url=settings.qdrant_url,
                api_key=settings.qdrant_api_key,
                timeout=settings.http_timeout_seconds,
                prefer_grpc=False,
                check_compatibility=False,
            )
        else:
            use_https = bool(settings.qdrant_api_key)
            _client = AsyncQdrantClient(
                host=settings.qdrant_host,
                port=settings.qdrant_port,
                api_key=settings.qdrant_api_key if use_https else None,
                timeout=settings.http_timeout_seconds,
                https=use_https,
                prefer_grpc=False,
                check_compatibility=False,
            )
    return _client


async def close_qdrant() -> None:
    global _client
    if _client is not None:
        await _client.close()
        _client = None


async def ensure_collection() -> None:
    settings = get_settings()
    client = get_qdrant_client()
    existing = await client.get_collections()
    existing_names = [c.name for c in existing.collections]
    if settings.qdrant_collection_name not in existing_names:
        await client.create_collection(
            collection_name=settings.qdrant_collection_name,
            vectors_config=VectorParams(
                size=settings.embedding_dimension,
                distance=Distance.COSINE,
            ),
        )


async def check_qdrant_health() -> bool:
    try:
        client = get_qdrant_client()
        result = await client.get_collections()
        return result is not None
    except Exception:
        return False
