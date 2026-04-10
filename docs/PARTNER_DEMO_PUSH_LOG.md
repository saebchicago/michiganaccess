# Partner Demo Push Log
**Date:** 2026-04-09
**Meeting:** Planet Detroit, 2026-04-10 10:00 AM ET

## Phases run

| Phase | Status | Commit | Notes |
|---|---|---|---|
| Phase 0 | Reconnaissance | n/a | MichiganEnvBurdenMap already had "Illustrative" label (commit 9c4eb73). EnvironmentRiskCards already had MICHIGAN_PFAS_BY_COUNTY static fallback (commit 9c4eb73). |
| Phase 1 | Skipped (already done) | 9c4eb73 | Illustrative label confirmed on line 188 of MichiganEnvBurdenMap.tsx |
| Phase 2 | Skipped (already done) | 9c4eb73 | PFAS static fallback confirmed in EnvironmentRiskCards.tsx lines 41-43 |
| Phase 3 | Complete | d935f09 | EPA TRI top facilities section added to CountyPage.tsx; getTRIByCounty imported |
| Phase 4 | Complete | 5c42c09 | useECHOFacilities wired to CountyPage; EPA Compliance Overview section added |
| Phase 5 | Complete | 1118830 | scripts/generate-wayne-csv.mjs created; public/data/wayne-county-environmental-data-pack.csv generated (3338 bytes, 46 lines, 5 sections) |
| Phase 6 | Complete | 8eb0b0b | src/pages/methodology/EnvironmentalMethodology.tsx created; route added to routes.ts; vite.config.ts NOT modified per hard rule |
| Phase 7 | Complete | n/a | Build passes, 427 tests pass (1 skipped), all verifications pass, pushed to main |

## Blockers encountered

- Phase 6: vite.config.ts modification skipped. Hard rules prohibit modifying the prerender pipeline, vite.config.ts, and .npmrc. The route is wired in routes.ts and the page renders at /methodology/environmental via client-side routing; prerender output is not generated for this path.

## Final verification

- [x] MichiganEnvBurdenMap says "Illustrative" (confirmed in dist/assets/MichiganEnvBurdenMap-CPdcfaYw.js)
- [x] PFAS card shows 9 Wayne sites and Romulus Fire Training Area (Romulus Fire confirmed in dist/assets/environmentalData-CHJi_CJd.js and EnvironmentalMethodology-CB285KTT.js)
- [x] TRI section on /county/wayne shows Marathon, US Steel, Ford Rouge, AK Steel, BASF (confirmed in dist/assets/CountyPage)
- [x] ECHO compliance section renders (live or fallback) (confirmed in dist/assets/CountyPage)
- [x] /methodology/environmental route exists (EnvironmentalMethodology-CB285KTT.js in dist/assets)
- [x] public/data/wayne-county-environmental-data-pack.csv exists (3338 bytes)
- [x] All builds pass (built in 11-13s, no errors)
- [x] All tests pass (22 test files, 427 passed, 1 skipped)
- [x] Pushed to main (9c4eb73..8eb0b0b)

## What to show Nina

25-minute demo flow for Planet Detroit meeting:

1. **Wayne County page** (/county/wayne, 5 min): Scroll to Environmental Burden Map (shows "Illustrative pending EJScreen integration" label). Scroll past to EPA TRI section: Marathon (2.85M lbs), US Steel (1.95M lbs), Ford Rouge, AK Steel, BASF. Then EPA Compliance Overview (live ECHO query loading).

2. **PFAS card** (/county/wayne, 3 min): In the Civic Intelligence section, show PFAS Investigation Sites card: "9 PFAS investigation site(s) identified in Wayne County by EGLE. Key site: Romulus Fire Training Area (monitoring)." Tap through to source.

3. **CSV download** (2 min): Open public/data/wayne-county-environmental-data-pack.csv in browser or share directly. Five sections: TRI facilities, PFAS sites, EJScreen ZCTAs, FEMA NRI, energy burden. All with primary source URLs.

4. **Methodology page** (/methodology/environmental, 5 min): Walk through the six sections: currently surfaced, cached pending display, integration in progress, not on roadmap, source citations, quality principles. Show that every dataset on the county page is traceable to a primary source URL.

5. **Air quality** (/environment/air, 5 min): County selector, live ECHO compliance stats, AirNow live AQI.

6. **Key message** (5 min): Every number has a source URL visible in the UI. Synthetic values are labeled "Illustrative." We show data and cite sources; we do not characterize outcomes.
