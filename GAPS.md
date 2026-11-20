# GAPS.md - AccessMI Civic Intelligence Audit
**Branch:** feat/civic-intelligence  
**Audited:** 2026-07-05  
**Build baseline:** PASSES (all existing checks green)

---

## Dataset Provenance Inventory

| Dataset | File | Counties | value_label | Status |
|---|---|---|---|---|
| CDC PLACES County 2025 | cdc-places-county.generated.json | 83 | MODELED | Populated 2026-07-02 |
| HRSA HPSA County Rollup | hrsa-hpsa-county.generated.json | 83 | MODELED | Populated 2026-07-02 |
| ACS Broadband (B28002) | acs-broadband-county.generated.json | 83 | VERIFIED | Populated 2026-08-24 (build-data.yml, ACS 2019-2023) |
| BLS LAUS Unemployment | bls-laus-county.generated.json | 83 | VERIFIED | Populated May 2026 (Preliminary) |
| County Profiles (pop + health) | michigan-county-profiles.ts | 83 | VERIFIED (explicit constants) | Live |
| Cross-Domain Indicators | cross-domain-indicators.ts | 83 | VERIFIED (ACS 2022 stated inline) | Live |
| ALICE Economic Hardship | alice-county.generated.json | 83 + statewide | MODELED | Populated 2026-08-30 from official 2026 data sheet (2024 data) |
| Source Manifest | sourceManifest.ts | Statewide | VERIFIED/false per claim | 26 claims total |
| Sources Registry | sourcesRegistry.ts | Statewide | Named org per entry | `SOURCES_TOTAL` feeds / `PUBLISHERS_TOTAL` publishers (both derived; see platformConstants.ts) |

---

## GAP 1 - CRITICAL: check-provenance.mjs is not wired into the build
**Impact:** Build does not fail on proxy anti-patterns.  
**Fix:** Add `node scripts/check-provenance.mjs` to the build script in package.json.  
**Effort:** 5 min.

## GAP 2 - CRITICAL: No build-time enforcement of dataset value_label fields
**Impact:** A CI script could replace a generated JSON with malformed data (no value_label) and the build passes.  
**Fix:** Create `scripts/check-dataset-labels.mjs` - verifies every `.generated.json` in src/data/ has `provenance.value_label` in the allowed enum, and every measure-level entry also has `value_label`.  
**Effort:** 30 min.

## GAP 3 - HIGH: Chat context is Supabase-only - on-site county data never injected
**Impact:** When Supabase is unconfigured (likely in production), chat answers have zero data context. The rich on-site datasets (CDC PLACES, HRSA HPSA, BLS LAUS, ALICE, cross-domain) are never used to ground answers.  
**Fix:** Build a client-side `civicQueryEngine.ts` that retrieves from on-site data files and formats cited, labeled answers without any third-party AI call.  
**Effort:** 3-4 hours.

## GAP 4 - HIGH: Chat responses carry no provenance labels
**Impact:** Users see plain-text answers with no source citations, no VERIFIED/MODELED distinction. Violates NON-NEGOTIABLE RULES.  
**Fix:** Query engine return type enforces `valueLabel` and `source` on every data point; UI renders IntegrityBadge per figure.  
**Effort:** Included in GAP 3 fix.

## GAP 5 - HIGH: BriefPage missing four dataset layers
**Impact:** County brief omits BLS LAUS unemployment, HRSA HPSA shortage scores, CDC PLACES health conditions, and ACS broadband. Brief is not yet "CHNA-ready" without these.  
**Fix:** Add BriefStatBlock sections for each dataset using existing TypeScript shims.  
**Effort:** 2 hours.

## GAP 6 - MEDIUM: No dedicated civic-intelligence route
**Impact:** No URL for users to reach the NL query interface directly; AccessChat is embedded on homepage only.  
**Fix:** Add `/ask` route and `CivicAskPage`.  
**Effort:** 1 hour (mostly included in GAP 3).

## GAP 7 - RESOLVED 2026-08-17: Netlify chat-mistral function lived in migration-backup
**Impact (confirmed, and worse than the LOW rating suggested):** Netlify deploys from
`netlify/functions/` and `netlify.toml` sets no `[functions]` override, so the endpoint
`/.netlify/functions/chat-mistral` - called from `AccessChat.tsx` in four places - returned
404 in production. "Ask Access Michigan" could not work at all.
**Fix:** `chat-mistral.js` promoted into `netlify/functions/` so it is bundled and deployed.
Its `catch` block was also malformed - it set `body` twice, omitted the `statusCode` Netlify
requires, and returned `detail: err.message` to the browser - and was corrected in the same
change. Requires `MISTRAL_API_KEY` in the Netlify environment; without it the function now
returns a clean 500 naming the missing key rather than a 404.
**Guarded by:** `scripts/check-backend-functions.mjs` fails the build if any
`.netlify/functions/<name>` the app calls has no deployable source.

## GAP 8 - RESOLVED 2026-08-30: ALICE data covers all 83 counties
**Impact (was):** For 75 rural/suburban counties, `getALICEByCounty()` returned null.
**Fix:** Ingested the official United For ALICE Michigan Data Sheet 2026 (data year 2024) into `alice-county.generated.json`. 83 counties + statewide rollup. Labeled MODELED. Statewide fallback remains only for unrecognized geography names.
**Guarded by:** `alice-coverage.test.ts` asserts 83 FIPS and official statewide sums.

---

## Gaps Addressed by This Branch

- [x] GAP 1 - wire check-provenance.mjs into build
- [x] GAP 2 - create check-dataset-labels.mjs + wire into build
- [x] GAP 3 - civicQueryEngine.ts (pure client-side, no third-party calls)
- [x] GAP 4 - provenance labels on every query answer data point
- [x] GAP 5 - BriefPage BLS LAUS + HRSA HPSA + CDC PLACES + ACS broadband sections
- [x] GAP 6 - /ask route and CivicAskPage
- [x] GAP 7 - chat-mistral promoted into netlify/functions (2026-08-17)
- [x] GAP 8 - official ALICE 2024 coverage for all 83 counties (2026-08-30)

## Gaps Not Addressed (out of scope)

- None from the original civic-intelligence audit list. Remaining work is trend depth (multi-year ALICE history) and demographic splits the publisher does not release at county level.

---

## Sample NL Answers (pre-implementation verification targets)

**Q:** "What is driving food insecurity in Wayne County?"  
**Expected:** Food insecurity rate from County Health Rankings (Map the Meal Gap 2022, MODELED); poverty rate from ACS; rent burden from ACS; every figure with IntegrityBadge.

**Q:** "How does Alcona County's healthcare access compare to the state?"  
**Expected:** Uninsured rate vs state average; HRSA HPSA shortage FTE; primary care ratio; all labeled VERIFIED or MODELED.

**Q:** "What is the unemployment rate in Genesee County?"  
**Expected:** BLS LAUS May 2026 value (8.2%, Preliminary) with VERIFIED label and preliminary caveat.

---

## Open items from the 2026-11-14 agent-ready data pass

Nothing below was regenerated in that pass.

- [x] LICENSE: MIT chosen by the maintainer 2026-11-14. `LICENSE` added at the repo root, `llms.txt` updated. Open: add `"license": "MIT"` to `artifacts/access-mi/package.json` if wanted; copyright line uses the site byline "Saeb Ahsan" (confirm).
- [ ] Stale static vintage, ACS broadband (B28002, county): ships ACS 5-year 2019-2023. 2026-11-20: script bumped to 2024 and page labels now read the dataset's vintage_window; the data itself refreshes on the next `build-data.yml` run (needs the GitHub `CENSUS_API_KEY` secret). Refresh to 2020-2024 from https://api.census.gov/data/2024/acs/acs5 by setting `ACS_VINTAGE = 2024` in `scripts/refresh-acs-broadband-county.mjs` and running `node artifacts/access-mi/scripts/refresh-acs-broadband-county.mjs --apply` (or the `build-data.yml` workflow), then update labels in `civicQueryEngine.ts` and `BriefPage.tsx`.
- [ ] Stale static vintage, dual-eligible fallback (B27010) and `dual-eligible-exposure` function: ACS 5-year 2019-2023 (`ACS_YEAR = "2023"`). Bump to 2024 together with `src/data/dualEligibleExposureFallback.ts`; source https://api.census.gov/data/2024/acs/acs5. Methodology and page labels then change to 2020-2024.
- [ ] Stale static vintage, `cross-domain-indicators.ts` and `state-benchmarks.ts`, `zip-quickstats.ts`: ACS 5-year 2018-2022. Re-pull from https://api.census.gov/data/2024/acs/acs5 (county and ZCTA geographies) and update `vintage` fields.
- [ ] Mixed vintages on one page: ZIP and compare pages show live ACS 5-year 2020-2024 next to static 2018-2022 benchmarks until the items above are refreshed.
- [x] Ambiguous labels source-checked 2026-11-20 against Census table-based summary files (www2.census.gov, keyless):
  - `CostOfLivingSnapshot.tsx`: rent/mortgage matched no single release (US rent = 2017-2021 5-year, US mortgage = 2021 1-year, MI values matched none). Replaced with ACS 1-year 2024 B25064/B25088. Gas, electricity, grocery and premium rows were not checked.
  - `CountyCompare.tsx`: no ACS measure on the card; label now names PEP V2024, SAHIE 2022, HRSA AHRF 2021, Feeding America 2022.
  - `DataAndInsightsPage.tsx`: "Rural uninsured 14%, twice urban" had no derivation; replaced with statewide 5.1% (ACS 1-year 2024, B27010).
  - `impactStories.ts`: 9.2% "uninsured in gap ZIPs" had no derivation; removed. State 5.2% confirmed as ACS 5-year 2018-2022 (B27010). FQHC counts and the 28% HRSA figure were not checked.
  - `language-access.ts`: Spanish, Arabic, Chinese matched ACS 5-year 2020-2024 B16001; the other seven matched no 2021-2024 release. All ten replaced from 2020-2024 B16001. "Southeast Michigan" attribution of the statewide Arabic count removed.
  - `FoodAccessMap.tsx`: SNAP rates matched no B22003 release and tract/percent columns contradicted `usda-fara-county.generated.json`. Card now reads that dataset; SNAP column, "1.4M+" and "14.6%" removed.
- [ ] `dataCatalog.ts`, `dataFreshness.ts` (sacrosanct) and `sources.ts`/`sources.test.ts` still reference the 2023 B27010 table for the dual-eligible dataset; update with the refresh above.
- [ ] Supabase functions changed in this pass deploy out of band (see PR body, "Deploy manually").
- [x] `ACS_FALLBACK` in `useCHNATractData.ts`: emptied in #263 (verified 2026-11-20); no hand-entered tracts remain.

## Public disclosure of open items (2026-11-20)

Open items that affect how a figure should be read are now published, not only tracked here:
`artifacts/access-mi/src/data/catalog-pending-items.json` feeds the "What is still pending"
section of `/data-sources`, `_meta.pendingItems` in `/data/source-catalog.json`, and a pointer in
`llms.txt`. When an item above is closed, remove or edit its pending entry in the same change.
`catalog-pending-items.test.ts` fails if the catalog copy drifts or the license item stops
matching the catalog's license state.

Blocked in the 2026-11-20 session: the ACS refreshes above need a Census API key; api.census.gov
redirected keyless requests to its "Missing Key" page from the build container.
