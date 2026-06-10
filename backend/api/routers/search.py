# api/routers/search.py
"""
api/routers/search.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Purpose:
    Search router — GET /search?q= endpoint.

Flow:
    1. Auth (get_current_user_id via rate limiter dependency)
    2. Rate limit check (check_search_rate_limit)
    3. Validate query (min 2 chars, max 500 chars)
    4. Call search_service.search_bookmarks()
    5. Return ranked SearchResponse list

Query validation:
    - Min 2 chars — single char searches are noise
    - Max 500 chars — prevent abuse / oversized embeddings
    - Strip whitespace before validation

Response:
    - List of SearchResultResponse (score included for client-side use)
    - Empty list on no results (not 404 — query was valid, just no matches)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from api.dependencies import get_session
from api.middleware.rate_limit import check_search_rate_limit
from config.settings import get_settings
from observability.logger import get_logger
from services.search_service import search_bookmarks

logger = get_logger("api.routers.search")

router = APIRouter(prefix="/search", tags=["search"])


# ── Response schemas ──────────────────────────────────────────────────────────

class SearchResultResponse(BaseModel):
    bookmark_id: uuid.UUID
    url: str
    title: str | None
    summary: str | None
    tags: list[str]
    score: float


class SearchResponse(BaseModel):
    query: str
    results: list[SearchResultResponse]
    total: int


# ── Route ─────────────────────────────────────────────────────────────────────

@router.get(
    "",
    response_model=SearchResponse,
    summary="Semantic search over your bookmarks",
    responses={
        200: {"description": "Search results ranked by similarity"},
        400: {"description": "Query too short or too long"},
        429: {"description": "Rate limit exceeded"},
        401: {"description": "Unauthorized"},
    },
)
async def search(
    q: str = Query(..., description="Search query"),
    limit: int = Query(default=10, ge=1, le=50, description="Max results (1-50)"),
    user_id: str = Depends(check_search_rate_limit),   # auth + rate limit in one
    session: AsyncSession = Depends(get_session),
) -> SearchResponse:
    """
    Semantic search over the authenticated user's bookmarks.

    Uses vector similarity (sentence-transformers + Qdrant) to find
    bookmarks relevant to the query, regardless of exact keyword match.
    """
    settings = get_settings()

    # Validate query
    q = q.strip()
    if len(q) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "query_too_short", "message": "Query must be at least 2 characters"},
        )
    if len(q) > 500:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "query_too_long", "message": "Query must be under 500 characters"},
        )

    logger.info(
        "search.request",
        user_id=user_id,
        query=q[:50],  # truncate for log safety
        limit=limit,
    )

    try:
        results = await search_bookmarks(
            session=session,
            user_id=user_id,
            query=q,
            limit=limit,
        )
    except Exception as e:
        logger.error(
            "search.request_failed",
            user_id=user_id,
            error=str(e),
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"error": "search_failed", "message": "Search service temporarily unavailable"},
        )

    return SearchResponse(
        query=q,
        results=[
            SearchResultResponse(
                bookmark_id=r.bookmark_id,
                url=r.url,
                title=r.title,
                summary=r.summary,
                tags=r.tags,
                score=round(r.score, 4),
            )
            for r in results
        ],
        total=len(results),
    )
