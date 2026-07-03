"""MDHHS Respiratory Virus Surveillance - weekly ED % and wastewater.

Not yet implemented. The MDHHS Respiratory Virus Dashboard is published as
a Tableau embed on michigan.gov/mdhhs; the underlying data file has moved
locations at least twice. Next step:

  1. From the dashboard page, capture the CSV/JSON that populates the ED
     visit % and wastewater panels via devtools Network tab.
  2. Wire the URL here and normalize to
     [mdhhs_region, mmwr_week, pathogen, ed_visit_pct, wastewater_signal].
  3. Integrity label MODELED - the ED % is a modeled surveillance
     estimate, not a direct count.

If MDHHS proves unstable, PopHIVE (Yale) mirrors MI weekly respiratory
signals with per-record vintage and is API-accessible.
"""
from pathlib import Path


def refresh() -> Path:
    raise NotImplementedError(
        "MDHHS respiratory fetcher pending: capture Tableau data URL from "
        "the Respiratory Virus Dashboard and wire it here."
    )
