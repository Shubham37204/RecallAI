from workers.celery_app import celery_app
from stores.postgres.client import get_session_factory
from services.bookmark_service import (
    update_bookmark_after_pipeline,
    update_bookmark_status,
)
from observability.logger import get_logger
import asyncio
import sys
import uuid
from pathlib import Path

_backend_dir = str(Path(__file__).resolve().parents[1])
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)


logger = get_logger(__name__)


@celery_app.task(
    name="workers.tasks.process_bookmark",
    bind=True,
    max_retries=3,
    default_retry_delay=60,
    acks_late=True,
)
def process_bookmark_task(self, bookmark_id: str) -> dict:
    """
    Main background task: process a bookmark through the AI pipeline.

    Args:
        bookmark_id: UUID string of the bookmark to process

    Returns:
        dict with status and bookmark_id
    """
    logger.info("task.process_bookmark.started", bookmark_id=bookmark_id)

    try:
        result = asyncio.run(_process_bookmark_async(bookmark_id))
        logger.info("task.process_bookmark.completed", bookmark_id=bookmark_id)
        return result

    except Exception as exc:
        logger.error(
            "task.process_bookmark.failed",
            bookmark_id=bookmark_id,
            error=str(exc),
            retry_count=self.request.retries,
        )
        raise self.retry(
            exc=exc,
            countdown=60 * (2 ** self.request.retries),
        )


async def _process_bookmark_async(bookmark_id: str) -> dict:
    """
    Async implementation of bookmark processing.
    Full pipeline: scrape → clean → summarize → tag → embed.

    Note: engine singleton reset before each call — asyncio.run()
    creates new event loop, old engine connections are dead.
    """
    import stores.postgres.client as pg
    pg._engine = None
    pg._session_factory = None

    bm_uuid = uuid.UUID(bookmark_id)
    factory = get_session_factory()

    async with factory() as session:
        await update_bookmark_status(session, bm_uuid, "processing")
        await session.commit()

    from sqlalchemy import select
    from stores.postgres.models import Bookmark

    async with factory() as session:
        result = await session.execute(
            select(Bookmark).where(Bookmark.id == bm_uuid)
        )
        bookmark = result.scalar_one_or_none()

    if not bookmark:
        raise ValueError(f"Bookmark {bookmark_id} not found in DB")

    from pipeline.pipeline import BookmarkPipeline
    pipeline = BookmarkPipeline()
    state = await pipeline.run(bookmark_id=bm_uuid, url=bookmark.url, user_id=bookmark.user_id)

    if state.has_error:
        async with factory() as session:
            await update_bookmark_status(
                session,
                bm_uuid,
                "failed",
                error_message=f"[{state.failed_step}] {state.error}",
            )
            await session.commit()

        logger.error(
            "task.pipeline.failed",
            bookmark_id=bookmark_id,
            failed_step=state.failed_step,
            error=state.error,
        )
        return {"status": "failed", "bookmark_id": bookmark_id, "error": state.error}

    async with factory() as session:
        await update_bookmark_after_pipeline(
            session=session,
            bookmark_id=bm_uuid,
            title=state.title,
            summary=state.summary,
            tags=state.tags,
            qdrant_point_id=state.qdrant_point_id,
            content_length=state.content_length,
        )
        await session.commit()

    logger.info("task.pipeline.succeeded", bookmark_id=bookmark_id)
    return {"status": "completed", "bookmark_id": bookmark_id}
