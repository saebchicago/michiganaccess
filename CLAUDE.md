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
- `src/data/sourcesRegistry.ts` - source-org registry
- `src/data/sourceManifest.ts` - numeric claim anchor manifest
- `src/config/platformConstants.ts` - SSOT for site-wide factual figures
- `scripts/build-facility-dataset.mjs` - data ingestion script
- `scripts/refresh-county-population.mjs` - data ingestion script
- Any `scripts/check-*.mjs` - data-integrity guard scripts

### No fabricated or unlabeled data
Every rendered number needs a named source. Modeled/estimated values use the
IntegrityBadge component with VERIFIED / MODELED / PROJECTED / PENDING label.

### No em dashes
Replace `—` with `-` or spaced en dash ` - ` in all files you touch.

## CI
`.github/workflows/ci.yml` runs typecheck + vitest + a11y gate on every push and PR.
`.github/workflows/facility-refresh.yml` runs the facility data refresh (schedule + dispatch).
`.github/workflows/build-data.yml` runs the open-data rebuild (schedule + dispatch).
