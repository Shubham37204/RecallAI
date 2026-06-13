from __future__ import annotations

import re
from config.settings import get_settings
from pipeline.base import BaseStep
from pipeline.state import PipelineState


class CleanerStep(BaseStep):
    name = "cleaner"

    async def run(self, state: PipelineState) -> PipelineState:
        if self._skip_if_failed(state):
            return state

        self.logger.info("step.cleaner.started", bookmark_id=str(state.bookmark_id))

        if not state.raw_text:
            state.mark_failed(self.name, "No raw_text to clean")
            return state

        settings = get_settings()
        text = state.raw_text

        text = re.sub(r"[^\S\n\t ]+", " ", text)
        text = re.sub(r"\n{3,}", "\n\n", text)
        text = re.sub(r" {2,}", " ", text)
        lines = [line.strip() for line in text.splitlines()]
        text = "\n".join(line for line in lines if line)

        max_chars = settings.chunk_size * 20
        if len(text) > max_chars:
            text = text[:max_chars]
            self.logger.info(
                "step.cleaner.truncated",
                bookmark_id=str(state.bookmark_id),
                original=state.content_length,
                truncated_to=max_chars,
            )

        if len(text.strip()) < 50:
            state.mark_failed(self.name, "Clean text too short after normalization")
            return state

        state.clean_text = text.strip()

        self.logger.info(
            "step.cleaner.completed",
            bookmark_id=str(state.bookmark_id),
            clean_length=len(state.clean_text),
        )
        return state