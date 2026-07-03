#!/usr/bin/env node
/**
 * Refresh `src/data/acs-broadband-county.generated.json` (data) and
 * `src/data/acs-broadband-county.ts` (typed shim) from the U.S. Census
 * American Community Survey 5-Year (B28002 - Types of Internet
 * Subscriptions in Household).
 *
 * Ships as the county-level BROADBAND SUBSCRIPTION signal after the
 * FCC BDC availability data was found unreachable from the ingest
 * environment. Different metric (adoption / subscription, not raw
 * availability) with different provenance:
 *
 *   Source     Census ACS 5-Year, table B28002 (Types of Internet
 *              Subscriptions in Household)
 *   Universe   Households (B28002_001E)
 *   Numerator  Households with a broadband Internet subscription
 *              (any type: cable, fiber, DSL, satellite, cellular data)
 *              (B28002_007E - "With a broadband Internet subscription")
 *
 * Provenance VERIFIED: the value is a direct Census tabulation for the
 * county (not modeled). ACS 5-Year has full 83-county coverage in
 * Michigan.
 *
 * Vintage read from the ACS release the endpoint returns; the release
 * year is echoed into the generated provenance block.
 *
 * Follows the seed-trend-series.mjs "pending-ci" pattern for local
 * dev: if CENSUS_API_KEY is not set in the env, this script writes a
 * pending-ci stub (all 83 counties partitioned, values null, status
 * "pending-ci") so downstream code can compile and route/render the
 * coverage state. CI runs with CENSUS_API_KEY set to populate real
 * values.
 *
 * Run with --apply to write both files; without --apply the script
 * prints a summary and exits.
 */
import { writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const registryPath = path.join(projectRoot, "src/data/census-geographies.ts");
const outJsonPath = path.join(
  projectRoot,
  "src/data/acs-broadband-county.generated.json",
);
const outTsPath = path.join(projectRoot, "src/data/acs-broadband-county.ts");

const APPLY = process.argv.includes("--apply");
const CENSUS_API_KEY = process.env.CENSUS_API_KEY ?? "";

const ACS_VINTAGE = 2023; // most recent ACS 5-Year stable release
const ACS_WINDOW = `${ACS_VINTAGE - 4}-${ACS_VINTAGE}`;
const ACS_BASE = "https://api.census.gov/data";
const ACS_TABLE = "B28002";
const ACS_NUMERATOR = "B28002_007E";
const ACS_UNIVERSE = "B28002_001E";
const ACS_NUMERATOR_MOE = "B28002_007M";
const ACS_UNIVERSE_MOE = "B28002_001M";
const ACS_TABLE_URL = `https://data.census.gov/table/ACSDT5Y${ACS_VINTAGE}.B28002`;
const SOURCE_LANDING =
  "https://www.census.gov/programs-surveys/acs/data.html";

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
    const name = (m[1] ?? m[2]).trim();
    fips.set(`26${m[3]}`, name);
  }
  if (fips.size === 0) throw new Error("No MI county FIPS parsed");
  return fips;
}

async function fetchAcs(miFips) {
  const params = new URLSearchParams({
    get: `NAME,${ACS_UNIVERSE},${ACS_NUMERATOR},${ACS_UNIVERSE_MOE},${ACS_NUMERATOR_MOE}`,
    for: "county:*",
    in: "state:26",
    key: CENSUS_API_KEY,
  });
  const url = `${ACS_BASE}/${ACS_VINTAGE}/acs/acs5?${params}`;
  const res = await fetch(url, {
    headers: {
      "user-agent": "accessmi-data-refresh",
      accept: "application/json",
    },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ACS`);
  const rows = await res.json();
  if (!Array.isArray(rows) || rows.length < 2) {
    throw new Error("ACS returned no rows (schema drift or key rejected)");
  }
  const header = rows[0];
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));
  const need = [
    "NAME",
    ACS_UNIVERSE,
    ACS_NUMERATOR,
    ACS_UNIVERSE_MOE,
    ACS_NUMERATOR_MOE,
    "state",
    "county",
  ];
  for (const c of need) {
    if (idx[c] === undefined) {
      throw new Error(`Schema drift: ACS response missing "${c}" column`);
    }
  }
  const byFips = new Map();
  for (const r of rows.slice(1)) {
    const fips = `${r[idx["state"]]}${r[idx["county"]]}`;
    byFips.set(fips, {
      universe: Number(r[idx[ACS_UNIVERSE]]),
      broadband: Number(r[idx[ACS_NUMERATOR]]),
      universeMoe: Number(r[idx[ACS_UNIVERSE_MOE]]),
      broadbandMoe: Number(r[idx[ACS_NUMERATOR_MOE]]),
    });
  }
  return byFips;
}

function buildStubCounties(miFips) {
  const records = [];
  for (const [fips, name] of [...miFips.entries()].sort()) {
    records.push({
      countyFips: fips,
      countyName: name,
      status: "pending-ci",
      households: null,
      householdsWithBroadband: null,
      broadbandSubscriptionRate: null,
      householdsMoe: null,
      householdsWithBroadbandMoe: null,
      pendingReason:
        "Requires CENSUS_API_KEY. Run refresh-acs-broadband-county.mjs in CI with the key set to populate real values.",
    });
  }
  return records;
}

function buildPopulatedCounties(miFips, byFips) {
  const records = [];
  const missing = [];
  for (const [fips, name] of [...miFips.entries()].sort()) {
    const row = byFips.get(fips);
    if (!row || !Number.isFinite(row.universe) || row.universe <= 0) {
      missing.push(`${name} (${fips})`);
      records.push({
        countyFips: fips,
        countyName: name,
        status: "no-data",
        households: null,
        householdsWithBroadband: null,
        broadbandSubscriptionRate: null,
        householdsMoe: null,
        householdsWithBroadbandMoe: null,
        pendingReason: "ACS returned no or zero-universe row for this county.",
      });
      continue;
    }
    const rate =
      Math.round((row.broadband / row.universe) * 10_000) / 100; // percent, 2 decimals
    records.push({
      countyFips: fips,
      countyName: name,
      status: "populated",
      households: row.universe,
      householdsWithBroadband: row.broadband,
      broadbandSubscriptionRate: rate,
      householdsMoe: Number.isFinite(row.universeMoe) ? row.universeMoe : null,
      householdsWithBroadbandMoe: Number.isFinite(row.broadbandMoe)
        ? row.broadbandMoe
        : null,
      pendingReason: null,
    });
  }
  return { records, missing };
}

function buildProvenance(ingestedAt, populated) {
  return {
    source_name: `U.S. Census Bureau ACS 5-Year (${ACS_WINDOW}), table B28002`,
    source_url: SOURCE_LANDING,
    acs_table_url: ACS_TABLE_URL,
    api_base: ACS_BASE,
    dataset: `${ACS_VINTAGE}/acs/acs5`,
    vintage_window: ACS_WINDOW,
    numerator_variable: ACS_NUMERATOR,
    numerator_label:
      "Households with a broadband Internet subscription (any type)",
    universe_variable: ACS_UNIVERSE,
    universe_label: "Households (universe)",
    numerator_moe_variable: ACS_NUMERATOR_MOE,
    universe_moe_variable: ACS_UNIVERSE_MOE,
    ingested_at: ingestedAt,
    ingest_script: "scripts/refresh-acs-broadband-county.mjs",
    michigan_county_registry: "src/data/census-geographies.ts",
    michigan_county_registry_size: 83,
    value_label: "VERIFIED",
    populated,
    notes:
      "Numerator is broadband subscription in the household (adoption). This is NOT the FCC BDC availability metric (which measures whether service reaches a location). ACS 5-Year has full 83-county coverage in Michigan and does not suppress at county level for this table. When populated, values are direct Census tabulations; when status = 'pending-ci', the ingest environment lacked CENSUS_API_KEY and the file must be re-run in CI to populate. householdsMoe / householdsWithBroadbandMoe are the ACS margins of error for the corresponding estimates, at the same 90% confidence level Census publishes them at; this script stores them raw and does not compute a reliability flag.",
  };
}

function buildTsShim(populated) {
  return `/**
 * Typed accessor for ACS county broadband subscription data. The JSON
 * payload lives in acs-broadband-county.generated.json so the fixture
 * is diffable and the vintage metadata can be read at build time
 * without touching this shim.
 *
 * This is the ADOPTION signal (Census ACS B28002: household broadband
 * subscription), not the AVAILABILITY signal (FCC BDC). The two
 * measure different phenomena; do not conflate.
 */
import raw from "./acs-broadband-county.generated.json";

/** One county's broadband subscription record. */
export interface AcsBroadbandCountyRecord {
  countyFips: string;
  countyName: string;
  /** "populated" when real values are present, "pending-ci" when the
   * ingest environment lacked CENSUS_API_KEY and CI must re-run, or
   * "no-data" when ACS returned nothing for the county. */
  status: "populated" | "pending-ci" | "no-data";
  /** ACS B28002_001E - total households (universe), or null. */
  households: number | null;
  /** ACS B28002_007E - households with any broadband subscription, or null. */
  householdsWithBroadband: number | null;
  /** Percent, 2 decimals, computed as broadband / households * 100, or null. */
  broadbandSubscriptionRate: number | null;
  /** ACS B28002_001M - margin of error for households (90% confidence), or null. */
  householdsMoe: number | null;
  /** ACS B28002_007M - margin of error for broadband households (90% confidence), or null. */
  householdsWithBroadbandMoe: number | null;
  /** Human-readable reason when the record is not populated. */
  pendingReason: string | null;
}

export interface AcsBroadbandCountyProvenance {
  source_name: string;
  source_url: string;
  acs_table_url: string;
  api_base: string;
  dataset: string;
  vintage_window: string;
  numerator_variable: string;
  numerator_label: string;
  universe_variable: string;
  universe_label: string;
  numerator_moe_variable: string;
  universe_moe_variable: string;
  ingested_at: string;
  ingest_script: string;
  michigan_county_registry: string;
  michigan_county_registry_size: number;
  value_label: "VERIFIED";
  /** True when this generated file carries real values, false when
   * every county is in "pending-ci" state. */
  populated: boolean;
  notes: string;
}

interface Payload {
  provenance: AcsBroadbandCountyProvenance;
  counties: AcsBroadbandCountyRecord[];
}

const payload = raw as Payload;

export const ACS_BROADBAND_COUNTY_PROVENANCE: AcsBroadbandCountyProvenance =
  payload.provenance;
export const ACS_BROADBAND_COUNTY_RECORDS: readonly AcsBroadbandCountyRecord[] =
  payload.counties;

const BY_FIPS = new Map<string, AcsBroadbandCountyRecord>(
  payload.counties.map((c) => [c.countyFips, c]),
);
const BY_NAME = new Map<string, AcsBroadbandCountyRecord>(
  payload.counties.map((c) => [c.countyName, c]),
);

export function getAcsBroadbandForCountyFips(
  fips: string,
): AcsBroadbandCountyRecord | null {
  return BY_FIPS.get(fips) ?? null;
}

export function getAcsBroadbandForCountyName(
  name: string,
): AcsBroadbandCountyRecord | null {
  return BY_NAME.get(name) ?? null;
}

/** True iff every county has a real broadband subscription rate. */
export const ACS_BROADBAND_IS_POPULATED = ${populated};
`;
}

async function main() {
  const miFips = await loadMiCountyFips();
  console.log(
    `[refresh-acs-broadband-county] MI counties in registry: ${miFips.size}`,
  );

  const hasKey = CENSUS_API_KEY.length > 0;
  console.log(
    `[refresh-acs-broadband-county] CENSUS_API_KEY: ${hasKey ? "set" : "NOT set (will write pending-ci stub)"}`,
  );

  let records;
  let populated;
  let missing = [];
  if (hasKey) {
    console.log(
      `[refresh-acs-broadband-county] fetching ACS 5-Year ${ACS_WINDOW} B28002 for MI counties...`,
    );
    const byFips = await fetchAcs(miFips);
    console.log(
      `[refresh-acs-broadband-county] ACS returned rows for ${byFips.size} MI counties`,
    );
    const built = buildPopulatedCounties(miFips, byFips);
    records = built.records;
    missing = built.missing;
    populated = missing.length === 0;
    if (missing.length > 0) {
      console.warn(
        `[refresh-acs-broadband-county] ACS did not populate ${missing.length} counties: ${missing.join(", ")}`,
      );
    }
  } else {
    records = buildStubCounties(miFips);
    populated = false;
  }

  if (records.length !== 83) {
    throw new Error(
      `Sanity: county count ${records.length} != 83.`,
    );
  }

  if (populated) {
    for (const r of records) {
      const rate = r.broadbandSubscriptionRate;
      if (rate === null) continue;
      if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
        throw new Error(
          `Sanity: broadbandSubscriptionRate ${rate} for ${r.countyName} outside [0, 100].`,
        );
      }
    }
    console.log("[refresh-acs-broadband-county] first 3 counties:");
    for (const r of records.slice(0, 3)) {
      console.log(
        `  ${r.countyFips} ${r.countyName}  households=${r.households}  broadband=${r.householdsWithBroadband}  rate=${r.broadbandSubscriptionRate}%`,
      );
    }
  } else {
    console.log(
      `[refresh-acs-broadband-county] stub written: 83 counties in pending-ci state.`,
    );
  }

  const ingestedAt = new Date().toISOString();
  const payload = {
    provenance: buildProvenance(ingestedAt, populated),
    counties: records,
  };
  const shim = buildTsShim(populated ? "true" : "false");

  if (!APPLY) {
    console.log(
      `\n[refresh-acs-broadband-county] dry-run. Re-run with --apply to write ${path.relative(projectRoot, outJsonPath)} + ${path.relative(projectRoot, outTsPath)}.`,
    );
    return;
  }
  await writeFile(outJsonPath, JSON.stringify(payload, null, 2), "utf8");
  await writeFile(outTsPath, shim, "utf8");
  console.log(
    `\n[refresh-acs-broadband-county] wrote ${path.relative(projectRoot, outJsonPath)} (${records.length} counties, populated=${populated}) and ${path.relative(projectRoot, outTsPath)}.`,
  );
}

main().catch((err) => {
  console.error("[refresh-acs-broadband-county] failed:", err);
  process.exit(1);
});
