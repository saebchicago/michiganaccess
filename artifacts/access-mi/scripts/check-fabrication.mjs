#!/usr/bin/env node
/**
 * Fabrication-pattern guard.
 * Scans src/ for banned strings that indicate fabricated claims or removed compliance badges.
 * Exits 1 with file:line if any match is found.
 * Run via: node scripts/check-fabrication.mjs
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src");
const ALLOWLIST_PATH = join(__dirname, "hfh-allowlist.json");

const hfhAllowlist = new Set(
  JSON.parse(readFileSync(ALLOWLIST_PATH, "utf8"))
);

/** Patterns that must not appear in any src/ file (outside allowlist where noted). */
const BANNED = [
  { pattern: "42% reduction",              reason: "removed fabricated case study stat" },
  { pattern: "12,400",                      reason: "removed fabricated FQHC map views metric" },
  { pattern: "1,850+",                      reason: "removed fabricated appeals generated metric" },
  { pattern: "3,200+",                      reason: "removed fabricated coverage pathfinder runs metric" },
  { pattern: "previously unknown service deserts", reason: "removed fabricated case study copy" },
  { pattern: "HIPAA Compliant",             reason: "removed unverifiable compliance badge" },
  { pattern: "FHIR R4",                     reason: "removed unverifiable interop badge" },
  { pattern: "HL7 v2",                      reason: "removed unverifiable interop badge" },
  { pattern: "USCDI v3",                    reason: "removed unverifiable interop badge" },
  { pattern: "strictest in the US",         reason: "removed stale PFAS superlative" },
  { pattern: "strictest in the nation",     reason: "removed stale PFAS superlative" },
  { pattern: "Case Study Highlight",        reason: "removed fabricated case study section" },
  // Guard 1: atlas layer proxy anti-patterns. These comments mark countyType
  // switches standing in for sourced metrics. If re-introduced the build fails.
  { pattern: "use known state rate as proxy", reason: "atlas proxy pattern - infant mortality must use MDHHS data-layers.ts resolver" },
  { pattern: "proxy with food insecurity",    reason: "atlas proxy pattern - food_desert layer must use USDA tract data" },
  { pattern: "proxy: rural counties tend",    reason: "atlas proxy pattern - energy_burden layer must use ACEEE data-layers.ts resolver" },
];

/** Henry Ford check: flag any file NOT in the allowlist that contains "Henry Ford". */
const HFH_PATTERN = "Henry Ford";

const SKIP_PATTERNS = [
  /\.test\.[tj]sx?$/,
  /__tests__/,
  /\.spec\.[tj]sx?$/,
  /node_modules/,
];

function shouldSkip(filePath) {
  return SKIP_PATTERNS.some((p) => p.test(filePath));
}

function walkDir(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === ".git") continue;
      walkDir(full, files);
    } else {
      files.push(full);
    }
  }
  return files;
}

let failures = 0;
const allFiles = walkDir(SRC);

for (const filePath of allFiles) {
  if (shouldSkip(filePath)) continue;

  const rel = relative(ROOT, filePath);
  let content;
  try {
    content = readFileSync(filePath, "utf8");
  } catch {
    continue;
  }

  const lines = content.split("\n");

  // Check banned patterns (all files)
  for (const { pattern, reason } of BANNED) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(pattern)) {
        console.error(`[check-fabrication] FAIL ${rel}:${i + 1} — "${pattern}" (${reason})`);
        failures++;
      }
    }
  }

  // Check Henry Ford outside allowlist
  const relFromSrc = relative(ROOT, filePath);
  if (!hfhAllowlist.has(relFromSrc)) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(HFH_PATTERN)) {
        console.error(`[check-fabrication] FAIL ${rel}:${i + 1} — "Henry Ford" outside allowlist (add to scripts/hfh-allowlist.json if legitimate)`);
        failures++;
      }
    }
  }
}

// ── Snapshot-metric provenance guard ──────────────────────────────────────────
// Inside src/utils/snapshotMetrics.ts, every metric object literal whose
// `value:` is a literal (string with backticks/quotes containing no expression,
// or a bare number) must also declare a `source:` field in the same literal.
// Computed values (function calls, identifier references, template strings
// with interpolation) are allowed without a source - they derive provenance
// from the upstream data their function reads.
//
// This guard catches the class of regression where a contributor adds a
// hand-typed "X%" or "Y.Z" value to the homepage snapshot with no upstream
// source. The platform's "no fabricated values" rule is enforced
// structurally here, not by reviewer attention.
function checkSnapshotMetricProvenance() {
  const target = join(SRC, "utils/snapshotMetrics.ts");
  let content;
  try {
    content = readFileSync(target, "utf8");
  } catch {
    return; // file missing - nothing to guard
  }

  const text = content;
  // Walk every object literal opened by `{`. For each, find its matching `}`
  // and inspect the slice. We only care about literals that contain an `id:`
  // field (the SnapshotMetric shape).
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== "{") continue;
    let depth = 0;
    let end = -1;
    let inString = null; // current string delimiter, or null
    for (let j = i; j < text.length; j++) {
      const ch = text[j];
      const prev = j > 0 ? text[j - 1] : "";
      if (inString) {
        if (ch === inString && prev !== "\\") inString = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === "`") {
        inString = ch;
        continue;
      }
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) { end = j; break; }
      }
    }
    if (end < 0) continue;
    const body = text.slice(i + 1, end);

    // Only SnapshotMetric literals have an `id:` field (and a `value:`).
    if (!/\bid\s*:/.test(body) || !/\bvalue\s*:/.test(body)) continue;

    // Extract the `value:` expression up to the next comma (top-level) or end.
    const vIdx = body.search(/\bvalue\s*:/);
    if (vIdx < 0) continue;
    const after = body.slice(vIdx + body.slice(vIdx).indexOf(":") + 1);
    // Walk forward to the next top-level comma, respecting strings and nested
    // braces/brackets/parens.
    let k = 0;
    let nest = 0;
    let inStr = null;
    while (k < after.length) {
      const ch = after[k];
      const prev = k > 0 ? after[k - 1] : "";
      if (inStr) {
        if (ch === inStr && prev !== "\\") inStr = null;
      } else if (ch === '"' || ch === "'" || ch === "`") {
        inStr = ch;
      } else if (ch === "(" || ch === "[" || ch === "{") nest++;
      else if (ch === ")" || ch === "]" || ch === "}") nest--;
      else if (ch === "," && nest === 0) break;
      k++;
    }
    const valueExpr = after.slice(0, k).trim();

    // A "literal value" is a plain string or a bare number with no
    // interpolation or function call. Anything else is computed.
    const isPlainStringDouble = /^"[^"\\]*"$/.test(valueExpr);
    const isPlainStringSingle = /^'[^'\\]*'$/.test(valueExpr);
    const isPlainTemplate = /^`[^`${]*`$/.test(valueExpr);
    const isBareNumber = /^-?\d+(\.\d+)?$/.test(valueExpr);
    const isLiteral =
      isPlainStringDouble || isPlainStringSingle || isPlainTemplate || isBareNumber;
    if (!isLiteral) continue;

    // "Data unavailable" is the canonical suppression sentinel; skip it.
    if (/"Data unavailable"|'Data unavailable'/.test(valueExpr)) continue;

    // Now require a `source:` field somewhere in the same object body.
    if (!/\bsource\s*:/.test(body)) {
      // Locate the line for a useful error message.
      const before = text.slice(0, i + 1);
      const lineNum = before.split("\n").length;
      console.error(
        `[check-fabrication] FAIL src/utils/snapshotMetrics.ts:${lineNum} — SnapshotMetric literal with hardcoded value ${valueExpr} is missing a "source" field. Either suppress to "Data unavailable" or add a primary-source label.`,
      );
      failures++;
    }
  }
}

checkSnapshotMetricProvenance();

if (failures > 0) {
  console.error(`[check-fabrication] ${failures} violation(s) found. Fix before building.`);
  process.exit(1);
} else {
  console.log(`[check-fabrication] ok — no fabrication patterns found.`);
}
