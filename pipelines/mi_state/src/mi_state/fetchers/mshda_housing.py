"""MSHDA / mihousingdata.org - housing cost burden by county.

Not yet implemented: the underlying view is a Tableau workbook on
mihousingdata.org. The `.csv` download URL is stable per view but the
correct view path needs to be captured from the workbook. Next step:

  1. Open https://mihousingdata.org/ and pick the Cost Burden by County
     view.
  2. From devtools (Network -> XHR), grab the workbook / view URL and
     append `.csv?:showVizHome=no&:embed=true`.
  3. Wire it here and normalize to
     [county_fips, year, owner_cost_burdened_pct, renter_cost_burdened_pct,
      owner_severely_burdened_pct, renter_severely_burdened_pct].

Fallback if MSHDA blocks the CSV endpoint: pull the same signal from HUD
CHAS at https://www.huduser.gov/portal/datasets/cp.html (annual, county).
"""
from pathlib import Path


def refresh() -> Path:
    raise NotImplementedError(
        "MSHDA fetcher pending: capture Tableau CSV URL from mihousingdata.org "
        "and normalize to the county-year schema documented in this module."
    )
