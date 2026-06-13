import uuid

from pydantic import BaseModel, Field, field_validator


class SearchRequest(BaseModel):
    """
    POST /search request body.
    JSON: {"q": "machine learning papers", "limit": 10}
    """
    q: str = Field(..., min_length=2, max_length=500)
    limit: int = Field(default=10, ge=1, le=50)

    @field_validator("q")
    @classmethod
    def q_must_not_be_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("query must not be blank or whitespace only")
        return v.strip()


class SearchResult(BaseModel):
    """
    Single search result.
    score = cosine similarity (0.0–1.0, higher = more relevant)
    """
    bookmark_id: uuid.UUID
    url: str
    title: str | None
    summary: str | None
    tags: list[str]                
    score: float

    model_config = {"from_attributes": True}


class SearchResponse(BaseModel):
    """
    Full search response returned by POST /search.
    """
    query: str
    total: int
    results: list[SearchResult]
    