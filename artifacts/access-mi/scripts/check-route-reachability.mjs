#!/usr/bin/env node
/**
 * Route-reachability guard.
 *
 * A route can be registered in APP_ROUTES, built, prerendered and indexed by
 * search while being linked from absolutely nowhere - so no visitor can ever
 * click their way to it. That is exactly what happened to /food-access, which
 * appeared exactly once in the whole codebase (its own route definition) until
 * Round 7. It happens because nothing derives the nav from APP_ROUTES: there
 * are three INDEPENDENTLY hand-maintained link surfaces -
 *
 *   1. NAV_GROUPS       (src/config/routes.ts)   - header desktop + mobile
 *   2. footerSections   (a literal inside Footer.tsx)
 *   3. SITEMAP_SECTIONS (src/config/routes.ts)   - the /sitemap page
 *
 * - plus every in-page <Link to="..."> in the app.
 *
 * WHAT THIS GUARD CHECKS, precisely:
 *   For each registered non-param route, at least one module OTHER THAN the
 *   route's own page component links to it.
 *
 * A self-link does NOT count. Pages routinely reference their own path for
 * canonical URLs, share links and breadcrumbs; that says nothing about whether
 * anyone can get there.
 *
 * WHAT IT DOES NOT CHECK:
 *   Reachability is transitive, and this is a depth-1 check. A page linked only
 *   from another orphaned page passes here but is still unreachable in practice.
 *   Doing better needs a real BFS from the nav roots over a resolved import
 *   graph. This guard deliberately claims only what it proves.
 *
 * Run via: node scripts/check-route-reachability.mjs
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, dirname, relative, sep } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC_DIR = join(ROOT, "src");
const ROUTES_FILE = join(ROOT, "src", "config", "routes.ts");

/**
 * Routes intentionally not linked from anywhere.
 *
 * Keep this list SHORT and justified. Adding a route here to silence the guard
 * defeats its purpose - prefer linking the page.
 */
const INTENTIONALLY_UNLINKED = new Map([
  ["/", "the homepage itself"],
  ["/embed", "embeddable widget, linked externally by consumers"],
  ["/sitemap", "reached from the footer chrome, not a content route"],
  ["/not-found", "error route"],
  ["/404", "error route"],
  [
    "/chna/share",
    "parameterized share target driven by useSearchParams; meaningless without query params",
  ],
]);

/**
 * Files that mention a path but do not make it clickable: route metadata and
 * the search indexes.
 *
 * routes.ts is deliberately NOT here. It carries the APP_ROUTES registry under
 * the `path:` key and the NAV_GROUPS / SITEMAP_SECTIONS link lists under
 * `href:`, and only the latter is read as a link below - so the two never
 * collide and the nav surfaces still count.
 */
const NON_LINK_FILES = new Set([
  "src/config/routeMeta.ts",
  "src/utils/pageSearchIndex.ts",
  "src/utils/searchUtils.ts",
]);

/** Dynamic/param routes are reached by navigation, not by a static link. */
function isParamRoute(path) {
  return path.includes(":") || path.includes("*");
}

function toPosix(p) {
  return sep === "/" ? p : p.split(sep).join("/");
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, out);
      continue;
    }
    if (!/\.tsx?$/.test(entry)) continue;
    if (/\.(test|spec)\.tsx?$/.test(entry)) continue;
    out.push(full);
  }
  return out;
}

const routesSrc = readFileSync(ROUTES_FILE, "utf8");

// Every registered route paired with the component identifier that renders it:
//   { path: "/learn", component: pages.LearnPage, label: "Learn" }
// The two fields appear in either order, so scan a short window after the path.
const registered = new Map(); // path -> componentName | null
for (const m of routesSrc.matchAll(/\bpath:\s*["'`]([^"'`]+)["'`]/g)) {
  const path = m[1];
  if (registered.has(path)) continue;
  const window = routesSrc.slice(m.index, m.index + 240);
  const comp = window.match(/\bcomponent:\s*(?:pages\.)?([A-Za-z0-9_]+)/);
  registered.set(path, comp ? comp[1] : null);
}

// Map componentName -> its source file, from the `pages` map at the top of
// routes.ts:
//   const pages = { DisabilityAccessPage: lazy(() => import("@/pages/DisabilityAccess")), ... }
// The identifier and the filename often differ (DisabilityAccessPage lives in
// DisabilityAccess.tsx), so guessing by basename silently fails to spot a
// page's self-links and lets an orphan through.
const files = walk(SRC_DIR);
const byRelPath = new Map(files.map((f) => [toPosix(relative(SRC_DIR, f)), f]));

const componentFile = new Map();
for (const m of routesSrc.matchAll(
  /([A-Za-z0-9_]+):\s*(?:lazy\(\s*\(\)\s*=>\s*)?import\(\s*["'`]@\/([^"'`]+)["'`]/g,
)) {
  const [, name, modulePath] = m;
  const file =
    byRelPath.get(`${modulePath}.tsx`) ?? byRelPath.get(`${modulePath}.ts`);
  if (file) componentFile.set(name, file);
}

const unresolved = [...registered.values()].filter(
  (c) => c && !componentFile.has(c),
);
if (unresolved.length > 0) {
  console.error(
    `[check-route-reachability] FAIL - could not resolve the source file for ` +
      `${unresolved.length} route component(s): ${[...new Set(unresolved)].sort().join(", ")}\n\n` +
      `Without that mapping this guard cannot tell a page's self-links from a\n` +
      `real inbound link, and would pass an orphan silently. Check the \`pages\`\n` +
      `map in src/config/routes.ts.`,
  );
  process.exit(1);
}

// Collect every route literal, remembering which file it came from so a page's
// own self-references can be discounted.
//
// Match ANY quoted path literal, not just `href:` / `to=` / `href=`. Real links
// are routinely held in a variable or a ternary before they reach the JSX prop:
//   const METHODOLOGY_URL = "/methodology/dual-eligible-exposure";
//   const href = context === "utility" ? "/partners/utilities-regulators" : ...
// Requiring the literal to sit directly on the prop reported both of those as
// orphans when they are linked perfectly well. Only literals that exactly equal
// a registered route are counted, so incidental strings do not match.
const linkSources = new Map(); // route -> Set<file>
for (const file of files) {
  const rel = toPosix(relative(ROOT, file));
  if (NON_LINK_FILES.has(rel)) continue;
  const src = readFileSync(file, "utf8");

  // routes.ts is the one file where a bare path literal is NOT a link: every
  // route's own `path:` registration lives there, and counting it would make
  // every route trivially reachable from itself. Read only `href:` there,
  // which is exactly what NAV_GROUPS and SITEMAP_SECTIONS use.
  const matches =
    rel === "src/config/routes.ts"
      ? src.matchAll(/\bhref:\s*["'`]([^"'`]+)["'`]/g)
      : src.matchAll(/["'`](\/[^"'`\n]*)["'`]/g);

  for (const m of matches) {
    const route = m[1].split("#")[0].split("?")[0];
    if (!registered.has(route)) continue;
    if (!linkSources.has(route)) linkSources.set(route, new Set());
    linkSources.get(route).add(file);
  }
}

const unreachable = [];
for (const [path, comp] of registered) {
  if (INTENTIONALLY_UNLINKED.has(path)) continue;
  if (isParamRoute(path)) continue;

  const ownFile = comp ? componentFile.get(comp) : undefined;
  const linkers = [...(linkSources.get(path) ?? [])].filter(
    (f) => f !== ownFile,
  );
  if (linkers.length > 0) continue;

  unreachable.push(path);
}

if (unreachable.length > 0) {
  console.error(
    `[check-route-reachability] FAIL - ${unreachable.length} route(s) are registered but nothing links to them:\n`,
  );
  for (const p of unreachable.sort()) {
    console.error(`  ${p}`);
  }
  console.error(
    `\nA visitor cannot reach these by clicking. Add each to NAV_GROUPS, the\n` +
      `footerSections literal in Footer.tsx, SITEMAP_SECTIONS, or an in-page link\n` +
      `from a related page - whichever fits. A link inside the page's own\n` +
      `component does not count.\n` +
      `If a route is genuinely meant to be unlinked, add it to\n` +
      `INTENTIONALLY_UNLINKED in this script with a reason.`,
  );
  process.exit(1);
}

console.log(
  `[check-route-reachability] ok - all ${registered.size} registered routes are linked from at least one other module ` +
    `(${INTENTIONALLY_UNLINKED.size} allowlisted, ${files.length} source files scanned).`,
);
