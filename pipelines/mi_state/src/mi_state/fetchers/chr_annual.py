"""County Health Rankings & Roadmaps - annual analytic data.

Source: University of Wisconsin Population Health Institute (UWPHI).
One analytic-data CSV per vintage covers ~80 measures for every US county.
We ship a curated Michigan-only subset across the four AccessMI pillars
(health, housing, opportunity, environment). Crime/justice measures are
explicitly excluded per project scope.

Provenance: VERIFIED. Values are direct UWPHI tabulations; CHR does not
do small-area modeling on top of the source publishers (Census, CDC,
BEA, EPA, HUD). The curation is a column select, not an aggregation.

Schema drift: CHR renames columns between vintages (v083 -> v085 for
uninsured, etc.). CURATED maps a stable metric_id to a per-vintage list
of candidate CHR column names; we take the first present column and
log which vintages were skipped for missing schema entries.
"""
from __future__ import annotations

import io
import logging
from pathlib import Path

import polars as pl

from ..common import fips, http, integrity, manifest, warehouse
from ..common.timeseries import (
    MetricSpec,
    classify_frame,
    enforce_partition,
    yoy_change,
)

log = logging.getLogger("mi_state.chr_annual")

DATASET_ID = "chr_county"
TREND_ID   = "chr_county_trend"

# CHR publishes an "analytic data" CSV per release year. URLs may need
# refreshing when UWPHI reorganizes their downloads; the manifest is the
# single source of truth for the base URL template.
CSV_TMPL = "https://www.countyhealthrankings.org/sites/default/files/media/document/analytic_data{year}.csv"

VINTAGES = list(range(2018, 2026))

# metric_id -> spec + per-vintage candidate columns.
# Never include crime/justice measures (v082, v011 juvenile arrests, etc.).
CURATED: dict[str, tuple[MetricSpec, list[str]]] = {
    "adult_uninsured_pct": (
        MetricSpec(
            metric_id="adult_uninsured_pct", display="Adult uninsured", unit="percent",
            direction="down_is_better",
            source_name="U.S. Census Bureau, SAHIE (via County Health Rankings)",
            source_url="https://www.countyhealthrankings.org/health-data",
            integrity="VERIFIED", vintage_kind="annual",
            valid_min=0.0, valid_max=50.0,
        ),
        ["v085_rawvalue", "v083_rawvalue"],
    ),
    "children_in_poverty_pct": (
        MetricSpec(
            metric_id="children_in_poverty_pct", display="Children in poverty", unit="percent",
            direction="down_is_better",
            source_name="SAIPE (via County Health Rankings)",
            source_url="https://www.countyhealthrankings.org/health-data",
            integrity="VERIFIED", vintage_kind="annual",
            valid_min=0.0, valid_max=60.0,
        ),
        ["v024_rawvalue"],
    ),
    "severe_housing_problems_pct": (
        MetricSpec(
            metric_id="severe_housing_problems_pct", display="Severe housing problems",
            unit="percent", direction="down_is_better",
            source_name="HUD CHAS (via County Health Rankings)",
            source_url="https://www.countyhealthrankings.org/health-data",
            integrity="VERIFIED", vintage_kind="annual",
            valid_min=0.0, valid_max=60.0,
        ),
        ["v136_rawvalue"],
    ),
    "housing_cost_burden_owner_pct": (
        MetricSpec(
            metric_id="housing_cost_burden_owner_pct",
            display="Homeowners spending >=30% on housing",
            unit="percent", direction="down_is_better",
            source_name="ACS 5-year (via County Health Rankings)",
            source_url="https://www.countyhealthrankings.org/health-data",
            integrity="VERIFIED", vintage_kind="annual",
            valid_min=0.0, valid_max=80.0,
        ),
        ["v154_rawvalue"],
    ),
    "housing_cost_burden_renter_pct": (
        MetricSpec(
            metric_id="housing_cost_burden_renter_pct",
            display="Renters spending >=30% on housing",
            unit="percent", direction="down_is_better",
            source_name="ACS 5-year (via County Health Rankings)",
            source_url="https://www.countyhealthrankings.org/health-data",
            integrity="VERIFIED", vintage_kind="annual",
            valid_min=0.0, valid_max=80.0,
        ),
        ["v153_rawvalue"],
    ),
    "air_pollution_pm25": (
        MetricSpec(
            metric_id="air_pollution_pm25", display="Air pollution - PM2.5 daily density",
            unit="ug/m3", direction="down_is_better",
            source_name="EPA (via County Health Rankings)",
            source_url="https://www.countyhealthrankings.org/health-data",
            integrity="VERIFIED", vintage_kind="annual",
            valid_min=0.0, valid_max=20.0,
        ),
        ["v125_rawvalue"],
    ),
    "food_environment_index": (
        MetricSpec(
            metric_id="food_environment_index", display="Food environment index",
            unit="index_0_10", direction="up_is_better",
            source_name="USDA/Map the Meal Gap (via County Health Rankings)",
            source_url="https://www.countyhealthrankings.org/health-data",
            integrity="VERIFIED", vintage_kind="annual",
            valid_min=0.0, valid_max=10.0,
        ),
        ["v133_rawvalue"],
    ),
    "broadband_access_pct": (
        MetricSpec(
            metric_id="broadband_access_pct", display="Broadband access",
            unit="percent", direction="up_is_better",
            source_name="ACS 5-year (via County Health Rankings)",
            source_url="https://www.countyhealthrankings.org/health-data",
            integrity="VERIFIED", vintage_kind="annual",
            valid_min=0.0, valid_max=100.0,
        ),
        ["v166_rawvalue"],
    ),
    "some_college_pct": (
        MetricSpec(
            metric_id="some_college_pct", display="Adults with some college",
            unit="percent", direction="up_is_better",
            source_name="ACS 5-year (via County Health Rankings)",
            source_url="https://www.countyhealthrankings.org/health-data",
            integrity="VERIFIED", vintage_kind="annual",
            valid_min=0.0, valid_max=100.0,
        ),
        ["v069_rawvalue"],
    ),
    "primary_care_ratio": (
        MetricSpec(
            metric_id="primary_care_ratio", display="Primary care physicians (pop per PCP)",
            unit="people_per_pcp", direction="down_is_better",
            source_name="HRSA Area Health Resource File (via County Health Rankings)",
            source_url="https://www.countyhealthrankings.org/health-data",
            integrity="VERIFIED", vintage_kind="annual",
            valid_min=0.0, valid_max=100000.0,
        ),
        ["v004_rawvalue"],
    ),
}


def _fetch_vintage(year: int) -> pl.DataFrame:
    url = CSV_TMPL.format(year=year)
    body = http.get_bytes(url)
    return pl.read_csv(
        io.BytesIO(body),
        infer_schema_length=5000,
        ignore_errors=True,
    )


def _pick_column(df: pl.DataFrame, candidates: list[str]) -> str | None:
    for c in candidates:
        if c in df.columns:
            return c
    return None


def _extract(df: pl.DataFrame, year: int) -> list[pl.DataFrame]:
    if "statecode" not in df.columns or "countycode" not in df.columns:
        raise RuntimeError(f"CHR {year}: missing statecode/countycode columns")

    mi = (
        df.with_columns(
            pl.col("statecode").cast(pl.Utf8).str.zfill(2).alias("statecode"),
            pl.col("countycode").cast(pl.Utf8).str.zfill(3).alias("countycode"),
        )
        .filter((pl.col("statecode") == fips.MI_STATE_FIPS) & (pl.col("countycode") != "000"))
    )

    frames: list[pl.DataFrame] = []
    for metric_id, (_spec, candidates) in CURATED.items():
        col = _pick_column(mi, candidates)
        if col is None:
            log.warning("chr %s: no column for %s (tried %s)", year, metric_id, candidates)
            continue
        frames.append(
            mi.select(
                county_fips = pl.concat_str([pl.col("statecode"), pl.col("countycode")]),
                metric_id   = pl.lit(metric_id),
                vintage     = pl.lit(year, dtype=pl.Int32),
                value       = pl.col(col).cast(pl.Float64, strict=False),
            )
        )
    return frames


def refresh() -> Path:
    cfg = manifest.get(DATASET_ID)

    all_frames: list[pl.DataFrame] = []
    failed_vintages: list[int] = []
    for year in VINTAGES:
        try:
            raw = _fetch_vintage(year)
            all_frames.extend(_extract(raw, year))
        except Exception as e:
            log.warning("chr %s vintage failed: %s", year, e)
            failed_vintages.append(year)

    if not all_frames:
        prov = integrity.Provenance.stamp(
            dataset_id=DATASET_ID, cfg=cfg,
            publisher_vintage=None, row_count=0,
            integrity="PENDING",
            notes=f"all vintages failed: {failed_vintages}",
        )
        warehouse.mark_pending(DATASET_ID, prov)
        raise RuntimeError(f"CHR: no vintages ingested (failed={failed_vintages})")

    long = pl.concat(all_frames)

    # Per-metric partition enforcement (some metrics may have partial
    # county coverage in early vintages; those get filtered before trend
    # classification so we do not falsely label sparse series).
    trend_frames: list[pl.DataFrame] = []
    kept_metrics: list[str] = []
    dropped_metrics: list[str] = []

    for metric_id, (spec, _cols) in CURATED.items():
        sub = long.filter(pl.col("metric_id") == metric_id).select("county_fips", "vintage", "value")
        try:
            valid = sub.pipe(enforce_partition, spec)
        except ValueError as e:
            log.warning("chr metric dropped due to partition gaps: %s (%s)", metric_id, e)
            dropped_metrics.append(metric_id)
            continue
        trend = classify_frame(valid, spec.direction).with_columns(
            metric_id = pl.lit(metric_id),
            direction = pl.lit(spec.direction),
        )
        trend_frames.append(trend)
        kept_metrics.append(metric_id)

    if not trend_frames:
        raise RuntimeError("CHR: no metric survived partition enforcement")

    long_yoy = yoy_change(
        long.filter(pl.col("metric_id").is_in(kept_metrics))
            .select("county_fips", "vintage", "value", "metric_id")
    )
    trend_df = pl.concat(trend_frames)

    prov = integrity.Provenance.stamp(
        dataset_id=DATASET_ID, cfg=cfg,
        publisher_vintage=str(VINTAGES[-1]),
        row_count=long_yoy.height,
        notes=(
            f"Vintages ingested: {sorted(set(VINTAGES) - set(failed_vintages))}. "
            f"Metrics kept: {kept_metrics}. Metrics dropped for partition gaps: "
            f"{dropped_metrics}. Failed vintages: {failed_vintages}."
        ),
    )
    warehouse.write(long_yoy, DATASET_ID, prov)

    trend_prov = integrity.Provenance.stamp(
        dataset_id=TREND_ID, cfg=cfg,
        publisher_vintage=str(VINTAGES[-1]),
        row_count=trend_df.height,
        notes="Per-county IMPROVING/STABLE/CONCERN classification across CHR curated metrics.",
    )
    warehouse.write(trend_df, TREND_ID, trend_prov)

    log.info(
        "chr refreshed: %d value rows across %d metrics, %d trend rows",
        long_yoy.height, len(kept_metrics), trend_df.height,
    )
    return warehouse.WAREHOUSE / f"{DATASET_ID}.parquet"
