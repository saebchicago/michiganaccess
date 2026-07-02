import { describe, it, expect } from "vitest";
import { MI_COUNTY_FIPS } from "../census-geographies";
import {
  HRSA_HPSA_COUNTY_PROVENANCE,
  HRSA_HPSA_COUNTY_RECORDS,
  getHpsaForCountyFips,
  getHpsaForCountyName,
  type HpsaDisciplineId,
} from "../hrsa-hpsa-county";

const DISCIPLINES: HpsaDisciplineId[] = ["primaryCare", "dental", "mental"];

describe("hrsa-hpsa-county", () => {
  it("covers all 83 Michigan counties (partition, incl. zero-designation counties)", () => {
    expect(HRSA_HPSA_COUNTY_RECORDS).toHaveLength(83);
    const fipsSet = new Set(HRSA_HPSA_COUNTY_RECORDS.map((r) => r.countyFips));
    expect(fipsSet.size).toBe(83);
    for (const [name, threeDigit] of Object.entries(MI_COUNTY_FIPS)) {
      const record = getHpsaForCountyFips(`26${threeDigit}`);
      expect(record, `missing HPSA record for ${name}`).not.toBeNull();
      expect(record?.countyName).toBe(name);
    }
  });

  it("every county has all three disciplines populated (0/null when no HPSAs)", () => {
    for (const r of HRSA_HPSA_COUNTY_RECORDS) {
      for (const d of DISCIPLINES) {
        const m = r.disciplines[d];
        expect(m, `${r.countyName} missing ${d}`).toBeDefined();
        expect(m.designatedHpsas).toBeGreaterThanOrEqual(0);
        if (m.designatedHpsas === 0) {
          expect(m.maxHpsaScore).toBeNull();
        } else {
          expect(m.maxHpsaScore).not.toBeNull();
          expect(m.maxHpsaScore!).toBeGreaterThanOrEqual(0);
          expect(m.maxHpsaScore!).toBeLessThanOrEqual(26);
        }
      }
    }
  });

  it("at least one MI county carries a Designated HPSA in each discipline", () => {
    for (const d of DISCIPLINES) {
      const n = HRSA_HPSA_COUNTY_RECORDS.filter(
        (r) => r.disciplines[d].designatedHpsas > 0,
      ).length;
      expect(
        n,
        `no MI county carries a Designated ${d} HPSA - filter or schema drift`,
      ).toBeGreaterThan(0);
    }
  });

  it("labels the rollup MODELED and documents the sub-county nature in notes", () => {
    expect(HRSA_HPSA_COUNTY_PROVENANCE.value_label).toBe("MODELED");
    expect(HRSA_HPSA_COUNTY_PROVENANCE.notes).toMatch(/sub-county/);
    expect(HRSA_HPSA_COUNTY_PROVENANCE.notes).toMatch(/aggregation/i);
    expect(HRSA_HPSA_COUNTY_PROVENANCE.rollup_method).toMatch(/Designated/);
  });

  it("provenance carries a per-discipline vintage read from the HRSA DW create date", () => {
    expect(HRSA_HPSA_COUNTY_PROVENANCE.per_discipline).toHaveLength(3);
    for (const v of HRSA_HPSA_COUNTY_PROVENANCE.per_discipline) {
      expect(v.dwCreateDate).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
      expect(v.file).toMatch(/^BCD_HPSA_FCT_DET_(PC|DH|MH)\.csv$/);
      expect(v.miDesignatedHpsas).toBeGreaterThan(0);
    }
  });

  it("names data.hrsa.gov as the source", () => {
    expect(HRSA_HPSA_COUNTY_PROVENANCE.source_url).toMatch(
      /^https:\/\/data\.hrsa\.gov\//,
    );
    expect(HRSA_HPSA_COUNTY_PROVENANCE.download_base_url).toMatch(
      /^https:\/\/data\.hrsa\.gov\//,
    );
  });

  it("Wayne County carries all three disciplines with non-zero designations", () => {
    const wayne = getHpsaForCountyName("Wayne");
    expect(wayne).not.toBeNull();
    for (const d of DISCIPLINES) {
      expect(
        wayne!.disciplines[d].designatedHpsas,
        `Wayne has zero ${d} HPSAs`,
      ).toBeGreaterThan(0);
    }
  });

  it("resolves records by FIPS and by name", () => {
    expect(getHpsaForCountyFips("26163")?.countyName).toBe("Wayne");
    expect(getHpsaForCountyFips("26099")?.countyName).toBe("Macomb");
    expect(getHpsaForCountyFips("26999")).toBeNull();
    expect(getHpsaForCountyName("Wayne")?.countyFips).toBe("26163");
    expect(getHpsaForCountyName("Not A County")).toBeNull();
  });

  it("providerFte and shortageFte are non-negative finite numbers", () => {
    for (const r of HRSA_HPSA_COUNTY_RECORDS) {
      for (const d of DISCIPLINES) {
        const m = r.disciplines[d];
        expect(Number.isFinite(m.providerFte)).toBe(true);
        expect(m.providerFte).toBeGreaterThanOrEqual(0);
        expect(Number.isFinite(m.shortageFte)).toBe(true);
        expect(m.shortageFte).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
