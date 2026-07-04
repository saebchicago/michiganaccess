# AccessMI FIXLOG

## Standing decisions (ratified audit/claims-vs-code, 2026-06-11)

### a. Sacrosanct files

Files in these categories are protected from modification by any sprint unless the
sprint prompt names the file explicitly as a named exception.

| File / pattern | Category | Reason |
|---|---|---|
| `src/components/shared/QuickExitBar.tsx` | Crisis affordance | DV/trauma safety exit; behavior changes could endanger users |
| `src/components/shared/CrisisBar.tsx` | Crisis affordance | 988 / 211 / Quick Exit; any copy or behavior change requires explicit exception |
| `src/data/verifiedHealthFacilities.json` | Source data | CMS+HRSA statewide facility dataset; regenerate via script only |
| `src/data/census-geographies.ts` | Source data | 83-county FIPS registry; authoritative for all county lookups |
| `src/data/sourcesRegistry.ts` | Source data | Platform source-org registry; build asserts against it |
| `src/data/sourceManifest.ts` | Source data | Numeric claim anchor manifest |
| `src/config/platformConstants.ts` | Source data | SSOT for all site-wide factual figures; build-asserted |
| `scripts/build-facility-dataset.mjs` | Ingestion script | Regenerates verifiedHealthFacilities; no hand edits |
| `scripts/refresh-county-population.mjs` | Ingestion script | Regenerates county population values; no hand edits |
| Any file in `scripts/check-*.mjs` | Guard script | Data-integrity guards wired into build; change only to tighten, never to loosen |

### b. Post-merge review model

Identical to prior sprints:

1. Agent captures screenshots (1280 + 375px) of changed copy surfaces to
   `/tmp/review-shots-<branch>/` before pushing.
2. Branch merges autonomously once all gates are green (typecheck + vitest + build).
3. Saeb reviews production async after deploy.
4. Defects fixed on a dedicated fix branch.
5. Two consecutive reverts from the same sprint reinstate the pre-merge gate
   (sprint must gain explicit approval before future autonomous merges).

### c. No fabricated or unlabeled data

- Every rendered number must carry a named source and vintage.
- Modeled or estimated values are labeled with the integrity pill (VERIFIED /
  MODELED / PROJECTED / PENDING).
- No em dashes (—) in code or copy; use hyphens or spaced en dashes.

---

## Phase 0 discovery (2026-06-11)

### Stack

| Concern | Value |
|---|---|
| Framework | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| Package manager | npm |
| Routing | React Router v7 + Wouter (mixed) |
| State | Zustand 5 |
| Data fetching | TanStack React Query |
| AI chat backend | Mistral AI via `/.netlify/functions/chat-mistral` |
| AI appeal backend | Mistral / `${SUPABASE_URL}/functions/v1/appeal-generator` |
| Real-time AQI proxy | `${SUPABASE_URL}/functions/v1/airnow-proxy` |
| Deploy host | Netlify (`netlify.toml` at repo root) |

### Build command

```
npm run build
```
Runs: generate-sitemap → check-links → check-counts → check-zip-population →
check-county-facilities → check-trend-series → check-chna-mapping → vite build →
prerender-meta

Build-time assertions: `platformConstants.ts` throws if SOURCES_TOTAL ≠ 41 or
breakdown drifts; `check-chna-mapping.mjs` validates CHNA gap mapping integrity.

### Test runner

Vitest v3.2.4. Live run (2026-06-11):
- Test files: 33 run (2 failing pre-existing — `localStorage.clear()` in
  `DomainDashboard.test.tsx` and `CivicIntelligenceHub.test.tsx`)
- Tests: 541 total — **537 passing**, 3 failing, 1 skipped

Pre-existing failures are unrelated to this sprint.

### Page inventory

~130 page files in `src/pages/`. Audited pages for this sprint:
`Index.tsx`, `AboutPage.tsx`, `PrivacyPage.tsx`, `DataSourcesPage.tsx`,
`MethodologyPage.tsx` (+ `src/pages/methodology/` directory).
Components in scope: every component rendered on audited pages.

### Reviewer-premise reconciliation

External AI reviews (Comet, Gemini) made the following site-state claims.
Verdict from code:

| Reviewer claim | Code verdict | Evidence |
|---|---|---|
| "41 public data sources" | CONFIRMED | `platformConstants.ts:27` build-asserts `SOURCES_TOTAL === 41` |
| "Ask Access Michigan conversational agent" | CONFIRMED | `AccessChat.tsx:245` renders `CardTitle` "Ask Access Michigan"; calls `/.netlify/functions/chat-mistral` |
| "verified low latency" / "Sub-3-second loads on 3G" | STALE / REMEDIATED | `MethodologyPage.tsx` trust log records prior false claim replaced Mar 2026 |
| "automated weekly pulls" | STALE / REMEDIATED | Same trust log entry; no automated pull scheduler in code |
| "zero-cookie architecture" | CONFIRMED with caveat | GA removed per `index.html:4-13`; no ad/tracking scripts; `localStorage` used but disclosed in `PrivacyPage.tsx:107` |
| CMS data layer | CONFIRMED | `verifiedHealthFacilities.json` CMS Hospital General Information source |
| HRSA data layer | CONFIRMED | `verifiedHealthFacilities.json` HRSA Health Center Sites source |
| CDC PLACES data layer | CONFIRMED | `sourcesRegistry.ts:29`, `dataFreshness.ts:56` |
| EPA EJScreen data layer | PARTIAL | `ejscreen.ts` has ~15 ZCTAs; not statewide-comprehensive; labeled as sparse in `data_year: 2023` entries |

Zero reviewer premises imported as fact before code verification.

---

## Findings applied in this sprint

### F-1: PrivacyPage PHI/client-side false claim (FIXED, Phase 2)

**Claim:** `PrivacyPage.tsx:67` — "Health-related tools (AI appeals generator, benefits wizard,
symptom information) process data **client-side**. We do not **store, transmit**, or retain
any health information you enter."

**Evidence of falsity:** `AIAppealGenerator.tsx:65` fetches
`${supabaseUrl}/functions/v1/appeal-generator` — a server-side Supabase Edge Function.
Data IS transmitted to a server. "client-side" is false; "do not transmit" is false.

**Fix:** Replaced with "are processed via secure server functions that do not store
your inputs after the response is returned."

**Category:** PRIVACY

---

### F-2: QuickExitBar ESC key false claim (LOGGED, fix blocked by sacrosanct rule)

**Claim:** `QuickExitBar.tsx:31` aria-label — "Quick exit - leave this site immediately
**(also press Escape)**"; `QuickExitBar.tsx:32` title — "**Press ESC to quickly leave
this page**"; `QuickExitBar.tsx:36-40` — `<kbd>ESC</kbd>` visual hint and "Press ESC
to quickly leave this page" span rendered in the UI.

**Evidence of falsity:** `QuickExitBar.tsx:19` comment — "Quick Exit is button-only -
Escape key closes modals/dropdowns, not Quick Exit." No `keydown` / `useEffect`
Escape handler in the component. ESC does NOT trigger Quick Exit.

**Fix blocked:** `QuickExitBar.tsx` is a sacrosanct crisis affordance. Correcting
the false ESC copy requires an explicit named exception in a future sprint prompt.

**Category:** PRIVACY (safety-critical false affordance)

---

## Future work (not in scope of this sprint)

- EJScreen sparse coverage: `ejscreen.ts` has only ~15 ZCTAs. If EJScreen is
  claimed as a statewide layer, coverage should be expanded or the disclaimer
  clarified. Requires data-ingestion work.
- CHNA chnaSeed.ts D5 audit: 35 metrics labeled VERIFIED but sourced from HFH 2022
  CHNA document (secondary source). Relabeling to MODELED deferred to a named
  Phase 4 of the CHNA gap analysis sprint.
- AI privacy claims (no conversation logging, no PHI storage after response): these
  are server-side behavioral claims that cannot be verified from client code alone.
  Verification requires Supabase/Netlify function review.

---

## Dependency security remediation (2026-06-18)

Resolved the advisories reported by `pnpm audit` that reach a deployed or
test/codegen surface. Fixes are pinned as `overrides` in `pnpm-workspace.yaml`
(canonical, used by CI `pnpm install --frozen-lockfile`) and mirrored into the
root `package.json` `overrides` block for the bun lockfile.

| Package | Was | Now | Advisory | Surface |
|---|---|---|---|---|
| `dompurify` (via `jspdf`) | 3.4.3 | >=3.4.11 | GHSA-76mc-f452-cxcm + related XSS | access-mi PDF export (production) |
| `qs` (via `express` 5) | 6.15.1 | >=6.15.2 | GHSA-q8mj-m7cp-5q26 (stringify DoS) | api-server (production) |
| `vite` (catalog) | ^7.3.2 (7.3.3) | ^7.3.5 | `server.fs.deny` bypass + launch-editor NTLM leak | access-mi dev server |
| `ws` (jsdom, @mistralai SDK, expo) | 8.20.1 / 7.5.10 / 6.2.3 | 8.21.0 / 7.5.11 / 6.2.4 | GHSA-96hv-2xvq-fx4p (memory DoS) | test env + access-mi + mobile toolchain |
| `markdown-it` (via `orval`>`typedoc`) | <14.2.0 | >=14.2.0 | quadratic-complexity DoS | lib/api-spec codegen (dev) |

The `ws` override uses same-major version-range selectors with EXACT-version
replacements (`ws@>=8.0.0 <8.21.0` -> `8.21.0`, `ws@>=7.0.0 <7.5.11` -> `7.5.11`,
`ws@>=6.0.0 <6.2.4` -> `6.2.4`) so each consumer keeps an API-compatible patch
release. An open-ended `>=x` replacement would let pnpm collapse the
expo/react-native ws@6/7 consumers up to ws@8 and risk breaking the mobile
toolchain, so exact pins are required. Result: all `high`-severity findings
cleared; production web app, the express runtime, the vitest environment, and
the api-spec codegen are clean.

Verified after the bumps: `pnpm install --frozen-lockfile` (CI parity),
`pnpm typecheck` (workspace), `pnpm check:tests` (674 passed), api-server
`pnpm build`, and the full access-mi `pnpm build` with all data-integrity guards.

### Deferred (dev-only, non-deployed)

The remaining `pnpm audit` findings are all inside the `access-mi-mobile` Expo
toolchain (`@babel/core`, and `@expo/cli`'s transitive `postcss` / `js-yaml` /
`uuid` / `tar`) and `api-server`'s build-time `esbuild` (pinned at 0.27.3 by a
deliberate workspace override). Each needs a major-version bump of an
expo-/build-pinned transitive dependency that would risk breaking those
toolchains; none reach the deployed web bundle or the running server, so they
are tracked here rather than force-overridden.

---

## CHNA Explorer "County Compare" tab: real-data rebuild (2026-07-04)

`CHNAExplorerPage.tsx`'s County Compare tab carried a hardcoded 12-county
array (`COUNTIES`) attributed to a blanket source comment ("CDC SVI 2022,
County Health Rankings 2025, CMS Hospital Compare, HRSA HPSA, CDC PLACES and
BRFSS, MDHHS"). An audit for this fix found:

- 5 of 14 fields (health rank #1-83, SVI score, life expectancy, depression
  rate, child poverty rate) have **no real source anywhere in the codebase**,
  for any county. A second, independent, unsourced 13-county dataset
  (`michigan-intelligence.ts`'s `COUNTY_INTELLIGENCE_KPIS`) carries different
  life-expectancy/insurance numbers for the same counties, confirming both
  were invented rather than transcribed from a real release.
- The `facilities` field used numbers (e.g. Wayne=347) inconsistent with the
  app's own real facility dataset (`verifiedHealthFacilities.ts`, statewide
  total 589) by roughly an order of magnitude.
- `energyBurden` has real data (ACEEE LEAD Tool 2023) for only 7 of 83
  counties.

Fix: rebuilt the tab on `COUNTIES: CountyCompareRecord[]`, computed at module
load from real, already-ingested all-83-county sources - `COUNTY_PROFILES`
(Census PEP Vintage 2024 / County Health Rankings 2025) for population,
insured rate, and PCP ratio; `cdc-places-county.ts` (CDC PLACES 2025,
MODELED) for obesity and diabetes; `verifiedHealthFacilities.ts` (CMS +
HRSA) for facility counts. The 5 unbackable fields were dropped rather than
shown with invented numbers or a fabricated "no data" placeholder for a
metric that was never real to begin with. `energyBurden` was dropped from
this tab (real for only 7/83 counties - not enough for an 83-county
comparison table). `MI_AVG` is now a real unweighted mean over all 83
counties instead of hand-typed constants.

**Follow-up not addressed here:** `michigan-intelligence.ts`'s
`COUNTY_INTELLIGENCE_KPIS` (life expectancy, insurance rate, and others for
13 counties) appears to be a second instance of the same fabrication pattern
and should be audited/fixed or removed in a future sprint.

---

## michigan-intelligence.ts fabrication audit and fix (2026-07-04)

Follow-up to the entry above. Full audit found the problem was worse and
wider than a single dead tab - two **live, nav-linked pages** rendered
fabricated numbers under false, specific agency citations:

- `/health-equity-atlas`'s County Leaderboard ranked 14 counties by a
  "life expectancy" field pulled from `COUNTY_INTELLIGENCE_KPIS` (14
  counties, no source comment at all in the source file), captioned
  "Life expectancy from IHME/CHR estimates." No CHR or IHME ingest script
  or dataset exists anywhere in this repo.
- `/domain-dashboard` (+ `/health`, `/housing`, `/food-security`, `/energy`,
  `/legal-aid`) rendered 10 "intelligence domains," most metrics computed as
  `realCrossDomainField * ESTIMATED_..._RATIO` - 40+ uncited multiplier
  constants (`src/data/michigan-counties-intelligence.ts`, e.g.
  `ESTIMATED_INCARCERATION_FROM_VIOLENT_CRIME_RATIO = 1.6`), with the
  source's own comment admitting they are "Placeholder calibration ratios
  ... until domain-specific source feeds replace these generated values" -
  an admission never surfaced to users. Each domain instead rendered a
  specific, unsupported agency citation (e.g. "HUD / County Assessors" for
  Housing, "MSP / FBI UCR" for Public Safety) under the invented numbers.
  Separately discovered: 5 of the 10 domain slugs (benefits, transportation,
  environment, public-safety, disability-access) were **never actually
  reachable** as a Domain Dashboard view in production - their routes point
  at unrelated, already-built, real pages (`BenefitsHubPage`,
  `TransportationPage`, `EnvironmentPage`, `PublicSafetyPage`,
  `DisabilityAccessPage`), not this dashboard.
- 4 more components (`CivicIntelligenceHub`, `InsightSummary`,
  `TrendExplorer`, `HealthDataSnapshot`) plus a fifth
  (`DataActionBanners`, its own separate uncited 14-county hardcoded
  dataset) formed an isolated subtree never mounted by any route - dead
  code, but still shipping fabricated numbers to anyone who read the
  source.

Fix, in order of what was kept vs. removed:

1. Deleted the entirely-unreachable subtree: `CivicIntelligenceHub.tsx` (+
   its test), `InsightSummary.tsx`, `TrendExplorer.tsx`,
   `HealthDataSnapshot.tsx`, `DataActionBanners.tsx`.
2. `CountyLeaderboard.tsx`: removed the "Overall Health" (life expectancy)
   ranking metric and the false IHME/CHR citation entirely - no real
   all-83-county life-expectancy source exists anywhere. Its other metrics
   (uninsured rate, primary care access, food insecurity, poverty) were
   already real and are unaffected.
3. `michigan-counties-intelligence.ts` + `intelligence-domains.ts`: of the
   5 domain slugs actually routed to `DomainDashboard.tsx` (health, housing,
   food-security, energy, legal-aid), energy and legal-aid had **zero**
   fields backed by real data for any county and were removed entirely
   (including their `/energy` and `/legal-aid` routes). Health, housing,
   and food-security were stripped to only the fields that are a direct
   pass-through of an already-real, already-ingested value - no invented
   multiplier, no fabricated KPI:
   - Health: `uninsured_rate`, `primary_care_access` (from `COUNTY_PROFILES`
     - County Health Rankings 2025). Dropped: `life_expectancy`,
     `mental_health_access` (fabricated KPIs), `diabetes_prevalence`,
     `opioid_crisis_deaths`, `maternal_mortality`, `obesity_rate`,
     `cancer_mortality` (all `ESTIMATED_*_RATIO`-derived).
   - Housing: `renter_burden_rate` (from `COUNTY_CROSS_DOMAIN` directly).
     Dropped the other 7 (all ratio/arbitrary-formula-derived).
   - Food Security: `food_insecurity_rate` (from `COUNTY_PROFILES`). Dropped
     the other 7.
   - The 5 domain slugs that were never actually reachable (benefits,
     transportation, environment, public-safety, disability-access) were
     removed from the scaffold entirely rather than fixed in place, since
     fixing data nobody can ever see serves no purpose.
   - All 40+ `ESTIMATED_*_RATIO` constants deleted.
4. `michigan-intelligence.ts` itself (the file `COUNTY_INTELLIGENCE_KPIS`,
   `MICHIGAN_AVERAGES`, `MICHIGAN_INTELLIGENCE_SIGNALS`,
   `MICHIGAN_INTELLIGENCE_FEED`, `TREND_EXPLORER_SERIES`, and an
   entirely-hardcoded, non-derived 3-county diabetes "watchlist" all lived)
   had no remaining consumer after steps 1-3 and was deleted outright.

Net effect: the Domain Dashboard is now 3 domains (health, housing,
food-security) with 1-2 real metrics each, all 83 counties honestly
partitioned into "has a real value" (7 priority counties) vs. "Data
pending" (the other 76) - the same pattern already used elsewhere in this
codebase, rather than a state-average fallback silently presented as a
county-specific figure (the previous `getCountyIntelligence()` behavior).
