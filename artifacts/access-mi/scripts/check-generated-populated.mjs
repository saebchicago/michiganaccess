#!/usr/bin/env node
/**
 * check-generated-populated - a generated county dataset may ship as a
 * pending-ci stub, but the freshness registry must then say so. This guard
 * fails the build when a payload carries provenance.populated === false while
 * its dataFreshness entry advertises a concrete vintage, which is how the
 * "advertised but empty" defect reached production once already.
 *
 * Rule: if populated === false, the entry's currentVersion must contain one of
 * the pending markers below. If populated === true, it must not.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const freshnessPath = path.join(root, "src/data/dataFreshness.ts");

const PENDING_MARKERS = [/awaiting/i, /pending/i, /not yet/i];

/** generated payload -> dataFreshness entry id */
const WATCHED = [
  ["src/data/cdc-svi-county.generated.json", "cdc-svi-county"],
  ["src/data/nchs-overdose-county.generated.json", "nchs-overdose-county"],
  ["src/data/usaspending-county.generated.json", "usaspending"],
];

const freshness = await readFile(freshnessPath, "utf8");

function currentVersionFor(id) {
  const idx = freshness.indexOf(`id: "${id}"`);
  if (idx === -1) return null;
  const slice = freshness.slice(idx, idx + 1200);
  const m = slice.match(/currentVersion:\s*"([^"]*)"/);
  return m ? m[1] : null;
}

const failures = [];

for (const [rel, id] of WATCHED) {
  let payload;
  try {
    payload = JSON.parse(await readFile(path.join(root, rel), "utf8"));
  } catch (err) {
    failures.push(`${rel}: unreadable (${err.message})`);
    continue;
  }
  const populated = payload?.provenance?.populated === true;
  const version = currentVersionFor(id);
  if (version === null) {
    failures.push(`${rel}: no dataFreshness entry with id "${id}"`);
    continue;
  }
  const marksPending = PENDING_MARKERS.some((re) => re.test(version));
  if (!populated && !marksPending) {
    failures.push(
      `${rel}: provenance.populated=false but dataFreshness "${id}" advertises "${version}". Either run the ingestor or label the entry as awaiting its first successful pull.`,
    );
  }
  if (populated && marksPending) {
    failures.push(
      `${rel}: provenance.populated=true but dataFreshness "${id}" still says "${version}". Update currentVersion to the real vintage.`,
    );
  }
}

if (failures.length > 0) {
  console.error("[check-generated-populated] FAILED");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(`[check-generated-populated] ok - ${WATCHED.length} generated datasets agree with the freshness registry.`);
