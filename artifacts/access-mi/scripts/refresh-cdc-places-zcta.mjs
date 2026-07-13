#!/usr/bin/env node
/**
 * Refresh `src/data/cdc-places-zcta.generated.json` (data) and
 * `src/data/cdc-places-zcta.ts` (typed shim) from the CDC PLACES ZCTA
 * release.
 *
 * Extracts 40 model-based adult-prevalence measures for the 992 Michigan
 * ZCTAs in src/data/mi-zctas.ts. Every value is MODELED (small-area
 * BRFSS-based estimates), carries the 95% confidence interval as a
 * "low_high" pair, and rounds to one decimal place (the source's own
 * precision). Missing values in the source render as null (suppressed);
 * ZCTAs missing entirely from the source (small denominator) are recorded
 * with all measures null.
 *
 * The measure catalog, row parsing, provenance shape, and sanity gates
 * live in the `mi-federal-data` shared package (saebchicago/mi-federal-data),
 * consumed here as a git dependency and also by ourintel.org's
 * Michigan ingest path -- one canonical source instead of two independently
 * maintained (and drift-prone) copies. This script keeps its own fetch loop
 * (routed through fetchAndRecord for archival) and its own file-writing /
 * TS-shim generation, since those are specific to this app.
 *
 * Source: CDC, PLACES: ZCTA Data (GIS Friendly Format), 2025 release
 *   https://data.cdc.gov/500-Cities-Places/PLACES-ZCTA-Data-GIS-Friendly-Format-2025-release/kee5-23sr
 *   Socrata JSON endpoint: https://data.cdc.gov/resource/kee5-23sr.json
 * Vintage: 2025 PLACES release. Underlying BRFSS data years and the exact
 *   modeling vintage are read from the source's own metadata and echoed
 *   verbatim in the generated file's provenance block. This label is
 *   NEVER hardcoded here.
 *
 * Run with --apply to write both files; without --apply the script prints
 * a summary + first 3 ZCTA rows and exits.
 */
import { writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchAndRecord, writeManifest } from "./lib/ingest-manifest.mjs";
import {
  MEASURES,
  SOCRATA_METADATA_URL,
  SOCRATA_ROWS_URL,
  extractZctaRow,
  buildProvenance,
  runSanityGates,
} from "mi-federal-data";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const manifestEntries = [];
const BUILD_ID = `refresh-cdc-places-zcta-${new Date().toISOString().replace(/[:.]/g, "-")}`;
const registryPath = path.join(projectRoot, "src/data/mi-zctas.ts");
const outJsonPath = path.join(
  projectRoot,
  "src/data/cdc-places-zcta.generated.json",
);
const outTsPath = path.join(projectRoot, "src/data/cdc-places-zcta.ts");

const APPLY = process.argv.includes("--apply");

async function loadMiZctaSet() {
  const src = await readFile(registryPath, "utf8");
  const keys = new Set();
  for (const m of src.matchAll(/^\s*"(\d{5})":\s*\{/gm)) {
    keys.add(m[1]);
  }
  if (keys.size === 0) {
    throw new Error(
      "No ZCTAs parsed from mi-zctas.ts; run refresh-mi-zcta-registry.mjs first",
    );
  }
  return keys;
}

async function fetchJson(url, sourceId) {
  const text = await fetchAndRecord({
    sourceId,
    url,
    headers: { "user-agent": "accessmi-data-refresh", accept: "application/json" },
    minBytes: 2,
    entries: manifestEntries,
  });
  return JSON.parse(text);
}

async function fetchMetadata() {
  const meta = await fetchJson(SOCRATA_METADATA_URL, "cdc-places-zcta-metadata");
  const rowsUpdatedAtIso = new Date(
    Number(meta.rowsUpdatedAt) * 1000,
  ).toISOString();
  return {
    name: meta.name,
    description: meta.description ?? "",
    rowsUpdatedAt: rowsUpdatedAtIso,
    columnCount: (meta.columns ?? []).length,
  };
}

/**
 * Page through the Socrata resource using $limit + $offset until all
 * matching rows are returned. Filter to MI ZCTAs via a `zcta5 in (...)`
 * clause; batch the ZCTA list so the URL doesn't grow beyond the SoQL
 * limit (Socrata rejects overly long WHERE clauses). Mirrors
 * mi-federal-data's fetchZctaRows, but routed through fetchAndRecord so
 * every batch is archived in this app's ingest manifest -- the one piece
 * of behavior that stays local rather than moving into the shared package.
 */
async function fetchMiRows(miZctaSet) {
  const codes = [...miZctaSet];
  const CHUNK = 200;
  const results = new Map();
  const select = [
    "zcta5",
    "totalpopulation",
    ...MEASURES.flatMap((m) => [`${m.field}_crudeprev`, `${m.field}_crude95ci`]),
  ].join(",");
  for (let i = 0; i < codes.length; i += CHUNK) {
    const chunk = codes.slice(i, i + CHUNK);
    const inClause = chunk.map((c) => `'${c}'`).join(",");
    const url =
      `${SOCRATA_ROWS_URL}?$select=${encodeURIComponent(select)}` +
      `&$where=${encodeURIComponent(`zcta5 in(${inClause})`)}` +
      `&$limit=${CHUNK * 2}`;
    const chunkIndex = Math.floor(i / CHUNK);
    const rows = await fetchJson(url, `cdc-places-zcta-chunk-${chunkIndex}`);
    for (const r of rows) {
      results.set(r.zcta5, r);
    }
  }
  return results;
}

function buildJsonPayload(meta, ingestedAt, rows, suppressedZctas) {
  return {
    provenance: buildProvenance({
      meta,
      ingestedAt,
      rowCount: rows.length,
      suppressedCount: suppressedZctas,
      ingestScript: "scripts/refresh-cdc-places-zcta.mjs",
      registryLabel: "src/data/mi-zctas.ts",
    }),
    measures: MEASURES.map((m) => ({
      id: m.id,
      category: m.category,
      label: m.label,
      places_field: `${m.field}_CrudePrev`,
      value_label: "MODELED",
    })),
    zctas: rows,
  };
}

function buildTsShim() {
  return `/**
 * Typed accessor for the CDC PLACES ZCTA generated data. The JSON payload
 * lives in cdc-places-zcta.generated.json so the fixture is diffable and
 * the vintage metadata can be read at build time without touching this
 * shim.
 */
import raw from "./cdc-places-zcta.generated.json";

/**
 * One published measure at one ZCTA. \`crudePrevalence\` is percent (0-100),
 * one decimal place; \`ci95\` is the source's 95% credible interval, or
 * null if PLACES suppressed the cell.
 */
export interface CdcPlacesMeasureValue {
  crudePrevalence: number | null;
  ci95: { low: number; high: number } | null;
}

/** All 40 measures for one ZCTA, keyed by the platform's stable measure id. */
export type CdcPlacesZctaMeasures = Record<string, CdcPlacesMeasureValue>;

/** One MI ZCTA's PLACES snapshot: 18+ population and 40 measures. */
export interface CdcPlacesZctaRecord {
  zcta5: string;
  totalPopulation: number | null;
  measures: CdcPlacesZctaMeasures;
}

/** Provenance block regenerated on every refresh. */
export interface CdcPlacesProvenance {
  source_name: string;
  dataset_id: string;
  source_url: string;
  socrata_metadata_url: string;
  socrata_rows_updated_at: string;
  release_label: string;
  release_description: string;
  ingested_at: string;
  ingest_script: string;
  michigan_zcta_registry: string;
  michigan_zcta_registry_size: number;
  michigan_zctas_suppressed_by_source: number;
  measure_count: number;
  value_units: string;
  value_label: "MODELED";
  weighting: string;
  notes: string;
  shared_package: string;
}

/** Static description of one measure (stable id, category, PLACES field). */
export interface CdcPlacesMeasureDef {
  id: string;
  category: "chronic" | "behavioral" | "preventive" | "status" | "access" | "disability" | "sdoh";
  label: string;
  places_field: string;
  value_label: "MODELED";
}

interface Payload {
  provenance: CdcPlacesProvenance;
  measures: CdcPlacesMeasureDef[];
  zctas: CdcPlacesZctaRecord[];
}

const payload = raw as Payload;

export const CDC_PLACES_ZCTA_PROVENANCE: CdcPlacesProvenance =
  payload.provenance;
export const CDC_PLACES_MEASURES: readonly CdcPlacesMeasureDef[] =
  payload.measures;
export const CDC_PLACES_ZCTA_RECORDS: readonly CdcPlacesZctaRecord[] =
  payload.zctas;

const BY_ZCTA = new Map<string, CdcPlacesZctaRecord>(
  payload.zctas.map((r) => [r.zcta5, r]),
);

/** Look up one MI ZCTA's PLACES record, or null if not published. */
export function getPlacesForZcta(zcta5: string): CdcPlacesZctaRecord | null {
  return BY_ZCTA.get(zcta5) ?? null;
}

/** Look up one measure at one ZCTA, or null if the ZCTA has no record. */
export function getPlacesMeasure(
  zcta5: string,
  measureId: string,
): CdcPlacesMeasureValue | null {
  const record = BY_ZCTA.get(zcta5);
  if (!record) return null;
  return record.measures[measureId] ?? null;
}
`;
}

async function main() {
  const miZctas = await loadMiZctaSet();
  console.log(`[refresh-cdc-places-zcta] MI ZCTAs in registry: ${miZctas.size}`);
  console.log(`[refresh-cdc-places-zcta] fetching source metadata...`);
  const meta = await fetchMetadata();
  console.log(
    `[refresh-cdc-places-zcta] release: ${meta.name} (${meta.columnCount} columns, rowsUpdated ${meta.rowsUpdatedAt})`,
  );

  console.log(`[refresh-cdc-places-zcta] paging Socrata rows...`);
  const sourceRows = await fetchMiRows(miZctas);
  console.log(
    `[refresh-cdc-places-zcta] source rows for MI ZCTAs: ${sourceRows.size}`,
  );

  const rows = [...miZctas].sort().map((zcta) => extractZctaRow(zcta, sourceRows.get(zcta)));

  console.log("[refresh-cdc-places-zcta] first 3 ZCTA snapshots:");
  for (const r of rows.slice(0, 3)) {
    const dbp = r.measures.diabetes?.crudePrevalence;
    const obp = r.measures.obesity?.crudePrevalence;
    const smk = r.measures.currentSmoking?.crudePrevalence;
    console.log(
      `  ${r.zcta5}  pop18+=${r.totalPopulation}  diabetes=${dbp}%  obesity=${obp}%  smoke=${smk}%`,
    );
  }

  // Sanity gates (row-count band, source-suppression fraction, diabetes
  // schema-drift bellwether, value-range check) live in the shared package
  // now, same thresholds as before. Fail loud rather than write silent
  // garbage.
  const gateResult = runSanityGates(rows, sourceRows);
  console.log(
    `[refresh-cdc-places-zcta] sanity gates passed (${gateResult.diabetesPresent}/${gateResult.publishedCount} rows with diabetes; ${(gateResult.publishedFraction * 100).toFixed(1)}% published overall).`,
  );

  const ingestedAt = new Date().toISOString();
  const payload = buildJsonPayload(meta, ingestedAt, rows, gateResult.suppressedCount);
  const shim = buildTsShim();

  if (manifestEntries.length > 0) {
    const manifestPath = await writeManifest({
      projectRoot,
      buildId: BUILD_ID,
      entries: manifestEntries,
    });
    console.log(`[refresh-cdc-places-zcta] archival manifest: ${path.relative(projectRoot, manifestPath)}`);
  }

  if (!APPLY) {
    console.log(
      `\n[refresh-cdc-places-zcta] dry-run. Re-run with --apply to write ${path.relative(projectRoot, outJsonPath)} + ${path.relative(projectRoot, outTsPath)}.`,
    );
    return;
  }
  await writeFile(outJsonPath, JSON.stringify(payload, null, 2), "utf8");
  await writeFile(outTsPath, shim, "utf8");
  console.log(
    `\n[refresh-cdc-places-zcta] wrote ${path.relative(projectRoot, outJsonPath)} (${rows.length} ZCTAs, ${MEASURES.length} measures) and ${path.relative(projectRoot, outTsPath)}.`,
  );
}

main().catch(async (err) => {
  console.error("[refresh-cdc-places-zcta] failed:", err);
  if (manifestEntries.length > 0) {
    try {
      const manifestPath = await writeManifest({
        projectRoot,
        buildId: BUILD_ID,
        entries: manifestEntries,
      });
      console.error(
        `[refresh-cdc-places-zcta] archival manifest written despite failure: ${path.relative(projectRoot, manifestPath)}`,
      );
    } catch (manifestErr) {
      console.error("[refresh-cdc-places-zcta] also failed to write archival manifest:", manifestErr.message);
    }
  }
  process.exit(1);
});
