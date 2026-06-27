#!/usr/bin/env node
/**
 * Refresh `src/data/county-traffic-fatalities.ts` from NHTSA's Fatality
 * Analysis Reporting System (FARS) bulk CSV releases. Pulls the 5 most
 * recent published case years, sums FATALS per Michigan county across the
 * window, computes a per-100,000-resident rate against PEP V2024
 * population, and applies a low-count suppression rule.
 *
 * Data source (one publisher, one vintage label, file-wide):
 *   https://static.nhtsa.gov/nhtsa/downloads/FARS/{year}/National/FARS{year}NationalCSV.zip
 *
 * Metric: persons killed (FARS accident.csv FATALS column), aggregated by
 * county. Per-100k rate uses PEP V2024 population (one named vintage across
 * the window). Counties with fewer than 6 fatal events across 5 years
 * render the raw count and suppress the per-100k rate; this matches the
 * MDHHS infant-mortality threshold for small-cell suppression.
 *
 * Run with --apply to write the generated file in place; run without
 * (default) to print the planned content without touching the file.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const profilesPath = path.join(
  projectRoot,
  "src/data/michigan-county-profiles.ts",
);
const fipsPath = path.join(projectRoot, "src/data/census-geographies.ts");
const outPath = path.join(projectRoot, "src/data/county-traffic-fatalities.ts");

const APPLY = process.argv.includes("--apply");

const MI_STATE_FIPS = "26";
const SUPPRESSION_THRESHOLD = 6;
const YEARS = [2020, 2021, 2022, 2023, 2024];

const ZIP_URL = (year) =>
  `https://static.nhtsa.gov/nhtsa/downloads/FARS/${year}/National/FARS${year}NationalCSV.zip`;

// --- Minimal zip reader (inflate, no ZIP64) -------------------------------
// Borrowed pattern from scripts/build-snap-county-dataset.mjs. Keeps the
// pipeline dependency-free: only node:zlib.
function unzipEntries(buf) {
  const entries = new Map();
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0 && i >= buf.length - 22 - 65536; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd === -1) throw new Error("not a zip: no end-of-central-directory record");
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  if (p === 0xffffffff) throw new Error("ZIP64 archives are not supported");

  for (let i = 0; i < count; i++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) break;
    const method = buf.readUInt16LE(p + 10);
    const compSize = buf.readUInt32LE(p + 20);
    const fnLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const localOff = buf.readUInt32LE(p + 42);
    const name = buf.toString("utf8", p + 46, p + 46 + fnLen);
    if (compSize === 0xffffffff || localOff === 0xffffffff) {
      throw new Error("ZIP64 archives are not supported");
    }
    const lhFnLen = buf.readUInt16LE(localOff + 26);
    const lhExtraLen = buf.readUInt16LE(localOff + 28);
    const dataStart = localOff + 30 + lhFnLen + lhExtraLen;
    const comp = buf.subarray(dataStart, dataStart + compSize);
    let content;
    if (method === 0) content = comp;
    else if (method === 8) content = zlib.inflateRawSync(comp);
    else throw new Error(`unsupported zip compression method ${method} for ${name}`);
    entries.set(name, content);
    p += 46 + fnLen + extraLen + commentLen;
  }
  return entries;
}

// --- FARS fetch + parse ----------------------------------------------------

async function fetchYearZip(year) {
  const res = await fetch(ZIP_URL(year), {
    headers: { "user-agent": "accessmi-data-refresh" },
  });
  if (!res.ok) {
    throw new Error(`FARS ${year} fetch failed: HTTP ${res.status}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1024) {
    throw new Error(`FARS ${year} payload too small (${buf.length} bytes); refusing to parse`);
  }
  return buf;
}

function findAccidentEntry(zipEntries, year) {
  for (const name of zipEntries.keys()) {
    if (/\/accident\.csv$/i.test(name) && !/MIACC/i.test(name)) {
      return zipEntries.get(name);
    }
  }
  throw new Error(`FARS ${year}: accident.csv not found in zip`);
}

// RFC 4180-ish CSV row splitter. Handles double-quoted fields containing
// commas. FARS rows are not fully quoted but some text fields contain
// commas (e.g. city names like "DETROIT, MI"). A naive split(",") shifts
// later columns and lands non-numeric strings in the FATALS slot.
function splitCsvRow(line) {
  const out = [];
  let cur = "";
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuote) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuote = false;
        }
      } else {
        cur += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuote = true;
      continue;
    }
    if (ch === ",") {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out;
}

function aggregateMichiganFatalsByCounty(csvBuf, year) {
  let text = csvBuf.toString("utf8");
  // Some FARS years (e.g., 2021) ship the CSV with a UTF-8 BOM that
  // poisons the first header cell ("﻿STATE" instead of "STATE").
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const lines = text.split(/\r?\n/);
  const header = splitCsvRow(lines[0]);
  const stateIdx = header.indexOf("STATE");
  const countyIdx = header.indexOf("COUNTY");
  const fatalsIdx = header.indexOf("FATALS");
  if (stateIdx < 0 || countyIdx < 0 || fatalsIdx < 0) {
    throw new Error(
      `FARS ${year} accident.csv missing required columns (STATE=${stateIdx}, COUNTY=${countyIdx}, FATALS=${fatalsIdx})`,
    );
  }
  const expectedCols = header.length;
  const byCounty = new Map();
  let totalRows = 0;
  let miRows = 0;
  let miFatals = 0;
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    totalRows++;
    const cols = splitCsvRow(line);
    if (cols.length !== expectedCols) {
      throw new Error(
        `FARS ${year}: row ${i + 1} has ${cols.length} columns, expected ${expectedCols}`,
      );
    }
    if (cols[stateIdx] !== MI_STATE_FIPS) continue;
    miRows++;
    const countyKey = cols[countyIdx].padStart(3, "0");
    const fatals = Number(cols[fatalsIdx]);
    if (!Number.isFinite(fatals) || fatals < 0) {
      throw new Error(
        `FARS ${year}: bad FATALS value "${cols[fatalsIdx]}" on row ${i + 1}`,
      );
    }
    byCounty.set(countyKey, (byCounty.get(countyKey) ?? 0) + fatals);
    miFatals += fatals;
  }
  if (miRows === 0) {
    throw new Error(
      `FARS ${year}: 0 Michigan rows parsed (out of ${totalRows} total). Refusing to write zeros.`,
    );
  }
  return { byCounty, miRows, miFatals, totalRows };
}

// --- Repo state readers (read-only) ---------------------------------------

async function loadFipsMap() {
  const src = await readFile(fipsPath, "utf8");
  const block = src.match(
    /MI_COUNTY_FIPS:\s*Record<string,\s*string>\s*=\s*\{([\s\S]*?)\};/,
  );
  if (!block) {
    throw new Error("Could not locate MI_COUNTY_FIPS in census-geographies.ts");
  }
  const body = block[1];
  const nameToFips = new Map();
  const fipsToName = new Map();
  for (const m of body.matchAll(/"?([A-Za-z'\.\- ]+?)"?\s*:\s*"(\d{3})"/g)) {
    const name = m[1].trim();
    const fips = m[2];
    nameToFips.set(name, fips);
    fipsToName.set(fips, name);
  }
  if (nameToFips.size !== 83) {
    throw new Error(
      `Expected 83 MI counties in MI_COUNTY_FIPS, parsed ${nameToFips.size}`,
    );
  }
  return { nameToFips, fipsToName };
}

async function loadCountyPopulations() {
  const src = await readFile(profilesPath, "utf8");
  // County entries span multiple lines: `Wayne: {\n    population: 1771063,`
  // Match the key line followed by the next `population:` value inside the
  // same object block.
  const pairRe =
    /^\s*"?([A-Z][A-Za-z'\.\- ]*?)"?:\s*\{\s*$[\s\S]*?^\s*population:\s*(\d+),/gm;
  const map = new Map();
  let m;
  while ((m = pairRe.exec(src)) !== null) {
    const key = m[1].trim();
    map.set(key, Number(m[2]));
  }
  if (map.size !== 83) {
    throw new Error(
      `Expected 83 county populations in michigan-county-profiles.ts, parsed ${map.size}`,
    );
  }
  return map;
}

// --- Output ----------------------------------------------------------------

function computeRate(fiveYearCount, population) {
  if (!population || population <= 0) return null;
  const rate = (fiveYearCount / (YEARS.length * population)) * 100000;
  return Math.round(rate * 10) / 10;
}

function formatEntry(name, row) {
  const rate = row.suppressed ? "null" : row.ratePer100k.toFixed(1);
  const key = /^[A-Z][A-Za-z]*$/.test(name) ? name : JSON.stringify(name);
  return `  ${key}: { fiveYearCount: ${row.fiveYearCount}, ratePer100k: ${rate}, suppressed: ${row.suppressed} },`;
}

function buildFileContent(rows, yearTotals) {
  const sortedKeys = [...rows.keys()].sort((a, b) => a.localeCompare(b));
  const entries = sortedKeys.map((name) => formatEntry(name, rows.get(name)));
  const yearsLiteral = YEARS.join(", ");
  const yearTotalsComment = YEARS.map(
    (y) => ` *   ${y}: ${yearTotals.get(y)} persons killed in MI fatal crashes`,
  ).join("\n");
  return `/**
 * Generated by scripts/refresh-fars.mjs. Do not edit by hand. Re-run the
 * script to regenerate.
 *
 * Source: NHTSA Fatality Analysis Reporting System (FARS), bulk CSV release.
 * URL pattern:
 *   https://static.nhtsa.gov/nhtsa/downloads/FARS/{year}/National/FARS{year}NationalCSV.zip
 *
 * Metric: persons killed in fatal crashes (FARS accident.csv FATALS column),
 *   aggregated by Michigan county across the 5 most recent published case
 *   years.
 * Denominator: U.S. Census Bureau PEP V2024 (one named vintage applied
 *   across the window; see src/data/michigan-county-profiles.ts).
 * Suppression rule: counties with fewer than ${SUPPRESSION_THRESHOLD} fatal
 *   events across the 5-year window render the raw count (ratePer100k null,
 *   suppressed true) rather than a noisy per-100k rate. Threshold matches
 *   the MDHHS infant-mortality small-cell convention.
 *
 * Per-year Michigan totals captured at generation time:
${yearTotalsComment}
 */

export const FARS_VINTAGE = "${YEARS[0]}-${YEARS[YEARS.length - 1]}";
export const FARS_SOURCE = "NHTSA FARS";
export const FARS_YEARS_INCLUDED = [${yearsLiteral}] as const;
export const FARS_SUPPRESSION_THRESHOLD = ${SUPPRESSION_THRESHOLD};

export interface CountyTrafficFatalities {
  /** Sum of persons killed across the 5-year window. */
  fiveYearCount: number;
  /**
   * Average annual deaths per 100,000 residents, computed as
   * (fiveYearCount / (5 * PEP V2024 population)) * 100,000.
   * Null when the suppression rule applied.
   */
  ratePer100k: number | null;
  /** True when fiveYearCount fell below FARS_SUPPRESSION_THRESHOLD. */
  suppressed: boolean;
}

export const COUNTY_TRAFFIC_FATALITIES: Record<string, CountyTrafficFatalities> = {
${entries.join("\n")}
};
`;
}

// --- Main ------------------------------------------------------------------

async function main() {
  console.log(`[refresh-fars] case years: ${YEARS.join(", ")}`);
  const { nameToFips, fipsToName } = await loadFipsMap();
  const pops = await loadCountyPopulations();

  const accumulated = new Map(); // fips -> running fatality count
  const yearTotals = new Map();
  let grandTotal = 0;

  for (const year of YEARS) {
    console.log(`[refresh-fars] fetching FARS ${year}...`);
    const zipBuf = await fetchYearZip(year);
    const entries = unzipEntries(zipBuf);
    const accCsv = findAccidentEntry(entries, year);
    const { byCounty, miRows, miFatals, totalRows } =
      aggregateMichiganFatalsByCounty(accCsv, year);
    console.log(
      `[refresh-fars]   ${year}: ${miFatals} persons killed across ${miRows} MI fatal crashes (national ${totalRows} crashes)`,
    );
    yearTotals.set(year, miFatals);
    grandTotal += miFatals;
    for (const [fips, n] of byCounty) {
      accumulated.set(fips, (accumulated.get(fips) ?? 0) + n);
      if (!fipsToName.has(fips)) {
        throw new Error(
          `FARS ${year}: MI row with COUNTY=${fips} not in MI_COUNTY_FIPS. Refusing to write.`,
        );
      }
    }
  }

  if (grandTotal < 4000 || grandTotal > 8000) {
    throw new Error(
      `Sanity-check failed: 5-year MI fatality total = ${grandTotal}, expected roughly 4000-8000. Refusing to write.`,
    );
  }

  const rows = new Map();
  for (const [name, fips] of nameToFips) {
    const count = accumulated.get(fips) ?? 0;
    const pop = pops.get(name);
    if (pop === undefined) {
      throw new Error(`No population for ${name} in michigan-county-profiles.ts`);
    }
    const suppressed = count < SUPPRESSION_THRESHOLD;
    const ratePer100k = suppressed ? null : computeRate(count, pop);
    rows.set(name, { fiveYearCount: count, ratePer100k, suppressed });
  }

  if (rows.size !== 83) {
    throw new Error(`Expected 83 rows, got ${rows.size}`);
  }

  const suppressedCount = [...rows.values()].filter((r) => r.suppressed).length;
  console.log(
    `[refresh-fars] window total: ${grandTotal} persons killed across MI; ${suppressedCount} of 83 counties below threshold (<${SUPPRESSION_THRESHOLD}).`,
  );

  // Spot-check audit table
  console.log("\n[refresh-fars] spot-check (5 counties):");
  for (const name of ["Wayne", "Oakland", "Macomb", "Kent", "Keweenaw"]) {
    const r = rows.get(name);
    if (!r) continue;
    const pop = pops.get(name);
    const rate = r.suppressed ? "(suppressed)" : `${r.ratePer100k.toFixed(1)}/100k/yr`;
    console.log(
      `  ${name.padEnd(12)} pop ${String(pop).padStart(9)}  5yr count ${String(r.fiveYearCount).padStart(4)}  ${rate}`,
    );
  }

  const content = buildFileContent(rows, yearTotals);

  if (!APPLY) {
    console.log(
      `\n[refresh-fars] dry-run (default). Re-run with --apply to write ${path.relative(projectRoot, outPath)}.`,
    );
    return;
  }

  await writeFile(outPath, content, "utf8");
  console.log(`\n[refresh-fars] wrote ${path.relative(projectRoot, outPath)} (${rows.size} counties).`);
}

main().catch((err) => {
  console.error("[refresh-fars] failed:", err);
  process.exit(1);
});
