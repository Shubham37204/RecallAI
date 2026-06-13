from __future__ import annotations

import httpx
import trafilatura
from tenacity import retry, stop_after_attempt, wait_exponential

from config.settings import get_settings
from pipeline.base import BaseStep
from pipeline.state import PipelineState

_USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/120.0.0.0 Safari/537.36"
)


class ScraperStep(BaseStep):
    name = "scraper"

    async def run(self, state: PipelineState) -> PipelineState:
        if self._skip_if_failed(state):
            return state

        self.logger.info(
            "step.scraper.started",
            bookmark_id=str(state.bookmark_id),
            url=state.url,
        )
        settings = get_settings()

        try:
            html = await self._fetch_html(state.url, settings.scraper_timeout_seconds)
        except httpx.TimeoutException:
            state.mark_failed(self.name, f"Timeout fetching URL: {state.url}")
            self.logger.warning("step.scraper.timeout", bookmark_id=str(state.bookmark_id))
            return state
        except httpx.HTTPStatusError as e:
            state.mark_failed(self.name, f"HTTP {e.response.status_code} for URL: {state.url}")
            self.logger.warning(
                "step.scraper.http_error",
                bookmark_id=str(state.bookmark_id),
                status=e.response.status_code,
            )
            return state
        except Exception as e:
            state.mark_failed(self.name, f"Fetch error: {e}")
            self.logger.error(
                "step.scraper.fetch_error",
                bookmark_id=str(state.bookmark_id),
                error=str(e),
            )
            return state

        if len(html) > settings.max_content_length:
            state.mark_failed(self.name, f"Content too large: {len(html)} bytes")
            return state

        extracted = trafilatura.extract(
            html,
            include_comments=False,
            include_tables=True,
            no_fallback=False,
        )

        if not extracted:
            extracted = trafilatura.extract(html, favor_recall=True)

        if not extracted or len(extracted.strip()) < 50:
            state.mark_failed(self.name, "Could not extract meaningful text from URL")
            self.logger.warning(
                "step.scraper.empty_extraction",
                bookmark_id=str(state.bookmark_id),
            )
            return state

        meta = trafilatura.extract_metadata(html)
        title = meta.title if meta and meta.title else None

        state.raw_text = extracted.strip()
        state.title = title
        state.content_length = len(extracted)

        self.logger.info(
            "step.scraper.completed",
            bookmark_id=str(state.bookmark_id),
            content_length=state.content_length,
            has_title=title is not None,
        )
        return state

    @staticmethod
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True,
    )
    async def _fetch_html(url: str, timeout: int) -> str:
        async with httpx.AsyncClient(
            timeout=timeout,
            follow_redirects=True,
            headers={"User-Agent": _USER_AGENT},
        ) as client:
            response = await client.get(url)
            response.raise_for_status()
            return response.text