# V2 Design Document — accessmi.org Federal Intelligence Layer
**Date:** 2026-04-08 | **Status:** Phase 1 — Design. No code written.
**Prerequisites:** Phase 0 source audit (V2_SOURCE_AUDIT.md) approved.

---

## Design Principles (carry into every component)

1. **Every number has a source visible on the same screen.** Source, vintage year, and access date — inline, not buried in a methodology page. Exceptions require explicit sign-off.
2. **Projected ≠ measured.** Every projection is labeled "(projected, [year], [source])". Every measured value is labeled "(measured, [year], [source])". No unlabeled numbers.
3. **Uncertainty is a feature, not a weakness.** Ranges are shown where they exist. Point estimates from range-based projections are never displayed without the range.
4. **Civic neutrality is enforced at the component level.** No adjectives ("devastating," "alarming") in any rendered string. Describe what the law says. Describe what credible sources project. Reader concludes.
5. **Never broken.** Every component has fallback data and a graceful empty state. A county with no HCRIS data shows "Financial data not available for this facility" — never a spinner or crash.
6. **Supabase edge functions for all external API calls.** No keys exposed to the browser. No CORS issues. All new data routes go through `/supabase/functions/`.

---

## Feature 1: Provider Vulnerability Index (PVI)

### Purpose
Give residents, journalists, and health system planners a single, sourced risk-tier assessment for each Michigan hospital, FQHC, and critical access facility — derived entirely from public financial data and policy exposure. Answer: "How financially secure is this facility given its Medicaid exposure and current balance sheet?"

### Data sources
| Source | Fields used | Lag | Notes |
|--------|-------------|-----|-------|
| HCRIS (CMS hospital cost reports) | Operating margin (derived), days cash on hand (derived), Medicaid revenue % (derived), uncompensated care (derived) | 12–18 months | FY2022 baseline; supplement with FY2023 as available |
| CMS Provider of Services (POS) | CAH designation, REH designation, CCN, certification status | Quarterly | Rural proxy for facilities without FORHP join |
| HRSA UDS | FQHC Medicaid payer mix %, Section 330 revenue dependency | Annual (CY2024) | Separate from HCRIS; FQHCs file UDS not HCRIS |
| FORHP Eligible Areas file | Rural county designation, RUCA code | Sep 2025 | Join to facility county FIPS |
| Sheps Center closures | Closure date, services remaining | Dec 2025 | Override index with CLOSED tag |
| IRS Form 990 (Schedule H) | Uncompensated care %, community benefit % | Annual, 1–2 year lag | XML parsing of IRS bulk download; supplement HCRIS |
| KFF Medicaid projections | State-level Medicaid revenue cut exposure (proportional) | July 2025 | Applied as policy shock multiplier, not facility-specific |

### Risk tiers and methodology

Four tiers: **Critical / High / Moderate / Stable**

Adapted from the publicly documented Chartis Rural Hospital Performance INDEX methodology (credited in UI and methodology page). Built independently from HCRIS inputs — does not reproduce or imply Chartis scores.

**Tier assignment logic (indicator scoring):**

Each facility receives a score on six indicators, each sourced and dated:

| Indicator | Critical threshold | High | Moderate | Stable | Source |
|-----------|-------------------|------|----------|--------|--------|
| Days cash on hand | < 30 days | 30–60 | 60–120 | > 120 | HCRIS G/G-3 |
| Operating margin (3-year avg) | < −5% | −5% to −1% | −1% to +2% | > +2% | HCRIS G-3 |
| Medicaid revenue % | > 55% | 40–55% | 25–40% | < 25% | HCRIS S-3 |
| Rural + sole-service designation | CAH or REH + only hospital in county | CAH/REH | Rural non-CAH | Urban | POS + FORHP |
| Uncompensated care burden | > 15% of costs | 10–15% | 5–10% | < 5% | HCRIS S-10 |
| Medicaid revenue trend (3-year) | Declining > 10% | Declining 5–10% | Flat ±5% | Growing | HCRIS S-3 multi-year |

Tier = highest tier for which facility meets ≥ 3 of 6 indicators.

**Override rules:**
- Facility in Sheps Center closed list → display CLOSED badge; suppress tier
- Facility with TRMNTN_EXPRTN_DT in POS (termination date present) → display INACTIVE badge
- Facility missing HCRIS data for most recent available year → display "Insufficient financial data" and downgrade to unrated rather than assume Stable

### Output per facility card
```
[Risk badge: CRITICAL / HIGH / MODERATE / STABLE / CLOSED]
Facility name | County | Type (CAH / FQHC / Acute)

Three drivers (plain language):
• Days cash on hand: 24 days (national rural median: 62 days) [HCRIS FY2022]
• Medicaid revenue: 61% of patient revenue [HCRIS FY2022]
• Operating margin: −4.2% three-year average [HCRIS FY2020–2022]

Data as of: FY2022 cost report (CMS HCRIS). Policy exposure modeled from KFF (July 2025).
[View source data →] [Methodology →]
```

### Primary visual
- **Statewide map** (`/providers/vulnerability`): Michigan county map with dots sized by bed count, colored by tier. Filter by tier, county, facility type, rural/urban.
- **Facility detail drawer**: clicking a dot opens a right-side drawer with the full indicator breakdown, source links, and three-sentence context.
- **Risk badge on existing /find-care cards**: small colored pill (Critical / High / Moderate / Stable) added to facility cards that have HCRIS data. No badge if data unavailable.

### Where it lives
- New route: `/providers/vulnerability`
- Small badge extension on existing `/find-care` facility cards (no layout change)
- Cross-linked from county pages in a new "Provider Health" section
- Cross-linked from Closure Watch (`/closure-watch`) for facilities flagged Critical

### Persona served
Primarily **Systems** (hospital executives, CHNA teams, grant writers, journalists). Secondary **Resident** (knowing a local CAH is Critical-tier is relevant to care access decisions).

### What could go wrong

| Risk | Mitigation |
|------|-----------|
| HCRIS data lag: a facility could close before index reflects it | Ingest Sheps Center CSV quarterly; override with CLOSED tag same day. POS TRMNTN_EXPRTN_DT is the secondary signal |
| "Critical" label misinterpreted as imminent closure prediction | Tier definition language in UI: "Critical indicates high financial stress based on public cost report data. It does not predict closure." Methodology page explains all thresholds. Never use the word "failing." |
| HCRIS missing for a facility | Show "Financial data not filed or not yet processed for this facility" — never assume Stable |
| Score perceived as editorializing about a specific hospital | Every driver shows the number, the comparison, and the source inline. No narrative judgment. Methodology page published before any score |
| FQHCs use UDS, not HCRIS | Separate pipeline for FQHCs using UDS payer mix + revenue tables; same tier structure, different field names, clearly documented |

---

## Feature 2: Federal Dollar Tracker (per county)

### Purpose
For each Michigan county, show the federal health-related dollars flowing in across four categories: Medicaid, Medicare, HRSA grants, and other HHS grants. Show per-capita rate, YoY trend where available, and projected change range under HR 1 implementation.

### Data sources
| Source | Fields used | Lag | Notes |
|--------|-------------|-----|-------|
| USASpending API | HRSA direct grants to county-level recipients (CFDA 93.224 + others) | Near real-time, FY2025 queryable | Medicaid and Medicare NOT in USASpending at county level — see below |
| CMS Medicaid enrollment (MBES) | Statewide total enrollment by month | 6–9 months | State-level only; county allocation via ACS B27010 |
| ACS B27010 | County Medicaid enrollment share (derived) | ACS 2023 5-year | Used to proportionally allocate state Medicaid dollars to counties |
| CMS Medicare fee-for-service spending | State-level Medicare expenditures by service category | 18–24 month lag | CMS Geographic Variation database has county-level Medicare FFS spending per beneficiary — use this |
| CMS Geographic Variation Database | County-level Medicare FFS per-beneficiary spending, utilization, chronic conditions | Annual; FY2022/2023 available | https://data.cms.gov/tools/medicare-geographic-variation — the key Medicare county data source |
| KFF HR 1 state allocations | Michigan 10-year Medicaid spending reduction range ($23.7B–$39.5B) | July 2025 | Applied as projected change; county allocation from ACS B27010 share |
| Census ACS (B01003) | County total population for per-capita calculations | 2023 5-year | Already integrated |

**Important architecture note (from Phase 0):**
Medicaid flows through USASpending as a single state-level grant (CFDA 93.778 to Michigan MDHHS) — not to county-level recipients. The county breakdown of Medicaid dollars is a modeled allocation (total Michigan Medicaid spend × county ACS Medicaid enrollment share), not a direct measurement. This must be labeled as such.

Medicare county data IS available directly via the CMS Geographic Variation Database — this is a measured value, not modeled.

### County display: four funding categories
```
[Wayne County] — Federal Health Investment [Collapse/Expand]

Medicare (measured, CMS Geographic Variation, FY2022):
  $2,847 per beneficiary | 187,000 beneficiaries | $532M total
  ↑ 3.2% vs. FY2021

Medicaid (modeled allocation, ACS enrollment share × state total):
  ~$1.4B estimated county share | 24% of county population enrolled
  Projected change (FY2027–2030): −$82M to −$163M annually [KFF, July 2025]
  ⚠ County figure is a modeled estimate. See methodology.

HRSA grants to county recipients (measured, USASpending FY2024):
  $28.4M | 6 recipient organizations | CFDA 93.224, 93.527, 93.912
  [View all awards →]

Other HHS grants (measured, USASpending FY2024):
  $12.1M | 14 recipient organizations
  [View all awards →]
```

### Primary visual
- **County page extension**: collapsible "Federal Health Investment" section, default collapsed on existing county pages. Opens to a four-category breakdown with bar chart.
- **Standalone route** `/data/federal-dollars`: statewide table, all 83 counties, sortable by: total federal dollars, per-capita rate, projected Medicaid change, HRSA grant total. Exportable as CSV.
- **State-level summary card**: Michigan total vs. national average per-capita comparison.

### Where it lives
- New section on `/county/:county` pages (collapsed by default, does not disrupt existing layout)
- New route: `/data/federal-dollars` (standalone statewide table)
- Cross-linked from Coverage at Risk feature and Policy Timeline

### Persona served
**Systems** primary (CHNA teams, grant writers, hospital CFOs, policy researchers). **Resident** secondary (understanding relative investment in their county).

### What could go wrong

| Risk | Mitigation |
|------|-----------|
| Medicaid county allocation misinterpreted as direct measurement | Every Medicaid county figure is preceded by "modeled allocation" label with tooltip explaining ACS enrollment-share methodology |
| KFF projection uncertainty ignored | Show range ($82M–$163M), not point estimate. Surface KFF's own caution: "KFF explicitly cautions against interpreting state allocations as precise county-level predictions" |
| CMS Geographic Variation Database Medicare data lag (FY2022) | Label with "as of FY2022 (most recent available, CMS)"; explain lag in tooltip |
| USASpending data quality issues (GAO-documented) | Cap awards display at "as reported to USASpending.gov"; note "federal agencies are required to report awards; completeness not guaranteed" |
| County with no HRSA grantees shows $0 | Show "$0 in direct HRSA grants to county-based organizations" — distinguishes from a data gap |

---

## Feature 3: Coverage at Risk (per county)

> **Source freshness as of April 2026:** Urban Institute's March 2026 Michigan-specific projection is the most current post-enactment figure available. This feature must be refreshed if Urban Institute, CBPP, or MLPP publish updated Michigan-specific P.L. 119-21 analyses. Check quarterly.

### Purpose
For each county, show current Medicaid enrollment (ACS-derived), current uninsured rate, and modeled enrollment loss range under P.L. 119-21 work requirements and redetermination provisions — over a 2026–2028 horizon. Answer: "How many people in this county could lose coverage?"

### Data sources
| Source | Fields used | Lag | Notes |
|--------|-------------|-----|-------|
| ACS B27010 (5-year 2023) | County Medicaid enrollment share → enrollment count | Annual | Best available county proxy; label as ACS-derived estimate |
| ACS B27001 | County total uninsured count and rate | 2023 5-year | Already integrated |
| CDC PLACES | Uninsured rate validation (county-level, measured, 2023) | Annual, Aug 2024 | Cross-check for ACS figures |
| Urban Institute (March 2026) | Michigan projected enrollment loss 171,000–355,000 by 2028 (work requirement provisions only) | March 2026 | Post-enactment P.L. 119-21; most current Michigan-specific figure available. County allocation from ACS enrollment share. Primary model input |
| KFF (December 2025) | Michigan 10-year federal Medicaid spending reduction: $31.6B under P.L. 119-21 | December 2025 | Post-enactment spending figure; not an enrollment count. Use as spending-impact context alongside Urban enrollment projection |
| MDHHS (August 2025) | >500,000 Michiganders at risk across all P.L. 119-21 Medicaid provisions | August 2025 | Broader scope than Urban (all provisions combined, not work requirements only). Use as context, not as the primary model input |
| CBO (pub. 61570, July 2025) | National: 7.5M coverage loss by 2034; $326B federal savings from work requirements; $63B / 700K from redeterminations | One-time, July 2025 | National baseline. Michigan share ~2.6%. Urban Institute's Michigan range is grounded in this CBO national score |
| GAO-20-149 / Sommers et al. NEJM 2019 | 25% coverage loss among work-requirement-eligible adults (Arkansas); approximately 18,000 Arkansas adults lost coverage in the first year of implementation (June 2018 through April 2019) | 2020 / 2019 | Arkansas work-requirement benchmark. Urban Institute's methodology is grounded in these same findings. Cite as methodology reference, not as an uncertainty band input |
| CMS MBES statewide enrollment | Michigan total Medicaid enrollment baseline (state-level) | Quarterly, ~6 month lag | Denominator validation for ACS-derived county figures |

### Modeling methodology (explicit, UI-visible)

County-level enrollment loss projection steps:
1. **Baseline**: County Medicaid enrollment = ACS B27010 Medicaid-only variables summed across age groups ÷ total population × total county population. Label: "ACS 2023 5-year estimate."
2. **State total**: Validate county sum against Michigan statewide CMS MBES enrollment (~2.2–2.6M). Apply a calibration multiplier if ACS county sum differs from CMS state total by >15%.
3. **Work-requirement exposure**: Adults 19–54 not qualifying for categorical exemptions (children, elderly, disabled, pregnant) — from ACS age/enrollment breakdown. Historical rate applied: 25% coverage loss among work-requirement-eligible adults (GAO/Arkansas/NEJM benchmark).
4. **Redetermination exposure**: Apply 6-month redetermination cycle loss estimate from CBO scoring (~700K nationally) proportional to Michigan's Medicaid share (~2.6%).
5. **Combined range**: Low = work requirements only. High = work requirements + redeterminations + provider tax changes. Present as a range, not a point estimate.
6. **Citation block**: Every step cites its source inline on the methodology expansion panel.

### County display
```
[Ogemaw County] — Coverage Outlook 2026–2028

Current Medicaid enrollment:   ~6,200 residents (ACS 2023 estimate, ~31% of population)
Current uninsured rate:        11.4% (CDC PLACES, 2023)

Under P.L. 119-21 provisions (projected, Urban Institute/CBO, 2026):
  Enrollment loss range:   −430 to −885 residents by 2028
  As % of current enrollment:  7%–14%
  Remaining uninsured projection: 12%–17% of population by 2028

[chart: baseline enrollment → low scenario → high scenario, 2025–2028]

Sources: ACS B27010 (2023 5-year) · Urban Institute Michigan projection (March 2026) · CBO work requirements score (pub. 61570, July 2025)
Methodology: Urban Institute Michigan-specific range (171,000–355,000) allocated by county ACS enrollment share. Arkansas work-requirement benchmark (NEJM 2019; GAO-20-149) underlies Urban Institute's methodology.
These are modeled estimates. Actual outcomes depend on implementation, legal challenges, and state decisions not yet determined.
```

### Primary visual
- **County page section**: "Coverage Outlook 2026–2028" — a small area chart (baseline → range band) showing enrollment trajectory, collapsed by default.
- **Statewide view** `/data/coverage-at-risk`: Michigan map, counties shaded by projected enrollment loss %, with a statewide summary card at top.

### Where it lives
- New section on `/county/:county` pages (below Federal Dollar Tracker, default collapsed)
- New route: `/data/coverage-at-risk`
- Cross-linked from Policy Timeline and home page county selector result

### Persona served
**Resident** primary (directly affected). **Systems** secondary (health system planning). **Journalists** (county-level narrative anchor).

### What could go wrong

| Risk | Mitigation |
|------|-----------|
| Projection treated as a prediction | Bold disclaimer on every render: "These are modeled estimates. Actual outcomes depend on legal challenges, state decisions, and implementation rules not yet final." |
| ACS undercount leads to low baseline | Document ACS limitation (5–15% undercount vs. admin data) in tooltip. Show "estimated" prominently. |
| Urban Institute range cited without scope clarity | Clearly label: "Urban Institute (March 2026) projects 171,000–355,000 Michigan adults may lose coverage due to work requirement provisions specifically. MDHHS cites >500,000 across all P.L. 119-21 provisions combined." Scope difference must be visible in the UI. |
| County with small population produces unstable projection | Apply ACS margin-of-error check: if county Medicaid estimate MOE > 30% of estimate, suppress the projection and show "Insufficient sample size for county-level projection — see statewide estimates." |
| Perceived as anti-P.L. 119-21 advocacy | Present as: "P.L. 119-21 work requirement provisions take effect January 1, 2027. CBO projects 7.5M coverage loss nationally by 2034. Urban Institute projects 171,000–355,000 Michigan adults affected by 2028. Michigan has [Z] current enrollees." Zero adjectives. |

---

## Feature 4: Closure Watch

### Purpose
A live-updated map and chronological list tracking Michigan hospital closures, service line eliminations, and FQHC site changes since 2020. Answer within 5 seconds: "Has any Michigan hospital closed recently? Have any OB/ED units shut down in my county?"

### Data sources
| Source | Fields used | Lag | Notes |
|--------|-------------|-----|-------|
| Sheps Center closures CSV | Hospital name, state, closure year, beds, services remaining, RUCA, CBSA | Reactive (last Dec 2025) | Primary source; free download; ingest quarterly |
| CMS Provider of Services (POS) | TRMNTN_EXPRTN_DT (termination date), FAC_NAME, CNTY_CD, PRVDR_CTGRY_SBTYP_CD | Quarterly | Secondary confirmation; cross-check against Sheps |
| CMS HCRIS | Operating margin, days cash on hand in final year before closure | Annual | Retrospective context for closed facilities |
| PVI index (Feature 1) | Risk tier at time of closure, if available | Same as PVI | Closing the loop: did Critical-tier facilities close? |
| News ingestion (future phase) | Service line eliminations (OB, ED, ICU) | Ongoing | Phase 2 stretch goal; not required for initial ship |

### Data validation rule
**Every closure entry requires two-source confirmation before publishing:**
1. Sheps Center listing (primary)
2. CMS POS TRMNTN_EXPRTN_DT present for the CCN, OR a published news source with URL

Single-source entries are held in a "pending verification" queue in Supabase — not displayed publicly until verified.

### Supabase schema (`closures` table)
```sql
id               uuid primary key
facility_name    text not null
ccn              text                  -- CMS Certification Number
county           text
state            text default 'MI'
closure_year     int
closure_date     date                  -- precise date if known
beds_at_closure  int
services_remaining text               -- from Sheps "services remaining" field
sheps_confirmed  boolean default false
pos_confirmed    boolean default false
news_source_url  text
verified_date    date
ruca_code        text
closure_type     text                 -- 'full' | 'service_line' | 'merged' | 'converted'
notes            text
created_at       timestamptz default now()
```

### Display: map + list

**Map (`/closure-watch`):**
- Michigan map; each closure is a pin colored by year (gradient dark→light = older→recent)
- Pin size = bed count at closure
- Click → drawer with full record: facility name, county, closure date, services remaining, source links, PVI tier at closure (if available)
- Filter: year range slider, closure type, county

**Chronological list (below map):**
```
2025
  ▸ [No Michigan closures confirmed as of Dec 2025 data]

2024
  ▸ [facility name] — [County] County
    Closed: [month year] | [N] beds | Services remaining: [Emergency care only / None]
    Type: [Full closure / OB unit eliminated]
    Sources: Sheps Center (verified [date]) · CMS POS (terminated [date])
    [Financial context: Final-year operating margin was −X% per HCRIS FY20XX]

2023
  ▸ ...
```

### Where it lives
- New route: `/closure-watch`
- Linked from the main nav under "Services" dropdown ("Closure Watch" with a "New" badge initially)
- Cross-linked from PVI (`/providers/vulnerability`) for Critical-tier facilities
- Referenced from county pages if a county had a closure since 2020

### Persona served
**Journalists** primary (highest narrative value). **Systems** secondary (competitive/market awareness). **Residents** tertiary (care access context — if their local hospital closed, they should know).

### What could go wrong

| Risk | Mitigation |
|------|-----------|
| Facility listed as closed has actually reopened or been acquired | Two-source requirement; "verified [date]" stamp on every entry; quarterly POS re-check; contact page for corrections |
| Service line closure data not yet automated (AHA behind paywall) | Scope v1 to full facility closures only; add service-line stub with "Service line data coming — submit tip via /feedback" |
| Sheps Center data limited to rural hospitals | Label section: "Source: Sheps Center tracks rural hospital closures. Urban hospital closures and service-line changes added from CMS and news sources." Display honest scope |
| Map pins for a single-hospital county interpreted as predicting next closure | Map only shows confirmed closed facilities, not risk tiers. PVI is the risk layer — keep them visually separate |

---

## Feature 5: Policy Implementation Timeline (HR 1 / OBBB Medicaid Provisions)

### Purpose
A neutral, source-cited timeline of every Medicaid-affecting provision in HR 1, when it takes effect, and what CBO and KFF project the impact to be at the national and Michigan level. No adjectives. Provisions described in legislative and CBO terms only.

### Data sources
| Source | Fields used | Lag | Notes |
|--------|-------------|-----|-------|
| CBO score (June/July 2025) | National projected coverage loss, spending change, by provision | One-time, July 2025 | PDF — requires structured extraction; national only |
| KFF health provisions summary (Aug 22, 2025) | State-level impact by provision type, Michigan figures | One-time with updates | Best Michigan-specific projection source |
| KFF work requirements analysis | Work requirement effective dates, exemptions, state implementation options | Aug 2025 | Provision-level detail |
| MDHHS public statements (pending) | State implementation decisions and timeline | Ongoing | Monitor michigan.gov/mdhhs; add as confirmed |
| MLPP analysis | Michigan-specific context for each provision | Ongoing | Secondary; check mlpp.org for updates |
| HR 1 enrolled text | Official effective dates, provision text | Enacted July 4, 2025 | congress.gov — primary legal source |

### Content structure: one card per provision

Six provisions tracked (from CBO score and KFF analysis):

**1. Work and Community Engagement Requirements**
- Effective date: January 1, 2027 (per HR 1 text)
- Who is affected: Adults ages 19–54 without dependent children, not categorically exempt
- Exempt groups: Pregnant women, medically frail, full-time students, caregivers, tribal members
- CBO projection (national): $326B federal spending reduction over 10 years; 5.3M coverage loss by 2034
- KFF Michigan allocation: ~$8.4B over 10 years (proportional); enrollment loss 137K–220K by 2034
- State decision required: Michigan must implement or lose federal match — MDHHS has stated it will comply [source pending]
- Reporting frequency: Monthly (enrollees must document compliance monthly)

**2. Six-Month Eligibility Redeterminations**
- Effective date: October 1, 2026
- Current rule: Annual redeterminations
- Change: States must conduct redeterminations every 6 months for non-disabled adults
- CBO projection: $63B federal reduction; 700K coverage loss nationally
- KFF Michigan allocation: ~$1.6B; 18K–29K coverage loss
- Historical benchmark: Post-pandemic unwinding (2023–2024) removed ~147K from Michigan rolls in 12 months

**3. Provider Tax Moratorium and Reductions**
- Effective date: Phases in 2026–2030 (cap reductions)
- What it is: Limits states' ability to use provider taxes to generate federal Medicaid matching funds
- CBO projection: $191B federal reduction nationally; 1.1M coverage loss
- KFF Michigan allocation: ~$5.0B over 10 years
- Michigan context: Michigan uses provider taxes on hospitals and managed care orgs; this constrains that mechanism

**4. Medicaid Expansion Eligibility Adjustments**
- Effective date: 2027
- What it is: Maintains expansion but adds eligibility verification requirements
- CBO projection: included within broader coverage loss estimates
- Michigan: 680,000 Michiganders enrolled via ACA expansion (MDHHS 2024)

**5. Managed Care Payment Changes**
- Effective date: 2027
- What it is: Limits state-directed payments and supplemental payments to managed care plans
- Impact: Affects MCO contracts and potentially provider reimbursement rates
- CBO projection: included in $191B provider tax/payment category
- Michigan: ~90% of Michigan Medicaid enrollees are in managed care (MDHHS)

**6. Rural Health Transformation Program (offset)**
- Effective date: FY2026 (active)
- What it is: $50B national fund over 5 years for rural health providers
- Michigan allocation: $173,128,201 in FY2026 (confirmed, MDHHS Dec 2025)
- Nature: Competitive + formula grants to rural providers; sub-grants via MDHHS
- Framing: Presented as an offset provision in HR 1; CBO and KFF include this in their net calculations

### Primary visual
**Timeline** (`/policy/medicaid-2026`): vertical timeline sorted by effective date, each provision as an expandable card. Collapsed view shows: provision name, effective date, one-sentence description, and a Michigan impact line. Expanded view shows: full CBO/KFF projections with uncertainty ranges, exact statutory citation, links to sources, and current state implementation status.

**Design constraint:** Timeline uses only text and simple data tables — no charts with unlabeled axes, no visualizations that could be interpreted as editorializing. Amber "modeled" badge on every projection value.

### Where it lives
- New route: `/policy/medicaid-2026`
- Linked from county page Coverage Outlook sections ("Understand the policy changes driving these projections →")
- Linked from Federal Dollar Tracker projected change rows
- Linked from `/about` and `/methodology` pages
- NOT in the main nav initially — linked contextually from data features

### Tone enforcement (component-level)

The component renders provision descriptions from a data structure, not from JSX strings. The data structure is the editorial layer. Each provision object has:

```ts
interface PolicyProvision {
  id: string;
  name: string;                        // "Work and Community Engagement Requirements"
  effectiveDate: string;               // "January 1, 2027"
  statutoryCitation: string;           // "HR 1, Sec. XXXX"
  description: string;                 // Descriptive only. No adjectives.
  affectedPopulation: string;          // "Adults 19–54 without dependent children not categorically exempt"
  exemptions: string[];                // List of exempt groups per statute
  cboNational: { low: number; mid: number; high: number; unit: string; year: number; source: string };
  kffMichigan: { low: number; mid: number; high: number; unit: string; source: string };
  stateSources: { label: string; url: string; date: string }[];
  implementationStatus: "active" | "pending" | "effective" | "legal_challenge";
  notes: string;                       // Methodology notes, caveats
}
```

**Banned adjective list** (enforced in code review, not in the component): devastating, alarming, harmful, dangerous, reckless, extreme, massive, cruel, unprecedented, historic. Also banned: "protect," "attack," "gut," "slash," "strip."

### Persona served
**Journalists and researchers** primary — this is a citation tool, not a consumer feature. **Systems** secondary. **Policy advocates** (MLPP, MDHHS, legislators' offices) as reference.

### What could go wrong

| Risk | Mitigation |
|------|-----------|
| Page becomes partisan regardless of intent | Side-by-side source citation: CMS official statements + Republican committee analyses alongside KFF/CBPP/MLPP. Where sources disagree on the same provision, show both. |
| Effective dates change via implementation rule or legal challenge | `implementationStatus` field updated manually; "legal challenge pending" status shown prominently when applicable. Changelog entry for every update. |
| CBO PDF has no machine-readable structure | Provision data entered from PDF extraction into the `PolicyProvision` data structure by hand; all CBO numbers cross-checked against KFF's citations of those same numbers |
| Michigan implementation decisions not yet made for some provisions | Show "State implementation decision pending" with a link to MDHHS for any provision where state action is required but not yet announced |
| Misleading via omission (showing cuts without showing the RHTP offset) | RHTP is provision #6 in the timeline — same visual weight, same source citations. Net impact is not computed by the platform; reader adds the numbers |

---

## Data Architecture for V2

### New Supabase tables

```sql
-- Provider Vulnerability Index
CREATE TABLE provider_vulnerability (
  ccn              text primary key,
  facility_name    text,
  county           text,
  state            text default 'MI',
  facility_type    text,          -- 'hospital' | 'fqhc' | 'rural_health_clinic'
  risk_tier        text,          -- 'critical' | 'high' | 'moderate' | 'stable' | 'closed' | 'unrated'
  days_cash        numeric,
  operating_margin numeric,
  medicaid_pct     numeric,
  uncomp_care_pct  numeric,
  rural            boolean,
  cah_designation  boolean,
  data_year        int,
  indicator_json   jsonb,         -- full indicator breakdown for display
  last_updated     timestamptz
);

-- Hospital closures
CREATE TABLE closures (
  id               uuid primary key default gen_random_uuid(),
  facility_name    text,
  ccn              text,
  county           text,
  state            text default 'MI',
  closure_year     int,
  closure_date     date,
  beds_at_closure  int,
  services_remaining text,
  sheps_confirmed  boolean default false,
  pos_confirmed    boolean default false,
  news_source_url  text,
  verified_date    date,
  closure_type     text,          -- 'full' | 'service_line' | 'merged' | 'converted'
  notes            text,
  created_at       timestamptz default now()
);

-- Federal dollars by county (cached results)
CREATE TABLE county_federal_dollars (
  county           text,
  fiscal_year      int,
  medicare_per_cap numeric,
  medicare_total   numeric,
  medicare_benes   int,
  medicaid_est     numeric,       -- modeled, not measured
  medicaid_method  text,          -- 'ACS B27010 proportional allocation'
  hrsa_grants      numeric,
  hrsa_recipients  int,
  other_hhs_grants numeric,
  data_vintage     text,
  last_refreshed   timestamptz,
  PRIMARY KEY (county, fiscal_year)
);

-- Policy provisions (HR 1 Medicaid)
CREATE TABLE policy_provisions (
  id               text primary key,
  name             text,
  effective_date   date,
  statutory_ref    text,
  description      text,
  affected_pop     text,
  exemptions       jsonb,
  cbo_national     jsonb,
  kff_michigan     jsonb,
  state_sources    jsonb,
  implementation_status text,
  notes            text,
  updated_at       timestamptz
);
```

### New Edge Functions needed
| Function | Purpose | External API called |
|----------|---------|-------------------|
| `hcris-ingest` | Fetch and parse HCRIS FY2022/2023 flat files for Michigan hospitals | CMS bulk download |
| `pos-sync` | Quarterly sync of CMS Provider of Services for Michigan facilities | data.cms.gov |
| `uds-ingest` | Fetch HRSA UDS CY2024 for Michigan FQHCs | data.hrsa.gov |
| `sheps-sync` | Quarterly ingest of Sheps Center closure CSV | shepscenter.unc.edu |
| `usaspending-county` | Query USASpending HRSA awards by county (CFDA 93.224) | api.usaspending.gov |
| `cms-geographic-variation` | Fetch CMS Medicare Geographic Variation by county | data.cms.gov |
| `acs-medicaid-county` | Fetch ACS B27010 for all 83 Michigan counties | api.census.gov |

All existing Supabase edge functions remain unchanged. New functions add to the existing structure.

---

## Phase 2 Build Order (confirmed from Phase 0 findings)

1. **Closure Watch** — fastest ship; Sheps CSV → Supabase → map render. Confirms the V2 data pipeline works end-to-end before tackling HCRIS.
2. **Provider Vulnerability Index** — highest narrative leverage; requires HCRIS ETL (highest technical effort); ship after closure watch proves the pipeline.
3. **Federal Dollar Tracker** — medium complexity; requires USASpending edge function + CMS Geographic Variation + ACS allocation model.
4. **Coverage at Risk** — medium complexity; depends on ACS B27010 (same edge function as #3) + KFF projection data structure.
5. **Policy Timeline** — lowest technical effort (static data structure); highest editorial discipline required; ship last.

Each feature ships with its own commit on a feature branch (`feat/v2-closure-watch`, `feat/v2-pvi`, etc.), merged to main after build passes and visual review.

---

## Out of Scope for V2 (explicit non-goals, unchanged from plan)

- Any personally identifying data about Medicaid recipients
- Real-time Medicaid enrollment data (requires T-MSIS DUA — not available for public platform)
- Predictions of specific facility closure dates
- County-level Medicaid cut dollar estimates presented as point estimates (ranges only)
- AHA service-line data (paywall — Phase 3 if licensed)
- MDHHS Rural Health Transformation grant recipient list (data doesn't exist yet)

---

## Success Criteria (Phase 1 checkpoint)

V2 design is approved when:
1. Each feature's data sources are mapped to confirmed-accessible sources from V2_SOURCE_AUDIT.md
2. Every projected number has a defined source, vintage, and uncertainty representation
3. The tone framework (no adjectives, dual-sourced, ranges not points) is documented at the component level
4. The Supabase schema supports all five features without breaking existing tables
5. Edge function list is complete and scoped (no "TBD" data pipelines)
