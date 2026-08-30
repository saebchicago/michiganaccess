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
| `src/data/sourcesRegistry.ts` | Source data | Platform data-FEED registry; build asserts against it |
| `src/data/dataCatalog.ts` | Source data | Governed dataset catalog behind /civic-data-hub and /data-validation; every entry build-reconciled against the feed registry |
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
Runs: generate-source-catalog → generate-sitemap → check-links → check-counts →
check-zip-population → check-county-facilities → check-trend-series →
check-snap-county-dataset → check-fabrication → check-copy → check-no-backend-leak →
check-provenance → check-dataset-labels → check-integrity-labels → vite build →
prerender-meta

Build-time assertions: `platformConstants.ts` throws if SOURCES_TOTAL drifts from
EXPECTED_SOURCE_COUNT or the federal/state/nonprofit breakdown changes;
`check-dataset-labels.mjs` requires every `.generated.json` to carry a
`provenance.value_label`; `check-integrity-labels.mjs` rejects any `.ts` data seed
that pairs VERIFIED with a secondary-source string.

**Corrected 2026-07-24 (Round 6):** this section previously listed a
`check-chna-mapping` step and claimed `check-chna-mapping.mjs` "validates CHNA gap
mapping integrity." No such script has ever existed in the repo and it was not in
the build chain. Its absence is why the 41 mislabeled `chnaSeed.ts` metrics (see
Future work) went uncaught. The list above is the actual chain from
`artifacts/access-mi/package.json`. It also previously hardcoded "SOURCES_TOTAL ≠ 41"
while the registry now expects 43; the assertion is described by name instead so it
cannot drift again.

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
| "zero-cookie architecture" | ~~CONFIRMED with caveat~~ **CORRECTED 2026-07-24 - see note below** | ~~GA removed per `index.html:4-13`~~; no ad/tracking scripts; `localStorage` used but disclosed in `PrivacyPage.tsx:107` |

> **Correction (2026-07-24, Round 6 audit):** the row above was wrong. Google
> Analytics 4 (`G-367X8MQ1F6`) is **live** at `artifacts/access-mi/index.html:4-20`
> and sets `_ga` / `_ga_*` first-party cookies. The site is therefore not
> "zero-cookie." Importantly, the *user-facing* disclosure is accurate and always
> was: `PrivacyPage.tsx:179-199` names GA4, its measurement ID, the exact cookies,
> and links the opt-out add-on. Only this audit record was false. Any future copy
> asserting "zero cookies" must be checked against `index.html` first.
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

### F-2: QuickExitBar ESC key false claim (RESOLVED 2026-07-24)

**Status: no longer accurate. The claim is now true and this entry is retained
only for history.** `QuickExitBar.tsx` has a working `useEffect` `keydown`
listener that calls `triggerExit()` on `Escape`, so the ESC copy described below
now describes real behavior. No sacrosanct exception was needed - the handler was
added independently. Verified 2026-07-24 during the Round 6 integrity audit.

The original (now stale) entry follows.

---

### F-2 (original entry): QuickExitBar ESC key false claim (LOGGED, fix blocked by sacrosanct rule)

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
- ~~CHNA chnaSeed.ts D5 audit: 35 metrics labeled VERIFIED but sourced from HFH 2022
  CHNA document (secondary source). Relabeling to MODELED deferred to a named
  Phase 4 of the CHNA gap analysis sprint.~~ **DONE 2026-07-24 (Round 6).** The
  count was **41**, not 35 - 40 sourced to the HFH 2022 CHNA plus one to a Planet
  Detroit write-up of ACS. All 41 relabeled MODELED. A new build guard,
  `scripts/check-integrity-labels.mjs`, now fails the build if any `.ts` data seed
  pairs VERIFIED with a secondary-source string, so this cannot silently recur.
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

---

## Data-catalog E2E accuracy audit (2026-08-16)

### The defect: three unreconciled catalogs

The platform described its own data in three places that nothing checked
against each other:

| List | Location | Entries | Guarded? |
|---|---|---|---|
| Feed registry | `src/data/sourcesRegistry.ts` | 43 | yes (`check-counts.mjs`) |
| Hub catalog | `DATA_CATALOG` literal inside `CivicDataHubPage.tsx` | 16 | no |
| Validation list | `DATA_SOURCES` literal inside `DataValidationPage.tsx` | 15 | no |

The two page-local lists were the site's transparency surface - the pages a
user visits specifically to check where a number came from - and they were
the least governed code in the repo. Measured drift:

- **Wrong publisher URL.** Leapfrog was listed at `leapfroggroup.org` on
  /data-validation and `hospitalsafetygrade.org` in the registry.
- **Cadences that disagreed with the registry**: CMS (Monthly vs Quarterly),
  Michigan 2-1-1 (Ongoing vs Daily), HRSA (Annual vs Quarterly),
  NHTSA and MODA similarly.
- **Wrong attribution.** County Health Rankings was credited to the Robert
  Wood Johnson Foundation; it is produced by the University of Wisconsin
  Population Health Institute with RWJF funding.

### The larger defect: "sources" were not "organizations"

`DATA_SOURCE_RULE` claimed the count was "unique source organizations ...
API endpoints from the same publisher are not double-counted". The registry
contradicted this outright - CMS appeared 3x, FEMA 3x, EPA/HUD/EGLE 2x each.
The rendered claim "43 verified public source organizations" was therefore
wrong: 43 was a count of *feeds* published by 36 *organizations*.

Fixed by separating the two numbers rather than deleting entries: feeds are
genuinely distinct datasets worth listing, only the label was false.
`SOURCES_TOTAL` (feeds) and `PUBLISHERS_TOTAL` (distinct orgs) are now
separate derived exports, both build-asserted, and `check-data-catalog.mjs`
fails any copy that renders the feed count next to the word "organizations".

### Uncredited publishers

/data-sources promises "Every organization credited" while six publishers
backing rendered figures appeared on no registry: ACEEE (energy-burden
choropleth), FBI Crime Data Explorer (county crime rates), CDC/ATSDR SVI
(compound-deficit scoring), and MI-SUDDR, Monitoring the Future, SAMHSA
(substance-use charts). All six are now registered; the feed count moved
43 -> 49 and the publisher count is 42.

`Monitoring the Future` and `MI-SUDDR` carry `attributionUnverified: true` -
their publisher entity is carried forward from the citations already on the
site and could not be confirmed against the publishers' own sites from the
build environment. The guard reports these on every run so they do not
harden into unexamined fact.

### The structure that sustains it

`src/data/dataCatalog.ts` is now the single catalog behind both pages, with
two entry kinds:

- `ingested` - a rendered figure is computed from it. Must name a
  `registryFeed` that exists in the feed registry; publisher, cadence, and
  URL host are reconciled against that feed.
- `reference` - linked for the user, nothing computed from it. Carries no
  registry feed and is deliberately excluded from the counted total, so a
  convenience link can never inflate the "verified sources" claim.

`scripts/check-data-catalog.mjs` (wired into `pnpm build` and the blocking
CI `Integrity guards` step) enforces eleven invariants, including the two
that stop this class of defect recurring:

- **Documented overrides.** A cadence or host that differs from the linked
  feed fails the build unless a substantive `cadenceNote`/`urlNote` explains
  why. Legitimate cases (api.census.gov vs data.census.gov, SEDS vs the EIA
  v2 API) are now explained in writing on the page instead of drifting.
- **No shadow catalogs.** The consumer pages must import from
  `dataCatalog.ts`, and any local array literal shaped like a dataset list
  fails the build - the exact regression that created this defect.

Every `poweredSurfaces` path is checked against the registered routes, which
caught 11 non-existent paths in the first draft of the catalog itself.

The guard was mutation-tested: ten separate corruptions (unknown feed,
publisher mismatch, undocumented cadence drift, host swap, reference entry
given a feed, bogus route, out-of-enum domain, duplicate id, non-https URL,
missing feed link) were each confirmed to fail it.

**Guard self-check.** An early revision of the guard parsed
`DATA_CATALOG: CatalogEntry[] = [` by taking the first `[`, matched the
empty brackets of the type annotation, and reported "ok - 0 catalog
entries" - passing every rule vacuously. The parser now anchors on the
initializer, and both the guard and the vitest suite assert a non-empty
parse. A guard that silently validates nothing is worse than no guard.

### Duplicate literals removed

`generate-source-catalog.mjs` carried its own hardcoded `!== 43` check and
`claims-anchor-guard.test.ts` asserted `EXPECTED_SOURCE_COUNT = 43`. Both
were a fourth and fifth copy of a number that only ever drifted. The
generator now asserts a parse-sanity floor and the test compares the
declared constant against the live registry - `check-counts.mjs` remains the
single authority on the exact figure.

---

## Data-freshness accuracy audit (2026-08-16)

Follow-up sweep after the data-catalog audit. Same defect class, different
layer: a hand-maintained field that nothing reconciled against the machine
-recorded truth sitting next to it.

### The root defect: one field, two questions

`freshnessStatus` was hand-typed per entry, and it silently answered either
of two different questions depending on who wrote the line:

  - "how recently did we pull it?"     (ingest recency)
  - "is our copy the newest release?"  (vintage currency)

`cdc-places` and `census-acs` carried the *same* `lastUpdated` (2026-07-02),
the *same* `Annual` cadence, and the *same* `nextExpectedUpdate`
(2026-12-01) - but one said "fresh" (judging ingest) and the other "aging"
(judging vintage). Both badges render on /methodology and /about. A reader
could not tell which dimension a badge referred to, and nothing caught the
contradiction.

### Findings

| # | Finding |
|---|---|
| 1 | `census-acs` claimed `lastUpdated: "2026-07-02"` in a comment that said it matched `acs-broadband-county.generated.json` - that file records `ingested_at: 2026-08-10`. The hand-copied date had drifted 39 days from the machine-recorded truth it cited, and understated how fresh the data actually was. |
| 2 | `cdc-places` vs `census-acs`: identical inputs, contradictory hand-set status (above). |
| 3 | `fema-declarations`, `epa-echo`, and `egle-mpart` declare a "Real-time"/"Continuous" cadence, had not been re-pulled in 168 days, and were labeled merely "aging". A real-time feed five and a half months stale is not aging. |
| 4 | `fema-nri` was 1,323 days past ingest on an "Every 2-3 years" cadence and labeled "aging". |
| 5 | `bls-laus-county` and `hrsa-hpsa-county` are ingested into committed datasets with full provenance and render on /county, /data, /find-care and /health-map - but had no freshness entry at all, so the "15 tracked datasets" rollup under-reported actual coverage. |

### The structure

Freshness is now two declared/derived dimensions instead of one typed label:

- `ingestStatus` (**derived**, never hand-set) - from `lastPulled` against
  `updateFrequency` and `nextExpectedUpdate`. A documented cadence-budget
  table converts phrases like "Every 2-3 years" into a day budget;
  longest-key-wins so "annual" cannot swallow "semi-annual". A
  `nextExpectedUpdate` in the past makes ingest overdue regardless of budget,
  and year ranges ("2024-2025") resolve to the end of their last year.
- `vintageStatus` (**declared**) - only a human can know whether the
  publisher has issued a newer release than the one we ship. "behind"
  requires a `vintageNote` naming the release we are missing.
- `freshnessStatus` (**derived rollup**) - the worse of the two. Field name
  and its three values are unchanged, so no consumer broke.

Dates are no longer hand-copied either: an entry backed by a committed
dataset names it in `generatedFrom`, and the guard asserts `lastUpdated`
equals that file's `provenance.ingested_at`.

The dashboard now states *which* dimension is failing on each card, because
"stale" alone could mean either - and used to.

### Guard

`scripts/check-data-freshness.mjs`, wired into `pnpm build` and the blocking
CI `Integrity guards` step, fails on: a hand-set `freshnessStatus` or
`ingestStatus`; a `generatedFrom` that is missing or whose `ingested_at`
disagrees with the entry; a committed dataset with `ingested_at` that no
entry tracks (opt out only via a written reason in `NOT_FRESHNESS_TRACKED`);
`vintageStatus` "behind" without a note or "current" carrying one; duplicate
ids; and `FRESHNESS_TRACKED_COUNT` drift.

Mutation-tested - eight corruptions each confirmed to fail it, including the
exact drift that started this audit (a hand-copied date diverging from the
generated file's `ingested_at`).

### Effect on the rendered numbers

Tracked datasets 15 -> 17. The honest distribution moved from 2 fresh / 4
aging / 9 stale to **3 fresh / 2 aging / 12 stale** - four entries moved
from "aging" to "stale" because real-time feeds had gone unpulled for
months, and two newly-tracked datasets joined. Per this file's standing
rule, that is a statement about the data, not a reason to soften the
dashboard: twelve of seventeen datasets are genuinely overdue for a
re-pull, and the refresh workflows are the fix.

### Root cause of the staleness: 9 of 11 refresh scripts ran on no schedule

The freshness audit above measured the problem. This is why it existed.

`artifacts/access-mi/scripts/` holds eleven `refresh-*.mjs` ingestion scripts.
Only two were referenced by any workflow:

| Script | Scheduled by |
|---|---|
| `refresh-acs-broadband-county.mjs` | `build-data.yml` (weekly) |
| `refresh-county-population.mjs` | `facility-refresh.yml` (weekly) |
| the other nine | **nothing** |

That maps exactly onto the observed data: ACS broadband was the only dataset
with a recent ingest date (2026-08-10) while every other generated dataset
sat at 2026-07-01/02, its last manual run. The scripts were not broken - they
had simply never been wired to a trigger. None of the nine needs an API key;
all take the same `--apply` flag.

`.github/workflows/dataset-refresh.yml` now runs all nine weekly (Tuesdays,
offset from the two existing data jobs so they cannot race on the same
commit). It deliberately:

- commits successful datasets even when one upstream fetch fails, then
  re-raises the failure afterwards, so a single outage cannot discard eight
  good refreshes;
- checksums `census-geographies.ts` before and after and fails if an
  ingestion script rewrote the sacrosanct 83-county registry;
- re-runs the data guards against the refreshed output before committing, so
  a bad upstream release cannot land silently.

Polling weekly for annually-published data is intentional: nine HTTP requests
a week buys pickup within seven days of a release instead of whenever someone
remembers to run the script.

### Derived ingest dates: provenance-index.generated.json

Wiring up the refresh jobs exposed a flaw in the freshness work above. Every
refresh rewrites `provenance.ingested_at`, and the guard pinned
`dataFreshness.lastUpdated` to that value - so each scheduled run would have
turned the build red until a human hand-edited the TypeScript. A guard that
requires weekly manual maintenance is a guard that gets disabled.

Importing the datasets to read the timestamp directly was not an option
either: `cdc-places-zcta.generated.json` alone is 2.7MB, and pulling whole
datasets into the bundle to read one field each is a real regression.

`scripts/generate-provenance-index.mjs` emits a few-hundred-byte index of
just `{filename: ingested_at}` for every committed generated dataset.
`dataFreshness.ts` reads `lastPulled` from it; entries naming `generatedFrom`
may no longer declare a date at all, and the guard rejects one that tries.
The index carries no generation timestamp of its own, so a run that finds no
new upstream data produces no diff.

End-to-end verified: rewriting a dataset's `ingested_at` fails
`check-data-freshness.mjs` with an instruction to regenerate; running the
generator makes it pass. No hand-editing anywhere in the loop.

---

## Dead-code sweep (2026-08-16)

82 modules under `src/` were referenced nowhere - not imported, not
lazy-loaded, not named in any test. 351KB of source: whole home-page sections
(`RegionalGateway`, `CommunityAlerts`, `GuidedPathways`, `MichiganAtAGlance`),
twelve `*Spotlights` components, five `tools/*Card` components, four
`utils/data-ingestion/seed-*.ts` scripts, and a `src/data/testfile.ts`.

Vite tree-shakes them, so no user ever downloaded them. The cost was
maintenance surface and misdirection: several rendered platform claims - "43
verified data sources", the Trinity Health outcome figures, "all 83 counties"
- which `check-copy.mjs` and `check-fabrication.mjs` scanned on every build,
for components no user could reach. Anyone grepping for one of those claims
would find it and reasonably conclude it was live on the site.

Removal ran to a fixed point: deleting the first 73 orphaned nine more
(`fema-flood.ts` was reachable only from the deleted `FloodInsuranceGapCard`,
`school-districts.ts` only from `SchoolDistrictCard`, and so on), and those
in turn orphaned `lib/resilience-score.ts`.

`scripts/check-orphan-modules.mjs` (in `pnpm build` and blocking CI) fails on
any new orphan. `orphan-allowlist.json` is shrink-only and currently empty.

### The guard's own false positive, and what it taught

The first revision of this guard scanned only `src/`, `scripts/` and
`public/`. It declared `src/lib/radix-compose-refs-patch.ts` an orphan, and
deleting it **broke `vite build`** - the module is aliased into the Radix
tooltip package by `vite.config.ts`, so production code imports it without
any `src/` file naming it.

Typecheck stayed clean and all 1070 tests passed through that deletion. Only
the full build caught it. The corpus now includes the root-level config
files, and the guard is verified against exactly this case: hiding
`vite.config.ts` makes it flag the patch, restoring it makes it pass.

A second, subtler bug surfaced immediately after: the guard's own explanatory
comment names `radix-compose-refs-patch`, and under "any mention counts" that
made the module permanently invisible to it. The script now excludes itself
from its own corpus. A guard that documents the modules it protects must not
thereby stop protecting them.

### Not addressed here

`.migration-backup/` is 901 tracked files and 24MB - larger than the entire
built site - and is a duplicate of the pre-migration `src/` tree. It is
excluded from every guard and build. Removing it is a separate decision from
this sweep and is left to the owner; git history retains it either way.

---

## Accessibility deep pass (2026-08-16)

Requested as a pass beyond the nine vitest-axe suites in `src/test/a11y/`.

The structural picture is genuinely good and worth recording: **zero**
`onClick` handlers on non-interactive elements without keyboard support,
**zero** `<img>` without `alt`, **zero** positive `tabIndex`. Those are the
defects that usually dominate a React codebase this size, and they are absent.

### The finding axe cannot report

39 text inputs and textareas had no real accessible name - 35 relied solely
on `placeholder`, and 4 had nothing at all.

All nine axe suites were green across every one of them, and that is correct
behaviour on axe's part: the accessible-name computation accepts `placeholder`
as a last-resort name, so a placeholder-only input is not an axe violation.
It is still a real defect. Placeholder text disappears the moment the user
types, taking the field's purpose with it - worst for screen-reader users
re-navigating a partly-filled form, and for anyone relying on short-term
memory to remember what they were filling in.

This is the whole reason the pass was worth running: the automated gate was
green and stayed green while 39 controls were unlabelled.

Fixed by adding `aria-label` to all 39. Where the placeholder was descriptive
the label was derived from it; where it was dynamic or useless (`placeholder="0"`
on an income field, an interpolated county name, a ternary over search mode) a
static label was written by hand.

`scripts/check-form-labels.mjs` (in `pnpm build` and blocking CI) now fails on
any text control lacking `aria-label`, `aria-labelledby`, an `id`/`htmlFor`
pair, a nearby `<Label>`, or a `<FormControl>` wrapper. Vendored shadcn
primitives under `src/components/ui/` are exempt: they forward `{...props}`
and the caller supplies the name.

### Two false-positive classes worth remembering

Both were caught before anything was changed:

- **`aria-hidden` on a link.** Three hits in `PublicOfficialsPage.tsx` looked
  like focusable elements hidden from the accessibility tree. They are
  decorative `<ExternalLink aria-hidden="true" />` icons *inside* anchors that
  carry an explicit `aria-label`. Correct practice, not a defect.
- **Arrow functions break naive JSX parsing.** A first scan using
  "match up to the next angle bracket" for tag attributes reported 43 unnamed
  controls. The `>` in `onChange={(e) => setX(...)}` truncates the attribute
  text, hiding any `aria-label` written after the handler. The real number was
  7. Both the guard and the audit script parse with brace and string tracking;
  a guard built on the naive scan would have failed the build on correctly
  labelled code and been disabled within a week.

---

## Performance and bundle audit (2026-08-16)

### The precache was undoing the code-splitting

The PWA precached **394 files, 6.70MB** - every emitted chunk. Among them:

| Chunk | Size | What it is |
|---|---|---|
| `vendor-pdf-*.js` | 378KB | jsPDF |
| `html2canvas.esm-*.js` | 196KB | html2canvas |
| `index.es-*.js` | 155KB | canvg |

That is ~730KB of PDF-export machinery, and every call site already loads it
correctly with `await import()` at the moment the user clicks export -
`generateCountyPDF.ts`, `generateBriefPDF.ts`, `generateCHNABrief.ts`,
`CHNAExport.tsx`. The `manualChunks` comment in `vite.config.ts` even says so:
*"only loaded when the user actually clicks export."*

The service worker then downloaded all of it for everyone, in the background,
on first visit. The code did the right thing and the cache config silently
undid it.

That matters more here than on most sites. This platform's audience is the
households it maps - ALICE families, rural counties, broadband deserts - many
of them on metered mobile data. A first visit that quietly pulls an extra
730KB is a real cost to exactly the people the site exists for.

`globIgnores` in the VitePWA `injectManifest` block now excludes the three
chunks. Precache is **6.70MB -> 5.99MB**, and the chunks still ship and still
load on demand, unchanged, when someone actually exports.

Offline effect: PDF export stops working offline. That is the correct trade -
it is a deliberate, network-adjacent action, not part of the reading
experience the offline shell exists to protect.

`scripts/check-precache-budget.mjs` runs after `vite build` and fails if an
export-only chunk reappears in the manifest or if the total exceeds a 6.4MB
ceiling. Both rules were mutation-proven: removing `globIgnores` and
rebuilding produced exactly the two failures the guard is meant to catch.
Raising the ceiling is deliberate - change the constant and justify it in the
commit.

### Not changed: the remaining 5.99MB precache

Full-app precaching looks intentional (`vite.config.ts` calls it "real
installability + honest offline behavior"), and trading it away would mean
pages a user has not yet visited stop working offline. Narrowing the precache
to the app shell and serving lazy chunks through a runtime `CacheFirst` route
is the standard alternative and would cut first-visit cost substantially, but
it is a product decision about what "works offline" promises, not a defect.
Left for the owner.

Other observations, no action taken: the entry chunk is 718KB raw / 212KB
gzipped, `vendor-charts` (recharts + d3) is 504KB, and
`verifiedHealthFacilities` is a 326KB data chunk. All three are already
split out and cached across routes, which is the right shape.

### CI ran every PR commit twice (2026-08-17)

The `e2e` job failed on PR #197: the axe scan of `/data` hit the 45s test
timeout inside `AxeBuilder.analyze()`. It was not caused by the diff.

Evidence:

- The **same commit** (`25b0b57`) had two concurrent CI runs. One `e2e` job
  passed, the other timed out - same SHA, same minute.
- The test passes locally against the same code in **14.7s**, a third of the
  budget.
- `e2e` passed on `main` immediately before this branch.

Cause: `on.push.branches` was `["**"]` alongside the `pull_request` trigger,
so every push to a PR branch ran the entire workflow twice - six concurrent
jobs (2x test, 2x e2e, 2x lighthouse) for one commit, competing for runners.
The Playwright suite runs against the Vite **dev** server, which compiles
routes on demand, so a heavy dashboard route under contention is exactly
where a fixed 45s budget breaks first. `mode: 'serial'` on that spec then
skipped the nine tests behind it.

Fixed by building `main` on push and leaving every other branch to its pull
request, plus a `concurrency` group with `cancel-in-progress` so a newer
commit supersedes an in-flight run. Halves runner load per commit and removes
the contention.

Also fixed: `playwright.config.ts` started its web server with `npm run dev`,
the last npm invocation in a repo whose root preinstall hook rejects npm.

Left alone: the e2e suite still exercises the dev server rather than a
production preview. Testing the real bundle would be more representative and
faster per route - it is what the Lighthouse job exists to do - but switching
changes what the suite covers, so it is a deliberate decision rather than a
drive-by fix.

---

## Gap closure and debt cleanup (2026-08-17)

### P0: the freshness guard broke main, and the guard was right

`build-data.yml` ran on schedule, refreshed
`acs-broadband-county.generated.json`, bumped its `provenance.ingested_at`
from 2026-08-10 to 2026-08-17, and committed the dataset **without**
`provenance-index.generated.json`. `dataFreshness.ts` derives `lastPulled`
from that index, so the two disagreed and `check-data-freshness.mjs` failed -
turning every `pnpm build` and CI Integrity-guards run red.

The guard behaved correctly; the workflow was incomplete. Introduced in #196,
which added the index and taught only the new `dataset-refresh.yml` to
regenerate it, leaving the pre-existing `build-data.yml` with the same trap.

Fixed by regenerating the index, adding the regeneration step and the index
path to `build-data.yml`, and closing the class with
`scripts/check-data-workflows.mjs`: any workflow staging a dataset that
appears in the index must run the generator and stage the index too. Its
scope is derived from the index itself rather than pattern-matched, after a
first revision treated every `*.generated.json` as a dataset and failed on
`source-link-check.yml` (a link-reachability report with no `provenance` block
at all). Mutation-proven against both the exact 2026-08-17 bug and the
forgot-to-stage variant.

### The near-miss: .migration-backup/ is production source

The dead-code sweep in #196 removed 82 unreachable modules. Continuing that
work, `.migration-backup/` looked like the obvious next target: 901 tracked
files, 24MB, larger than the built site, referenced by no code, excluded from
every guard. It was staged for deletion.

`threat_model.md` and `GAPS.md` stopped it. That tree holds the **only
in-repo source** for seven Supabase functions the app calls in production -
`appeal-generator`, `civic-copilot`, `airnow-proxy`, `arcgis-proxy`,
`cdc-proxy`, `gtfs-rt-proxy`, `npi-proxy` - which deploy to Supabase
out-of-band and therefore exist nowhere else in version control.

Kept, and the hazard made explicit rather than left to the next person's luck:
`scripts/check-backend-functions.mjs` fails the build if any endpoint the app
calls has no source, `backend-function-allowlist.json` records why each
exception exists, and CLAUDE.md carries a do-not-delete note. The lesson is
general: "referenced by no code" is not the same as "safe to delete" when the
code in question is deployed from somewhere else.

### GAP 7 was not LOW - the chat was simply broken

`AccessChat.tsx` calls `/.netlify/functions/chat-mistral` in four places.
Netlify deploys from `netlify/functions/` and `netlify.toml` sets no
`[functions]` override, so with the source sitting only in
`.migration-backup/netlify/functions/`, that endpoint returned 404. "Ask
Access Michigan" could not work at all. GAPS.md rated this LOW and "out of
scope - AccessChat degrades with an error message"; the degradation *was* the
symptom.

Promoted into `netlify/functions/` on the owner's decision. Reading it before
shipping found a second defect in the `catch` block: it set `body` twice (the
first dead), omitted the `statusCode` Netlify requires, and returned
`detail: err.message` to the browser - leaking internal error text from a
function that otherwise takes care to keep the API key server-side. Corrected
in the same change; details now stay in the function log.

Needs `MISTRAL_API_KEY` in the Netlify environment. Without it the function
returns a clean 500 naming the missing key rather than a 404.

### Stale numbers in the documentation

`CLAIMS.md` quoted "One platform. 41 verified sources." as the literal
AboutPage string while its own Evidence column said the value is a dynamic
import - and the registry had since moved to 43 and then 49. `GAPS.md`
recorded "41 sources".

Both now quote the derivation rather than a rendered instance
(`${DATA_SOURCE_DISPLAY}`, `SOURCES_TOTAL` / `PUBLISHERS_TOTAL`), which
removes the drift surface instead of policing it. `docs/data-source-
candidates.md` is a dated PR analysis whose baseline was genuinely 41 at the
time; rewriting it would falsify a record, so it carries a superseded note.

### Also removed

Root `src/` - two orphaned Supabase files (`client.ts`, `types.ts`) shadowed
by the app's own copies under `artifacts/access-mi/src/integrations/supabase/`.
Root `tsconfig.json` has `"files": []` and references only `lib/*`, so nothing
compiled them and no import resolved to them. The root `types.ts` carried two
table types the app's copy lacks (`dataset_registry`,
`maternal_infant_health`); Supabase types are regenerable, and neither table
is queried by the app.

### The a11y gate could not say what it caught (2026-08-17)

`e2e` failed on PR #199: `/environment has zero critical/serious violations`,
206 passed, 1 failed. The log said only:

```
AssertionError: 1 accessibility violation was detected
1 !== 0
```

No rule, no impact, no selector. Diagnosing it meant a local reproduction -
which passed with zero violations, because `/environment` renders live AQI
data that is reachable from a GitHub runner and not from the build
environment. The failure was real and unreproducible at the same time, and
the test had thrown away the only evidence.

Not caused by that PR: its diff touches no rendering code at all. The single
`src/` change is one date inside `provenance-index.generated.json`, which
feeds `dataFreshness.ts` and renders on /methodology and /about;
`/environment` references none of `DataFreshnessDashboard`, `dataFreshness`,
`DATA_FRESHNESS`, or the index.

`accessibility.spec.ts` now collects violations with `getViolations` and
asserts explicitly, logging rule id, impact, help URL, offending selectors and
axe's own fix summary before failing. Same gate, evidence retained.

Two things worth recording from writing it:

- **`getViolations` ignores `includedImpacts`.** It returns every impact
  level. Passing the option and trusting it silently promoted the gate from
  critical/serious to all-impacts and failed `/compare`, which reports a
  moderate `region` violation and is meant to pass. The filter is applied
  explicitly now, with a comment saying why.
- The diagnostic path was verified by forcing a failure (temporarily adding
  `moderate` to the blocking set) and confirming the log names the rule,
  the target selector and the remedy - rather than assuming it would.

The underlying `/environment` violation remains unidentified and is
data-dependent. The next occurrence will name itself.

## End-to-end audit (2026-08-30)

Full-site audit against `main` at 6c0db78. Typecheck, `pnpm build`,
`pnpm check:tests`, `pnpm test:a11y`, the Playwright suite, and a browser
sweep of all 89 `ROUTE_META` routes plus a sample of `/county/*` and
`/brief?county=*`. Five defects, four of them shipped by #228.

### Every county brief crashed in a production build

`src/data/alice-county.generated.json` was committed as a six-line
provenance stub - no `counties`, no `statewide`, no `ingested_at`. Every
other `*.generated.json` in `src/data/` is committed in full; this one
was not.

`aliceData.ts` runs `payload.counties.map(toLegacy)` at module scope, so
importing it against the stub throws `TypeError: Cannot read properties of
undefined (reading 'map')`. Confirmed in a headless browser against a
production-shaped bundle: `/brief?county=Keweenaw` rendered the
ErrorBoundary fallback, 73 characters of body text, nothing else. All 83
county briefs, plus `/civic-data`'s ALICE card and the atlas ALICE layer.

The app build hid it. `artifacts/access-mi`'s `build` script runs
`build-alice-county.mjs` first, which rewrites the file from the committed
CSV before Vite ever reads it. Netlify does not run that script: per
`netlify.toml` it runs the repo-root `build`, which called `vite build`
directly. Two build entry points, one of them missing four generators.

Production was not serving the crash - deploys are gated behind an explicit
release marker and the last one predates #228 - but the next release would
have shipped it.

Fixed three ways: the real 83-county payload is committed; the root build
runs the same four generators the app build does; and
`scripts/check-build-parity.mjs` fails the build when a generator that runs
before `vite build` in one entry point is missing from the other. The class
closes, not just the instance.

### `check-data-freshness` was red on main

#228 moved the ALICE payload to the official 2026 Michigan Data Sheet but
added no freshness entry naming it in `generatedFrom`, so `pnpm build` and
CI's Integrity-guards step both failed. The `alice` entry also still
hand-declared `lastUpdated: 2025-05-01` and `"2025 Report (2023 data)"` -
a vintage the platform had stopped shipping. It is anchored to
`alice-county.generated.json` now, so the date is derived rather than
declared, which is what the registry is for.

### The site quoted two different ALICE figures

`sourceManifest.ts` and `monthly-signals.ts` carried the 2026 number (40%,
39.7% unrounded). `ALICEDashboard`, `insights.ts`, `data-stories.ts`,
`MichiganQuiz` and `StoryPage` still carried 41% from the 2025 report, and
`generateCountyPDF` labelled the live 2024 value "United For ALICE 2023".
Same statistic, two answers, depending on which page you were on.

`ALICEDashboard` was the worst of it: a hand-maintained 20-county table that
disagreed with the platform's own dataset on every row (Lake 64% vs 51.5%
official, Ottawa 29% vs 33.8%), a household count of "1.8M+" against an
official 1.63M, and a budget card titled "Family of 4" whose bars summed to
$36,912 - the single-adult figure - from category splits no published
source backs. It reads from `aliceData.ts` now, like `MichiganHeatGrid`
already did, and the invented category split is replaced by the sheet's own
Survival Budget vs federal poverty level comparison.

`BriefPage` labelled its ALICE stat VERIFIED. The below-threshold share is a
classification against a constructed Survival Budget; `aliceData.ts` labels
every row MODELED. The brief says MODELED now, with the vintage read from
provenance instead of a hardcoded `"2025 (2023 data)"`.

### A stale test asserted the bug

`BriefPage.test.tsx` asserted Keweenaw showed "No data available for this
county" for ALICE, which stopped being true when #228 seeded all 83
counties. `pnpm check:tests` was red on main. The test now asserts the
opposite - Keweenaw's real share, labelled MODELED - which is the assertion
that would have caught the stub.

### A button inside a button on /food-access

`all-routes.spec.ts` had been recording this to `FAILED_ROUTES.md` without
failing on it: React logging a DOM-nesting hydration error. `ProvenancePanel`
put a `ProvenanceTag` inside its disclosure `<button>`, and `ProvenanceTag`
renders its own `<button>` for the source popover. Invalid HTML, and the
popover could not be opened - clicking it toggled the disclosure instead.
They are siblings now.

### Not defects

- `index.html`'s site-wide `Dataset` JSON-LD block carried no `license`, so
  `discoverability.test.ts` failed the moment a `dist/` existed for it to
  read. The assertion was right and the block was missing a field; added.
- The axe specs fail intermittently in a CPU-constrained container running
  two browser workers, reporting `color-contrast` on a different route each
  run - framer-motion fade-ins sampled mid-transition. Nothing reproduces
  serially: the flagged routes return zero violations every time when run
  alone. Same class the spec's own `beforeEach` comment already documents
  for the onboarding tour.
