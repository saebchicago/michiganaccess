from pathlib import Path

PKG_ROOT     = Path(__file__).resolve().parents[3]      # pipelines/mi_state
REPO_ROOT    = PKG_ROOT.parents[1]                       # /Users/saeb/michiganaccess
MANIFEST     = PKG_ROOT / "manifest.yaml"
WAREHOUSE    = PKG_ROOT / "data" / "warehouse"
FRESHNESS    = PKG_ROOT / "data" / "freshness.json"
DUCKDB_PATH  = PKG_ROOT / "data" / "accessmi.duckdb"

# The single point of truth for the 83 MI county FIPS lives in the TS
# codebase. Python reads it at import time so the two sides cannot drift.
FIPS_TS_PATH = REPO_ROOT / "artifacts" / "access-mi" / "src" / "data" / "census-geographies.ts"

WAREHOUSE.mkdir(parents=True, exist_ok=True)
