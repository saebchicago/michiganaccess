#!/usr/bin/env node
/**
 * Backend-leak guard.
 *
 * Fails the build if any user-facing component (.tsx) references backend
 * internals or raw error payloads that must never reach the rendered UI:
 *
 *   - "CENSUS_API_KEY"  - secret env var name
 *   - "census-acs-proxy" - Supabase edge function name
 *   - ".bodySnippet"    - raw upstream response body carried on the
 *                          useCensusACS error object
 *   - "error.message"   - raw exception text
 *
 * Rationale: the published Methodology page commits to rendering a plain
 * "data unavailable" state on Census failure and never leaking backend
 * internals or secrets. A prior regression printed the CENSUS_API_KEY and
 * census-acs-proxy names directly to the user (ComparePlacesPage). This
 * guard makes that class of regression fail CI.
 *
 * Scope: .tsx files under src/ only. Backend identifiers legitimately live
 * in .ts hooks/config (e.g. src/hooks/useCensusACS.ts builds the proxy URL
 * and error object) - those are not rendered and are out of scope here.
 *
 * Allowlist mechanics (mirrors check-copy.mjs):
 *   - Add an exact repo-relative path to ALLOWLISTED_FILES for a file that
 *     legitimately references a token in a non-leaking way.
 *   - Add "// check-leak-ok" as a trailing comment on a line to suppress it.
 *
 * Run via: node scripts/check-no-backend-leak.mjs
 * Wired into: pnpm build (see package.json scripts.build)
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src");

// Files (relative to ROOT) exempt from all checks.
// field.tsx: generic react-hook-form primitive; error.message here is a
// form-validation message from the resolver, not a backend/exception leak.
const ALLOWLISTED_FILES = new Set([
  "src/components/ui/field.tsx",
]);

const SKIP_PATTERNS = [
  /\.test\.[tj]sx?$/,
  /__tests__/,
  /\.spec\.[tj]sx?$/,
  /node_modules/,
];

// Banned literals. Matched as case-sensitive substrings on non-comment lines.
const BANNED_TOKENS = [
  { token: "CENSUS_API_KEY", reason: "secret env var name must never render to the UI" },
  { token: "census-acs-proxy", reason: "backend edge-function name must never render to the UI" },
  { token: ".bodySnippet", reason: "raw upstream response body must never render to the UI" },
  { token: "error.message", reason: "raw exception text must never render to the UI" },
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
    } else if (/\.tsx$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

let failures = 0;

function report(rel, lineNum, msg) {
  console.error(`[check-no-backend-leak] FAIL ${rel}:${lineNum}  ${msg}`);
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

    // Inline suppression.
    if (raw.includes("// check-leak-ok")) continue;

    // Skip pure code-comment / block-comment lines.
    const trimmed = raw.trimStart();
    if (
      trimmed.startsWith("//") ||
      trimmed.startsWith("*") ||
      trimmed.startsWith("/*")
    ) {
      continue;
    }

    for (const { token, reason } of BANNED_TOKENS) {
      if (raw.includes(token)) {
        report(rel, lineNum, `banned token "${token}" (${reason})`);
      }
    }
  }
}

if (failures > 0) {
  console.error(
    `[check-no-backend-leak] ${failures} violation(s). Backend internals must never reach rendered UI. ` +
      `Render a clean unavailable state instead (see src/components/shared/EmptyState.tsx DataUnavailable).`,
  );
  process.exit(1);
} else {
  console.log("[check-no-backend-leak] ok - no backend-internal leaks in .tsx.");
}
