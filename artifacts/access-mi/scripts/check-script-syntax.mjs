#!/usr/bin/env node
/**
 * Script parseability guard.
 *
 * Every .mjs under scripts/ must parse. This exists because
 * refresh-acs-broadband-county.mjs shipped with a hard SyntaxError -
 * "Identifier 'rows' has already been declared", from an incomplete
 * migration to fetchAndRecord that left a second implementation behind -
 * and nothing noticed. The ACS broadband dataset sat 100% null in
 * production while the weekly job failed, and the failure was read as a
 * missing API key. Adding the key would not have fixed it: the module
 * could not be loaded at all. See docs/audit-2026-07.md (D10).
 *
 * Ingestion and guard scripts are the one part of this codebase that
 * typecheck and vitest never touch - they are standalone Node modules, not
 * imported by the app - so a syntax error in one is invisible to every
 * other check. It only surfaces when a scheduled workflow fails, and a
 * scheduled workflow that has been failing for weeks reads as noise.
 *
 * `node --check` parses without executing, so this is fast and has no side
 * effects: no network, no writes, no API keys required.
 *
 * Run via: node scripts/check-script-syntax.mjs
 */

import { readdirSync, statSync } from "fs";
import { join, relative, dirname } from "path";
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const REPO_ROOT = join(ROOT, "..", "..");

/** Directories scanned for .mjs modules, relative to the repo root. */
const SCAN_DIRS = ["artifacts/access-mi/scripts", "scripts"];

function collectMjs(dir) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      out.push(...collectMjs(full));
    } else if (entry.isFile() && entry.name.endsWith(".mjs")) {
      out.push(full);
    }
  }
  return out;
}

const files = SCAN_DIRS.flatMap((d) => collectMjs(join(REPO_ROOT, d)));

if (files.length === 0) {
  console.error("[check-script-syntax] FAIL - found no .mjs scripts to check.");
  process.exit(1);
}

const broken = [];
for (const file of files) {
  try {
    execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
  } catch (err) {
    const detail = (err.stderr?.toString() ?? err.message ?? "")
      .split("\n")
      .find((line) => line.includes("Error"))
      ?.trim();
    broken.push({
      file: relative(REPO_ROOT, file).replace(/\\/g, "/"),
      detail: detail ?? "failed to parse",
    });
  }
}

if (broken.length > 0) {
  console.error(
    `[check-script-syntax] FAIL - ${broken.length} script(s) do not parse:`,
  );
  for (const b of broken) console.error(`  ${b.file}: ${b.detail}`);
  console.error(
    "\nA script that does not parse cannot run at all, so any workflow " +
      "depending on it fails no matter how its environment is configured.",
  );
  process.exit(1);
}

console.log(`[check-script-syntax] ok - all ${files.length} scripts parse.`);
