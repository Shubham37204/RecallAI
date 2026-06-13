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

        self.logger.info("step.embedder.started",
                         bookmark_id=str(state.bookmark_id))

        if not state.clean_text:
            state.mark_failed(self.name, "No clean_text to embed")
            return state

        try:
            model = _get_model()
            loop = asyncio.get_running_loop()
            encode_fn = partial(
                model.encode,
                state.clean_text,
                normalize_embeddings=True,  
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

        settings = get_settings()
        if len(vector) != settings.embedding_dimension:
            state.mark_failed(
                self.name,
                f"Vector dimension mismatch: got {len(vector)}, expected {settings.embedding_dimension}",
            )
            return state

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
                        "user_id": state.user_id,
                        "url": state.url,
                        "title": state.title,
                        "summary": state.summary,
                        "tags": state.tags,
                    },
                )
            ],
        )
