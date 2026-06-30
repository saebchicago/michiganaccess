# Multi-Variable Dashboard Slice - Replication Note

This document records the pattern used by the Food Access Explorer
(`/food-access`) so the same upgrade can be repeated for additional
metric families. The goal of the slice is a polished multi-variable
view of one family with full provenance, granularity context, coverage
visibility, and benchmark math, while leaving the rest of the app
untouched.

Anchor PR: `feat/dashboard-multivar-slice` (squash-merged from the
branch of the same name). All file references below are paths under
`artifacts/access-mi/src/`.

## The five moving parts per family

Replicating the slice for a new metric family (FARS traffic safety,
Medicaid coverage at risk, ACS housing, etc.) means adding five things
in this order. Reuse the shared primitives - they are family-agnostic.

1. **Granularity registry** - one file per family declaring every
   metric's native resolution, primary provenance label, source, vintage,
   denominator, and one-line computation. Mirror
   `data/snapGranularityRegistry.ts`.

   The registry is the only place that maps family-specific data fields
   to renderable metrics. Every chart, panel, and benchmark reads metric
   definitions from here. `nativeResolution` must be confirmed against
   the source's own published metadata, never inferred; if the source
   does not state it, mark `UNVERIFIED` and exclude the metric from
   cross-variable plots.

2. **Coverage registry** - per-family sparse list of any (metric x
   geography) cell whose state is not "present". Mirror
   `data/snapCoverageRegistry.ts`. The four states are
   `present | suppressed | not-ingested | modeled-estimate`; the
   `CoverageStateBadge` primitive (already shared) renders each with a
   distinct visual.

   For families with real suppression (FARS suppresses Gogebic at <6
   events), populate the exceptions list. For families with full
   coverage (SNAP), leave it empty - the rest works automatically.

3. **Benchmark math** - one file per family in
   `utils/<family>/buildBenchmarks.ts`. Each tier (state / regional /
   national) returns a uniform `BenchmarkRecord` with value, label,
   sources, numerator, denominator, formula, and coverage state. Mirror
   `utils/foodAccess/buildBenchmarks.ts`.

   Rule: every benchmark is MODELED at minimum (the math is a model),
   propagated through `resolveCompositeLabel(..., { isAggregated: true })`.
   National figures live behind a `not-ingested` coverage state until
   the source figure is added to the repo with full citation - never
   fabricate a benchmark.

4. **Chart components** - per-family chart files in
   `components/charts/multivar/<Family>{SortedBar, Scatter, Bubble, SmallMultiples}.tsx`.
   Mirror `Snap*` files. Each is a thin shell over `recharts` that
   accepts metric definitions plus coverage / benchmark / region-color
   toggles. The data shape is built by a per-family `snapCountyValues`-
   shaped helper.

5. **Explorer shell** - one progressive-disclosure page mounting the
   four chart components. Mirror `FoodAccessExplorer.tsx` +
   `FoodAccessExplorerPage.tsx`. The shell is the only file that
   manages selection state, the only file that gates which chart type
   is reachable for which variable count, and the only file that owns
   the contextual reveal of advanced controls. Add a route entry to
   `config/routes.ts` (NOT `routeMeta.ts`).

## What is reusable (do not duplicate)

These primitives are family-agnostic and should be reused as-is:

- `utils/provenance/resolveCompositeLabel.ts` - weakest-link
  propagation and fitted/aggregated escalation.
- `components/shared/CoverageStateBadge.tsx` - the four-state
  coverage primitive.
- `components/shared/ProvenancePanel.tsx` - the collapsible per-chart
  methodology card.
- `components/shared/GeoResolutionBadge.tsx` - native-resolution chip.
- `components/shared/ProvenanceTag.tsx` - VERIFIED/MODELED/PROJECTED
  chip.
- `data/michigan-prosperity-regions.ts` - the 10-region partition used
  by any slice that wants a regional benchmark tier.

## Granularity gate, label propagation, benchmark math

Three rules carry across families:

1. **Granularity gate.** Two metrics with different `nativeResolution`
   may not share an axis without explicit aggregation. The shell uses
   `canShareAxis()` from the registry to filter "add variable" choices;
   for cross-family overlays (e.g. SNAP county + ACS tract), the
   aggregation step must be labeled MODELED and visible to the user.

2. **Label propagation.** All composite labels go through
   `resolveCompositeLabel`. Inputs include the primary label of each
   metric series; flags include `isFitted` (any trendline, correlation
   r) and `isAggregated` (any rollup across geographies). Both flags
   escalate VERIFIED to MODELED at minimum.

3. **Benchmark math is always shown.** Every benchmark row in the
   provenance panel displays its formula, denominator, source, and
   vintage. Population-weighted state and regional benchmarks are
   computed as `sum(numerator) / sum(denominator)` over the relevant
   counties, never as simple unweighted means. National figures are
   shown only when the data exists in the repo with full citation;
   otherwise the panel shows a `not-ingested` row pointing at the
   source URL.

## What this slice intentionally did NOT change

- `data/sourcesRegistry.ts`, `data/sourceManifest.ts`,
  `config/platformConstants.ts`, `config/routeMeta.ts` - sacrosanct
  per `CLAUDE.md`.
- `/public/` - untouched.
- `scripts/check-*.mjs` data-integrity guards - untouched.
- `data/michigan-regions.ts` - the existing 6-region AccessMI grouping
  is preserved. The new `data/michigan-prosperity-regions.ts` adds the
  10 official MEDC regions as a separate, sourced registry without
  colliding with the existing structure.

## Failure modes to watch for

- **Silent label upgrades.** If you add a derived chart element
  (trendline, correlation, rolling average) without routing the label
  through `resolveCompositeLabel({ isFitted: true })`, the chart will
  carry whatever label its inputs had, which is wrong. The label
  propagation utility has unit tests; the per-family chart components
  should pass labels through it explicitly.

- **Inferred resolution.** The granularity registry is the choke point;
  if a metric lands there with an inferred `nativeResolution` (rather
  than one quoted from the source's own metadata), the multi-variable
  view will silently mix resolutions. Use `UNVERIFIED` whenever in
  doubt - the registry's `canShareAxis` will then block crossings.

- **Fabricated benchmarks.** Skip a benchmark tier rather than invent
  a figure. The `not-ingested` coverage state is visible by design.
