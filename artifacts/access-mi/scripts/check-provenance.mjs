#!/usr/bin/env node
/**
 * Atlas provenance guard.
 *
 * Detects two classes of proxy anti-pattern in atlas visualization files:
 *   1. Proxy comment signatures  (any src/ file)
 *   2. countyType-branching numeric ternaries (atlas scope files only)
 *
 * These patterns indicate a metric is rendered using a type-based placeholder
 * instead of a real, verified data source. Violations must be fixed or listed in
 * provenance-allowlist.json with a remediation PR reference.
 *
 * The allowlist is shrink-only: CI blocks new entries after this guard was first
 * introduced. Run via: node scripts/check-provenance.mjs
 */

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, relative } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src");
const ALLOWLIST_PATH = join(ROOT, "provenance-allowlist.json");

// Directories scanned for countyType-ternary violations.
// Proxy comment signatures are checked across all of src/.
const ATLAS_SCOPE_DIRS = [
  join(SRC, "pages"),
  join(SRC, "components", "atlas"),
  join(SRC, "data"),
  join(SRC, "lib"),
  join(SRC, "utils"),
];

// Comment substrings that flag a proxy value in a metric path.
// Must match literally (case-sensitive) as a substring of any source line.
const PROXY_COMMENT_SIGS = [
  "proxy with food insecurity",
  "proxy: rural counties tend",
  "use known state rate as proxy",
  "countyType proxy",
  "// proxy for",
];

// Matches countyType ternary with a numeric literal on the SAME line.
// e.g. `profile.countyType === "rural" ? 8.5` or `p.countyType === "urban" ? 7.2`
const COUNTY_TYPE_SAME_LINE_RE =
  /countyType\s*===\s*["'][^"']+["']\s*\?\s*[\d.]+/;

// Matches a bare countyType comparison at end of line (multi-line ternary first line).
// The next line is checked for `? <number>` to confirm it is a numeric branch.
const COUNTY_TYPE_FIRST_LINE_RE = /countyType\s*===\s*["'][^"']+["']\s*$/;
const NUMERIC_TERNARY_NEXT_LINE_RE = /^\s*\?\s*[\d.]+/;

function isInAtlasScope(filePath) {
  return ATLAS_SCOPE_DIRS.some((d) => filePath.startsWith(d));
}

function walkSrc(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === "node_modules" || entry === ".git" || entry === "__tests__") continue;
      walkSrc(full, files);
    } else if (/\.[tj]sx?$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

// Load allowlist
let allowlistData = { violations: [] };
if (existsSync(ALLOWLIST_PATH)) {
  try {
    allowlistData = JSON.parse(readFileSync(ALLOWLIST_PATH, "utf8"));
  } catch (e) {
    console.error(`[check-provenance] ERROR: could not parse ${ALLOWLIST_PATH}: ${e.message}`);
    process.exit(1);
  }
}

// Build fast lookup: "relpath:lineNo" -> true
const allowlisted = new Set(
  (allowlistData.violations ?? []).map((v) => `${v.file}:${v.line}`)
);

let failures = 0;
const allFiles = walkSrc(SRC);

for (const filePath of allFiles) {
  const rel = relative(ROOT, filePath).replace(/\\/g, "/");
  let lines;
  try {
    lines = readFileSync(filePath, "utf8").split("\n");
  } catch {
    continue;
  }

  for (let i = 0; i < lines.length; i++) {
    const lineNo = i + 1;
    const line = lines[i];
    const key = `${rel}:${lineNo}`;

    // 1. Proxy comment signatures (all src/ files)
    for (const sig of PROXY_COMMENT_SIGS) {
      if (line.includes(sig)) {
        if (!allowlisted.has(key)) {
          console.error(
            `[check-provenance] FAIL ${rel}:${lineNo} — proxy comment: "${sig}"`
          );
          failures++;
        }
        break;
      }
    }

    // 2. countyType numeric ternary (atlas scope only)
    if (isInAtlasScope(filePath)) {
      // Same-line form: `countyType === "rural" ? 8.5`
      if (COUNTY_TYPE_SAME_LINE_RE.test(line)) {
        if (!allowlisted.has(key)) {
          console.error(
            `[check-provenance] FAIL ${rel}:${lineNo} — countyType numeric ternary (unverified atlas proxy)`
          );
          failures++;
        }
      }
      // Multi-line form: countyType comparison at EOL, next line is `? <number>`
      else if (
        COUNTY_TYPE_FIRST_LINE_RE.test(line) &&
        lines[i + 1] !== undefined &&
        NUMERIC_TERNARY_NEXT_LINE_RE.test(lines[i + 1])
      ) {
        if (!allowlisted.has(key)) {
          console.error(
            `[check-provenance] FAIL ${rel}:${lineNo} — countyType numeric ternary (multi-line, unverified atlas proxy)`
          );
          failures++;
        }
      }
    }
  }
}

if (failures > 0) {
  console.error(
    `\n[check-provenance] ${failures} violation(s) outside allowlist.`
  );
  console.error(
    "  To add a temporary exemption: add an entry to provenance-allowlist.json with a remediation PR reference."
  );
  console.error(
    "  The allowlist is shrink-only: CI rejects new entries on any branch after the gate was introduced."
  );
  process.exit(1);
} else {
  const count = allowlistData.violations?.length ?? 0;
  console.log(
    `[check-provenance] ok — 0 new violations. ${count} pre-existing violation(s) tracked in allowlist.`
  );
}
