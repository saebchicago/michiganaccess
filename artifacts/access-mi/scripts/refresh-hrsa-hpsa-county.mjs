#!/usr/bin/env node
/**
 * Refresh `src/data/hrsa-hpsa-county.generated.json` (data) and
 * `src/data/hrsa-hpsa-county.ts` (typed shim) from the HRSA Health
 * Professional Shortage Area (HPSA) facility-detail CSVs.
 *
 * HRSA publishes three parallel HPSA files - Primary Care (PC),
 * Dental Health (DH), and Mental Health (MH) - each one row per
 * designated HPSA. HPSAs can be geographic (census tract, county),
 * population-group (e.g., low-income within a county), or facility
 * (a specific FQHC / correctional facility etc.). HRSA does NOT
 * publish a county summary as a separate table; the county rollup
 * here is an aggregation.
 *
 * Per the branch task rule, "Any county rollup method must be
 * documented and labeled MODELED unless HRSA publishes the county
 * figure directly." Every field this script writes is a MODELED
 * aggregation and is labeled as such in the provenance block.
 *
 * Vintage is read from the CSV's own "Data Warehouse Record Create
 * Date" column (uniform across each file) and echoed verbatim into
 * the generated provenance block. Never hardcoded here.
 *
 * Source:
 *   https://data.hrsa.gov/data/download?data=SHORT
 *   PC: https://data.hrsa.gov/DataDownload/DD_Files/BCD_HPSA_FCT_DET_PC.csv
 *   DH: https://data.hrsa.gov/DataDownload/DD_Files/BCD_HPSA_FCT_DET_DH.csv
 *   MH: https://data.hrsa.gov/DataDownload/DD_Files/BCD_HPSA_FCT_DET_MH.csv
 *
 * Filter: MI + HPSA Status = "Designated" (drop Withdrawn / Proposed
 *   for Withdrawal / etc. - the task calls for shortage designations
 *   in force, not historical ones).
 *
 * Run with --apply to write both files; without --apply the script
 * prints per-discipline counts and a Wayne-county sample and exits.
 */
import { writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchAndRecord, writeManifest } from "./lib/ingest-manifest.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const registryPath = path.join(projectRoot, "src/data/census-geographies.ts");
const outJsonPath = path.join(
  projectRoot,
  "src/data/hrsa-hpsa-county.generated.json",
);
const outTsPath = path.join(projectRoot, "src/data/hrsa-hpsa-county.ts");

const APPLY = process.argv.includes("--apply");

const HRSA_LANDING = "https://data.hrsa.gov/data/download?data=SHORT";
const HRSA_DOWNLOAD_BASE = "https://data.hrsa.gov/DataDownload/DD_Files";

const DISCIPLINES = [
  { id: "primaryCare", label: "Primary Care", file: "BCD_HPSA_FCT_DET_PC.csv" },
  { id: "dental",      label: "Dental Health", file: "BCD_HPSA_FCT_DET_DH.csv" },
  { id: "mental",      label: "Mental Health", file: "BCD_HPSA_FCT_DET_MH.csv" },
];

async function loadMiCountyFips() {
  // Same loader shape as refresh-cdc-places-county.mjs. MI_COUNTY_FIPS
  // stores 3-digit county codes without the "26" state prefix; we output
  // Map<5-digit-FIPS, canonical county name>.
  const src = await readFile(registryPath, "utf8");
  const start = src.indexOf("MI_COUNTY_FIPS");
  if (start < 0) throw new Error("MI_COUNTY_FIPS not found");
  const open = src.indexOf("{", start);
  const close = src.indexOf("}", open);
  const body = src.slice(open + 1, close);
  const fips = new Map();
  const re = /(?:"([^"]+)"|(\b[A-Z][\w. ]*))\s*:\s*"(\d{3})"/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const name = (m[1] ?? m[2]).trim();
    fips.set(`26${m[3]}`, name);
  }
  if (fips.size === 0) throw new Error("No MI county FIPS parsed");
  return fips;
}

/**
 * Parse a CSV that may contain quoted fields with embedded commas and
 * escaped quotes ("" -> "). Streams line-by-line; a single "logical
 * row" may span multiple text lines if a quoted field contains a
 * newline (rare in HRSA data). Returns rows as arrays of strings.
 */
function parseCsv(text) {
  const rows = [];
  let cur = [];
  let field = "";
  let inQuote = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuote) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuote = false;
        }
      } else {
        field += c;
      }
      continue;
    }
    if (c === '"') {
      inQuote = true;
    } else if (c === ",") {
      cur.push(field);
      field = "";
    } else if (c === "\n") {
      cur.push(field);
      field = "";
      rows.push(cur);
      cur = [];
    } else if (c === "\r") {
      /* skip; \n will terminate */
    } else {
      field += c;
    }
  }
  if (field.length > 0 || cur.length > 0) {
    cur.push(field);
    rows.push(cur);
  }
  return rows;
}

const manifestEntries = [];
const BUILD_ID = `refresh-hrsa-hpsa-county-${new Date().toISOString().replace(/[:.]/g, "-")}`;

async function fetchCsv(url, sourceId) {
  return fetchAndRecord({
    sourceId,
    url,
    headers: {
      "user-agent":
        "Mozilla/5.0 (compatible; accessmi-data-refresh; +https://accessmi.org)",
      accept: "text/csv,application/octet-stream,*/*",
    },
    minBytes: 500,
    entries: manifestEntries,
  });
}

/** Load one discipline and reduce to MI Designated rows grouped by county FIPS. */
async function loadDiscipline(discipline, miFipsSet) {
  const url = `${HRSA_DOWNLOAD_BASE}/${discipline.file}`;
  const sourceId = `hrsa-hpsa-${discipline.id.toLowerCase()}-county`;
  const text = await fetchCsv(url, sourceId);
  const rows = parseCsv(text);
  if (rows.length < 2) throw new Error(`Empty CSV: ${url}`);
  const header = rows[0];
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));

  const required = [
    "HPSA Status",
    "Common State County FIPS Code",
    "Common State Abbreviation",
    "HPSA Score",
    "HPSA Designation Population",
    "HPSA Estimated Underserved Population",
    "HPSA FTE",
    "HPSA Shortage",
    "Data Warehouse Record Create Date",
    "HPSA Designation Last Update Date",
  ];
  for (const col of required) {
    if (idx[col] === undefined) {
      throw new Error(
        `Schema drift in ${discipline.file}: missing column "${col}"`,
      );
    }
  }

  let dwCreateDate = null;
  const byFips = new Map();
  let miDesignated = 0;
  let miWithdrawn = 0;
  let miOther = 0;
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.length < header.length - 1) continue; // trailing empty
    if (row[idx["Common State Abbreviation"]] !== "MI") continue;
    const status = row[idx["HPSA Status"]];
    if (status === "Designated") {
      miDesignated++;
    } else if (status === "Withdrawn") {
      miWithdrawn++;
      continue;
    } else {
      miOther++;
      continue;
    }

    const fips = row[idx["Common State County FIPS Code"]];
    if (!miFipsSet.has(fips)) continue;

    const dw = row[idx["Data Warehouse Record Create Date"]];
    if (dw && !dwCreateDate) dwCreateDate = dw;

    const score = Number(row[idx["HPSA Score"]]);
    const desigPop = Number(row[idx["HPSA Designation Population"]]);
    const underserved = Number(row[idx["HPSA Estimated Underserved Population"]]);
    const fte = Number(row[idx["HPSA FTE"]]);
    const shortage = Number(row[idx["HPSA Shortage"]]);

    const bucket = byFips.get(fips) ?? {
      count: 0,
      maxScore: 0,
      designationPopulation: 0,
      estimatedUnderserved: 0,
      providerFte: 0,
      shortageFte: 0,
    };
    bucket.count += 1;
    if (Number.isFinite(score)) bucket.maxScore = Math.max(bucket.maxScore, score);
    if (Number.isFinite(desigPop)) bucket.designationPopulation += desigPop;
    if (Number.isFinite(underserved)) bucket.estimatedUnderserved += underserved;
    if (Number.isFinite(fte)) bucket.providerFte += fte;
    if (Number.isFinite(shortage)) bucket.shortageFte += shortage;
    byFips.set(fips, bucket);
  }

  return {
    disciplineId: discipline.id,
    label: discipline.label,
    file: discipline.file,
    dwCreateDate,
    miDesignated,
    miWithdrawn,
    miOtherStatus: miOther,
    byFips,
  };
}

function buildCountyRecord(fips, countyName, disciplines) {
  const per = {};
  for (const d of disciplines) {
    const b = d.byFips.get(fips);
    per[d.disciplineId] = b
      ? {
          designatedHpsas: b.count,
          maxHpsaScore: b.maxScore || null,
          designationPopulation: Math.round(b.designationPopulation) || 0,
          estimatedUnderservedPopulation:
            Math.round(b.estimatedUnderserved) || 0,
          providerFte: Math.round(b.providerFte * 10) / 10,
          shortageFte: Math.round(b.shortageFte * 10) / 10,
        }
      : {
          designatedHpsas: 0,
          maxHpsaScore: null,
          designationPopulation: 0,
          estimatedUnderservedPopulation: 0,
          providerFte: 0,
          shortageFte: 0,
        };
  }
  return {
    countyFips: fips,
    countyName,
    disciplines: per,
  };
}

function buildJsonPayload(ingestedAt, records, disciplines) {
  const vintages = disciplines.map((d) => ({
    disciplineId: d.disciplineId,
    label: d.label,
    file: d.file,
    dwCreateDate: d.dwCreateDate,
    miDesignatedHpsas: d.miDesignated,
    miWithdrawnHpsas: d.miWithdrawn,
    miOtherStatusHpsas: d.miOtherStatus,
  }));
  return {
    provenance: {
      source_name:
        "HRSA HPSA facility detail files (Primary Care, Dental Health, Mental Health)",
      source_url: HRSA_LANDING,
      download_base_url: HRSA_DOWNLOAD_BASE,
      per_discipline: vintages,
      ingested_at: ingestedAt,
      ingest_script: "scripts/refresh-hrsa-hpsa-county.mjs",
      michigan_county_registry: "src/data/census-geographies.ts",
      michigan_county_registry_size: records.length,
      value_label: "MODELED",
      rollup_method:
        "Filter each HRSA discipline CSV to Common State Abbreviation='MI' and HPSA Status='Designated', then group by Common State County FIPS Code. Per (county, discipline): designatedHpsas=count of designations; maxHpsaScore=max HPSA Score across designations; designationPopulation=sum of HPSA Designation Population; estimatedUnderservedPopulation=sum of HPSA Estimated Underserved Population; providerFte=sum of HPSA FTE; shortageFte=sum of HPSA Shortage. Counties with zero designated HPSAs render as 0/null, not missing.",
      notes:
        "HRSA HPSAs are typically sub-county (census tract, population group, or facility). HRSA does not publish a county summary as a separate artifact, so this rollup is a MODELED aggregation from designation records. HPSA Score is 0-25 for Primary Care and Dental (0-26 for Mental Health); higher = more severe shortage. providerFte + shortageFte together approximate the local supply gap.",
    },
    counties: records,
  };
}

function buildTsShim() {
  return `/**
 * Typed accessor for the HRSA HPSA county rollup. The JSON payload
 * lives in hrsa-hpsa-county.generated.json so the fixture is diffable
 * and the vintage metadata (per-discipline "Data Warehouse Record
 * Create Date") can be read at build time without touching this shim.
 *
 * HRSA does not publish a county-level HPSA summary; the values here
 * are aggregations from the three facility-detail files (Primary Care,
 * Dental Health, Mental Health) and are labeled MODELED accordingly.
 */
import raw from "./hrsa-hpsa-county.generated.json";

export interface HpsaDisciplineMetrics {
  /** Number of designated HPSAs in this county for this discipline. */
  designatedHpsas: number;
  /** Max HPSA Score across designations, or null if none. Higher = more severe. */
  maxHpsaScore: number | null;
  /** Sum of HPSA Designation Population across designations. */
  designationPopulation: number;
  /** Sum of HPSA Estimated Underserved Population across designations. */
  estimatedUnderservedPopulation: number;
  /** Sum of HPSA FTE (provider FTEs currently in place). */
  providerFte: number;
  /** Sum of HPSA Shortage (provider FTEs still needed). */
  shortageFte: number;
}

export type HpsaDisciplineId = "primaryCare" | "dental" | "mental";

export type HpsaDisciplineMap = Record<HpsaDisciplineId, HpsaDisciplineMetrics>;

export interface HpsaCountyRecord {
  countyFips: string;
  countyName: string;
  disciplines: HpsaDisciplineMap;
}

export interface HpsaDisciplineVintage {
  disciplineId: HpsaDisciplineId;
  label: string;
  file: string;
  dwCreateDate: string | null;
  miDesignatedHpsas: number;
  miWithdrawnHpsas: number;
  miOtherStatusHpsas: number;
}

export interface HpsaProvenance {
  source_name: string;
  source_url: string;
  download_base_url: string;
  per_discipline: HpsaDisciplineVintage[];
  ingested_at: string;
  ingest_script: string;
  michigan_county_registry: string;
  michigan_county_registry_size: number;
  value_label: "MODELED";
  rollup_method: string;
  notes: string;
}

interface Payload {
  provenance: HpsaProvenance;
  counties: HpsaCountyRecord[];
}

const payload = raw as Payload;

export const HRSA_HPSA_COUNTY_PROVENANCE: HpsaProvenance = payload.provenance;
export const HRSA_HPSA_COUNTY_RECORDS: readonly HpsaCountyRecord[] =
  payload.counties;

const BY_FIPS = new Map<string, HpsaCountyRecord>(
  payload.counties.map((c) => [c.countyFips, c]),
);
const BY_NAME = new Map<string, HpsaCountyRecord>(
  payload.counties.map((c) => [c.countyName, c]),
);

export function getHpsaForCountyFips(fips: string): HpsaCountyRecord | null {
  return BY_FIPS.get(fips) ?? null;
}

export function getHpsaForCountyName(name: string): HpsaCountyRecord | null {
  return BY_NAME.get(name) ?? null;
}
`;
}

async function main() {
  const miFips = await loadMiCountyFips();
  console.log(`[refresh-hrsa-hpsa-county] MI counties in registry: ${miFips.size}`);

  const miFipsSet = new Set(miFips.keys());

  console.log(`[refresh-hrsa-hpsa-county] fetching three HRSA HPSA CSVs...`);
  const disciplines = [];
  for (const d of DISCIPLINES) {
    console.log(`  fetching ${d.file}...`);
    const loaded = await loadDiscipline(d, miFipsSet);
    console.log(
      `    ${loaded.label}: MI Designated=${loaded.miDesignated}, Withdrawn=${loaded.miWithdrawn}, Other=${loaded.miOtherStatus}, counties w/ HPSAs=${loaded.byFips.size}, DW create date=${loaded.dwCreateDate}`,
    );
    disciplines.push(loaded);
  }

  const records = [];
  for (const [fips, name] of [...miFips.entries()].sort()) {
    records.push(buildCountyRecord(fips, name, disciplines));
  }

  // --- Sanity gates ---

  // Gate 1: exact 83 counties.
  if (records.length !== 83) {
    throw new Error(
      `Sanity: county count ${records.length} != 83.`,
    );
  }

  // Gate 2: at least one county must have a designated HPSA in EACH
  // discipline. Michigan has statewide primary-care, dental, and mental
  // health shortages historically; zero in any discipline signals a
  // filter or schema drift.
  for (const d of disciplines) {
    const withDesignations = records.filter(
      (r) => r.disciplines[d.disciplineId].designatedHpsas > 0,
    ).length;
    if (withDesignations === 0) {
      throw new Error(
        `Sanity: zero MI counties carry a Designated ${d.label} HPSA. Filter or schema drift suspected.`,
      );
    }
  }

  // Gate 3: HPSA Score must be 0-26 (per HRSA scoring rubric). Anything
  // outside is a parser / column-drift signal.
  for (const r of records) {
    for (const d of disciplines) {
      const s = r.disciplines[d.disciplineId].maxHpsaScore;
      if (s === null) continue;
      if (!Number.isFinite(s) || s < 0 || s > 26) {
        throw new Error(
          `Sanity: ${r.countyName} ${d.label} maxHpsaScore ${s} is outside [0, 26].`,
        );
      }
    }
  }

  // Gate 4: every discipline must have a DW create date (source vintage).
  for (const d of disciplines) {
    if (!d.dwCreateDate) {
      throw new Error(
        `Sanity: no Data Warehouse Record Create Date read for ${d.label}. HRSA schema likely moved.`,
      );
    }
  }

  console.log("[refresh-hrsa-hpsa-county] sanity gates passed.");

  // Sample: Wayne County
  const wayne = records.find((r) => r.countyName === "Wayne");
  if (wayne) {
    console.log("[refresh-hrsa-hpsa-county] Wayne County (sample):");
    for (const d of disciplines) {
      const m = wayne.disciplines[d.disciplineId];
      console.log(
        `  ${d.label}: designations=${m.designatedHpsas}, maxScore=${m.maxHpsaScore}, underserved=${m.estimatedUnderservedPopulation.toLocaleString()}, shortageFte=${m.shortageFte}`,
      );
    }
  }

  const ingestedAt = new Date().toISOString();
  const payload = buildJsonPayload(ingestedAt, records, disciplines);
  const shim = buildTsShim();

  if (manifestEntries.length > 0) {
    const manifestPath = await writeManifest({
      projectRoot,
      buildId: BUILD_ID,
      entries: manifestEntries,
    });
    console.log(`[refresh-hrsa-hpsa-county] archival manifest: ${path.relative(projectRoot, manifestPath)}`);
  }

  if (!APPLY) {
    console.log(
      `\n[refresh-hrsa-hpsa-county] dry-run. Re-run with --apply to write ${path.relative(projectRoot, outJsonPath)} + ${path.relative(projectRoot, outTsPath)}.`,
    );
    return;
  }
  await writeFile(outJsonPath, JSON.stringify(payload, null, 2), "utf8");
  await writeFile(outTsPath, shim, "utf8");
  console.log(
    `\n[refresh-hrsa-hpsa-county] wrote ${path.relative(projectRoot, outJsonPath)} (${records.length} counties) and ${path.relative(projectRoot, outTsPath)}.`,
  );
}

main().catch(async (err) => {
  console.error("[refresh-hrsa-hpsa-county] failed:", err);
  if (manifestEntries.length > 0) {
    try {
      const manifestPath = await writeManifest({
        projectRoot,
        buildId: BUILD_ID,
        entries: manifestEntries,
      });
      console.error(
        `[refresh-hrsa-hpsa-county] archival manifest written despite failure: ${path.relative(projectRoot, manifestPath)}`,
      );
    } catch (manifestErr) {
      console.error("[refresh-hrsa-hpsa-county] also failed to write archival manifest:", manifestErr.message);
    }
  }
  process.exit(1);
});
