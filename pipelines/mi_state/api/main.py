"""AccessMI Data API - lightweight FastAPI facade over the Parquet warehouse.

Designed to be embedded in the AI Assistant's tool loop:

  - /freshness       when did we last pull each source, at what integrity
  - /datasets        what tables can I query
  - /query/{ds}      row-level access with a county filter
  - /rag/context     one-shot payload the Assistant can drop into a prompt
"""
from __future__ import annotations

import json
import re

from fastapi import FastAPI, HTTPException, Query

from mi_state.common.paths import FRESHNESS, WAREHOUSE
from mi_state.common.warehouse import duck


def _rows(cur) -> list[dict]:
    cols = [d[0] for d in cur.description]
    return [dict(zip(cols, r)) for r in cur.fetchall()]

app = FastAPI(title="AccessMI Data API", version="0.1")

_con = duck()
_IDENT = re.compile(r"^[a-z][a-z0-9_]*$")


def _views() -> set[str]:
    return {p.stem for p in WAREHOUSE.glob("*.parquet")}


def _columns(view: str) -> set[str]:
    rows = _con.execute(
        "SELECT column_name FROM duckdb_columns() "
        "WHERE schema_name='main' AND table_name=?",
        [view],
    ).fetchall()
    return {r[0] for r in rows}


def _county_predicate(view: str) -> str | None:
    """Return a SQL predicate for filtering `view` by a single county FIPS.

    Prefers county_fips (scalar) and falls back to list_contains
    (county_fips_all) so multi-county sites are attributed to every
    county they touch. Returns None if the view has neither column."""
    cols = _columns(view)
    if "county_fips" in cols and "county_fips_all" in cols:
        return "(county_fips = ? OR list_contains(county_fips_all, ?))"
    if "county_fips" in cols:
        return "county_fips = ?"
    if "county_fips_all" in cols:
        return "list_contains(county_fips_all, ?)"
    return None


@app.get("/freshness")
def freshness() -> dict:
    return json.loads(FRESHNESS.read_text()) if FRESHNESS.exists() else {}


@app.get("/datasets")
def datasets() -> list[str]:
    return sorted(_views())


@app.get("/query/{dataset}")
def query(
    dataset: str,
    county_fips: str | None = Query(default=None, pattern=r"^\d{5}$"),
    limit: int = Query(default=500, le=5000),
) -> dict:
    if not _IDENT.match(dataset):
        raise HTTPException(400, "bad dataset identifier")
    if dataset not in _views():
        raise HTTPException(404, f"unknown dataset '{dataset}'")

    sql = f"SELECT * FROM {dataset}"
    params: list = []
    if county_fips:
        pred = _county_predicate(dataset)
        if pred:
            sql += f" WHERE {pred}"
            params.extend([county_fips] * pred.count("?"))
    sql += f" LIMIT {int(limit)}"

    rows = _rows(_con.execute(sql, params))
    return {"dataset": dataset, "count": len(rows), "rows": rows}


@app.get("/rag/context")
def rag_context(
    question: str,
    county_fips: str | None = Query(default=None, pattern=r"^\d{5}$"),
    per_dataset_rows: int = Query(default=25, le=200),
) -> dict:
    """Compact context payload for the AI Assistant. Every dataset carries
    its own freshness + integrity label so the Assistant can cite vintage."""
    reg = json.loads(FRESHNESS.read_text()) if FRESHNESS.exists() else {}
    slices: dict[str, list[dict]] = {}

    for ds in _views():
        try:
            sql = f"SELECT * FROM {ds}"
            params: list = []
            if county_fips:
                pred = _county_predicate(ds)
                if pred:
                    sql += f" WHERE {pred}"
                    params.extend([county_fips] * pred.count("?"))
            sql += f" LIMIT {int(per_dataset_rows)}"
            slices[ds] = _rows(_con.execute(sql, params))
        except Exception:
            continue

    return {
        "question": question,
        "county_fips": county_fips,
        "freshness": reg,
        "slices": slices,
    }
