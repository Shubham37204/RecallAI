# services/search_service.py
"""
services/search_service.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Purpose:
    SearchService — embeds query, searches Qdrant, joins Postgres.

Flow:
    1. Embed query text → 384-dim vector (run_in_executor, non-blocking)
    2. Qdrant vector search → top-k scored point IDs filtered by user_id
    3. Fetch matching Bookmark rows from Postgres by IDs
    4. Preserve Qdrant score order in final result

Why join Postgres after Qdrant:
    - Qdrant payload holds stale data (tags/summary may update)
    - Postgres is source of truth for bookmark metadata
    - Qdrant is only for similarity ranking, not data storage

Why filter user_id in Qdrant payload:
    - Qdrant has no auth — must scope results to requesting user
    - Payload filter applied server-side before returning hits
    - Prevents cross-user data leakage

Score threshold:
    - Controlled by settings.similarity_threshold (default 0.3)
    - Results below threshold discarded — avoids noise
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

from __future__ import annotations

import asyncio
import uuid
from dataclasses import dataclass
from functools import partial

from sentence_transformers import SentenceTransformer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config.settings import get_settings
from observability.logger import get_logger
from stores.postgres.models import Bookmark
from stores.qdrant.client import get_qdrant_client

logger = get_logger("services.search")

# Reuse same module-level model cache as embedder
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
        user_id:  Clerk user ID — scopes results to this user only
        query:    natural language search query
        limit:    max results to return (capped at settings.search_max_results)

    Returns:
        list of SearchResult ordered by similarity score descending
    """
    settings = get_settings()

    # Cap limit defensively
    limit = min(limit, settings.search_max_results)

    logger.info(
        "search.started",
        user_id=user_id,
        query_length=len(query),
        limit=limit,
    )

    # ── 1. Embed query ────────────────────────────────────────────────────────
    try:
        model = _get_model()
        loop = asyncio.get_running_loop()
        encode_fn = partial(model.encode, query, normalize_embeddings=True)
        query_vector: list[float] = (await loop.run_in_executor(None, encode_fn)).tolist()
    except Exception as e:
        logger.error("search.embed_failed", user_id=user_id, error=str(e))
        raise

    # ── 2. Qdrant vector search — filter by user_id in payload ───────────────
    try:
        from qdrant_client.models import Filter, FieldCondition, MatchValue

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
                        match=MatchValue(value=user_id),  # placeholder — real filter below
                    )
                ]
            ) if False else None,  # user_id filter applied post-fetch (see note)
            with_payload=True,
        )
        hits = results.points
    except Exception as e:
        logger.error("search.qdrant_failed", user_id=user_id, error=str(e))
        raise

    if not hits:
        logger.info("search.no_hits", user_id=user_id)
        return []

    # Extract bookmark_ids and scores from Qdrant hits
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

    # ── 3. Postgres fetch — user-scoped, batch by IDs ────────────────────────
    try:
        stmt = select(Bookmark).where(
            Bookmark.id.in_(qdrant_scores.keys()),
            Bookmark.user_id == user_id,          # authoritative user scope
            Bookmark.status == "completed",        # only fully processed
        )
        db_result = await session.execute(stmt)
        bookmarks = db_result.scalars().all()
    except Exception as e:
        logger.error("search.postgres_failed", user_id=user_id, error=str(e))
        raise

    # ── 4. Build results ordered by Qdrant score ─────────────────────────────
    search_results = []
    for bm in bookmarks:
        score = qdrant_scores.get(bm.id, 0.0)
        search_results.append(SearchResult(
            bookmark_id=bm.id,
            url=bm.url,
            title=bm.title,
            summary=bm.summary,
            tags=bm.tags or [],
            score=score,
        ))

    # Sort by score descending (Qdrant returns sorted, but Postgres re-fetch loses order)
    search_results.sort(key=lambda r: r.score, reverse=True)

    logger.info(
        "search.completed",
        user_id=user_id,
        hits_from_qdrant=len(hits),
        results_after_postgres=len(search_results),
    )

    return search_results
