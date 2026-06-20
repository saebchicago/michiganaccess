#!/usr/bin/env node
/**
 * Sheps Center freshness check for Closure Watch.
 *
 * Closure Watch (src/data/closureWatchFallback.ts -> useClosureWatch.ts) is a
 * hand-curated, two-source-verified list of Michigan hospital / service-line
 * closures. It cannot be fully auto-generated: the Sheps Center "Rural Hospital
 * Closures" database is ONE source (the contract requires two independent
 * sources per verified entry), and lat/lon + narrative summaries are editorial.
 * See docs/supabase-edge-functions-plan.md section 2.5.
 *
 * What this script CAN do - and does - is remove the "did we miss one?" risk:
 * it downloads the Sheps workbook, filters Michigan rows, and diffs them against
 * the facility/city pairs already in the curated fallback. New or unmatched
 * Michigan closures are reported so a human can do the editorial second-source +
 * geocode + summary step. It is an advisory nudge, NOT a data generator: it
 * writes nothing and (by default) never fails a build.
 *
 * Usage:
 *   node scripts/check-sheps-closures.mjs                 # fetch + report
 *   node scripts/check-sheps-closures.mjs --file f.xlsx   # parse a local workbook
 *   node scripts/check-sheps-closures.mjs --since 2018    # widen the year window
 *   node scripts/check-sheps-closures.mjs --strict        # exit 1 if drift found
 *   SHEPS_XLSX_URL=https://... node scripts/check-sheps-closures.mjs
 *
 * SOURCE URL: the Sheps Center publishes the workbook as a direct .xlsx link on
 * their Rural Hospital Closures page (no API, no stable filename). Confirm the
 * current link from that page and pass it via SHEPS_XLSX_URL (or the workflow
 * input). Without a confirmed URL the script reports a clear error and exits 0
 * (advisory) - it does not guess silently.
 *
 * The XLSX/ZIP parsing is reused verbatim from the SNAP ingest so there is one
 * audited OOXML reader in the repo.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  unzip,
  readWorkbook,
  normCountyKey,
  canonicalCounty,
} from "./build-snap-county-dataset.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const fallbackFile = path.join(projectRoot, "src/data/closureWatchFallback.ts");

const SHEPS_PAGE =
  "https://www.shepscenter.unc.edu/programs-projects/rural-health/rural-hospital-closures/";
const SHEPS_XLSX_URL = process.env.SHEPS_XLSX_URL || null;

const STRICT = process.argv.includes("--strict");
const fileArgIdx = process.argv.indexOf("--file");
const LOCAL_FILE = fileArgIdx !== -1 ? process.argv[fileArgIdx + 1] : null;
const sinceArgIdx = process.argv.indexOf("--since");
const SINCE_YEAR = sinceArgIdx !== -1 ? parseInt(process.argv[sinceArgIdx + 1], 10) : 2020;

// --- Michigan closure extraction -------------------------------------------

const HEADER_NAME = /hospital|facility|name/i;
const HEADER_CITY = /city|town/i;
const HEADER_STATE = /state/i;
const HEADER_COUNTY = /county/i;
const HEADER_YEAR = /year|date|closure|conversion/i;

function isMichiganState(raw) {
  const s = String(raw || "").trim().toLowerCase();
  return s === "michigan" || s === "mi" || s === "26";
}

function detectYear(raw) {
  const m = /\b(19|20)\d{2}\b/.exec(String(raw || ""));
  return m ? parseInt(m[0], 10) : null;
}

// Corporate brands, facility-type words and filler removed before comparing
// facility names, so "Aspirus Ontonagon Hospital" and "Ontonagon Memorial
// Hospital" still overlap on the distinctive token ("ontonagon").
const NAME_STOPWORDS = new Set([
  "hospital", "hospitals", "medical", "center", "centre", "memorial", "health",
  "healthcare", "system", "systems", "regional", "community", "county", "rural",
  "critical", "access", "the", "of", "at", "and", "inc", "llc", "campus",
  "clinic", "care", "general", "district", "area", "saint", "st",
  // Michigan health-system brands
  "aspirus", "ascension", "munson", "corewell", "spectrum", "mymichigan",
  "trinity", "mercy", "beaumont", "henry", "ford", "sparrow", "mclaren",
]);

function nameTokens(name) {
  return new Set(
    String(name || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t && !NAME_STOPWORDS.has(t)),
  );
}

function cityKey(city) {
  return String(city || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function jaccard(a, b) {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter);
}

// Pull Michigan closure rows out of the parsed Sheps worksheets. Columns are
// located by header text (the Sheps file layout has shifted over the years), so
// this tolerates added/reordered columns.
function extractShepsMichigan(sheets, sinceYear = 0) {
  const rows = [];
  for (const sheet of sheets) {
    let headerIdx = -1;
    let nameCol = -1, cityCol = -1, stateCol = -1, countyCol = -1, yearCol = -1;
    for (let i = 0; i < Math.min(sheet.rows.length, 40); i++) {
      const row = sheet.rows[i];
      let nc = -1, cc = -1, sc = -1, coc = -1, yc = -1;
      for (let j = 0; j < row.length; j++) {
        const cell = row[j] || "";
        if (nc === -1 && HEADER_NAME.test(cell)) nc = j;
        if (sc === -1 && HEADER_STATE.test(cell)) sc = j;
        if (coc === -1 && HEADER_COUNTY.test(cell)) coc = j;
        if (cc === -1 && HEADER_CITY.test(cell) && !HEADER_COUNTY.test(cell)) cc = j;
        if (yc === -1 && HEADER_YEAR.test(cell)) yc = j;
      }
      // A usable header needs at least a name and a state column.
      if (nc !== -1 && sc !== -1) {
        headerIdx = i; nameCol = nc; cityCol = cc; stateCol = sc;
        countyCol = coc; yearCol = yc;
        break;
      }
    }
    if (headerIdx === -1) continue;

    for (let i = headerIdx + 1; i < sheet.rows.length; i++) {
      const row = sheet.rows[i];
      if (!row || row.length === 0) continue;
      if (!isMichiganState(row[stateCol])) continue;
      const name = String(row[nameCol] || "").trim();
      if (!name) continue;
      const city = cityCol !== -1 ? String(row[cityCol] || "").trim() : "";
      const county =
        countyCol !== -1 ? canonicalCounty(row[countyCol]) : null;
      const year = yearCol !== -1 ? detectYear(row[yearCol]) : null;
      if (sinceYear && year != null && year < sinceYear) continue;
      rows.push({ name, city, county, year });
    }
  }
  return rows;
}

// --- curated fallback parsing ----------------------------------------------

// Read closureWatchFallback.ts as text (never import TS from a .mjs) and pull
// the facilityName / city / county of every ACTIVE entry. The commented-out
// _CANDIDATES block is stripped first so it does not count as "already tracked".
function parseCuratedFallback(text) {
  const noBlockComments = text.replace(/\/\*[\s\S]*?\*\//g, "");
  const grabAll = (re) => {
    const out = [];
    let m;
    while ((m = re.exec(noBlockComments))) out.push(m[1].trim());
    return out;
  };
  const names = grabAll(/facilityName:\s*"([^"]+)"/g);
  const cities = grabAll(/\bcity:\s*"([^"]+)"/g);
  const counties = grabAll(/\bcounty:\s*"([^"]+)"/g);
  // Each entry has exactly one of each field, in this order, so positions align.
  return names.map((name, i) => ({
    name,
    city: cities[i] || "",
    county: counties[i] || "",
    tokens: nameTokens(name),
    cityKey: cityKey(cities[i] || ""),
  }));
}

// --- diff -------------------------------------------------------------------

const TRACKED_THRESHOLD = 0.5;

// Classify each Sheps Michigan row against the curated set:
//   tracked - strong facility-name overlap (already in Closure Watch)
//   review  - same city as a curated entry but the facility differs/unclear
//   new     - no city or name match; a candidate to curate
function diffClosures(shepsRows, curated) {
  const tracked = [];
  const review = [];
  const isNew = [];
  for (const r of shepsRows) {
    const tokens = nameTokens(r.name);
    const ck = cityKey(r.city);
    let best = 0;
    let cityHit = false;
    for (const c of curated) {
      const score = jaccard(tokens, c.tokens);
      if (score > best) best = score;
      if (ck && ck === c.cityKey) cityHit = true;
    }
    if (best >= TRACKED_THRESHOLD) tracked.push({ ...r, score: best });
    else if (cityHit) review.push({ ...r, score: best });
    else isNew.push({ ...r, score: best });
  }
  return { tracked, review, new: isNew };
}

// --- io / parsing of the download ------------------------------------------

// The Sheps download is a bare .xlsx (which is itself a zip). Some mirrors wrap
// it in an outer .zip. Handle both: a direct workbook has xl/worksheets/* inside.
function sheetsFromBuffer(buf) {
  const entries = unzip(buf);
  const isDirectXlsx = [...entries.keys()].some((n) =>
    /^xl\/worksheets\/sheet\d+\.xml$/.test(n),
  );
  if (isDirectXlsx) return readWorkbook(buf);
  const xlsxNames = [...entries.keys()].filter((n) => /\.xlsx$/i.test(n));
  if (xlsxNames.length === 0) {
    throw new Error(
      `download is neither a workbook nor a zip of .xlsx; entries: ${[...entries.keys()].slice(0, 8).join(", ")}`,
    );
  }
  const sheets = [];
  for (const name of xlsxNames) {
    for (const s of readWorkbook(entries.get(name))) {
      sheets.push({ name: `${name}:${s.name}`, rows: s.rows });
    }
  }
  return sheets;
}

async function loadWorkbookBuffer() {
  if (LOCAL_FILE) {
    const abs = path.resolve(process.cwd(), LOCAL_FILE);
    console.log(`[check-sheps] reading local file ${abs}`);
    return readFile(abs);
  }
  if (!SHEPS_XLSX_URL) {
    const err = new Error(
      "no Sheps workbook URL. Set SHEPS_XLSX_URL to the current .xlsx link from\n" +
        `  ${SHEPS_PAGE}\n` +
        "  or pass --file <path> to check a downloaded copy.",
    );
    err.advisory = true;
    throw err;
  }
  console.log(`[check-sheps] fetching ${SHEPS_XLSX_URL}`);
  const res = await fetch(SHEPS_XLSX_URL, {
    headers: { "user-agent": "accessmi-data-bot/1.0 (+https://accessmi.org)" },
  });
  if (!res.ok) throw new Error(`fetch failed: HTTP ${res.status} ${res.statusText}`);
  return Buffer.from(await res.arrayBuffer());
}

function report(diff) {
  const line = (r) =>
    `    - ${r.name}${r.city ? ` (${r.city}${r.county ? `, ${r.county} Co.` : ""})` : ""}` +
    `${r.year ? ` [${r.year}]` : ""}`;
  console.log(
    `[check-sheps] Sheps Michigan rows since ${SINCE_YEAR}: ` +
      `${diff.tracked.length} tracked, ${diff.review.length} to review, ${diff.new.length} new`,
  );
  if (diff.new.length > 0) {
    console.log(`\n  NEW - not in Closure Watch (curate: second source + geo + summary):`);
    diff.new.forEach((r) => console.log(line(r)));
  }
  if (diff.review.length > 0) {
    console.log(`\n  REVIEW - same city as a tracked entry, confirm it is not a new event:`);
    diff.review.forEach((r) => console.log(line(r)));
  }
  if (diff.new.length === 0 && diff.review.length === 0) {
    console.log("\n  Closure Watch is in sync with Sheps for the window. Nothing to curate.");
  }
}

async function main() {
  let buf;
  try {
    buf = await loadWorkbookBuffer();
  } catch (err) {
    if (err.advisory) {
      console.warn(`[check-sheps] skipped: ${err.message}`);
      return; // advisory miss is not a failure
    }
    throw err;
  }

  const sheets = sheetsFromBuffer(buf);
  const shepsRows = extractShepsMichigan(sheets, SINCE_YEAR);
  if (shepsRows.length === 0) {
    console.warn(
      "[check-sheps] no Michigan rows found - the Sheps column layout may have " +
        "changed; inspect the workbook and adjust the header matchers.",
    );
    if (STRICT) process.exit(1);
    return;
  }

  const curated = parseCuratedFallback(await readFile(fallbackFile, "utf8"));
  const diff = diffClosures(shepsRows, curated);
  report(diff);

  if (STRICT && (diff.new.length > 0 || diff.review.length > 0)) {
    console.error(
      `\n[check-sheps] drift detected (${diff.new.length} new, ${diff.review.length} to review).`,
    );
    process.exit(1);
  }
}

// Pure helpers exported for unit tests (importing does not run the CLI).
export {
  isMichiganState,
  detectYear,
  nameTokens,
  cityKey,
  jaccard,
  extractShepsMichigan,
  parseCuratedFallback,
  diffClosures,
  sheetsFromBuffer,
};

// Only run the CLI when invoked directly, not on import.
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((err) => {
    console.error("[check-sheps] failed:", err.message);
    process.exit(1);
  });
}
