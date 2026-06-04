"""
schemas/bookmark.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Purpose:
    Pydantic models for API request validation and response
    serialization. These are NOT ORM models.

Why separate from ORM models:
    - ORM models (stores/postgres/models.py) = DB shape
    - Schemas (here) = API contract shape
    - They differ: API never exposes raw_content, internal
      fields, or DB implementation details
    - Decoupling means DB can change without breaking API

Request flow:
    HTTP JSON body → Pydantic validates → Python object
    Python object  → Pydantic serializes → HTTP JSON response

Schemas defined here:
    BookmarkCreate  → POST /bookmarks request body
    BookmarkResponse → what API returns for a bookmark
    BookmarkStatus  → lightweight status-only response
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, HttpUrl, field_validator


# ── Request Schemas ───────────────────────────────────────────────────────────

class BookmarkCreate(BaseModel):
    """
    POST /bookmarks request body.
    User provides only the URL — everything else is generated.

    Validation:
        - url must be a valid HTTP/HTTPS URL
        - url stripped of whitespace
    """
    url: HttpUrl

    @field_validator("url", mode="before")
    @classmethod
    def strip_url(cls, v: str) -> str:
        return str(v).strip()


# ── Response Schemas ──────────────────────────────────────────────────────────

class BookmarkResponse(BaseModel):
    """
    Full bookmark response returned by GET /bookmarks/{id}.
    Never includes: raw_content (too large), internal DB fields.
    """
    id: uuid.UUID
    user_id: str
    url: str
    title: str | None
    status: Literal["pending", "processing", "completed", "failed"]
    summary: str | None
    tags: list[str] | None
    error_message: str | None
    created_at: datetime
    updated_at: datetime
    completed_at: datetime | None

    model_config = {"from_attributes": True}  # allows ORM → schema conversion


class BookmarkCreateResponse(BaseModel):
    """
    Response for POST /bookmarks.
    Returns id + status only — pipeline runs in background.
    Client uses id to poll GET /bookmarks/{id}/status.
    """
    id: uuid.UUID
    status: Literal["pending"] = "pending"
    message: str = "Bookmark queued for processing"

    model_config = {"from_attributes": True}


class BookmarkStatusResponse(BaseModel):
    """
    Lightweight response for GET /bookmarks/{id}/status.
    Client polls this to track pipeline progress.
    """
    id: uuid.UUID
    status: Literal["pending", "processing", "completed", "failed"]
    error_message: str | None = None

    model_config = {"from_attributes": True}
    