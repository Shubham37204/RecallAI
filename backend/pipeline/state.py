# pipeline/state.py
"""
pipeline/state.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Purpose:
    PipelineState — single mutable object passed through
    every pipeline step. Each step reads what it needs
    and writes its output back here.

Why a shared state object:
    - Steps stay decoupled (scraper doesn't import summarizer)
    - Easy to inspect mid-pipeline for debugging
    - Single place to see all pipeline data

Lifecycle:
    API creates state with bookmark_id + url
    scraper     → fills raw_text, title
    cleaner     → fills clean_text
    summarizer  → fills summary
    tagger      → fills tags
    embedder    → fills vector, qdrant_point_id
    pipeline    → reads final state, writes to DB
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class PipelineState:
    """
    Shared state object for the bookmark AI pipeline.
    Created once per bookmark, mutated by each step in sequence.

    # Required at creation:
    #     bookmark_id  — UUID of the Postgres bookmark row
    #     url          — URL to scrape
    #     user_id      — Clerk user ID (scopes vector in Qdrant)

    Populated by steps:
        scraper    → raw_text, title, content_length
        cleaner    → clean_text
        summarizer → summary
        tagger     → tags
        embedder   → vector, qdrant_point_id
    """

    # ── Required (set at creation) ────────────────────────────────────────────
    bookmark_id: uuid.UUID
    url: str
    user_id: str = "" 

    # ── Scraper output ────────────────────────────────────────────────────────
    raw_text: Optional[str] = None
    title: Optional[str] = None
    content_length: int = 0

    # ── Cleaner output ────────────────────────────────────────────────────────
    clean_text: Optional[str] = None

    # ── Summarizer output ─────────────────────────────────────────────────────
    summary: Optional[str] = None

    # ── Tagger output ─────────────────────────────────────────────────────────
    tags: list[str] = field(default_factory=list)

    # ── Embedder output ───────────────────────────────────────────────────────
    vector: Optional[list[float]] = None
    qdrant_point_id: Optional[uuid.UUID] = None

    # ── Error tracking ────────────────────────────────────────────────────────
    error: Optional[str] = None
    failed_step: Optional[str] = None

    @property
    def has_error(self) -> bool:
        return self.error is not None

    @property
    def is_complete(self) -> bool:
        """True when all pipeline outputs are populated."""
        return all([
            self.clean_text,
            self.summary,
            self.tags,
            self.vector is not None,
            self.qdrant_point_id is not None,
        ])

    def mark_failed(self, step: str, error: str) -> None:
        """Called by any step on failure. Stops pipeline propagation."""
        self.error = error
        self.failed_step = step

    def __repr__(self) -> str:
        return (
            f"<PipelineState bookmark_id={self.bookmark_id} "
            f"url={self.url[:40]} "
            f"complete={self.is_complete} "
            f"error={self.error!r}>"
        )
    

