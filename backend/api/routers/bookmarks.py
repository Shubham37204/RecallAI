"""
api/routers/bookmarks.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Purpose:
    HTTP routes for bookmark operations.
    Handles request/response — delegates to service layer.

Endpoints:
    POST /bookmarks          → create bookmark, queue pipeline
    GET  /bookmarks          → list user's bookmarks
    GET  /bookmarks/{id}     → get single bookmark
    GET  /bookmarks/{id}/status → poll pipeline progress

Auth:
    All routes require valid Clerk JWT (Slice 4 adds middleware).
    For now: accepts X-User-Id header as placeholder.
    Replace with Clerk middleware in next slice.

Request flow for POST /bookmarks:
    1. Validate URL (Pydantic)
    2. Extract user_id from auth (placeholder for now)
    3. Save bookmark to Postgres (status=pending)
    4. Enqueue Celery task with bookmark.id
    5. Return {id, status: "pending"} immediately
    6. Client polls GET /bookmarks/{id}/status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

import uuid

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from api.dependencies import get_session
from observability.logger import get_logger
from schemas.bookmark import (
    BookmarkCreate,
    BookmarkCreateResponse,
    BookmarkResponse,
    BookmarkStatusResponse,
)
from services.bookmark_service import (
    create_bookmark,
    get_bookmark,
    get_user_bookmarks,
)
from workers.tasks import process_bookmark_task

router = APIRouter(prefix="/bookmarks", tags=["bookmarks"])
logger = get_logger(__name__)


def _get_user_id(x_user_id: str | None = Header(default=None)) -> str:
    """
    Temporary auth placeholder.
    Reads user_id from X-User-Id header.

    Slice 4 replaces this with real Clerk JWT middleware that:
        1. Reads Authorization: Bearer <token>
        2. Verifies JWT signature against Clerk JWKS
        3. Extracts user_id from token claims
    """
    if not x_user_id:
        raise HTTPException(
            status_code=401,
            detail="X-User-Id header required (temporary auth placeholder)",
        )
    return x_user_id


@router.post("", response_model=BookmarkCreateResponse, status_code=202)
async def create_bookmark_endpoint(
    body: BookmarkCreate,
    user_id: str = Depends(_get_user_id),
    session: AsyncSession = Depends(get_session),
) -> BookmarkCreateResponse:
    """
    Create a new bookmark and queue it for AI processing.

    Returns 202 Accepted (not 201 Created) because:
        Processing happens asynchronously in background.
        202 = "request accepted, processing not complete yet"

    Client should poll GET /bookmarks/{id}/status until
    status = "completed" or "failed".
    """
    url_str = str(body.url)

    # Save to DB with status=pending
    bookmark = await create_bookmark(
        session=session,
        user_id=user_id,
        url=url_str,
    )
    await session.commit()

    # Enqueue background task
    # .delay() = async dispatch to Celery worker via Redis
    process_bookmark_task.delay(str(bookmark.id))

    logger.info(
        "bookmark.queued",
        bookmark_id=str(bookmark.id),
        user_id=user_id,
        url=url_str,
    )

    return BookmarkCreateResponse(
        id=bookmark.id,
        status="pending",
        message="Bookmark queued for processing",
    )


@router.get("", response_model=list[BookmarkResponse])
async def list_bookmarks(
    user_id: str = Depends(_get_user_id),
    session: AsyncSession = Depends(get_session),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> list[BookmarkResponse]:
    """
    List all bookmarks for the authenticated user.
    Ordered by newest first. Paginated via limit/offset.
    """
    bookmarks = await get_user_bookmarks(
        session=session,
        user_id=user_id,
        limit=limit,
        offset=offset,
    )
    return [BookmarkResponse.model_validate(b) for b in bookmarks]


@router.get("/{bookmark_id}/status", response_model=BookmarkStatusResponse)
async def get_bookmark_status(
    bookmark_id: uuid.UUID,
    user_id: str = Depends(_get_user_id),
    session: AsyncSession = Depends(get_session),
) -> BookmarkStatusResponse:
    """
    Poll pipeline status for a specific bookmark.
    Client calls this repeatedly until status != "pending"/"processing".

    Statuses:
        pending    → queued, not started
        processing → pipeline running
        completed  → done, summary/tags/embeddings ready
        failed     → error, check error_message field
    """
    bookmark = await get_bookmark(
        session=session,
        bookmark_id=bookmark_id,
        user_id=user_id,
    )
    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")

    return BookmarkStatusResponse.model_validate(bookmark)


@router.get("/{bookmark_id}", response_model=BookmarkResponse)
async def get_bookmark_endpoint(
    bookmark_id: uuid.UUID,
    user_id: str = Depends(_get_user_id),
    session: AsyncSession = Depends(get_session),
) -> BookmarkResponse:
    """
    Get full bookmark details including AI-generated content.
    Returns 404 if bookmark not found or belongs to different user.
    """
    bookmark = await get_bookmark(
        session=session,
        bookmark_id=bookmark_id,
        user_id=user_id,
    )
    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")

    return BookmarkResponse.model_validate(bookmark)
