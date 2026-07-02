import { describe, it, expect } from "vitest";
import { MI_COUNTY_FIPS } from "../census-geographies";
import {
  CDC_PLACES_COUNTY_PROVENANCE,
  CDC_PLACES_COUNTY_MEASURES,
  CDC_PLACES_COUNTY_RECORDS,
  getPlacesForCountyFips,
  getPlacesForCountyName,
  getPlacesCountyMeasure,
} from "../cdc-places-county";

describe("cdc-places-county", () => {
  it("covers all 83 Michigan counties", () => {
    expect(CDC_PLACES_COUNTY_RECORDS).toHaveLength(83);
    const fipsSet = new Set(CDC_PLACES_COUNTY_RECORDS.map((r) => r.countyFips));
    expect(fipsSet.size).toBe(83);
    for (const [name, threeDigit] of Object.entries(MI_COUNTY_FIPS)) {
      const fips = `26${threeDigit}`;
      const record = getPlacesForCountyFips(fips);
      expect(
        record,
        `missing PLACES record for ${name} (${fips})`,
      ).not.toBeNull();
      expect(record?.countyName).toBe(name);
    }
  });

  it("carries the 17 platform-stable measure ids", () => {
    expect(CDC_PLACES_COUNTY_MEASURES).toHaveLength(17);
    const ids = new Set(CDC_PLACES_COUNTY_MEASURES.map((m) => m.id));
    for (const expected of [
      "diabetes",
      "obesity",
      "highBloodPressure",
      "copd",
      "coronaryHeartDisease",
      "currentSmoking",
      "bingeDrinking",
      "noLeisurePA",
      "shortSleep",
      "routineCheckup",
      "dentalVisit",
      "mammogram",
      "colonScreening",
      "cholesterolScreen",
      "mentalHealthNotGood",
      "physicalHealthNotGood",
      "generalHealthFairPoor",
    ]) {
      expect(ids.has(expected), `missing measure ${expected}`).toBe(true);
    }
  });

  it("every county carries a diabetes value in [0, 100]", () => {
    for (const r of CDC_PLACES_COUNTY_RECORDS) {
      const v = r.measures.diabetes?.crudePrevalence;
      expect(v, `${r.countyName} has null diabetes`).not.toBeNull();
      expect(v!).toBeGreaterThanOrEqual(0);
      expect(v!).toBeLessThanOrEqual(100);
    }
  });

  it("every non-null crude prevalence lies in [0, 100]", () => {
    for (const r of CDC_PLACES_COUNTY_RECORDS) {
      for (const [id, v] of Object.entries(r.measures)) {
        if (v.crudePrevalence === null) continue;
        expect(
          v.crudePrevalence,
          `${r.countyName} ${id} out of range`,
        ).toBeGreaterThanOrEqual(0);
        expect(v.crudePrevalence).toBeLessThanOrEqual(100);
      }
    }
  });

  it("preserves 95% CI as low_high when the source publishes it", () => {
    const wayne = getPlacesForCountyName("Wayne");
    expect(wayne).not.toBeNull();
    const diabetesCi = wayne!.measures.diabetes.ci95;
    expect(diabetesCi).not.toBeNull();
    expect(diabetesCi!.low).toBeLessThanOrEqual(diabetesCi!.high);
  });

  it("labels every measure MODELED", () => {
    for (const m of CDC_PLACES_COUNTY_MEASURES) {
      expect(m.value_label).toBe("MODELED");
    }
    expect(CDC_PLACES_COUNTY_PROVENANCE.value_label).toBe("MODELED");
  });

  it("provenance names CDC PLACES County 2025 with a data.cdc.gov URL", () => {
    expect(CDC_PLACES_COUNTY_PROVENANCE.source_name).toMatch(/CDC PLACES/);
    expect(CDC_PLACES_COUNTY_PROVENANCE.source_name).toMatch(/2025 release/);
    expect(CDC_PLACES_COUNTY_PROVENANCE.source_url).toMatch(
      /^https:\/\/data\.cdc\.gov\//,
    );
    expect(CDC_PLACES_COUNTY_PROVENANCE.dataset_id).toBe("swc5-untb");
    expect(CDC_PLACES_COUNTY_PROVENANCE.socrata_rows_updated_at).toMatch(
      /^\d{4}-\d{2}-\d{2}T/,
    );
  });

  it("documents the MRP methodology in the notes", () => {
    expect(CDC_PLACES_COUNTY_PROVENANCE.notes).toMatch(
      /multilevel regression and poststratification/,
    );
    expect(CDC_PLACES_COUNTY_PROVENANCE.notes).toMatch(/BRFSS/);
  });

  it("resolves county records by FIPS and by name", () => {
    expect(getPlacesForCountyFips("26163")?.countyName).toBe("Wayne");
    expect(getPlacesForCountyFips("26099")?.countyName).toBe("Macomb");
    expect(getPlacesForCountyFips("26999")).toBeNull();
    expect(getPlacesForCountyName("Wayne")?.countyFips).toBe("26163");
    expect(getPlacesForCountyName("Not A County")).toBeNull();
  });

  it("resolves a single measure at a county via getPlacesCountyMeasure", () => {
    const obesity = getPlacesCountyMeasure("26163", "obesity");
    expect(obesity).not.toBeNull();
    expect(obesity!.crudePrevalence).not.toBeNull();
    expect(getPlacesCountyMeasure("26999", "obesity")).toBeNull();
    const record = getPlacesForCountyFips("26163");
    expect(getPlacesCountyMeasure("26163", "not_a_measure")).toBeUndefined;
    expect(record!.measures.not_a_measure).toBeUndefined();
  });
});
