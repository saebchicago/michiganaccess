# ACCESS MICHIGAN — Content Expansion Super-Prompt

> **Instructions for Claude Code:** Read this entire file first. It contains your codebase context, verified data to insert, and sequenced update instructions. Work through each section in order. After each major update, commit with a descriptive message. If a file doesn't exist yet, create it following the patterns of existing pages. Ask me before making destructive changes to working components.

---

## CODEBASE CONTEXT

**Stack:** React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui + Supabase + Framer Motion + Recharts + Leaflet  
**Repo:** `saebchicago/michiganaccess`  
**Hosting:** Netlify at accessmi.org  
**i18n:** react-i18next with locales in `src/i18n/locales/` (en, es, ar, bn)  
**State:** CountyContext for county filtering  
**Routing:** React Router in `src/App.tsx` with lazy-loaded pages  

### Key file locations
```
src/
├── App.tsx                          # All routes defined here
├── pages/
│   ├── Index.tsx                    # Homepage
│   ├── EnvironmentPage.tsx          # Energy + environment (UPDATE)
│   ├── FinancialHelpPage.tsx        # Financial assistance (UPDATE)
│   ├── ImpactPage.tsx               # Case studies (UPDATE)
│   ├── LeanHealthcarePage.tsx       # VBC + lean metrics (UPDATE)
│   ├── CivicDataPage.tsx            # Civic data hub (UPDATE)
│   ├── HealthDataDashboardPage.tsx  # Health data (UPDATE)
│   ├── TransportationPage.tsx       # Transportation (minor update)
│   ├── MethodologyPage.tsx          # Data sources (UPDATE)
│   ├── PressPage.tsx                # Press kit (UPDATE facts)
│   ├── TechnicalPage.tsx            # Architecture (minor update)
│   ├── ForHealthSystemsPage.tsx     # B2B pitch page (UPDATE)
│   └── [NEW] DataCenterPage.tsx     # CREATE NEW
├── components/
│   ├── home/
│   │   ├── EngineeringFAQ.tsx       # VBC FAQ accordion (UPDATE)
│   │   └── BenefitsWizard.tsx       # Eligibility wizard (UPDATE)
│   ├── shared/
│   │   └── SpotlightTabs.tsx        # Resource spotlight (UPDATE)
│   └── civic/
│       └── ValueBadges.tsx          # MVC badges (UPDATE)
├── i18n/locales/en.json             # English translations (UPDATE)
```

### Design patterns to follow
- Use `<Layout>` wrapper on all pages
- Use `usePageMeta()` for SEO
- Use `<Badge>`, `<Card>`, `<CardContent>` from shadcn/ui
- Use framer-motion `motion.div` with `initial/animate/whileInView`
- Use Recharts for charts (`ResponsiveContainer`, `AreaChart`, `BarChart`, etc.)
- Color palette: MI_BLUE=#0A4C95, MI_TEAL=#00A3A1, MI_GOLD=#F4A460, MI_CORAL=#FF6B6B, MI_NAVY=#003B5C

---

## PHASE 1: UPDATE EXISTING PAGES WITH VERIFIED DATA

### 1A. EnvironmentPage.tsx — Energy Programs with Real Numbers

Find the energy-related content sections and update with these **verified** figures:

**LIHEAP Michigan:**
- FY2025 federal allocation: **$183,334,313** (including $5.85M IIJA)
- FY2024 households served: **434,124** (heating), **129,420** (crisis)
- Benefits range: $1 to $2,205 (heating); $800 max (crisis)
- Eligibility: 110% FPG (heating), 150% FPG (crisis)
- Apply via MI Bridges: `https://newmibridges.michigan.gov`

**Michigan Energy Assistance Program (MEAP):**
- 2025 budget: ~$54.5 million ($50M LIEAF surcharge + LIHEAP)
- PA 168–170 of 2024: Removes cap; raises factor to $1.25/meter, increasing to $2.00 max
- Projected to reach **$100 million by 2028**
- 2025 households served: **56,018** (before October expansion)
- New eligibility (Oct 2025): 60% State Median Income (~$61,861 for family of 4)
- URL: `https://www.michigan.gov/mpsc/consumer/energy-assistance`

**MiHER (Michigan Home Energy Rebate) — Launched statewide April 23, 2025:**
- Total funding: **$211 million** from IRA (HOMES: $105.7M, HEAR: $105.3M)
- Target: up to **15,000 households**
- HOMES rebates: up to $20,000/household (100% covered for 0-80% AMI)
- HEAR rebates: Heat pump HVAC up to $8,000; water heater $1,750; electric stove $840; dryer $840; panel upgrade $4,000; insulation $1,600
- Combined max: up to **$34,000/household**
- Application URL: `https://www.michigan.gov/egle/about/organization/materials-management/energy/rfps-loans/home-energy-rebate-programs/get-rebate`
- Call center: 855-510-7080

**Michigan Saves (2024 Annual Report):**
- 7,304 residential projects; **$96.6 million** financed
- Total investment: $108.1 million
- Average residential savings: **$347/year**
- Cumulative: 50,000+ customers, **$500+ million** financed, 207 GWh saved
- $97 million grant from EPA Greenhouse Gas Reduction Fund
- Loan terms: $1,000–$75,000, from 6.49% APR, up to 15 years
- URL: `https://michigansaves.org/home-energy-improvements/`

**DTE Energy Efficiency:**
- Low-income funding: $63M (2024), $73M (2025)
- EV Charging Forward program: $12.5M (2024), $5.1M (2025)
- All MI utilities combined: **$551+ million** on energy waste reduction (2023)
- Every $1 returns ~$2.40–$3.18

**Consumers Energy Efficiency:**
- 2024–2025 plan: Nearly **$600 million** (MPSC-approved Feb 2024)
- Income-qualified electric: **$85.3M** (29% increase)
- Income-qualified gas: **$113.1M** (56% increase)
- Cumulative savings since 2009: Over **$5.5 billion**
- Nearly 200,000 low-income customers served

**IRA Tax Credits — CRITICAL UPDATE:**
- **25C (Energy Efficient Home Improvement Credit): EXPIRED December 31, 2025** — terminated by "One Big Beautiful Bill" (signed July 4, 2025)
- **25D (Residential Clean Energy Credit): STILL ACTIVE** — 30% through 2032 for solar, wind, geothermal, battery
- MiHER rebates are stackable with 25D and utility rebates

**MI Healthy Climate Plan targets:**
- 100% carbon neutrality by 2050
- 52% GHG reduction from 2005 levels by 2030
- 100% clean energy standard by 2040
- Current: ~15% below 2005 baseline
- $27.8 billion in IRA-funded investment, 26,000+ jobs

**Also add the renewable energy chart data if not already present:**
Update the `renewableGrowth` data array with factual Michigan generation mix data.

### 1B. BenefitsWizard.tsx — Update Program Data

In `src/components/home/BenefitsWizard.tsx`, update the `allPrograms` array:

- Change LIHEAP description to include "$183M allocated" and "434K+ households served"
- Update MiHER HOMES to "Up to $20,000" (not $8,000)
- Update MiHER HEAR to "Up to $14,000" (not original figure)
- Add combined note: "HOMES + HEAR = up to $34,000/household"
- Add MEAP as a new program: "Michigan Energy Assistance Program — Up to $2,205 for heating bills. Now serving 60% SMI (~$61,861/family of 4). Apply via MI Bridges."
- **Remove or flag the 25C tax credit as expired**

### 1C. SpotlightTabs.tsx — Update Energy Resource Cards

In `src/components/shared/SpotlightTabs.tsx`, update the Energy category entries:

- MiHER: Update amounts to match verified data above
- Michigan Saves: Add "**$96.6M financed in 2024** — 50,000+ customers served"
- Add MEAP as a new entry with URL
- Update DTE/Consumers descriptions with verified budget numbers

### 1D. FinancialHelpPage.tsx — Add MEAP and Update Amounts

Add MEAP as a prominent financial assistance program. Update any LIHEAP references with the $183M allocation and 434K household figure. Ensure MiHER appears with correct combined $34K maximum.

---

## PHASE 2: VBC AND HEALTH SYSTEM DATA UPDATES

### 2A. LeanHealthcarePage.tsx — Update VBC Metrics

Update the `wasteTable` and VBC sections with verified data:

**Trinity Health (verified, published January 2026):**
- FY2025: **$2.9 billion** community impact; **$1.4 billion** IRS-defined community benefit
- $310 million in care costs covering ~450,000 patients
- $44 million in community investing loans since 2018 → $1.18 billion local investment
- **162 CHWs** addressed 16,300+ social needs
- 1 million+ outpatients screened for SDOH; **27.4% reported at least one unmet need**
- **16% decrease in preventable hospitalizations** (July 2021–July 2024, dually-enrolled patients)
- **45% reduction in health disparities**
- Source: `https://company.findhelp.com/blog/2025/09/10/trinity-health-preventable-hospitalizations/`

**Henry Ford Health (verified):**
- Revenue: $5.284 billion (FY2024)
- Financial assistance: Over **$85 million** to ~240,000 patients (2024)
- ACO shared savings: PY2024 $19.97M; PY2023 $12.66M; PY2022 $10.51M
- Absorbed eight former Ascension Michigan hospitals (Oct 2024)
- $3 billion hospital expansion approved by Detroit City Council (Feb 2024)

**⚠️ IMPORTANT: Remove or caveat the "17.1% unmet social needs" and "34% assistance request rate" figures attributed to MSHIELD/Michigan Medicine. These could NOT be verified in any published MSHIELD document. The 34% figure appears to originate from MyMichigan Health (a different system). Replace with the Trinity Health verified data: "27.4% of 1M+ screened reported at least one unmet need."**

**Michigan Value Collaborative PY 2026-2027:**
- 10-point scoring: episode spending (3pts), value metrics (4pts), health equity (1pt, NEW), engagement (2pts)
- Covers BCBSM PPO, BCN, Medicare FFS, and now Michigan Medicaid (~84% of insured)
- Technical doc: `https://michiganvalue.org/wp-content/uploads/2024/10/MVC-P4P-Technical-Document-PY26-27-FINAL-10.26.24-compressed-compressed.pdf`

**CHW Medicaid Reimbursement:**
- Effective January 1, 2024 (CMS-approved October 2023)
- Ratio: 1 CHW per 5,000 Medicaid managed care members (required in MCO contracts)
- MiCHWA manages registry: `https://michwa.org/mi-medicaid-chw-credential-registry/`
- 126-hour training requirement
- ROI: >$2 return per $1 invested

**MDHHS SDOH Hubs:**
- 7 confirmed hubs across 3 cohorts (launched Jan–May 2024):
  - Cohort 1: Detroit Health Dept, District Health Dept #10, Greater Flint Health Coalition/United Way, Wayne County Health Dept
  - Cohort 2: United Way of Bay County, Muskegon County Health Dept, Heart of West Michigan United Way (Kent County)
- Advisory Council Report (March 2025): `https://www.michigan.gov/mdhhs/-/media/Project/Websites/mdhhs/Inside-MDHHS/Policy-and-Planning/Social-Determinants-of-Health-Strategy/SDOH-AC-Recs-Report-FINAL-032025.pdf`

### 2B. EngineeringFAQ.tsx — Update FAQ Answers

Update the VBC FAQ answer to use verified Trinity Health data instead of unverified MSHIELD data. Replace "34% requested assistance" with "27.4% of 1M+ screened reported at least one unmet need (Trinity Health, FY2025)."

### 2C. ForHealthSystemsPage.tsx — Update B2B Pitch

Update with real health system financials:
- Henry Ford: $5.28B revenue, $85M financial assistance, $19.97M ACO savings
- Corewell: $10.4B revenue, 22 hospitals
- Trinity: $2.9B community impact, 162 CHWs, 16% hospitalization reduction
- All MI hospitals combined: **$4.5+ billion** in community benefit (MHA)

### 2D. ValueBadges.tsx — Verify MVC Metrics

Confirm the MVC PY 2026-2027 tooltip text matches the actual technical document. Key metrics: sepsis 14-day follow-up rate, cardiac rehab participation rate, and the new health equity measure.

---

## PHASE 3: CREATE DATA CENTER PAGE

### 3A. Create `src/pages/DataCenterPage.tsx`

Follow the pattern of `ImpactPage.tsx`. Create a new page with these sections:

**Hero:** "Michigan's Data Center Landscape" — subtitle about the $11.3B+ in announced projects

**Stargate Project Overview Card:**
- $7 billion investment, 1.4 GW demand
- Oracle/OpenAI/Related Digital in Saline Township
- 19-year DTE contract, approved Dec 18, 2025 (MPSC Case U-21990)
- 1,383 MW battery storage funded by Oracle
- 2,500 union construction jobs; ~450 permanent; ~1,500 county-wide
- $8M+/year for area schools
- Projected $300M/year net ratepayer benefit
- Closed-loop cooling (low water use)
- Curtailed before other customers in emergencies

**Pipeline Table (use shadcn Table component):**

| Project | Location | Developer | Capacity | Investment | Status |
|---------|----------|-----------|----------|------------|--------|
| Stargate | Saline Twp (Washtenaw) | Oracle/OpenAI/Related Digital | 1.4 GW | $7B | MPSC approved |
| Project Flex | Lyon Twp (Oakland) | Verrus/Sidewalk Infra/Alphabet | 1.8M sq ft | TBD | Conditional approval |
| Project Cannoli | Van Buren Twp (Wayne) | Panattoni | 1 GW | TBD | Preliminary approved |
| Metrobloks | Southfield (Oakland) | Metrobloks LLC | 100 MW | $1.5B | Approved |
| Switch Pyramid | Gaines Twp (Kent) | Switch | 237 MW | Part of $5B | Phase 3 |
| Microsoft | Kent/Allegan | Microsoft | TBD | TBD | Rezoning |
| UofM/Los Alamos | Ypsilanti Twp | UM + LANL | TBD | $1.25B | Planning |
| DAMAC Properties | TBD | DAMAC | TBD | $500M | Construction Q1 2026 |

**Energy Demand Section:**
- DTE pipeline: 8.4 GW total (1.4 GW executed, 3+ GW advanced talks, 4+ GW additional)
- Consumers pipeline: 15 GW economic development; ~3 GW probable by 2035
- Combined: ~16 GW — would nearly double combined utility demand
- UCS analysis: demand could nearly double by 2050; 57% of growth by 2030 from data centers

**Community Impact Cards:**
- Tax incentives: HB 4906/SB 237 (PA 207-208 of 2024). 6% sales tax exemption on equipment through 2050. Requirements: $250M min investment, 30 jobs at 150% median wage, green building cert, 90% clean energy
- Estimated fiscal impact: $52.5M–$90M+ revenue reduction
- Bipartisan repeal bill introduced December 2025
- 19+ townships/cities passed data center moratoriums

**Environmental Concerns Section:**
- Stargate: closed-loop cooling (low water)
- Project Cannoli: evaporative cooling — estimated 3.6M gallons/day from GLWA
- Michigan electricity demand could nearly double by 2050 (UCS)

**Add Recharts visualizations:**
- Bar chart: Data center capacity by project (GW)
- Timeline: Project milestones and regulatory decisions
- Pie/donut: Energy demand split (current residential vs. projected data center)

### 3B. Register Route in App.tsx

Add to the lazy imports:
```typescript
const DataCenterPage = lazy(() => import("./pages/DataCenterPage"));
```

Add route:
```tsx
<Route path="/data-centers" element={<DataCenterPage />} />
```

### 3C. Add Navigation Links

Add "Data Centers" to:
- Footer navigation under the appropriate section
- CivicDataPage.tsx quick links if they exist
- EnvironmentPage.tsx as a related link

---

## PHASE 4: UPDATE METHODOLOGY & PRESS PAGES

### 4A. MethodologyPage.tsx — Add New Data Sources

Add these to the data sources table:

```
DOE LEAD Tool (Energy Burden)
- County-level energy burden (% of income on energy)
- Download: https://data.openei.org/submissions/6219
- Methodology: https://docs.nrel.gov/docs/fy19osti/74249.pdf
- Frequency: Biennial (2022 latest)

AirNow API (Real-time Air Quality)
- Michigan ZIP-level AQI, 40+ monitoring stations
- API: https://docs.airnowapi.org/webservices
- Frequency: Hourly

USGS Water Data (Great Lakes + Inland)
- Real-time stream/lake data, 9,375 sites in MI
- API: https://api.waterdata.usgs.gov/ogcapi/v0/
- Frequency: 15-minute intervals

GLOS/Seagull (Great Lakes)
- Buoy data: temperature, waves, chlorophyll, turbidity
- ERDDAP API: https://seagull-erddap.glos.org/erddap/
- Datasets: 3,154+

Michigan 211 HSDS API
- 40,000+ service records statewide
- Partner access via: slummis@uwmich.org
- Frequency: Continuously maintained

Open States API v3 (Michigan Legislature)
- Bill tracking, legislator lookup, vote records
- API: https://v3.openstates.org/
- Registration: https://open.pluralpolicy.com/accounts/profile/

MODA Dashboard (Opioid Data)
- Fatal/non-fatal overdoses by county and ZIP
- URL: https://www.michigan.gov/opioids/category-data

MI-SUDDR (Substance Use Data Repository)
- ED visits, hospitalizations, treatment admissions by county
- URL: https://mi-suddr.com/data/
```

### 4B. PressPage.tsx — Update Quick Facts

Update the `FACTS` array:
```typescript
const FACTS = [
  { label: "Counties Covered", value: "83 / 83" },
  { label: "Resources Indexed", value: "15,000+" },
  { label: "Data Sources", value: "CMS, HRSA, CDC, MDHHS, DOE, USGS, AirNow" },
  { label: "Languages", value: "English, Spanish, Arabic, Bengali" },
  { label: "Cost to Users", value: "Free — No login required" },
  { label: "Personal Data Collected", value: "None" },
  { label: "MI Hospital Community Benefit", value: "$4.5B+ (all systems combined)" },
  { label: "Energy Programs Tracked", value: "LIHEAP, MEAP, MiHER, WAP, MI Saves" },
];
```

---

## PHASE 5: ADD REAL-TIME DATA FEEDS CONTENT

### 5A. EnvironmentPage.tsx — Add Air Quality Section

Add a card or section with:
- Link to MiAir: `https://www.michigan.gov/MiAir` (40+ monitoring stations)
- AirNow API endpoint: `https://www.airnowapi.org/aq/observation/zipCode/current/`
- Note: Free API key at `https://docs.airnowapi.org/login`
- Display: "Check your local air quality by ZIP code"

### 5B. EnvironmentPage.tsx or New Section — Water Quality

Add Great Lakes monitoring:
- GLOS/Seagull real-time buoy data: `https://seagull.glos.org/`
- USGS Michigan water data: `https://waterdata.usgs.gov/state/michigan/`
- EGLE water monitoring: `https://www.michigan.gov/egle/public/learn/water-quality`

### 5C. HealthDataDashboardPage.tsx — Add Opioid/Substance Data

Add section linking to:
- MODA Dashboard: `https://www.michigan.gov/opioids/category-data`
- MI-SUDDR: `https://mi-suddr.com/data/`
- Wastewater surveillance: `https://www.michigan.gov/coronavirus/stats/wastewater-surveillance/dashboard`

### 5D. CivicDataPage.tsx — Add Broadband Section

Add:
- Michigan broadband map: `https://michiganbroadbandmap.com/`
- MIHI stats: 95.3% have 25/3 Mbps access; 32.5% don't subscribe
- BEAD program: $1.5+ billion for 200,000+ unserved locations
- ROBIN Grant Program: $250 million from Coronavirus Capital Projects Fund

---

## PHASE 6: QUICK WINS (en.json + Index)

### 6A. Update Homepage Stats in en.json

In `src/i18n/locales/en.json`, update the stats section if static values are hardcoded. Key numbers:
- Community Resources: "15,000+"
- Energy Programs: "$183M+ in assistance"
- Counties: "83"

### 6B. Update CivicDataPage with MPSC/Legislature Links

Add to CivicDataPage.tsx:
- MPSC E-Dockets: `https://mi-psc.my.site.com/s/`
- Michigan Legislature bill search: `https://www.legislature.mi.gov/Bills`
- Open States Michigan: `https://openstates.org/mi/`

---

## COMMIT STRATEGY

After each phase, commit with a descriptive message:
```
Phase 1: git commit -m "feat: update energy programs with verified 2025-2026 data (LIHEAP $183M, MiHER $211M, Michigan Saves $96.6M)"
Phase 2: git commit -m "feat: update VBC metrics with verified Trinity Health, HFH, MVC data"
Phase 3: git commit -m "feat: add Data Center Insights page with Stargate, pipeline, energy demand data"
Phase 4: git commit -m "feat: expand methodology sources and press kit facts"
Phase 5: git commit -m "feat: add real-time data feeds (AirNow, USGS, opioid, broadband)"
Phase 6: git commit -m "feat: update homepage stats, civic data links, i18n values"
```

---

## IMPORTANT NOTES

1. **Do NOT remove existing functionality.** Only add or update content.
2. **All dollar figures and statistics above are verified** from published government sources, IRS filings, or official press releases as of March 2026.
3. **The 25C tax credit is EXPIRED** (Dec 31, 2025). Remove any references suggesting it's still available.
4. **MSHIELD "17.1%" and "34%" figures are UNVERIFIED.** Replace with Trinity Health's verified 27.4% screening positive rate.
5. **Michigan has 7 confirmed SDOH hubs, not 8.** Update any references.
6. If you encounter TypeScript errors, fix them before moving to the next phase.
7. Run `npm run build` after each phase to verify no build errors.
8. The site uses Tailwind — keep all styling inline with utility classes, no external CSS files.
