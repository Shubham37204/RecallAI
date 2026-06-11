# schemas/search.py
"""
schemas/search.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Purpose:
    Pydantic schemas for semantic search request/response.
    Used by GET /search endpoint (Slice 6).

Changes from original:
    - SearchResult.id renamed → bookmark_id (clarity)
    - SearchResult.tags: list[str] | None → list[str]
      (embedder always writes [] not None — non-optional is correct)
    - SearchRequest kept for documentation / future use
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

import uuid

from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    """
    GET /search query parameters.
    Kept for documentation — route uses FastAPI Query() directly.
    """
    q: str = Field(..., min_length=2, max_length=500)
    limit: int = Field(default=10, ge=1, le=50)


class SearchResult(BaseModel):
    """
    Single search result.
    score = cosine similarity (0.0–1.0, higher = more relevant)
    """
    bookmark_id: uuid.UUID          # renamed from id — avoids shadowing built-in
    url: str
    title: str | None
    summary: str | None
    tags: list[str]                 # always [] not None — embedder contract
    score: float

    model_config = {"from_attributes": True}


class SearchResponse(BaseModel):
    """
    Full search response returned by GET /search.
    """
    query: str
    total: int
    results: list[SearchResult]