#!/usr/bin/env node
/**
 * Data-catalog integrity guard.
 *
 * `src/data/dataCatalog.ts` is the single source of truth for every
 * dataset the platform shows a user. `src/data/sourcesRegistry.ts` is the
 * single source of truth for every feed it ingests. This guard keeps the
 * two in lockstep and stops a third, ungoverned list from reappearing in
 * a page component - which is exactly how the catalog drifted before.
 *
 * Fails the build when:
 *
 *   STRUCTURE
 *     1. A catalog id or name is duplicated, or an id is not kebab-case.
 *     2. domain / geography / access is outside its closed enum.
 *     3. sourceUrl is missing, non-https, or unparseable.
 *
 *   REGISTRY LINKAGE
 *     4. An "ingested" entry has no registryFeed, or names one that does
 *        not exist in sourcesRegistry.ts.
 *     5. An "ingested" entry's publisherOrg disagrees with the org on its
 *        linked feed.
 *     6. A "reference" entry carries a registryFeed (reference entries are
 *        deliberately outside the counted feed registry).
 *
 *   DOCUMENTED-OVERRIDE RULE
 *     7. cadence differs from the linked feed's frequency without a
 *        cadenceNote explaining why.
 *     8. sourceUrl's host differs from the linked feed's host without a
 *        urlNote explaining why.
 *        Notes must be substantive, not a placeholder.
 *
 *   REACHABILITY
 *     9. poweredSurfaces is empty, or names a path that is not a
 *        registered route in src/config/routes.ts.
 *
 *   NO SHADOW CATALOGS
 *    10. A page that renders the catalog declares its own local array of
 *        datasets/sources instead of importing from dataCatalog.ts.
 *
 *   COPY ACCURACY
 *    11. Visible copy describes the FEED count (DATA_SOURCE_COUNT /
 *        DATA_SOURCE_DISPLAY) as "organizations". Feeds and publishers are
 *        different numbers - organization copy must use
 *        DATA_PUBLISHER_COUNT.
 *
 * Run via: node scripts/check-data-catalog.mjs
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..");
const SRC = path.join(ROOT, "src");

const CATALOG_FILE = path.join(SRC, "data", "dataCatalog.ts");
const REGISTRY_FILE = path.join(SRC, "data", "sourcesRegistry.ts");
const ROUTES_FILE = path.join(SRC, "config", "routes.ts");

/** Pages that must render from the catalog and keep no list of their own. */
const CATALOG_CONSUMER_PAGES = [
  path.join(SRC, "pages", "CivicDataHubPage.tsx"),
  path.join(SRC, "pages", "DataValidationPage.tsx"),
];

const DOMAINS = new Set([
  "Health",
  "Social",
  "Environment",
  "Safety",
  "Infrastructure",
  "Civic",
]);
const GEOGRAPHIES = new Set([
  "State",
  "County",
  "ZIP",
  "Tract",
  "Facility",
  "City",
]);
const ACCESS = new Set(["live_api", "static", "modeled", "curated"]);

const MIN_NOTE_LENGTH = 30;
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;

let failures = 0;
const fail = (msg) => {
  console.error(`[check-data-catalog] FAIL ${msg}`);
  failures++;
};

/**
 * Return the source text of the array literal starting at `open`,
 * bracket-matched and string-aware, or null if it never closes.
 */
function sliceArrayLiteral(src, open) {
  if (open < 0) return null;
  let depth = 0;
  let inStr = null;
  for (let i = open; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (c === "\\") i++;
      else if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") inStr = c;
    else if (c === "[") depth++;
    else if (c === "]" && --depth === 0) return src.slice(open, i + 1);
  }
  return null;
}

/**
 * Pull a top-level array literal out of a TypeScript module and evaluate
 * it. The catalog and registry literals contain only strings, arrays, and
 * plain objects - no identifiers, calls, or template expressions - so the
 * literal is already valid JavaScript. Evaluating beats regex-scraping
 * here because the schema is nested and a scrape that silently missed a
 * field would weaken every rule below it.
 */
function readArrayLiteral(file, exportName) {
  const src = readFileSync(file, "utf8");
  const decl = src.indexOf(exportName);
  if (decl < 0) throw new Error(`${exportName} not found in ${file}`);
  // Anchor on the "=" so the type annotation's own brackets (the "[]" in
  // `: CatalogEntry[] =`) cannot be mistaken for the value. Matching them
  // yields an empty array and a guard that silently checks nothing.
  const eq = src.indexOf("=", decl);
  if (eq < 0) throw new Error(`no initializer for ${exportName}`);
  const literal = sliceArrayLiteral(src, src.indexOf("[", eq));
  if (literal === null)
    throw new Error(`unterminated array literal for ${exportName}`);
  // eslint-disable-next-line no-new-func
  return new Function(`return ${literal};`)();
}

/** Registry entries live inside SOURCES_BY_CATEGORY, one array per key. */
function readRegistry() {
  const src = readFileSync(REGISTRY_FILE, "utf8");
  const out = [];
  const re =
    /"(Federal Agencies|Michigan State Agencies|Nonprofits & Research)":\s*\[/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const literal = sliceArrayLiteral(src, src.indexOf("[", m.index));
    if (literal === null) continue;
    // eslint-disable-next-line no-new-func
    const entries = new Function(`return ${literal};`)();
    for (const e of entries) out.push({ ...e, category: m[1] });
  }
  return out;
}

function readRoutes() {
  const src = readFileSync(ROUTES_FILE, "utf8");
  return new Set([...src.matchAll(/path:\s*"([^"]+)"/g)].map((m) => m[1]));
}

const host = (u) => {
  try {
    return new URL(u).host.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
};

const substantive = (note) =>
  typeof note === "string" && note.trim().length >= MIN_NOTE_LENGTH;

// ── Load ────────────────────────────────────────────────────────────────

const catalog = readArrayLiteral(CATALOG_FILE, "export const DATA_CATALOG");
const registry = readRegistry();
const routes = readRoutes();

// Self-check: a parse that silently yields nothing would let every rule
// below pass vacuously. Fail loudly instead.
if (!Array.isArray(catalog) || catalog.length === 0)
  fail("parsed 0 catalog entries from dataCatalog.ts - the parse is broken");
if (registry.length === 0)
  fail("parsed 0 feeds from sourcesRegistry.ts - the parse is broken");

const feedByName = new Map(registry.map((f) => [f.name, f]));

// ── Rules 1-9: per-entry checks ─────────────────────────────────────────

const seenIds = new Set();
const seenNames = new Set();

for (const e of catalog) {
  const at = e.id ? `"${e.id}"` : `"${e.name ?? "<unnamed>"}"`;

  // 1. identity
  if (!e.id || !KEBAB.test(e.id)) fail(`${at} - id must be kebab-case`);
  if (seenIds.has(e.id)) fail(`${at} - duplicate id`);
  seenIds.add(e.id);
  if (!e.name) fail(`${at} - name is required`);
  if (seenNames.has(e.name)) fail(`${at} - duplicate name "${e.name}"`);
  seenNames.add(e.name);

  // 2. closed enums
  if (!DOMAINS.has(e.domain)) fail(`${at} - domain "${e.domain}" not allowed`);
  if (!GEOGRAPHIES.has(e.geography))
    fail(`${at} - geography "${e.geography}" not allowed`);
  if (!ACCESS.has(e.access)) fail(`${at} - access "${e.access}" not allowed`);
  if (e.kind !== "ingested" && e.kind !== "reference")
    fail(`${at} - kind must be "ingested" or "reference"`);

  // 3. url shape
  if (!e.sourceUrl || !e.sourceUrl.startsWith("https://"))
    fail(`${at} - sourceUrl must be an https URL`);
  else if (!host(e.sourceUrl)) fail(`${at} - sourceUrl is not parseable`);
  if (!e.description || e.description.trim().length < 20)
    fail(`${at} - description is missing or too short to be useful`);

  // 4-8. registry linkage and documented overrides
  if (e.kind === "ingested") {
    if (!e.registryFeed) {
      fail(
        `${at} - ingested entries must name a registryFeed from sourcesRegistry.ts`,
      );
    } else {
      const feed = feedByName.get(e.registryFeed);
      if (!feed) {
        fail(
          `${at} - registryFeed "${e.registryFeed}" does not exist in sourcesRegistry.ts`,
        );
      } else {
        // 5. publisher agreement
        if (e.publisherOrg !== feed.org)
          fail(
            `${at} - publisherOrg "${e.publisherOrg}" but feed "${feed.name}" is published by "${feed.org}"`,
          );

        // 7. cadence agreement, or a documented reason
        if (e.cadence !== feed.frequency && !substantive(e.cadenceNote))
          fail(
            `${at} - cadence "${e.cadence}" differs from feed frequency "${feed.frequency}"; add a cadenceNote of at least ${MIN_NOTE_LENGTH} characters explaining why`,
          );

        // 8. host agreement, or a documented reason
        if (host(e.sourceUrl) !== host(feed.url) && !substantive(e.urlNote))
          fail(
            `${at} - sourceUrl host "${host(e.sourceUrl)}" differs from feed host "${host(feed.url)}"; add a urlNote of at least ${MIN_NOTE_LENGTH} characters explaining why`,
          );
        // A note on a URL identical to the feed's explains nothing and is
        // left over from an earlier mismatch. A note on a deeper path of
        // the same host is legitimate context, so only exact matches fail.
        if (e.sourceUrl === feed.url && e.urlNote)
          fail(
            `${at} - urlNote present but sourceUrl is identical to the feed URL; remove the stale note`,
          );
      }
    }
  } else if (e.registryFeed) {
    // 6. reference entries are outside the counted registry by design
    fail(
      `${at} - reference entries must not name a registryFeed (they are not counted feeds)`,
    );
  }

  // 9. reachability
  if (!Array.isArray(e.poweredSurfaces) || e.poweredSurfaces.length === 0) {
    fail(`${at} - poweredSurfaces must list at least one route`);
  } else {
    for (const p of e.poweredSurfaces)
      if (!routes.has(p))
        fail(`${at} - poweredSurfaces path "${p}" is not a registered route`);
  }
}

// ── Rule 10: no shadow catalogs in consumer pages ───────────────────────

for (const page of CATALOG_CONSUMER_PAGES) {
  const rel = path.relative(ROOT, page);
  let src;
  try {
    src = readFileSync(page, "utf8");
  } catch {
    fail(`${rel} - expected catalog consumer page is missing`);
    continue;
  }

  if (!/from\s+"@\/data\/dataCatalog"/.test(src))
    fail(`${rel} - must import its datasets from @/data/dataCatalog`);

  // A local array literal of records carrying sourceUrl/url + description
  // is the shape the old shadow catalogs had. Flag it wherever it returns.
  // The array is bracket-matched so the scan stops at the literal's own
  // closing bracket rather than bleeding into the JSX below it.
  const localArrays = [
    ...src.matchAll(/const\s+([A-Z][A-Z0-9_]*)\s*(?::[^=]+)?=\s*\[/g),
  ];
  for (const m of localArrays) {
    const body = sliceArrayLiteral(src, src.indexOf("[", m.index));
    if (body === null) continue;
    const looksLikeCatalog =
      /\bname:\s*"/.test(body) &&
      /\b(sourceUrl|url):\s*"https?:/.test(body) &&
      /\bdescription:\s*/.test(body);
    if (looksLikeCatalog)
      fail(
        `${rel} - local constant ${m[1]} looks like a shadow dataset catalog; move these entries into src/data/dataCatalog.ts`,
      );
  }
}

// ── Rule 11: feed count must never be called "organizations" ────────────

function walk(dir, out = []) {
  for (const name of readdirSyncSafe(dir)) {
    const full = path.join(dir, name);
    const st = statSyncSafe(full);
    if (!st) continue;
    if (st.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name))
      out.push(full);
  }
  return out;
}

function readdirSyncSafe(d) {
  try {
    return readdirSync(d);
  } catch {
    return [];
  }
}
function statSyncSafe(p) {
  try {
    return statSync(p);
  } catch {
    return null;
  }
}

const ORG_WORD = /organi[sz]ations?/i;
for (const file of walk(SRC)) {
  const src = readFileSync(file, "utf8");
  if (!/DATA_SOURCE_(COUNT|DISPLAY)/.test(src)) continue;
  const rel = path.relative(ROOT, file);
  const lines = src.split("\n");
  lines.forEach((line, i) => {
    if (!/DATA_SOURCE_(COUNT|DISPLAY)/.test(line)) return;
    // Look at the interpolation and the words immediately around it.
    if (ORG_WORD.test(line))
      fail(
        `${rel}:${i + 1} - describes the feed count as "organizations". Feeds (${registry.length}) and publishers are different numbers; use DATA_PUBLISHER_COUNT for organization copy.`,
      );
  });
}

// ── Report ──────────────────────────────────────────────────────────────

const ingested = catalog.filter((e) => e.kind === "ingested").length;
const reference = catalog.length - ingested;
const publishers = new Set(registry.map((f) => f.org)).size;
const unverified = registry.filter((f) => f.attributionUnverified);

if (unverified.length) {
  console.log(
    `[check-data-catalog] note - ${unverified.length} registry feed(s) carry attributionUnverified: ${unverified
      .map((f) => f.name)
      .join(", ")}. Confirm the publisher entity against its own site when network access allows.`,
  );
}

if (failures > 0) {
  console.error(`[check-data-catalog] ${failures} failure(s).`);
  process.exit(1);
}

console.log(
  `[check-data-catalog] ok - ${catalog.length} catalog entries (${ingested} ingested, ${reference} reference) against ${registry.length} feeds from ${publishers} publishers; all links, cadences, and surfaces reconcile.`,
);
