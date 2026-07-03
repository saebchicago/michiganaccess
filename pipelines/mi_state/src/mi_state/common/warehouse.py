"""Parquet writer + DuckDB view layer.

Every fetcher lands a single Parquet file per dataset; DuckDB opens them
zero-copy so the API and future RAG can query without loading them into
memory. Freshness is tracked out-of-band in freshness.json.
"""
import json
from pathlib import Path

import duckdb
import polars as pl

from .integrity import Provenance
from .paths import DUCKDB_PATH, FRESHNESS, WAREHOUSE


def write(df: pl.DataFrame, dataset_id: str, prov: Provenance) -> Path:
    out = WAREHOUSE / f"{dataset_id}.parquet"
    df.write_parquet(out, compression="zstd", statistics=True)
    _update_freshness(dataset_id, prov)
    return out


def mark_pending(dataset_id: str, prov: Provenance) -> None:
    """Record a failed refresh without overwriting the last-good Parquet."""
    _update_freshness(dataset_id, prov)


def _update_freshness(dataset_id: str, prov: Provenance) -> None:
    reg = json.loads(FRESHNESS.read_text()) if FRESHNESS.exists() else {}
    reg[dataset_id] = prov.to_dict()
    FRESHNESS.write_text(json.dumps(reg, indent=2, sort_keys=True))


def duck() -> duckdb.DuckDBPyConnection:
    con = duckdb.connect(str(DUCKDB_PATH))
    for p in sorted(WAREHOUSE.glob("*.parquet")):
        con.execute(
            f"CREATE OR REPLACE VIEW {p.stem} AS "
            f"SELECT * FROM read_parquet('{p.as_posix()}')"
        )
    return con
