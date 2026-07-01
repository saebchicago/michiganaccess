import { describe, it, expect } from "vitest";
import {
  CDC_PLACES_ZCTA_PROVENANCE,
  CDC_PLACES_MEASURES,
  CDC_PLACES_ZCTA_RECORDS,
  getPlacesForZcta,
  getPlacesMeasure,
} from "../cdc-places-zcta";
import { MI_ZCTA_CODES } from "../mi-zctas";

const EXPECTED_MEASURE_IDS = [
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
];

describe("cdc-places-zcta provenance", () => {
  it("carries the source name, dataset id, and Socrata rowsUpdated timestamp", () => {
    expect(CDC_PLACES_ZCTA_PROVENANCE.source_name).toMatch(/PLACES/);
    expect(CDC_PLACES_ZCTA_PROVENANCE.source_name).toMatch(/2025 release/);
    expect(CDC_PLACES_ZCTA_PROVENANCE.dataset_id).toBe("kee5-23sr");
    expect(CDC_PLACES_ZCTA_PROVENANCE.socrata_rows_updated_at).toMatch(
      /^\d{4}-\d{2}-\d{2}T/,
    );
  });

  it("declares MODELED as the value label", () => {
    expect(CDC_PLACES_ZCTA_PROVENANCE.value_label).toBe("MODELED");
  });

  it("carries a source URL that is https", () => {
    expect(CDC_PLACES_ZCTA_PROVENANCE.source_url).toMatch(/^https:\/\//);
    expect(CDC_PLACES_ZCTA_PROVENANCE.socrata_metadata_url).toMatch(
      /^https:\/\//,
    );
  });
});

describe("cdc-places-zcta measure catalog", () => {
  it("publishes exactly the 17 agreed measure ids", () => {
    const ids = CDC_PLACES_MEASURES.map((m) => m.id).sort();
    expect(ids).toEqual([...EXPECTED_MEASURE_IDS].sort());
    expect(CDC_PLACES_ZCTA_PROVENANCE.measure_count).toBe(17);
  });

  it("every measure has a category from the allowed set and a PLACES field", () => {
    const cats = new Set(["chronic", "behavioral", "preventive", "status"]);
    for (const m of CDC_PLACES_MEASURES) {
      expect(cats.has(m.category), m.id).toBe(true);
      expect(m.places_field).toMatch(/_CrudePrev$/);
      expect(m.value_label).toBe("MODELED");
    }
  });
});

describe("cdc-places-zcta records", () => {
  it("has one record per MI ZCTA in the registry", () => {
    expect(CDC_PLACES_ZCTA_RECORDS.length).toBe(MI_ZCTA_CODES.length);
    const seen = new Set<string>();
    for (const r of CDC_PLACES_ZCTA_RECORDS) {
      expect(seen.has(r.zcta5), `duplicate ${r.zcta5}`).toBe(false);
      seen.add(r.zcta5);
    }
    for (const code of MI_ZCTA_CODES) {
      expect(seen.has(code), `records missing ${code}`).toBe(true);
    }
  });

  it("every record carries all 17 measure ids (present or null)", () => {
    for (const r of CDC_PLACES_ZCTA_RECORDS) {
      for (const id of EXPECTED_MEASURE_IDS) {
        expect(r.measures[id], `${r.zcta5} missing ${id}`).toBeDefined();
      }
    }
  });

  it("crudePrevalence values are null or between 0 and 100", () => {
    for (const r of CDC_PLACES_ZCTA_RECORDS) {
      for (const id of EXPECTED_MEASURE_IDS) {
        const v = r.measures[id].crudePrevalence;
        if (v === null) continue;
        expect(v, `${r.zcta5} ${id}`).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(100);
      }
    }
  });

  it("ci95 low <= crudePrev <= high when all three are present", () => {
    for (const r of CDC_PLACES_ZCTA_RECORDS) {
      for (const id of EXPECTED_MEASURE_IDS) {
        const m = r.measures[id];
        if (m.crudePrevalence === null || m.ci95 === null) continue;
        expect(m.ci95.low, `${r.zcta5} ${id}`).toBeLessThanOrEqual(
          m.crudePrevalence,
        );
        expect(m.ci95.high).toBeGreaterThanOrEqual(m.crudePrevalence);
      }
    }
  });

  it("suppressed count matches the number of records with all-null measures", () => {
    let allNullCount = 0;
    for (const r of CDC_PLACES_ZCTA_RECORDS) {
      const anyPresent = EXPECTED_MEASURE_IDS.some(
        (id) => r.measures[id].crudePrevalence !== null,
      );
      if (!anyPresent) allNullCount++;
    }
    expect(allNullCount).toBe(
      CDC_PLACES_ZCTA_PROVENANCE.michigan_zctas_suppressed_by_source,
    );
  });

  it("getPlacesForZcta / getPlacesMeasure return real values for a known ZCTA", () => {
    const record = getPlacesForZcta("48201");
    expect(record).not.toBeNull();
    expect(record?.zcta5).toBe("48201");
    const diabetes = getPlacesMeasure("48201", "diabetes");
    expect(diabetes).not.toBeNull();
    if (diabetes && diabetes.crudePrevalence !== null) {
      expect(diabetes.crudePrevalence).toBeGreaterThan(0);
      expect(diabetes.crudePrevalence).toBeLessThan(50);
    }
    expect(getPlacesForZcta("99999")).toBeNull();
    expect(getPlacesMeasure("99999", "diabetes")).toBeNull();
  });
});
