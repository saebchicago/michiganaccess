#!/usr/bin/env node
/**
 * Build-entry-point parity guard.
 *
 * The app has two build entry points and they are not the same command:
 *
 *   artifacts/access-mi/package.json "build"  - generators, then every
 *       integrity guard, then `vite build`. This is what a developer runs.
 *   package.json (repo root) "build"          - what Netlify actually runs
 *       (netlify.toml: `npm run build && node scripts/write-build-manifest.mjs`).
 *
 * WHY
 * ---
 * On 2026-08-30 an audit found `/brief` crashing in a production-shaped
 * build: `src/data/alice-county.generated.json` was committed as a
 * six-line provenance stub, and `aliceData.ts` calls `payload.counties.map()`
 * at module scope. The app build hid it - `build-alice-county.mjs` runs
 * first there and rewrites the file before Vite ever reads it. The root
 * build skipped that generator, so the bundle embedded the stub and every
 * county brief died with "Cannot read properties of undefined (reading
 * 'map')" behind the error boundary.
 *
 * Committing the real payload fixes that instance. This guard closes the
 * class: any generator the app build runs before `vite build` must also run
 * in the root build before its `vite build`. Otherwise the next generated
 * dataset someone adds is one skipped step away from shipping empty.
 *
 * Run via: node scripts/check-build-parity.mjs
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const APP_PKG = path.join(here, "..", "package.json");
const ROOT_PKG = path.join(here, "..", "..", "..", "package.json");

/** Generator invocations (`node scripts/<name>.mjs`) that run before `vite build`. */
function generatorsBeforeViteBuild(command, label) {
  const viteAt = command.indexOf("vite build");
  if (viteAt === -1) {
    throw new Error(`${label} build script does not run \`vite build\`.`);
  }
  const prefix = command.slice(0, viteAt);
  const found = new Set();
  for (const m of prefix.matchAll(/node\s+scripts\/([\w-]+\.mjs)/g)) {
    // check-*.mjs are read-only guards; only generators write files the
    // bundle then embeds, so only they have to be mirrored.
    if (!m[1].startsWith("check-")) found.add(m[1]);
  }
  return found;
}

const appBuild = JSON.parse(readFileSync(APP_PKG, "utf8")).scripts?.build ?? "";
const rootBuild = JSON.parse(readFileSync(ROOT_PKG, "utf8")).scripts?.build ?? "";

const appGenerators = generatorsBeforeViteBuild(appBuild, "artifacts/access-mi");
const rootGenerators = generatorsBeforeViteBuild(rootBuild, "repo root");

const missing = [...appGenerators].filter((g) => !rootGenerators.has(g)).sort();

if (missing.length > 0) {
  for (const g of missing) {
    console.error(
      `[check-build-parity] FAIL the repo-root build (the one Netlify runs) does not run scripts/${g} before \`vite build\`, but artifacts/access-mi's build does. A deploy would bundle whatever that generator's output file happens to contain in git.`,
    );
  }
  console.error(`[check-build-parity] ${missing.length} missing generator(s).`);
  process.exit(1);
}

console.log(
  `[check-build-parity] ok - both build entry points run the same ${appGenerators.size} generator(s) before \`vite build\`.`,
);
