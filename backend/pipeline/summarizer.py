# pipeline/summarizer.py
"""
pipeline/summarizer.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Purpose:
    SummarizerStep — calls Groq LLM to produce a summary.

Flow:
    1. Read clean_text from state
    2. Build prompt → send to Groq (llama3-8b-8192)
    3. Parse response → write summary to state

Failure modes handled:
    - Groq API error     → mark_failed
    - Empty response     → mark_failed
    - Timeout            → mark_failed (tenacity retries 3x)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

from __future__ import annotations

from groq import AsyncGroq
from tenacity import retry, stop_after_attempt, wait_exponential

from config.settings import get_settings
from pipeline.base import BaseStep
from pipeline.state import PipelineState

_SYSTEM_PROMPT = """You are a precise summarizer for a bookmark manager.
Given article text, write a concise 2-4 sentence summary capturing:
- What the content is about
- Key insight or takeaway
- Why it might be useful to save

Return ONLY the summary text. No preamble, no labels, no markdown."""

_USER_TEMPLATE = """Summarize this article:

{text}

Summary:"""


class SummarizerStep(BaseStep):
    name = "summarizer"

    def __init__(self) -> None:
        super().__init__()
        self._client: AsyncGroq | None = None

    def _get_client(self) -> AsyncGroq:
        if self._client is None:
            settings = get_settings()
            self._client = AsyncGroq(api_key=settings.groq_api_key)
        return self._client

    async def run(self, state: PipelineState) -> PipelineState:
        if self._skip_if_failed(state):
            return state

        self.logger.info("step.summarizer.started", bookmark_id=str(state.bookmark_id))

        if not state.clean_text:
            state.mark_failed(self.name, "No clean_text available for summarization")
            return state

        try:
            summary = await self._call_groq(state.clean_text)
        except Exception as e:
            state.mark_failed(self.name, f"Groq API error: {e}")
            self.logger.error(
                "step.summarizer.failed",
                bookmark_id=str(state.bookmark_id),
                error=str(e),
            )
            return state

        if not summary or len(summary.strip()) < 10:
            state.mark_failed(self.name, "Groq returned empty or too-short summary")
            return state

        state.summary = summary.strip()

        self.logger.info(
            "step.summarizer.completed",
            bookmark_id=str(state.bookmark_id),
            summary_length=len(state.summary),
        )
        return state

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True,
    )
    async def _call_groq(self, text: str) -> str:
        settings = get_settings()
        client = self._get_client()

        response = await client.chat.completions.create(
            model=settings.groq_model,
            max_tokens=settings.groq_max_tokens,
            temperature=settings.groq_temperature,
            messages=[
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": _USER_TEMPLATE.format(text=text)},
            ],
        )

        content = response.choices[0].message.content
        return content or ""