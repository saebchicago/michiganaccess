# Findings review: false zeros, conflicting numbers, dynamic-route metadata

Read-only audit of `artifacts/access-mi/`. No code changed.

## 1. Where a failed fetch renders as a real-looking zero

The census/CHNA layer is already correct and is the template to copy: `useCensusACS`
returns `source: "unavailable"` with a structured error, `getCensusValue` returns
`null` (never 0), and formatters render "N/A". `usePillarData` goes further with an
explicit `status: live | pending | error | empty`, and `useFooterStats` keeps the
resource count `null` until verified and hides the stat.

Everywhere below, a failure is swallowed and the UI prints a number that reads as fact.

Severity 1 - failure is indistinguishable from a genuine zero:

- `src/hooks/useEPAEcho.ts:31-58` - `if (!res.ok) return []` and `catch { return [] }`.
  The query function never throws, so `isError` is permanently false.
- `src/pages/AirQualityPage.tsx:62-67` - facility total, violations, TRI reporters and
  enforcement actions all `?? 0` on that fail-silent array. "0 violations" is shown when
  EPA ECHO is down.
- `src/pages/CountyPage.tsx:237-247` - same ECHO array feeding seven `?? 0` counters
  (RCRA, CWA, CAA, SDWA, violations). `echoLoading` exists; no error path.
- `src/pages/CHNAExplorerPage.tsx:150-151` - `obesityRate: ... ?? 0`. Worse than display:
  the zeros are then averaged into a statewide `MI_AVG`, so a missing county silently
  drags a published statewide figure down.
- `src/components/shared/BetaImpactCounter.tsx:33-45` - Supabase count queries return
  `count: null` on error, coerced to 0. The all-four-zero guard hides a total outage but
  not a partial one.
- `src/components/community/CommunityTrustWidget.tsx:44-55` - `catch { /* silent */ }`
  leaves `helpfulCount` at its initial 0 and clears the loading flag.
- `src/hooks/useEconomicData.ts:44-46` - returns a hardcoded fallback on `!res.ok` with no
  UI signal that the number is not live.

Severity 2 - fallback data is used but never labeled in the UI:

- `useDualEligibleExposure`, `useMedicaidCoverageAtRisk`, `useSnapCoverageAtRisk` fall back
  to a provenance-labeled static dataset (much safer), but only `console.warn` says so.
  The page renders it as if live.

Severity 3 - correct today, unprotected tomorrow:

- `src/pages/ComparePlacesPage.tsx:277` - `?? 0` on income, currently safe only because a
  `hasAcsData` gate runs first. No test protects that gate.

## 2. Same quantity, two sources, one page

- **Uninsured rate, two different surveys under one label.** The health-highlights grid on
  `CountyPage.tsx:404-443` renders the static SAHIE 2022 / County Health Rankings value from
  `src/data/michigan-county-profiles.ts`, while `UninsuredSparkline` at `CountyPage.tsx:553-563`
  renders ACS 5-year S2701 from `trendSeries.json`. For Saginaw that is 16.5% directly above
  4.1%. Same on `PlacePage` and `ZipPlacePage`, and the profile value also reaches
  `HealthAccessCards.tsx:82-84`.
- **Facility counts, static extract vs live table, same component.**
  `HealthAccessCards.tsx:135` headlines `COUNTY_FACILITY_COUNTS` from the static
  CMS/HRSA `verifiedHealthFacilities.json`, while the filter chip immediately above it
  (lines 120-176) counts live Supabase `facilities` rows from `useFacilities`. The comment at
  lines 130-134 acknowledges the divergence; only a generic disclosure banner softens it.
- **Population is in sync but only by luck.** `michigan-county-profiles.ts` and
  `trendSeries.json` both sit on Census PEP Vintage-2024 with no build-time equality check.
- **The enforcement pattern already exists.** `platformConstants.ts:16-47` asserts the source
  registry against an expected count and fails the build on drift; the resource-count collision
  was fixed the same way. Nothing equivalent guards county-level figures.
- `src/data/sourceManifest.ts` is documentation-only: 27 manual claims with no build assertion.

## 3. Dynamic route metadata, and what crawlers actually get

- `ROUTE_META` (`src/config/routeMeta.ts:40-379`) covers roughly 38 static paths.
  `scripts/prerender-meta.mjs:366-376` writes a real `dist/<path>/index.html` for each,
  with its own title, description, canonical and a noscript body.
- `/county/:slug` (`src/config/routes.ts:553`) is deliberately excluded, documented at
  `routeMeta.ts:18-20`, so it is absent from `ROUTE_META` and `PRERENDER_ROUTES`.
- But `public/sitemap.xml:42-124` advertises all 83 county URLs, plus 83 `/brief?county=`
  URLs. The sitemap promises pages that have no static HTML.
- **So no, a county page does not serve its own canonical in raw HTML.** With no
  `dist/county/wayne/index.html`, the catch-all at `netlify.toml:159-162` serves `dist/index.html` -
  which the prerender step rewrote with the homepage's title, description and
  `<link rel="canonical" href="https://accessmi.org/">`. A crawler at `/county/wayne` receives a
  document that self-canonicalizes to the homepage, i.e. it declares itself a duplicate of `/`.
- After hydration this is corrected: `CountyPage.tsx:124-141` calls `usePageMeta` with
  `path: /county/${slug}` plus JSON-LD, and `usePageMeta.ts:95-97` writes the self-referencing
  canonical. Googlebot renders JS and will usually see it; the AI and social crawlers listed in
  `robots.txt:16-36` generally do not, so for them the homepage canonical is the final signal.

## Proposed fix order, cheapest and highest impact first

1. **Prerender the 83 county routes.** Extend `prerender-meta.mjs` to generate per-county head
   metadata from the county registry, so each county URL ships its own title, description,
   canonical and noscript summary. Highest SEO impact, contained to one script, no UI risk.
   This also makes the sitemap honest.
2. **Stop ECHO from returning `[]` on failure.** Let the query function throw, then render an
   explicit unavailable state in `AirQualityPage` and `CountyPage` instead of `?? 0`. One hook,
   two consumers, removes the most visible false-zero surface.
3. **Fix the CHNA statewide average.** Exclude missing counties from `MI_AVG` rather than
   averaging in zeros, and label them PENDING. This one is a correctness bug in a published
   number, not just presentation.
4. **Resolve the uninsured-rate collision.** Pick one series as canonical for the county label
   (recommend keeping ACS S2701 for the sparkline and relabeling the highlights tile with its
   survey and vintage, or dropping the duplicate tile).
5. **Reconcile the facility counts.** Either drive both numbers from the same source or label
   each explicitly ("verified in CMS/HRSA extract" vs "in our database").
6. **Label fallback data.** Surface the static-fallback state from the dual-eligible, Medicaid
   and SNAP hooks in the UI instead of `console.warn`.
7. **Sweep the remaining silent zeros.** `BetaImpactCounter`, `CommunityTrustWidget`,
   `useEconomicData`, and the unguarded `?? 0` in `ComparePlacesPage`.
8. **Add build guards.** A population-parity check between `michigan-county-profiles.ts` and
   `trendSeries.json`, and a lint rule or guard script rejecting `?? 0` / `|| 0` on fetch results
   in `src/pages` and `src/components`, following the `platformConstants` precedent.

## Questions before I build anything

1. For the uninsured rate, which survey should own the county label - SAHIE (matches County
   Health Rankings, what partners cite) or ACS S2701 (matches the trend sparkline)?
2. For county prerendering: static head tags per county from the registry is cheap. Do you also
   want a real prerendered `<noscript>` data summary per county, which is heavier but makes the
   pages meaningful to non-JS crawlers?
3. When ECHO or another feed fails, should the affected card disappear, or render a labeled
   "temporarily unavailable" placeholder in place?
