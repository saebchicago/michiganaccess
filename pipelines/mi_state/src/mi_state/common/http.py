import logging
import time
from typing import Any

import httpx

log = logging.getLogger("mi_state.http")

UA = "AccessMI-ETL/0.1 (+https://accessmi.org; civic data pipeline)"


def client(timeout: float = 30.0) -> httpx.Client:
    return httpx.Client(
        timeout=timeout,
        headers={"User-Agent": UA, "Accept": "application/json,text/csv,*/*"},
        follow_redirects=True,
    )


def _retryable(status: int) -> bool:
    return status in (408, 425, 429, 500, 502, 503, 504)


def get_json(url: str, *, params: dict | None = None, retries: int = 4) -> Any:
    with client() as c:
        for attempt in range(retries):
            r = c.get(url, params=params)
            if r.status_code == 200:
                ct = r.headers.get("content-type", "").lower()
                # Census returns 200 HTML at missing_key.html after a 302
                # from the API; catch that instead of choking in json.loads.
                if "json" not in ct and "geo+json" not in ct:
                    raise RuntimeError(
                        f"non-JSON response ({ct!r}) from {r.url}; "
                        f"body starts: {r.text[:120]!r}"
                    )
                return r.json()
            if _retryable(r.status_code) and attempt < retries - 1:
                wait = 2 ** attempt
                log.warning("throttled url=%s status=%s sleep=%ss", url, r.status_code, wait)
                time.sleep(wait)
                continue
            r.raise_for_status()
    raise RuntimeError(f"exhausted retries: {url}")


def get_bytes(url: str, *, retries: int = 3) -> bytes:
    with client(timeout=120) as c:
        for attempt in range(retries):
            r = c.get(url)
            if r.status_code == 200:
                return r.content
            if _retryable(r.status_code) and attempt < retries - 1:
                time.sleep(2 ** attempt)
                continue
            r.raise_for_status()
    raise RuntimeError(f"exhausted retries: {url}")
