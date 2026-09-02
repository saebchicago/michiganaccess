#!/usr/bin/env node
/**
 * Refresh `src/data/hud-chas-county.generated.json` (data) and
 * `src/data/hud-chas-county.ts` (typed shim) from HUD's Comprehensive
 * Housing Affordability Strategy (CHAS) county summary file.
 *
 *   Source     HUD Office of Policy Development and Research, CHAS
 *              5-year county file (summary level 050), Table 8:
 *              "Household income by cost burden", by tenure.
 *   Landing    https://www.huduser.gov/portal/datasets/cp.html
 *   Download   https://www.huduser.gov/portal/datasets/cp/<vintage>-050-csv.zip
 *   Universe   Occupied housing units (T8_est1)
 *   Numerators Households paying more than 30% (and more than 50%) of
 *              income on housing costs, summed across HUD income bands
 *              and tenures.
 *
 * Provenance VERIFIED: every figure is a HUD special tabulation of ACS
 * microdata for the county, not a model. Percents here are computed from
 * HUD's own counts; the counts are shipped alongside so the arithmetic is
 * auditable.
 *
 * Vintage: the newest candidate in CHAS_VINTAGES that HUD serves wins;
 * the one actually used is echoed into provenance.vintage_window. This
 * script never hardcodes a release date.
 *
 * Column contract. CHAS Table 8 carries 53 estimate columns
 * (T8_est1..T8_est53) in a fixed nesting: tenure (owner, renter) x HUD
 * income band (<=30%, 30-50%, 50-80%, 80-100%, >100% of HAMFI) x cost
 * burden (<=30%, >30-50%, >50%, not computed). Rather than trust that
 * mapping blindly, the parser asserts the identities the layout implies
 * (owner + renter = total; each income subtotal = the sum of its four
 * burden cells) and refuses to write if any fails. A dictionary change at
 * HUD therefore turns into a loud failure, not a wrong number.
 *
 * Follows the refresh-acs-broadband-county.mjs "pending-ci" pattern: any
 * fetch or parse failure with --apply writes a stub (all 83 counties,
 * values null, status "pending-ci", value_label PENDING) so downstream
 * code compiles and renders the coverage state honestly. It never writes
 * partial data.
 *
 * Run with --apply to write both files; without --apply it prints a
 * summary. --require-live makes a fetch failure fatal instead of writing
 * the stub (for CI runs that must not regress a populated file).
 */
import { writeFile, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { fetchAndRecord, writeManifest } from "./lib/ingest-manifest.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const registryPath = path.join(projectRoot, "src/data/census-geographies.ts");
const outJsonPath = path.join(
  projectRoot,
  "src/data/hud-chas-county.generated.json",
);
const outTsPath = path.join(projectRoot, "src/data/hud-chas-county.ts");

const APPLY = process.argv.includes("--apply");
const REQUIRE_LIVE = process.argv.includes("--require-live");

/** Newest first. The first one HUD serves is used. */
const CHAS_VINTAGES = ["2018thru2022", "2017thru2021"];
const SOURCE_LANDING = "https://www.huduser.gov/portal/datasets/cp.html";
const zipUrl = (v) =>
  `https://www.huduser.gov/portal/datasets/cp/${v}-050-csv.zip`;
const vintageWindow = (v) => v.replace("thru", "-");

// HUD income bands in Table 8 order, with the platform's field keys.
const INCOME_BANDS = [
  { key: "le30ami", label: "<= 30% HAMFI" },
  { key: "gt30le50ami", label: "> 30% to <= 50% HAMFI" },
  { key: "gt50le80ami", label: "> 50% to <= 80% HAMFI" },
  { key: "gt80le100ami", label: "> 80% to <= 100% HAMFI" },
  { key: "gt100ami", label: "> 100% HAMFI" },
];
// Table 8 layout: est1 total; owner block est2..est27; renter block est28..est53.
// Within a tenure block: [tenure subtotal], then per income band
// [band subtotal, burden<=30, burden>30-50, burden>50, not computed].
const TENURE_BLOCKS = [
  { key: "owner", start: 2 },
  { key: "renter", start: 28 },
];

// --- Minimal zip reader (inflate, no ZIP64) -------------------------------
// Same dependency-free reader as refresh-fars.mjs / build-snap-county-dataset.
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

// RFC 4180-ish CSV parser (quoted fields, doubled quotes, CRLF). Same as
// refresh-hrsa-hpsa-county.mjs.
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
        } else inQuote = false;
      } else field += c;
      continue;
    }
    if (c === '"') inQuote = true;
    else if (c === ",") {
      cur.push(field);
      field = "";
    } else if (c === "\n") {
      cur.push(field);
      field = "";
      rows.push(cur);
      cur = [];
    } else if (c !== "\r") field += c;
  }
  if (field.length > 0 || cur.length > 0) {
    cur.push(field);
    rows.push(cur);
  }
  return rows;
}

async function loadMiCountyFips() {
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
    fips.set(`26${m[3]}`, (m[1] ?? m[2]).trim());
  }
  if (fips.size === 0) throw new Error("No MI county FIPS parsed");
  return fips;
}

const manifestEntries = [];
const BUILD_ID = `refresh-hud-chas-county-${new Date().toISOString().replace(/[:.]/g, "-")}`;

/** Try each vintage newest-first; return the first zip HUD serves. */
async function fetchNewestZip() {
  const errors = [];
  for (const vintage of CHAS_VINTAGES) {
    try {
      const buf = await fetchAndRecord({
        sourceId: `hud-chas-county-${vintage}`,
        url: zipUrl(vintage),
        headers: {
          "user-agent": "accessmi-data-refresh",
          accept: "application/zip,application/octet-stream,*/*",
        },
        vintage: vintageWindow(vintage),
        minBytes: 100_000,
        binary: true,
        entries: manifestEntries,
      });
      return { vintage, buf };
    } catch (err) {
      errors.push(`${vintage}: ${err.message}`);
    }
  }
  throw new Error(`No CHAS county zip could be fetched. ${errors.join(" | ")}`);
}

function findTable8(entries) {
  for (const [name, content] of entries) {
    if (/(^|\/)Table8\.csv$/i.test(name)) return content;
  }
  throw new Error("Table8.csv not found in CHAS zip");
}

function num(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error(`non-numeric CHAS cell "${v}"`);
  return n;
}

function pct(numer, denom) {
  return denom > 0 ? Math.round((numer / denom) * 1000) / 10 : null;
}

/**
 * Parse Table 8 into per-county records. Asserts the layout identities so
 * a shifted or renamed column fails here instead of shipping.
 */
function parseTable8(csvBuf, miFips) {
  const rows = parseCsv(csvBuf.toString("utf8"));
  const header = rows[0].map((h) => h.trim());
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));
  for (const c of ["geoid", "T8_est1", "T8_est53"]) {
    if (idx[c] === undefined) {
      throw new Error(`Schema drift: CHAS Table 8 missing column "${c}"`);
    }
  }
  if (idx["T8_est54"] !== undefined) {
    throw new Error("Schema drift: CHAS Table 8 has more than 53 estimate columns");
  }
  const est = (row, n) => num(row[idx[`T8_est${n}`]]);

  const byFips = new Map();
  for (const row of rows.slice(1)) {
    if (row.length < header.length) continue;
    const geoid = row[idx["geoid"]];
    const m = /^05000US(\d{5})$/.exec(geoid ?? "");
    if (!m || !miFips.has(m[1])) continue;
    const fips = m[1];

    const total = est(row, 1);
    let cb30 = 0;
    let cb50 = 0;
    const byTenure = {};
    const bandTotals = INCOME_BANDS.map(() => ({ households: 0, cb30: 0, cb50: 0 }));

    for (const block of TENURE_BLOCKS) {
      const tenureTotal = est(row, block.start);
      let tenureSum = 0;
      let tenureCb30 = 0;
      let p = block.start + 1;
      INCOME_BANDS.forEach((band, bi) => {
        const bandTotal = est(row, p);
        const le30 = est(row, p + 1);
        const b30to50 = est(row, p + 2);
        const gt50 = est(row, p + 3);
        const notComputed = est(row, p + 4);
        if (bandTotal !== le30 + b30to50 + gt50 + notComputed) {
          throw new Error(
            `CHAS layout identity failed for ${fips} ${block.key} ${band.key}: ` +
              `${bandTotal} != ${le30}+${b30to50}+${gt50}+${notComputed}`,
          );
        }
        tenureSum += bandTotal;
        tenureCb30 += b30to50 + gt50;
        bandTotals[bi].households += bandTotal;
        bandTotals[bi].cb30 += b30to50 + gt50;
        bandTotals[bi].cb50 += gt50;
        cb30 += b30to50 + gt50;
        cb50 += gt50;
        p += 5;
      });
      if (tenureSum !== tenureTotal) {
        throw new Error(
          `CHAS layout identity failed for ${fips} ${block.key}: ${tenureSum} != ${tenureTotal}`,
        );
      }
      byTenure[block.key] = { households: tenureTotal, costBurdened30Pct: pct(tenureCb30, tenureTotal) };
    }
    const ownerRenter = byTenure.owner.households + byTenure.renter.households;
    if (ownerRenter !== total) {
      throw new Error(`CHAS layout identity failed for ${fips}: owner+renter ${ownerRenter} != total ${total}`);
    }

    const byIncomeBand = {};
    INCOME_BANDS.forEach((band, bi) => {
      byIncomeBand[band.key] = {
        households: bandTotals[bi].households,
        costBurdened30Pct: pct(bandTotals[bi].cb30, bandTotals[bi].households),
        costBurdened50Pct: pct(bandTotals[bi].cb50, bandTotals[bi].households),
      };
    });

    byFips.set(fips, {
      households: total,
      costBurdened30Households: cb30,
      costBurdened50Households: cb50,
      costBurdened30Pct: pct(cb30, total),
      costBurdened50Pct: pct(cb50, total),
      ownerCostBurdened30Pct: byTenure.owner.costBurdened30Pct,
      renterCostBurdened30Pct: byTenure.renter.costBurdened30Pct,
      byIncomeBand,
    });
  }
  return byFips;
}

function buildStubCounties(miFips, reason) {
  return [...miFips.entries()].sort().map(([fips, name]) => ({
    countyFips: fips,
    countyName: name,
    status: "pending-ci",
    households: null,
    costBurdened30Households: null,
    costBurdened50Households: null,
    costBurdened30Pct: null,
    costBurdened50Pct: null,
    ownerCostBurdened30Pct: null,
    renterCostBurdened30Pct: null,
    byIncomeBand: null,
    pendingReason: reason,
  }));
}

function buildPopulatedCounties(miFips, byFips) {
  const records = [];
  const missing = [];
  for (const [fips, name] of [...miFips.entries()].sort()) {
    const row = byFips.get(fips);
    if (!row || row.households <= 0) {
      missing.push(`${name} (${fips})`);
      continue;
    }
    records.push({ countyFips: fips, countyName: name, status: "populated", ...row, pendingReason: null });
  }
  return { records, missing };
}

function buildProvenance({ ingestedAt, populated, vintage, zipSha256, pendingReason }) {
  return {
    source_name: `HUD Comprehensive Housing Affordability Strategy (CHAS) county file, ${vintage ? vintageWindow(vintage) : "vintage pending"}`,
    source_url: SOURCE_LANDING,
    download_url: vintage ? zipUrl(vintage) : null,
    zip_sha256: zipSha256,
    table: "Table 8 - Household income by cost burden, by tenure",
    vintage_window: vintage ? vintageWindow(vintage) : null,
    candidate_vintages: CHAS_VINTAGES,
    income_bands: INCOME_BANDS.map((b) => `${b.key}: ${b.label}`),
    ingested_at: ingestedAt,
    ingest_script: "scripts/refresh-hud-chas-county.mjs",
    michigan_county_registry: "src/data/census-geographies.ts",
    michigan_county_registry_size: 83,
    value_label: populated ? "VERIFIED" : "PENDING",
    populated,
    pending_reason: pendingReason,
    notes:
      "HUD CHAS is a special tabulation of ACS 5-year microdata against HUD Area Median Family Income (HAMFI) bands. Cost burden = gross housing costs as a share of household income; >30% is the HUD affordability threshold, >50% is severe. Counts are HUD's; percents are computed here from those counts and the counts ship alongside. 'Not computed' burden cells (zero or negative income) stay in the universe and out of the numerator, so shares are conservative. When status = 'pending-ci' the ingest environment could not reach huduser.gov and the file must be re-run on the scheduled dataset-refresh workflow to populate.",
  };
}

function buildTsShim(populated) {
  return `/**
 * Typed accessor for HUD CHAS county housing cost burden. The JSON payload
 * lives in hud-chas-county.generated.json so the fixture is diffable and
 * the vintage can be read at build time without touching this shim.
 * Regenerated by scripts/refresh-hud-chas-county.mjs; do not hand-edit.
 */
import raw from "./hud-chas-county.generated.json";

export interface ChasIncomeBandRecord {
  households: number;
  costBurdened30Pct: number | null;
  costBurdened50Pct: number | null;
}

export interface HudChasCountyRecord {
  countyFips: string;
  countyName: string;
  /** "populated" when HUD counts are present; "pending-ci" when the ingest
   * environment could not reach huduser.gov and CI must re-run. */
  status: "populated" | "pending-ci";
  /** T8_est1 - occupied housing units (universe), or null. */
  households: number | null;
  /** Households paying more than 30% of income on housing, or null. */
  costBurdened30Households: number | null;
  /** Households paying more than 50% of income on housing, or null. */
  costBurdened50Households: number | null;
  costBurdened30Pct: number | null;
  costBurdened50Pct: number | null;
  ownerCostBurdened30Pct: number | null;
  renterCostBurdened30Pct: number | null;
  byIncomeBand: Record<
    "le30ami" | "gt30le50ami" | "gt50le80ami" | "gt80le100ami" | "gt100ami",
    ChasIncomeBandRecord
  > | null;
  pendingReason: string | null;
}

export interface HudChasCountyProvenance {
  source_name: string;
  source_url: string;
  download_url: string | null;
  zip_sha256: string | null;
  table: string;
  vintage_window: string | null;
  candidate_vintages: string[];
  income_bands: string[];
  ingested_at: string;
  ingest_script: string;
  michigan_county_registry: string;
  michigan_county_registry_size: number;
  value_label: "VERIFIED" | "PENDING";
  populated: boolean;
  pending_reason: string | null;
  notes: string;
}

interface Payload {
  provenance: HudChasCountyProvenance;
  counties: HudChasCountyRecord[];
}

const payload = raw as Payload;

export const HUD_CHAS_COUNTY_PROVENANCE: HudChasCountyProvenance =
  payload.provenance;
export const HUD_CHAS_COUNTY_RECORDS: readonly HudChasCountyRecord[] =
  payload.counties;

const BY_FIPS = new Map<string, HudChasCountyRecord>(
  payload.counties.map((c) => [c.countyFips, c]),
);
const BY_NAME = new Map<string, HudChasCountyRecord>(
  payload.counties.map((c) => [c.countyName, c]),
);

export function getChasForCountyFips(fips: string): HudChasCountyRecord | null {
  return BY_FIPS.get(fips) ?? null;
}

export function getChasForCountyName(name: string): HudChasCountyRecord | null {
  return BY_NAME.get(name.replace(/\\s+County$/i, "").trim()) ?? null;
}

/** True iff every county carries HUD counts. */
export const HUD_CHAS_IS_POPULATED = ${populated};
`;
}

async function main() {
  const miFips = await loadMiCountyFips();
  console.log(`[refresh-hud-chas-county] MI counties in registry: ${miFips.size}`);

  let records;
  let populated = false;
  let vintage = null;
  let zipSha256 = null;
  let pendingReason = null;
  try {
    const got = await fetchNewestZip();
    vintage = got.vintage;
    zipSha256 = createHash("sha256").update(got.buf).digest("hex");
    console.log(`[refresh-hud-chas-county] fetched ${vintage} (${got.buf.length} bytes, sha256 ${zipSha256.slice(0, 12)}...)`);
    const byFips = parseTable8(findTable8(unzipEntries(got.buf)), miFips);
    const built = buildPopulatedCounties(miFips, byFips);
    if (built.missing.length > 0) {
      throw new Error(`CHAS county file lacks ${built.missing.length} MI counties: ${built.missing.join(", ")}`);
    }
    records = built.records;
    populated = true;
  } catch (err) {
    if (REQUIRE_LIVE) throw err;
    pendingReason = `Could not fetch or parse the HUD CHAS county file (${err.message}). Re-run scripts/refresh-hud-chas-county.mjs --apply on the scheduled dataset-refresh workflow to populate real values.`;
    console.warn(`[refresh-hud-chas-county] ${pendingReason}`);
    records = buildStubCounties(miFips, pendingReason);
  }

  if (records.length !== 83) throw new Error(`Sanity: county count ${records.length} != 83.`);
  if (populated) {
    for (const r of records) {
      for (const k of ["costBurdened30Pct", "costBurdened50Pct", "ownerCostBurdened30Pct", "renterCostBurdened30Pct"]) {
        const v = r[k];
        if (v !== null && (v < 0 || v > 100)) throw new Error(`Sanity: ${k} ${v} for ${r.countyName} outside [0, 100].`);
      }
      if (!(r.costBurdened50Households <= r.costBurdened30Households && r.costBurdened30Households <= r.households)) {
        throw new Error(`Sanity: burden ordering failed for ${r.countyName}.`);
      }
    }
    console.log("[refresh-hud-chas-county] first 3 counties:");
    for (const r of records.slice(0, 3)) {
      console.log(`  ${r.countyFips} ${r.countyName}  households=${r.households}  >30%=${r.costBurdened30Pct}%  >50%=${r.costBurdened50Pct}%`);
    }
  } else {
    console.log("[refresh-hud-chas-county] stub: 83 counties in pending-ci state.");
  }

  const payload = {
    provenance: buildProvenance({ ingestedAt: new Date().toISOString(), populated, vintage, zipSha256, pendingReason }),
    counties: records,
  };
  const shim = buildTsShim(populated ? "true" : "false");

  if (!APPLY) {
    console.log(`\n[refresh-hud-chas-county] dry-run. Re-run with --apply to write ${path.relative(projectRoot, outJsonPath)} + ${path.relative(projectRoot, outTsPath)}.`);
    return;
  }
  await writeFile(outJsonPath, JSON.stringify(payload, null, 2) + "\n", "utf8");
  await writeFile(outTsPath, shim, "utf8");
  console.log(`\n[refresh-hud-chas-county] wrote ${path.relative(projectRoot, outJsonPath)} (${records.length} counties, populated=${populated}) and ${path.relative(projectRoot, outTsPath)}.`);

  if (manifestEntries.length > 0) {
    const manifestPath = await writeManifest({ projectRoot, buildId: BUILD_ID, entries: manifestEntries });
    console.log(`  archival manifest: ${path.relative(projectRoot, manifestPath)}`);
  }
}

main().catch(async (err) => {
  console.error("[refresh-hud-chas-county] failed:", err);
  if (manifestEntries.length > 0) {
    try {
      const manifestPath = await writeManifest({ projectRoot, buildId: BUILD_ID, entries: manifestEntries });
      console.error(`[refresh-hud-chas-county] archival manifest written despite failure: ${path.relative(projectRoot, manifestPath)}`);
    } catch (manifestErr) {
      console.error("[refresh-hud-chas-county] also failed to write archival manifest:", manifestErr.message);
    }
  }
  process.exit(1);
});
