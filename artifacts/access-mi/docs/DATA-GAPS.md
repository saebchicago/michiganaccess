# Data Gaps

Per-dashboard inventory of source, refresh cadence, last-verified date, and
live-vs-hardcoded status. Companion to `/artifacts/access-mi/docs/AUDIT.md`
(Phase 4). This is a snapshot as of 2026-07-20 for the dashboards touched or
reviewed during the E2E audit pass - it is not a full inventory of every
dashboard on the platform. See `src/data/sourceManifest.ts` and
`src/data/sourcesRegistry.ts` for the platform's canonical, enforced source
registry (guarded by `scripts/check-provenance.mjs` and
`scripts/check-fabrication.mjs` - do not hand-edit those files without
running the guards).

## Confirmed live / correctly sourced

| Dashboard | Source API | Cadence | Live vs. hardcoded |
|---|---|---|---|
| `/data` (Health Data Dashboard) | Multiple (CDC PLACES, ALICE, insurance) via existing hooks | Varies by metric | Live |
| `/data-explorer` | Census ACS (50+ tables) | Annual (ACS vintage) | Live |
| `TractHealthExplorer` (used on health/equity surfaces) | CDC PLACES tract-level API (`data.cdc.gov/resource/cwsq-ngmh.json`) | Annual (PLACES release) | Live fetch, real tract GEOIDs (fixed in this pass - previously displayed a fabricated `Tract 1..25` index instead of the GEOID it already had) |
| `/food-access` (Food Access Explorer) | USDA SNAP + retailer access | Annual (FY vintage, see `check-snap-county-dataset.mjs`) | Live, VERIFIED-labeled |
| `/disaster-history` | OpenFEMA API, live | Real-time | Live |
| `SnapCoverageAtRiskPage` / `SnapMichiganPage` | USDA SNAP county enrollment | FY vintage | Live, has CSV export (Coverage-at-Risk page) |

## Flagged - needs owner attention

### 1. Munson Healthcare Grayling closure record is past-due and unreconciled

`src/data/closureWatchFallback.ts:244` -

```
closureDate: "2026-07-01",  // projected - summer 2026 per Munson announcement
status: "verified",
asOf: "2026-04-09",
```

As of this audit (2026-07-20), `closureDate` is 19 days in the past, but
`status` still reads `"verified"` (not confirmed-closed or re-verified) and
`asOf` hasn't moved since April. `ClosureWatchPage.tsx` never compares
`closureDate` against the current date, so the UI keeps presenting this as
a forward-looking projection past its own target date.

**Not fixed in this pass.** Fixing the *display* logic without a fresh
source check would either (a) silently relabel it as "closed" without
verification - fabrication - or (b) add a generic "past target date,
unconfirmed" caveat that doesn't actually tell the reader whether the
closure happened. **Needs:** a real check against Munson's public
announcements or a follow-up local news/state source, then either update
`status`/`asOf` with a citation, or - if unconfirmed - add an explicit
"past projected date, not yet reconciled" state to `ClosureWatchPage.tsx`.

### 2. No unified per-dashboard provenance footer

The task's target pattern - a visible "Source · License · Last updated ·
Download (CSV/JSON)" block on every dashboard - only fully exists in one
place: `SourcesRegistry.tsx`, rendered exclusively on `/methodology`. Other
dashboards implement fragments of it inconsistently:

| Dashboard | Source citation | License | Last updated | CSV/JSON download |
|---|---|---|---|---|
| `SnapMichiganPage` (`/data/snap-michigan`) | Yes (inline) | No | No | No |
| `SnapCoverageAtRiskPage` | Yes (inline) | No | No | Yes (CSV) |
| `FoodAccessExplorerPage` (`/food-access`) | Yes (VERIFIED badges) | No | No | No |
| `CompareZipsPage` | Partial | No | No | Yes (CSV + JSON) |
| `ComparePlacesPage` (`/compare`) | Partial | No | No | PDF/print only |
| `DisasterHistoryPage`, `EnergyBurdenPage`, `EquityScorecardPage`, `DetectionGapPage`, `PublicInvestmentPage` | Inline text, no dedicated footer block | No | No | No |

**Not built in this pass** - a shared `ProvenanceFooter` component and a
rollout to every dashboard is a real, sizable piece of work (would touch
10+ pages) that didn't fit alongside the SEO/a11y/UI fixes already in this
PR. The `Dataset` JSON-LD pattern already used correctly on
`SnapCoverageAtRiskPage.tsx`, `MedicaidCoverageAtRiskPage.tsx`,
`PlacePage.tsx`, and `DualEligibleExposurePage.tsx` is the right reference
implementation to extend both the JSON-LD *and* the visible footer from.

### 3. Candidate gap-closing datasets (flagged, not built)

Per the task brief, these are surfaced for a maintainer decision, not
started:

- **Housing/eviction data** - `HousingOptionsPage.tsx` currently covers HUD
  fair market rents and Point-in-Time homelessness counts; there's no
  eviction-filing dataset (e.g., Eviction Lab) integrated.
- **Water quality / PFAS** - `WaterSafetyPage.tsx` and `EnvironmentPage.tsx`
  cover EGLE/EPA infrastructure and PFAS site data already; a dedicated
  SDWIS violations feed is tracked as a feasibility question in
  `docs/sdwis-feasibility.md` (already exists - not part of this pass).
- **Air quality** - no dedicated AQI/EPA AirNow integration found.
- **Broadband access** - `CivicDataPage.tsx`/`CivicDataHubPage.tsx` already
  integrate ACS broadband availability; no gap identified here.
- **Jail/justice data** - `PublicSafetyPage.tsx` links out to policing
  transparency resources but has no ingested jail-population or
  sentencing dataset.

## What did NOT change in this pass

No `src/data/*.json`/`*.ts` dataset files were edited except the display
logic in `TractHealthExplorer.tsx` (label derivation, not the underlying
data). No sacrosanct files (`verifiedHealthFacilities.json`,
`census-geographies.ts`, `sourcesRegistry.ts`, `sourceManifest.ts`,
`platformConstants.ts`, `build-facility-dataset.mjs`,
`refresh-county-population.mjs`, any `check-*.mjs`) were touched. All
`scripts/check-*.mjs` guards pass against the current working tree.
