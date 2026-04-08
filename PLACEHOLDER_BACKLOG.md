# Placeholder Backlog — next week's work
Items from PLACEHOLDER_AUDIT.md deferred out of the pre-demo sprint. Grouped by effort level.

---

## Off demo-path stubs (low urgency)

| File:Line | Category | Issue | Suggested fix |
|-----------|----------|-------|---------------|
| `src/pages/DeepMapPage.tsx:177` | Dead handler | ZIP search button `onClick={() => { /* future: fly to ZIP */ }}` does nothing | Implement Leaflet `flyTo` using ZIP centroid lookup, or remove the search bar |
| `src/components/brief/UtilityStressSection.tsx:52` | Content stub | `"Example only — utility stress data integration coming soon"` badge shown for most counties | Integrate MPSC disconnection data or suppress section until data is available |
| `src/components/place/CommunitySummary.tsx:106` | Content stub | `"Trend data coming soon"` string in trend indicator row | Remove row or wire to existing trend data |
| `src/pages/CompareZipsPage.tsx:519` | Feature stub | `"CSV and JSON exports coming soon."` text | Implement export or remove the mention |
| `src/components/learn/DrugPriceLookup.tsx:37–39` | Illustrative pricing | `NADAC_TIERS` hardcoded lookup with code comment `(illustrative)` but no visible UI label | Add "Illustrative" badge near price output, or integrate real NADAC API |
| `src/pages/ZipPlacePage.tsx:71` | Data gap notice | "Census ZCTA-level data for this metric is not yet published…" | Acceptable; revisit when ZCTA data is available |

---

## Illustrative data — already labeled, revisit before partner launch

| File:Line | Category | Issue | Suggested fix |
|-----------|----------|-------|---------------|
| `src/pages/FollowMoneyPage.tsx:64` | Illustrative aggregate | "Illustrative aggregate. Full data at mitn.michigan.gov" | Direct-source from MiTN API when bandwidth allows |
| `src/pages/EnergyDeepDivePage.tsx:109` | Illustrative chart | "Illustrative — based on ACEEE LEAD Tool county-level estimates" | Source from real ACEEE LEAD Tool API or MPSC |
| `src/pages/DetectionGapPage.tsx:43–45` | Illustrative benchmarks | NACHC/AHIMA/RWJF sources flagged `(illustrative)` | Replace with primary source data when available |
| `src/pages/ZipScorecardPage.tsx:636,965` | Illustrative composite | Federal dependency score labeled "Illustrative composite" | Source directly from USASpending.gov API |
| `src/pages/ComparePlacesPage.tsx:60,84` | Simulated data | Community voice + insurance breakdown arrays (disclaimer added to UI in this sprint) | Replace with real MPSC / CMS data feeds |

---

## P2 dev artifacts (benign, no user impact)

| File:Line | Category | Issue |
|-----------|----------|-------|
| `src/pages/ZipFinderPage.tsx:35` | Code stub | `getter: () => null` — CDC PLACES async pending; metric shows `—` |
| `src/pages/MethodologyPage.tsx:789` | Future feature | "This feature is not yet implemented" (privacy architecture section) |
| `src/pages/CountyPage.tsx:324` | Appropriate empty state | "Uninsured trend data is not yet available for this county" — legitimate data gap |
| `src/pages/BriefPage.tsx:359,400` | Appropriate empty states | "not yet available for this county" — legitimate data gap |
| `src/components/pillars/PillarInsightCard.tsx:90` | Appropriate empty state | `DataUnavailable` component — legitimate |
| `src/components/pillars/DatasetExplorer.tsx:99–101` | Appropriate empty state | "Data Not Yet Available" — legitimate |
| `src/pages/ContactPage.tsx:41`, `FeedbackPage.tsx:105`, `PartnershipPage.tsx:53`, `NotFound.tsx:18` | Dev artifact | `console.error` in catch blocks — appropriate error logging |
