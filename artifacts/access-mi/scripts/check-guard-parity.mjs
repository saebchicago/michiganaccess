#!/usr/bin/env node
/**
 * Integrity-guard parity between the two build entry points.
 *
 * check-build-parity.mjs mirrors GENERATORS and check-postbuild-parity.mjs
 * mirrors post-build steps, but neither covered the read-only check-*.mjs
 * guards. Until 2026-11-22 the repo-root build (what Netlify runs) skipped
 * every one of them, so a production deploy could ship data the developer
 * build would have rejected, and CI was manual-only at the time. This guard
 * fails the build if a check-*.mjs that the app build runs before
 * `vite build` is missing from the root build.
 *
 * Run via: node scripts/check-guard-parity.mjs
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const appBuild = JSON.parse(readFileSync(path.join(here, "..", "package.json"), "utf8")).scripts?.build ?? "";
const rootBuild = JSON.parse(readFileSync(path.join(here, "..", "..", "..", "package.json"), "utf8")).scripts?.build ?? "";

function guardsBeforeVite(command, label) {
  const at = command.indexOf("vite build");
  if (at === -1) throw new Error(`${label} build script does not run \`vite build\`.`);
  return new Set([...command.slice(0, at).matchAll(/node\s+scripts\/(check-[\w-]+\.mjs)/g)].map((m) => m[1]));
}

const app = guardsBeforeVite(appBuild, "artifacts/access-mi");
const root = guardsBeforeVite(rootBuild, "repo root");
const missing = [...app].filter((g) => !root.has(g)).sort();

if (missing.length > 0) {
  for (const g of missing) {
    console.error(
      `[check-guard-parity] FAIL the repo-root build (Netlify) does not run scripts/${g} before \`vite build\`, but artifacts/access-mi's build does.`,
    );
  }
  process.exit(1);
}
console.log(`[check-guard-parity] ok - the repo-root build runs all ${app.size} integrity guard(s) the app build runs.`);
