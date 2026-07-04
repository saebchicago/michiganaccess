#!/usr/bin/env node
/**
 * Refresh `src/data/county-snap-retailers.ts` from the USDA-FNS Historical
 * SNAP Retailer Locator data release. Filters to Michigan rows that are
 * currently authorized (End Date blank), aggregates per county using the
 * source's already-populated `County` field, and computes per-10,000-
 * resident rates against the existing PEP V2024 county population.
 *
 * Why bulk CSV rather than the ArcGIS Hub FeatureServer: the FeatureServer
 * linked from `usda-snap-retailers-usda-fns.hub.arcgis.com` returns only a
 * Detroit-curated subset of ~960 records for STATE='MI' (it includes a
 * COUNCIL_DISTRICT field and references "Detroit's Base Units"). The
 * USDA-FNS national publication on fna.usda.gov is the canonical feed and
 * carries ~9,225 currently-authorized MI rows.
 *
 * Why HTTP/1.1: the fna.usda.gov edge served truncated responses over
 * HTTP/2; HTTP/1.1 (via the `Connection: close` header on the Node fetch)
 * delivers the full 24 MB zip reliably.
 *
 * Source: USDA Food and Nutrition Service (FNS), Historical SNAP Retailer
 *   Locator Data 2005-2025
 *   https://www.fns.usda.gov/snap/retailer/data
 *
 * Vintage: December 31, 2025 (USDA's stated currency for the CSV). The
 *   most recent Authorization Date in the current set is 2025-09-09. The
 *   label reflects the data's as-of date, not the pull date.
 *
 * Run with --apply to write the generated file in place; run without
 * (default) to print the planned content without touching the file.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";
import http from "node:http";
import https from "node:https";
import { createManifestEntry, writeManifest } from "./lib/ingest-manifest.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const manifestEntries = [];
const BUILD_ID = `refresh-snap-retailers-${new Date().toISOString().replace(/[:.]/g, "-")}`;
const SNAP_RETAILERS_SOURCE_ID = "usda-snap-retailer-locator";
const profilesPath = path.join(
  projectRoot,
  "src/data/michigan-county-profiles.ts",
);
const fipsPath = path.join(projectRoot, "src/data/census-geographies.ts");
const outPath = path.join(projectRoot, "src/data/county-snap-retailers.ts");

const APPLY = process.argv.includes("--apply");

const MI_STATE = "MI";
const VINTAGE = "December 31, 2025";
const SOURCE_LABEL = "USDA SNAP Retailer Locator";
const ZIP_URL =
  "https://www.fna.usda.gov/sites/default/files/resource-files/snap-retailer-locator-data2005-2025.zip";

// --- HTTP/1.1 fetcher (the Azure-fronted endpoint returns truncated bodies
//     over HTTP/2; Node's https module speaks HTTP/1.1 and gets the full
//     content) ---------------------------------------------------------------
function fetchHttp11(url, redirectsLeft = 5) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === "http:" ? http : https;
    const req = lib.get(
      {
        protocol: u.protocol,
        hostname: u.hostname,
        port: u.port,
        path: u.pathname + (u.search || ""),
        headers: {
          "user-agent": "accessmi-data-refresh",
          accept: "*/*",
          connection: "close",
        },
      },
      (res) => {
        if (
          (res.statusCode === 301 || res.statusCode === 302) &&
          res.headers.location &&
          redirectsLeft > 0
        ) {
          res.resume();
          const next = new URL(res.headers.location, url).toString();
          resolve(fetchHttp11(next, redirectsLeft - 1));
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} fetching ${url}`));
          res.resume();
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      },
    );
    req.on("error", reject);
    req.setTimeout(120000, () => {
      req.destroy(new Error(`timeout fetching ${url}`));
    });
  });
}

// --- Minimal zip reader (inflate, no ZIP64), borrowed from refresh-fars.mjs --

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

function findCsvEntry(entries) {
  for (const name of entries.keys()) {
    if (/\.csv$/i.test(name)) return { name, buf: entries.get(name) };
  }
  throw new Error("no .csv entry in SNAP retailer zip");
}

// --- CSV row split (handles double-quoted fields containing commas; same
//     shape as refresh-fars.mjs splitCsvRow) ---------------------------------

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

// --- Repo state readers (read-only). Identical population parser to
//     refresh-fars.mjs (multi-line key + next `population:` line). -----------

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
  for (const m of body.matchAll(/"?([A-Za-z'\.\- ]+?)"?\s*:\s*"(\d{3})"/g)) {
    nameToFips.set(m[1].trim(), m[2]);
  }
  if (nameToFips.size !== 83) {
    throw new Error(
      `Expected 83 MI counties in MI_COUNTY_FIPS, parsed ${nameToFips.size}`,
    );
  }
  return nameToFips;
}

async function loadCountyPopulations() {
  const src = await readFile(profilesPath, "utf8");
  const pairRe =
    /^\s*"?([A-Z][A-Za-z'\.\- ]*?)"?:\s*\{\s*$[\s\S]*?^\s*population:\s*(\d+),/gm;
  const map = new Map();
  let m;
  while ((m = pairRe.exec(src)) !== null) {
    map.set(m[1].trim(), Number(m[2]));
  }
  if (map.size !== 83) {
    throw new Error(
      `Expected 83 county populations in michigan-county-profiles.ts, parsed ${map.size}`,
    );
  }
  return map;
}

// --- Aggregation -----------------------------------------------------------

// Normalize a county string for matching: uppercase, strip periods, collapse
// whitespace. Lets the source's "ST CLAIR" match canonical "St. Clair".
function normCounty(s) {
  return String(s).toUpperCase().replace(/\./g, "").replace(/\s+/g, " ").trim();
}

function aggregateMichiganRetailers(csvBuf, canonicalNames) {
  let text = csvBuf.toString("utf8");
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const lines = text.split(/\r?\n/);
  const header = splitCsvRow(lines[0]);
  const stateIdx = header.indexOf("State");
  const countyIdx = header.indexOf("County");
  const endIdx = header.indexOf("End Date");
  if (stateIdx < 0 || countyIdx < 0 || endIdx < 0) {
    throw new Error(
      `SNAP CSV missing required columns (State=${stateIdx}, County=${countyIdx}, End Date=${endIdx})`,
    );
  }
  const expectedCols = header.length;

  const normToCanonical = new Map(
    canonicalNames.map((n) => [normCounty(n), n]),
  );

  let totalRows = 0;
  let miAllTimeRows = 0;
  let miCurrentRows = 0;
  let blankCounty = 0;
  let unmatchedCounty = 0;
  const unmatchedSamples = new Map();
  const byCanonical = new Map();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    totalRows++;
    const cols = splitCsvRow(line);
    if (cols.length !== expectedCols) {
      throw new Error(
        `SNAP row ${i + 1} has ${cols.length} columns, expected ${expectedCols}`,
      );
    }
    if (cols[stateIdx] !== MI_STATE) continue;
    miAllTimeRows++;
    const endDate = (cols[endIdx] || "").trim();
    if (endDate !== "") continue;
    miCurrentRows++;
    const raw = (cols[countyIdx] || "").trim();
    if (raw === "") {
      blankCounty++;
      continue;
    }
    const canonical = normToCanonical.get(normCounty(raw));
    if (!canonical) {
      unmatchedCounty++;
      unmatchedSamples.set(
        raw,
        (unmatchedSamples.get(raw) ?? 0) + 1,
      );
      continue;
    }
    byCanonical.set(canonical, (byCanonical.get(canonical) ?? 0) + 1);
  }

  const assigned = [...byCanonical.values()].reduce((a, b) => a + b, 0);
  const dropped = blankCounty + unmatchedCounty;

  return {
    totalRows,
    miAllTimeRows,
    miCurrentRows,
    assigned,
    blankCounty,
    unmatchedCounty,
    dropped,
    unmatchedSamples,
    byCanonical,
  };
}

// --- Output ----------------------------------------------------------------

function computeRate(count, population) {
  if (!population || population <= 0) return null;
  return Math.round(((count / population) * 10000) * 100) / 100;
}

function formatEntry(name, row) {
  const key = /^[A-Z][A-Za-z]*$/.test(name) ? name : JSON.stringify(name);
  return `  ${key}: { retailerCount: ${row.retailerCount}, ratePer10k: ${row.ratePer10k.toFixed(2)} },`;
}

function buildFileContent(rows, totals) {
  const sortedKeys = [...rows.keys()].sort((a, b) => a.localeCompare(b));
  const entries = sortedKeys.map((name) => formatEntry(name, rows.get(name)));
  return `/**
 * Generated by scripts/refresh-snap-retailers.mjs. Do not edit by hand.
 * Re-run the script to regenerate.
 *
 * Source: USDA Food and Nutrition Service (FNS), Historical SNAP Retailer
 *   Locator Data 2005-2025 (bulk CSV release).
 *   https://www.fns.usda.gov/snap/retailer/data
 *
 * Metric: count of currently authorized SNAP food retailers in Michigan,
 *   per county, current snapshot (rows whose End Date is blank). Rate is
 *   per 10,000 residents against PEP V2024 population
 *   (see src/data/michigan-county-profiles.ts).
 *
 * Vintage: ${VINTAGE}. USDA's stated currency for the CSV; most
 *   recent Authorization Date in the current set is 2025-09-09. The label
 *   reflects the data's as-of date, not when the script was run.
 *
 * No suppression rule: this is a count of currently authorized businesses,
 *   not a rare health event. Zero-retailer counties (if any) render 0
 *   rather than blanking; no county was zero in the generating extract.
 *
 * County assignment uses the source's own \`County\` field, normalized
 *   case-insensitively and with periods stripped (so "ST CLAIR" matches
 *   "St. Clair"). The script asserts row conservation: the assigned
 *   per-county sum + dropped rows equals the total Michigan currently-
 *   authorized rows pulled.
 *
 * Aggregation totals captured at generation time:
 *   Total MI currently-authorized rows: ${totals.miCurrentRows}
 *   Assigned to a county: ${totals.assigned}
 *   Dropped (blank county): ${totals.blankCounty}
 *   Dropped (unmatched county string): ${totals.unmatchedCounty}
 */

export const SNAP_VINTAGE = "${VINTAGE}";
export const SNAP_SOURCE = "${SOURCE_LABEL}";

export interface CountySnapRetailers {
  /** Count of currently authorized SNAP retailers in the county. */
  retailerCount: number;
  /**
   * Retailers per 10,000 residents, computed as
   * (retailerCount / PEP V2024 population) * 10,000.
   * Two decimal places. Always a number; this metric does not suppress.
   */
  ratePer10k: number;
}

export const COUNTY_SNAP_RETAILERS: Record<string, CountySnapRetailers> = {
${entries.join("\n")}
};
`;
}

// --- Main ------------------------------------------------------------------

async function fetchZipWithManifest() {
  try {
    const buf = await fetchHttp11(ZIP_URL);
    manifestEntries.push(
      createManifestEntry({
        sourceId: SNAP_RETAILERS_SOURCE_ID,
        url: ZIP_URL,
        status: 200,
        contentType: "application/zip",
        payload: buf,
        vintage: VINTAGE,
        valid: true,
      }),
    );
    return buf;
  } catch (err) {
    const statusMatch = /^HTTP (\d+)/.exec(err.message);
    manifestEntries.push(
      createManifestEntry({
        sourceId: SNAP_RETAILERS_SOURCE_ID,
        url: ZIP_URL,
        status: statusMatch ? Number(statusMatch[1]) : null,
        contentType: null,
        payload: Buffer.alloc(0),
        vintage: VINTAGE,
        valid: false,
        invalidReason: err.message,
      }),
    );
    throw err;
  }
}

async function main() {
  console.log(`[refresh-snap-retailers] fetching ${ZIP_URL}...`);
  const zipBuf = await fetchZipWithManifest();
  console.log(
    `[refresh-snap-retailers] got ${(zipBuf.length / 1024 / 1024).toFixed(1)} MB zip`,
  );
  const entries = unzipEntries(zipBuf);
  const { name: csvName, buf: csvBuf } = findCsvEntry(entries);
  console.log(
    `[refresh-snap-retailers] inflated ${csvName}: ${(csvBuf.length / 1024 / 1024).toFixed(1)} MB CSV`,
  );

  const nameToFips = await loadFipsMap();
  const pops = await loadCountyPopulations();
  const canonicalNames = [...nameToFips.keys()];

  const agg = aggregateMichiganRetailers(csvBuf, canonicalNames);

  console.log(
    `[refresh-snap-retailers] rows: total=${agg.totalRows}, MI(all-time)=${agg.miAllTimeRows}, MI(current)=${agg.miCurrentRows}`,
  );
  console.log(
    `[refresh-snap-retailers] assigned=${agg.assigned}, dropped=${agg.dropped} (blank county=${agg.blankCounty}, unmatched=${agg.unmatchedCounty})`,
  );
  if (agg.unmatchedCounty > 0) {
    console.log("[refresh-snap-retailers] unmatched county strings:");
    for (const [s, n] of [...agg.unmatchedSamples.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)) {
      console.log(`  "${s}": ${n}`);
    }
  }

  // Row-conservation assertion: assigned + dropped MUST equal the input.
  if (agg.assigned + agg.dropped !== agg.miCurrentRows) {
    throw new Error(
      `Row conservation failed: assigned ${agg.assigned} + dropped ${agg.dropped} != MI current ${agg.miCurrentRows}`,
    );
  }
  // Halt if more than 1% of MI rows dropped; the data is unusable for a
  // tile that purports to count retailers per county.
  const droppedFrac = agg.dropped / Math.max(1, agg.miCurrentRows);
  if (droppedFrac > 0.01) {
    throw new Error(
      `Dropped fraction ${(droppedFrac * 100).toFixed(2)}% exceeds 1% cap; refusing to write.`,
    );
  }

  // Sanity check: statewide total should be in a sane range. Michigan's
  // SNAP-authorized retailer count has historically been in the 6,000 -
  // 12,000 band; anything outside that is a parse failure, not a real
  // shift.
  if (agg.miCurrentRows < 6000 || agg.miCurrentRows > 12000) {
    throw new Error(
      `Sanity-check failed: ${agg.miCurrentRows} MI currently-authorized rows is outside the expected 6,000 - 12,000 band.`,
    );
  }

  // Build the final per-county rows. Every canonical county must appear;
  // counties with zero retailers render as 0 (rate 0), never blank.
  const rows = new Map();
  for (const name of canonicalNames) {
    const count = agg.byCanonical.get(name) ?? 0;
    const pop = pops.get(name);
    if (pop === undefined) {
      throw new Error(`No population for ${name} in michigan-county-profiles.ts`);
    }
    const ratePer10k = computeRate(count, pop) ?? 0;
    rows.set(name, { retailerCount: count, ratePer10k });
  }

  if (rows.size !== 83) {
    throw new Error(`Expected 83 rows, got ${rows.size}`);
  }

  // Spot-check audit table
  console.log("\n[refresh-snap-retailers] spot-check (6 counties):");
  for (const name of [
    "Wayne",
    "Oakland",
    "Macomb",
    "Kent",
    "Keweenaw",
    "St. Clair",
  ]) {
    const r = rows.get(name);
    if (!r) continue;
    const pop = pops.get(name);
    console.log(
      `  ${name.padEnd(12)} pop ${String(pop).padStart(9)}  retailers ${String(r.retailerCount).padStart(5)}  ${r.ratePer10k.toFixed(2)}/10k`,
    );
  }

  const content = buildFileContent(rows, agg);

  if (manifestEntries.length > 0) {
    const manifestPath = await writeManifest({
      projectRoot,
      buildId: BUILD_ID,
      entries: manifestEntries,
    });
    console.log(`[refresh-snap-retailers] archival manifest: ${path.relative(projectRoot, manifestPath)}`);
  }

  if (!APPLY) {
    console.log(
      `\n[refresh-snap-retailers] dry-run (default). Re-run with --apply to write ${path.relative(projectRoot, outPath)}.`,
    );
    return;
  }

  await writeFile(outPath, content, "utf8");
  console.log(
    `\n[refresh-snap-retailers] wrote ${path.relative(projectRoot, outPath)} (${rows.size} counties).`,
  );
}

main().catch(async (err) => {
  console.error("[refresh-snap-retailers] failed:", err);
  if (manifestEntries.length > 0) {
    try {
      const manifestPath = await writeManifest({
        projectRoot,
        buildId: BUILD_ID,
        entries: manifestEntries,
      });
      console.error(
        `[refresh-snap-retailers] archival manifest written despite failure: ${path.relative(projectRoot, manifestPath)}`,
      );
    } catch (manifestErr) {
      console.error("[refresh-snap-retailers] also failed to write archival manifest:", manifestErr.message);
    }
  }
  process.exit(1);
});
