# AccessMI Claims Verification Map

**Branch:** audit/claims-vs-code  
**Date:** 2026-06-11  
**Auditor:** Claude Sonnet 4.6 (autonomous sprint)

Taxonomy: SOURCE · FRESHNESS · PRIVACY · INDEPENDENCE · CAPABILITY · ACCURACY  
Verdicts: VERIFIED · PARTIAL · UNANCHORED · FALSE

---

## Summary

| Verdict | Count |
|---|---|
| VERIFIED | 18 |
| PARTIAL | 2 |
| UNANCHORED | 4 |
| FALSE (fixed) | 1 |
| FALSE (blocked — sacrosanct) | 1 |

---

## VERIFIED

| # | Verbatim claim | Surface file:line | Category | Evidence file:line | Reasoning |
|---|---|---|---|---|---|
| V-1 | "41 verified public source organizations (23 federal, 9 state, 9 nonprofit)" | `DataSourcesPage.tsx:30` | SOURCE | `platformConstants.ts:27,34-38` | Build throws if `SOURCES_TOTAL !== 41`; `check-counts.mjs` enforces same |
| V-2 | "One platform. 41 verified sources. Structured for action." | `AboutPage.tsx:240` | SOURCE | `platformConstants.ts:27` | Dynamic import of `DATA_SOURCE_DISPLAY` constant derived from registry |
| V-3 | "Ask Access Michigan" (conversational agent title) | `AccessChat.tsx:245` | CAPABILITY | `AccessChat.tsx:195` | Calls `/.netlify/functions/chat-mistral` with Mistral AI; component rendered on homepage `Index.tsx:264` |
| V-4 | "No tracking cookies" | `PrivacyPage.tsx:65` | PRIVACY | `index.html:4-13` | GA script removed per trust audit; no ad/analytics scripts in `index.html` or `main.tsx` |
| V-5 | "Access Michigan displays zero ads." | `PrivacyPage.tsx:62` | PRIVACY | `index.html:1-128` | No ad network scripts or elements in entry point |
| V-6 | "We never sell, rent, license, or share your information with third parties for marketing." | `PrivacyPage.tsx:63` | PRIVACY | `index.html:1-128`, `main.tsx` | No third-party data-broker integrations in client code |
| V-7 | "The Platform is fully accessible without creating an account or providing identifying information." | `PrivacyPage.tsx:64` | PRIVACY | `src/App.tsx`, all page routes | No auth guard on any public route; no login requirement |
| V-8 | "We do not fingerprint browsers, track across sites, or build user profiles." | `PrivacyPage.tsx:66` | PRIVACY | `index.html:4-13` | No fingerprinting libraries; GA explicitly removed |
| V-9 | "AccessMI is an independent civic data and education project. It is not affiliated with the State of Michigan or any government agency." | `Footer.tsx:301-302` | INDEPENDENCE | `src/config/site.ts:1-4` | Independent domain `accessmi.org`; no gov auth, no gov-issued credentials in codebase |
| V-10 | "All 83 Michigan counties" | `platformConstants.ts:99` | ACCURACY | `census-geographies.ts:6-24` | 83 three-digit FIPS codes counted in registry (`grep '"[0-9][0-9][0-9]"' | wc -l → 83`) |
| V-11 | "Real-time AQI from EPA AirNow monitoring stations" | `AirQualityPage.tsx:70` | CAPABILITY | `useAirQuality.ts:32-48` | Hook fetches `${SUPABASE_URL}/functions/v1/airnow-proxy` at runtime via TanStack Query |
| V-12 | "Real-time data from ClinicalTrials.gov" | `LiveTrialSearch.tsx:45` | CAPABILITY | `clinicaltrials-client.ts:1` | `const CT_BASE = "https://clinicaltrials.gov/api/v2"` — live API fetch per query |
| V-13 | "No ads, no tracking, no pay-to-play listings." | `AboutPage.tsx:873` | PRIVACY | `index.html:4-13` | No ad/tracking scripts; no paid-placement mechanism in facility or resource data |
| V-14 | "EPA EJScreen v2.3 (Archived 2024)" as a data source | `MethodologyPage.tsx:589-593` | SOURCE | `ejscreen.ts:1-7` | Data file present; `EPA_EJSCREEN_SOURCE = "EPA EJSCREEN v2.3, ZCTA-level aggregation"` |
| V-15 | "CMS Hospital Compare" as data source | `MethodologyPage.tsx:365-369` | SOURCE | `sourcesRegistry.ts:36-42` | Registry entry present; `verifiedHealthFacilities.json` sourced from CMS |
| V-16 | "HRSA Data Warehouse" as data source | `MethodologyPage.tsx:371-375` | SOURCE | `sourcesRegistry.ts:50-56` | Registry entry present; `verifiedHealthFacilities.json` sourced from HRSA |
| V-17 | "CDC PLACES & BRFSS" as data source | `MethodologyPage.tsx:359-363` | SOURCE | `sourcesRegistry.ts:27-34` + `dataFreshness.ts:56-62` | Registry entry present; `trendSeries.json:16` cites CDC PLACES vintage |
| V-18 | localStorage use disclosed | `PrivacyPage.tsx:107` | PRIVACY | `PrivacyPage.tsx:105-108` | Policy accurately describes localStorage for theme/language/county preferences |

---

## PARTIAL

| # | Verbatim claim | Surface file:line | Category | Evidence file:line | Caveat |
|---|---|---|---|---|---|
| P-1 | "EPA EJScreen v2.3" as statewide layer | `MethodologyPage.tsx:589-593` | SOURCE | `ejscreen.ts:32-64` | Data file has only ~15 Michigan ZCTAs (urban core). Not statewide-comprehensive. Methodology page does not disclose sparse coverage. |
| P-2 | "Our hosting provider (Netlify / Vercel) automatically collects minimal operational data" | `PrivacyPage.tsx:77` | PRIVACY | `netlify.toml:1-4` | Netlify confirmed; Vercel not the deploy host (netlify.toml only). Listing Vercel is imprecise but not a false claim about data collection. |

---

## UNANCHORED

| # | Verbatim claim | Surface file:line | Category | Why unanchored |
|---|---|---|---|---|
| U-1 | "No conversation logging: AI chat messages are processed in real-time via secure backend functions and are not stored on our servers after the response is delivered." | `PrivacyPage.tsx:119` | PRIVACY | Server-side Netlify function behavior; cannot be verified from client code |
| U-2 | "No PHI storage: Any health details... processed transiently and discarded immediately after generating a response." | `PrivacyPage.tsx:120` | PRIVACY | Server-side Supabase Edge Function behavior; cannot be verified from client code |
| U-3 | "We select providers that do not use input data for model training." | `PrivacyPage.tsx:121` | PRIVACY | Depends on Mistral's data processing terms; not verifiable from code |
| U-4 | "No personal health information is stored or transmitted. Analysis happens in real-time and is not saved." | `AIAppealGenerator.tsx` (inline disclosure) | PRIVACY | Server-side transient-processing claim; cannot be verified from client code |

---

## FALSE

### FALSE — Fixed in this sprint

| # | Verbatim claim | Surface file:line | Category | Evidence of falsity | Fix applied |
|---|---|---|---|---|---|
| F-1 | "Health-related tools (AI appeals generator, benefits wizard, symptom information) process data **client-side**. We do not **store, transmit**, or retain any health information you enter." | `PrivacyPage.tsx:67` | PRIVACY | `AIAppealGenerator.tsx:65`: `fetch("${supabaseUrl}/functions/v1/appeal-generator", ...)` — server-side Edge Function call. Data IS transmitted. "client-side" and "do not transmit" are both false. | Replaced with: "are processed via secure server functions that do not store your inputs after the response is returned. We do not retain health information beyond the immediate request." |

### FALSE — Fix blocked (sacrosanct crisis component)

| # | Verbatim claim | Surface file:line | Category | Evidence of falsity | Why not fixed |
|---|---|---|---|---|---|
| F-2 | aria-label "Quick exit - leave this site immediately **(also press Escape)**"; title "**Press ESC to quickly leave this page**"; rendered `<kbd>ESC</kbd>` hint | `QuickExitBar.tsx:31-40` | PRIVACY | `QuickExitBar.tsx:12-17`: only a click handler (`window.location.replace`); no `keydown` listener. Comment at line 19: "Quick Exit is button-only — Escape key closes modals/dropdowns, not Quick Exit." ESC does NOT trigger Quick Exit. | `QuickExitBar.tsx` is sacrosanct (crisis DV safety affordance). Requires named exception in a future sprint prompt to correct aria-label and remove false ESC hint. |

---

## Reviewer-premise reconciliation (Comet + Gemini external AI reviews)

| Reviewer premise | Code verdict | Notes |
|---|---|---|
| "41 public data sources" | CONFIRMED | Build-asserted (V-1) |
| "Ask Access Michigan conversational agent" | CONFIRMED | Implemented in `AccessChat.tsx` (V-3) |
| "verified low latency" / "Sub-3-second loads on 3G" | STALE/REMEDIATED | `MethodologyPage.tsx` trust log documents removal of this aspirational claim in Mar 2026 |
| "automated weekly pulls" | STALE/REMEDIATED | Same trust log; no automated pull scheduler in codebase |
| "zero-cookie architecture" | CONFIRMED w/caveat | GA removed; no tracking cookies; localStorage used and disclosed (V-4, V-18) |
| CMS data layer | CONFIRMED | (V-15) |
| HRSA data layer | CONFIRMED | (V-16) |
| CDC PLACES data layer | CONFIRMED | (V-17) |
| EPA EJScreen data layer | PARTIAL | Sparse (P-1) |

**Score: 0 reviewer premises imported as fact. 9 of 9 reconciled before writing verdicts.**
