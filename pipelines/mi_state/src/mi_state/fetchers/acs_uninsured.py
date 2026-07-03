"""ACS S2701 - Uninsured rate for the civilian noninstitutionalized pop.

Source: Census Bureau ACS 5-year Subject Table S2701, variable
S2701_C05_001E (percent uninsured under age 65 - the estimate the
Healthy Michigan Plan story is built on).

Provenance: VERIFIED. Straight Census API tabulation, no modeling.

Vintages follow the trendSeries.v1 non-overlap rule: successive
5-year ACS windows must be >=5 years apart so the pair reflects
independent samples, not overlapping ones. We ship 2013 / 2018 / 2023
(windows 2009-2013, 2014-2018, 2019-2023).

Output:
  acs_uninsured_county.parquet   - long form (county_fips, vintage, value)
                                    with yoy_abs + yoy_pct.
  acs_uninsured_trend.parquet    - per-county classification + slope.

Failure mode mirrors the mjs refresh scripts: if any vintage errors we
stamp PENDING on freshness.json and re-raise; the last-good Parquet
stays on disk for the frontend to keep serving.
"""
from __future__ import annotations

import logging
import os
from pathlib import Path

import polars as pl

from ..common import fips, http, integrity, manifest, warehouse
from ..common.timeseries import (
    MetricSpec,
    classify_frame,
    enforce_partition,
    yoy_change,
)

log = logging.getLogger("mi_state.acs_uninsured")

DATASET_ID = "acs_uninsured_county"
TREND_ID   = "acs_uninsured_trend"

VINTAGES = [2013, 2018, 2023]
VAR      = "S2701_C05_001E"

SPEC = MetricSpec(
    metric_id    = "uninsured_rate",
    display      = "Uninsured rate",
    unit         = "percent",
    direction    = "down_is_better",
    source_name  = "U.S. Census Bureau, ACS 5-year, Table S2701",
    source_url   = "https://data.census.gov/table/ACSST5Y2023.S2701",
    integrity    = "VERIFIED",
    vintage_kind = "acs5",
    valid_min    = 0.0,
    valid_max    = 50.0,
)


def _fetch_vintage(year: int) -> pl.DataFrame:
    url = f"https://api.census.gov/data/{year}/acs/acs5/subject"
    params = {
        "get": f"NAME,{VAR}",
        "for": "county:*",
        "in":  f"state:{fips.MI_STATE_FIPS}",
    }
    api_key = os.getenv("CENSUS_API_KEY")
    if api_key:
        params["key"] = api_key
    payload = http.get_json(url, params=params)
    if not payload or not isinstance(payload, list) or len(payload) < 2:
        raise RuntimeError(f"empty ACS payload for {year}")
    header, *rows = payload
    df = pl.DataFrame(rows, schema=header, orient="row")
    return (
        df.with_columns(
            county_fips = pl.concat_str([pl.col("state"), pl.col("county")]),
            vintage     = pl.lit(year, dtype=pl.Int32),
            value       = pl.col(VAR).cast(pl.Float64, strict=False),
        )
        .select("county_fips", "vintage", "value")
    )


def refresh() -> Path:
    cfg = manifest.get(DATASET_ID)

    if not os.getenv("CENSUS_API_KEY"):
        # As of mid-2026 the Census API rejects unkeyed requests with a
        # 302 to missing_key.html. Ship PENDING with a clear next step
        # rather than a cryptic HTTP error mid-batch.
        prov = integrity.Provenance.stamp(
            dataset_id=DATASET_ID, cfg=cfg,
            publisher_vintage=None, row_count=0,
            integrity="PENDING",
            notes="CENSUS_API_KEY unset; request one at https://api.census.gov/data/key_signup.html",
        )
        warehouse.mark_pending(DATASET_ID, prov)
        raise RuntimeError(
            "CENSUS_API_KEY unset. Set the env var (free key from "
            "https://api.census.gov/data/key_signup.html) and re-run."
        )

    frames: list[pl.DataFrame] = []
    try:
        for year in VINTAGES:
            frames.append(_fetch_vintage(year))
    except Exception as e:
        prov = integrity.Provenance.stamp(
            dataset_id=DATASET_ID, cfg=cfg,
            publisher_vintage=None, row_count=0,
            integrity="PENDING", notes=f"fetch failed: {e}",
        )
        warehouse.mark_pending(DATASET_ID, prov)
        raise

    long = pl.concat(frames).pipe(enforce_partition, SPEC)
    long_yoy = yoy_change(long)

    trend = classify_frame(long, SPEC.direction)

    prov = integrity.Provenance.stamp(
        dataset_id=DATASET_ID, cfg=cfg,
        publisher_vintage=str(VINTAGES[-1]),
        row_count=long_yoy.height,
        notes=(
            f"Vintages: {VINTAGES}. Non-overlapping ACS 5-year windows. "
            f"Direction={SPEC.direction}; STABLE band=+/-2%."
        ),
    )
    warehouse.write(long_yoy, DATASET_ID, prov)

    trend_prov = integrity.Provenance.stamp(
        dataset_id=TREND_ID, cfg=cfg,
        publisher_vintage=str(VINTAGES[-1]),
        row_count=trend.height,
        notes="Derived: per-county IMPROVING/STABLE/CONCERN + LSQ slope.",
    )
    warehouse.write(trend, TREND_ID, trend_prov)

    log.info(
        "acs_uninsured refreshed: %d rows, %d counties classified",
        long_yoy.height, trend.height,
    )
    return warehouse.WAREHOUSE / f"{DATASET_ID}.parquet"
