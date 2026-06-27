#!/usr/bin/env node
/**
 * Report-only scanner for rendered numeric/statistical literals lacking
 * source attribution in user-facing components.
 *
 * Scope:
 *   - Walks artifacts/access-mi/src/{pages,components,sections,utils}
 *   - Skips tests, __tests__, .test.*, .spec.*
 *   - Excludes the legitimate pipeline (src/utils/snapshotMetrics.ts and
 *     generated src/data/county-*.ts files), since those are already
 *     gated by scripts/check-fabrication.mjs.
 *
 * What it flags (heuristic):
 *   A. likely-hardcoded-data
 *      Module-level array constants whose elements are object literals with
 *      at least one numeric property and no co-located `source:` field.
 *      These are the FARS-style chart arrays the audit found.
 *   B. needs-review
 *      JSX text nodes containing bare percentages, per-N-people rates,
 *      dollar amounts, or count words like "Live"+number, when the
 *      enclosing file lacks a DataProvenance/IntegrityBadge import and
 *      the literal does not trace to a known sourced data import.
 *
 * What it deliberately does NOT do:
 *   - No auto-verdict. Every candidate gets a first-pass class plus a
 *     proposed disposition (SOURCE-IT / REMOVE / FALSE-POSITIVE /
 *     NEEDS-REVIEW). Owner reviews each one.
 *   - No edits, no writes to src/.
 *   - Not wired into the build. Report-only.
 *
 * Determinism:
 *   Output is sorted by relative file path, then start line.
 *
 * Output:
 *   Prints JSON candidate records to stdout when invoked with --json.
 *   Otherwise prints a human-readable summary plus the candidate table.
 *   The companion inventory doc consumes the JSON form.
 *
 * Usage:
 *   node scripts/scan-rendered-fabrication.mjs           # human summary
 *   node scripts/scan-rendered-fabrication.mjs --json    # JSON candidates
 *   node scripts/scan-rendered-fabrication.mjs --orphans # orphan seed files only
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = join(__dirname, "..");
const APP_ROOT = join(REPO_ROOT, "artifacts", "access-mi");
const SRC = join(APP_ROOT, "src");

const SCAN_ROOTS = [
  join(SRC, "pages"),
  join(SRC, "components"),
];

const DATA_DIR = join(SRC, "data");

const SKIP_RE = [
  /\.test\.[tj]sx?$/,
  /\.spec\.[tj]sx?$/,
  /__tests__[\\/]/,
  /[\\/]node_modules[\\/]/,
];

/** Files that ARE the legitimate pipeline; never flagged. */
const PIPELINE_FILES = new Set([
  join(SRC, "utils", "snapshotMetrics.ts"),
]);

/** Generated data files (county-*.ts pattern). */
function isPipelineDataFile(absPath) {
  const rel = relative(DATA_DIR, absPath);
  if (rel.startsWith("..")) return false;
  return /^county-[a-z0-9-]+\.ts$/.test(rel);
}

/** Sourced-data import patterns: a file importing from these is treated
 *  as drawing its numbers from sourced upstream data, which weakens the
 *  heuristic for that file. */
const SOURCED_IMPORT_RE = [
  /from\s+["']@\/utils\/snapshotMetrics["']/,
  /from\s+["']@\/data\/county-/,
  /from\s+["']@\/data\/sourcesRegistry["']/,
  /from\s+["']@\/data\/sourceManifest["']/,
  /from\s+["']@\/data\/dataFreshness["']/,
];

const PROVENANCE_IMPORT_RE = [
  /from\s+["']@\/components\/shared\/DataProvenance["']/,
  /from\s+["'][^"']*IntegrityBadge["']/,
  /from\s+["'][^"']*SourceBadge["']/,
  /from\s+["'][^"']*SourcedFigure["']/,
];

function shouldSkip(filePath) {
  return SKIP_RE.some((r) => r.test(filePath));
}

function walk(dir, out = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  entries.sort();
  for (const entry of entries) {
    const full = join(dir, entry);
    let s;
    try { s = statSync(full); } catch { continue; }
    if (s.isDirectory()) {
      if (entry === "node_modules" || entry === ".git") continue;
      walk(full, out);
    } else {
      out.push(full);
    }
  }
  return out;
}

/** Strip block comments and line comments from source for pattern checks
 *  that should not match in commentary. We keep the original text for
 *  snippet display; this stripped copy is only for regex tests. */
function stripComments(text) {
  let out = "";
  let i = 0;
  let inStr = null;
  while (i < text.length) {
    const ch = text[i];
    const next = text[i + 1];
    if (inStr) {
      out += ch;
      if (ch === "\\" && i + 1 < text.length) { out += text[i + 1]; i += 2; continue; }
      if (ch === inStr) inStr = null;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") { inStr = ch; out += ch; i++; continue; }
    if (ch === "/" && next === "/") {
      while (i < text.length && text[i] !== "\n") i++;
      continue;
    }
    if (ch === "/" && next === "*") {
      i += 2;
      while (i < text.length - 1 && !(text[i] === "*" && text[i + 1] === "/")) i++;
      i += 2;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

/** Find module-level array constants whose elements look like stat objects.
 *  Returns array of { startIndex, endIndex, name, body }. */
function findStatArrayConsts(text) {
  const results = [];
  const re = /^\s*(?:export\s+)?const\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?::\s*[^=]+)?=\s*\[/gm;
  let m;
  while ((m = re.exec(text)) !== null) {
    const openBracketIdx = re.lastIndex - 1;
    const end = findMatchingBracket(text, openBracketIdx, "[", "]");
    if (end < 0) continue;
    const body = text.slice(openBracketIdx + 1, end);
    if (!looksLikeStatArray(body)) continue;
    results.push({
      startIndex: m.index,
      endIndex: end,
      name: m[1],
      body,
    });
    re.lastIndex = end + 1;
  }
  return results;
}

function findMatchingBracket(text, startIdx, open, close) {
  let depth = 0;
  let inStr = null;
  for (let i = startIdx; i < text.length; i++) {
    const ch = text[i];
    const prev = i > 0 ? text[i - 1] : "";
    if (inStr) {
      if (ch === inStr && prev !== "\\") inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") { inStr = ch; continue; }
    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/** Heuristic: an array body that looks like a list of stat objects has
 *  at least two object literals, each with at least one numeric
 *  property assignment. We require at least 2 to avoid flagging
 *  single-element configs. */
function looksLikeStatArray(body) {
  let objCount = 0;
  let numericPropHits = 0;
  let depth = 0;
  let objStart = -1;
  let inStr = null;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    const prev = i > 0 ? body[i - 1] : "";
    if (inStr) {
      if (ch === inStr && prev !== "\\") inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") { inStr = ch; continue; }
    if (ch === "{") {
      if (depth === 0) objStart = i;
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0 && objStart >= 0) {
        const objBody = body.slice(objStart + 1, i);
        if (hasNumericProp(objBody)) numericPropHits++;
        objCount++;
        objStart = -1;
      }
    }
  }
  return objCount >= 2 && numericPropHits >= 2;
}

function hasNumericProp(objBody) {
  // identifier or "string-key" or 'string-key' followed by colon and a number
  return /(?:[A-Za-z_][A-Za-z0-9_]*|["'][^"']+["'])\s*:\s*-?\d+(?:\.\d+)?\b/.test(objBody);
}

/** Heuristic for sourced state nearby: a `source:` property or a
 *  comment-line "Source:" within the array body. */
function arrayClaimsSource(body) {
  if (/\bsource\s*:/i.test(body)) return true;
  return false;
}

function countLine(text, index) {
  let n = 1;
  for (let i = 0; i < index && i < text.length; i++) if (text[i] === "\n") n++;
  return n;
}

/** Extract a one-line snippet (the declaration line) for display. */
function declSnippet(text, startIndex) {
  const lineStart = text.lastIndexOf("\n", startIndex) + 1;
  const lineEnd = text.indexOf("\n", startIndex);
  const raw = text.slice(lineStart, lineEnd < 0 ? text.length : lineEnd).trim();
  return raw.length > 160 ? raw.slice(0, 157) + "..." : raw;
}

/** JSX text-node numeric tokens: percentages, per-N-people rates, dollar
 *  amounts, "Live" + number. We look only at content between `>` and `<`
 *  in JSX text positions. This is a lossy approximation: we scan the
 *  full file and accept some noise. */
const JSX_TEXT_HITS = [
  { re: />\s*\$?\d{1,3}(?:,\d{3})+\s*</g,         tag: "comma-separated count in JSX" },
  { re: />\s*\d{1,3}(?:\.\d+)?\s*%\s*</g,         tag: "percentage literal in JSX" },
  { re: />[^<]{0,40}\bper\s+(?:10k|100k|10,000|100,000)\b[^<]{0,40}</gi, tag: "per-N rate phrase" },
  { re: />\s*\$\d+(?:\.\d+)?\s*(?:M|B|K)\b\s*</g, tag: "dollar magnitude" },
  { re: />\s*Live\s*<[^<]*>\s*\d+/g,               tag: "'Live' label followed by number" },
];

function findJsxTextHits(text) {
  const hits = [];
  for (const { re, tag } of JSX_TEXT_HITS) {
    let m;
    re.lastIndex = 0;
    while ((m = re.exec(text)) !== null) {
      hits.push({ index: m.index, length: m[0].length, tag, raw: m[0] });
    }
  }
  return hits;
}

function fileContext(absPath, text) {
  const clean = stripComments(text);
  const sourcedImports = SOURCED_IMPORT_RE.some((r) => r.test(clean));
  const provenanceImports = PROVENANCE_IMPORT_RE.some((r) => r.test(clean));
  return { sourcedImports, provenanceImports };
}

function classify(reason, ctx, arrayBody) {
  if (arrayBody !== undefined) {
    if (arrayClaimsSource(arrayBody)) {
      return { klass: "likely-sourced", disposition: "FALSE-POSITIVE" };
    }
    return { klass: "likely-hardcoded-data", disposition: "SOURCE-IT" };
  }
  if (ctx.provenanceImports) {
    return { klass: "needs-review", disposition: "NEEDS-REVIEW" };
  }
  if (ctx.sourcedImports) {
    return { klass: "needs-review", disposition: "NEEDS-REVIEW" };
  }
  return { klass: "needs-review", disposition: "NEEDS-REVIEW" };
}

function scanFile(absPath) {
  if (shouldSkip(absPath)) return [];
  if (PIPELINE_FILES.has(absPath)) return [];
  if (isPipelineDataFile(absPath)) return [];
  if (!/\.(tsx?|jsx?)$/.test(absPath)) return [];
  let text;
  try { text = readFileSync(absPath, "utf8"); } catch { return []; }
  const rel = relative(REPO_ROOT, absPath).split(sep).join("/");
  const ctx = fileContext(absPath, text);
  const out = [];

  // (A) Stat-array consts
  const clean = stripComments(text);
  const arrays = findStatArrayConsts(clean);
  for (const arr of arrays) {
    // Map cleaned-text index back to original by counting newlines on the cleaned text;
    // cleaned text preserves newlines so line numbers align.
    const line = countLine(clean, arr.startIndex);
    const cls = classify(`stat-array ${arr.name}`, ctx, arr.body);
    out.push({
      file: rel,
      line,
      kind: "stat-array",
      name: arr.name,
      snippet: declSnippet(clean, arr.startIndex),
      class: cls.klass,
      disposition: cls.disposition,
      reason: cls.klass === "likely-hardcoded-data"
        ? "module-level array of stat objects with numeric props; no source: field inside literal"
        : "array literal contains source: field; treat as sourced",
    });
  }

  // (B) JSX text-node hits
  const jsxHits = findJsxTextHits(text);
  for (const h of jsxHits) {
    const line = countLine(text, h.index);
    const cls = classify("jsx-text", ctx, undefined);
    out.push({
      file: rel,
      line,
      kind: "jsx-text",
      name: h.tag,
      snippet: h.raw.replace(/\s+/g, " ").trim(),
      class: cls.klass,
      disposition: cls.disposition,
      reason: ctx.provenanceImports
        ? "file imports DataProvenance/IntegrityBadge; check if this literal is covered"
        : ctx.sourcedImports
          ? "file imports from a sourced pipeline; check if this literal derives from it"
          : "no provenance import and no sourced-pipeline import in this file",
    });
  }

  return out;
}

function scanCandidates() {
  const all = [];
  for (const root of SCAN_ROOTS) {
    for (const f of walk(root)) {
      all.push(...scanFile(f));
    }
  }
  all.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
  return all;
}

/** Orphan seed-data files: files in src/data/ that are not imported by any
 *  file under src/pages, src/components, src/utils, or other src/ files
 *  outside src/data itself. Test files do not count as importers. */
function scanOrphanSeeds() {
  // Build importer index across src (excluding src/data and tests).
  const importerRoots = [SRC];
  const importers = [];
  for (const r of importerRoots) {
    for (const f of walk(r)) {
      if (shouldSkip(f)) continue;
      if (!/\.(tsx?|jsx?)$/.test(f)) continue;
      if (f.startsWith(DATA_DIR + sep)) continue;
      importers.push(f);
    }
  }
  const importerText = importers.map((f) => {
    try { return readFileSync(f, "utf8"); } catch { return ""; }
  }).join("\n");

  const dataFiles = readdirSync(DATA_DIR).filter((n) => /\.(ts|tsx|json)$/.test(n) && !/\.test\./.test(n));
  const orphans = [];
  for (const name of dataFiles.sort()) {
    if (/^county-[a-z0-9-]+\.ts$/.test(name)) continue;
    if (name === "sources.test.ts" || name === "intelligence-domains.test.ts") continue;
    const stem = name.replace(/\.(ts|tsx|json)$/, "");
    const importRe = new RegExp(
      `from\\s+["'](?:[^"']*?/)?${stem.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}["']`,
    );
    if (!importRe.test(importerText)) {
      orphans.push(`artifacts/access-mi/src/data/${name}`);
    }
  }
  return orphans;
}

const args = process.argv.slice(2);
const wantJson = args.includes("--json");
const wantOrphans = args.includes("--orphans");

if (wantOrphans && !wantJson) {
  const orphans = scanOrphanSeeds();
  console.log(`Orphan seed candidates: ${orphans.length}`);
  for (const o of orphans) console.log(`  ${o}`);
  process.exit(0);
}

const candidates = scanCandidates();
const orphans = scanOrphanSeeds();

if (wantJson) {
  process.stdout.write(JSON.stringify({ candidates, orphans }, null, 2));
  process.exit(0);
}

// Human summary
const byClass = {};
const byFile = {};
for (const c of candidates) {
  byClass[c.class] = (byClass[c.class] || 0) + 1;
  byFile[c.file] = (byFile[c.file] || 0) + 1;
}
console.log(`[scan-rendered-fabrication] candidates: ${candidates.length}`);
for (const k of Object.keys(byClass).sort()) {
  console.log(`  ${k}: ${byClass[k]}`);
}
console.log(`\nTop files by candidate count:`);
const top = Object.entries(byFile).sort((a, b) => b[1] - a[1]).slice(0, 15);
for (const [f, n] of top) console.log(`  ${n.toString().padStart(4)}  ${f}`);
console.log(`\nOrphan seed-data files: ${orphans.length}`);
for (const o of orphans) console.log(`  ${o}`);
console.log(`\nSample (first 20):`);
for (const c of candidates.slice(0, 20)) {
  console.log(`  ${c.file}:${c.line}  [${c.class}/${c.disposition}]  ${c.kind}:${c.name}  ${c.snippet}`);
}
