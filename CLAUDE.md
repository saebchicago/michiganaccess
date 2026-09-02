# AccessMI - Claude Code Instructions

## Package manager
pnpm only. The root `package.json` preinstall hook rejects npm and yarn with `exit 1`.
Never run `npm install` in this repo. Use `pnpm install --frozen-lockfile`.

## App root
`artifacts/access-mi/` is the primary application. Most code edits live there.

## Key commands (run from `artifacts/access-mi/`)
- `pnpm check:tests` - vitest unit tests (must pass before any commit)
- `pnpm typecheck` - TypeScript type check
- `pnpm build` - full build with all data-integrity guards (slow; run before merging)
- `pnpm test:a11y` - vitest-axe a11y smoke tests (no dev server needed; runs in CI)

## Standing decisions (see FIXLOG.md for full rationale)

### Sacrosanct files - do not modify without explicit named exception
- `src/components/shared/QuickExitBar.tsx` - crisis DV safety affordance
- `src/components/shared/CrisisBar.tsx` - 988/211 crisis lines
- `src/data/verifiedHealthFacilities.json` - regenerate via script only
- `src/data/census-geographies.ts` - 83-county FIPS registry
- `src/data/sourcesRegistry.ts` - data-FEED registry (50 feeds, 42 publishers)
- `src/data/dataCatalog.ts` - governed dataset catalog behind the data hub
- `src/data/dataFreshness.ts` - freshness registry; status is derived, not hand-set
- `src/data/sourceManifest.ts` - numeric claim anchor manifest
- `src/config/platformConstants.ts` - SSOT for site-wide factual figures
- `scripts/build-facility-dataset.mjs` - data ingestion script
- `scripts/refresh-county-population.mjs` - data ingestion script
- Any `scripts/check-*.mjs` - data-integrity guard scripts

### Guards added by the 2026-08-16 audit
`check-data-catalog` (catalog/registry reconciliation), `check-data-freshness`
(derived freshness + provenance anchoring), `check-orphan-modules` (unreachable
source), `check-form-labels` (accessible names axe accepts but shouldn't),
`check-precache-budget` (post-build, service-worker weight), `check-data-workflows`
(data jobs must regenerate the provenance index), `check-backend-functions`
(every endpoint the app calls has deployable source). All are in `pnpm
build` and the blocking CI `Integrity guards` step.

### Guard added by the 2026-08-30 audit
`check-build-parity` - the repo has two build entry points and they had
diverged. `artifacts/access-mi`'s `build` runs the data generators before
`vite build`; the repo-root `build` (what `netlify.toml` invokes) did not,
so a generated dataset committed as a stub shipped empty and crashed every
county brief. Both now run the same generators, and the guard fails the
build if one gains a generator the other lacks.

### .migration-backup/ is load-bearing - do not delete
It holds the ONLY in-repo source for seven Supabase functions the app calls
(appeal-generator, civic-copilot, airnow-proxy, arcgis-proxy, cdc-proxy,
gtfs-rt-proxy, npi-proxy). They deploy to Supabase out-of-band, so the repo
is their only record. It is excluded from every other guard, so a routine
dead-code sweep will happily delete it - one nearly did. `check-backend-
functions.mjs` now fails the build if an endpoint the app calls has no source,
and `backend-function-allowlist.json` records why each exception exists.

### No fabricated or unlabeled data
Every rendered number needs a named source. Modeled/estimated values use the
IntegrityBadge component with VERIFIED / MODELED / PROJECTED / PENDING label.

### Feeds vs publishers - do not conflate
`SOURCES_TOTAL` / `DATA_SOURCE_COUNT` counts data FEEDS (50). Several
publishers ship more than one feed (CMS x3, FEMA x3, EPA/HUD/EGLE x2), so
the distinct-organization count is lower: `DATA_PUBLISHER_COUNT` (42).
Copy using the word "organizations" must render the publisher count -
`check-data-catalog.mjs` fails the build otherwise.

### One catalog, no page-local source lists
Datasets shown to users live in `src/data/dataCatalog.ts`, keyed to a feed
in `sourcesRegistry.ts`. Do not add a local array of sources to a page
component; the guard rejects it. Entries whose cadence or URL host differs
from their linked feed need a written `cadenceNote` / `urlNote`.

### No em dashes
Replace `—` with `-` or spaced en dash ` - ` in all files you touch.

## CI
`.github/workflows/ci.yml` runs typecheck + vitest + a11y gate on every push and PR.
`.github/workflows/facility-refresh.yml` runs the facility data refresh (schedule + dispatch).
`.github/workflows/build-data.yml` runs the open-data rebuild (schedule + dispatch).
