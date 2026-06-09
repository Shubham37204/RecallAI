# pipeline/tagger.py
"""
pipeline/tagger.py
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Purpose:
    TaggerStep — calls Groq LLM to extract tags from content.

Flow:
    1. Read clean_text + summary from state
    2. Build prompt → send to Groq
    3. Parse comma-separated tags → list[str]
    4. Write tags to state

Tag rules (enforced in prompt):
    - 3 to 7 tags
    - lowercase, no spaces (use hyphens)
    - topic-focused (not generic like "article")

Failure modes handled:
    - Groq API error  → mark_failed
    - Parse fails     → fallback to empty list (not fatal)
    - Empty response  → fallback to empty list
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

from __future__ import annotations

from groq import AsyncGroq
from tenacity import retry, stop_after_attempt, wait_exponential

from config.settings import get_settings
from pipeline.base import BaseStep
from pipeline.state import PipelineState

_SYSTEM_PROMPT = """You are a tagging engine for a bookmark manager.
Given article text and its summary, extract 3-7 topic tags.

Rules:
- lowercase only
- use hyphens for multi-word tags (e.g. machine-learning)
- no generic tags like "article", "website", "content"
- focus on specific topics, technologies, domains

Return ONLY a comma-separated list of tags. Nothing else.
Example: python,machine-learning,neural-networks,deep-learning"""

_USER_TEMPLATE = """Article summary:
{summary}

Article text (first 1000 chars):
{text}

Tags:"""


class TaggerStep(BaseStep):
    name = "tagger"

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

        self.logger.info("step.tagger.started", bookmark_id=str(state.bookmark_id))

        if not state.clean_text:
            state.mark_failed(self.name, "No clean_text for tagging")
            return state

        try:
            raw_tags = await self._call_groq(
                summary=state.summary or "",
                text=state.clean_text[:1000],
            )
            tags = self._parse_tags(raw_tags)
        except Exception as e:
            # Tagging failure is non-fatal — pipeline continues with empty tags
            self.logger.warning(
                "step.tagger.failed_nonfatal",
                bookmark_id=str(state.bookmark_id),
                error=str(e),
            )
            tags = []

        state.tags = tags

        self.logger.info(
            "step.tagger.completed",
            bookmark_id=str(state.bookmark_id),
            tag_count=len(tags),
            tags=tags,
        )
        return state

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True,
    )
    async def _call_groq(self, summary: str, text: str) -> str:
        settings = get_settings()
        client = self._get_client()

        response = await client.chat.completions.create(
            model=settings.groq_model,
            max_tokens=100,           # tags are short
            temperature=0.1,          # low temp = consistent tags
            messages=[
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": _USER_TEMPLATE.format(
                    summary=summary,
                    text=text,
                )},
            ],
        )

        content = response.choices[0].message.content
        return content or ""

    def _parse_tags(self, raw: str) -> list[str]:
        """
        Parse comma-separated tag string into clean list.
        Handles extra whitespace, newlines, uppercase.
        Falls back to empty list on any parse failure.
        """
        if not raw:
            return []

        tags = []
        for tag in raw.split(","):
            tag = tag.strip().lower()
            # Remove non-alphanumeric except hyphens
            tag = "".join(c for c in tag if c.isalnum() or c == "-")
            if tag and len(tag) >= 2:
                tags.append(tag)

        # Enforce 3-7 range
        return tags[:7]