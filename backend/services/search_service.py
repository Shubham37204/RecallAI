from __future__ import annotations

import asyncio
import uuid
from dataclasses import dataclass
from functools import partial

from qdrant_client.models import FieldCondition, Filter, MatchValue
from sentence_transformers import SentenceTransformer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config.settings import get_settings
from observability.logger import get_logger
from stores.postgres.models import Bookmark
from stores.qdrant.client import get_qdrant_client

logger = get_logger("services.search")

_model: SentenceTransformer | None = None


def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        settings = get_settings()
        _model = SentenceTransformer(settings.embedding_model)
    return _model


@dataclass
class SearchResult:
    """Single search result — Qdrant score + Postgres bookmark data."""
    bookmark_id: uuid.UUID
    url: str
    title: str | None
    summary: str | None
    tags: list[str]
    score: float


async def search_bookmarks(
    session: AsyncSession,
    user_id: str,
    query: str,
    limit: int = 10,
) -> list[SearchResult]:
    """
    Semantic search over user's bookmarks.

    Args:
        session:  async DB session
        user_id:  Clerk user ID — scopes Qdrant retrieval to this user only
        query:    natural language search query
        limit:    max results to return (capped at settings.search_max_results)

    Returns:
        list of SearchResult ordered by similarity score descending
    """
    settings = get_settings()
    limit = min(limit, settings.search_max_results)

    logger.info(
        "search.started",
        user_id=user_id,
        query_length=len(query),
        limit=limit,
    )

    try:
        model = _get_model()
        loop = asyncio.get_running_loop()
        encode_fn = partial(model.encode, query, normalize_embeddings=True)
        query_vector: list[float] = (await loop.run_in_executor(None, encode_fn)).tolist()
    except Exception as e:
        logger.error("search.embed_failed", user_id=user_id, error=str(e))
        raise
    try:
        qdrant = get_qdrant_client()
        results = await qdrant.query_points(
            collection_name=settings.qdrant_collection_name,
            query=query_vector,
            limit=limit,
            score_threshold=settings.similarity_threshold,
            query_filter=Filter(
                must=[
                    FieldCondition(
                        key="user_id",
                        match=MatchValue(value=user_id),
                    )
                ]
            ),
            with_payload=True,
        )
        hits = results.points
    except Exception as e:
        logger.error("search.qdrant_failed", user_id=user_id, error=str(e))
        raise

    if not hits:
        logger.info("search.no_hits", user_id=user_id)
        return []

    qdrant_scores: dict[uuid.UUID, float] = {}
    for hit in hits:
        payload = hit.payload or {}
        raw_id = payload.get("bookmark_id")
        if raw_id:
            try:
                qdrant_scores[uuid.UUID(raw_id)] = hit.score
            except (ValueError, AttributeError):
                continue

    if not qdrant_scores:
        return []

    try:
        stmt = select(Bookmark).where(
            Bookmark.id.in_(qdrant_scores.keys()),
            Bookmark.user_id == user_id,
            Bookmark.status == "completed",
        )
        db_result = await session.execute(stmt)
        bookmarks = db_result.scalars().all()
    except Exception as e:
        logger.error("search.postgres_failed", user_id=user_id, error=str(e))
        raise

    search_results = [
        SearchResult(
            bookmark_id=bm.id,
            url=bm.url,
            title=bm.title,
            summary=bm.summary,
            tags=bm.tags or [],
            score=qdrant_scores.get(bm.id, 0.0),
        )
        for bm in bookmarks
    ]
    search_results.sort(key=lambda r: r.score, reverse=True)

    logger.info(
        "search.completed",
        user_id=user_id,
        hits_from_qdrant=len(hits),
        results_after_postgres=len(search_results),
    )

    return search_results
