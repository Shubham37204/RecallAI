"""
workers/tasks.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Purpose:
    Celery task definitions.
    process_bookmark_task = main background job.

Current state (Slice 3):
    Task is a STUB — receives bookmark_id, updates status,
    but doesn't run full pipeline yet.
    Full pipeline (scrape → summarize → embed) added in Slice 5.

Task lifecycle:
    1. API enqueues task with bookmark_id
    2. Celery worker picks up from Redis queue
    3. Task updates DB: status = processing
    4. Task runs pipeline (Slice 5)
    5. Task updates DB: status = completed / failed

Retry logic:
    Uses tenacity for pipeline steps (Slice 5).
    Celery's own retry handles task-level failures.
    Max retries = CELERY_TASK_MAX_RETRIES from settings.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

import asyncio
import sys
import uuid
from pathlib import Path

# Ensure backend/ is on sys.path.
# Must happen before any local imports below.
_backend_dir = str(Path(__file__).resolve().parents[1])
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from workers.celery_app import celery_app
from observability.logger import get_logger
from stores.postgres.client import get_session_factory
from services.bookmark_service import (
    update_bookmark_status,
    update_bookmark_after_pipeline,
)

logger = get_logger(__name__)


@celery_app.task(
    name="workers.tasks.process_bookmark",
    bind=True,                      # self = task instance (needed for retry)
    max_retries=3,
    default_retry_delay=60,         # seconds between retries
    acks_late=True,
)
def process_bookmark_task(self, bookmark_id: str) -> dict:
    """
    Main background task: process a bookmark through the AI pipeline.

    Args:
        bookmark_id: UUID string of the bookmark to process

    Returns:
        dict with status and bookmark_id

    Current: STUB — marks processing then completed.
    Slice 5: Replace stub body with full pipeline call.
    """
    logger.info("task.process_bookmark.started", bookmark_id=bookmark_id)

    try:
        # Run async DB operations inside sync Celery task
        # asyncio.run() creates a new event loop for each task
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
        # Retry with exponential backoff
        raise self.retry(
            exc=exc,
            countdown=60 * (2 ** self.request.retries),  # 60s, 120s, 240s
        )


async def _process_bookmark_async(bookmark_id: str) -> dict:
    """
    Async implementation of bookmark processing.

    Slice 3: STUB — updates status only.
    Slice 5: Full pipeline (scrape → clean → summarize → tag → embed).

    Note: engine singleton is reset before each call because asyncio.run()
    creates a new event loop — the previous engine's connections are bound
    to the old loop and cannot be reused.
    """
    # Reset engine so new connections are created in this event loop
    import stores.postgres.client as pg
    pg._engine = None
    pg._session_factory = None

    bm_uuid = uuid.UUID(bookmark_id)
    factory = get_session_factory()

    # Step 1: Mark as processing
    async with factory() as session:
        await update_bookmark_status(session, bm_uuid, "processing")
        await session.commit()

    # ── PIPELINE STUB ─────────────────────────────────────────────────────────
    # TODO (Slice 5): Replace this block with real pipeline:
    #
    #   from pipeline.pipeline import BookmarkPipeline
    #   pipeline = BookmarkPipeline()
    #   result = await pipeline.run(bookmark_id=bm_uuid, url=bookmark.url)
    #
    # For now: simulate processing with placeholder values
    logger.info("task.pipeline.stub_running", bookmark_id=bookmark_id)

    async with factory() as session:
        await update_bookmark_after_pipeline(
            session=session,
            bookmark_id=bm_uuid,
            title="[Stub] Title will be scraped in Slice 5",
            summary="[Stub] Summary will be AI-generated in Slice 5",
            tags=["stub", "pending-pipeline"],
        )
        await session.commit()
    # ── END STUB ──────────────────────────────────────────────────────────────

    return {"status": "completed", "bookmark_id": bookmark_id}
