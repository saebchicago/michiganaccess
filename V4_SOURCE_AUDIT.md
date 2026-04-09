# V4 Source Audit — Michigan Childcare Deserts

Produced: 2026-04-09
Status: Phase 0 complete — strategic direction update 2026-04-09 — awaiting partnership outreach decision before Phase 1

---

## Strategic Direction (updated 2026-04-09)

The Phase 0 audit found that Michigan State University's Engaged Research and Evaluation Center (EREC), in active partnership with MiLEAP, already applies the CAP 3:1 childcare desert methodology to Michigan at county and ZIP level, updated daily from the LARA live data feed. This changes V4's posture.

### Primary approach: partnership-first

accessmi.org will seek a partnership or attribution agreement with MSU EREC before building any independent desert calculation. If partnership is established, V4 will embed or prominently link to EREC's existing dashboard with full attribution — not rebuild their methodology. This avoids duplication of a trusted, government-partnered data product and makes accessmi.org a credible amplifier rather than a competing source.

### Fallback approach: independent implementation

If EREC declines partnership or does not respond within a reasonable outreach window, accessmi.org will implement the CAP 3:1 calculation independently using:
- LARA ArcGIS bulk download (licensed capacity, daily, CC-BY-SA)
- Census ACS B09001 (under-5 population, census tract, public domain)
- CAP's published methodology (2020 report, public domain)

In the fallback, both CAP methodology and MSU EREC's prior work will be cited explicitly in the methodology page. accessmi.org will not imply EREC endorsement.

### Phase gating

- **V4 Phase 1 (design doc) will not start until a partnership outreach decision is made.** The decision is: (a) pursue partnership with EREC, (b) build independently under fallback, or (c) deprioritize V4 entirely.
- **Phase 2 build scope depends on partnership outcome.** Partnership → embed/link + attribution layer. No partnership → independent CAP implementation + full methodology page.

### Action required before Phase 1

Human decision needed: authorize outreach to MSU EREC (erec.msu.edu), or choose fallback, or defer V4.

---

---

## Part 1 — Provider Licensing & Quality Sources

### 1. Michigan LARA / MiLEAP Child Care Licensing Database (CCHIRP)

**URL (search UI — new)**: https://cclb.my.site.com/micchirp/s/statewide-facility-search
**URL (search UI — legacy)**: https://childcaresearch.apps.lara.state.mi.us/
**URL (bulk structured download)**: https://gis-michigan.opendata.arcgis.com/datasets/Michigan::child-care-providers-1
**Access method**: ArcGIS Open Data — bulk download as CSV, GeoJSON, Shapefile, or KML (free, no registration); the search UIs are lookup-only with no bulk export
**Update frequency**: Daily (the ArcGIS layer is stated to use a live feed updated daily by MiLEAP/DTMB)
**Last observed update**: January 5, 2026 (ArcGIS metadata timestamp)
**Resolution**: Provider-level (name, address, county, ZIP, capacity, license status, age groups, inspection history)
**License**: CC-BY-SA (ArcGIS Open Data portal)
**Key fields**: Provider name, street address, city, ZIP, county, program type (center / group home / family home), license status (active/closed/pending), licensed capacity, age groups served (infant, toddler, preschool, school-age), inspection report links (PDFs), Great Start to Quality rating (in some layers)
**Feasibility tier**: ✅ for ArcGIS bulk download; 🔴 for scraping search UIs
**Current Michigan count**: **7,823 licensed programs** — 4,598 center-based, 1,409 group homes, 1,816 family child care homes (MiLEAP Section 1007 Landscape Report, FY2026, April 2026)

**⚠️ Critical access findings:**
- Michigan does NOT publish a native bulk CSV from the LARA/MiLEAP search portals. The ArcGIS hub layer (gis-michigan.opendata.arcgis.com) is the only free structured download outlet.
- Michigan does NOT have a LARA childcare dataset on data.michigan.gov (Socrata). The ArcGIS hub is the structured open-data home.
- **CCHIRP robots.txt** (cclb.my.site.com): returns HTTP 403 — no public robots.txt. Salesforce Community Cloud portals default to disallowing all crawlers. Scraping is legally unclear and likely prohibited by Salesforce/Michigan terms of service.
- **Legacy search robots.txt** (childcaresearch.apps.lara.state.mi.us): request timed out — unclear status.
- **ArcGIS layer completeness**: Stated to reflect the live MiLEAP/CCLB database but this is a GIS-derived layer. Whether it includes 100% of the CCHIRP master database is not officially confirmed. Use as primary but note potential completeness gap.
- **FOIA route**: Direct bulk extract from MiLEAP-CCLB is available via FOIA — contact MiLEAP-CCLB-Help@mi.gov or 517-284-9730. This is the definitive route for verified capacity data.
- A 2020 GitHub project (github.com/Ry4an/mi-child-care-licenses) confirms no bulk download existed at that time and required page-by-page scraping. The ArcGIS layer appears to postdate this.

---

### 2. Michigan Great Start to Quality (GSQ) Rating System

**URL**: https://greatstarttoquality.org/great-start-to-quality-participation-data/
**Access method**: Web portal (stage.worklifesystems.com) for individual provider browsing; bulk data via custom request to greatstarttoquality@ecic4kids.org or 1-877-614-7328; no public API or downloadable CSV
**Update frequency**: Monthly (participation snapshots); individual ratings updated as providers are reassessed
**Last observed update**: March 2, 2026 (most recent participation snapshot)
**Resolution**: Provider-level (quality tier per program)
**License**: Unclear / proprietary — administered by Early Childhood Investment Corporation (ECIC), a state-funded nonprofit; not an open-data license
**Key fields**: Provider name, program type, quality level (1–5 star or "Participating"), county/region, participation status, linked to LARA license number
**Feasibility tier**: ⚠️

**Participation statistics (as of March 2, 2026):**
- 7,736 eligible programs statewide
- **4,487 participating** (58% participation rate)
- 3,982 at "Enhancing Quality" (level 3) or higher
- **42% of licensed programs do not have a quality rating**

**⚠️ Critical design constraint:**
Quality ratings are voluntary. An unrated provider is not low-quality by definition — many high-quality small providers opt out due to administrative burden. Any desert analysis that uses only GSQ-rated providers underestimates supply. The LARA licensed capacity count (Source 1) must be the primary supply measure; GSQ rating is a supplementary quality overlay, not the denominator for desert calculation.

**Notes**: The portal allows individual provider browsing but no CSV export. A formal data request to ECIC is required for bulk ratings data. Cross-referencing with LARA ArcGIS layer (linked by license number) would be needed to join ratings to capacity data.

---

## Part 2 — State Program Enrollment Sources

### 3. MDE / MiLEAP Child Development and Care (CDC) Subsidy Program

**URL**: https://www.michigan.gov/mileap/early-childhood-education/early-learners-and-care/cdc
**Data and Reporting**: https://www.michigan.gov/mileap/early-childhood-education/early-learners-and-care/cdc/data-and-reporting
**Aggregate stats**: https://www.michigan.gov/mikidsmatter/providers/subsidy
**Access method**: PDF/narrative annual reports; web dashboard (no export); FOIA or formal research data agreement for structured county-level data
**Update frequency**: Annual (Michigan Landscape Report required by statute, due April 1 each year for prior fiscal year)
**Last observed update**: April 1, 2026 (FY2026 Section 1007 Landscape Report published); FY2024 data reported
**Resolution**: Statewide aggregate in published reports; county-level requires FOIA
**License**: Public domain (state government data); no download available
**Key fields (aggregate)**: Children receiving CDC scholarships by age group (0–5, 6–12), licensed vs. license-exempt providers accepting subsidies, scholarship amounts, provider type breakdown
**Feasibility tier**: 🔴 for county-level structured data; ⚠️ for statewide aggregate narrative

**Key Michigan figure**: In FY2023, **42,704 Michigan children ages 0–5** received CDC scholarships. Only **4.7% of Michigan children 0–5** receive CDC scholarships (MLPP 2024).

**Notes**: CDC subsidy data is NOT published at county or provider level in open formats. Annual Landscape Reports are narrative PDFs with statewide breakdowns. For V4, CDC acceptance rate by provider (which providers accept subsidies) is partially captured in the MSU EREC Child Care Mapping Project (supplemental finding below), but a formal MiLEAP data agreement is the reliable route for county-level subsidy data.

---

### 4. Michigan Great Start Readiness Program (GSRP) — MDE / CEPI

**URL (public aggregate)**: https://www.mischooldata.org/early-childhood-program-participation/
**URL (researcher files)**: https://medc.miedresearch.org/dataset/early-childhood-demographics-and-program-enrollment
**URL (CEPI MSDS early childhood)**: https://www.michigan.gov/cepi/pk-12/msds/early-childhood
**Access method**: MI School Data — downloadable spreadsheets (ISD/county/district level) without registration; researcher microdata via Michigan Education Data Center (MEDC) application (IRB + data use agreement required)
**Update frequency**: Annual (per school year; fall, spring, and year-end MSDS collections)
**Last observed update**: 2023–24 school year (most recent public data)
**Resolution**: Statewide, ISD (Intermediate School District), school district, and school level in public files; county-level accessible via query tool; census tract only in researcher microdata
**License**: Public domain (state government data); researcher files require DUA
**Key fields**: GSRP enrollment counts by ISD/district/school, delivery schedule (half-day/full-day/extended), demographic breakdowns; researcher files add student demographics, program participation dates, county/ZIP of residence
**Feasibility tier**: ✅ (public aggregate at ISD/county level, free downloadable spreadsheets)

**Key Michigan figure**: 2023–24 GSRP enrollment: **41,120 children** (up 2,980 from prior year).

**Notes**: MI School Data provides downloadable spreadsheets; county-level counts are extractable via the query tool without a formal data request. CEPI does not publish standalone "data portraits" by county — use the MI School Data query interface. The NIEER State Preschool Yearbook (https://nieer.org/yearbook/2024/state-profiles/michigan) publishes an annual Michigan profile with funding, enrollment, and quality standard comparisons against all 50 states — useful for benchmarking.

---

## Part 3 — Demographic and Methodology Sources

### 5. Census ACS Table B09001 — Population Under 18 by Age (Under-5 Subgroup)

**URL**: https://data.census.gov/table/ACSDT5Y2023.B09001
**API (variables)**: https://api.census.gov/data/2023/acs/acs5/groups/B09001.json
**API (Michigan county)**: `https://api.census.gov/data/2023/acs/acs5?get=NAME,group(B09001)&for=county:*&in=state:26`
**API (Michigan census tract)**: `https://api.census.gov/data/2023/acs/acs5?get=NAME,group(B09001)&for=tract:*&in=state:26`
**Access method**: REST API (free; API key recommended for production use)
**Update frequency**: Annual (5-year estimates released each December)
**Last observed update**: 2023 ACS 5-year estimates (released December 2024; covers 2019–2023)
**Resolution**: Census tract, county, ZCTA (ZIP proxy), state
**License**: Public domain (U.S. Census Bureau)
**Key fields**:
- `B09001_002E` — Population under 3 years
- `B09001_003E` — Population 3 and 4 years
- `B09001_004E` — Population 5 years (boundary case; typically excluded from under-5 childcare demand)
- Each estimate has a corresponding margin of error variable

**Under-5 derivation**: `B09001_002E + B09001_003E` = children under 5 (the numerator for CAP desert ratio)

**Feasibility tier**: ✅
**Notes**: Use 5-year ACS for census tract resolution (1-year not available at tract level). Michigan state FIPS = 26. No API key required for low-volume queries.

---

### 6. Census ACS Table B23008 — Children by Parental Work Status

**URL**: https://data.census.gov/table/ACSDT5Y2023.B23008
**API (variables)**: https://api.census.gov/data/2023/acs/acs5/groups/B23008.json
**API (Michigan county)**: `https://api.census.gov/data/2023/acs/acs5?get=NAME,group(B23008)&for=county:*&in=state:26`
**Access method**: REST API (same as B09001)
**Update frequency**: Annual (ACS 5-year)
**Last observed update**: 2023 ACS 5-year estimates (December 2024)
**Resolution**: County and census tract (5-year); state (1-year and 5-year)
**License**: Public domain
**Key fields (under-6 subgroup — primary for childcare demand)**:
- `B23008_002E` — Under 6 years, total own children
- `B23008_004E` — Under 6, two parents, both in labor force ← core "working-parent demand" proxy
- `B23008_010E` — Under 6, father only in labor force (single-father household)
- `B23008_013E` — Under 6, mother only in labor force (single-mother household)
- Full table title: **"Age of Own Children Under 18 Years in Families and Subfamilies by Living Arrangements by Employment Status of Parents"**

**Feasibility tier**: ✅
**Notes**: This table provides the demand-side precision layer: children whose parents are in the labor force have an immediate childcare need. Universe = own children in families and subfamilies (excludes group quarters). County-level data available for all 83 Michigan counties in 5-year estimates. Census tract available in 5-year only.

---

### 7. Center for American Progress — Childcare Desert Methodology

**URL (series landing page)**: https://www.americanprogress.org/series/child-care-deserts/
**URL (interactive map tool)**: https://childcaredeserts.org/
**URL (original 2017 report)**: https://www.americanprogress.org/article/mapping-americas-child-care-deserts/
**Access method**: HTML reports and methodology PDFs; interactive map tool (no CSV export); no state-by-state raw data download
**Update frequency**: Discrete research reports (2016, 2017, 2018, 2020, 2022); not a rolling data product
**Last observed update**: August 2020 (most recent standalone methodology report: "Costly and Unavailable"); June 2, 2022 (most recent article in the series — policy piece, not a new dataset); interactive map © 2020
**Resolution**: Census tract (methodology); ZIP and state browsable in interactive tool
**License**: Proprietary (CAP reports); underlying data inputs (Census + state licensing databases) are public domain
**Key fields / methodology**: Supply-demand ratio, urban/rural/suburban stratification, income quintile stratification
**Feasibility tier**: ⚠️ (methodology replicable; no direct data download)

**⚠️ Version note**: The V4 plan references "2018, updated 2021." No standalone 2021 update report exists in the CAP series. The most recent standalone CAP childcare desert methodology report is from **August 2020**. The "2021" reference in circulation appears to conflate the 2020 infant/toddler desert report with the series generally. Use "CAP 2020" as the citation, not "CAP 2021."

**Exact desert definition** (use this in all V4 copy):
> A census tract is a **childcare desert** if it has **more than 3 children under age 5 for every 1 licensed childcare slot**, OR if it has 50 or more children under age 5 and zero licensed providers within the tract.

**Michigan application**: The MuckRock GitHub project (github.com/MuckRockMichiganChildCare/Michigan-Child-Care) applied this exact CAP methodology to Michigan using 2022 LARA data, found **20 Michigan counties meeting the desert threshold**, and published CSV data files publicly. The MSU EREC Child Care Mapping Project (erec.msu.edu/projects/child-care-mapping-project) also applies CAP methodology to Michigan at county and ZIP level and is updated daily using the LARA live data feed. **accessmi.org should align with MSU EREC's methodology rather than replicating it independently.**

---

### 8. Bipartisan Policy Center — National and State Child Care Capacity Data

**URL (2025 update)**: https://bipartisanpolicy.org/article/state-child-care-data-2025-update/
**URL (2023 report)**: https://bipartisanpolicy.org/report/national-state-child-care-data-2023/
**URL (Michigan fact sheet, legacy 2018)**: https://bipartisanpolicy.org/wp-content/uploads/2018/12/Michigan-State-Fact-Sheet.pdf
**Access method**: State fact sheet PDFs (downloadable from report pages); interactive state-by-state map (no confirmed CSV export); no REST API
**Update frequency**: Periodic major reports (2023, 2025); Michigan fact sheets with each report cycle
**Last observed update**: February 5, 2026 (2025-update article); Michigan fact sheet — 2018 vintage (legacy)
**Resolution**: State-level (fact sheets); the 2025 interactive "Child Care Gaps Assessment" tool (joint with BPC, Buffett Early Childhood Institute, Child Care Aware of America) provides county and congressional district exploration, but CSV export is not confirmed
**License**: Proprietary (BPC report); underlying data from public sources
**Key fields**: Children under 5 with working parents (demand), licensed childcare slots (supply), supply/demand gap, average annual care cost, public funding allocations, provider count, workforce data
**Feasibility tier**: ⚠️
**Notes**: The 2025 interactive tool is the current BPC outlet for county-level Michigan data, but raw data download is not publicly available. BPC is most useful as a secondary cross-state comparison source and for supply-demand gap framing. The Michigan-specific fact sheet is 2018 vintage — use MLPP and MiLEAP as Michigan primaries instead.

---

## Part 4 — Michigan Policy and Cost Sources

### 9. MDE / MiLEAP Child Care Market Rate Survey (MRS)

**URL (2023 draft report)**: https://www.michigan.gov/mileap/-/media/Project/Websites/mileap/Documents/Early-Childhood-Education/Child-Development-and-Care/2024-docs/partner-files/MRS_Draft_Report-Revisions.pdf
**URL (2020 final report)**: https://www.michigan.gov/mileap/-/media/Project/Websites/mileap/Documents/Early-Childhood-Education/Child-Development-and-Care/partner_docs/mrs_final_report_ada.pdf
**Contractor**: Public Policy Associates, Inc. (publicpolicy.com)
**ICPSR archive**: https://www.icpsr.umich.edu/web/ICPSR/series/264 (structured historical MRS data for researchers)
**Access method**: PDF report; no machine-readable download; ICPSR provides structured researcher access to archived survey data
**Update frequency**: Biennial (required by CCDF federal regulations for states receiving Child Care Development Fund)
**Last observed update**: 2023 MRS (survey administered November 2023; draft report published 2024; final expected 2024–2025). Prior cycle: 2020.
**Resolution**: County-level (rates broken out by region/county, facility type, age group, and quality rating level)
**License**: Public domain (state government-commissioned report)
**Key fields**: Weekly and hourly care prices by: county/region, facility type (center vs. family home), age group (infant, toddler, preschool, school-age), GSQ star level (1–5); 75th percentile market rate (used to set CDC reimbursement rates)
**Feasibility tier**: ⚠️
**Notes**: Most current cost-by-county source. The 2023 MRS draft is confirmed at the URL above; the final published version may be at a nearby URL on the MiLEAP site. Prices remain relatively stable across GSQ levels 1–3 but increase at levels 4–5. For V4 affordability context (not calculator), extract county average rates from the PDF and store in Supabase with explicit vintage label ("2023 MRS — most current available"). ICPSR archives prior surveys in structured form for researchers who need time-series cost data.

---

### 10. Michigan League for Public Policy (MLPP) — Childcare Policy Briefs

**⚠️ Organization name correction**: The V4 plan lists "Michigan League of Education Voters (MLEV)" — this organization does not exist. The correct Michigan-specific organization is the **Michigan League for Public Policy (MLPP)** at mlpp.org, which is Michigan's KIDS COUNT data partner. Note: educationvoters.org is a Washington State organization with no Michigan content.

**URL**: https://mlpp.org/child-care-in-michigan/
**URL (2024 Kids Count Spotlight)**: https://mlpp.org/kids-count/2024-spotlight-on-child-care/
**URL (2024 Early Childhood PDF)**: https://mlpp.org/wp-content/uploads/2000/08/kids-count-early-childhood-report-august-2024-final.pdf
**URL (county fact sheets)**: https://mlpp.org/child-care-in-michigan/ (individual county PDFs linked on this page)
**Access method**: PDF reports and HTML articles; county-level data in individual county PDF fact sheets; no structured data download
**Update frequency**: Annual (Kids Count Data Book each fall; spotlight reports periodically); 2025 data book expected fall 2025
**Last observed update**: August 2024 (2024 Kids Count Early Childhood Spotlight report)
**Resolution**: Statewide narrative with county-level cost fact sheets; some metrics are Michigan statewide only
**License**: Open — nonprofit advocacy reports, freely downloadable
**Key fields**: Child poverty rates (ages 0–5), average monthly childcare cost (center-based), % children receiving CDC scholarship, workforce wages, economic impact, pre-K enrollment rates, number of children affected by childcare gaps
**Feasibility tier**: ✅ (free, accessible; not structured data — advocacy briefs with synthesized statistics)

**Key Michigan figures from MLPP 2024:**
- Michigan loses **~$2.88 billion in economic activity annually** due to childcare shortages
- Only **4.7% of Michigan children 0–5** received CDC scholarships at end of 2024
- Child poverty rate for Michigan children ages 0–5: reported in county fact sheets

---

### 11. Child Care Aware of America — Michigan State Fact Sheet

**URL**: https://www.childcareaware.org/state/michigan-5/
**URL (2024 Price & Supply national report)**: https://www.childcareaware.org/price-landscape24/
**URL (data center)**: https://data.childcareaware.org/
**Access method**: PDF state fact sheets (downloadable); interactive national data center (no confirmed Michigan-specific export); no bulk API
**Update frequency**: Annual (state fact sheets with each national price/supply report)
**Last observed update**: CCAoA Michigan state fact sheet: **September 16, 2020** (outdated). 2024 Price & Supply national report (published 2024) contains Michigan data. data.childcareaware.org last modified May 2, 2025 but Michigan is not among the featured interactive states.
**Resolution**: State-level (fact sheet); national report includes state-level metrics
**License**: Proprietary (CCAoA report); data sourced from state licensing databases + Census
**Key fields**: Licensed center count, licensed family childcare home count, total licensed slots, average annual cost (infant center, infant FCC, toddler, preschool), cost as % of median family income, % of children in deserts
**Feasibility tier**: ⚠️
**Notes**: The Michigan-specific CCAoA fact sheet is from 2020 and is too stale for a current dashboard. For Michigan-specific current data, use MLPP and MiLEAP as primaries. The 2024 national Price & Supply report has usable Michigan data within the national dataset; the CCAoA data center is most useful for cross-state benchmarking. For up-to-date Michigan-specific structured data, a direct request to CCAoA would be needed.

---

### 12. Zero to Three — State of Babies Yearbook (Michigan Profile)

**URL**: https://stateofbabies.org/state/michigan/
**URL (yearbook home)**: https://stateofbabies.org/
**Access method**: PDF state profile (downloadable per state); interactive web profile; "Get the Data" feature provides state-by-state indicator downloads; no REST API
**Update frequency**: Annual (most recent is 2023 Yearbook, published October 2023; 2024 edition not yet confirmed)
**Last observed update**: 2023 Yearbook (October 2023)
**Resolution**: State-level; some indicators have income, race/ethnicity, and urbanicity breakdowns
**License**: Publicly accessible (Zero to Three nonprofit); underlying data from public domain federal datasets
**Key fields**:
- Michigan babies: 320,698 (3.2% of state population)
- 41.4% in households below 2× federal poverty line
- % income-eligible infants/toddlers with Early Head Start access: **13.0%**
- % low/moderate-income children in childcare subsidy: **3.6%**
- Cost of care as % of income, developmental screening rates, infant mortality, WIC participation, uninsured rates
- Michigan "Positive Early Learning Experiences" tier: **"Reaching Forward"** (mid tier)
**Feasibility tier**: ✅ (free PDF download; best as secondary reference)
**Notes**: Primary value is infant/toddler-specific metrics (birth–3) not captured by GSRP (which starts at 3–4 years) or ACS tables alone. Prior year profiles (2022, 2021, 2020, 2019) are also available. The "Get the Data" feature on stateofbabies.org provides structured state-by-state exports.

---

## Part 5 — Supplementary Findings (not in original source list)

### Michigan-Specific Desert Analysis Already Exists

**MSU EREC Child Care Mapping Project**
**URL**: https://erec.msu.edu/projects/child-care-mapping-project
**What it is**: Michigan State University Engaged Research and Evaluation Center, in partnership with MiLEAP, maintains a child care desert map applying CAP's 3:1 methodology to Michigan at county and ZIP code level — updated daily from the LARA live data feed.
**MiLEAP/MSU joint report**: Published April 1, 2026 — "Advancing Michigan's PreK System through Growth and Opportunity" (https://www.michigan.gov/mileap/press-releases/2026/04/01/report-michigan-prek-access-early-childhood-system)

**MuckRock Michigan Child Care Deserts (GitHub)**
**URL**: https://github.com/MuckRockMichiganChildCare/Michigan-Child-Care
**What it is**: Open-source application of CAP methodology to Michigan using 2022 LARA data; found **20 Michigan counties meeting the desert threshold**; CSV data files publicly available in the repo.

---

## Part 6 — Claim Verification

| Claim (source or plan) | Status | Verified figure / caveat |
|---|---|---|
| "7,823 licensed Michigan programs" | ✅ Verified | MiLEAP Section 1007 Landscape Report, April 2026 |
| "CAP definition: 3+ children per licensed slot" | ✅ Verified | CAP 2016/2017/2020 reports; applied consistently |
| "CAP 2018, updated 2021" | ⚠️ Partially incorrect | Most recent standalone CAP desert report is August **2020**, not 2021. Use "CAP 2020" as citation. |
| "MLEV childcare analyses" | 🔴 Organization does not exist | The correct org is **MLPP** (mlpp.org), Michigan's KIDS COUNT partner |
| "42,704 Michigan children 0–5 received CDC scholarships" (FY2023) | ✅ Verified | MiLEAP annual Landscape Report |
| "4.7% of Michigan children 0–5 receive CDC" | ✅ Verified | MLPP 2024 Kids Count Spotlight |
| "GSQ 5-star voluntary system" | ✅ Verified | 42% of licensed programs do not participate; unrated ≠ low quality |
| "20 Michigan counties are childcare deserts" | ✅ Confirmed (2022 data) | MuckRock CAP-methodology application to Michigan |

---

## Summary — Risks and Recommendations

**1. LARA ArcGIS is the primary structured download, but confirm completeness.**
The CC-BY-SA bulk GIS layer is the legally clean, daily-updated source. Before building any V4 feature, download a sample and cross-check provider count against the MiLEAP Landscape Report total (7,823). If materially incomplete, escalate to FOIA for the master CCHIRP extract.

**2. Great Start to Quality ratings require a formal data request.**
No bulk export exists. Plan for a 5–10 business day lead time. GSQ data enriches the provider layer but is a quality overlay, not the supply denominator — the licensed capacity count from LARA drives the desert ratio.

**3. CDC subsidy data requires FOIA or a MiLEAP data agreement for county resolution.**
Statewide aggregate is published annually. Do not publish county-level CDC acceptance rates without a formal data source. Use the MLPP statewide 4.7% figure as a context data point only.

**4. CAP methodology is the standard, but MSU EREC is already doing this for Michigan.**
The MSU/MiLEAP Child Care Mapping Project applies CAP methodology to Michigan daily. accessmi.org should surface, link, and cite MSU EREC's work rather than reinventing the calculation. If V4 computes its own desert ratio, it must align with the MSU EREC methodology and cite it explicitly.

**5. The Market Rate Survey (Source 9) is PDF-only.**
County childcare cost data must be extracted from the 2023 MRS draft. No machine-readable version is published. Use DataProvenance with the 2023 vintage label ("2023 MRS — most current available; biennial cadence").

**6. Source 10 ("MLEV") does not exist.**
The correct Michigan childcare policy org is MLPP (mlpp.org). Update any V4 design doc copy that references "MLEV" before it ships.

**7. Under-5 population from ACS B09001 requires a derivation step.**
"Under 5" = `B09001_002E` (under 3) + `B09001_003E` (3 and 4 years). `B09001_004E` (5 years) is not included. This derivation must be documented in the methodology page.

**8. Working-parent overlay (B23008) is valuable but adds complexity.**
`B23008_004E` (under 6, two parents both in labor force) refines the demand estimate beyond raw under-5 population. It is appropriate for the precision layer of Feature 2 or 3 — not for the headline desert ratio, which should use the CAP-standard under-5 population total for comparability with existing Michigan analyses.
