import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, HttpUrl, field_validator


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

    model_config = {"from_attributes": True} 


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
    