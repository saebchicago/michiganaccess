import { describe, it, expect } from "vitest";
import {
  CDC_PLACES_ZCTA_PROVENANCE,
  CDC_PLACES_MEASURES,
  CDC_PLACES_ZCTA_RECORDS,
  getPlacesForZcta,
  getPlacesMeasure,
} from "../cdc-places-zcta";
import { MI_ZCTA_CODES } from "../mi-zctas";
import { ROUTE_META } from "@/config/routeMeta";

/**
 * The measure catalog is owned by the ingest pipeline (mi-federal-data's
 * MEASURES, written into the generated JSON by
 * scripts/refresh-cdc-places-zcta.mjs), so this suite derives the id list
 * from the dataset instead of pinning it: the 2026-08-18 scheduled refresh
 * expanded the catalog from 17 to 40 measures (the count the platform's
 * copy had claimed all along) and the old hardcoded pin turned that
 * legitimate refresh into a red main. What stays pinned:
 *  - CORE_MEASURE_IDS: the original 17 measures existing pages rely on.
 *    A refresh that DROPS one of these still fails loudly.
 *  - The category vocabulary, closed below.
 *  - The routeMeta copy anchor: the "N ... measures" figure in the
 *    /zip-intelligence prerender copy must equal the live catalog length.
 */
const CORE_MEASURE_IDS = [
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

const CATALOG_MEASURE_IDS = CDC_PLACES_MEASURES.map((m) => m.id);

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
  it("still publishes every core measure id", () => {
    const ids = new Set(CATALOG_MEASURE_IDS);
    for (const id of CORE_MEASURE_IDS) {
      expect(ids.has(id), `core measure ${id} dropped from the catalog`).toBe(
        true,
      );
    }
  });

  it("ids are unique and measure_count matches the catalog", () => {
    expect(new Set(CATALOG_MEASURE_IDS).size).toBe(CATALOG_MEASURE_IDS.length);
    expect(CDC_PLACES_ZCTA_PROVENANCE.measure_count).toBe(
      CATALOG_MEASURE_IDS.length,
    );
    expect(CATALOG_MEASURE_IDS.length).toBeGreaterThanOrEqual(
      CORE_MEASURE_IDS.length,
    );
  });

  it("every measure has a category from the allowed set and a PLACES field", () => {
    const cats = new Set([
      "chronic",
      "behavioral",
      "preventive",
      "status",
      "access",
      "disability",
      "sdoh",
    ]);
    for (const m of CDC_PLACES_MEASURES) {
      expect(cats.has(m.category), `${m.id}: unknown category ${m.category}`).toBe(true);
      expect(m.places_field).toMatch(/_CrudePrev$/);
      expect(m.value_label).toBe("MODELED");
    }
  });

  it("the /zip-intelligence copy claims exactly the catalog's measure count", () => {
    // Claims-anchor rule: a rendered number needs a live source. The
    // prerender copy for /zip-intelligence advertises the measure count;
    // if the catalog grows or shrinks again, this fails until the copy
    // is updated with it.
    const meta = ROUTE_META.find((r) => r.path === "/zip-intelligence");
    expect(meta, "/zip-intelligence routeMeta entry").toBeDefined();
    for (const text of [meta!.description, meta!.summary ?? ""]) {
      const m = text.match(/(\d+)\s+(?:CDC PLACES|health)/);
      if (m) {
        expect(Number(m[1]), `stale measure count in: ${text}`).toBe(
          CATALOG_MEASURE_IDS.length,
        );
      }
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

  it("every record carries every catalog measure id (present or null)", () => {
    for (const r of CDC_PLACES_ZCTA_RECORDS) {
      for (const id of CATALOG_MEASURE_IDS) {
        expect(r.measures[id], `${r.zcta5} missing ${id}`).toBeDefined();
      }
    }
  });

  it("crudePrevalence values are null or between 0 and 100", () => {
    for (const r of CDC_PLACES_ZCTA_RECORDS) {
      for (const id of CATALOG_MEASURE_IDS) {
        const v = r.measures[id].crudePrevalence;
        if (v === null) continue;
        expect(v, `${r.zcta5} ${id}`).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(100);
      }
    }
  });

  it("ci95 low <= crudePrev <= high when all three are present", () => {
    for (const r of CDC_PLACES_ZCTA_RECORDS) {
      for (const id of CATALOG_MEASURE_IDS) {
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
      const anyPresent = CATALOG_MEASURE_IDS.some(
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
