#!/usr/bin/env node
/**
 * Build the verified Michigan health-facility dataset under Definition B:
 *
 *   facility := CMS-certified hospital (any type)
 *             | HRSA-active Health Center service delivery / admin+service site
 *
 * Outputs:
 *   src/data/verifiedHealthFacilities.json   — full per-row dataset
 *   src/data/countyFacilityReference.json    — { "County Name": count } for the guard
 *
 * Re-run on each future CMS/HRSA refresh; do not hand-edit either file.
 *
 * Usage:
 *   node scripts/build-facility-dataset.mjs            # write outputs
 *   node scripts/build-facility-dataset.mjs --dry-run  # validate, no writes
 */
import { writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const outFacilities = path.join(
  projectRoot,
  "src/data/verifiedHealthFacilities.json",
);
const outReference = path.join(
  projectRoot,
  "src/data/countyFacilityReference.json",
);

const CMS_HOSPITAL_URL =
  "https://data.cms.gov/provider-data/api/1/datastore/query/xubh-q36u/0";
const HRSA_SITES_URL =
  "https://data.hrsa.gov/DataDownload/DD_Files/Health_Center_Service_Delivery_and_LookAlike_Sites.csv";

const DRY_RUN = process.argv.includes("--dry-run");

const MI_COUNTIES_83 = [
  "Alcona", "Alger", "Allegan", "Alpena", "Antrim", "Arenac", "Baraga",
  "Barry", "Bay", "Benzie", "Berrien", "Branch", "Calhoun", "Cass",
  "Charlevoix", "Cheboygan", "Chippewa", "Clare", "Clinton", "Crawford",
  "Delta", "Dickinson", "Eaton", "Emmet", "Genesee", "Gladwin", "Gogebic",
  "Grand Traverse", "Gratiot", "Hillsdale", "Houghton", "Huron", "Ingham",
  "Ionia", "Iosco", "Iron", "Isabella", "Jackson", "Kalamazoo", "Kalkaska",
  "Kent", "Keweenaw", "Lake", "Lapeer", "Leelanau", "Lenawee", "Livingston",
  "Luce", "Mackinac", "Macomb", "Manistee", "Marquette", "Mason", "Mecosta",
  "Menominee", "Midland", "Missaukee", "Monroe", "Montcalm", "Montmorency",
  "Muskegon", "Newaygo", "Oakland", "Oceana", "Ogemaw", "Ontonagon",
  "Osceola", "Oscoda", "Otsego", "Ottawa", "Presque Isle", "Roscommon",
  "Saginaw", "St. Clair", "St. Joseph", "Sanilac", "Schoolcraft",
  "Shiawassee", "Tuscola", "Van Buren", "Washtenaw", "Wayne", "Wexford",
];

function normCounty(raw) {
  if (!raw) return null;
  let c = String(raw).trim();
  if (c.endsWith(" County")) c = c.slice(0, -7);
  c = c
    .toLowerCase()
    .replace(/\b(\w)/g, (s) => s.toUpperCase())
    .replace(/^St\s/i, "St. ")
    .replace(/^Saint\s/i, "St. ");
  // canonicalize against the 83-county list
  const match = MI_COUNTIES_83.find((x) => x.toLowerCase() === c.toLowerCase());
  return match ?? c;
}

function assertJsonOk(body, label) {
  if (typeof body !== "string" || body.length === 0) {
    throw new Error(`[${label}] empty body`);
  }
  // 200-masked HTML check
  const head = body.slice(0, 200).trimStart().toLowerCase();
  if (head.startsWith("<!doctype") || head.startsWith("<html")) {
    throw new Error(`[${label}] response body is HTML, not JSON`);
  }
}

async function fetchCmsHospitalsMI() {
  const url =
    `${CMS_HOSPITAL_URL}?conditions%5B0%5D%5Bproperty%5D=state` +
    `&conditions%5B0%5D%5Bvalue%5D=MI&conditions%5B0%5D%5Boperator%5D=%3D&limit=1500`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CMS hospitals fetch failed: ${res.status}`);
  const text = await res.text();
  assertJsonOk(text, "CMS hospitals");
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed.results)) {
    throw new Error("CMS hospitals: results not an array");
  }
  return parsed.results;
}

function parseCsv(body) {
  // RFC4180 parser that handles embedded newlines and quoted commas/quotes.
  // Returns array of arrays.
  const rows = [];
  let row = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (inQ) {
      if (ch === '"') {
        if (body[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQ = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') {
        inQ = true;
      } else if (ch === ",") {
        row.push(cur);
        cur = "";
      } else if (ch === "\n") {
        row.push(cur);
        rows.push(row);
        row = [];
        cur = "";
      } else if (ch === "\r") {
        // skip; \n handles row termination
      } else {
        cur += ch;
      }
    }
  }
  if (cur.length > 0 || row.length > 0) {
    row.push(cur);
    rows.push(row);
  }
  return rows;
}

async function fetchHrsaSites() {
  const res = await fetch(HRSA_SITES_URL);
  if (!res.ok) throw new Error(`HRSA sites fetch failed: ${res.status}`);
  const ct = res.headers.get("content-type") || "";
  const text = await res.text();
  if (text.trim().toLowerCase().startsWith("<!doctype")) {
    throw new Error(`HRSA sites: response body is HTML, content-type=${ct}`);
  }
  const body = text.replace(/^﻿/, "");
  const matrix = parseCsv(body);
  if (matrix.length < 2) throw new Error("HRSA sites: <2 rows, parse failed");
  const headers = matrix[0];
  const rows = [];
  for (let i = 1; i < matrix.length; i++) {
    const cells = matrix[i];
    if (cells.length < headers.length / 2) continue;
    const row = {};
    for (let j = 0; j < headers.length; j++) row[headers[j]] = cells[j] ?? "";
    rows.push(row);
  }
  return rows;
}

function transformCmsHospital(r) {
  return {
    id: `CMS:${r.facility_id}`,
    name: r.facility_name?.trim(),
    type: "hospital",
    subtype: r.hospital_type?.trim() || null,
    address: r.address?.trim() || null,
    city: r.citytown?.trim() || null,
    county: normCounty(r.countyparish),
    zip: r.zip_code?.trim() || null,
    phone: r.telephone_number?.trim() || null,
    has_emergency: r.emergency_services === "Yes",
    ownership: r.hospital_ownership?.trim() || null,
    lat: null,
    lng: null,
    source: "CMS_HOSPITAL_GENERAL_INFO",
    source_id: r.facility_id,
    source_url: "https://data.cms.gov/provider-data/dataset/xubh-q36u",
  };
}

function transformHrsaSite(r) {
  const lat = parseFloat(r["Geocoding Artifact Address Primary Y Coordinate"]);
  const lng = parseFloat(r["Geocoding Artifact Address Primary X Coordinate"]);
  const orgId = r["BHCMIS Organization Identification Number"]?.trim();
  const siteName = r["Site Name"]?.trim();
  const npi = r["FQHC Site NPI Number"]?.trim();
  // Prefer NPI as a site-unique key (HRSA assigns one per physical site).
  // Fall back to BHCMIS org + site address + site name when NPI is missing
  // so two distinct sites with the same name at different addresses still
  // count as two rows.
  const siteAddress = r["Site Address"]?.trim() || "";
  const idKey =
    npi && npi !== "0" && npi.length > 0
      ? `HRSA:NPI:${npi}`
      : `HRSA:ORG:${orgId}:${siteAddress}:${siteName}`;
  return {
    id: idKey,
    name: siteName,
    type: "fqhc",
    subtype: r["Health Center Type Description"]?.trim() || null,
    address: r["Site Address"]?.trim() || null,
    city: r["Site City"]?.trim() || null,
    county: normCounty(r["Complete County Name"]),
    zip: r["Site Postal Code"]?.trim() || null,
    phone: r["Site Telephone Number"]?.trim() || null,
    has_emergency: false,
    ownership: r["Health Center Operator Description"]?.trim() || null,
    operator_org: r["Health Center Name"]?.trim() || null,
    location_setting:
      r["Health Center Location Type Description"]?.trim() || null,
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
    source: "HRSA_HEALTH_CENTER_SITES",
    source_id: orgId,
    source_url:
      "https://data.hrsa.gov/DataDownload/DD_Files/Health_Center_Service_Delivery_and_LookAlike_Sites.csv",
  };
}

function dedupe(rows) {
  const seen = new Map();
  for (const r of rows) {
    if (!r.id) continue;
    if (!seen.has(r.id)) seen.set(r.id, r);
  }
  return [...seen.values()];
}

function countByCounty(rows) {
  const counts = Object.fromEntries(MI_COUNTIES_83.map((c) => [c, 0]));
  for (const r of rows) {
    if (r.county && counts.hasOwnProperty(r.county)) {
      counts[r.county] += 1;
    }
  }
  return counts;
}

function validate(facilities, counts) {
  const errors = [];

  // 1. Every row carries a source identifier
  for (const f of facilities) {
    if (!f.source_id) errors.push(`row missing source_id: ${f.name}`);
    if (!f.source) errors.push(`row missing source: ${f.name}`);
  }

  // 2. All 83 counties present in the count map
  const missing = MI_COUNTIES_83.filter((c) => !(c in counts));
  if (missing.length > 0) {
    errors.push(`counties missing from count map: ${missing.join(", ")}`);
  }

  // 3. Wayne is the highest hospital count (sanity)
  const hospitalsByCounty = {};
  for (const f of facilities.filter((x) => x.type === "hospital")) {
    hospitalsByCounty[f.county] = (hospitalsByCounty[f.county] ?? 0) + 1;
  }
  const topHospital = Object.entries(hospitalsByCounty).sort(
    (a, b) => b[1] - a[1],
  )[0];
  if (!topHospital || topHospital[0] !== "Wayne") {
    errors.push(
      `expected Wayne to top hospital list, got ${topHospital?.[0]}=${topHospital?.[1]}`,
    );
  }

  // 4. Expected zero counties under Definition B — only Keweenaw should be 0.
  const zeroBSet = Object.entries(counts)
    .filter(([, n]) => n === 0)
    .map(([c]) => c);
  const EXPECTED_ZEROS = ["Keweenaw"];
  const unexpectedZeros = zeroBSet.filter((c) => !EXPECTED_ZEROS.includes(c));
  if (unexpectedZeros.length > 0) {
    errors.push(
      `unexpected zero counties under Definition B: ${unexpectedZeros.join(", ")}`,
    );
  }
  const missingExpectedZero = EXPECTED_ZEROS.filter(
    (c) => !zeroBSet.includes(c),
  );
  if (missingExpectedZero.length > 0) {
    errors.push(
      `expected-zero counties no longer zero: ${missingExpectedZero.join(", ")}`,
    );
  }

  // 5. Plausibility ranges. Saginaw should be in 18-30 under B (currently 22).
  if (counts["Saginaw"] < 15 || counts["Saginaw"] > 35) {
    errors.push(
      `Saginaw count ${counts["Saginaw"]} outside plausible range 15-35`,
    );
  }

  return errors;
}

async function main() {
  console.log("[build-facility-dataset] fetching CMS hospitals...");
  const cmsRaw = await fetchCmsHospitalsMI();
  console.log(`  fetched ${cmsRaw.length} MI hospital rows`);

  console.log("[build-facility-dataset] fetching HRSA health center sites...");
  const hrsaRaw = await fetchHrsaSites();
  console.log(`  fetched ${hrsaRaw.length} total HRSA rows (all states)`);

  const hrsaMiActive = hrsaRaw.filter(
    (r) =>
      r["Site State Abbreviation"]?.trim() === "MI" &&
      r["Site Status Description"]?.trim() === "Active" &&
      ["Service Delivery Site", "Administrative/Service Delivery Site"].includes(
        r["Health Center Type Description"]?.trim(),
      ),
  );
  console.log(`  filtered to ${hrsaMiActive.length} MI active service sites`);

  const hospitals = dedupe(cmsRaw.map(transformCmsHospital));
  const fqhcs = dedupe(hrsaMiActive.map(transformHrsaSite));
  console.log(
    `  after dedupe: ${hospitals.length} hospitals + ${fqhcs.length} FQHC sites`,
  );

  const all = [...hospitals, ...fqhcs];
  const counts = countByCounty(all);

  const errors = validate(all, counts);
  if (errors.length > 0) {
    console.error("[build-facility-dataset] VALIDATION FAILED:");
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log("[build-facility-dataset] validation passed");

  const provenance = {
    definition:
      "Definition B (PAUSE 1, 2026-06-09): CMS-certified hospital OR HRSA-active health center service site.",
    sources: [
      {
        name: "CMS Hospital General Information",
        dataset_id: "xubh-q36u",
        url: "https://data.cms.gov/provider-data/dataset/xubh-q36u",
        mi_rows: hospitals.length,
        dedupe_key: "facility_id (CCN)",
      },
      {
        name: "HRSA Health Center Service Delivery and Look-Alike Sites",
        url: HRSA_SITES_URL,
        mi_rows: fqhcs.length,
        filter:
          "Site State Abbreviation == MI AND Site Status Description == Active AND Health Center Type Description in ('Service Delivery Site','Administrative/Service Delivery Site')",
        dedupe_key:
          "FQHC Site NPI Number (preferred); BHCMIS Org # + Site Address + Site Name (fallback when NPI missing)",
      },
    ],
    fetched_at: new Date().toISOString(),
    transform_script: "scripts/build-facility-dataset.mjs",
    counties_covered: Object.values(counts).filter((n) => n > 0).length,
    counties_total: MI_COUNTIES_83.length,
    expected_zero_counties: ["Keweenaw"],
    mi_total: all.length,
  };

  const facilitiesPayload = {
    $schema: "verifiedHealthFacilities.v1",
    provenance,
    facilities: all,
  };

  const referencePayload = {
    $schema: "countyFacilityReference.v1",
    provenance: {
      ...provenance,
      note: "Per-county counts derived from the same extract as verifiedHealthFacilities.json. The build-time guard (scripts/check-county-facilities.mjs) fails if the seed file drops below these counts.",
    },
    counts,
  };

  if (DRY_RUN) {
    console.log("[build-facility-dataset] --dry-run: skipping writes");
    console.log("Top 5 counties:");
    Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([c, n]) => console.log(`  ${c}: ${n}`));
    console.log(`Saginaw: ${counts["Saginaw"]}, Keweenaw: ${counts["Keweenaw"]}`);
    return;
  }

  await writeFile(
    outFacilities,
    JSON.stringify(facilitiesPayload, null, 2) + "\n",
    "utf8",
  );
  await writeFile(
    outReference,
    JSON.stringify(referencePayload, null, 2) + "\n",
    "utf8",
  );
  console.log(`[build-facility-dataset] wrote ${path.relative(projectRoot, outFacilities)} (${all.length} rows)`);
  console.log(`[build-facility-dataset] wrote ${path.relative(projectRoot, outReference)} (${MI_COUNTIES_83.length} counties)`);
}

main().catch((err) => {
  console.error("[build-facility-dataset] failed:", err);
  process.exit(1);
});
