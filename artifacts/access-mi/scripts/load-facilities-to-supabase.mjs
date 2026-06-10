#!/usr/bin/env node
/**
 * Seed the Supabase facilities table from the verified extract.
 *
 * Reads src/data/verifiedHealthFacilities.json and upserts rows into
 * public.facilities by (source, source_id). Hand-curated rows
 * (source IS NULL) are NOT touched.
 *
 * Required env (NOT committed; service role key is sensitive):
 *   SUPABASE_URL                — project REST URL (https://...supabase.co)
 *   SUPABASE_SERVICE_ROLE_KEY   — service-role key from project dashboard
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node scripts/load-facilities-to-supabase.mjs
 *
 *   --dry-run                   — parse + print, no writes
 *   --report                    — fetch current per-county counts before/after
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const facilitiesPath = path.join(
  projectRoot,
  "src/data/verifiedHealthFacilities.json",
);

const DRY = process.argv.includes("--dry-run");
const REPORT = process.argv.includes("--report") || DRY;

const SUPA_URL = process.env.SUPABASE_URL?.replace(/\/$/, "");
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!DRY && (!SUPA_URL || !SUPA_KEY)) {
  console.error(
    "[load-facilities] missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (use --dry-run to skip)",
  );
  process.exit(1);
}

function toSupabaseRow(f) {
  // Map the verified extract row -> facilities table columns.
  // Coordinates may be null; the migration drops NOT NULL on latitude/longitude.
  return {
    name: f.name,
    address: f.address ?? "",
    city: f.city ?? "",
    county: f.county,
    state: "MI",
    zip: f.zip ?? "",
    facility_type: f.type === "fqhc" ? "clinic" : "hospital",
    system_affiliation: f.operator_org ?? f.ownership ?? null,
    latitude: f.lat,
    longitude: f.lng,
    phone: f.phone,
    source: f.source,
    source_id: f.source_id,
    source_url: f.source_url,
    verified_at: new Date().toISOString(),
  };
}

async function rest(method, pathSuffix, body) {
  const res = await fetch(`${SUPA_URL}/rest/v1/${pathSuffix}`, {
    method,
    headers: {
      apikey: SUPA_KEY,
      Authorization: `Bearer ${SUPA_KEY}`,
      "Content-Type": "application/json",
      Prefer:
        method === "POST" ? "resolution=merge-duplicates,return=minimal" : "",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${pathSuffix} -> ${res.status}: ${text}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return null;
}

async function countsByCounty() {
  // PostgREST count grouping needs an RPC or a server function; do it the
  // simple way: pull just (county) and count locally. Limited to 10k rows.
  const rows = await rest("GET", "facilities?select=county&limit=10000");
  const m = {};
  for (const r of rows) m[r.county] = (m[r.county] ?? 0) + 1;
  return m;
}

async function main() {
  const payload = JSON.parse(await readFile(facilitiesPath, "utf8"));
  const facilities = payload.facilities ?? [];
  console.log(
    `[load-facilities] extract: ${facilities.length} rows; vintage ${payload.provenance?.fetched_at?.slice(0, 10)}`,
  );

  let before = {};
  if (REPORT && !DRY) {
    before = await countsByCounty();
    const total = Object.values(before).reduce((a, b) => a + b, 0);
    console.log(
      `[load-facilities] before: ${total} rows across ${Object.keys(before).length} counties`,
    );
  }

  if (DRY) {
    console.log("[load-facilities] --dry-run: printing first 3 transformed rows");
    facilities.slice(0, 3).forEach((f) => console.log(JSON.stringify(toSupabaseRow(f))));
    return;
  }

  // Upsert in batches to stay under PostgREST request limits.
  const BATCH = 100;
  let written = 0;
  for (let i = 0; i < facilities.length; i += BATCH) {
    const slice = facilities.slice(i, i + BATCH).map(toSupabaseRow);
    await rest("POST", "facilities?on_conflict=source,source_id", slice);
    written += slice.length;
    if (i % 200 === 0)
      console.log(`  upserted ${written}/${facilities.length}`);
  }
  console.log(`[load-facilities] upserted ${written} rows`);

  if (REPORT) {
    const after = await countsByCounty();
    const total = Object.values(after).reduce((a, b) => a + b, 0);
    console.log(
      `[load-facilities] after: ${total} rows across ${Object.keys(after).length} counties`,
    );
    const counties = Object.keys({ ...before, ...after }).sort();
    console.log(`\n${"County".padEnd(20)} ${"Before".padStart(8)} ${"After".padStart(8)} ${"Δ".padStart(6)}`);
    for (const c of counties) {
      const b = before[c] ?? 0;
      const a = after[c] ?? 0;
      const d = a - b;
      const flag = d !== 0 ? "*" : " ";
      console.log(`${flag}${c.padEnd(19)} ${String(b).padStart(8)} ${String(a).padStart(8)} ${String(d).padStart(6)}`);
    }
  }
}

main().catch((err) => {
  console.error("[load-facilities] failed:", err.message);
  process.exit(1);
});
