"""Generic Socrata client for data.michigan.gov.

Reusable across every dataset on the portal. Call
    socrata.refresh(dataset_id="abcd-1234", select=..., where=...)
and the result lands as `socrata_<dataset_id>.parquet`.

Access rules (MCDA (DTMB) email to the maintainer, Nov 6, 2026): automated
access goes only through the portal's dataset APIs. This module calls only
`/resource/{dataset_id}.json` and nothing else on the portal. It sends an
identifying User-Agent and makes at most 1 request per second. The portal is
moving to ArcGIS (MCDA (DTMB) email, Nov 13, 2026), so a 404 or 410 raises a
clear "dataset moved" error instead of writing empty output.

An app token is optional but recommended for anything scheduled - it
lifts the anonymous throttle. Set SOCRATA_APP_TOKEN in the environment
and this module will pick it up automatically.
"""
from __future__ import annotations

import logging
import os
import time
from pathlib import Path
from typing import Any

import httpx
import polars as pl

from ..common import integrity, manifest, warehouse

log = logging.getLogger("mi_state.socrata")

BASE = "https://data.michigan.gov/resource/{dataset_id}.json"
USER_AGENT = "AccessMI-pipeline/1.0 (+https://accessmi.org/contact)"
MIN_INTERVAL_S = 1.0  # at most 1 request per second
_RETRYABLE = (408, 425, 429, 500, 502, 503, 504)

_last_request_at: float = 0.0


class DatasetMovedError(RuntimeError):
    """The dataset endpoint returned 404 or 410."""


def _throttle() -> None:
    """Block until at least MIN_INTERVAL_S has passed since the last request."""
    global _last_request_at
    wait = MIN_INTERVAL_S - (time.monotonic() - _last_request_at)
    if wait > 0:
        time.sleep(wait)
    _last_request_at = time.monotonic()


def _get_page(url: str, params: dict[str, Any], dataset_id: str, retries: int = 4) -> Any:
    headers = {"User-Agent": USER_AGENT, "Accept": "application/json"}
    with httpx.Client(timeout=30.0, headers=headers, follow_redirects=True) as c:
        for attempt in range(retries):
            _throttle()
            r = c.get(url, params=params)
            if r.status_code in (404, 410):
                raise DatasetMovedError(
                    f"dataset moved (ArcGIS migration?): data.michigan.gov dataset "
                    f"{dataset_id} returned HTTP {r.status_code} at {url}. "
                    "No output written. Check the portal for the dataset's new location."
                )
            if r.status_code == 200:
                ct = r.headers.get("content-type", "").lower()
                if "json" not in ct:
                    raise RuntimeError(
                        f"non-JSON response ({ct!r}) from {r.url}; body starts: {r.text[:120]!r}"
                    )
                return r.json()
            if r.status_code in _RETRYABLE and attempt < retries - 1:
                wait = 2 ** attempt
                log.warning("throttled url=%s status=%s sleep=%ss", url, r.status_code, wait)
                time.sleep(wait)
                continue
            r.raise_for_status()
    raise RuntimeError(f"exhausted retries: {url}")


def refresh(
    dataset_id: str,
    *,
    select: str | None = None,
    where: str | None = None,
    order: str | None = None,
    page_size: int = 50_000,
    max_rows: int = 500_000,
) -> Path:
    cfg = manifest.get("socrata_generic")
    url = BASE.format(dataset_id=dataset_id)
    token = os.environ.get("SOCRATA_APP_TOKEN")

    rows: list[dict] = []
    offset = 0
    while offset < max_rows:
        params: dict[str, Any] = {"$limit": page_size, "$offset": offset}
        if select: params["$select"] = select
        if where:  params["$where"]  = where
        if order:  params["$order"]  = order
        if token:  params["$$app_token"] = token
        batch = _get_page(url, params, dataset_id)
        if not isinstance(batch, list) or not batch:
            break
        rows.extend(batch)
        if len(batch) < page_size:
            break
        offset += page_size

    if not rows:
        raise RuntimeError(f"Socrata {dataset_id} returned zero rows")

    df = pl.DataFrame(rows)
    out_id = f"socrata_{dataset_id.replace('-', '_')}"
    prov = integrity.Provenance.stamp(
        dataset_id=out_id, cfg=cfg,
        publisher_vintage=None, row_count=df.height,
        notes=f"data.michigan.gov dataset {dataset_id}",
    )
    return warehouse.write(df, out_id, prov)


def refresh_cli() -> Path:
    """CLI shim: raise until the caller specifies which dataset to pull."""
    raise NotImplementedError(
        "Socrata is a generic client; call socrata.refresh(dataset_id=...) "
        "with a specific data.michigan.gov dataset_id from the portal."
    )
