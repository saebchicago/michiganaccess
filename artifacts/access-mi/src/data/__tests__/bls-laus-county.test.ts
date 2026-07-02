import { describe, it, expect } from "vitest";
import { MI_COUNTY_FIPS } from "../census-geographies";
import {
  BLS_LAUS_COUNTY_PROVENANCE,
  BLS_LAUS_COUNTY_RECORDS,
  BLS_LAUS_IS_POPULATED,
  getBlsLausForCountyFips,
  getBlsLausForCountyName,
} from "../bls-laus-county";

describe("bls-laus-county", () => {
  it("covers all 83 Michigan counties (partition preserved even when pending-ci)", () => {
    expect(BLS_LAUS_COUNTY_RECORDS).toHaveLength(83);
    const fipsSet = new Set(BLS_LAUS_COUNTY_RECORDS.map((r) => r.countyFips));
    expect(fipsSet.size).toBe(83);
    for (const [name, threeDigit] of Object.entries(MI_COUNTY_FIPS)) {
      const record = getBlsLausForCountyFips(`26${threeDigit}`);
      expect(record, `missing record for ${name}`).not.toBeNull();
      expect(record?.countyName).toBe(name);
    }
  });

  it("labels the dataset VERIFIED", () => {
    expect(BLS_LAUS_COUNTY_PROVENANCE.value_label).toBe("VERIFIED");
  });

  it("cites BLS as source and BLS Public API as access mechanism", () => {
    expect(BLS_LAUS_COUNTY_PROVENANCE.source_name).toMatch(
      /Bureau of Labor Statistics/,
    );
    expect(BLS_LAUS_COUNTY_PROVENANCE.source_url).toMatch(
      /^https:\/\/www\.bls\.gov\/lau/,
    );
    expect(BLS_LAUS_COUNTY_PROVENANCE.access_mechanism).toMatch(
      /BLS Public API/,
    );
    expect(BLS_LAUS_COUNTY_PROVENANCE.api_url).toMatch(
      /^https:\/\/api\.bls\.gov\//,
    );
  });

  it("every series id follows the LAUS county 20-char scheme", () => {
    for (const r of BLS_LAUS_COUNTY_RECORDS) {
      expect(r.seriesId, `${r.countyName} bad series id ${r.seriesId}`).toMatch(
        /^LAUCN26\d{3}00000000\d{2}$/,
      );
      expect(r.seriesId.length).toBe(20);
    }
  });

  it("populated flag matches per-record status", () => {
    if (BLS_LAUS_IS_POPULATED) {
      for (const r of BLS_LAUS_COUNTY_RECORDS) {
        expect(r.status).toBe("populated");
        expect(r.unemploymentRate, `${r.countyName} rate null`).not.toBeNull();
        expect(r.unemploymentRate!).toBeGreaterThanOrEqual(0);
        expect(r.unemploymentRate!).toBeLessThanOrEqual(40);
        expect(r.latestPeriodMonth).not.toBeNull();
        expect(r.latestPeriodMonth!).toBeGreaterThanOrEqual(1);
        expect(r.latestPeriodMonth!).toBeLessThanOrEqual(12);
      }
      expect(BLS_LAUS_COUNTY_PROVENANCE.populated).toBe(true);
      expect(BLS_LAUS_COUNTY_PROVENANCE.latest_vintage).not.toBeNull();
    } else {
      for (const r of BLS_LAUS_COUNTY_RECORDS) {
        expect(r.status).toBe("pending-ci");
        expect(r.unemploymentRate).toBeNull();
        expect(r.pendingReason).not.toBeNull();
      }
      expect(BLS_LAUS_COUNTY_PROVENANCE.populated).toBe(false);
    }
  });

  it("carries the BLS-published Preliminary or revised flag verbatim", () => {
    if (!BLS_LAUS_IS_POPULATED) return;
    // At least one county in a fresh BLS release should carry the "P"
    // footnote for the newest month (BLS marks the most recent monthly
    // rollup Preliminary until the next release).
    const anyPreliminary = BLS_LAUS_COUNTY_RECORDS.some(
      (r) => r.preliminary === true,
    );
    expect(
      anyPreliminary,
      "no county carries the Preliminary flag - schema drift?",
    ).toBe(true);
    // The dataset-level vintage string should reflect the flag.
    expect(BLS_LAUS_COUNTY_PROVENANCE.latest_vintage).toMatch(
      /Preliminary|revised/i,
    );
  });

  it("resolves records by FIPS and by name", () => {
    expect(getBlsLausForCountyFips("26163")?.countyName).toBe("Wayne");
    expect(getBlsLausForCountyFips("26099")?.countyName).toBe("Macomb");
    expect(getBlsLausForCountyFips("26999")).toBeNull();
    expect(getBlsLausForCountyName("Wayne")?.countyFips).toBe("26163");
    expect(getBlsLausForCountyName("Not A County")).toBeNull();
  });
});
