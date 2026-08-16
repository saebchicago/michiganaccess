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
- `src/data/sourcesRegistry.ts` - data-FEED registry (49 feeds, 42 publishers)
- `src/data/dataCatalog.ts` - governed dataset catalog behind the data hub
- `src/data/dataFreshness.ts` - freshness registry; status is derived, not hand-set
- `src/data/sourceManifest.ts` - numeric claim anchor manifest
- `src/config/platformConstants.ts` - SSOT for site-wide factual figures
- `scripts/build-facility-dataset.mjs` - data ingestion script
- `scripts/refresh-county-population.mjs` - data ingestion script
- Any `scripts/check-*.mjs` - data-integrity guard scripts

### No fabricated or unlabeled data
Every rendered number needs a named source. Modeled/estimated values use the
IntegrityBadge component with VERIFIED / MODELED / PROJECTED / PENDING label.

### Feeds vs publishers - do not conflate
`SOURCES_TOTAL` / `DATA_SOURCE_COUNT` counts data FEEDS (49). Several
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
