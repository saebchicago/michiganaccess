# mi_state

Python ETL for Michigan state + ecosystem datasets. Runs alongside the
existing Node ingest under `artifacts/access-mi/scripts/` (which feeds the
React app via typed TS shims) - this layer writes Parquet + a
`freshness.json` for DuckDB-backed RAG and analyst queries.

## Setup

```
cd pipelines/mi_state
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
```

## Refresh a dataset

```
mi-state refresh egle_pfas_sites
mi-state refresh all
```

Outputs land in `data/warehouse/<dataset_id>.parquet`. Provenance and
publisher vintage per dataset are tracked in `data/freshness.json`.

## Serve the API

```
uvicorn api.main:app --reload --port 8080
```

Endpoints:

- `GET /freshness` - per-dataset provenance + vintage
- `GET /datasets` - list of loaded Parquet views
- `GET /query/{dataset}?county_fips=26163&limit=500` - filtered rows
- `GET /rag/context?question=...&county_fips=...` - compact context payload for the Assistant

## Layout

```
src/mi_state/
  common/       shared infra (http, integrity, fips, warehouse)
  fetchers/     one module per dataset
  cli.py        typer entrypoint
manifest.yaml   single source of truth for dataset registry
api/main.py     FastAPI over DuckDB view of Parquet files
data/           warehouse output (gitignored)
```

## Adding a dataset

1. Add an entry to `manifest.yaml`.
2. Add a fetcher module under `src/mi_state/fetchers/`.
3. Register it in `src/mi_state/cli.py::FETCHERS`.
4. Run `mi-state refresh <id>` and verify Parquet + freshness entry.
