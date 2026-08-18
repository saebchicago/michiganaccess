#!/usr/bin/env node
/**
 * Route taxonomy integrity check.
 *
 * `src/config/routeTaxonomy.ts` is the curation SSOT behind the discovery
 * surfaces (/explore, homepage intent cards, KeepExploring rails). Nothing
 * else validates it: a taxonomy path that is not a registered route becomes
 * a dead card, a path without a ROUTE_META summary becomes a card with no
 * copy, and an intent with the wrong number of destinations silently breaks
 * the homepage's 4x3 layout. Each rule below turns one of those into a
 * build failure.
 *
 * Parsing follows the same regex-over-literals technique as
 * prerender-meta.mjs, which is why routeTaxonomy.ts requires plain
 * double-quoted string literals. A non-empty-parse self-check guards the
 * parser itself: if the file's shape drifts away from what the regex reads,
 * the count mismatch fails the build rather than silently checking nothing
 * (the failure mode the 2026-08-16 audit found in an earlier guard).
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const read = (rel) => readFile(path.join(projectRoot, rel), "utf8");

const taxonomySrc = await read("src/config/routeTaxonomy.ts");
const routesSrc = await read("src/config/routes.ts");
const routeMetaSrc = await read("src/config/routeMeta.ts");

const errors = [];

// ---- parse the closed id sets from the taxonomy's own type declarations ----
function unionValues(src, typeName) {
  const m = src.match(
    new RegExp(`export type ${typeName} =([\\s\\S]*?);`, ""),
  );
  if (!m) return null;
  return [...m[1].matchAll(/"([a-z-]+)"/g)].map((x) => x[1]);
}
const SUBJECT_IDS = unionValues(taxonomySrc, "SubjectId");
const INTENT_IDS = unionValues(taxonomySrc, "IntentId");
if (!SUBJECT_IDS?.length || !INTENT_IDS?.length) {
  console.error(
    "check-route-taxonomy: could not parse SubjectId/IntentId unions from routeTaxonomy.ts",
  );
  process.exit(1);
}

// ---- SUBJECTS chip list must cover the SubjectId union exactly ----
const subjectsBlock = taxonomySrc.match(
  /export const SUBJECTS[\s\S]*?=\s*\[([\s\S]*?)\];/,
);
const chipIds = subjectsBlock
  ? [...subjectsBlock[1].matchAll(/id:\s*"([a-z-]+)"/g)].map((m) => m[1])
  : [];
if (
  chipIds.length !== SUBJECT_IDS.length ||
  SUBJECT_IDS.some((id) => !chipIds.includes(id))
) {
  errors.push(
    `SUBJECTS chip list [${chipIds.join(", ")}] must cover the SubjectId union [${SUBJECT_IDS.join(", ")}] exactly`,
  );
}

// ---- INTENTS card list must cover the IntentId union exactly ----
const intentsBlock = taxonomySrc.match(
  /export const INTENTS[\s\S]*?=\s*\[([\s\S]*?)\];/,
);
const intentCardIds = intentsBlock
  ? [...intentsBlock[1].matchAll(/id:\s*"([a-z-]+)"/g)].map((m) => m[1])
  : [];
if (
  intentCardIds.length !== INTENT_IDS.length ||
  INTENT_IDS.some((id) => !intentCardIds.includes(id))
) {
  errors.push(
    `INTENTS card list [${intentCardIds.join(", ")}] must cover the IntentId union [${INTENT_IDS.join(", ")}] exactly`,
  );
}

// ---- parse ROUTE_TAXONOMY entries ----
const taxAnchor = taxonomySrc.indexOf(
  "export const ROUTE_TAXONOMY: Record<string, RouteTaxonomyEntry> = {",
);
if (taxAnchor === -1) {
  console.error(
    "check-route-taxonomy: ROUTE_TAXONOMY declaration not found - the anchor this guard parses from has changed",
  );
  process.exit(1);
}
const taxBody = taxonomySrc.slice(taxAnchor);

const entryRe = /"(\/[^"]*)":\s*\{([^{}]*)\}/g;
const entries = new Map();
let m;
while ((m = entryRe.exec(taxBody)) !== null) {
  const [, p, body] = m;
  if (entries.has(p)) {
    errors.push(`duplicate taxonomy entry for ${p}`);
    continue;
  }
  const subjects = [
    ...(body.match(/subjects:\s*\[([^\]]*)\]/)?.[1] ?? "").matchAll(
      /"([a-z-]+)"/g,
    ),
  ].map((x) => x[1]);
  const related = [
    ...(body.match(/related:\s*\[([^\]]*)\]/)?.[1] ?? "").matchAll(
      /"(\/[^"]*)"/g,
    ),
  ].map((x) => x[1]);
  const intent = body.match(/intent:\s*"([a-z-]+)"/)?.[1];
  const featured = /featured:\s*true/.test(body);
  entries.set(p, { subjects, related, intent, featured });
}

// Non-empty-parse self-check: every `subjects:` in the object literal must
// belong to an entry the regex captured.
const subjectsOccurrences = (taxBody.match(/subjects:\s*\[/g) ?? []).length;
if (entries.size === 0 || entries.size !== subjectsOccurrences) {
  console.error(
    `check-route-taxonomy: parsed ${entries.size} entries but found ${subjectsOccurrences} "subjects:" keys - the file's shape has drifted from what this guard can read. Keep entries as one-line objects with plain double-quoted literals.`,
  );
  process.exit(1);
}

// ---- registered routes ----
const registered = new Set(
  [...routesSrc.matchAll(/path:\s*"(\/[^"]*)"/g)].map((x) => x[1]),
);

// ---- ROUTE_META paths and summaries ----
const metaAnchor = routeMetaSrc.indexOf("ROUTE_META: RouteMeta[] = [");
const metaBody = routeMetaSrc.slice(metaAnchor);
const metaBlocks = metaBody.split(/\n  \{\n/).slice(1);
const metaSummaries = new Map();
for (const block of metaBlocks) {
  const p = block.match(/path:\s*"([^"]+)"/)?.[1];
  if (!p) continue;
  metaSummaries.set(p, /summary:\s*"/.test(block));
}

// ---- per-entry rules ----
const intentBuckets = new Map();
let featuredCount = 0;

for (const [p, e] of entries) {
  if (!registered.has(p)) {
    errors.push(`${p} is not a registered route in src/config/routes.ts`);
  }
  if (p.includes(":") || p.includes("*")) {
    errors.push(`${p} is a parameterized route; the taxonomy curates only static destinations`);
  }
  if (!metaSummaries.has(p)) {
    errors.push(`${p} has no ROUTE_META entry - its card would have no prerender copy`);
  } else if (!metaSummaries.get(p)) {
    errors.push(`${p} has a ROUTE_META entry without a summary - the summary is the card copy`);
  }
  if (e.subjects.length === 0) {
    errors.push(`${p} has no subjects`);
  }
  for (const s of e.subjects) {
    if (!SUBJECT_IDS.includes(s)) {
      errors.push(`${p} uses unknown subject "${s}"`);
    }
  }
  if (e.intent !== undefined) {
    if (!INTENT_IDS.includes(e.intent)) {
      errors.push(`${p} uses unknown intent "${e.intent}"`);
    } else {
      const bucket = intentBuckets.get(e.intent) ?? [];
      bucket.push(p);
      intentBuckets.set(e.intent, bucket);
    }
  }
  if (e.featured) featuredCount += 1;
  if (e.related.length > 4) {
    errors.push(`${p} lists ${e.related.length} related destinations; the rail shows at most 4`);
  }
  for (const r of e.related) {
    if (r === p) errors.push(`${p} lists itself as related`);
    if (!registered.has(r)) {
      errors.push(`${p} relates to unregistered route ${r}`);
    }
    if (!entries.has(r)) {
      errors.push(`${p} relates to ${r}, which is not in the taxonomy (related cards need subjects and copy)`);
    }
  }
}

// ---- aggregate rules ----
for (const id of INTENT_IDS) {
  const bucket = intentBuckets.get(id) ?? [];
  if (bucket.length !== 3) {
    errors.push(
      `intent "${id}" has ${bucket.length} destinations [${bucket.join(", ")}]; the homepage intent card renders exactly 3`,
    );
  }
}
if (featuredCount < 3 || featuredCount > 8) {
  errors.push(
    `${featuredCount} featured entries; the editorial pick set must stay between 3 and 8`,
  );
}
if (entries.size < 60) {
  errors.push(
    `only ${entries.size} taxonomy entries; the curated library floor is 60 - if destinations were removed on purpose, lower the floor here deliberately`,
  );
}

if (errors.length > 0) {
  console.error(`check-route-taxonomy: ${errors.length} problem(s):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(
  `check-route-taxonomy: ok - ${entries.size} curated destinations, ${featuredCount} featured, ${INTENT_IDS.length} intents x 3, subjects [${SUBJECT_IDS.join(", ")}]`,
);
