#!/usr/bin/env node
/**
 * Copy-quality guard.
 *
 * Fails the build if rendered copy contains:
 *   1. Em dashes (—) anywhere in src/ .tsx/.ts files
 *   2. Banned platform-self-description phrases
 *   3. Banned marketing words
 *
 * Allowlist mechanics:
 *   - Add an exact file path (relative to repo root) to ALLOWLISTED_FILES
 *     for files that legitimately cannot comply (none currently).
 *   - Add "// check-copy-ok" as a trailing comment on a specific line to
 *     suppress that line's check (e.g. for "free" inside a real program name
 *     that genuinely conflicts with the pattern).
 *   - BANNED_PHRASES entries with {allowInServiceDescriptions: true} skip
 *     lines where the match is preceded or followed by a noun phrase that
 *     indicates an external service (heuristic: word boundary after the match).
 *
 * Run via: node scripts/check-copy.mjs
 * Wired into: pnpm build (see package.json scripts.build)
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src");

// Files (relative to ROOT) exempt from all checks.
// aiService.ts: AI prompt instructions, not rendered UI copy.
// PrivacyPage.tsx: privacy policy legitimately describes data practices.
const ALLOWLISTED_FILES = new Set([
  "src/Services/aiService.ts",
  "src/pages/PrivacyPage.tsx",
]);

const SKIP_PATTERNS = [
  /\.test\.[tj]sx?$/,
  /__tests__/,
  /\.spec\.[tj]sx?$/,
  /node_modules/,
  /check-copy\.mjs$/,
];

// ── Em-dash rule ──────────────────────────────────────────────────────────────
const EM_DASH = "—";

// ── Banned phrases (platform self-descriptions and marketing negations) ───────
// These are checked with case-insensitive substring match.
// "free" as a standalone declaration is caught separately below.
const BANNED_PHRASES = [
  { phrase: "no ads",             reason: "marketing negation - delete, do not rephrase" },
  { phrase: "no tracking",        reason: "marketing negation - delete, do not rephrase" },
  { phrase: "no data collection", reason: "marketing negation - delete, do not rephrase" },
  { phrase: "free, forever",      reason: "banned platform self-description" },
  { phrase: "free, independent",  reason: "banned platform self-description" },
  { phrase: "free & no account",  reason: "banned platform self-description" },
  { phrase: "free for all michigan", reason: "banned platform self-description" },
];

// ── Banned standalone words ───────────────────────────────────────────────────
// Checked as whole-word matches (\\b) case-insensitively.
const BANNED_WORDS = [
  { word: "evidence-based", reason: "banned marketing word" },
  { word: "data-driven",    reason: "banned marketing word" },
  { word: "leveraging",     reason: "banned marketing word" },
  { word: "empowering",     reason: "banned marketing word" },
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
    } else if (/\.[tj]sx?$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

let failures = 0;

function report(rel, lineNum, msg) {
  console.error(`[check-copy] FAIL ${rel}:${lineNum}  ${msg}`);
  failures++;
}

const allFiles = walkDir(SRC);

for (const filePath of allFiles) {
  if (shouldSkip(filePath)) continue;
  const rel = relative(ROOT, filePath);
  if (ALLOWLISTED_FILES.has(rel)) continue;

  let content;
  try {
    content = readFileSync(filePath, "utf8");
  } catch {
    continue;
  }

  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const lineNum = i + 1;

    // Inline suppression: trailing "// check-copy-ok" skips this line entirely.
    if (raw.includes("// check-copy-ok")) continue;

    // Skip pure-code-comment lines (//) and block-comment lines (* prefix).
    const trimmed = raw.trimStart();
    const isCodeComment =
      trimmed.startsWith("//") ||
      trimmed.startsWith("*") ||
      trimmed.startsWith("/*");

    // 1. Em-dash check (applies to all lines including comments per standing rule).
    if (raw.includes(EM_DASH)) {
      report(rel, lineNum, `em dash found - replace with ' - ' or hyphen`);
    }

    // Remaining checks only apply to non-comment lines that look like
    // rendered copy (JSX/template string content).
    if (isCodeComment) continue;

    // 2. Banned phrases.
    const lower = raw.toLowerCase();
    for (const { phrase, reason } of BANNED_PHRASES) {
      if (lower.includes(phrase)) {
        report(rel, lineNum, `banned phrase "${phrase}" (${reason})`);
      }
    }

    // 3. Banned words (whole-word, case-insensitive).
    for (const { word, reason } of BANNED_WORDS) {
      const escaped = word.replace(/-/g, "\\-");
      const re = new RegExp(`\\b${escaped}\\b`, "i");
      if (re.test(raw)) {
        report(rel, lineNum, `banned word "${word}" (${reason})`);
      }
    }
  }
}

if (failures > 0) {
  console.error(`[check-copy] ${failures} violation(s). Fix copy before building.`);
  process.exit(1);
} else {
  console.log(`[check-copy] ok - no copy violations found.`);
}
