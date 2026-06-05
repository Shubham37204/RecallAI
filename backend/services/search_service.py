"""
schemas/search.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Purpose:
    Pydantic schemas for semantic search request/response.
    Used by GET /search endpoint (Slice 4).

Defined here:
    SearchRequest  → query string + optional filters
    SearchResult   → single search hit with score
    SearchResponse → list of results + metadata
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

import uuid

from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    """
    GET /search query parameters.
    q = natural language query (e.g. "machine learning papers")
    limit = max results to return
    """
    q: str = Field(..., min_length=1, max_length=500)
    limit: int = Field(default=10, ge=1, le=50)


class SearchResult(BaseModel):
    """
    Single search result.
    score = cosine similarity (0.0 to 1.0, higher = more relevant)
    """
    id: uuid.UUID
    url: str
    title: str | None
    summary: str | None
    tags: list[str] | None
    score: float

    model_config = {"from_attributes": True}


class SearchResponse(BaseModel):
    """
    Full search response.
    results = ranked list of matching bookmarks
    query = echoed back for client reference
    total = number of results returned
    """
    query: str
    total: int
    results: list[SearchResult]
    