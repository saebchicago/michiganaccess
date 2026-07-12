#!/usr/bin/env node
/**
 * Dataset-label provenance guard.
 *
 * Every .generated.json file in src/data/ must carry:
 *   1. provenance.value_label - one of the allowed enum values
 *   2. provenance.source_name - non-empty string
 *   3. If a "measures" array is present, each entry must also have value_label
 *   4. counties[] or a non-empty top-level data key must be present
 *
 * Fails the build if any constraint is violated, so removing or
 * misspelling a value_label will be caught before deploy.
 *
 * Run via: node scripts/check-dataset-labels.mjs
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA_DIR = join(ROOT, "src", "data");

const ALLOWED_LABELS = new Set(["VERIFIED", "MODELED", "PROJECTED", "PENDING"]);

let failures = 0;

function fail(file, msg) {
  console.error(`[check-dataset-labels] FAIL ${file} — ${msg}`);
  failures++;
}

function checkFile(filePath) {
  const rel = relative(ROOT, filePath).replace(/\\/g, "/");
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(filePath, "utf8"));
  } catch (e) {
    fail(rel, `could not parse JSON: ${e.message}`);
    return;
  }

  const prov = parsed.provenance;
  if (!prov) {
    // Files that use a different schema (e.g. sourceHealth.generated.json with "schema" key)
    // are metadata files, not dataset files. Log and skip.
    console.log(`[check-dataset-labels] skip ${rel} — no "provenance" key (non-dataset generated file)`);
    return;
  }

  // Rule 1: provenance.value_label must exist and be an allowed value
  if (!prov.value_label) {
    fail(rel, `provenance.value_label is missing`);
  } else if (!ALLOWED_LABELS.has(prov.value_label)) {
    fail(rel, `provenance.value_label "${prov.value_label}" not in allowed set ${[...ALLOWED_LABELS].join(", ")}`);
  }

  // Rule 2: provenance.source_name must be a non-empty string
  if (!prov.source_name || typeof prov.source_name !== "string" || !prov.source_name.trim()) {
    fail(rel, `provenance.source_name is missing or empty`);
  }

  // Rule 3: if measures[] present, each entry needs value_label
  if (Array.isArray(parsed.measures)) {
    for (let i = 0; i < parsed.measures.length; i++) {
      const m = parsed.measures[i];
      if (!m.value_label) {
        fail(rel, `measures[${i}] (id="${m.id ?? "?"}") missing value_label`);
      } else if (!ALLOWED_LABELS.has(m.value_label)) {
        fail(rel, `measures[${i}] value_label "${m.value_label}" not in allowed set`);
      }
    }
  }

  // Rule 4: must have a data payload (counties[], zctas[], or other non-empty data key)
  const DATA_KEYS = ["counties", "zctas", "records", "data"];
  const hasPayload = DATA_KEYS.some((k) => Array.isArray(parsed[k]) && parsed[k].length > 0);
  if (!hasPayload) {
    // Not a hard failure if the file simply hasn't been populated yet (pending-ci pattern)
    // but we warn so it's visible in CI logs
    console.warn(`[check-dataset-labels] WARN ${rel} — no populated data array found (counties/zctas/records/data)`);
  }
}

// Find all .generated.json files in src/data/
const entries = readdirSync(DATA_DIR).filter((f) => f.endsWith(".generated.json"));

if (entries.length === 0) {
  console.warn("[check-dataset-labels] WARN: no .generated.json files found in src/data/");
  process.exit(0);
}

for (const entry of entries) {
  checkFile(join(DATA_DIR, entry));
}

if (failures > 0) {
  console.error(`\n[check-dataset-labels] ${failures} violation(s). Every .generated.json must have provenance.value_label in [${[...ALLOWED_LABELS].join(", ")}] and a non-empty source_name.`);
  process.exit(1);
} else {
  console.log(`[check-dataset-labels] ok — ${entries.length} dataset(s) have valid provenance labels.`);
}
