import { describe, it, expect } from "vitest";
import { MI_COUNTY_FIPS } from "../census-geographies";
import {
  ACS_SDOH_COUNTY_PROVENANCE,
  ACS_SDOH_COUNTY_RECORDS,
  ACS_SDOH_IS_POPULATED,
  ACS_SDOH_MEASURES,
  getAcsSdohForCountyFips,
  getAcsSdohForCountyName,
  getAcsSdohValue,
} from "../acs-sdoh-county";

describe("acs-sdoh-county", () => {
  it("covers all 83 Michigan counties (partition even when pending-ci)", () => {
    expect(ACS_SDOH_COUNTY_RECORDS).toHaveLength(83);
    expect(new Set(ACS_SDOH_COUNTY_RECORDS.map((r) => r.countyFips)).size).toBe(83);
    for (const [name, threeDigit] of Object.entries(MI_COUNTY_FIPS)) {
      const record = getAcsSdohForCountyFips(`26${threeDigit}`);
      expect(record, `missing record for ${name}`).not.toBeNull();
      expect(record?.countyName).toBe(name);
    }
  });

  it("declares every measure with its Census variables and a VERIFIED label", () => {
    expect(ACS_SDOH_MEASURES.length).toBeGreaterThanOrEqual(10);
    expect(ACS_SDOH_COUNTY_PROVENANCE.measure_count).toBe(ACS_SDOH_MEASURES.length);
    expect(new Set(ACS_SDOH_MEASURES.map((m) => m.id)).size).toBe(ACS_SDOH_MEASURES.length);
    for (const m of ACS_SDOH_MEASURES) {
      expect(m.value_label).toBe("VERIFIED");
      expect(m.unit).toBe("percent");
      expect(m.numerator.length).toBeGreaterThan(0);
      expect(m.universe.length).toBeGreaterThan(0);
      for (const variable of [...m.numerator, ...m.universe, ...m.excluded]) {
        expect(variable).toMatch(/^[BC]\d{5}_\d{3}E$/);
      }
      for (const t of m.tables) {
        expect(ACS_SDOH_COUNTY_PROVENANCE.tables).toContain(t);
        expect(ACS_SDOH_COUNTY_PROVENANCE.table_urls[t]).toMatch(
          /^https:\/\/data\.census\.gov\/table\/ACSDT5Y\d{4}\./,
        );
      }
    }
  });

  it("every county carries a value slot for every measure", () => {
    const ids = ACS_SDOH_MEASURES.map((m) => m.id);
    for (const r of ACS_SDOH_COUNTY_RECORDS) {
      expect(Object.keys(r.values).sort()).toEqual([...ids].sort());
    }
  });

  it("carries a value_label consistent with the populated flag", () => {
    if (ACS_SDOH_IS_POPULATED) {
      expect(ACS_SDOH_COUNTY_PROVENANCE.value_label).toBe("VERIFIED");
      expect(ACS_SDOH_COUNTY_PROVENANCE.populated).toBe(true);
    } else {
      expect(ACS_SDOH_COUNTY_PROVENANCE.value_label).toBe("PENDING");
      expect(ACS_SDOH_COUNTY_PROVENANCE.populated).toBe(false);
      expect(ACS_SDOH_COUNTY_PROVENANCE.pending_reason).toMatch(/CENSUS_API_KEY|api\.census\.gov/);
    }
  });

  it("provenance names Census ACS 5-Year and a four-digit vintage window", () => {
    expect(ACS_SDOH_COUNTY_PROVENANCE.source_name).toMatch(/Census.*ACS.*5-Year/i);
    expect(ACS_SDOH_COUNTY_PROVENANCE.source_url).toMatch(/^https:\/\/www\.census\.gov\//);
    expect(ACS_SDOH_COUNTY_PROVENANCE.vintage_window).toMatch(/^\d{4}-\d{4}$/);
    expect(ACS_SDOH_COUNTY_PROVENANCE.dataset).toMatch(/^\d{4}\/acs\/acs5$/);
    expect(ACS_SDOH_COUNTY_PROVENANCE.notes).toMatch(/Margins of error are not propagated/);
  });

  it("populated rows keep every percent in [0, 100]; pending rows are all null", () => {
    for (const r of ACS_SDOH_COUNTY_RECORDS) {
      if (r.status === "populated") {
        for (const [id, val] of Object.entries(r.values)) {
          if (val === null) continue;
          expect(val, `${r.countyName} ${id}`).toBeGreaterThanOrEqual(0);
          expect(val, `${r.countyName} ${id}`).toBeLessThanOrEqual(100);
        }
        const nhs = r.values.noHsDiplomaPct;
        const ba = r.values.bachelorsPlusPct;
        if (nhs !== null && ba !== null) expect(nhs + ba).toBeLessThanOrEqual(100);
      } else {
        expect(r.status).toBe("pending-ci");
        for (const val of Object.values(r.values)) expect(val).toBeNull();
        expect(r.pendingReason).toBeTruthy();
      }
    }
    expect(ACS_SDOH_IS_POPULATED).toBe(
      ACS_SDOH_COUNTY_RECORDS.every((r) => r.status === "populated"),
    );
  });

  it("resolves by FIPS and by name and returns null while pending", () => {
    expect(getAcsSdohForCountyFips("26163")?.countyName).toBe("Wayne");
    expect(getAcsSdohForCountyName("Wayne County")?.countyFips).toBe("26163");
    expect(getAcsSdohForCountyName("Not A County")).toBeNull();
    const v = getAcsSdohValue("Wayne", "povertyPct");
    if (ACS_SDOH_IS_POPULATED) expect(v).not.toBeNull();
    else expect(v).toBeNull();
  });
});
