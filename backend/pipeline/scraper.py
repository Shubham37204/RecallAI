from __future__ import annotations

import asyncio
import ipaddress
import socket

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
_SCRAPER_HEADERS = {
    "User-Agent": _USER_AGENT,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}
_BLOCKED_HOSTS = {"localhost", "localhost.localdomain"}


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
        settings = get_settings()
        current_url = httpx.URL(url)
        async with httpx.AsyncClient(
            timeout=timeout,
            follow_redirects=False,
            headers=_SCRAPER_HEADERS,
        ) as client:
            for redirect_count in range(settings.scraper_max_redirects + 1):
                await _validate_public_http_url(current_url)
                response = await client.get(current_url)

                if response.is_redirect:
                    if redirect_count == settings.scraper_max_redirects:
                        raise ValueError("Too many redirects while fetching URL")
                    location = response.headers.get("location")
                    if not location:
                        raise ValueError("Redirect response missing Location header")
                    current_url = response.url.join(location)
                    continue

                response.raise_for_status()
                return response.text

        raise ValueError("Too many redirects while fetching URL")


async def _validate_public_http_url(url: httpx.URL) -> None:
    if url.scheme not in {"http", "https"}:
        raise ValueError("Only http and https URLs are allowed")

    if not url.host:
        raise ValueError("URL host is required")

    host = url.host.rstrip(".").lower()
    if host in _BLOCKED_HOSTS:
        raise ValueError("Localhost URLs are not allowed")

    addresses = await asyncio.to_thread(socket.getaddrinfo, host, url.port or None, type=socket.SOCK_STREAM)
    if not addresses:
        raise ValueError("URL host could not be resolved")

    for address in addresses:
        ip = ipaddress.ip_address(address[4][0])
        if (
            ip.is_private
            or ip.is_loopback
            or ip.is_link_local
            or ip.is_multicast
            or ip.is_reserved
            or ip.is_unspecified
        ):
            raise ValueError("URL resolves to a blocked network address")
