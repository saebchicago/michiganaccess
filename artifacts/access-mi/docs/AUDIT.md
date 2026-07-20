# E2E UI/UX, Data, SEO & Accessibility Audit

**Date:** 2026-07-20
**Scope:** Full-site audit and fix pass covering SEO correctness, WCAG 2.2 AA
accessibility, UI/layout consistency, and data completeness, per the
routes: `/`, `/data`, `/compare`, `/data-explorer`, `/disaster-history`,
`/equity`, `/health-equity-atlas`, `/energy-burden`, `/zip/48201`,
`/domain-dashboard`, `/detection-gap`, `/public-investment`,
`/methodology`, `/officials`, `/transparency`.

## Phase 0 - framework and rendering mode

- **Stack:** Vite + React 18 + TypeScript + Tailwind + shadcn/ui (Radix
  primitives) + `react-router-dom` v7, client-side only (`BrowserRouter`,
  `src/App.tsx`). There is no SSR/SSG framework (no Next.js/Remix/Astro).
- **Crawler support is a build-time patch, not real SSR.**
  `scripts/prerender-meta.mjs` runs after `vite build` and, for each of the
  routes listed in `src/config/routeMeta.ts`, copies `dist/index.html` to
  `dist/<route>/index.html` and rewrites `<title>`, `<meta
  name="description">`, `<link rel="canonical">`, OG/Twitter tags, and
  injects a `<noscript>` block with a route-specific `<h1>` + summary. This
  covers 37 static routes (was 29 before this pass - see Phase 1). Dynamic
  routes (`/county/:slug`, `/zip/:zipcode`, everything else) fall through to
  the plain SPA shell for a non-JS crawler.
- **Runtime metadata:** `src/hooks/usePageMeta.ts`, called per-page in a
  `useEffect`, keeps `document.title`/description/canonical/OG/Twitter/
  JSON-LD in sync after hydration and on every client-side route change.
  This hook had the root cause of the reported metadata-desync bug - see
  Phase 1.
- Both mechanisms read from the same route metadata where they overlap, but
  `routeMeta.ts` (build-time) and each page's own `usePageMeta()` call
  (runtime) are maintained independently and can drift - see the canonical
  trailing-slash finding below.

## Phase 1 - SEO correctness (fixed)

1. **Metadata desync ("/data serves /disaster-history's description"),
   confirmed and fixed.** `usePageMeta`'s unmount cleanup only reset
   `document.title`; it never reset `description`/`canonical`/`og:*`/
   `twitter:*`. Any route whose page component omitted `description` or
   `path` - or never called the hook at all - silently inherited whatever
   the previous route had written. The specific reported case:
   `HealthDataDashboardPage.tsx` (route `/data`) never called `usePageMeta`
   at all. Fixed in `src/hooks/usePageMeta.ts` (cleanup now resets every
   tag it can touch back to the site default) and by adding a correct
   `usePageMeta` call to `HealthDataDashboardPage.tsx` and every other page
   found missing one:
   - `DomainDashboard.tsx` (serves `/domain-dashboard`, `/health`,
     `/housing`, `/food-security` - title/description are now derived per
     route from `location.pathname`).
   - 7 pages built on a **dead prop pattern**: `<Layout title="..."
     description="...">`, where `Layout.tsx`'s `LayoutProps` declared
     `title`/`description` but the component never consumed them - a
     complete no-op. Fixed: `Elections.tsx`, `Officials.tsx`,
     `ProviderData.tsx`, `DisabilityAccess.tsx`, `PublicSafety.tsx`,
     `SocialServices.tsx`, `TransparencyPage.tsx`.
   - `HealthNewsPage.tsx`, `CommunityEventsPage.tsx`, `PartnershipPage.tsx`
     - had `<Layout>` but no `usePageMeta` call.
   - `SiteReportPage.tsx` - print-only report, intentionally has no
     `<Layout>`; added `usePageMeta` with `noindex: true`.
   - `NotFound.tsx` - the 404 handler never set or reset any meta tag, so
     a 404 could display stale prior-route title/description to a
     JS-rendering crawler. Added `usePageMeta` with `noindex: true`.
   - `FoodAccessExplorerPage.tsx` (route `/food-access`) rendered a bare
     `<main>` instead of `<Layout>` - it shipped with **no CrisisBar,
     Header, Footer, or SkipToContent on this route**, and set
     `document.title` by hand with the wrong brand string ("AccessMI"
     instead of the `SITE_NAME` constant "Access Michigan"). Wrapped in the
     standard `<Layout>` and switched to `usePageMeta`.
   - `CivicAskPage.tsx` and `Index.tsx` (`/`) called `usePageMeta` without
     `path`, so their canonical/`og:url` never updated on navigation - added.

2. **Duplicate brand in titles ("X - Access Michigan - Access Michigan"),
   confirmed and fixed - systemic, 62 files.** `usePageMeta` appended
   `` `${title} - ${SITE_NAME}` `` unconditionally unless `title` was an
   *exact* match to `SITE_NAME`; it never checked whether the caller's
   title already ended in a brand suffix. 62 page components pass a title
   that already ends in `| Access Michigan` or `- Access Michigan`
   (`ComparePlacesPage.tsx:473`, `DataExplorerPage.tsx:72`,
   `EquityScorecardPage.tsx:242`, `DisasterHistoryPage.tsx:16`,
   `CountyPage.tsx:124`, and 57 more - full list in the commit history).
   **Fixed centrally**: extracted `buildPageTitle()` in
   `src/hooks/usePageMeta.ts`, which detects and strips a pre-existing
   `" | Access Michigan"`/`" - Access Michigan"` suffix before appending the
   brand once, standardized on the `" | Access Michigan"` separator. This
   fixes every one of the 62 call sites without touching each file
   individually, and is covered by
   `src/test/unit/page-meta.test.tsx`. **Follow-up (not done):** the 62
   source files still embed the now-redundant suffix in their own `title:`
   string. It's inert (rendered output is correct), but cleaning each
   file's title string to just the page-specific portion would remove dead
   weight from the source. Left for a follow-up pass - the fix here
   prioritized behavioral correctness over a 62-file cosmetic sweep.

3. **Canonical trailing-slash mismatch, confirmed and fixed.** The runtime
   hook normalized every non-root path to a trailing slash before writing
   the canonical/`og:url`; `scripts/prerender-meta.mjs`'s build-time
   canonical did not, so a crawler reading raw prerendered HTML saw
   `https://accessmi.org/methodology` while the post-hydration canonical
   read `https://accessmi.org/methodology/` - `sitemap.xml` matched the
   runtime (trailing-slash) form. Fixed `prerender-meta.mjs` to apply the
   identical normalization. Also fixed `index.html`'s own source
   inconsistency (`canonical` had no trailing slash, `og:url` did).

4. **Sitemap/prerender coverage gap, confirmed and fixed for the 8 audited
   routes.** `routeMeta.ts` (and therefore both the prerendered HTML shell
   and `sitemap.xml`) only covered 29 of the ~142 static routes declared in
   `src/config/routes.ts`. Of the 15 routes in this audit's scope, `/data`,
   `/compare`, `/health-equity-atlas`, and `/methodology` were covered;
   `/data-explorer`, `/equity`, `/energy-burden`, `/detection-gap`,
   `/public-investment`, `/officials`, `/transparency`, and
   `/domain-dashboard` were not. Added all 8 to `routeMeta.ts` and
   regenerated `public/sitemap.xml` (29 -> 37 static URLs, 203 total).
   **Not done:** the remaining ~105 static routes outside this audit's
   scope are still uncovered by prerendering/sitemap - a larger follow-up.

5. **Structured data (JSON-LD).** Site-wide `Organization` and `Dataset`
   (for the community-resources database) JSON-LD already exist in
   `index.html`. 29 individual pages pass their own `jsonLd` through
   `usePageMeta` (several already use `Dataset`/`DataCatalog` correctly:
   `SnapCoverageAtRiskPage.tsx`, `MedicaidCoverageAtRiskPage.tsx`,
   `PlacePage.tsx`, `DualEligibleExposurePage.tsx`,
   `DataAndInsightsPage.tsx`). **Not done in this pass:** none of the 8
   dashboards named in this audit (`/compare`, `/data-explorer`, `/equity`,
   `/health-equity-atlas`, `/energy-burden`, `/detection-gap`,
   `/public-investment`, plus `/data` itself) carry a per-dashboard
   `Dataset` schema citing source/license/last-updated, despite each
   surfacing a real sourced dataset and the pattern already existing
   elsewhere to copy. Flagged as a follow-up rather than added blind in
   this pass, given the volume of remaining Phase 2-4 work; the existing
   4 pages are the reference implementation to extend from.
- `robots.txt` already allows all crawlers with no disallow rules and
  declares the sitemap. No change needed.

## Phase 2 - Accessibility (WCAG 2.2 AA)

**Fixed:**
- Skip link + `<main id="main-content">` were already present, unconditional,
  and first in DOM order (`Layout.tsx`/`SkipToContent.tsx`) - no bug.
- **Heading hierarchy skips (h1 -> h3, no h2), confirmed on 7 of 9 sampled
  pages.** Root cause: shadcn's `CardTitle` (`src/components/ui/card.tsx`)
  hardcodes `<h3>` regardless of nesting, and most dashboards jump straight
  from the hero `<h1>` into a `CardTitle` grid. This is the same class of
  bug already caught and fixed once on `HealthConditionsPage.tsx` (see
  `/docs/a11y-baseline.md` at the repo root). Fixed by inserting a section
  `<h2>` (visible where the design already implies a section break,
  `sr-only` where it doesn't) ahead of the first `<h3>` on
  `ComparePlacesPage.tsx`, `EquityScorecardPage.tsx`, `EnergyBurdenPage.tsx`,
  `DetectionGapPage.tsx`, `PublicInvestmentPage.tsx`, `TransparencyHubPage.tsx`.
  **Not done:** `PublicOfficialsPage.tsx` (route `/transparency/officials`,
  outside this audit's 15-route scope) has the same issue and was not
  touched.
- **Unlabeled input on `/compare`, confirmed and fixed.**
  `ComparePlacesPage.tsx` had a bare ZIP-add `<Input>` with only a
  `placeholder`. Added `aria-label="Add a ZIP code to compare"`.
- **Chart accessibility - fixed for the one instance flagged by name
  ("chronic disease" / "Tract 1..25" chart), not fixed sitewide.**
  `TractHealthExplorer.tsx` (used on health/equity pages) labeled its
  census-tract bars with a fabricated `Tract 1`...`Tract 25` index instead
  of the real CDC PLACES tract GEOID it already had in hand - a direct
  violation of the "every number traces to a source" principle, not just
  an a11y issue. Fixed to derive the label from the real GEOID, added
  `role="img"` + a descriptive `aria-label` on the chart container, and a
  visually-hidden `<table>` fallback with the same GEOID/population/value
  data. **Not done:** the SNAP multi-variable charts
  (`src/components/charts/multivar/Snap{Bubble,Scatter,SmallMultiples,SortedBar}.tsx`,
  used on `/food-access`) and the `ComparePlacesPage` radar/bar charts have
  the same `role="img"`/`aria-label` gap - `ComparePlacesPage` at least
  duplicates its chart data in an accessible `<table>` already; the SNAP
  charts have no fallback at all. Flagged, not fixed - would need per-chart
  work beyond this pass's budget.
- **Data table semantics, fixed for the 4 tables checked.** Added
  `<caption>` and `<th scope="col">` to `SnapMichiganPage.tsx`,
  `SnapCoverageAtRiskPage.tsx`, both `ComparePlacesPage.tsx` tables
  (Detailed Comparison, Insurance Breakdown), and `CompareZipsPage.tsx`.
  None had table-level structure for assistive tech before this pass.
  **Not done:** `SnapMichiganPage.tsx` and `FoodAccessExplorerPage.tsx`
  still have no CSV/JSON download affordance (`CompareZipsPage.tsx` and
  `SnapCoverageAtRiskPage.tsx` already had one).

**Investigated, not fixed - real gaps, out of scope for this pass:**
- **`prefers-reduced-motion` is effectively not respected.** The global CSS
  media query only zeroes CSS `transition`/`animation` durations, which has
  no effect on Framer Motion (drives `opacity`/`transform` via JS-computed
  inline styles). Framer Motion is imported directly in 258 files. A
  reduced-motion-aware wrapper (`src/components/animations/civic-animations.tsx`,
  using Framer's own `useReducedMotion()`) exists but is used in exactly one
  file. Fixing this properly means auditing/wrapping motion usage broadly -
  too large and too easy to introduce visual regressions without a way to
  visually verify in this environment. Needs a dedicated pass.
- **Color contrast** - tokens for the crisis/red header, gold/star chips,
  and badges already carry code comments referencing prior "WCAG AA tuning"
  (`src/index.css:85-88`), but the referenced `A11Y_VIOLATIONS.md` doesn't
  exist in the repo (it's generated by
  `src/test/e2e/a11y-priority-routes.spec.ts`, which has never actually run
  - see below). No live contrast failure was confirmed or fixed in this
  pass; the Lighthouse CI job added below will catch real failures once it
  has run.
- **Automated a11y test coverage.** Of the 15 audited routes, only `/`
  had both a vitest-axe unit test and Playwright/axe-core e2e coverage
  before this pass; `/compare`, `/health-equity-atlas`, `/zip/:zipcode`,
  and `/methodology` had e2e-only coverage. The other 10 had none. Added
  all 10 to `src/test/e2e/a11y-priority-routes.spec.ts`'s route list.
  **Important caveat:** `@playwright/test` and `@axe-core/playwright` are
  imported by that spec but are **not present in `package.json` or
  `pnpm-lock.yaml`** - the spec has apparently never actually run. This
  environment's `pnpm install` fails partway through on an unrelated
  private-repo tarball fetch (`mi-federal-data`, 403 from the proxy), so a
  correct lockfile update (`pnpm add -D @playwright/test
  @axe-core/playwright`) could not be produced and verified here. Someone
  with a working `pnpm install` needs to add these two dependencies and
  commit the regenerated lockfile before `pnpm test:e2e` (or a CI job
  invoking it) will work at all.

## Phase 3 - UI/UX consistency & layout bugs

- **Duplicate floating Print/PDF button, confirmed and fixed.**
  `Layout.tsx` already renders one `<PrintButton />` globally on every
  page. 7 pages *also* rendered their own, stacking two identical buttons
  at the same `bottom-32 right-4` (mobile) / `bottom-16` (desktop)
  coordinate: `DisasterHistoryPage.tsx`, `ImpactDashboardPage.tsx`,
  `SBAInsightsPage.tsx`, `MarketIntelligencePage.tsx`,
  `EquityScorecardPage.tsx`, `EnergyBurdenPage.tsx`, `CHNAExplorerPage.tsx`.
  Removed the redundant per-page instance from all 7. The hypothesized
  "overlaps card content" framing wasn't the actual defect - it's a
  duplicate-render bug, not a positioning bug; the button's own coordinates
  already clear the mobile bottom nav (which also outranks it in z-index).
- **Stat-card grid clipping at ~918px - investigated, does not
  reproduce.** The "Most Affected County" grid
  (`DisasterHistoryDashboard.tsx`) uses a plain fluid Tailwind
  `grid-cols-2 md:grid-cols-3` with no hardcoded `min-width` or
  `grid-template-columns`. No stat-card grid anywhere in the codebase was
  found with a fixed-pixel min-width that would force overflow at that
  viewport. No code change made; the reviewers likely saw a different
  component or a stale bundle.
- **Missing Breadcrumbs, confirmed and fixed for 2 of 3.** Added
  `<Breadcrumbs>` to `HealthDataDashboardPage.tsx` (`/data`) and
  `DomainDashboard.tsx` (`/health`, `/housing`, `/food-security`,
  `/domain-dashboard`) - the top-level "Understand" landing pages that had
  none while sibling dashboards did. **Deliberately not fixed:**
  `HealthMapPage.tsx` (`/health-map`) uses a fixed
  `h-[calc(100vh-4rem)]` full-viewport map layout that assumes only the
  sticky header precedes it; inserting a breadcrumb row would push the map
  layout without a way to visually verify the result in this environment.
  Left as-is rather than risk a regression on a route not explicitly in
  the audit's "missing breadcrumbs" evidence.
- **Header/banner stacking - investigated, real but not changed.** Every
  page already stacks CrisisBar, Header, WeatherAlertBanner (conditional),
  OfflineAccessBanner (conditional), and ContextBar before content. The
  homepage additionally stacks UtilityRail, OutageAlertBanner (conditional),
  CountyWelcomeBanner (conditional), and Masthead before its hero - up to
  10 elements in the worst case. This is real density, not a bug; the prior
  H1/H2 pass (see `FIXLOG.md`) already removed the homepage's redundant
  inline crisis-line echo for exactly this reason. Further decluttering the
  homepage banner stack is a product/IA call, not a verifiable bug fix -
  left to the owner.
- **Perceived performance / skeleton delay on `/data-explorer` -
  investigated, does not reproduce.** The page's `<h1>` and intro paragraph
  render unconditionally at the top of the component tree; the only
  `Skeleton` in the file gates just the bar-chart body.

## Phase 4 - Data completeness & integrity

See `/artifacts/access-mi/docs/DATA-GAPS.md` (new) for the full
per-dashboard source/cadence/live-vs-hardcoded inventory. Summary of what
changed in this pass vs. what's flagged for the owner:

- **Fixed:** `TractHealthExplorer.tsx`'s fabricated `Tract 1`-`Tract 25`
  axis labels, replaced with the real CDC PLACES tract GEOID (see Phase 2).
- **Flagged, not changed - `closureWatchFallback.ts:244`.** Munson
  Healthcare Grayling Hospital's OB-service closure record has
  `closureDate: "2026-07-01"` (19 days in the past as of this audit) but
  `status: "verified"` and a stale `asOf: "2026-04-09"` - the record was
  never reconciled after its own target date passed, and
  `ClosureWatchPage.tsx` never compares `closureDate` to the current date to
  relabel a past-due projection. No fix applied: doing so would mean either
  asserting the closure actually happened (fabrication - no live source was
  checked) or changing the reconciliation logic without a real signal to
  drive it. Recorded in `DATA-GAPS.md` for the owner to resolve with a real
  source check.
- **Flagged, not changed - no unified per-dashboard provenance footer.**
  The only component matching the full "Source · License · Verified"
  pattern is `SourcesRegistry.tsx`, used in exactly one place
  (`/methodology`). Every other dashboard implements fragments of this ad
  hoc (some have a bare "Download CSV" button, most have neither a License
  nor a Last-updated line next to their source citation). Building a shared
  component and rolling it out to every dashboard is a real but sizable
  follow-up, out of scope for this pass; recorded in `DATA-GAPS.md`.
- No fabricated data was found or introduced. No generic future/stale-dated
  literals were found beyond the one Munson record above - other
  "2026-04..." / "2026-06..." dates found in `sources.ts`,
  `dataFreshness.ts`, `platformConstants.ts`, `UpdateLog.tsx`, and
  `CommunityProgramSpotlights.tsx` are legitimate curated
  verification-date metadata, not stale placeholders.

## CI additions

- `src/test/e2e/a11y-priority-routes.spec.ts`: extended the route list from
  10 to 20, covering all 15 routes named in this audit (see the caveat
  above - this spec cannot currently run; `@playwright/test` and
  `@axe-core/playwright` are missing from the lockfile).
- `src/test/unit/page-meta.test.tsx` (new): regression coverage for the
  exact metadata-desync bug, the duplicate-brand bug, and canonical
  trailing-slash normalization. Runs as part of `pnpm check:tests` /
  the existing "Unit tests" CI step - no new CI wiring needed.
- **Lighthouse CI** (new): `.lighthouserc.cjs` + a `lighthouse` job in
  `.github/workflows/ci.yml`. Builds the app and runs `lhci autorun`
  (via `pnpm dlx`, so it doesn't touch `package.json`/the lockfile)
  against 5 representative routes. **Deliberately non-blocking**
  (`continue-on-error: true`, and assertions set to `warn` not `error`) -
  this is the first Lighthouse run against this app in CI, so there's no
  verified baseline to gate on yet. Once the owner has reviewed a few runs'
  worth of scores, tighten the SEO/Accessibility assertions in
  `.lighthouserc.cjs` to `"error"` at the target thresholds (SEO >= 0.95,
  Accessibility >= 0.95) and drop `continue-on-error` from the CI job.
- **Not added:** a standalone "HTML metadata validator" crawling every
  prerendered route for title/description/canonical/h1-count/heading-order
  was not built as a separate tool. `page-meta.test.tsx` covers the runtime
  hook's correctness directly (the actual bug source); the existing
  `discoverability.test.ts` already validates `sitemap.xml` and the
  build-time JSON-LD injection. A full per-route dist/ HTML crawl covering
  duplicate-title/heading-order/canonical across all ~142 static routes
  (not just the 15 in this audit) would be a reasonable follow-up.

## Known limitations of this environment

- No `node_modules` / working `pnpm install` - `pnpm install
  --frozen-lockfile` fails partway through on a private-repo tarball fetch
  (`mi-federal-data`, proxy 403), consistent with the note in PR #168's
  description. `tsc`, `vitest`, and `playwright test` could not be run
  locally; every fix in this pass was verified by reading the affected
  code paths directly and running the pure-Node data-integrity guard
  scripts (`scripts/check-*.mjs`, `scripts/generate-sitemap.mjs`), all of
  which pass. CI (`tsc` + `vitest` + `test:a11y`) is the first real
  verification of the TypeScript/test-level changes in this PR.
- No browser available to visually verify layout changes (breadcrumb
  insertion, `sr-only` heading placement, chart wrapper). Changes were kept
  additive/non-destructive specifically to minimize visual-regression risk
  given this constraint; anything with meaningful visual-regression risk
  (e.g., `/health-map` breadcrumbs, the homepage banner stack) was
  deliberately left alone rather than guessed at.
