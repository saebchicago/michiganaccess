"""Generic Socrata client for data.michigan.gov.

Reusable across every dataset on the portal. Call
    socrata.refresh(dataset_id="abcd-1234", select=..., where=...)
and the result lands as `socrata_<dataset_id>.parquet`.

An app token is optional but recommended for anything scheduled - it
lifts the anonymous throttle. Set SOCRATA_APP_TOKEN in the environment
and this module will pick it up automatically.
"""
from __future__ import annotations

import os
from pathlib import Path

import polars as pl

from ..common import http, integrity, manifest, warehouse

BASE = "https://data.michigan.gov/resource/{dataset_id}.json"


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
        params = {"$limit": page_size, "$offset": offset}
        if select: params["$select"] = select
        if where:  params["$where"]  = where
        if order:  params["$order"]  = order
        if token:  params["$$app_token"] = token
        batch = http.get_json(url, params=params)
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
