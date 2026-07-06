import { describe, it, expect } from "vitest";
import { MI_COUNTY_FIPS } from "../census-geographies";
import {
  ACS_BROADBAND_COUNTY_PROVENANCE,
  ACS_BROADBAND_COUNTY_RECORDS,
  ACS_BROADBAND_IS_POPULATED,
  getAcsBroadbandForCountyFips,
  getAcsBroadbandForCountyName,
} from "../acs-broadband-county";

describe("acs-broadband-county", () => {
  it("covers all 83 Michigan counties (partition even when pending-ci)", () => {
    expect(ACS_BROADBAND_COUNTY_RECORDS).toHaveLength(83);
    const fipsSet = new Set(
      ACS_BROADBAND_COUNTY_RECORDS.map((r) => r.countyFips),
    );
    expect(fipsSet.size).toBe(83);
    for (const [name, threeDigit] of Object.entries(MI_COUNTY_FIPS)) {
      const record = getAcsBroadbandForCountyFips(`26${threeDigit}`);
      expect(record, `missing record for ${name}`).not.toBeNull();
      expect(record?.countyName).toBe(name);
    }
  });

  it("labels every record status as one of the three known coverage states", () => {
    const valid = new Set(["populated", "pending-ci", "no-data"]);
    for (const r of ACS_BROADBAND_COUNTY_RECORDS) {
      expect(
        valid.has(r.status),
        `${r.countyName} has invalid status ${r.status}`,
      ).toBe(true);
    }
  });

  it("carries a value_label consistent with the populated flag", () => {
    // VERIFIED only when populated=true; PENDING when populated=false.
    if (ACS_BROADBAND_IS_POPULATED) {
      expect(ACS_BROADBAND_COUNTY_PROVENANCE.value_label).toBe("VERIFIED");
    } else {
      expect(ACS_BROADBAND_COUNTY_PROVENANCE.value_label).toBe("PENDING");
    }
  });

  it("provenance names Census ACS and cites the exact ACS table URL", () => {
    expect(ACS_BROADBAND_COUNTY_PROVENANCE.source_name).toMatch(
      /Census.*ACS.*5-Year/i,
    );
    expect(ACS_BROADBAND_COUNTY_PROVENANCE.source_url).toMatch(
      /^https:\/\/www\.census\.gov\//,
    );
    expect(ACS_BROADBAND_COUNTY_PROVENANCE.acs_table_url).toMatch(
      /^https:\/\/data\.census\.gov\/table\/ACSDT5Y\d{4}\.B28002$/,
    );
    expect(ACS_BROADBAND_COUNTY_PROVENANCE.numerator_variable).toBe(
      "B28002_007E",
    );
    expect(ACS_BROADBAND_COUNTY_PROVENANCE.universe_variable).toBe(
      "B28002_001E",
    );
    expect(ACS_BROADBAND_COUNTY_PROVENANCE.vintage_window).toMatch(
      /^\d{4}-\d{4}$/,
    );
  });

  it("provenance notes distinguish subscription (adoption) from FCC BDC (availability)", () => {
    expect(ACS_BROADBAND_COUNTY_PROVENANCE.notes).toMatch(/ADOPTION|adoption/);
    expect(ACS_BROADBAND_COUNTY_PROVENANCE.notes).toMatch(
      /AVAILABILITY|availability/,
    );
    expect(ACS_BROADBAND_COUNTY_PROVENANCE.notes).toMatch(/FCC BDC/);
  });

  it("populated flag matches per-record status", () => {
    if (ACS_BROADBAND_IS_POPULATED) {
      for (const r of ACS_BROADBAND_COUNTY_RECORDS) {
        expect(r.status).toBe("populated");
        expect(
          r.broadbandSubscriptionRate,
          `${r.countyName} rate null`,
        ).not.toBeNull();
        expect(r.broadbandSubscriptionRate!).toBeGreaterThanOrEqual(0);
        expect(r.broadbandSubscriptionRate!).toBeLessThanOrEqual(100);
      }
      expect(ACS_BROADBAND_COUNTY_PROVENANCE.populated).toBe(true);
    } else {
      for (const r of ACS_BROADBAND_COUNTY_RECORDS) {
        expect(r.status).toBe("pending-ci");
        expect(r.broadbandSubscriptionRate).toBeNull();
        expect(r.pendingReason).toMatch(/CENSUS_API_KEY/);
      }
      expect(ACS_BROADBAND_COUNTY_PROVENANCE.populated).toBe(false);
    }
  });

  it("resolves records by FIPS and by name", () => {
    expect(getAcsBroadbandForCountyFips("26163")?.countyName).toBe("Wayne");
    expect(getAcsBroadbandForCountyFips("26099")?.countyName).toBe("Macomb");
    expect(getAcsBroadbandForCountyFips("26999")).toBeNull();
    expect(getAcsBroadbandForCountyName("Wayne")?.countyFips).toBe("26163");
    expect(getAcsBroadbandForCountyName("Not A County")).toBeNull();
  });
});
