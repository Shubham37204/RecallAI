# pipeline/embedder.py
"""
pipeline/embedder.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Purpose:
    EmbedderStep — generates vector embedding + upserts to Qdrant.

Flow:
    1. Read clean_text from state
    2. sentence-transformers → 384-dim vector (offloaded to thread pool)
    3. Upsert to Qdrant with payload (url, user_id, bookmark_id)
    4. Write vector + qdrant_point_id to state

Why embed clean_text not summary:
    - Summary loses detail; clean_text captures full semantics
    - Search needs to match specific facts, not just gist

Why run_in_executor:
    - model.encode() is CPU-bound + blocking
    - Called inside async def — without executor, blocks event loop
    - run_in_executor offloads to thread pool, event loop stays free

Failure modes handled:
    - Model load error   → mark_failed
    - Qdrant upsert fail → mark_failed (tenacity retries 3x)
    - Wrong dimension    → caught at upsert, mark_failed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

from __future__ import annotations

import asyncio
import uuid
from functools import partial

from qdrant_client.models import PointStruct
from sentence_transformers import SentenceTransformer
from tenacity import retry, stop_after_attempt, wait_exponential

from config.settings import get_settings
from pipeline.base import BaseStep
from pipeline.state import PipelineState
from stores.qdrant.client import get_qdrant_client

# Module-level model cache — loaded once, reused across tasks
_model: SentenceTransformer | None = None


def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        settings = get_settings()
        _model = SentenceTransformer(settings.embedding_model)
    return _model


class EmbedderStep(BaseStep):
    name = "embedder"

    async def run(self, state: PipelineState) -> PipelineState:
        if self._skip_if_failed(state):
            return state

        self.logger.info("step.embedder.started", bookmark_id=str(state.bookmark_id))

        if not state.clean_text:
            state.mark_failed(self.name, "No clean_text to embed")
            return state

        # Generate embedding — offload CPU-bound encode to thread pool
        # model.encode() blocks; run_in_executor keeps event loop free
        try:
            model = _get_model()
            loop = asyncio.get_event_loop()
            encode_fn = partial(
                model.encode,
                state.clean_text,
                normalize_embeddings=True,  # cosine similarity via dot product
            )
            vector: list[float] = (await loop.run_in_executor(None, encode_fn)).tolist()
        except Exception as e:
            state.mark_failed(self.name, f"Embedding generation failed: {e}")
            self.logger.error(
                "step.embedder.encode_failed",
                bookmark_id=str(state.bookmark_id),
                error=str(e),
            )
            return state

        # Validate dimension
        settings = get_settings()
        if len(vector) != settings.embedding_dimension:
            state.mark_failed(
                self.name,
                f"Vector dimension mismatch: got {len(vector)}, expected {settings.embedding_dimension}",
            )
            return state

        # Upsert to Qdrant
        point_id = uuid.uuid4()
        try:
            await self._upsert_to_qdrant(
                point_id=point_id,
                vector=vector,
                state=state,
            )
        except Exception as e:
            state.mark_failed(self.name, f"Qdrant upsert failed: {e}")
            self.logger.error(
                "step.embedder.qdrant_failed",
                bookmark_id=str(state.bookmark_id),
                error=str(e),
            )
            return state

        state.vector = vector
        state.qdrant_point_id = point_id

        self.logger.info(
            "step.embedder.completed",
            bookmark_id=str(state.bookmark_id),
            qdrant_point_id=str(point_id),
            vector_dim=len(vector),
        )
        return state

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True,
    )
    async def _upsert_to_qdrant(
        self,
        point_id: uuid.UUID,
        vector: list[float],
        state: PipelineState,
    ) -> None:
        settings = get_settings()
        client = get_qdrant_client()

        await client.upsert(
            collection_name=settings.qdrant_collection_name,
            points=[
                PointStruct(
                    id=str(point_id),
                    vector=vector,
                    payload={
                        "bookmark_id": str(state.bookmark_id),
                        "url": state.url,
                        "title": state.title,
                        "summary": state.summary,
                        "tags": state.tags,
                    },
                )
            ],
        )
        