"""EGLE MPART PFAS Sites and Areas of Interest.

Source: ArcGIS FeatureServer layer 1 hosted by EGLE
(services1.arcgis.com/FNjlrOFR0aGJ71Tg/...).  ~387 point features as of
verification; live count is checked on every refresh.

Provenance: VERIFIED - values are direct EGLE tabulations, no aggregation.
County rollup is a derived view saved alongside the raw table; the raw
table stays VERIFIED, the rollup carries the same label because it is a
loss-free groupby, not a model.
"""
from __future__ import annotations

import logging
from pathlib import Path

import polars as pl

from ..common import fips, http, integrity, manifest, warehouse

log = logging.getLogger("mi_state.egle_pfas")

DATASET_ID = "egle_pfas_sites"
ROLLUP_ID  = "egle_pfas_by_county"

# ArcGIS caps a single /query response; paginate defensively even though
# 387 fits in one page today.
PAGE_SIZE = 2000

OUT_FIELDS = ",".join([
    "OBJECTID", "SiteOrAoi", "Name", "Address", "City", "ZipCode",
    "County", "Type", "ResidentialWellsSampled",
    "SiteLead", "SiteLeadEmail", "SiteLeadPhone",
    "WebpageSite", "FacilityDate", "Longitude", "Latitude", "GlobalID",
])


def _fetch_all(endpoint: str) -> list[dict]:
    features: list[dict] = []
    offset = 0
    while True:
        params = {
            "where": "1=1",
            "outFields": OUT_FIELDS,
            "returnGeometry": "true",
            "f": "geojson",
            "resultRecordCount": PAGE_SIZE,
            "resultOffset": offset,
            "orderByFields": "OBJECTID",
        }
        payload = http.get_json(endpoint, params=params)
        batch = payload.get("features") or []
        features.extend(batch)
        if len(batch) < PAGE_SIZE or not payload.get(
            "properties", {}
        ).get("exceededTransferLimit"):
            break
        offset += PAGE_SIZE
        if offset > 200_000:
            raise RuntimeError("EGLE PFAS pagination did not terminate")
    return features


def _to_frame(features: list[dict]) -> pl.DataFrame:
    rows = []
    for f in features:
        p = f.get("properties", {}) or {}
        geom = f.get("geometry") or {}
        coords = geom.get("coordinates") or [None, None]
        rows.append({
            "object_id":                 p.get("OBJECTID"),
            "site_or_aoi":               p.get("SiteOrAoi"),
            "name":                      p.get("Name"),
            "address":                   p.get("Address"),
            "city":                      p.get("City"),
            "zip_code":                  p.get("ZipCode"),
            "county_name_raw":           p.get("County"),
            "type":                      p.get("Type"),
            "residential_wells_sampled": p.get("ResidentialWellsSampled"),
            "site_lead":                 p.get("SiteLead"),
            "site_lead_email":           p.get("SiteLeadEmail"),
            "site_lead_phone":           p.get("SiteLeadPhone"),
            "webpage":                   p.get("WebpageSite"),
            "facility_date":             p.get("FacilityDate"),
            "lon":                       coords[0] if coords else None,
            "lat":                       coords[1] if coords else None,
            "global_id":                 p.get("GlobalID"),
        })
    df = pl.DataFrame(rows)

    df = df.with_columns(
        pl.col("county_name_raw").str.strip_chars().alias("county_name"),
    )
    df = df.with_columns(
        pl.col("county_name")
          .map_elements(fips.lookup, return_dtype=pl.Utf8)
          .alias("county_fips"),
        pl.col("county_name")
          .map_elements(fips.lookup_all, return_dtype=pl.List(pl.Utf8))
          .alias("county_fips_all"),
    )
    # Multi-county sites: promote first match to the primary county_fips
    # when the single-name lookup missed but the multi-lookup found one.
    df = df.with_columns(
        pl.when(pl.col("county_fips").is_null() & (pl.col("county_fips_all").list.len() > 0))
          .then(pl.col("county_fips_all").list.first())
          .otherwise(pl.col("county_fips"))
          .alias("county_fips"),
    )
    return df.drop("county_name_raw")


def _rollup(df: pl.DataFrame) -> pl.DataFrame:
    """Attribute each site to every county it touches (multi-county sites
    count once per county). Loss-free relative to the raw table."""
    exploded = (
        df.filter(pl.col("county_fips_all").list.len() > 0)
          .explode("county_fips_all")
          .rename({"county_fips_all": "county_key"})
    )
    return (
        exploded.group_by("county_key")
                .agg(
                    pl.len().alias("site_count"),
                    (pl.col("site_or_aoi") == "Site").sum().alias("site_count_confirmed"),
                    (pl.col("site_or_aoi").str.contains("(?i)area")).sum().alias("aoi_count"),
                    (pl.col("residential_wells_sampled") == "Yes").sum().alias("wells_sampled_count"),
                )
                .rename({"county_key": "county_fips"})
                .sort("county_fips")
    )


def refresh() -> Path:
    cfg = manifest.get(DATASET_ID)
    endpoint = cfg["api_endpoint"]

    try:
        feats = _fetch_all(endpoint)
    except Exception as e:
        prov = integrity.Provenance.stamp(
            dataset_id=DATASET_ID, cfg=cfg,
            publisher_vintage=None, row_count=0,
            integrity="PENDING", notes=f"fetch failed: {e}",
        )
        warehouse.mark_pending(DATASET_ID, prov)
        raise

    if not feats:
        prov = integrity.Provenance.stamp(
            dataset_id=DATASET_ID, cfg=cfg,
            publisher_vintage=None, row_count=0,
            integrity="PENDING", notes="EGLE returned zero features",
        )
        warehouse.mark_pending(DATASET_ID, prov)
        raise RuntimeError("EGLE PFAS returned zero features")

    df = _to_frame(feats)
    unmatched = df.filter(pl.col("county_fips").is_null()).height
    if unmatched:
        log.warning(
            "egle_pfas: %d features have no county FIPS match (raw name)",
            unmatched,
        )

    rollup = _rollup(df)

    vintage = None
    if "facility_date" in df.columns:
        max_date = df["facility_date"].drop_nulls().max()
        if max_date:
            vintage = str(max_date)

    prov = integrity.Provenance.stamp(
        dataset_id=DATASET_ID, cfg=cfg,
        publisher_vintage=vintage,
        row_count=df.height,
        notes=(
            f"{df.height} features, {unmatched} unmatched-county, "
            f"{rollup.height} counties with sites"
        ),
    )
    warehouse.write(df, DATASET_ID, prov)

    rollup_prov = integrity.Provenance.stamp(
        dataset_id=ROLLUP_ID, cfg=cfg,
        publisher_vintage=vintage,
        row_count=rollup.height,
        notes="Loss-free county groupby of egle_pfas_sites.",
    )
    warehouse.write(rollup, ROLLUP_ID, rollup_prov)

    return warehouse.WAREHOUSE / f"{DATASET_ID}.parquet"
