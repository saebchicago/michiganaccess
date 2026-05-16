# V3 Source Audit — SNAP at Risk: Michigan Food Assistance Under P.L. 119-21

Produced: 2026-04-08
Status: Phase 0 complete — awaiting human review before Phase 1

---

## Part 1 — SNAP Enrollment & Benefits Sources

### 1. USDA FNS SNAP Data Tables

**URL**: https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap
County Excel archive (Azure CDN): `https://fns-prod.azureedge.net/resource-files/snap-county-tableYYYY.xlsx` (navigate from portal for current link)
**Access method**: Bulk download — Excel (.xlsx) and PDF; no REST API
**Update frequency**: State participation — monthly (~2-month lag); county — annual (~12-month lag)
**Last observed update**: State tables through early FY2025 (published early 2026); county tables last published covering FY2022
**County resolution**: Yes — annual only; Michigan reports all 83 counties
**License**: Public domain (U.S. federal government)
**Key fields**: County FIPS, total persons participating, households participating, avg monthly benefit per household, total benefit issuance, household composition (children, elderly/disabled)
**Feasibility tier**: ✅
**Notes**: The ERS SNAP Data System (historical time-series atlas) was discontinued. County time-series back to 2010 is archived at USDA Ag Data Commons but no longer updated. The FNS annual county Excel is the only current source for county-level enrollment. Expect ~1-year data lag for all county numbers. Michigan FY2022 county file is the most recent available.

---

### 2. MDHHS Food Assistance Program (Green Book / Pub-170)

**URL**: https://www.michigan.gov/mdhhs/inside-mdhhs/reports-stats/green-book
Annual report: https://www.michigan.gov/en/mdhhs/inside-mdhhs/reports-stats/key-stats-annual
**Access method**: PDF download only — no CSV, no API
**Update frequency**: Monthly (Green Book); annual (Pub-170 / Pub-64 county summary)
**Last observed update**: February 2026 Green Book confirmed published; FY2024 Annual Report available
**County resolution**: Yes — all 83 Michigan counties in both Green Book and Annual Report
**License**: Public domain (Michigan state government)
**Key fields**: FAP cases open, persons receiving benefits, average benefit amount, new applications, closures, redeterminations completed; same report also covers cash assistance and Medicaid
**Feasibility tier**: ⚠️
**Notes**: Michigan calls SNAP the "Food Assistance Program" (FAP) internally. The Green Book is the most current Michigan county SNAP source (monthly) but requires PDF parsing — no machine-readable format published. Redetermination completion rates are in the Annual Report and are material for P.L. 119-21 analysis (states must run redeterminations on newly ineligible ABAWDs). The Feb 2026 Green Book is the most recent data available, roughly 6 weeks fresher than the FNS state tables.

---

### 3. USDA SNAP Retailer Locator

**URL**: https://www.fns.usda.gov/snap/retailer-locator/data
ArcGIS Hub: https://usda-snap-retailers-usda-fns.hub.arcgis.com/datasets/USDA-FNS::snap-retailer-location-data/
Data.gov: https://catalog.data.gov/dataset/snap-retail-locator
**Access method**: Bulk CSV (zipped), available state-by-state or full national; also ArcGIS feature service / GeoJSON
**Update frequency**: Quarterly
**Last observed update**: December 31, 2025 (historical archive confirmed through this date)
**County resolution**: Yes — full street address + latitude/longitude; county assignable via FIPS lookup or geocode
**License**: CC-BY (Creative Commons Attribution per Data.gov listing)
**Key fields**: Store name, store type/category (supermarket, convenience, farmers market, etc.), street address, city, state, ZIP, lat/lon, authorization begin date, authorization end date (historical file)
**Feasibility tier**: ✅
**Notes**: Michigan has 9,200+ authorized SNAP retailers per MLPP (confirmed independently). Historical ZIP includes all retailers authorized in the past 20 calendar years — useful for tracking food retail access churn. The Data.gov "last modified" date of 2014 reflects metadata staleness only; the underlying CSV is updated quarterly.

---

### 4. USDA Food Access Research Atlas

**URL**: https://www.ers.usda.gov/data-products/food-access-research-atlas/
Download: https://www.ers.usda.gov/data-products/food-access-research-atlas/download-the-data/
**Access method**: Bulk Excel (.xlsx) and shapefile (ZIP)
**Update frequency**: Irregular — not annual; current dataset uses 2019 store directories
**Last observed update**: April 27, 2021 (2019 reference year data); documentation page refreshed January 5, 2025 but underlying data unchanged
**County resolution**: Census tract (not county); tracts aggregatable to county
**License**: Public domain (USDA)
**Key fields**: Census tract FIPS, low-income flag, low-access flags at ½/1/10/20-mile thresholds, vehicle access overlay, SNAP recipient count, population counts (by age/race/ethnicity), poverty rate, median income, urban/rural, store counts by type
**Feasibility tier**: ⚠️
**Notes**: Data is significantly outdated (2019 store data, 5+ years old). Not appropriate as a "current" food access metric for a 2025–2026 dashboard. Use with explicit vintage label or consider using the USDA ERS Food Environment Atlas (separate product, more recently updated) for county-level store access metrics. A new Atlas edition has been discussed but not released as of April 2026.

---

### 5. Feeding America Map the Meal Gap

**URL**: https://www.feedingamerica.org/research/map-the-meal-gap/by-county
Interactive map: https://map.feedingamerica.org/
2025 report PDF: https://www.feedingamerica.org/sites/default/files/2025-05/Map%20the%20Meal%20Gap%202025%20Report.pdf
**Access method**: Requires completing a Qualtrics form request on the by-county page — no direct public CSV. PolicyMap redistributes under a separate license (institutional subscription required).
**Update frequency**: Annual (released each May with prior-year data)
**Last observed update**: May 2025 (covers 2023 data — the most recent release)
**County resolution**: Yes — all ~3,143 U.S. counties
**License**: CC-BY 4.0 (confirmed from structured data on the map page)
**Key fields**: Overall food insecurity rate, child food insecurity rate, senior food insecurity rate, food insecurity rate by race/ethnicity, food insecurity rate by income band, food budget shortfall per food-insecure person, average cost per meal by county ($2.60–$6.09), total meal gap (meals needed)
**Feasibility tier**: ⚠️
**Notes**: Most widely used county-level food insecurity estimate in the country. Methodology uses USDA ERS, Census, BLS, and NIQ grocery price data. Michigan 2023 county estimates are included. The form approval process is generally straightforward for public-interest research uses. No bulk API exists. Data lag: May 2025 release = 2023 data = 2-year lag. Must label as "2023 estimate" in UI.

---

## Part 2 — Policy Projection Sources

### 6. CBO Score of P.L. 119-21 (One Big Beautiful Bill) — SNAP Provisions

**URL**: CBO SNAP participation effects document: https://www.cbo.gov/system/files/2025-08/61367-SNAP.pdf (August 2025)
CBO publication page: https://www.cbo.gov/publication/61367
Full budgetary effects of enacted law: https://www.cbo.gov/publication/61570
House-passed HR 1 score (for comparison): https://www.cbo.gov/publication/61461
**Access method**: PDF (free download; no API)
**Update frequency**: One-time legislative score; supplemental SNAP document published August 2025 post-enactment
**Last observed update**: August 13, 2025 (standalone SNAP participation document confirmed)
**County resolution**: No — national projections only
**License**: Public domain (Congressional Budget Office)
**Key fields**: Projected change in monthly SNAP participation (persons), projected 10-year federal spending reduction, breakdown by provision type
**Feasibility tier**: ⚠️

**CBO numbers confirmed (use these, not advocacy rounding):**
- **Enacted P.L. 119-21 SNAP participation loss**: ~**2.4 million people per month on average** over 2025–2034 (the work-requirement expansion — ABAWD provisions — accounts for the majority of this)
- **Enacted P.L. 119-21 10-year federal spending reduction**: ~**$186.7 billion** over FY2025–2034 (nutrition/SNAP provisions)
- **House-passed HR 1 SNAP score (for comparison)**: ~$285.7 billion over FY2025–2034 — this is the number most widely cited in pre-enactment advocacy; the enacted law is materially lower due to Senate modifications

**Note on circulating figures**: "$295B," "$290B," "$285B," "$186B" all refer to different bill versions or different rounding of the same CBO document. The authoritative number for P.L. 119-21 AS ENACTED is $186.7B. Do not use the House-bill figure as if it describes the enacted law.
**Notes**: CBO explicitly separates SNAP from Medicaid scoring in the supplemental document `61367-SNAP.pdf`. This is distinct from the distributional effects document (pub. 61367) which combines both programs. Use the standalone SNAP PDF as the primary citation.

---

### 7. CBPP SNAP Tracker

**URL**: State-by-state page: https://www.cbpp.org/research/food-assistance/snap-state-by-state-data-fact-sheets-and-resources
"By the Numbers" HR 1 SNAP analysis: https://www.cbpp.org/research/food-assistance/by-the-numbers-harmful-republican-megabill-takes-food-assistance-away-from
PDF: https://www.cbpp.org/sites/default/files/5-19-25fa-bythenumbers.pdf
State work-requirement estimates: https://www.cbpp.org/research/food-assistance/expanded-work-requirements-in-house-republican-bill-would-take-away-food
Implementation tracking: https://www.cbpp.org/research/food-assistance/many-low-income-people-will-soon-begin-to-lose-food-assistance-under
Michigan fact sheet: https://www.cbpp.org/sites/default/files/atoms/files/snap_factsheet_michigan.pdf
Interactive participation dashboard: https://apps.cbpp.org/program_participation/
**Access method**: HTML pages and PDFs; interactive dashboard (no API, no bulk download)
**Update frequency**: Irregular — tied to legislative events; participation dashboard roughly quarterly
**Last observed update**: September 10, 2025 (most recent SNAP implementation tracking report confirmed); state work-requirement estimates published May 2025
**County resolution**: State-level only
**License**: Proprietary (CBPP copyright; freely readable)
**Key fields**: State-level participants at risk under work requirements (by age group and family type), projected participation loss by state, state administrative cost burden, congressional-district estimates in some reports
**Feasibility tier**: ⚠️
**Notes**: CBPP is the most comprehensive non-CBO tracker of P.L. 119-21 SNAP cuts. Their state-level estimates proportionally distribute CBO national projections using FNS state participation data. Michigan-specific fact sheet available and likely updated post-enactment. CBPP estimates ~5 million people nationally "at risk" under expanded work requirements, with ~2.4M (CBO measured) actually losing benefits in an average month — the difference reflects the risk/loss distinction that the V3 design must preserve.

---

### 8. MLPP SNAP Analysis

**URL**: HR 1 food assistance impact: https://mlpp.org/the-cost-of-the-federal-megabill-food-assistance/
Megabill overview: https://mlpp.org/stakes-are-high-megabill/
**Access method**: HTML narrative; no data download or API
**Update frequency**: Irregular; tied to legislative events
**Last observed update**: November 2025 (SNAP roundtable); post-enactment "Cost of the Megabill" page confirmed
**County resolution**: Michigan statewide only (with some rural county commentary)
**License**: Proprietary (MLPP copyright; freely readable)
**Key fields / Michigan-specific estimates confirmed from mlpp.org:**
- **74,000 Michigan adults at risk** of losing SNAP due to expanded work requirements (39,000 ages 55–64; 35,000 with children age 14+)
- **123,000 total people** in Michigan households at risk of losing some SNAP benefits
- ~**15,000 lawfully present immigrants** lose SNAP eligibility
- **$410 million in new annual state costs** ($90M administrative, $320M cost-sharing)
- **$33 million lost** in federal SNAP-Ed funding; 414,000 Michigan participants affected
- **$3 billion annual SNAP economic impact to Michigan**; 13,000+ jobs, $1 billion in wages
- **9,200+ Michigan SNAP-authorized retailers**
**Feasibility tier**: ⚠️
**Notes**: MLPP (Michigan League for Public Policy, mlpp.org) is the primary Michigan-focused policy organization tracking these cuts. Their estimates source from CBO, CBPP, and FNS administrative data. Distinct from MPLP (Michigan Poverty Law Program at mplp.org), which also tracks SNAP work requirement implementation at https://mplp.org/blog/snap-work-requirement-updates-after-obbba-2025. The MLPP 74,000 figure is the most specific Michigan projection available and should be the primary Michigan citation.

---

### 9. GAO Reports on SNAP Work Requirements

**URL**: GAO-19-56 (SNAP E&T programs, most directly relevant): https://www.gao.gov/products/gao-19-56
PDF: https://www.gao.gov/assets/700/696222.pdf
CBO 2022 work-requirements analysis (parallel, not GAO): https://www.cbo.gov/system/files/2022-06/57702-Work-Requirements.pdf
FNS ABAWD waiver data FY2020–2024: https://www.fns.usda.gov/snap/abawd/waivers/2020-2024
**Access method**: PDF (free download; no registration)
**Update frequency**: One-time products; no recurring cadence. Most relevant report is from 2019.
**Last observed update**: GAO-19-56 published 2019; no new GAO report specifically on SNAP work requirements confirmed post-2021
**County resolution**: No — national and state-level only
**License**: Public domain (U.S. Government Accountability Office)
**Key fields**: Historical SNAP participation by fiscal year (FY2015: ~45M → FY2019: ~35M), SNAP E&T participation rates (<1% of recipients per month in 2016), state waiver usage history, E&T program capacity by state, participant characteristics
**Feasibility tier**: ⚠️
**Notes**: GAO-19-56 is the canonical source for the finding that fewer than 1% of SNAP recipients participated in E&T programs monthly. This is the benchmark for projecting how many Michigan work-requirement-affected adults can be absorbed by existing E&T infrastructure. No updated GAO report on work requirements post-2021 was confirmed. Brookings Institution published an updated primer in April 2025 (https://www.brookings.edu/wp-content/uploads/2025/10/20250407_THP_SNAPWorkRequirements_Paper.pdf) with current historical data. Use GAO-19-56 as the E&T capacity benchmark and Brookings April 2025 as the supplemental current context.

---

### 10. USDA SNAP Employment & Training (E&T) Program Data

**URL**: Main E&T page: https://www.fns.usda.gov/snap-et
Michigan E&T State Plan: https://www.fns.usda.gov/snap-et/stateplan/michigan
SNAP State Activity Reports: https://www.fns.usda.gov/pd/snap-state-activity-reports
FY2023 SAR PDF: https://fns-prod.azureedge.us/sites/default/files/resource-files/snap-sar-fy23.pdf
Michigan SNAP-to-Skills state highlight: https://snaptoskills.fns.usda.gov/state-highlights/state-highlights-michigan
**Access method**: PDF (State Activity Reports, annual; State Plans); no CSV or API
**Update frequency**: Annual (State Activity Reports released ~12 months after fiscal year end)
**Last observed update**: FY2023 SNAP State Activity Report (published 2024); Michigan received a $750K DATA grant in 2023 to improve E&T data validity
**County resolution**: No — state-level only
**License**: Public domain (USDA)
**Key fields**: State E&T participants (volunteers and mandatory), total E&T slots, 50% reimbursement claims, program components offered (job search, training, education, workfare), participant outcomes (limited reliability per GAO), federal E&T allocation by state
**Feasibility tier**: ⚠️
**Notes**: Michigan's SNAP E&T program (FAE&T) is jointly administered by MDHHS and the Michigan Talent Investment Agency. Michigan runs a voluntary program — no mandatory E&T slots as of the last available state plan. Under P.L. 119-21's expanded work requirements (effective November 2025), Michigan must substantially expand FAE&T capacity to accommodate newly required ABAWDs aged 55–64 — a significant infrastructure constraint. New FNS reporting rules (effective FY2026) will improve E&T data quality; FY2024 reports (due ~2025) should be materially better than FY2023. Use E&T capacity data as context for why the MLPP 74K figure is likely conservative for actual participation loss.

---

## Part 3 — Cross-Program Overlap Sources

### 11. Census ACS Table B22002

**URL**: Data portal: https://data.census.gov/table/ACSDT5Y2023.B22002
Census API: `https://api.census.gov/data/2023/acs/acs5/groups/B22002.json`
Developer docs: https://www.census.gov/data/developers/data-sets/acs-5year.html
**Access method**: REST API (free; API key recommended for high volume); bulk download via data.census.gov (CSV/Excel); also via IPUMS-USA
**Update frequency**: Annual (1-year estimates released ~September; 5-year estimates released ~December)
**Last observed update**: 2023 ACS 5-year estimates released December 2024
**County resolution**: Yes — all Michigan counties in 5-year estimates; 1-year only for counties ≥65,000 population (use 5-year for full coverage)
**License**: Public domain (U.S. Census Bureau)
**Key fields**: Total households; households receiving SNAP in past 12 months × household type (married-couple family, male householder no spouse, female householder no spouse, nonfamily) × presence of children under 18; each estimate has margin of error
**Feasibility tier**: ✅
**Notes**: Table title: "Receipt of Food Stamps/SNAP in the Past 12 Months by Presence of Children Under 18 Years by Household Type for Households." Does NOT cross-tabulate with race/ethnicity or income — use S2201 (subject table) for those demographics. The 5-year ACS underestimates current SNAP enrollment relative to FNS administrative data; use FNS county tables as the primary enrollment count and ACS B22002 as demographic context.

---

### 12. Census ACS Table B27003 — IMPORTANT SPECIFICATION CORRECTION

**URL**: https://data.census.gov/table/ACSDT5Y2023.B27003
Census Reporter: https://censusreporter.org/tables/B27003/
**Access method**: REST API (same Census API as B22002); bulk download via data.census.gov
**Update frequency**: Annual
**Last observed update**: 2023 ACS 5-year estimates (December 2024)
**County resolution**: Yes (5-year; same caveats as B22002)
**License**: Public domain
**Key fields**: Public health insurance coverage status (has public coverage / no public coverage) × sex × age group (under 6, 6–18, 19–25, 26–34, 35–44, 45–54, 55–64, 65–74, 75+). Universe: civilian noninstitutionalized population.
**Feasibility tier**: ✅

**⚠️ SPECIFICATION MISMATCH — READ BEFORE USING:**
Table B27003 is titled **"Public Health Insurance Status by Sex by Age"** — it covers Medicaid/Medicare/SCHIP/VA enrollment broken down by age and sex. It has **no SNAP variable**. It cannot directly measure the overlap between SNAP and Medicaid enrollment.

**Correct approach for SNAP × Medicaid overlap (Feature 3 — Dual-Eligible Exposure Map):**
- **Option A (recommended)**: Cross-tabulate ACS PUMS microdata (SNAP receipt × health insurance status) — this is the only published federal dataset with both variables at the household level. Available via IPUMS-USA or Census PUMS.
- **Option B (proxy)**: B22002 (SNAP households by county) + V2's ACS B27010 Medicaid enrollment (existing source) → compute overlap range using state-level dual-enrollment rate from CBPP/MLPP
- **Option C (administrative, best but not public)**: MDHHS administrative cross-match data — dual SNAP+Medicaid enrollment is tracked in the FAP/Medicaid admin system but not published without FOIA

**Recommended for V3**: Use Option B as the published proxy. The national dual-enrollment rate (SNAP households that also have Medicaid) is approximately 56–62% per CBO and CBPP analysis. Apply this band to county SNAP enrollment to estimate dual exposure with explicit uncertainty labeling.

---

## Part 4 — Claim Verification

| Claim (from V3 build plan) | Status | Verified Source |
|---|---|---|
| "1.4 million Michigan SNAP recipients" | ✅ Plausible | USDA FNS state tables show Michigan at ~1.3–1.45M depending on month; use FNS most current month with as-of date |
| "CBO: ~$186B SNAP reduction over 10 years" | ✅ Verified | CBO pub. 61570 / 61367-SNAP.pdf — enacted P.L. 119-21 figure |
| "CBO: 3–4 million participation loss" | ⚠️ Reframe needed | CBO confirmed: **2.4M/month on average** over 2025–2034. "3–4 million" is pre-enactment advocacy rounding of the House bill. Use the 2.4M figure for P.L. 119-21 as enacted. |
| "74,000 Michigan adults at risk" | ✅ Verified | MLPP confirmed; sourced from CBO/CBPP/FNS proportional modeling |
| "123,000 total Michiganders" | ✅ Verified | MLPP (households including children of affected adults) |
| "$410M in new annual state costs" | ✅ Verified | MLPP: $90M admin + $320M cost-sharing |
| "9,200+ Michigan SNAP retailers" | ✅ Verified | MLPP, corroborated by USDA retailer CSV |

---

## Summary Recommendations

**1. Primary enrollment source for county dashboard**: USDA FNS annual county Excel (FY2022 most recent) for county-level counts. MDHHS Green Book (PDF) for statewide monthly freshness. Label explicitly: county data is FY2022 (published ~mid-2024), statewide is current month.

**2. MLPP 74,000 is the correct Michigan-specific projection figure**: Do not use the "3–4 million" figure that circulates in advocacy materials — that was the House bill; enacted P.L. 119-21 is 2.4M nationally per CBO. The MLPP Michigan-specific 74K is proportionally consistent with CBO.

**3. B27003 cannot serve the dual-enrollment use case**: Use ACS B27010 (V2 Medicaid source) + B22002 (SNAP households) + national dual-enrollment rate band (56–62%) as the proxy methodology for Feature 3. No single published table has both variables at county level.

**4. Feeding America data requires form request**: Plan for a 2–3 day acquisition lead time. The food insecurity rate is a strong credibility signal for the dashboard but requires proactive outreach. Alternative: use USDA ERS Food Environment Atlas for food insecurity proxy while Feeding America request is pending.

**5. USDA Food Access Research Atlas (Source 4) is too stale for current use**: The 2019 store data is 7 years old. Do not display Atlas tracts as current food-desert maps. Use only if clearly labeled "2019 data" or use retailer locator CSV (Source 3, current) as the live food access proxy.

**6. CBO figure to use**: $186.7B, not $285–295B. The enacted law figure must be used throughout. The higher figures are House-bill scores and will create credibility problems with institutional partners who check the CBO source.

**7. E&T capacity context**: Michigan's E&T program is voluntary and has historically enrolled <1% of SNAP recipients per month. Under P.L. 119-21's expanded work requirements, the program must absorb a large share of newly required ABAWDs ages 55–64. This E&T capacity gap is an important narrative element and partially explains why the MLPP 74K "at risk" figure will likely translate to a higher-than-average loss rate in Michigan relative to states with larger mandatory E&T programs.
