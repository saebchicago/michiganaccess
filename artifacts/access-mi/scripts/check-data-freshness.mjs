#!/usr/bin/env node
/**
 * Data-freshness integrity guard.
 *
 * `src/data/dataFreshness.ts` drives the freshness badges on /methodology and
 * /about. Before this guard the file hand-maintained both the ingest dates and
 * the status labels, and both had drifted:
 *
 *   - census-acs claimed lastUpdated "2026-07-02" while the file it cited,
 *     acs-broadband-county.generated.json, recorded ingested_at 2026-08-10.
 *   - cdc-places and census-acs carried identical lastUpdated, cadence, and
 *     nextExpectedUpdate but contradictory hand-set status ("fresh" vs
 *     "aging") because the field silently meant ingest recency in one entry
 *     and vintage currency in the other.
 *   - fema-declarations and epa-echo declared a "Real-time" cadence, had not
 *     been pulled in 168 days, and were labeled merely "aging".
 *   - bls-laus-county and hrsa-hpsa-county were ingested into committed
 *     datasets and rendered on live pages with no freshness entry at all.
 *
 * Fails the build when:
 *   1. An entry hand-sets `freshnessStatus` or `ingestStatus` (both derived).
 *   2. `generatedFrom` names a file that does not exist, or the entry's
 *      lastUpdated disagrees with that file's provenance.ingested_at.
 *   3. A committed dataset with provenance.ingested_at has no freshness entry.
 *   4. vintageStatus is "behind" without a substantive vintageNote, or is
 *      "current" while carrying one.
 *   5. vintageStatus is missing or outside its enum.
 *   6. Two entries share an id.
 *   7. FRESHNESS_TRACKED_COUNT disagrees with the number of entries.
 *
 * Run via: node scripts/check-data-freshness.mjs
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..");
const DATA_DIR = path.join(ROOT, "src", "data");
const FRESHNESS_FILE = path.join(DATA_DIR, "dataFreshness.ts");
const CONSTANTS_FILE = path.join(ROOT, "src", "config", "platformConstants.ts");

const MIN_NOTE_LENGTH = 30;

/**
 * Generated datasets that are deliberately not freshness-tracked, with the
 * reason. These are build metadata about the platform itself, not ingested
 * public data with a publisher cadence.
 */
const NOT_FRESHNESS_TRACKED = {
  "source-catalog.generated.json":
    "derived from sourcesRegistry.ts at build time, not ingested from a publisher",
  "sourceHealth.generated.json":
    "platform endpoint health snapshot, not a public dataset",
  "sourceLinkHealth.generated.json":
    "outbound link reachability snapshot, not a public dataset",
  "cdc-places-zcta.generated.json":
    "ZCTA companion to cdc-places-county from the same PLACES release; tracked once under the cdc-places entry",
  "acs-broadband-county.generated.json":
    "tracked under the census-acs entry, which names it in generatedFrom",
};

let failures = 0;
const fail = (msg) => {
  console.error(`[check-data-freshness] FAIL ${msg}`);
  failures++;
};

const src = readFileSync(FRESHNESS_FILE, "utf8");

// ── Rule 1: derived fields must not be hand-set inside entries ──────────

const entryBlocks = src.split(/entry\(\{/).slice(1).map((chunk) => {
  const end = chunk.indexOf("}),");
  return end < 0 ? chunk : chunk.slice(0, end);
});

if (entryBlocks.length === 0)
  fail("parsed 0 entries from dataFreshness.ts - the parse is broken");

const field = (block, name) => {
  const m = block.match(new RegExp(`\\b${name}:\\s*"([^"]*)"`));
  return m ? m[1] : null;
};

const entries = [];
for (const block of entryBlocks) {
  const id = field(block, "id");
  const at = id ? `"${id}"` : "<entry with no id>";
  if (!id) {
    fail("an entry has no id");
    continue;
  }

  for (const derived of ["freshnessStatus", "ingestStatus"]) {
    if (new RegExp(`\\b${derived}:`).test(block))
      fail(
        `${at} hand-sets ${derived}; it is derived in entry() from lastUpdated and vintageStatus. Remove the line.`,
      );
  }

  entries.push({
    id,
    lastUpdated: field(block, "lastUpdated"),
    generatedFrom: field(block, "generatedFrom"),
    vintageStatus: field(block, "vintageStatus"),
    vintageNote: field(block, "vintageNote"),
    updateFrequency: field(block, "updateFrequency"),
  });
}

// ── Rule 6: unique ids ─────────────────────────────────────────────────

const seen = new Set();
for (const e of entries) {
  if (seen.has(e.id)) fail(`duplicate entry id "${e.id}"`);
  seen.add(e.id);
}

// ── Rules 2 + 4 + 5: per-entry checks ──────────────────────────────────

const anchored = new Set();
for (const e of entries) {
  const at = `"${e.id}"`;

  if (e.vintageStatus !== "current" && e.vintageStatus !== "behind")
    fail(
      `${at} vintageStatus must be "current" or "behind" (got ${JSON.stringify(e.vintageStatus)})`,
    );

  if (e.vintageStatus === "behind" && (e.vintageNote ?? "").length < MIN_NOTE_LENGTH)
    fail(
      `${at} vintageStatus is "behind" but has no substantive vintageNote naming the release we are missing (need ${MIN_NOTE_LENGTH}+ chars)`,
    );

  if (e.vintageStatus === "current" && e.vintageNote)
    fail(
      `${at} carries a vintageNote while vintageStatus is "current"; remove the stale note or mark it behind`,
    );

  if (!e.generatedFrom) continue;
  anchored.add(e.generatedFrom);

  const genPath = path.join(DATA_DIR, e.generatedFrom);
  if (!existsSync(genPath)) {
    fail(`${at} generatedFrom "${e.generatedFrom}" does not exist in src/data/`);
    continue;
  }

  let prov;
  try {
    prov = JSON.parse(readFileSync(genPath, "utf8")).provenance;
  } catch (err) {
    fail(`${at} could not parse ${e.generatedFrom}: ${err.message}`);
    continue;
  }

  const ingestedAt = prov?.ingested_at;
  if (!ingestedAt) {
    fail(`${at} generatedFrom "${e.generatedFrom}" has no provenance.ingested_at`);
    continue;
  }

  const machineDate = String(ingestedAt).slice(0, 10);
  if (e.lastUpdated !== machineDate)
    fail(
      `${at} lastUpdated "${e.lastUpdated}" disagrees with ${e.generatedFrom} provenance.ingested_at "${machineDate}". The generated file is authoritative - hand-copied dates are exactly what drifted before.`,
    );
}

// ── Rule 3: every ingested dataset is tracked ──────────────────────────

for (const file of readdirSync(DATA_DIR).filter((f) =>
  f.endsWith(".generated.json"),
)) {
  if (anchored.has(file)) continue;
  if (file in NOT_FRESHNESS_TRACKED) continue;

  let prov;
  try {
    prov = JSON.parse(readFileSync(path.join(DATA_DIR, file), "utf8")).provenance;
  } catch {
    continue;
  }
  if (!prov?.ingested_at) continue;

  fail(
    `${file} records provenance.ingested_at but no dataFreshness entry names it in generatedFrom. Add an entry, or add it to NOT_FRESHNESS_TRACKED in this script with a written reason.`,
  );
}

// ── Rule 7: tracked count constant matches ─────────────────────────────

const constants = readFileSync(CONSTANTS_FILE, "utf8");
const declared = constants.match(/FRESHNESS_TRACKED_COUNT = (\d+)/);
if (!declared) {
  fail("platformConstants.ts does not declare FRESHNESS_TRACKED_COUNT");
} else if (Number(declared[1]) !== entries.length) {
  fail(
    `FRESHNESS_TRACKED_COUNT is ${declared[1]} but dataFreshness.ts has ${entries.length} entries`,
  );
}

// ── Report ─────────────────────────────────────────────────────────────

if (failures > 0) {
  console.error(`[check-data-freshness] ${failures} failure(s).`);
  process.exit(1);
}

const behind = entries.filter((e) => e.vintageStatus === "behind").length;
console.log(
  `[check-data-freshness] ok - ${entries.length} tracked datasets, ${anchored.size} date-anchored to generated provenance, ${behind} declared behind their publisher's latest release.`,
);
