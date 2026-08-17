#!/usr/bin/env node
/**
 * Data-workflow consistency guard.
 *
 * Any scheduled workflow that commits a refreshed `*.generated.json` must
 * also regenerate `provenance-index.generated.json` and commit it in the
 * same change.
 *
 * WHY
 * ---
 * `src/data/dataFreshness.ts` derives `lastPulled` from the provenance
 * index, and `check-data-freshness.mjs` fails when the index disagrees with
 * a dataset's `provenance.ingested_at`. On 2026-08-17 `build-data.yml` did
 * exactly that: it refreshed acs-broadband-county.generated.json, bumped
 * ingested_at to 2026-08-17, committed the dataset without the index, and
 * turned every subsequent `pnpm build` and CI Integrity-guards run red. The
 * guard was right; the workflow was incomplete.
 *
 * Fixing that one workflow is not enough - the next data workflow someone
 * adds has the same trap waiting. This guard closes the class: if a workflow
 * stages anything under `artifacts/access-mi/src/data`, it must run the
 * generator and stage the index too.
 *
 * Fails the build when a workflow:
 *   1. stages a src/data path but never runs generate-provenance-index.mjs
 *   2. runs the generator but does not stage the index it just rewrote
 *
 * Scope is derived, not guessed: a workflow only has to regenerate the index
 * if it stages a dataset that is actually IN the index - i.e. one carrying
 * `provenance.ingested_at`. Files under src/data that carry no ingest stamp
 * are exempt, and correctly so: `sourceLinkHealth.generated.json` is a link
 * reachability report with no `provenance` block at all, and
 * `verifiedHealthFacilities.json` records `fetched_at` rather than
 * `ingested_at`. An earlier revision of this guard treated every
 * `*.generated.json` as a dataset and failed on source-link-check.yml.
 *
 * Run via: node scripts/check-data-workflows.mjs
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(here, "..", "..", "..");
const WORKFLOW_DIR = path.join(REPO_ROOT, ".github", "workflows");

const GENERATOR = "generate-provenance-index.mjs";
const INDEX = "provenance-index.generated.json";
const DATA_DIR_RE = /artifacts\/access-mi\/src\/data/;

/**
 * Datasets that carry provenance.ingested_at, read from the index itself so
 * this list can never drift from reality.
 */
const INDEX_PATH = path.join(here, "..", "src", "data", INDEX);
let INDEXED_DATASETS = [];
try {
  INDEXED_DATASETS = Object.keys(
    JSON.parse(readFileSync(INDEX_PATH, "utf8")).ingestedAt ?? {},
  );
} catch (err) {
  console.error(
    `[check-data-workflows] FAIL could not read ${INDEX}: ${err.message}. Run scripts/generate-provenance-index.mjs.`,
  );
  process.exit(1);
}
if (INDEXED_DATASETS.length === 0) {
  console.error(
    `[check-data-workflows] FAIL ${INDEX} lists no datasets - the parse is broken.`,
  );
  process.exit(1);
}

let failures = 0;
const fail = (msg) => {
  console.error(`[check-data-workflows] FAIL ${msg}`);
  failures++;
};

if (!existsSync(WORKFLOW_DIR)) {
  console.error(`[check-data-workflows] FAIL ${WORKFLOW_DIR} not found.`);
  process.exit(1);
}

const files = readdirSync(WORKFLOW_DIR).filter((f) => /\.ya?ml$/.test(f));
if (files.length === 0) {
  console.error("[check-data-workflows] FAIL no workflow files found.");
  process.exit(1);
}

let checked = 0;
for (const file of files) {
  const src = readFileSync(path.join(WORKFLOW_DIR, file), "utf8");

  // Only the `git add` lines matter - a workflow may mention src/data in a
  // comment or a diff-summary step without committing anything there.
  const staged = src
    .split("\n")
    .filter((l) => /git add/.test(l) || /^\s+artifacts\/access-mi\/src\/data/.test(l))
    .join("\n");

  if (!DATA_DIR_RE.test(staged)) continue;

  // Stages a dataset that is actually in the index, or stages the whole
  // src/data directory (which sweeps them all in).
  const stagesIndexedDataset =
    INDEXED_DATASETS.some((name) => staged.includes(name)) ||
    /git add\s+artifacts\/access-mi\/src\/data\s*$/m.test(staged);
  if (!stagesIndexedDataset) continue;

  checked++;
  const runsGenerator = src.includes(GENERATOR);
  const stagesIndex = staged.includes(INDEX) || /git add\s+artifacts\/access-mi\/src\/data\s*$/m.test(staged);

  if (!runsGenerator)
    fail(
      `${file} commits a generated dataset under src/data but never runs scripts/${GENERATOR}. The committed index would disagree with the dataset's provenance.ingested_at and check-data-freshness.mjs would fail on the next build.`,
    );
  else if (!stagesIndex)
    fail(
      `${file} runs ${GENERATOR} but does not stage ${INDEX}. Add it to the git add list (or stage the whole src/data directory).`,
    );
}

if (checked === 0)
  fail(
    "no workflow was found staging a generated dataset - either the workflows changed shape or this guard's detection is broken.",
  );

if (failures > 0) {
  console.error(`[check-data-workflows] ${failures} failure(s).`);
  process.exit(1);
}

console.log(
  `[check-data-workflows] ok - ${checked} data workflow(s) regenerate and commit ${INDEX} alongside the datasets they refresh.`,
);
