#!/usr/bin/env python3
"""Rebuild alice-county.generated.json from the official United For ALICE xlsx."""
from __future__ import annotations

import json
import sys
from pathlib import Path

try:
    import pandas as pd
except ImportError:
    sys.exit("pandas is required: pip install pandas openpyxl")

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src" / "data" / "alice-county.generated.json"
DEFAULT_XLSX = Path("/home/workdir/artifacts/2026-ALICE-Michigan-Data-Sheet.xlsx")

SOURCE = (
    "United For ALICE / United Way ALICE Michigan Data Sheet 2026 "
    "(data year 2024); ALICE Threshold 2024; ACS 2024"
)


def metrics(r):
    hh = int(r["Households"])
    pov = int(r["Poverty Households"])
    alice = int(r["ALICE Households"])
    above = int(r["Above ALICE Households"])
    return {
        "year": int(r["Year"]),
        "households": hh,
        "povertyHouseholds": pov,
        "aliceHouseholds": alice,
        "aboveAliceHouseholds": above,
        "povertyPct": round(pov / hh * 100, 1),
        "alicePct": round(alice / hh * 100, 1),
        "belowAliceThresholdPct": round((pov + alice) / hh * 100, 1),
        "thresholdUnder65": int(r["ALICE Threshold - HH under 65"]),
        "threshold65plus": int(r["ALICE Threshold - HH 65 years and over"]),
        "acsEstimate": str(r["acs_estimate"]),
    }


def main():
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_XLSX
    if not src.exists():
        sys.exit(f"missing workbook: {src}")
    df = pd.read_excel(src, sheet_name="County", header=0)
    df.columns = [c.strip() for c in df.columns]
    df = df.rename(columns={df.columns[-1]: "acs_estimate"})
    latest = df[df["Year"] == 2024].copy().sort_values("County")
    if len(latest) != 83:
        sys.exit(f"expected 83 counties, got {len(latest)}")
    counties = []
    for _, r in latest.iterrows():
        name = str(r["County"])
        m = metrics(r)
        # History is available in the workbook but omitted from the shipped
        # JSON so the frontend bundle stays small. aliceData.ts keeps history
        # optional on the record type.
        counties.append(
            {
                "countyFips": str(int(r["GEO.id2"])),
                "countyName": name,
                **m,
                "value_label": "MODELED",
                "source": SOURCE,
            }
        )
    hh = int(latest["Households"].sum())
    pov = int(latest["Poverty Households"].sum())
    alice = int(latest["ALICE Households"].sum())
    above = int(latest["Above ALICE Households"].sum())
    payload = {
        "provenance": {
            "source_name": "United For ALICE Michigan Data Sheet 2026",
            "source_url": "https://www.unitedforalice.org/michigan",
            "data_sheet_url": "https://www.unitedforalice.org/Attachments/StateDataSheet/2026%20ALICE%20-%20Michigan%20Data%20Sheet.xlsx",
            "report_url": "https://www.unitedforalice.org/Attachments/AllReports/state-of-alice-report-michigan-2026.pdf",
            "methodology_url": "https://www.unitedforalice.org/methodology",
            "publisher": "United For ALICE / Michigan Association of United Ways",
            "data_year": 2024,
            "report_year": 2026,
            "ingested_at": "2026-08-30",
            "ingest_script": "scripts/refresh-alice-county.py",
            "michigan_county_registry_size": 83,
            "value_label": "MODELED",
            "notes": "See aliceData.ts header. Classification is MODELED.",
        },
        "statewide": {
            "countyFips": "26000",
            "countyName": "Michigan (Statewide)",
            "year": 2024,
            "households": hh,
            "povertyHouseholds": pov,
            "aliceHouseholds": alice,
            "aboveAliceHouseholds": above,
            "povertyPct": 13.4,
            "alicePct": 26.3,
            "belowAliceThresholdPct": 39.7,
            "survivalBudgetSingleAdult": 29580,
            "survivalBudgetFamilyOfFour": 78216,
            "federalPovertyLevelSingleAdult": 15060,
            "federalPovertyLevelFamilyOfFour": 31200,
            "value_label": "MODELED",
            "source": SOURCE,
            "reportRoundingNote": "United For ALICE rounds 39.7% below-threshold to 40% in the 2026 report.",
        },
        "counties": counties,
    }
    OUT.write_text(json.dumps(payload, indent=2) + "\n")
    print(f"wrote {OUT} ({len(counties)} counties)")


if __name__ == "__main__":
    main()
