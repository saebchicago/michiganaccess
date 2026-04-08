# Placeholder Audit — accessmi.org
Generated: 2026-04-08 | Branch: chore/pre-demo-cleanup | Phase 0 — Discovery only. No files modified.

---

## P0 — DEMO_PATH (fix before Friday)
Pages on the demo path: `/`, `/find-care`, `/health-map`, `/data`, `/about`, `/environment`, `/civic-data`, and nav-linked pages.

| # | File:Line | Category | Exact text / code | Suggested fix | Route |
|---|-----------|----------|--------------------|---------------|-------|
| 1 | `src/pages/HealthMapPage.tsx:45` | Dead handler | `// TODO: implement map fly-to on location search` — `handleSearchLocation` callback is a no-op; ZIP search input + button visible in UI but do nothing | Implement fly-to or hide the search input entirely | `/health-map` |
| 2 | `src/components/findcare/InsuranceNavigator.tsx:357` | Content stub | `"📊 Coming soon"` label on "Upload EOB for Review" tile — fully rendered card with no action | Remove tile or replace with link to `/health/insurance-appeals` | `/find-care` |
| 3 | `src/pages/CivicDataHubPage.tsx:82` | Raw error text | `"Unable to load data: {error}. This dataset may use placeholder endpoints."` — phrase "placeholder endpoints" is user-visible | Replace "placeholder endpoints" with "temporarily unavailable"; remove developer-facing language | `/civic-data` |
| 4 | `src/components/home/FrontDoorTriage.tsx:181` | Illustrative disclaimer | `"Illustrative estimate based on USDA SNAP allotments, LIHEAP averages, CMS Medicaid per capita. Actual eligibility varies."` appears beneath large benefit dollar figure | Acceptable as labeled; consider moving disclaimer before the number or adding a `?` tooltip to reduce visual weight of the dollar figure | `/` |

---

## P1 — Visible, off demo path

| # | File:Line | Category | Exact text / code | Suggested fix | Route |
|---|-----------|----------|--------------------|---------------|-------|
| 5 | `src/pages/PressPage.tsx:104` | Disabled UI | Three `<Button disabled>` Download buttons (Platform Overview PDF, Brand Kit ZIP, Impact Data Sheet PDF) | Remove buttons or swap for real hosted files | `/press` |
| 6 | `src/pages/PressPage.tsx:112` | Placeholder text | `"Press kit files are being finalized. Contact us for early access."` | Remove note once files exist; or rewrite as "assets in preparation" | `/press` |
| 7 | `src/pages/InsuranceComparisonPage.tsx:8` | Full-page stub | `"Insurance comparison tool coming soon."` — entire page is a single line of text | Implement feature or redirect `/insurance-comparison` → `/health/insurance-appeals` | `/insurance-comparison` |
| 8 | `src/pages/TransportationPage.tsx:737–759` | Dead link + disabled button | `link: "#"` on "Report Missing Infrastructure" tile + `<Button disabled>Coming Soon</Button>` below it | Replace `href="#"` with `/feedback` and remove/enable the button | `/transportation` |
| 9 | `src/pages/DeepMapPage.tsx:177` | Dead handler | `onClick={() => { /* future: fly to ZIP */ }}` — ZIP search button renders but does nothing | Implement ZIP fly-to or remove the search bar | `/deep-map` |
| 10 | `src/pages/ComparePlacesPage.tsx:60,84` | Simulated data (no UI label) | `// Simulated community voice data (anonymized, illustrative)` and `// Simulated insurance breakdown (% of population)` — hardcoded data rendered in charts with no visible "illustrative" disclaimer | Add inline "Illustrative" badge to both chart sections | `/compare` |
| 11 | `src/pages/FollowMoneyPage.tsx:64` | Illustrative data | `"Source: Michigan MiTN 2024 — Illustrative aggregate. Full data at mitn.michigan.gov"` | Already labeled; acceptable. Consider linking directly to mitn.michigan.gov | `/transparency/money` |
| 12 | `src/pages/HealthSystemsPage.tsx:24,35,46,303` | Illustrative scenarios | Three case study titles prefixed `"Illustrative: ..."` + section header disclaimer: `"Illustrative scenarios showing potential integration approaches. These are hypothetical examples, not reports of actual partnerships or measured outcomes."` | Already labeled; no change needed unless customer-facing positioning changes | `/for-health-systems` |
| 13 | `src/pages/CaseStudiesPage.tsx:97,117` | Illustrative scenarios | `"Illustrative Scenarios — Not Measured Outcomes"` disclaimer + `"Illustrative"` badge on every card | Already labeled; acceptable | `/case-studies` |
| 14 | `src/pages/ImpactPage.tsx:177,180,196` | Illustrative scenarios | `"illustrative scenarios that demonstrate how…projected methodologies, not measured outcomes"` + DataClassification badge | Already labeled; acceptable | `/impact` |
| 15 | `src/pages/ExecutiveSummaryPage.tsx:124` | Platform capability disclaimer | `"Statistics below reflect platform capabilities and publicly sourced data points — not measured platform outcomes."` | Acceptable; soften "not measured" to "pre-outcome" if audience is press/partners | `/executive-summary` |
| 16 | `src/pages/DetectionGapPage.tsx:43–45,332,338,344,356,462–466` | Illustrative benchmarks | NACHC 2023 `(illustrative)`, AHIMA 2023 `(illustrative)`, RWJF 2022 `(illustrative)` footnotes throughout the funnel calculator; dollar calculation disclaimer: `"All dollar calculations are illustrative estimates"` | Already labeled consistently; acceptable | `/detection-gap` |
| 17 | `src/pages/EnergyDeepDivePage.tsx:109` | Illustrative chart | `"Illustrative — based on ACEEE LEAD Tool county-level estimates"` below chart | Already labeled; acceptable | `/environment/energy` |
| 18 | `src/pages/ZipScorecardPage.tsx:636,965,1238` | Illustrative composite | `"USASpending.gov FY2024 — Illustrative composite"` for federal dependency score; `"(Illustrative composite)"` in scorecard label; `"This is an illustrative index, not a clinical or policy assessment."` in methodology | Already labeled; acceptable | `/zip/:zip` |
| 19 | `src/pages/PartnersPage.tsx:24–38` | Illustrative scenarios | `ILLUSTRATIVE_SCENARIOS` array: 3 entries each with `outcome: "Illustrative — not a real person or observed outcome."` | Already clearly labeled; acceptable | `/partners` |
| 20 | `src/components/brief/UtilityStressSection.tsx:52` | Content stub | `"Example only — utility stress data integration coming soon"` Badge rendered when `isExample` is true (most counties) | Integrate real MPSC data or suppress section from BriefPage until data is available | `/brief/:county` |
| 21 | `src/pages/CompareZipsPage.tsx:519` | Feature stub | `"CSV and JSON exports coming soon. Markdown and citation copy work now with county-level data."` | Remove mention or implement CSV/JSON export | `/compare-zips` |
| 22 | `src/components/learn/DrugPriceLookup.tsx:37–39` | Illustrative pricing | `NADAC_TIERS` comment: `(CMS national average drug acquisition costs, illustrative)` — hardcoded lookup table rendered as drug price estimates | Add visible "illustrative" label in UI near price output; or pull from real NADAC API | varies |
| 23 | `src/components/place/CommunitySummary.tsx:106` | Content stub | `"Trend data coming soon"` — static string in trend indicator row | Remove row or implement trend pull from existing data | `/place/:county` |
| 24 | `src/pages/ZipPlacePage.tsx:71` | Data gap notice | `"Census ZCTA-level data for this metric is not yet published. County and state averages may still be available on the county profile page."` | Acceptable — legit data availability note; no change needed | `/zip-place/:zip` |

---

## P2 — Dev artifacts / benign empty states

| # | File:Line | Category | Exact text / code | Notes |
|---|-----------|----------|--------------------|-------|
| 25 | `src/pages/ZipFinderPage.tsx:35` | Code stub | `getter: () => null, // CDC PLACES is async — not available statically; we use quickstats proxy` | Not user-visible; metric row just shows `—`; fine as-is |
| 26 | `src/pages/MethodologyPage.tsx:789` | Future feature note | `"This feature is not yet implemented. When it is, we will document its privacy architecture…"` | On `/methodology` (informational page); low priority |
| 27 | `src/pages/CountyPage.tsx:324` | Appropriate empty state | `"Uninsured trend data is not yet available for this county."` | Correct data-availability message; keep |
| 28 | `src/pages/BriefPage.tsx:359,400` | Appropriate empty states | `"Headline metrics are not yet available for this county."` / `"Profile data is not yet available for {county} County."` | Correct; keep |
| 29 | `src/components/pillars/PillarInsightCard.tsx:90` | Appropriate empty state | `DataUnavailable` component with `"dataset registered but ingestion pending"` | Correct; keep |
| 30 | `src/components/pillars/DatasetExplorer.tsx:99–101` | Appropriate empty state | `"This dataset is registered but has not yet been ingested. No data to display."` | Correct; keep |
| 31 | `src/pages/PlaceholderPages.tsx:23,29–63` | Unused stubs | `PlaceholderPage` component + 9 exports (Conditions, Resources, News, Costs, Wellness, ClinicalTrials, Support, Learn, HealthData) with `"Coming soon — this section is under development"` | None are referenced by `routes.ts`; file appears to be an inert leftover. Safe to delete if confirmed unused. |
| 32 | `src/pages/ImpactDashboardPage.tsx:17–23` | Hardcoded metrics | `STATS` array: 83 counties, 15 000+ records, 35+ sources, 4 languages, $0 cost — rendered with animated counters | Factually accurate; no "illustrative" issue; acceptable |
| 33 | `src/pages/ContactPage.tsx:41`, `FeedbackPage.tsx:105`, `PartnershipPage.tsx:53`, `NotFound.tsx:18` | Dev artifact | `console.error(...)` in catch blocks and 404 handler | Appropriate error logging; acceptable in production |
| 34 | `src/components/home/CivicIntelligenceHub.test.tsx:45` | Dev artifact | `// TODO: This test reliably times out…` | Test file only; not production |

---

## Summary counts

| Priority | Count | Action |
|----------|-------|--------|
| **P0** (fix before Friday) | 4 | Items 1–4 above |
| **P1** (visible, off path) | 20 | Items 5–24 above |
| **P2** (dev artifacts / acceptable empty states) | 10 | Items 25–34 above |
| **Total** | **34** | |

---

## Out-of-scope (not audited per task brief)
- `supabase/` edge functions
- `src/test/` and `src/utils/data-ingestion/` (seed scripts) — `console.log` present throughout but not production UI
- shadcn/ui base components (`src/components/ui/`) — `disabled:cursor-not-allowed` and `disabled:opacity-50` are design-system defaults, not stubs
- `src/config/routes.ts` route definitions themselves
- `county/wayne`, `county/oakland`, `RegionComparePage`, `HealthSystemsPage` form (already has real supabase submit)
