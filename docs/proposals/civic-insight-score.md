# Proposal: retire the Civic Insight Score

Status: proposal for owner decision, 2026-11-22. Nothing in this document is implemented.

## Recommendation

Retire the score (option A below). Show its inputs side by side with their sources instead.

## Why

Evidence is from the repository at commit `2ef967e`.

1. **Two different formulas share one name.**
   - County brief and downloadable brief (`src/lib/civic-score.ts`): base 60, plus or minus fixed points for uninsured rate (SAHIE 2022), food insecurity (Map the Meal Gap 2022) and county type.
   - Compare Places (`src/pages/ComparePlacesPage.tsx:118`): average of four ACS sub-scores (income, poverty, bachelor's degree, unemployment).
   - The Methodology page documents only the Compare formula. The same county can show two different "Civic Insight Scores" depending on the page.
2. **The brief formula awards points for being urban.** Urban counties get +5, suburban +3, rural 0, independent of any outcome. Computed means across the 83 county profiles: urban 67.5 (6 counties), suburban 74.4 (14), rural 58.4 (63). Part of that gap is the bonus itself.
3. **It has almost no resolution.** The 83 counties take only 10 distinct values; 61 of 83 score exactly 50, 60 or 65. Differences between counties mostly reflect which side of a threshold an input falls on.
4. **No uncertainty.** Two of the three inputs are model-based estimates with published intervals (SAHIE, Map the Meal Gap). The score discards them, so a one-point input difference inside the margin of error can move a county 10 points.
5. **Thresholds and weights have no stated rationale** (5% and 7% uninsured, 11% and 15% food insecurity, the 80,000 income cap, the multipliers 4, 2.5 and 8).
6. **It has already drifted once.** Until this PR the breakdown panel and the export described a third model that did not match either formula.

A reviewer who checks one county on two pages will find the mismatch in under a minute. A single number invites ranking, and this number cannot support ranking.

## Options

| Option | What changes | Cost | Risk |
|---|---|---|---|
| **A. Retire (recommended)** | Remove the gauge from the brief, the export and Compare. Keep the inputs as labeled stats with source, period and interval where published. Remove the Methodology paragraph; add a changelog note. | About half a day. Touches `BriefPage`, `DownloadLocalInsights`, `ComparePlacesPage`, `CivicInsightGauge`, `CivicScoreBreakdown`, `routeMeta`, `MethodologyPage`, tests. | Loses a visual hook. Any external link or partner material that cites the score needs a note. |
| **B. Keep one, rename both** | Keep the ACS formula only, rename it "ACS socioeconomic index (AccessMI)", drop the brief formula, show the four sub-scores first and the average second, add "not for ranking" and input MOEs. | About one day. | Still an unvalidated composite; the weight and cap choices remain arbitrary. |
| **C. Keep both, disambiguate** | Rename to "Coverage and food access score" (brief) and "ACS socioeconomic index" (Compare); remove the county-type bonus; document both. | About half a day. | Two composites to maintain; least defensible. |

## If the score is kept in any form

- One formula, one name, one implementation imported everywhere, with a test that pages cannot define their own.
- No points for county type.
- Carry input uncertainty through, or state plainly that the score has none and must not be used to rank.
- Publish the rationale for every threshold and weight, or replace thresholds with a continuous scale.

## Decision needed

Choose A, B or C. Until then the score stays as it is, labeled MODELED, with the breakdown now matching the brief formula.
