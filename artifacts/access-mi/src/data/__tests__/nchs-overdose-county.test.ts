import { describe, it, expect } from "vitest";
import { MI_COUNTY_FIPS } from "../census-geographies";
import {
  OVERDOSE_COUNTY_PROVENANCE,
  OVERDOSE_COUNTY_RECORDS,
  OVERDOSE_IS_POPULATED,
  getOverdoseForCountyFips,
  getOverdoseForCountyName,
  overdosePeriodLabel,
} from "../nchs-overdose-county";

describe("nchs-overdose-county", () => {
  it("covers all 83 Michigan counties (partition even when pending-ci)", () => {
    expect(OVERDOSE_COUNTY_RECORDS).toHaveLength(83);
    expect(new Set(OVERDOSE_COUNTY_RECORDS.map((r) => r.countyFips)).size).toBe(83);
    for (const [name, threeDigit] of Object.entries(MI_COUNTY_FIPS)) {
      const record = getOverdoseForCountyFips(`26${threeDigit}`);
      expect(record, `missing record for ${name}`).not.toBeNull();
      expect(record?.countyName).toBe(name);
    }
  });

  it("provenance names NCHS VSRR, the Socrata dataset, and the suppression rule", () => {
    expect(OVERDOSE_COUNTY_PROVENANCE.source_name).toMatch(/NCHS.*Vital Statistics Rapid Release/i);
    expect(OVERDOSE_COUNTY_PROVENANCE.dataset_id).toBe("gb4e-yj24");
    expect(OVERDOSE_COUNTY_PROVENANCE.socrata_metadata_url).toBe(
      "https://data.cdc.gov/api/views/gb4e-yj24.json",
    );
    expect(OVERDOSE_COUNTY_PROVENANCE.notes).toMatch(/under 10/);
    expect(OVERDOSE_COUNTY_PROVENANCE.notes).toMatch(/provisional/i);
    expect(OVERDOSE_COUNTY_PROVENANCE.notes).toMatch(/No per-100k rate/);
  });

  it("label, populated flag, and per-row status agree", () => {
    if (OVERDOSE_IS_POPULATED) {
      expect(OVERDOSE_COUNTY_PROVENANCE.value_label).toBe("VERIFIED");
      expect(OVERDOSE_COUNTY_PROVENANCE.period_ending).toMatch(/^\d{4}-\d{2}$/);
      expect(OVERDOSE_COUNTY_PROVENANCE.dataset_title).toMatch(/overdose/i);
      expect(overdosePeriodLabel()).toMatch(/^12 months ending [A-Z][a-z]{2} \d{4}$/);
      for (const r of OVERDOSE_COUNTY_RECORDS) {
        expect(["populated", "suppressed"]).toContain(r.status);
        if (r.status === "populated") {
          expect(r.provisionalDeaths12mo).not.toBeNull();
          expect(Number.isInteger(r.provisionalDeaths12mo)).toBe(true);
          // NCHS publishes a true 0 for counties with no overdose deaths and
          // suppresses 1-9, so a published count is either 0 or >= 10.
          const n = r.provisionalDeaths12mo!;
          expect(n === 0 || n >= 10).toBe(true);
        } else {
          // Suppressed (1-9 deaths) is null, never 0.
          expect(r.provisionalDeaths12mo).toBeNull();
        }

      }
    } else {
      expect(OVERDOSE_COUNTY_PROVENANCE.value_label).toBe("PENDING");
      expect(OVERDOSE_COUNTY_PROVENANCE.pending_reason).toBeTruthy();
      expect(overdosePeriodLabel()).toBeNull();
      for (const r of OVERDOSE_COUNTY_RECORDS) {
        expect(r.status).toBe("pending-ci");
        expect(r.provisionalDeaths12mo).toBeNull();
      }
    }
  });

  it("never carries a zero where NCHS suppressed", () => {
    for (const r of OVERDOSE_COUNTY_RECORDS) {
      if (r.status === "suppressed") expect(r.provisionalDeaths12mo).toBeNull();
    }
  });

  it("resolves by FIPS and by name", () => {
    expect(getOverdoseForCountyFips("26163")?.countyName).toBe("Wayne");
    expect(getOverdoseForCountyName("Wayne County")?.countyFips).toBe("26163");
    expect(getOverdoseForCountyName("Not A County")).toBeNull();
  });
});
