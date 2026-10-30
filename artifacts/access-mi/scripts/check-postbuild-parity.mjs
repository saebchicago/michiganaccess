#!/usr/bin/env node
/**
 * Build-entry-point parity guard for the steps AFTER `vite build`.
 *
 * check-build-parity.mjs covers generators that run before `vite build`. The
 * post-build chain had drifted the same way: the repo-root build (what
 * netlify.toml runs) ran prerender-meta and normalize-project-schema only,
 * while the app build also ran prerender-extra-meta and the prerender guards.
 * Production therefore shipped routes such as /opportunity with the homepage
 * canonical while a local `pnpm build` looked correct.
 *
 * This guard requires both entry points to run the same `node scripts/*.mjs`
 * steps after `vite build`, in the same order.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const APP_PKG = path.join(here, "..", "package.json");
const ROOT_PKG = path.join(here, "..", "..", "..", "package.json");

function stepsAfterViteBuild(command, label) {
  const at = command.indexOf("vite build");
  if (at === -1) throw new Error(`${label} build script does not run \`vite build\`.`);
  return [...command.slice(at).matchAll(/node\s+scripts\/([\w-]+\.mjs)/g)].map((m) => m[1]);
}

const app = stepsAfterViteBuild(
  JSON.parse(readFileSync(APP_PKG, "utf8")).scripts?.build ?? "",
  "artifacts/access-mi",
);
const root = stepsAfterViteBuild(
  JSON.parse(readFileSync(ROOT_PKG, "utf8")).scripts?.build ?? "",
  "repo root",
);

if (app.join(" ") !== root.join(" ")) {
  console.error("[check-postbuild-parity] FAIL post-build steps differ between build entry points.");
  console.error(`  artifacts/access-mi: ${app.join(" -> ")}`);
  console.error(`  repo root (Netlify): ${root.join(" -> ")}`);
  process.exit(1);
}
console.log(`[check-postbuild-parity] ok - both build entry points run the same ${app.length} post-build step(s).`);
