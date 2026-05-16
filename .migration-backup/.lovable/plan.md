
# Access Michigan: Census-Scale Civic Intelligence Roadmap

## Audit Summary (Feb 2026)

### Current Strengths
- ✅ 83 county Place pages with 10-domain cross-domain indicators
- ✅ Life Situation nav, Community Summary, Sources Table — all rendering
- ✅ Mobile responsive (390px tested), dark mode + high contrast pass WCAG 2.2 AA
- ✅ Navigation dropdowns, breadcrumbs, search (⌘K) all functional
- ✅ 700+ community resources, Find Care (NPI), Energy Assistance, FOIA builder
- ✅ Real-time feeds: NWS alerts, utility outages, GTFS-RT transit

### Issues Found
1. **forwardRef warnings** in Header components (DesktopSearchTrigger, SiteSearch, CountySelector) — cosmetic React warnings, non-breaking
2. **Static data only** — cross-domain indicators are hand-curated for 83 counties, not live API
3. **No Census API** — no ACS table integration for demographic, economic, housing breakdowns
4. **No place comparison tool** — can't compare ZIP-to-ZIP or county-to-county side-by-side
5. **No narrative profiles** — no auto-generated Census Reporter-style storytelling summaries
6. **Limited granularity** — no census tract or neighborhood-level data
7. **No community contributions** — no user ratings, crowdsourced resources, or forums
8. **No embeddable charts** — share/embed limited to iframes, no interactive chart exports

---

## Architecture: Live Census API Integration

```text
supabase/functions/
  └── census-acs-proxy/index.ts     [NEW] Edge function proxying Census Bureau API
src/
  ├── hooks/
  │   └── useCensusACS.ts           [NEW] React hook for ACS table queries
  ├── data/
  │   └── census-tables.ts          [NEW] ACS table catalog (B19013, B25064, etc.)
  │   └── census-geographies.ts     [NEW] Michigan FIPS codes (counties, tracts, places)
  ├── components/
  │   └── census/
  │       └── ACSIndicatorCard.tsx   [NEW] Dynamic indicator card from live ACS data
  │       └── PlaceNarrative.tsx     [NEW] Auto-generated narrative profile
  │       └── PlaceComparison.tsx    [NEW] Side-by-side place comparison tool
  │       └── DemographicBreakdown.tsx [NEW] Race/age/income pyramid charts
  │       └── CensusTableBrowser.tsx [NEW] Searchable ACS table explorer
  │       └── CensusChartEmbed.tsx   [NEW] Embeddable/exportable chart component
  ├── pages/
  │   └── PlacePage.tsx             [EDIT] Integrate ACS data tabs
  │   └── DataExplorerPage.tsx      [NEW] PolicyMap-style interactive data explorer
  │   └── CompareplacesPage.tsx     [NEW] Compare places side-by-side
```

---

## Phase 1: Census Bureau API Foundation (Priority: HIGHEST)

### 1A. Create `supabase/functions/census-acs-proxy/index.ts`
Edge function that proxies requests to `https://api.census.gov/data/{year}/acs/acs5`:
- Accepts: `{ tables: string[], geography: string, year?: number }`
- Geography types: state, county, place (city), tract, ZIP (ZCTA)
- Returns normalized JSON with variable labels resolved
- Caches responses in-memory (60 min TTL) to reduce API load
- Census API is **free, no key required** for basic queries (key optional for higher rate limits)
- Rate limited to 500 queries/day initially

**Key ACS Tables to integrate first:**
| Table | Topic | Variables |
|-------|-------|-----------|
| B19013 | Median Household Income | B19013_001E |
| B17001 | Poverty Status | B17001_001E, B17001_002E |
| B25064 | Median Gross Rent | B25064_001E |
| B25070 | Rent Burden (>30% income) | B25070_007E-010E |
| B08301 | Commute Mode | B08301_001E-021E |
| B15003 | Educational Attainment | B15003_001E-025E |
| B27001 | Health Insurance Coverage | B27001_001E-057E |
| B01001 | Age & Sex | B01001_001E-049E |
| B02001 | Race | B02001_001E-010E |
| B03003 | Hispanic/Latino Origin | B03003_001E-003E |
| B25001 | Housing Units | B25001_001E |
| B25003 | Tenure (Own vs Rent) | B25003_001E-003E |
| B23025 | Employment Status | B23025_001E-007E |
| B16001 | Language Spoken at Home | B16001_001E-036E |
| DP05 | Demographic Profile | DP05_0001E-0089E |

### 1B. Create `src/hooks/useCensusACS.ts`
```typescript
interface UseCensusACSOptions {
  tables: string[];           // e.g., ["B19013", "B17001"]
  geoType: "county" | "place" | "tract" | "zcta" | "state";
  geoFips: string;            // e.g., "26163" for Wayne County
  year?: number;              // default: latest available (2023 ACS 5-year)
  enabled?: boolean;
}
interface CensusResult {
  table: string;
  variables: Record<string, { value: number | null; label: string; margin: number | null }>;
}
```
- Uses `@tanstack/react-query` with 24hr stale time
- Calls census-acs-proxy edge function
- Returns typed, labeled results ready for UI

### 1C. Create `src/data/census-tables.ts`
Catalog of ~50 most-used ACS tables with:
- Human-readable labels
- Variable descriptions
- Unit types (count, percent, dollars, minutes)
- Domain categorization (demographics, economics, housing, education, health, transportation)
- State-level comparison values (pre-computed or fetched)

### 1D. Create `src/data/census-geographies.ts`
Michigan FIPS lookup:
- All 83 counties with FIPS codes (26001-26165)
- Major cities/places with Census PLACE codes
- ZIP-to-ZCTA mapping
- Census tract listings for top 10 counties (Wayne, Oakland, Macomb, Kent, etc.)

---

## Phase 2: Place Page ACS Integration

### 2A. Create `src/components/census/ACSIndicatorCard.tsx`
Dynamic indicator card that:
- Fetches a single ACS variable via useCensusACS
- Displays value with confidence interval (margin of error)
- Shows comparison to state average (auto-fetched)
- Includes "Data from {year} ACS 5-Year Estimates" provenance
- Supports sparkline trend if multi-year data available

### 2B. Create `src/components/census/DemographicBreakdown.tsx`
Interactive demographic visualization:
- Race/ethnicity horizontal bar chart (B02001 + B03003)
- Age pyramid (B01001)
- Income distribution histogram (B19001)
- Educational attainment stacked bar (B15003)
- Language diversity treemap (B16001)
All using Recharts, themed with design system tokens.

### 2C. Create `src/components/census/PlaceNarrative.tsx`
Auto-generated Census Reporter-style narrative:
- Uses Lovable AI (gemini-3-flash-preview) to generate 3-4 paragraph summary
- Input: structured ACS data for the place
- Output: plain-language narrative covering demographics, economics, housing, education
- Cached per place (24hr) to minimize AI calls
- Includes "AI-generated summary" badge with methodology link
- Example: "Wayne County is home to 1.8 million residents, making it Michigan's most populous county. The median household income is $47,500, about 15% below the state average..."

### 2D. Edit `src/pages/PlacePage.tsx`
Add new tabs/sections:
- **Demographics** tab: DemographicBreakdown + narrative
- **Economics** tab: Income, poverty, employment ACS cards
- **Housing** tab: Rent burden, tenure, housing units
- **Education** tab: Attainment levels, school enrollment
- Keep existing domain indicators as "Community Indicators" tab
- Census data sections clearly labeled "Source: U.S. Census Bureau ACS 5-Year Estimates"

---

## Phase 3: Data Explorer (PolicyMap-style)

### 3A. Create `src/pages/DataExplorerPage.tsx`
Interactive data exploration workspace:
- **Topic Browser**: Sidebar with categorized ACS tables (Demographics, Economics, Housing, etc.)
- **Geography Selector**: County picker, city search, ZIP entry, tract selector
- **Visualization Panel**: Auto-generated chart based on selected table + geography
- **Comparison Mode**: Add multiple geographies to compare
- **Export**: CSV download, chart PNG export, embed code generator
- **Search**: Keyword search across all ACS table labels

### 3B. Create `src/components/census/CensusTableBrowser.tsx`
Searchable catalog of available Census tables:
- Grouped by domain
- Shows variable count, description, and sample value
- Click to add to current analysis
- "Popular tables" section for common queries

### 3C. Create `src/components/census/CensusChartEmbed.tsx`
Embeddable chart component:
- Generates standalone iframe embed code
- Supports: bar, line, pie, choropleth, comparison
- Responsive, themed, with provenance footer
- Shareable via URL parameters

---

## Phase 4: Place Comparison Tool

### 4A. Create `src/pages/ComparePlacesPage.tsx`
Side-by-side comparison:
- Select 2-4 geographies (counties, cities, ZIPs)
- Auto-fetch same ACS tables for each
- Render comparison table with highlighted differences
- Spider/radar chart for multi-metric comparison
- "Winner" badges for each metric (higher/lower-is-better)
- Shareable comparison URL

---

## Phase 5: Community Contributions

### 5A. Resource Ratings & Reviews
- Add `resource_ratings` table (resource_id, rating 1-5, comment, created_at)
- Anonymous INSERT-only RLS (like existing submissions)
- Display aggregate ratings on resource cards
- Moderation queue for flagged reviews

### 5B. Issue Reporting
- Structured form: category (outage, data error, missing resource, pollution)
- Geo-tagged to user's selected county/ZIP
- Stored in `community_reports` table
- Display anonymized report counts on relevant Place pages

### 5C. Community Events Enhancement
- Allow community-submitted events (moderated)
- Calendar view with filtering by county/category
- iCal subscription feed per county

---

## Phase 6: Fix Existing Issues

### 6A. Fix forwardRef warnings
- `DesktopSearchTrigger` in Header.tsx — wrap with React.forwardRef
- `SiteSearch` component — wrap with React.forwardRef
- `CountySelector` component — wrap with React.forwardRef

### 6B. Duplicate route cleanup
- App.tsx has manual routes for `/about`, `/data-and-insights` that duplicate APP_ROUTES entries
- Remove duplicates, let APP_ROUTES be single source of truth

---

## Phase 7: Advanced Features (Future)

### 7A. Census Tract Granularity
- Tract-level ACS data for top 10 counties
- Neighborhood-level heatmaps using tract boundaries
- Tract-to-tract comparison within counties

### 7B. Predictive Modeling
- Use Lovable AI to project subsidy impacts, climate risks
- "What if" scenarios (e.g., "What if rent burden dropped 5%?")

### 7C. Real-time Environmental Data
- Live EPA AirNow integration (already have proxy)
- EGLE water quality compliance tracking
- Pollution source mapping from EPA TRI

### 7D. Embeddable Dashboard Builder
- Drag-and-drop dashboard creation
- Save/share custom dashboards
- White-label embed for partner organizations

---

## Implementation Priority Order

| Priority | Phase | Effort | Impact |
|----------|-------|--------|--------|
| 🔴 P0 | 1A-1D: Census API foundation | 2 sessions | Unlocks all ACS data |
| 🔴 P0 | 2A-2D: Place page ACS tabs | 2 sessions | Core user value |
| 🟡 P1 | 6A-6B: Fix existing issues | 1 session | Code quality |
| 🟡 P1 | 3A-3C: Data Explorer | 3 sessions | Power user value |
| 🟢 P2 | 4A: Place Comparison | 1 session | Engagement |
| 🟢 P2 | 5A-5C: Community contributions | 2 sessions | Community trust |
| 🔵 P3 | 7A-7D: Advanced features | 5+ sessions | Differentiation |

---

## Technical Notes

### Census API Details
- **Base URL**: `https://api.census.gov/data/{year}/acs/acs5`
- **No API key required** for basic use (optional key raises rate limits)
- **Geography format**: `?get=NAME,{vars}&for=county:*&in=state:26` (Michigan = FIPS 26)
- **Available years**: 2009-2023 (5-year estimates)
- **Rate limits**: ~500 queries/day without key, 50k/day with key
- **ZCTA support**: `&for=zip%20code%20tabulation%20area:48201&in=state:26`

### Data Quality Standards
- All ACS values displayed with margin of error (MOE)
- Coefficient of variation (CV) > 40% flagged as "Use with caution"
- Suppressed values (null) shown as "Data withheld for privacy"
- Year and estimate type (1-year vs 5-year) always displayed

### No New Dependencies Required
- Recharts (already installed) for all visualizations
- @tanstack/react-query (already installed) for caching
- Lovable AI (already configured) for narrative generation
- Supabase Edge Functions (already in use) for API proxying

---

## Files Changed Summary

| File | Action | Purpose |
|------|--------|---------|
| `supabase/functions/census-acs-proxy/index.ts` | CREATE | Census Bureau API proxy |
| `src/hooks/useCensusACS.ts` | CREATE | React hook for ACS queries |
| `src/data/census-tables.ts` | CREATE | ACS table catalog |
| `src/data/census-geographies.ts` | CREATE | Michigan FIPS lookup |
| `src/components/census/ACSIndicatorCard.tsx` | CREATE | Dynamic ACS indicator card |
| `src/components/census/DemographicBreakdown.tsx` | CREATE | Demographic visualizations |
| `src/components/census/PlaceNarrative.tsx` | CREATE | AI-generated place narrative |
| `src/components/census/PlaceComparison.tsx` | CREATE | Side-by-side comparison |
| `src/components/census/CensusTableBrowser.tsx` | CREATE | Searchable table catalog |
| `src/components/census/CensusChartEmbed.tsx` | CREATE | Embeddable chart component |
| `src/pages/PlacePage.tsx` | EDIT | Add Census tabs |
| `src/pages/DataExplorerPage.tsx` | CREATE | Data exploration workspace |
| `src/pages/ComparePlacesPage.tsx` | CREATE | Place comparison tool |
| `src/components/layout/Header.tsx` | EDIT | Fix forwardRef warnings |
| `src/components/shared/SiteSearch.tsx` | EDIT | Fix forwardRef warning |
| `src/components/shared/CountySelector.tsx` | EDIT | Fix forwardRef warning |
| `src/App.tsx` | EDIT | Remove duplicate routes |
| `src/config/routes.ts` | EDIT | Add new page routes |

**Estimated: 18 files (13 new, 5 edits). No new dependencies.**
