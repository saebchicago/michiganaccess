import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MEASURES,
  extractZctaRow,
  buildProvenance,
  runSanityGates,
} from "../src/cdcPlacesZcta.mjs";

test("MEASURES has exactly 40 entries with unique ids and fields", () => {
  assert.equal(MEASURES.length, 40);
  assert.equal(new Set(MEASURES.map((m) => m.id)).size, 40);
  assert.equal(new Set(MEASURES.map((m) => m.field)).size, 40);
});

test("MEASURES includes accessmi.org's original 17 ids unchanged", () => {
  const original17 = [
    "diabetes", "obesity", "highBloodPressure", "copd", "coronaryHeartDisease",
    "currentSmoking", "bingeDrinking", "noLeisurePA", "shortSleep",
    "routineCheckup", "dentalVisit", "mammogram", "colonScreening",
    "cholesterolScreen", "mentalHealthNotGood", "physicalHealthNotGood",
    "generalHealthFairPoor",
  ];
  const ids = new Set(MEASURES.map((m) => m.id));
  for (const id of original17) assert.ok(ids.has(id), `missing original measure ${id}`);
});

test("MEASURES includes the SDOH module and disability set", () => {
  const ids = new Set(MEASURES.map((m) => m.id));
  for (const id of [
    "foodInsecurity", "housingInsecurity", "utilityShutoff",
    "transportationLacking", "emotionalSupportLacking", "loneliness",
    "foodStampsReceived", "hearingDisability", "visionDisability",
    "cognitiveDisability", "mobilityDisability", "selfcareDisability",
    "independentLivingDisability", "anyDisability",
  ]) {
    assert.ok(ids.has(id), `missing SDOH/disability measure ${id}`);
  }
});

test("extractZctaRow parses a present source row correctly", () => {
  const sourceRow = {
    zcta5: "48109",
    totalpopulation: "30000",
    diabetes_crudeprev: "8.5",
    diabetes_crude95ci: "(7.9, 9.1)",
  };
  const row = extractZctaRow("48109", sourceRow);
  assert.equal(row.zcta5, "48109");
  assert.equal(row.totalPopulation, 30000);
  assert.deepEqual(row.measures.diabetes, { crudePrevalence: 8.5, ci95: { low: 7.9, high: 9.1 } });
  // A measure absent from the sparse source row still gets a null entry.
  assert.deepEqual(row.measures.foodInsecurity, { crudePrevalence: null, ci95: null });
});

test("extractZctaRow marks every measure null when the ZCTA is absent from the source", () => {
  const row = extractZctaRow("48999", undefined);
  assert.equal(row.totalPopulation, null);
  assert.equal(Object.keys(row.measures).length, 40);
  assert.ok(Object.values(row.measures).every((m) => m.crudePrevalence === null && m.ci95 === null));
});

function makeSyntheticRows(n, { suppressedFraction = 0, diabetesMissingFraction = 0 } = {}) {
  const rows = [];
  const sourceRowsMap = new Map();
  for (let i = 0; i < n; i++) {
    const zcta = String(48000 + i).padStart(5, "0");
    const suppressed = i < n * suppressedFraction;
    const raw = suppressed
      ? undefined
      : {
          zcta5: zcta,
          totalpopulation: "10000",
          ...(i < n * diabetesMissingFraction ? {} : { diabetes_crudeprev: "9.0" }),
        };
    if (raw) sourceRowsMap.set(zcta, raw);
    rows.push(extractZctaRow(zcta, raw));
  }
  return { rows, sourceRowsMap };
}

test("runSanityGates passes on well-formed synthetic data", () => {
  const { rows, sourceRowsMap } = makeSyntheticRows(1000);
  const result = runSanityGates(rows, sourceRowsMap);
  assert.equal(result.suppressedCount, 0);
  assert.equal(result.publishedFraction, 1);
});

test("runSanityGates throws when row count is outside the expected band", () => {
  const { rows, sourceRowsMap } = makeSyntheticRows(50);
  assert.throws(() => runSanityGates(rows, sourceRowsMap), /outside the expected/);
});

test("runSanityGates throws when suppression fraction is too high", () => {
  const { rows, sourceRowsMap } = makeSyntheticRows(1000, { suppressedFraction: 0.5 });
  assert.throws(() => runSanityGates(rows, sourceRowsMap), /got source data/);
});

test("runSanityGates throws when diabetes presence collapses (schema-drift bellwether)", () => {
  const { rows, sourceRowsMap } = makeSyntheticRows(1000, { diabetesMissingFraction: 0.5 });
  assert.throws(() => runSanityGates(rows, sourceRowsMap), /non-null diabetes value/);
});

test("runSanityGates throws on an out-of-range crude prevalence value", () => {
  const { rows, sourceRowsMap } = makeSyntheticRows(1000);
  rows[0].measures.diabetes.crudePrevalence = 150;
  assert.throws(() => runSanityGates(rows, sourceRowsMap), /outside \[0, 100\]/);
});

test("buildProvenance echoes caller-supplied fields and fixed source metadata", () => {
  const p = buildProvenance({
    meta: { name: "Test Release", description: "d".repeat(700), rowsUpdatedAt: "2026-01-01T00:00:00.000Z" },
    ingestedAt: "2026-07-13T00:00:00.000Z",
    rowCount: 993,
    suppressedCount: 9,
    ingestScript: "test-script.mjs",
    registryLabel: "test-registry",
  });
  assert.equal(p.dataset_id, "kee5-23sr");
  assert.equal(p.value_label, "MODELED");
  assert.equal(p.measure_count, 40);
  assert.equal(p.ingest_script, "test-script.mjs");
  assert.equal(p.michigan_zcta_registry, "test-registry");
  assert.ok(p.release_description.length <= 600);
});
