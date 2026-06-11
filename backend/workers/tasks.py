# """
# workers/tasks.py
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Purpose:
#     Celery task definitions.
#     process_bookmark_task = main background job.

# Current state (Slice 3):
#     Task is a STUB — receives bookmark_id, updates status,
#     but doesn't run full pipeline yet.
#     Full pipeline (scrape → summarize → embed) added in Slice 5.

# Task lifecycle:
#     1. API enqueues task with bookmark_id
#     2. Celery worker picks up from Redis queue
#     3. Task updates DB: status = processing
#     4. Task runs pipeline (Slice 5)
#     5. Task updates DB: status = completed / failed

# Retry logic:
#     Uses tenacity for pipeline steps (Slice 5).
#     Celery's own retry handles task-level failures.
#     Max retries = CELERY_TASK_MAX_RETRIES from settings.
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# """

# import asyncio
# import sys
# import uuid
# from pathlib import Path

# # Ensure backend/ is on sys.path.
# # Must happen before any local imports below.
# _backend_dir = str(Path(__file__).resolve().parents[1])
# if _backend_dir not in sys.path:
#     sys.path.insert(0, _backend_dir)

# from workers.celery_app import celery_app
# from observability.logger import get_logger
# from stores.postgres.client import get_session_factory
# from services.bookmark_service import (
#     update_bookmark_status,
#     update_bookmark_after_pipeline,
# )

# logger = get_logger(__name__)


# @celery_app.task(
#     name="workers.tasks.process_bookmark",
#     bind=True,                      # self = task instance (needed for retry)
#     max_retries=3,
#     default_retry_delay=60,         # seconds between retries
#     acks_late=True,
# )
# def process_bookmark_task(self, bookmark_id: str) -> dict:
#     """
#     Main background task: process a bookmark through the AI pipeline.

#     Args:
#         bookmark_id: UUID string of the bookmark to process

#     Returns:
#         dict with status and bookmark_id

#     Current: STUB — marks processing then completed.
#     Slice 5: Replace stub body with full pipeline call.
#     """
#     logger.info("task.process_bookmark.started", bookmark_id=bookmark_id)

#     try:
#         # Run async DB operations inside sync Celery task
#         # asyncio.run() creates a new event loop for each task
#         result = asyncio.run(_process_bookmark_async(bookmark_id))
#         logger.info("task.process_bookmark.completed", bookmark_id=bookmark_id)
#         return result

#     except Exception as exc:
#         logger.error(
#             "task.process_bookmark.failed",
#             bookmark_id=bookmark_id,
#             error=str(exc),
#             retry_count=self.request.retries,
#         )
#         # Retry with exponential backoff
#         raise self.retry(
#             exc=exc,
#             countdown=60 * (2 ** self.request.retries),  # 60s, 120s, 240s
#         )


# async def _process_bookmark_async(bookmark_id: str) -> dict:
#     """
#     Async implementation of bookmark processing.

#     Slice 3: STUB — updates status only.
#     Slice 5: Full pipeline (scrape → clean → summarize → tag → embed).

#     Note: engine singleton is reset before each call because asyncio.run()
#     creates a new event loop — the previous engine's connections are bound
#     to the old loop and cannot be reused.
#     """
#     # Reset engine so new connections are created in this event loop
#     import stores.postgres.client as pg
#     pg._engine = None
#     pg._session_factory = None

#     bm_uuid = uuid.UUID(bookmark_id)
#     factory = get_session_factory()

#     # Step 1: Mark as processing
#     async with factory() as session:
#         await update_bookmark_status(session, bm_uuid, "processing")
#         await session.commit()

#     # ── PIPELINE STUB ─────────────────────────────────────────────────────────
#     # TODO (Slice 5): Replace this block with real pipeline:
#     #
#     #   from pipeline.pipeline import BookmarkPipeline
#     #   pipeline = BookmarkPipeline()
#     #   result = await pipeline.run(bookmark_id=bm_uuid, url=bookmark.url)
#     #
#     # For now: simulate processing with placeholder values
#     logger.info("task.pipeline.stub_running", bookmark_id=bookmark_id)

#     async with factory() as session:
#         await update_bookmark_after_pipeline(
#             session=session,
#             bookmark_id=bm_uuid,
#             title="[Stub] Title will be scraped in Slice 5",
#             summary="[Stub] Summary will be AI-generated in Slice 5",
#             tags=["stub", "pending-pipeline"],
#         )
#         await session.commit()
#     # ── END STUB ──────────────────────────────────────────────────────────────

#     return {"status": "completed", "bookmark_id": bookmark_id}


# workers/tasks.py
"""
workers/tasks.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Purpose:
    Celery task definitions.
    process_bookmark_task = main background job.

Current state (Slice 5):
    Full pipeline wired — scrape → clean → summarize → tag → embed.
    Results written to Postgres + Qdrant on success.
    DB marked failed with error message on pipeline failure.

Task lifecycle:
    1. API enqueues task with bookmark_id
    2. Celery worker picks up from Redis queue
    3. Task updates DB: status = processing
    4. Fetches URL from DB
    5. Runs BookmarkPipeline
    6. On success: writes title/summary/tags/vector to DB → completed
    7. On failure: writes error_message to DB → failed

Retry logic:
    tenacity handles per-step retries inside pipeline.
    Celery retry handles task-level crashes.
    Max retries = 3, exponential backoff 60s/120s/240s.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

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

    # Step 1: Mark as processing
    async with factory() as session:
        await update_bookmark_status(session, bm_uuid, "processing")
        await session.commit()

    # Step 2: Fetch URL from DB
    from sqlalchemy import select
    from stores.postgres.models import Bookmark

    async with factory() as session:
        result = await session.execute(
            select(Bookmark).where(Bookmark.id == bm_uuid)
        )
        bookmark = result.scalar_one_or_none()

    if not bookmark:
        raise ValueError(f"Bookmark {bookmark_id} not found in DB")

    # Step 3: Run full AI pipeline
    from pipeline.pipeline import BookmarkPipeline
    pipeline = BookmarkPipeline()
    state = await pipeline.run(bookmark_id=bm_uuid, url=bookmark.url, user_id=bookmark.user_id)

    # Step 4: Write results or mark failed
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

    # Step 5: Persist AI results
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
