#!/usr/bin/env node
/**
 * Integrity-label correctness guard.
 *
 * check-dataset-labels.mjs verifies that .generated.json datasets *carry* a
 * label. Nothing verified that a label was *correct*, and hand-authored .ts
 * seed files were outside every guard entirely. That gap is why 41 metrics in
 * chnaSeed.ts claimed VERIFIED for years while being transcribed out of a
 * hospital's CHNA PDF.
 *
 * This guard closes it. VERIFIED is reserved for figures confirmed against a
 * primary federal or state release. If a data entry pairs VERIFIED with a
 * source string that names a secondary publication - someone else's report,
 * assessment, or write-up - the build fails.
 *
 * Scope: hand-authored .ts/.tsx files under src/data/. Generated JSON is
 * already covered by check-dataset-labels.mjs.
 *
 * Run via: node scripts/check-integrity-labels.mjs
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA_DIR = join(ROOT, "src", "data");

/**
 * Source-string markers that indicate a figure was read out of a secondary
 * publication rather than confirmed at the primary release.
 *
 * Deliberately narrow: each pattern names a *kind of document*, not a topic,
 * so it does not fire on legitimate primary sources that merely mention a
 * similar word. Add to this list rather than loosening it.
 */
const SECONDARY_SOURCE_PATTERNS = [
  { re: /\bCHNA\b/i, why: "a Community Health Needs Assessment document" },
  { re: /\bvia\b/i, why: "a figure relayed via an intermediary" },
  { re: /Planet Detroit/i, why: "a news publication" },
  { re: /\banalysis of\b/i, why: "a third-party analysis" },
  { re: /\breport(ed)? by\b/i, why: "a third-party report" },
];

let failures = 0;
let scanned = 0;
let entriesChecked = 0;

function fail(file, msg) {
  console.error(`[check-integrity-labels] FAIL ${file} - ${msg}`);
  failures++;
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      // Skip test fixtures; they intentionally construct bad shapes.
      if (name === "__tests__") continue;
      walk(full, out);
    } else if (/\.tsx?$/.test(name)) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Finds each `integrityLabel: "VERIFIED"` (or `value_label`/`badge`) and pairs
 * it with the nearest following `source:` within the same object literal.
 * Object literals in these seeds are small and consistently ordered, so a
 * bounded forward scan is sufficient and avoids pulling in a TS parser.
 */
const LABEL_RE =
  /(integrityLabel|value_label|provenanceLabel|badge)\s*:\s*["']VERIFIED["']/g;

function checkFile(filePath) {
  const rel = relative(ROOT, filePath).replace(/\\/g, "/");
  const src = readFileSync(filePath, "utf8");
  if (!/VERIFIED/.test(src)) return;
  scanned++;

  const lines = src.split("\n");

  for (let i = 0; i < lines.length; i++) {
    LABEL_RE.lastIndex = 0;
    if (!LABEL_RE.test(lines[i])) continue;
    entriesChecked++;

    // Look ahead a bounded window for this entry's source string, stopping at
    // the end of the object literal.
    let source = null;
    for (let j = i + 1; j < Math.min(i + 12, lines.length); j++) {
      if (/^\s*\}/.test(lines[j])) break;
      const m = lines[j].match(/\bsource(_name)?\s*:\s*["']([^"']+)["']/);
      if (m) {
        source = m[2];
        break;
      }
    }
    if (!source) continue;

    for (const { re, why } of SECONDARY_SOURCE_PATTERNS) {
      if (re.test(source)) {
        fail(
          rel,
          `line ${i + 1}: VERIFIED paired with "${source}", which names ${why}. ` +
            `VERIFIED is reserved for figures confirmed against a primary federal or ` +
            `state release - use MODELED, or re-source the figure to the primary ` +
            `release and name it in the source field.`,
        );
        break;
      }
    }
  }
}

for (const file of walk(DATA_DIR)) checkFile(file);

if (failures > 0) {
  console.error(
    `\n[check-integrity-labels] ${failures} mislabeled entr${failures === 1 ? "y" : "ies"} found.`,
  );
  process.exit(1);
}

console.log(
  `[check-integrity-labels] ok - ${entriesChecked} VERIFIED entr${entriesChecked === 1 ? "y" : "ies"} across ${scanned} file(s); none cite a secondary source.`,
);
