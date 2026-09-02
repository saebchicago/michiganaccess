import { describe, it, expect } from "vitest";
import { MI_COUNTY_FIPS } from "../census-geographies";
import {
  SVI_COUNTY_PROVENANCE,
  SVI_COUNTY_RECORDS,
  SVI_INPUTS,
  SVI_IS_POPULATED,
  SVI_THEMES,
  getSviForCountyFips,
  getSviForCountyName,
  getSviOverallPercentile,
} from "../cdc-svi-county";

describe("cdc-svi-county", () => {
  it("covers all 83 Michigan counties (partition even when pending-ci)", () => {
    expect(SVI_COUNTY_RECORDS).toHaveLength(83);
    expect(new Set(SVI_COUNTY_RECORDS.map((r) => r.countyFips)).size).toBe(83);
    for (const [name, threeDigit] of Object.entries(MI_COUNTY_FIPS)) {
      const record = getSviForCountyFips(`26${threeDigit}`);
      expect(record, `missing record for ${name}`).not.toBeNull();
      expect(record?.countyName).toBe(name);
    }
  });

  it("declares five themes and sixteen ATSDR inputs, all MODELED", () => {
    expect(SVI_THEMES.map((t) => t.id)).toEqual([
      "overall",
      "socioeconomic",
      "householdCharacteristics",
      "racialEthnicMinority",
      "housingTransportation",
    ]);
    expect(SVI_INPUTS).toHaveLength(16);
    for (const t of [...SVI_THEMES, ...SVI_INPUTS]) {
      expect(t.value_label).toBe("MODELED");
      expect(t.column).toMatch(/^(RPL_THEME|EP_)/);
    }
    for (const r of SVI_COUNTY_RECORDS) {
      expect(Object.keys(r.themes).sort()).toEqual(SVI_THEMES.map((t) => t.id).sort());
      expect(Object.keys(r.inputs).sort()).toEqual(SVI_INPUTS.map((i) => i.id).sort());
    }
  });

  it("label and populated flag agree; ranks stay in [0,1] and inputs in [0,100]", () => {
    if (SVI_IS_POPULATED) {
      expect(SVI_COUNTY_PROVENANCE.value_label).toBe("MODELED");
      expect(SVI_COUNTY_PROVENANCE.svi_year).toBeGreaterThanOrEqual(2020);
      expect(SVI_COUNTY_PROVENANCE.csv_sha256).toMatch(/^[0-9a-f]{64}$/);
      for (const r of SVI_COUNTY_RECORDS) {
        expect(r.status).toBe("populated");
        for (const v of Object.values(r.themes)) {
          if (v === null) continue;
          expect(v).toBeGreaterThanOrEqual(0);
          expect(v).toBeLessThanOrEqual(1);
        }
        for (const v of Object.values(r.inputs)) {
          if (v === null) continue;
          expect(v).toBeGreaterThanOrEqual(0);
          expect(v).toBeLessThanOrEqual(100);
        }
      }
      expect(getSviOverallPercentile("Wayne")).not.toBeNull();
    } else {
      expect(SVI_COUNTY_PROVENANCE.value_label).toBe("PENDING");
      expect(SVI_COUNTY_PROVENANCE.pending_reason).toBeTruthy();
      for (const r of SVI_COUNTY_RECORDS) {
        expect(r.status).toBe("pending-ci");
        for (const v of Object.values(r.themes)) expect(v).toBeNull();
        for (const v of Object.values(r.inputs)) expect(v).toBeNull();
      }
      expect(getSviOverallPercentile("Wayne")).toBeNull();
    }
  });

  it("provenance names ATSDR SVI, the ranking universe, and the -999 rule", () => {
    expect(SVI_COUNTY_PROVENANCE.source_name).toMatch(/ATSDR.*Social Vulnerability/i);
    expect(SVI_COUNTY_PROVENANCE.source_url).toMatch(/^https:\/\/www\.atsdr\.cdc\.gov\//);
    expect(SVI_COUNTY_PROVENANCE.ranking_universe).toMatch(/United States counties/);
    expect(SVI_COUNTY_PROVENANCE.notes).toMatch(/-999/);
    expect(SVI_COUNTY_PROVENANCE.notes).toMatch(/MODELED/);
  });

  it("resolves by FIPS and by name", () => {
    expect(getSviForCountyFips("26163")?.countyName).toBe("Wayne");
    expect(getSviForCountyName("Wayne County")?.countyFips).toBe("26163");
    expect(getSviForCountyName("Not A County")).toBeNull();
  });
});
