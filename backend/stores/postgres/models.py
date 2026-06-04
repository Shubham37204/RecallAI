import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, String, Text, func
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column

from stores.postgres.client import Base


class Bookmark(Base):
    """
    Source of truth for all bookmark metadata.
    One row per bookmark per user.

    Lifecycle:
        created  → user submits URL
        pending  → celery task queued
        processing → pipeline running
        completed → summary/tags/embeddings stored
        failed   → pipeline error, check error_message
    """

    __tablename__ = "bookmarks"

    # ── Identity ──────────────────────────────────────────────────────────────
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,           # most queries filter by user_id
    )

    # ── Input ─────────────────────────────────────────────────────────────────
    url: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    title: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,        # populated after scrape
    )

    # ── Pipeline Status ───────────────────────────────────────────────────────
    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="pending",
        index=True,
    )
    error_message: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,        # populated only on failed status
    )

    # ── AI Output ─────────────────────────────────────────────────────────────
    summary: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,        # populated after summarizer step
    )
    tags: Mapped[list[str] | None] = mapped_column(
        ARRAY(String),
        nullable=True,        # populated after tagger step
    )

    # ── Vector Reference ──────────────────────────────────────────────────────
    # We store the Qdrant point ID so we can delete/update vectors later.
    # Qdrant and Postgres stay in sync via this field.
    qdrant_point_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
    )

    # ── Scraped Content ───────────────────────────────────────────────────────
    # Raw extracted text stored temporarily for pipeline use.
    # Not returned in API responses — internal only.
    raw_content: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    content_length: Mapped[int | None] = mapped_column(
        nullable=True,
    )

    # ── Timestamps ────────────────────────────────────────────────────────────
    # server_default → Postgres sets this, not Python. Survives timezone issues.
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,        # set when status → completed or failed
    )

    def __repr__(self) -> str:
        return f"<Bookmark id={self.id} status={self.status} url={self.url[:50]}>"