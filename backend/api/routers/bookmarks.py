"""
api/routers/bookmarks.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HTTP routes for bookmark CRUD.
No business logic here — all delegated to bookmark_service.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Request
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
    delete_bookmark,
    get_bookmark,
    get_user_bookmarks,
)
from workers.tasks import process_bookmark_task

router = APIRouter(prefix="/bookmarks", tags=["bookmarks"])
logger = get_logger(__name__)


def _extract_user_claims(request: Request) -> tuple[str | None, str | None]:
    """
    Extract email and name from Clerk JWT claims stored on request state.
    Returns (email, name) — both may be None if claims absent.

    Clerk puts email in `email` claim, name in `name` or `full_name`.
    Falls back gracefully — user row works fine with nulls.
    """
    claims: dict = getattr(request.state, "clerk_claims", {})
    email = claims.get("email") or claims.get("email_address")
    name = claims.get("name") or claims.get("full_name")
    return email, name


@router.post("", response_model=BookmarkCreateResponse, status_code=202)
async def create_bookmark_endpoint(
    body: BookmarkCreate,
    request: Request,
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
) -> BookmarkCreateResponse:
    """
    Create bookmark and queue for AI processing.
    Upserts user row on every call — no separate signup flow needed.
    Returns 202 — processing is async. Poll status endpoint for progress.
    """
    url_str = str(body.url)
    email, name = _extract_user_claims(request)

    bookmark = await create_bookmark(
        session=session,
        user_id=user_id,
        url=url_str,
        email=email,
        name=name,
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
    """Poll pipeline status. Returns: pending | processing | completed | failed"""
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


@router.delete("/{bookmark_id}", status_code=204)
async def delete_bookmark_endpoint(
    bookmark_id: uuid.UUID,
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
) -> None:
    """Delete bookmark and its Qdrant vector. User-scoped — cannot delete others'."""
    deleted = await delete_bookmark(session, bookmark_id, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    await session.commit()
    logger.info("bookmark.deleted", bookmark_id=str(bookmark_id), user_id=user_id)
    