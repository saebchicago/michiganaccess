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
| ACS Broadband (B28002) | acs-broadband-county.generated.json | 83 | VERIFIED | **pending-ci** (needs CENSUS_API_KEY) |
| BLS LAUS Unemployment | bls-laus-county.generated.json | 83 | VERIFIED | Populated May 2026 (Preliminary) |
| County Profiles (pop + health) | michigan-county-profiles.ts | 83 | VERIFIED (explicit constants) | Live |
| Cross-Domain Indicators | cross-domain-indicators.ts | 83 | VERIFIED (ACS 2022 stated inline) | Live |
| ALICE Economic Hardship | aliceData.ts | 8 + statewide | VERIFIED (source field per record) | Partial - major counties only |
| Source Manifest | sourceManifest.ts | Statewide | VERIFIED/false per claim | 26 claims total |
| Sources Registry | sourcesRegistry.ts | Statewide | Named org per entry | 41 sources |

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

## GAP 7 - LOW: Netlify chat-mistral function lives in migration-backup
**Impact:** Unclear whether the Mistral proxy is active in production. If not, AccessChat silently fails.  
**Fix:** Out of scope for this branch - tracked separately. AccessChat degrades with an error message.  
**Effort:** Not addressed here.

## GAP 8 - LOW: ALICE data covers only 8 counties
**Impact:** For 75 rural/suburban counties, `getALICEByCounty()` returns null. Query engine must degrade gracefully.  
**Fix:** Degrade to statewide ALICE averages when county-level data is absent, labeled as such.  
**Effort:** Handled in GAP 3 implementation.

---

## Gaps Addressed by This Branch

- [x] GAP 1 - wire check-provenance.mjs into build
- [x] GAP 2 - create check-dataset-labels.mjs + wire into build
- [x] GAP 3 - civicQueryEngine.ts (pure client-side, no third-party calls)
- [x] GAP 4 - provenance labels on every query answer data point
- [x] GAP 5 - BriefPage BLS LAUS + HRSA HPSA + CDC PLACES + ACS broadband sections
- [x] GAP 6 - /ask route and CivicAskPage

## Gaps Not Addressed (out of scope)

- GAP 7 - Netlify chat-mistral function status (separate ops issue)
- GAP 8 - Partial: ALICE statewide fallback added, but county-level data extension requires a separate data-refresh pass

---

## Sample NL Answers (pre-implementation verification targets)

**Q:** "What is driving food insecurity in Wayne County?"  
**Expected:** Food insecurity rate from County Health Rankings (Map the Meal Gap 2022, MODELED); poverty rate from ACS; rent burden from ACS; every figure with IntegrityBadge.

**Q:** "How does Alcona County's healthcare access compare to the state?"  
**Expected:** Uninsured rate vs state average; HRSA HPSA shortage FTE; primary care ratio; all labeled VERIFIED or MODELED.

**Q:** "What is the unemployment rate in Genesee County?"  
**Expected:** BLS LAUS May 2026 value (8.2%, Preliminary) with VERIFIED label and preliminary caveat.
