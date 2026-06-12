# api/routers/search.py
"""
api/routers/search.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Purpose:
    Search router — POST /search endpoint.

Flow:
    1. Auth + rate limit (check_search_rate_limit dependency)
    2. Pydantic validates body (min 2 chars, max 500 chars enforced by schema)
    3. Call search_service.search_bookmarks()
    4. Return ranked SearchResponse

Why POST not GET:
    - Future filters (tags, date_from, date_to) fit naturally in body
    - GET query params become unwieldy with multiple filters
    - SearchRequest schema is single source of truth for validation

Schemas imported from schemas/search.py — single source of truth.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from api.dependencies import get_session
from api.middleware.rate_limit import check_search_rate_limit
from observability.logger import get_logger
from schemas.search import SearchRequest, SearchResponse, SearchResult
from services.search_service import search_bookmarks

logger = get_logger("api.routers.search")

router = APIRouter(prefix="/search", tags=["search"])


@router.post(
    "",
    response_model=SearchResponse,
    summary="Semantic search over your bookmarks",
    responses={
        200: {"description": "Search results ranked by similarity"},
        422: {"description": "Query too short, too long, or invalid body"},
        429: {"description": "Rate limit exceeded"},
        401: {"description": "Unauthorized"},
    },
)
async def search(
    body: SearchRequest,
    user_id: str = Depends(check_search_rate_limit),
    session: AsyncSession = Depends(get_session),
) -> SearchResponse:
    """
    Semantic search over the authenticated user's bookmarks.

    POST /search with JSON body:
        {"q": "machine learning papers", "limit": 10}

    Uses vector similarity (sentence-transformers + Qdrant) to find
    bookmarks relevant to the query, regardless of exact keyword match.
    Pydantic enforces min_length=2, max_length=500 on q.
    """
    q = body.q

    logger.info("search.request", user_id=user_id, query=q[:50], limit=body.limit)

    try:
        results = await search_bookmarks(
            session=session,
            user_id=user_id,
            query=q,
            limit=body.limit,
        )
    except Exception as e:
        logger.error("search.request_failed", user_id=user_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "error": "search_failed",
                "message": "Search service temporarily unavailable",
            },
        )

    return SearchResponse(
        query=q,
        total=len(results),
        results=[
            SearchResult(
                bookmark_id=r.bookmark_id,
                url=r.url,
                title=r.title,
                summary=r.summary,
                tags=r.tags,
                score=round(r.score, 4),
            )
            for r in results
        ],
    )