"""
api/routers/bookmarks.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Purpose:
    HTTP routes for bookmark operations.

Endpoints:
    POST /bookmarks             → create bookmark, queue pipeline
    GET  /bookmarks             → list user's bookmarks
    GET  /bookmarks/{id}        → get single bookmark
    GET  /bookmarks/{id}/status → poll pipeline progress

Auth (Slice 4):
    All routes use get_current_user_id dependency.
    Dev: accepts X-User-Id header OR Bearer JWT
    Prod: only Bearer JWT accepted
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from api.dependencies import get_session
from api.middleware.clerk_auth import get_current_user_id
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


@router.post("", response_model=BookmarkCreateResponse, status_code=202)
async def create_bookmark_endpoint(
    body: BookmarkCreate,
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
) -> BookmarkCreateResponse:
    """
    Create a new bookmark and queue it for AI processing.
    Returns 202 — processing happens async in background.
    Poll GET /bookmarks/{id}/status for progress.
    """
    url_str = str(body.url)

    bookmark = await create_bookmark(
        session=session,
        user_id=user_id,
        url=url_str,
    )
    await session.commit()

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
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> list[BookmarkResponse]:
    """List all bookmarks for the authenticated user. Newest first."""
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
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
) -> BookmarkStatusResponse:
    """
    Poll pipeline status.
    Returns: pending | processing | completed | failed
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
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
) -> BookmarkResponse:
    """Get full bookmark details including AI-generated content."""
    bookmark = await get_bookmark(
        session=session,
        bookmark_id=bookmark_id,
        user_id=user_id,
    )
    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")

    return BookmarkResponse.model_validate(bookmark)
