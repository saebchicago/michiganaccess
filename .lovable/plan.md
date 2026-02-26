
# Access Michigan: Cross-Domain Civic Intelligence Upgrade

## Overview
Transform every Place page into a complete cross-domain civic intelligence profile with 10+ indicators across Health, Housing, Energy, Environment, Transportation, Safety, Education, Food, Workforce, and Benefits -- all powered by static curated data (no Socrata/Michigan Open Data), with full provenance, sort transparency on Find Care, dark mode contrast fixes, and comprehensive QA validation.

## Architecture Summary

```text
src/
├── data/
│   └── cross-domain-indicators.ts    [NEW] Static curated data for all 83 counties
│   └── domain-actions.ts             [NEW] "What you can do" actions per domain
├── models/
│   └── Place.ts                      [EDIT] Expand PlaceIndicator to 10 domains + add domain actions type
├── components/
│   └── place/
│       └── LocalInsightEngine.tsx    [EDIT] Render 10 domains, add "What you can do" panels + Sources table
│       └── DomainJumpNav.tsx         [EDIT] Add all 10 domain anchors
│   └── shared/
│       └── SourcesTable.tsx          [NEW] Reusable sources/methodology panel
├── pages/
│   └── PlacePage.tsx                 [EDIT] Minor: integrate expanded engine
│   └── FindCarePage.tsx              [EDIT] Add sort transparency dropdown
├── index.css                         [EDIT] Dark mode contrast fixes for gold/coral
```

---

## Phase 1: Cross-Domain Static Data Layer

### 1A. Create `src/data/cross-domain-indicators.ts`
A single static file containing curated county-level metrics for all 83 counties across 10 domains. Data sourced from publicly available reports (ACS, CHR, USDA, DOE LEAD, FCC, NCES, FBI UCR summaries). Structure:

```typescript
export interface CountyCrossDomain {
  medianIncome: number;        // ACS 5-year
  povertyRate: number;         // ACS
  medianRent: number;          // ACS
  rentBurden: number;          // ACS (% paying >30% income)
  vehicleAccess: number;       // ACS (% with vehicle)
  commuteTime: number;         // ACS avg minutes
  hsGradRate: number;          // NCES/MI DOE
  unemploymentRate: number;    // BLS LAUS
  violentCrimeRate: number;    // FBI UCR / MI State Police (per 100k, 0 if unavailable)
  drinkingWaterCompliance: number; // EPA SDWIS proxy (%)
}
```

Prepopulate for all 83 counties using publicly reported values. Where a metric is genuinely unavailable, use `null` and the UI renders "Metric pending" with resource-only actions.

### 1B. Create `src/data/domain-actions.ts`
Static curated "What you can do" actions per domain with Michigan-specific links:

- **Health**: MI Bridges, Healthy Michigan Plan, Find a Doctor
- **Housing**: MSHDA, MI Legal Aid housing, HUD counseling
- **Energy**: LIHEAP, DTE/Consumers rebates, Weatherization
- **Environment**: EPA MyEnvironment, MI EGLE reports
- **Transportation**: MDOT transit finder, MI Works transportation
- **Safety**: Local 911, FEMA alerts, MI State Police
- **Education**: MI School Data, GreatSchools, Head Start
- **Food**: SNAP, WIC, Feeding America food bank finder
- **Workforce**: MI Works, unemployment filing, job training
- **Benefits**: MI Bridges, 2-1-1, community resources

Each action includes: title, description, href, and independence note where needed.

---

## Phase 2: Expand Place Model & Indicator Builder

### 2A. Edit `src/models/Place.ts`
- Add new domains to `PlaceIndicator.domain`: `"workforce" | "housing" | "justice"`
- Add new function `buildFullIndicators(place: Place): PlaceIndicator[]` that produces 10-12 indicators by merging existing `healthHighlights` with the new `cross-domain-indicators.ts` data
- Each indicator includes: source name, source URL, last-updated year, geographic grain, confidence level, and directionality
- State averages expanded for all new metrics (median income, poverty, rent burden, graduation rate, unemployment, vehicle access, commute time, crime rate, water compliance)
- Estimated/proxy indicators explicitly labeled with methodology note in `grain` field

### 2B. Edit `buildStandouts()` 
- Now considers all 10+ indicators (not just the original 6) for "What stands out" ranking

---

## Phase 3: Upgrade LocalInsightEngine UI

### 3A. Edit `src/components/place/LocalInsightEngine.tsx`
- Replace `buildPlaceIndicators` call with `buildFullIndicators`
- Group indicators visually by domain (Health, Housing, Energy, Environment, etc.) with domain headers
- Add "What you can do" action cards below each domain group (collapsible, 3-6 actions each from `domain-actions.ts`)
- Add a `SourcesTable` component at the bottom showing all sources used on the page

### 3B. Create `src/components/shared/SourcesTable.tsx`
A reusable table showing:
| Source | Dataset | Last Updated | Grain | Methodology |
Populated from indicator metadata. Includes "Report an issue / Suggest a dataset" link.

### 3C. Edit `src/components/place/DomainJumpNav.tsx`
Expand from 4 sections to ~8: Indicators, Health, Housing, Energy, Environment, Programs, Resources, Analysts. Keep the compact pill design.

---

## Phase 4: Find Care Sort Transparency

### 4A. Edit `src/pages/FindCarePage.tsx`
- Add a visible sort dropdown above NPI results: "Sorted by: Relevance | Name | Distance"
- Currently results come from NPI API (no distance calculation without user location), so options are: Relevance (default API order), Name (A-Z)
- The dropdown is always visible when results are shown, styled as a small `Select` with a label badge

---

## Phase 5: Dark Mode WCAG 2.2 AA Contrast Fixes

### 5A. Edit `src/index.css`
- `--warm-gold` in dark mode: bump from `42 80% 62%` to `45 85% 68%` (ensures 4.5:1 on dark bg)
- `--coral` in dark mode: bump from `6 72% 68%` to `8 78% 72%` (ensures 4.5:1 on dark bg)
- Verify `michigan-forest` green in dark mode also meets ratio

---

## Phase 6: QA & Validation

After implementation, browser-test:
1. `/place/wayne-county` -- verify 10+ indicators render with sources
2. `/place/city/detroit` -- verify fallback notice + all domain actions
3. `/place/zip/48201` -- verify fallback + "County Avg" label
4. `/find-care` -- verify sort dropdown visible on results
5. Dark mode -- verify gold/coral badges readable
6. Footer -- verify Report Issue still works
7. Domain jump nav -- verify all 8 sections scroll correctly
8. Sources table -- verify every indicator row has source + updated + grain
9. "What stands out" -- verify top 3 deltas calculated across all domains
10. Independence disclaimer visible on all place page types

---

## Files Changed (Summary)

| File | Action | Purpose |
|------|--------|---------|
| `src/data/cross-domain-indicators.ts` | CREATE | Static county metrics for 10 domains |
| `src/data/domain-actions.ts` | CREATE | "What you can do" curated actions |
| `src/models/Place.ts` | EDIT | Add `buildFullIndicators`, expand domains/state avgs |
| `src/components/place/LocalInsightEngine.tsx` | EDIT | Render 10 domains + actions + sources |
| `src/components/shared/SourcesTable.tsx` | CREATE | Reusable provenance table |
| `src/components/place/DomainJumpNav.tsx` | EDIT | Expand to 8 domain sections |
| `src/pages/FindCarePage.tsx` | EDIT | Add sort transparency dropdown |
| `src/index.css` | EDIT | Dark mode contrast fixes |

**Estimated: 8 files (3 new, 5 edits). No new dependencies. No Socrata/Michigan Open Data. No regressions to existing routes.**
