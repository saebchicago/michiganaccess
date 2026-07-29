#!/usr/bin/env node
/**
 * ROUTE_META <-> APP_ROUTES agreement check.
 *
 * Every path in `src/config/routeMeta.ts` must resolve to a registered
 * APP_ROUTES path, an in-SPA <Navigate> alias, or a netlify.toml 301
 * source. `generate-sitemap.mjs` and `prerender-meta.mjs` both derive
 * from ROUTE_META, so a stale entry becomes a sitemap-advertised
 * soft-404: Netlify serves the prerendered HTML with a 200, then the
 * SPA hydrates into NotFound. That exact failure shipped for /energy
 * and /legal-aid after those routes were removed on 2026-07-04
 * (FIXLOG) while their metadata stayed behind.
 *
 * check-route-reachability.mjs guards the opposite direction only
 * (registered route must be linked from somewhere), so this script is
 * the missing half. Wired into the build (package.json -> build) and CI.
 */
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const repoRoot = path.resolve(projectRoot, "..", "..");
const routeMetaPath = path.join(projectRoot, "src/config/routeMeta.ts");
const routesPath = path.join(projectRoot, "src/config/routes.ts");
const appTsxPath = path.join(projectRoot, "src/App.tsx");
const netlifyTomlPath = path.join(repoRoot, "netlify.toml");

function extractPaths(src) {
  const paths = new Set();
  const re = /path:\s*"(\/[^"]*)"/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    paths.add(m[1]);
  }
  return paths;
}

function extractNavigateSources(src) {
  const sources = new Set();
  const re = /<Route\s+path="(\/[^"]+)"\s+element=\{<Navigate\s+to=/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    sources.add(m[1]);
  }
  return sources;
}

function extractNetlifyRedirects(src) {
  const sources = new Set();
  const re = /from\s*=\s*"(\/[^"]+)"/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    sources.add(m[1]);
  }
  return sources;
}

async function main() {
  for (const p of [routeMetaPath, routesPath, appTsxPath]) {
    if (!existsSync(p)) {
      console.error(`[check-routemeta-routes] missing ${p}`);
      process.exit(1);
    }
  }

  const metaPaths = extractPaths(await readFile(routeMetaPath, "utf8"));
  const routePaths = extractPaths(await readFile(routesPath, "utf8"));
  const navigateSources = extractNavigateSources(
    await readFile(appTsxPath, "utf8"),
  );
  let edgeRedirects = new Set();
  if (existsSync(netlifyTomlPath)) {
    edgeRedirects = extractNetlifyRedirects(
      await readFile(netlifyTomlPath, "utf8"),
    );
  }

  const valid = new Set([...routePaths, ...navigateSources, ...edgeRedirects]);
  valid.add("/");

  const orphaned = [...metaPaths].filter((p) => !valid.has(p));

  if (metaPaths.size === 0) {
    console.error(
      "[check-routemeta-routes] FAIL - extracted 0 paths from routeMeta.ts; the literal form may have changed.",
    );
    process.exit(1);
  }

  if (orphaned.length === 0) {
    console.log(
      `[check-routemeta-routes] ok - all ${metaPaths.size} ROUTE_META paths resolve to a registered route or redirect.`,
    );
    return;
  }

  console.error(
    `[check-routemeta-routes] FAIL - ${orphaned.length} ROUTE_META path(s) have no registered route (sitemap/prerender would ship soft-404s):`,
  );
  for (const p of orphaned) {
    console.error(`  ${p}`);
  }
  process.exit(1);
}

main().catch((err) => {
  console.error("[check-routemeta-routes] failed:", err);
  process.exit(1);
});
