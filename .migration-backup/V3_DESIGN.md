# V3 Design Document — SNAP at Risk: Michigan Food Assistance Under P.L. 119-21

Produced: 2026-04-09
Status: Phase 1 complete — awaiting human review before Phase 2 build
Branch target: sequential feature branches off `main`

---

## Principles (inherited from V2, applied here)

1. **Civic neutrality is non-negotiable.** Show what P.L. 119-21 is and what credible sources project. Never editorialize.
2. **Every number traces to a primary source visible on the same screen.** Use the `DataProvenance` named export for every metric.
3. **Every projected or modeled number is labeled with `DataProvenance dataKind="projected"` or `"modeled"`**, never displayed without an `asOfDate` and a `methodologyUrl`.
4. **Page-level `<ProvenanceDisclaimer />` above the fold** on every V3 dashboard route.
5. **All API calls route through Supabase Edge Functions.** No direct browser-to-agency calls.
6. **Components never show a broken state.** Fallback data required for every fetch.

### Banned display patterns
- Individual household benefit amounts (any context)
- Names or addresses of SNAP recipients
- Single-point county loss estimates without uncertainty band
- "3–4 million" (House bill figure — use CBO enacted: **2.4 million/month**)
- "$290B" or "$295B" (House bill figures — use CBO enacted: **$186.7B over FY2025–2034**)
- The word "vulnerable" without the underlying data point visible

---

## Enacted law baseline (P.L. 119-21, signed July 4, 2025)

| Claim | Source | Use in UI |
|---|---|---|
| SNAP participation loss: **2.4M/month** on average over FY2025–2034 | CBO pub. 61367-SNAP.pdf, August 2025 | Hero stat, labeled `(Projected)` |
| Federal spending reduction: **$186.7B** over FY2025–2034 | CBO pub. 61570, enacted-law score | Context footnote only, not a hero stat |
| Michigan adults at risk: **74,000** | MLPP, November 2025, sourced from CBO/CBPP/FNS | Hero stat, labeled `(Projected)` |
| Michigan households at risk: **123,000 total people** | MLPP, November 2025 | Secondary stat, labeled `(Projected)` |
| New annual Michigan state costs: **$410M** ($90M admin + $320M cost-sharing) | MLPP, November 2025 | Context section |
| Michigan SNAP recipients: **~1.4M** | USDA FNS state tables, most current month | Measured, headline stat |
| Michigan SNAP retailers: **9,200+** | USDA SNAP Retailer CSV, Dec 2025 | Measured, supporting stat |

---

## Supabase schema additions

```sql
-- Monthly Michigan county SNAP enrollment (from MDHHS Green Book extraction)
CREATE TABLE snap_county_monthly (
  id          BIGSERIAL PRIMARY KEY,
  county_fips TEXT        NOT NULL,
  county_name TEXT        NOT NULL,
  report_month DATE       NOT NULL,              -- first of the month
  cases_open  INTEGER,
  persons     INTEGER     NOT NULL,
  avg_benefit_cents INTEGER,                     -- store as cents, display as dollars
  source      TEXT        NOT NULL DEFAULT 'MDHHS Green Book',
  extracted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  validated   BOOLEAN     NOT NULL DEFAULT false, -- true after FNS consistency check
  UNIQUE (county_fips, report_month)
);

-- Annual county SNAP enrollment (USDA FNS annual Excel, FY2022 most recent)
CREATE TABLE snap_county_annual (
  id              BIGSERIAL PRIMARY KEY,
  county_fips     TEXT        NOT NULL,
  county_name     TEXT        NOT NULL,
  fiscal_year     INTEGER     NOT NULL,
  persons         INTEGER     NOT NULL,
  households      INTEGER,
  avg_monthly_benefit_cents INTEGER,
  total_issuance_cents      BIGINT,
  source          TEXT        NOT NULL DEFAULT 'USDA FNS Annual County Table',
  ingested_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (county_fips, fiscal_year)
);

-- SNAP retailer counts by county (derived from USDA Retailer CSV)
CREATE TABLE snap_retailers_by_county (
  county_fips      TEXT    NOT NULL,
  county_name      TEXT    NOT NULL,
  retailer_count   INTEGER NOT NULL,
  as_of_date       DATE    NOT NULL,
  source           TEXT    NOT NULL DEFAULT 'USDA SNAP Retailer Locator',
  PRIMARY KEY (county_fips, as_of_date)
);

-- County food insecurity (Feeding America Map the Meal Gap, annual)
CREATE TABLE food_insecurity_county (
  county_fips          TEXT    NOT NULL,
  county_name          TEXT    NOT NULL,
  reference_year       INTEGER NOT NULL,
  food_insecurity_rate NUMERIC(5,2),          -- percent
  child_insecurity_rate NUMERIC(5,2),
  meal_gap             BIGINT,               -- total meals needed
  avg_meal_cost_cents  INTEGER,
  food_budget_shortfall_cents INTEGER,       -- per food-insecure person/year
  source               TEXT    NOT NULL DEFAULT 'Feeding America Map the Meal Gap',
  PRIMARY KEY (county_fips, reference_year)
);

-- Dual-enrollment exposure (modeled, B22002 + B27010 + 56-62% national rate band)
CREATE TABLE dual_enrollment_exposure (
  county_fips               TEXT    NOT NULL,
  county_name               TEXT    NOT NULL,
  acs_reference_year        INTEGER NOT NULL,
  snap_households_acs       INTEGER,          -- from B22002
  snap_persons_proxy        INTEGER,          -- snap_households * avg_hh_size
  medicaid_persons_acs      INTEGER,          -- from B27010
  dual_low_estimate         INTEGER,          -- snap_persons_proxy * 0.56
  dual_high_estimate        INTEGER,          -- snap_persons_proxy * 0.62
  methodology_version       TEXT    NOT NULL DEFAULT 'v1',
  computed_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (county_fips, acs_reference_year)
);
```

---

## Edge functions

### Existing (V2) — no changes
- `acs-medicaid-county` — ACS B27010; used by V3 Feature 3 as-is

### New for V3

#### `usda-snap-county`
- **Trigger**: scheduled monthly; also callable ad hoc
- **Source**: USDA FNS annual county Excel (Azure CDN); USDA FNS state monthly tables
- **Action**: downloads latest available county Excel, parses Michigan rows, upserts `snap_county_annual`; also fetches state monthly totals and writes to a `snap_state_monthly` table
- **Fallback**: last successful `snap_county_annual` rows (stale-while-revalidate pattern)
- **Validation**: reject rows where `persons < 0` or `county_fips` not in Michigan FIPS list

#### `usda-snap-retailers`
- **Trigger**: scheduled quarterly
- **Source**: USDA SNAP Retailer Locator CSV (Data.gov / ArcGIS Hub)
- **Action**: downloads Michigan subset of retailer CSV, aggregates to county by FIPS (from ZIP lookup or lat/lon geocode), upserts `snap_retailers_by_county`
- **Fallback**: last successful quarterly snapshot

#### `feeding-america-snap`
- **Trigger**: scheduled annually (May); also callable ad hoc
- **Source**: Feeding America Map the Meal Gap county data file (received via form request; stored in Supabase Storage)
- **Action**: reads file from Supabase Storage bucket `feeding-america-data`, parses Michigan counties, upserts `food_insecurity_county`
- **Fallback**: prior year's rows
- **Note**: The Feeding America CSV is not directly downloadable; it is received via form request and must be manually uploaded to Supabase Storage before this function can run. The function fails gracefully if the bucket file is absent and serves the prior year.

#### `mdhhs-green-book-extractor` *(spec only — do not build in Phase 2)*
- **Trigger**: scheduled monthly (~15th of each month); also callable ad hoc
- **Source**: MDHHS Green Book PDF, michigan.gov/mdhhs/inside-mdhhs/reports-stats/green-book (new PDF published monthly)
- **Language**: Node.js with `pdf-parse` (or Python with `pdfplumber` if Supabase Deno runtime limitations require a separate Cloud Function)
- **Action**:
  1. Fetch the most recent Green Book PDF from the MDHHS URL
  2. Extract text layer; locate the "Food Assistance Program" county table (page ~4–6 depending on month)
  3. Parse 83-row table: county name, cases open, persons receiving benefits, avg benefit amount
  4. Normalize county names to standard Michigan FIPS codes using a static lookup table
  5. Upsert to `snap_county_monthly` with `validated = false`
  6. Run consistency check: compare state total from extracted PDF against USDA FNS state monthly total for the same period (within ±2% tolerance)
  7. Set `validated = true` if within tolerance; flag for manual review if outside tolerance
  8. Emit a Supabase Realtime event on validation failure for admin monitoring
- **Fallback**: serve most recent `validated = true` row per county if current month extraction fails
- **Error surface**: admin-only endpoint `/api/admin/green-book-status` shows extraction status and validation result per county per month
- **Reusability note**: This function establishes the PDF extraction pattern for all future MDHHS PDF sources (Medicaid enrollment reports, TANF, child care subsidy). The county FIPS normalization lookup table and validation check pattern should be extracted into a shared utility module.
- **Why this matters**: The MDHHS Green Book is the only source providing monthly Michigan county SNAP enrollment with a ~6-week lag vs. USDA's ~12-month annual lag. Without extraction infrastructure, V3 county dashboards would display year-old data. The extractor closes this gap.

#### `acs-snap-county` *(new, separate from existing acs-medicaid-county)*
- **Trigger**: scheduled annually (December, after ACS 5-year release)
- **Source**: Census ACS 5-year B22002 via Census API
- **Action**: fetches B22002 for all Michigan counties (FIPS `26xxx`), upserts `snap_county_annual` with ACS fields as supplementary columns; also fetches B22002 and B27010 together to compute `dual_enrollment_exposure` rows
- **Note**: B22002 measures SNAP-receiving *households*; multiply by county average household size (from B25010 or B11001) for a persons proxy. Always surface both the households number and the derived persons estimate with margins of error.

---

## Feature 1 — SNAP County Dashboard

### Purpose
Give any Michigan resident, journalist, or institutional partner a single-screen view of SNAP enrollment and food access by county, updated as frequently as public data allows.

### Route
- `/data/snap-michigan` — statewide table with all 83 counties, sortable
- County page extension: new "Food Assistance" collapsible section on `/county/:fips` (collapsed by default; expands inline without navigation)

### Data sources

| Metric | Source | Edge function | Lag | DataKind |
|---|---|---|---|---|
| Current SNAP enrollment (county) | USDA FNS Annual County Excel (FY2022) | `usda-snap-county` | ~1 year | `measured` |
| Current SNAP enrollment (monthly, MI statewide) | USDA FNS state monthly table | `usda-snap-county` | ~2 months | `measured` |
| County monthly enrollment (when available) | MDHHS Green Book PDF extraction | `mdhhs-green-book-extractor` | ~6 weeks | `measured` |
| Authorized retailer count | USDA SNAP Retailer CSV | `usda-snap-retailers` | Quarterly | `measured` |
| Food insecurity rate | Feeding America Map the Meal Gap 2023 | `feeding-america-snap` | Annual (~2yr lag) | `measured` |
| Meal gap (total meals needed) | Feeding America Map the Meal Gap 2023 | `feeding-america-snap` | Annual | `measured` |

### `DataProvenance` props per metric

**SNAP enrollment (county, FNS annual):**
```tsx
<DataProvenance
  sourceName="USDA FNS SNAP Data Tables"
  sourceUrl="https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap"
  asOfDate="FY2022 (most recent annual)"
  cadence="Annual"
  dataKind="measured"
/>
```

**SNAP enrollment (statewide monthly):**
```tsx
<DataProvenance
  sourceName="USDA FNS SNAP Data Tables"
  sourceUrl="https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap"
  asOfDate="{current month – 2}"
  cadence="Monthly"
  dataKind="measured"
/>
```

**SNAP enrollment (county monthly, MDHHS):**
```tsx
<DataProvenance
  sourceName="MDHHS Food Assistance Program Green Book"
  sourceUrl="https://www.michigan.gov/mdhhs/inside-mdhhs/reports-stats/green-book"
  asOfDate="{report_month from snap_county_monthly}"
  cadence="Monthly"
  dataKind="measured"
/>
```

**Retailer count:**
```tsx
<DataProvenance
  sourceName="USDA SNAP Retailer Locator"
  sourceUrl="https://www.fns.usda.gov/snap/retailer-locator/data"
  asOfDate="Dec 31, 2025"
  cadence="Quarterly"
  dataKind="measured"
/>
```

**Food insecurity rate:**
```tsx
<DataProvenance
  sourceName="Feeding America Map the Meal Gap"
  sourceUrl="https://www.feedingamerica.org/research/map-the-meal-gap/by-county"
  asOfDate="2023 (published May 2025)"
  cadence="Annual"
  dataKind="measured"
/>
```

### Page disclaimer block
```tsx
<ProvenanceDisclaimer />
// Plus this addition immediately below it:
<p className="text-[11px] text-muted-foreground mt-1">
  SNAP enrollment: county-level data is annual from USDA FNS (most recent: FY2022).
  Statewide monthly totals are current within ~2 months. Where county monthly data
  is available from MDHHS extraction, it is labeled separately with its report date.
  Food insecurity estimates are 2023 data (Feeding America, published May 2025).
</p>
```

### Primary visual
Sortable data table at `/data/snap-michigan`:

| County | SNAP Persons | Retailer Count | Food Insecurity Rate | Meal Gap |
|---|---|---|---|---|
| Wayne | 287,xxx | xxx | xx.x% | x,xxx,xxx meals |
| Kent | ... | ... | ... | ... |

Each row links to `/county/:fips` county page. Column headers link to source. Table shows `DataProvenance` in the footer row.

County page section (collapsed by default, labeled "Food Assistance"):
- Stat cards: SNAP enrollment (FNS), avg monthly benefit, retailer count, food insecurity rate
- Each card uses `DataProvenance compact={true}` beneath the number
- "View statewide table" link → `/data/snap-michigan`

### Food Access Research Atlas caveat (Source 4)
The Atlas (2019 vintage, last updated April 2021) is **not used** as a current metric. If referenced for historical context only, it must display:
```tsx
<DataProvenance
  sourceName="USDA Food Access Research Atlas"
  sourceUrl="https://www.ers.usda.gov/data-products/food-access-research-atlas/"
  asOfDate="2019 (USDA last updated April 2021)"
  cadence="No recent update — more recent county-level food access data not publicly available from USDA"
  dataKind="measured"
/>
```
Use the USDA SNAP Retailer CSV (quarterly) as the preferred current food-access proxy.

### Fallback data
Seed `snap_county_annual` with FY2022 Michigan county data at deploy time. The dashboard never shows a blank state; it shows the seeded data with a staleness banner if the edge function has not run successfully.

### Persona alignment
- **Systems persona**: statewide table is the landing view; sortable by enrollment, food insecurity rate, retailer count
- **Community persona**: county page section is collapsed, revealed only on scroll; headline is enrollment count, not policy projection

---

## Feature 2 — Coverage at Risk: SNAP Edition

### Purpose
Show, for each Michigan county, how many SNAP recipients are at elevated exposure to loss under P.L. 119-21 work requirement provisions.

### Route
- Second tab on county page "Food Assistance" section (tab label: "Projected Changes")
- Same `/data/snap-michigan` route, toggled section

### Projection methodology
CBO scored P.L. 119-21 as removing **2.4 million people/month on average** from SNAP nationally over FY2025–2034. This is derived primarily from:
1. Expansion of ABAWD work requirements to adults ages 55–64 and adults with children ages 14+
2. Tightening of categorical eligibility
3. Elimination of broad-based categorical eligibility (BBCE) in most states

Michigan-specific projections (MLPP, sourced from CBO/CBPP/FNS):
- **74,000 Michigan adults at risk** of losing SNAP (39,000 ages 55–64; 35,000 with children age 14+)
- **123,000 total Michiganders** in affected households

**County allocation model** (same proportional approach as V2 Coverage at Risk):
1. Compute each county's share of Michigan total SNAP enrollment using `snap_county_annual` (FNS FY2022)
2. Apply that share to the MLPP 74,000 state-level estimate → county point estimate
3. Apply GAO historical SNAP work-requirement experiment range (±30% from Arkansas/Alabama data) as uncertainty band
4. Never display the point estimate without the band
5. Label as: "Modeled projection — county figures allocate MLPP statewide estimate proportionally. Actual county distribution will vary."

**Separate display for administrative burden losses** (tightening of eligibility verification / redetermination frequency):
- Cannot be modeled at county level from public data; display as a statewide note only
- "An estimated $410M in new annual state administrative costs may affect redetermination processing statewide. County-level impact is not publicly estimable."

### `DataProvenance` props for projection metrics

**At-risk estimate (county modeled):**
```tsx
<DataProvenance
  sourceName="MLPP / CBO P.L. 119-21 score (county-allocated model)"
  sourceUrl="https://mlpp.org/the-cost-of-the-federal-megabill-food-assistance/"
  asOfDate="November 2025 (MLPP); August 2025 (CBO)"
  cadence="Updated as CBO/MLPP publish revisions"
  dataKind="modeled"
  methodologyUrl="/methodology/snap-coverage-at-risk"
/>
```

**CBO national participation loss figure:**
```tsx
<DataProvenance
  sourceName="CBO: Estimated Effects of P.L. 119-21 on SNAP Participation"
  sourceUrl="https://www.cbo.gov/system/files/2025-08/61367-SNAP.pdf"
  asOfDate="August 2025"
  cadence="One-time enacted-law score"
  dataKind="projected"
  methodologyUrl="/methodology/snap-coverage-at-risk"
/>
```

### Methodology page required
`/methodology/snap-coverage-at-risk` must be created before Feature 2 ships. Content:
- Source chain: CBO national → MLPP Michigan → FNS county enrollment share → proportional allocation
- Uncertainty derivation: GAO historical SNAP work-requirement data (GAO-19-56 + Arkansas/Alabama Medicaid analogy from V2)
- Limitations: does not model geographic variation in E&T capacity, rural transportation access, or employer density
- Update cadence: recalculate when MLPP publishes a revision or when FNS county data advances beyond FY2022

### Primary visual
Stat card on county page "Food Assistance → Projected Changes" tab:
```
Estimated at-risk SNAP recipients: 1,200 – 1,900 people
(Modeled projection — county allocation of MLPP statewide estimate)
Most current public data: MLPP / CBO, November 2025 / August 2025
[Methodology]
```

Statewide comparison bar on `/data/snap-michigan` (below enrollment table):
- Single bar chart: Michigan total SNAP enrollment vs. at-risk estimate band
- x-axis: persons (0 → 1.4M); annotation: "74,000–123,000 at risk under P.L. 119-21 work requirements (MLPP/CBO projected)"

### Persona alignment
- **Systems**: projection methodology link is prominent; statewide bar chart with source annotation
- **Community**: county page shows the range prominently but the methodology section is collapsed

---

## Feature 3 — Dual-Eligible Exposure Map

### Purpose
Show which Michigan counties have the highest overlap of SNAP-receiving and Medicaid-enrolled households — the populations exposed simultaneously to both P.L. 119-21 SNAP cuts (V3) and Medicaid cuts (V2 Coverage at Risk).

### Route
`/data/dual-eligible-exposure`
Linked from V2 "Coverage at Risk" page and V3 SNAP pages.

### ⚠️ B27003 correction applied

Census ACS table B27003 ("Public Health Insurance Status by Sex by Age") **does not contain SNAP variables**. It cannot directly measure SNAP × Medicaid overlap. The following substitute methodology is used instead:

### Methodology (B22002 + B27010 + national rate band)

**Step 1 — County SNAP households (B22002)**
- Source: ACS 5-year 2023 estimates, table B22002
- Variable: `B22002_002E` = households that received SNAP/Food Stamps in past 12 months (all household types summed)
- Derives: `snap_households_acs` per county
- Convert to persons proxy: `snap_persons_proxy = snap_households_acs × county_avg_household_size` (from ACS B25010 or B11001; this is a derivation step, labeled as such)

**Step 2 — County Medicaid enrollment (B27010)**
- Source: ACS 5-year 2023 estimates, table B27010 (already used in V2 `acs-medicaid-county` edge function)
- Variable: Medicaid/means-tested coverage variables for working-age adults
- Derives: `medicaid_persons_acs` per county

**Step 3 — Apply national dual-enrollment rate band**
- National dual-enrollment rate: **56–62%** of SNAP households also have Medicaid coverage
- Source: cross-study synthesis from USDA FNS administrative data and KFF Medicaid population analysis
- Apply to `snap_persons_proxy`:
  - `dual_low_estimate = ROUND(snap_persons_proxy × 0.56)`
  - `dual_high_estimate = ROUND(snap_persons_proxy × 0.62)`
- Result: county-level range of dual-exposed persons

**Step 4 — Compute and store**
- Store in `dual_enrollment_exposure` table (schema above)
- Recompute whenever B22002 or B27010 vintage changes

**Step 5 — Display**
- Always show as range: "estimated X,xxx – Y,yyy households enrolled in both SNAP and Medicaid"
- Label as `DataProvenance dataKind="modeled"` with `methodologyUrl="/methodology/dual-enrollment"`
- Add sentence: "Exposure does not equal loss. This range estimates the population for whom simultaneous changes to both programs could compound impact."

### `DataProvenance` props

**Dual-enrollment estimate:**
```tsx
<DataProvenance
  sourceName="ACS B22002 + B27010; national rate band (USDA FNS / KFF)"
  sourceUrl="https://data.census.gov/table/ACSDT5Y2023.B22002"
  asOfDate="2023 ACS 5-year estimates (released December 2024)"
  cadence="Annual (ACS 5-year release, December)"
  dataKind="modeled"
  methodologyUrl="/methodology/dual-enrollment"
/>
```

### Methodology page required
`/methodology/dual-enrollment` must ship with this feature. Content:
- What B22002 measures (SNAP households by type); what it does not measure (individual SNAP recipients)
- What B27010 measures (Medicaid enrollment by age/type); ACS undercount vs. administrative data
- Why B27003 was not used (it measures public insurance by age/sex — no SNAP variable)
- National 56–62% dual-enrollment rate: source studies, date range, known limitation (state variation not modeled)
- Why county-level administrative cross-match is not publicly available
- What "exposure" means and does not mean

### Primary visual
Choropleth map of Michigan's 83 counties, shaded by `dual_low_estimate / county_population` (dual-enrollment rate):
- 5-tier color scale (lightest → darkest = lowest → highest estimated dual exposure)
- Hover tooltip: county name, dual range, SNAP persons proxy, Medicaid persons, underlying ACS year
- Click → county page `/county/:fips`
- Legend includes "Modeled estimate — see methodology" link

Supplementary ranked table (below map):
- Top 20 counties by estimated dual-enrollment rate
- Columns: County, SNAP Persons (ACS), Medicaid Persons (ACS), Estimated Dual-Enrolled (Range), ACS Year

### Tone enforcement
- Use: "exposed," "at higher dual-program exposure," "estimated overlap"
- Never use: "vulnerable," "at risk" without the uncertainty band visible, "will lose"
- County callout box: "These counties have the highest estimated overlap of SNAP-receiving and Medicaid-enrolled households as of 2023 ACS data. CBO projects that work-requirement provisions affect both programs. Exposure does not equal loss."

### Persona alignment
- **Systems**: methodology link prominent; table view; downloadable data attribution
- **Community**: map is the primary view; technical methodology collapsed by default

---

## Phase 2 build order

**Sequential, not parallel. Each feature merges to main before the next starts.**

1. **`feat/v3-snap-dashboard`** — Feature 1 (measured data only)
   - Edge functions: `usda-snap-county`, `usda-snap-retailers`, `feeding-america-snap` (seeded fallback)
   - Components: county page "Food Assistance" section, `/data/snap-michigan` table
   - No projections; no controversy; fastest ship
   - `mdhhs-green-book-extractor` is **specced but not built** — the dashboard runs on FNS annual + Feeding America fallback until the extractor is built in a later sprint

2. **`feat/v3-snap-coverage-at-risk`** — Feature 2 (adds projection layer)
   - New: `/methodology/snap-coverage-at-risk` page (ships first, before the projection UI)
   - Edge function: no new function; uses `usda-snap-county` data + static MLPP/CBO constants
   - Components: "Projected Changes" tab on county page, statewide bar on `/data/snap-michigan`

3. **`feat/v3-dual-eligible-map`** — Feature 3 (cross-program model, ships last)
   - New: `/methodology/dual-enrollment` page (ships first)
   - Edge function: `acs-snap-county` (new; extends existing `acs-medicaid-county` pattern)
   - Components: choropleth map, ranked table, `/data/dual-eligible-exposure` route

---

## Cross-feature component inventory

### Reused from existing platform
- `DataProvenance` (named export, `feat/data-provenance-component`) — required on every metric
- `ProvenanceDisclaimer` — required in every page hero
- `DataFreshnessBadge` — use for county SNAP data when MDHHS monthly is fresher than FNS annual
- `MoEBadge` — use on ACS-derived estimates with margin of error
- `Badge` (shadcn/ui) — `(Projected)` and `(Modeled estimate)` labels in amber

### New components (build in Feature 1 sprint)
- `SnapStatCard` — county-level SNAP enrollment stat card with `DataProvenance compact` embedded; reused across Features 1 and 2
- `SnapCountyTable` — sortable table at `/data/snap-michigan`; column definitions shared between Features 1 and 2 tabs

### New components (build in Feature 3 sprint)
- `DualEnrollmentChoropleth` — Michigan county choropleth; wraps existing Leaflet pattern from `HealthMap`
- `DualEnrollmentTable` — ranked table of top 20 counties by estimated dual-exposure rate

---

## Methodology pages (must ship before the features that cite them)

### `/methodology/snap-coverage-at-risk`
Ships with Feature 2. Content sections:
1. What CBO measured: enacted P.L. 119-21, 2.4M/month national participation loss
2. How MLPP derived the Michigan 74,000 estimate
3. How accessmi.org allocates 74,000 to counties (proportional to FNS enrollment share)
4. Uncertainty derivation (GAO historical range)
5. What is not modeled (E&T capacity, rural transportation, employer density)
6. Update cadence
7. Sources table (all `DataProvenance` props listed)

### `/methodology/dual-enrollment`
Ships with Feature 3. Content sections:
1. What B22002 measures and does not measure
2. What B27010 measures and does not measure
3. Why B27003 was not used (public health insurance by age/sex — no SNAP variable)
4. Why B22002 + B27010 at the individual level requires PUMS microdata (not available at county level in published tables)
5. National 56–62% dual-enrollment rate: source studies, date range, state variation caveat
6. Column definitions for `dual_enrollment_exposure` table
7. Why county-level administrative cross-match is not publicly available
8. Sources table

---

## Out of scope (V3)

- Individual household benefit calculation
- SNAP eligibility tool or screener
- Names or addresses of SNAP recipients
- Work-requirement compliance advice
- Direct enrollment functionality
- SNAP-Ed program impacts (MLPP's $33M figure noted in source audit but not displayed — no county resolution)
- MDHHS redetermination completion rate as a dashboard metric (data only in PDF Annual Report; spec `mdhhs-green-book-extractor` as the extraction path)

---

## Success criteria

V3 is complete when a Michigan-focused journalist can land on accessmi.org, navigate to a county, and within 60 seconds answer:

1. "How many people receive SNAP here?" — Feature 1, measured, source cited, dated
2. "How exposed is this county to the SNAP changes?" — Feature 2, projection range, methodology linked
3. "How does that overlap with Medicaid exposure?" — Feature 3, modeled range, methodology linked, "exposure ≠ loss" visible

Each answer:
- Source cited on the same screen
- Dated (as-of date visible)
- Distinction between measured and projected/modeled clear
- No individual-level data
- No single-point projections without uncertainty bands
