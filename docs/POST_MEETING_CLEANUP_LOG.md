# Post-Meeting Cleanup Log
**Session:** 2026-04-10 (after Planet Detroit partner meeting)

---

## Phase Summary

| Phase | Status | Commit |
|-------|--------|--------|
| Phase 0: Reconnaissance | Ran (no commit) | — |
| Phase 1: Replace synthetic env burden data with real EJScreen v2.3 | Ran | c98cc4c |
| Phase 2: StoryPage civic framing fix | Skipped (already applied) | — |
| Phase 3: Site-wide JSON-LD datePublished/dateModified/keywords | Ran | 9fa3314 |
| Phase 4: Add /methodology/environmental to prerender routes | Ran | 7a9dc68 |
| Phase 5: SnapMichiganPage missing path prop | Skipped (already present) | — |
| Phase 6: Surface V2/V3 features on county pages | Ran | 95091e4 |
| Phase 7: Final verification and push | Ran | — |

---

## Phase 1 Details

**Counties with real EJScreen v2.3 data: 11 of 83**

| County | FIPS | Representative ZCTA | EJ Index |
|--------|------|---------------------|----------|
| Wayne | 26163 | 48201 (Detroit core) | 82 |
| Genesee | 26049 | 48502 (Flint) | 85 |
| Saginaw | 26145 | 48601 | 76 |
| Kent | 26081 | 49503 (Grand Rapids) | 71 |
| Kalamazoo | 26077 | 49001 | 70 |
| Oakland | 26125 | 48075 (Southfield) | 52 |
| Macomb | 26099 | 48310 (Sterling Heights) | 34 |
| Luce | 26095 | 49853 | 35 |
| Marquette | 26103 | 49855 | 32 |
| Washtenaw | 26161 | 48104 (Ann Arbor) | 28 |
| Grand Traverse | 26055 | 49684 (Traverse City) | 22 |

**Counties without data: 72 of 83** — display neutral gray (#E5E7EB) with "no data" legend entry.
Clicking a no-data county shows: "Sub-county EJScreen data not yet available for [County] County. Statewide data integration in progress."

---

## Phase 2: Banned-phrase occurrences for human review

The StoryPage change ("Free. Open. For every Michigander." → "Independent Michigan civic intelligence...") was already applied in a prior session. No commit needed.

The following occurrences of banned marketing-claim patterns were found across pages and components. **These are NOT fixed** — flagged for human review only.

### `/\bfree\b/i` occurrences (selected; see grep for full list)

- `InsuranceAppealsPage.tsx:67` — "Access Michigan gives you free tools"
- `InsuranceAppealsPage.tsx:83` — "No personal health information stored · No account required · 100% free"
- `DataAndInsightsPage.tsx:134` — `<Badge variant="outline">Free & Open</Badge>`
- `FindCarePage.tsx:90,339` — "all across Michigan. Free. Private. No account needed."
- `TermsPage.tsx:45` — "Access Michigan is a free, non-commercial civic resource"
- `SiteReportPage.tsx:115` — "providing free, transparent access to healthcare facility data"
- `ImpactDashboardPage.tsx:34` — "Finds free clinics, sliding-scale providers... no account required."
- `SupportPage.tsx:48` — "Help Keep Civic Resources Free"
- `ExecutiveSummaryPage.tsx:111` — "Free & no login required" in badge array
- `CountyPage.tsx:559` — "Access Michigan does not collect personal data. All information shown is from public sources. No cookies or tracking."

### `/no tracking/i` occurrences

- `MethodologyPage.tsx:723` — "No ads, no tracking, no pay-to-play listings."
- `AboutPage.tsx:605` — same
- `FeedbackPage.tsx:377` — "No personal data is collected unless you opt in above. No cookies, no tracking."
- `ContactPage.tsx:123` — "No cookies, no tracking."
- `CompareZipsPage.tsx:292` — "No ads. No tracking. No made-up numbers."
- `ExecutiveSummaryPage.tsx:56` — "Privacy-first: no accounts, no cookies, no tracking, no ads"
- `TechnicalPage.tsx:66` — "No cookies, no tracking, privacy-first analytics"
- `PrivacyPage.tsx:65` — "No tracking cookies" (in the privacy policy — likely appropriate)
- `TrustPanel.tsx:13` — "No account. No tracking."
- `SystemsExplainer.tsx:60` — "No ads · No data selling · No hidden agendas"
- `PublicTrustBar.tsx:15` — "No tracking or ads"
- `FounderSupportSection.tsx:17,25` — "no ads, no tracking, no paywalls, ever."
- `ReferralToolkit.tsx:134` — "No cookies · No tracking · No personal data collected"
- `PartnershipOnePager.tsx:117` — "No Cookies", "No Ads" badge array

### `/no ads/i` occurrences
Many of the same files as above. Most are in trust/value-proposition UI components.

**Recommendation for human review:** The TermsPage and PrivacyPage uses ("free, non-commercial", "No tracking cookies") are likely appropriate in context. The marketing-claim uses in landing-page components (TrustPanel, SystemsExplainer, ExecutiveSummaryPage, FindCarePage) should be reviewed against the no-marketing-language rule and either removed, reworded as factual statements, or explicitly exempted.

---

## Phase 5: SnapMichiganPage path prop

`SnapMichiganPage.tsx` already has `path: "/data/snap-michigan"` in its `usePageMeta` call (line 107). No change required.

---

## Build and test results

- `npx vite build`: passed clean (all 4 phases)
- `npx vitest run`: 427 passed, 1 skipped — no failures

---

## Push

All 4 commits pushed to `main` after Phase 7 verification.
