# mi-federal-data

Shared CDC PLACES ZCTA fetch/parse logic for Michigan, consumed by both
[accessmi.org](https://accessmi.org) and [ourintel.org](https://ourintel.org)
so the two projects share one canonical fetch, one canonical 40-measure
catalog, and one canonical set of sanity gates instead of independently
re-deriving (and drifting on) the same federal source.

This package is pure I/O-in/data-out. It does not write files and does not
know about either app's manifest/archival conventions or on-disk output
shape - each consumer wraps these functions with its own persistence and
its own output adapter.

## Consumers

- `artifacts/access-mi/scripts/refresh-cdc-places-zcta.mjs` (this repo)
- `scripts/ingest/cdc-places-zcta.js` in `saebchicago/ourintel`, Michigan-only
  path, installed as a git dependency:
  `"mi-federal-data": "git+https://github.com/saebchicago/michiganaccess.git#path:lib/mi-federal-data"`

## Usage

```js
import {
  MEASURES,
  fetchMetadata,
  fetchZctaRows,
  extractZctaRow,
  buildProvenance,
  runSanityGates,
} from "mi-federal-data";

const meta = await fetchMetadata();
const sourceRows = await fetchZctaRows(zctaList);
const rows = zctaList.map((z) => extractZctaRow(z, sourceRows.get(z)));
const gates = runSanityGates(rows, sourceRows); // throws on failure
const provenance = buildProvenance({
  meta,
  ingestedAt: new Date().toISOString(),
  rowCount: rows.length,
  suppressedCount: gates.suppressedCount,
  ingestScript: "scripts/ingest/cdc-places-zcta.js",
  registryLabel: "ourintel ZCTA crosswalk (FIPS 26)",
});
```

## Measure catalog

40 measures total. The first 17 are accessmi.org's original, already-proven
curated set (chronic outcomes, behavioral risk, preventive services,
mental/general status). The remaining 23 extend that set with the disability
measures and the SDOH module (food insecurity, housing insecurity, utility
shutoffs, transportation lacking, social isolation), plus a handful of
additional chronic/preventive/status measures. See `MEASURES` in
`src/cdcPlacesZcta.mjs` for the full catalog with `field` (CDC column
prefix), `id` (stable semantic id), `category`, and `label`.

## Updating

If CDC republishes this resource under a new dataset id, or adds/removes a
ZCTA-level measure, update `DATASET_ID` / `MEASURES` here once - both
consumers pick up the change on their next `npm install` / `pnpm install`.
