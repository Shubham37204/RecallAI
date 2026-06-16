"""
services/bookmark_service.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
All DB operations for bookmarks and users.
Routes call this — never touch DB directly from routers.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from observability.logger import get_logger
from stores.postgres.models import Bookmark, User

logger = get_logger(__name__)


# ── User ──────────────────────────────────────────────────────────────────────

async def upsert_user(
    session: AsyncSession,
    user_id: str,
    email: str | None = None,
    name: str | None = None,
) -> None:
    """
    Insert user if not exists. No-op if already present.
    Called before every bookmark creation — no webhooks needed.

    Uses INSERT ... ON CONFLICT DO NOTHING so it's safe to call
    on every request without extra SELECT round-trip.
    """
    stmt = (
        pg_insert(User)
        .values(id=user_id, email=email, name=name)
        .on_conflict_do_nothing(index_elements=["id"])
    )
    await session.execute(stmt)
    logger.debug("user.upserted", user_id=user_id)


# ── Bookmarks ─────────────────────────────────────────────────────────────────

async def create_bookmark(
    session: AsyncSession,
    user_id: str,
    url: str,
    email: str | None = None,
    name: str | None = None,
) -> Bookmark:
    """
    Upsert user then insert bookmark with status=pending.

    email/name are best-effort from JWT claims — may be None.
    User row is created here on first save; no separate signup flow needed.
    """
    # Ensure user exists before FK insert
    await upsert_user(session, user_id, email=email, name=name)

    bookmark = Bookmark(
        id=uuid.uuid4(),
        user_id=user_id,
        url=url,
        status="pending",
    )
    session.add(bookmark)
    await session.flush()

    logger.info(
        "bookmark.created",
        bookmark_id=str(bookmark.id),
        user_id=user_id,
    )
    return bookmark


async def get_bookmark(
    session: AsyncSession,
    bookmark_id: uuid.UUID,
    user_id: str,
) -> Bookmark | None:
    """
    Fetch single bookmark by id, scoped to user_id.
    Returns None if not found or wrong user — never leaks cross-user data.
    """
    result = await session.execute(
        select(Bookmark).where(
            Bookmark.id == bookmark_id,
            Bookmark.user_id == user_id,
        )
    )
    return result.scalar_one_or_none()


async def get_user_bookmarks(
    session: AsyncSession,
    user_id: str,
    limit: int = 20,
    offset: int = 0,
) -> list[Bookmark]:
    """List all bookmarks for a user, newest first. Paginated."""
    result = await session.execute(
        select(Bookmark)
        .where(Bookmark.user_id == user_id)
        .order_by(Bookmark.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return list(result.scalars().all())


async def update_bookmark_status(
    session: AsyncSession,
    bookmark_id: uuid.UUID,
    status: str,
    error_message: str | None = None,
) -> Bookmark | None:
    """
    Update pipeline status. Called by Celery worker at each stage.

    Status flow:
        pending → processing → completed
        pending → processing → failed
    """
    result = await session.execute(
        select(Bookmark).where(Bookmark.id == bookmark_id)
    )
    bookmark = result.scalar_one_or_none()
    if not bookmark:
        logger.warning("bookmark.not_found", bookmark_id=str(bookmark_id))
        return None

    bookmark.status = status
    if error_message:
        bookmark.error_message = error_message
    if status in ("completed", "failed"):
        bookmark.completed_at = datetime.now(timezone.utc)

    await session.flush()
    logger.info(
        "bookmark.status_updated",
        bookmark_id=str(bookmark_id),
        status=status,
    )
    return bookmark


async def update_bookmark_after_pipeline(
    session: AsyncSession,
    bookmark_id: uuid.UUID,
    title: str | None = None,
    summary: str | None = None,
    tags: list[str] | None = None,
    qdrant_point_id: uuid.UUID | None = None,
    content_length: int | None = None,
) -> Bookmark | None:
    """
    Write AI pipeline results to Postgres. Sets status=completed.
    Called by Celery worker after pipeline completes successfully.
    """
    result = await session.execute(
        select(Bookmark).where(Bookmark.id == bookmark_id)
    )
    bookmark = result.scalar_one_or_none()
    if not bookmark:
        return None

    if title is not None:
        bookmark.title = title
    if summary is not None:
        bookmark.summary = summary
    if tags is not None:
        bookmark.tags = tags
    if qdrant_point_id is not None:
        bookmark.qdrant_point_id = qdrant_point_id
    if content_length is not None:
        bookmark.content_length = content_length

    bookmark.status = "completed"
    bookmark.completed_at = datetime.now(timezone.utc)

    await session.flush()
    logger.info(
        "bookmark.pipeline_complete",
        bookmark_id=str(bookmark_id),
        has_summary=summary is not None,
        tag_count=len(tags) if tags else 0,
    )
    return bookmark


async def delete_bookmark(
    session: AsyncSession,
    bookmark_id: uuid.UUID,
    user_id: str,
) -> bool:
    """
    Delete bookmark + Qdrant vector atomically.
    Returns False if not found or wrong user.
    """
    bookmark = await get_bookmark(session, bookmark_id, user_id)
    if not bookmark:
        return False

    if bookmark.qdrant_point_id:
        from stores.qdrant.client import get_qdrant_client
        client = get_qdrant_client()
        await client.delete(
            collection_name="bookmarks",
            points_selector=[str(bookmark.qdrant_point_id)],
        )

    await session.delete(bookmark)
    logger.info(
        "bookmark.deleted",
        bookmark_id=str(bookmark_id),
        user_id=user_id,
    )
    return True
