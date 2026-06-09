# pipeline/pipeline.py
"""
pipeline/pipeline.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Purpose:
    BookmarkPipeline — orchestrates all steps in sequence.

Flow:
    scraper → cleaner → summarizer → tagger → embedder

On success:
    Returns completed PipelineState with all fields populated.

On any step failure:
    state.has_error = True
    Remaining steps are skipped (each checks _skip_if_failed)
    Pipeline returns state with error info for caller to handle.

Caller (workers/tasks.py):
    pipeline = BookmarkPipeline()
    state = await pipeline.run(bookmark_id=bm_uuid, url=bm.url)
    if state.has_error:
        # mark DB as failed
    else:
        # write results to DB
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

from __future__ import annotations

import uuid

from observability.logger import get_logger
from pipeline.cleaner import CleanerStep
from pipeline.embedder import EmbedderStep
from pipeline.scraper import ScraperStep
from pipeline.state import PipelineState
from pipeline.summarizer import SummarizerStep
from pipeline.tagger import TaggerStep

logger = get_logger("pipeline.orchestrator")


class BookmarkPipeline:
    """
    Orchestrates all pipeline steps for a single bookmark.

    Steps run sequentially. If any step calls state.mark_failed(),
    all subsequent steps are skipped via _skip_if_failed().

    Usage:
        pipeline = BookmarkPipeline()
        state = await pipeline.run(bookmark_id=uuid, url="https://...")
    """

    def __init__(self) -> None:
        self.steps = [
            ScraperStep(),
            CleanerStep(),
            SummarizerStep(),
            TaggerStep(),
            EmbedderStep(),
        ]

    async def run(self, bookmark_id: uuid.UUID, url: str) -> PipelineState:
        """
        Run full pipeline for a bookmark.

        Args:
            bookmark_id: UUID of Postgres bookmark row
            url:         URL to scrape and process

        Returns:
            PipelineState — check state.has_error before writing to DB
        """
        state = PipelineState(bookmark_id=bookmark_id, url=url)

        logger.info(
            "pipeline.started",
            bookmark_id=str(bookmark_id),
            url=url,
        )

        for step in self.steps:
            state = await step.run(state)

            if state.has_error:
                logger.warning(
                    "pipeline.step_failed",
                    bookmark_id=str(bookmark_id),
                    failed_step=state.failed_step,
                    error=state.error,
                )
                break

        if state.has_error:
            logger.error(
                "pipeline.completed_with_error",
                bookmark_id=str(bookmark_id),
                failed_step=state.failed_step,
                error=state.error,
            )
        else:
            logger.info(
                "pipeline.completed_successfully",
                bookmark_id=str(bookmark_id),
                has_summary=state.summary is not None,
                tag_count=len(state.tags),
                has_vector=state.vector is not None,
            )

        return state