"""Time-series harmonization primitives for annual + ACS-5yr datasets.

Every trend surfaced in the AccessMI UI flows through these helpers so
we guarantee: (1) a full 83-county partition per vintage, (2) explicit
vintage/gap labeling that respects the trendSeries.v1 non-overlap rule,
and (3) a trend classification vocabulary the React IntegrityBadge layer
can consume without duplicating logic.

Classification vocabulary:
  IMPROVING     - first->last change beyond STABLE_BAND_PCT, in the
                  publisher's better direction.
  STABLE        - within +/-STABLE_BAND_PCT relative change over window.
  CONCERN       - moved beyond STABLE_BAND_PCT in the worse direction.
  INSUFFICIENT  - < MIN_VINTAGES observed points; do not label.

We deliberately avoid a "worsening" label and never map CONCERN to red
downstream; the goal is signal without alarm.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

import polars as pl

from . import fips

Direction   = Literal["down_is_better", "up_is_better", "neutral"]
TrendLabel  = Literal["IMPROVING", "STABLE", "CONCERN", "INSUFFICIENT"]
VintageKind = Literal["annual", "acs5"]

STABLE_BAND_PCT = 2.0
MIN_VINTAGES    = 3


@dataclass(frozen=True)
class MetricSpec:
    metric_id: str
    display: str
    unit: str
    direction: Direction
    source_name: str
    source_url: str
    integrity: Literal["VERIFIED", "MODELED", "PROJECTED"]
    vintage_kind: VintageKind
    valid_min: float
    valid_max: float


def classify(vintages: list[int], values: list[float | None], direction: Direction) -> TrendLabel:
    pairs = [(v, x) for v, x in zip(vintages, values) if x is not None]
    if len(pairs) < MIN_VINTAGES:
        return "INSUFFICIENT"
    pairs.sort(key=lambda p: p[0])
    first_v = pairs[0][1]
    last_v  = pairs[-1][1]
    if first_v == 0:
        return "STABLE"
    pct = ((last_v - first_v) / first_v) * 100.0
    if abs(pct) < STABLE_BAND_PCT:
        return "STABLE"
    improved = (pct < 0) if direction == "down_is_better" else (pct > 0)
    if direction == "neutral":
        return "STABLE"
    return "IMPROVING" if improved else "CONCERN"


def slope_per_year(vintages: list[int], values: list[float | None]) -> float | None:
    pairs = [(float(v), float(x)) for v, x in zip(vintages, values) if x is not None]
    if len(pairs) < 2:
        return None
    n = len(pairs)
    x_mean = sum(p[0] for p in pairs) / n
    y_mean = sum(p[1] for p in pairs) / n
    num = sum((p[0] - x_mean) * (p[1] - y_mean) for p in pairs)
    den = sum((p[0] - x_mean) ** 2 for p in pairs)
    if den == 0:
        return None
    return num / den


def yoy_change(df: pl.DataFrame) -> pl.DataFrame:
    """Add yoy_abs + yoy_pct to a (county_fips, vintage, value) frame.

    Divides by the gap between vintages so ACS-5yr pairs report per-year
    change, not per-window change.
    """
    return (
        df.sort(["county_fips", "vintage"])
        .with_columns(
            _prev = pl.col("value").shift(1).over("county_fips"),
            _gap  = (pl.col("vintage") - pl.col("vintage").shift(1)).over("county_fips"),
        )
        .with_columns(
            yoy_abs = pl.when(pl.col("_gap") > 0)
                       .then((pl.col("value") - pl.col("_prev")) / pl.col("_gap"))
                       .otherwise(None),
            yoy_pct = pl.when((pl.col("_gap") > 0) & (pl.col("_prev") != 0))
                       .then(((pl.col("value") - pl.col("_prev")) / pl.col("_prev") * 100.0)
                             / pl.col("_gap"))
                       .otherwise(None),
        )
        .drop(["_prev", "_gap"])
    )


def enforce_partition(df: pl.DataFrame, spec: MetricSpec) -> pl.DataFrame:
    """Reject out-of-range values; assert every vintage has all 83 counties.

    Follows the trendSeries.v1 provenance rule: incomplete partitions are
    a build failure, not a silent hole.
    """
    valid = df.filter(
        pl.col("value").is_null()
        | ((pl.col("value") >= spec.valid_min) & (pl.col("value") <= spec.valid_max))
    )
    expected = len(fips.all_fips())
    per_vintage = (
        valid.group_by("vintage")
        .agg(pl.col("county_fips").n_unique().alias("n"))
        .sort("vintage")
    )
    incomplete = per_vintage.filter(pl.col("n") != expected)
    if incomplete.height:
        raise ValueError(
            f"{spec.metric_id}: incomplete county partition. "
            f"Expected {expected} per vintage. Got: "
            f"{incomplete.to_dicts()}"
        )
    return valid


def classify_frame(df: pl.DataFrame, direction: Direction) -> pl.DataFrame:
    """Per-county trend rollup from a long (county_fips, vintage, value) frame."""
    rows: list[dict] = []
    for county_fips, sub in df.sort("vintage").group_by("county_fips", maintain_order=True):
        vs = sub["vintage"].to_list()
        xs = sub["value"].to_list()
        rows.append({
            "county_fips":    county_fips[0] if isinstance(county_fips, tuple) else county_fips,
            "classification": classify(vs, xs, direction),
            "slope_per_year": slope_per_year(vs, xs),
            "first_vintage":  min((v for v, x in zip(vs, xs) if x is not None), default=None),
            "last_vintage":   max((v for v, x in zip(vs, xs) if x is not None), default=None),
            "first_value":    next((x for v, x in sorted(zip(vs, xs)) if x is not None), None),
            "last_value":     next((x for v, x in sorted(zip(vs, xs), reverse=True) if x is not None), None),
        })
    return pl.DataFrame(rows)
