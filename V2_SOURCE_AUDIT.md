# V2 Source Audit
**Date:** 2026-04-08 | **Branch:** main | **Phase 0 — Discovery only. No code written.**

---

## Audit Legend
- **Access method:** API / CSV download / PDF / Scraper / FOIA
- **County-or-better resolution:** Yes / No / Partial
- **Feasibility:** ✅ Ready | ⚠️ Usable with caveats | 🔴 Blocked / requires workaround

---

## Part A — Federal Money Flow Sources

---

### Source 1: USASpending.gov API
**URL:** https://api.usaspending.gov/
**Access method:** REST API — no authentication required. All search endpoints are POST. Two relevant endpoints: `/api/v2/search/spending_by_award/` and `/api/v2/search/spending_by_geography/`.
**Update frequency:** Continuous / near-real-time as agencies submit. FY2025 (Oct 2024 – Sep 2025) is fully queryable today.
**Last update observed:** Live; FY2025 data confirmed available.
**County-or-better resolution:** Yes — `/spending_by_geography` natively aggregates to county FIPS (`geo_layer: "county"`). The award search endpoint does not accept a direct county filter — county aggregation requires the geography endpoint or ZIP-code proxies. Recipient county name and FIPS fields (`recipient_county_name`, `recipient_county_fips`) are available in award records.
**License/terms:** Public domain. Free. No rate limit documented.
**Fields available:** `award_id`, `recipient_name`, `recipient_uei`, `awarding_agency_name`, `total_obligation`, `total_outlay`, `period_of_performance_start_date`, `award_type`, `assistance_listing_numbers` (CFDA), `recipient_city_name`, `recipient_county_name`, `recipient_county_fips`, `recipient_state_name`, `recipient_zip_code`. Geography endpoint adds: `shape_code` (FIPS), `display_name`, `aggregated_amount`, `per_capita`.
**Key CFDA numbers:** 93.778 = Grants to States for Medicaid (flows to Michigan state, not county recipients); 93.224 = HRSA Health Center Program (FQHCs — these have county-level recipients).
**Feasibility:** ⚠️ **Usable with caveats.** Critical limitation: Medicaid (CFDA 93.778) is a state-level block grant to Michigan — it does not appear as county-level recipient awards. County-level federal health dollars via this API are limited to direct HRSA/HHS grantees (FQHCs, hospitals, CHCs). For Medicaid county-level allocation, a separate model from CMS enrollment data is required.

---

### Source 2: CMS Hospital Cost Reports (HCRIS)
**URL:** https://www.cms.gov/data-research/statistics-trends-and-reports/cost-reports
**NBER curated files:** https://www.nber.org/research/data/hcris-hosp
**Access method:** Bulk CSV/ZIP download. Three-file relational structure per year (Report, Numeric, Alpha-Numeric). NBER provides pre-processed flat files in SAS, Stata, and CSV. No REST API.
**Update frequency:** Annual; rolling additions within a year as hospitals file. FY2024 files are being populated throughout 2025-2026.
**Last update observed:** FY2024 available (incomplete — hospitals file on their own fiscal year); FY2022 is the most complete/settled analytical year.
**County-or-better resolution:** Yes — facility-level with full address. County derived from address/ZIP. All ~135 Michigan Medicare-certified acute care hospitals are included.
**License/terms:** Public domain federal data. Free.
**Fields available (via worksheet codes):**
- Worksheet G-3 (income statement): total revenues, total expenses → **total margin, operating margin** (must be computed)
- Worksheet S-10: charity care cost, bad debt → **uncompensated care** (must be computed with cost-to-charge ratio)
- Worksheet S-3 Part I: Medicare/Medicaid days by cost center → **Medicaid revenue %** (must be computed)
- Worksheet G (balance sheet): cash and investments → **days cash on hand** (must be computed: cash / (total expenses / 365))
- Worksheet S-2: hospital characteristics, CAH designation, teaching status, bed count
- Provider fields: CCN, provider type code, fiscal year dates, urban/rural indicator
**Feasibility:** ⚠️ **Usable with caveats.** Raw files are complex (worksheet-indexed relational flat files). Key metrics (operating margin, days cash on hand, Medicaid revenue %) must be derived — not pre-computed fields. Open-source parsers exist (NBER, `imccart/HCRIS` on GitHub). FY2022 data (lag ~3.5 years) is the most reliable for analytics; FY2023/FY2024 are partially complete.

---

### Source 3: HRSA Uniform Data System (UDS)
**URL:** https://data.hrsa.gov/topics/health-centers/uds
**Downloads:** https://data.hrsa.gov/data/download
**Access method:** CSV and XLSX download only. No public REST API for aggregate UDS data. UDS+ (FHIR-based) is a reporting mechanism for health centers to submit to HRSA — not a public access API.
**Update frequency:** Annual. Data published ~6–9 months after calendar year-end.
**Last update observed:** Calendar Year 2024 data confirmed available.
**County-or-better resolution:** Yes — facility-level. Physical address available; county derivable from ZIP. A **Patients by ZIP Code** table gives ZIP-level patient counts by payer type per grantee.
**License/terms:** Public domain HRSA open data. Free.
**Fields available:**
- Table 3A: unduplicated patients by age/sex
- Table 4 (payer mix): Medicaid/CHIP patients, Medicare patients, uninsured/self-pay, private insurance — counts and percentages
- Patients by ZIP Code: uninsured, Medicaid/CHIP, Medicare, private, total — at ZIP per facility
- Table 9D (revenue by payer): Medicaid, Medicare, self-pay/sliding scale, other
- Table 9E (other revenue): Section 330 federal grants, state/local grants
- Table 9F (expenses): salaries, fringe, overhead, total costs
- Facility: name, grant number, state, city, address, ZIP, program type
**Coverage note:** Covers only HRSA-funded health centers and look-alikes (~50+ Michigan grantees). Financial data is at the grantee organization level, not per delivery site.
**Feasibility:** ✅ **Ready.** Clean CSV downloads, annual cadence, county-derivable. Platform already has an hrsa-data Edge Function proxy — extend it.

---

### Source 4: CMS Provider of Services (POS) File
**URL:** https://data.cms.gov/provider-characteristics/hospitals-and-other-facilities/provider-of-services-file-hospital-non-hospital-facilities
**NBER mirror:** https://www.nber.org/research/data/provider-services-files
**Access method:** Bulk CSV/ZIP download. Quarterly updates. No REST API for the file itself.
**Update frequency:** Quarterly (Q1–Q4 each calendar year).
**Last update observed:** Q4 2024 confirmed via NBER.
**County-or-better resolution:** Yes — facility-level with full address including county FIPS (`CNTY_CD`).
**License/terms:** Public domain federal data. Free.
**Fields available:** `PRVDR_NUM` (CCN), `FAC_NAME`, `CITY_NAME`, `STATE_CD`, `ZIP_CD`, `CNTY_CD`, `PRVDR_CTGRY_CD` (provider type), `PRVDR_CTGRY_SBTYP_CD` (subtype — 11 = Critical Access Hospital, 22 = Rural Emergency Hospital), `CRTFCTN_DT`, `TRMNTN_EXPRTN_DT`.
**Important gaps:**
- Sole Community Hospital (SCH) designation: **NOT in POS** — use CMS IPPS Impact Files separately
- Maternity ward: **NOT in POS** — use AHA Annual Survey (`EMDEPT`)
- ED status: **NOT in POS** — use AHA Annual Survey
- Rural classification: Not a binary flag — derive from `CNTY_CD` crossed with FORHP eligible areas file, or use CAH subtype as proxy
**Feasibility:** ✅ **Ready.** POS is the authoritative source for Medicare/Medicaid certification status and CAH/REH designation. Complete for Michigan. Quarterly cadence is best-available for facility status tracking.

---

### Source 5: CMS State Medicaid Spending and Enrollment
**URL (enrollment):** https://www.medicaid.gov/medicaid/national-medicaid-chip-program-information/medicaid-chip-enrollment-data/
**URL (expenditures):** https://www.medicaid.gov/medicaid/financial-management/state-budget-expenditure-reporting-for-medicaid-and-chip/
**URL (portal):** https://data.medicaid.gov/
**Access method:** Downloadable Excel/PDF tables (enrollment). ZIP files of Excel workbooks (expenditures / MBES-CBES). data.medicaid.gov has structured CSV access for some datasets. No bulk REST API.
**Update frequency:** Enrollment: quarterly reports (~6–9 month lag). Expenditures: quarterly submissions, 18–24 month lag for final certified figures.
**Last update observed:** Enrollment: April–June 2025 (posted Feb 2026). Expenditures: FY2024 data available; FY2023 complete.
**County-or-better resolution:** **No. State-level only.** MBES collects state-aggregate counts. County-level Medicaid enrollment requires either Michigan MDHHS administrative data (state-sourced) or CMS T-MSIS research files (requires DUA — not suitable for public-facing platform).
**License/terms:** Public domain federal data. Free.
**Fields available:** Enrollment by eligibility group (Aged, Blind/Disabled, Children, Adults/ACA expansion, CHIP); expenditures by service category (inpatient, outpatient, nursing facility, managed care, HCBS, admin).
**Feasibility:** ⚠️ **State-level only.** Useful for Michigan statewide enrollment baseline and trend. Cannot drive county-level features directly. For county Medicaid enrollment, use ACS B27010 as proxy (see Source 19).

---

### Source 6: Michigan MDHHS Rural Health Transformation Program
**URL:** https://www.michigan.gov/mdhhs/assistance-programs/medicaid/rural-health-transformation-program
**Program announcement:** December 29–30, 2025
**Access method:** MDHHS website (no API). Grant Funding Opportunity (GFO) described as forthcoming. No recipient list published yet.
**Update frequency:** Program is in pre-implementation as of this audit.
**Last update observed:** December 30, 2025 (program announcement only).
**County-or-better resolution:** Not yet available — no structured data published.
**License/terms:** Public program information. Grant details under Michigan state procurement rules.
**Fields available:** None yet — structured data does not exist. What is confirmed: $173,128,201 allocated to Michigan for FY2026; federal CMS program created by HR 1; administered by MDHHS; four focus areas (regional partnerships, workforce, health IT, community-based care). Sub-grant GFO expected mid-to-late 2026.
**Feasibility:** 🔴 **Blocked until mid-2026.** No recipient list, no structured data. Monitor michigan.gov/mdhhs and Michigan Grants Portal. Consider FOIA for grant application data after GFO is released.

---

### Source 7: IRS Form 990 via ProPublica Nonprofit Explorer API
**URL:** https://projects.propublica.org/nonprofits/api
**Access method:** REST API — no key required. Two endpoints: `GET /api/v2/search.json?q=[name]&state[id]=MI` (discovery) and `GET /api/v2/organizations/[EIN].json` (all filings per org). Schedule H requires XML parsing of individual filing documents (not pre-extracted into API fields).
**Update frequency:** Irregular batch updates as IRS releases processed documents. December 2023 batch added 900,000+ recent filings. No fixed cadence.
**Last update observed:** API structured summary data through FY2018 for pre-extracted fields; raw XML filing documents available for recent years (FY2021/2022 likely present for major Michigan hospitals; FY2023 partially).
**County-or-better resolution:** Yes — organization address available; search filterable by `state[id]=MI`.
**License/terms:** ProPublica Data Terms of Use (free, attribution required). Underlying 990 XML is IRS public domain.
**Fields available (API structured):** `ein`, `name`, `address`, `city`, `state`, `zipcode`, `ntee_code`, `total_revenue`, `total_expenses`, `total_assets`, `total_liabilities`, `tax_period`, `form_type`, `pdf_url`, `filing_date`.
**Schedule H fields (require XML parsing of filing documents):** `TotalCommunityBenefitExpnsAmt`, `TotalFinancialAssistanceAmt` (charity care), `UnreimbursedMedicaidAmt`, `UnreimbursedCostsAmt`, `CommunityHealthServicesAmt`, `TotalCommunityBenefitPct`.
**Feasibility:** ⚠️ **Usable with caveats.** ProPublica API is the discovery layer (find EINs for Michigan hospital systems). Schedule H extraction requires XML parsing of IRS bulk downloads at https://www.irs.gov/charities-non-profits/form-990-series-downloads (public domain, complete through FY2022/2023). Two-step pipeline needed: ProPublica for EIN lookup → IRS bulk XML for Schedule H fields.

---

### Source 8: FORHP Rural Designation Lookup
**URL:** https://www.hrsa.gov/rural-health/about-us/what-is-rural/data-files (data files); https://data.hrsa.gov/tools/rural-health (eligibility analyzer)
**Access method:** Static file download (Excel/PDF) for programmatic use. Interactive web tool at data.hrsa.gov for manual lookups. No REST API.
**Update frequency:** Updated when Census/OMB/USDA data refreshes. Most recent: **September 2025** (incorporating 2020 Census tracts + USDA ERS RUCA codes updated July–August 2025).
**Last update observed:** September 2025.
**County-or-better resolution:** Yes — county level (non-metro counties), census tract level (intra-metro rural areas via RUCA), and ZIP approximation level.
**License/terms:** Public domain federal data. Free.
**Fields available / designation types:** Non-Metropolitan County (county FIPS); Rural census tract within MSA (RUCA codes 4–10); Road Ruggedness Scale for frontier areas; downloadable FORHP Eligible Areas file (Excel) listing all eligible counties + tracts + ZIP approximations with FIPS and RUCA codes.
**Feasibility:** ✅ **Ready.** Download the September 2025 FORHP Eligible Areas Excel file; join against facility dataset by county FIPS. Best combined with POS file (CAH subtype) for complete rural hospital characterization. Note: SCH, Medicare Dependent Hospital, and CAH each use slightly different rural criteria — IPPS Impact Files needed for SCH/MDH flags.

---

## Part B — Coverage Loss and Policy Projection Sources

---

### Source 9: CBO Score of HR 1 / One Big Beautiful Bill Act
**URL:** https://www.cbo.gov/system/files/2025-06/Wyden-Pallone-Neal_Letter_6-4-25.pdf (House-passed version, June 4, 2025). Enacted version (signed July 4, 2025) scored separately — KFF's July 23, 2025 brief cites the enacted CBO estimates.
**Access method:** PDF download. CBO website blocks all programmatic/automated access (403 on all endpoints). No structured API. Findings must be extracted from PDF narrative.
**Update frequency:** One-time per legislative event. House-passed: June 4, 2025. Enacted: July 2025.
**Last update observed:** July 2025 (enacted version estimates, per KFF secondary sourcing).
**County-or-better resolution:** No. National projections only. Zero state-level breakdown.
**License/terms:** U.S. government work, public domain.
**Key figures extracted (national, 10-year FY2025–2034):**
- Total Medicaid spending reduction (enacted): ~$911 billion
- Work requirements provision: $326B federal cut, 5.3 million coverage loss by 2034
- Provider tax moratorium/reductions: $191B, 1.1M coverage loss
- Six-month redeterminations: $63B, 700,000 coverage loss
- Total new uninsured nationally: ~10 million
- House-passed version (pre-Senate): ~$793B total
**Feasibility:** ⚠️ **Usable as citation anchor only.** No structured data — PDF narrative with national totals. State-level allocation requires KFF's independent methodology (Source 10). Must be cited as "CBO projects nationally; KFF allocated proportionally to Michigan."

---

### Source 10: KFF Medicaid Tracker / HR 1 State Allocations
**URL:**
- State allocations (enacted): https://www.kff.org/medicaid/allocating-cbos-estimates-of-federal-medicaid-spending-reductions-across-the-states-enacted-reconciliation-package/ (July 23, 2025)
- State allocations (House-passed): https://www.kff.org/medicaid/allocating-cbos-estimates-of-federal-medicaid-spending-reductions-and-enrollment-loss-across-the-states/ (June 4, 2025)
- Health provisions summary: https://www.kff.org/health-costs/issue-brief/health-provisions-in-the-2025-federal-budget-reconciliation-law/ (August 22, 2025)
**Access method:** Free web articles with embedded Datawrapper charts that offer CSV download. No formal API.
**Update frequency:** Discrete publications tied to legislative events. 50-state budget survey is annual.
**Last update observed:** August 22, 2025.
**County-or-better resolution:** No. State-level only. KFF explicitly does not produce and explicitly warns against county-level projections.
**License/terms:** Free with attribution. CSV downloads offered from chart embeds; no formal open license stated.
**Michigan-specific figures (from KFF allocation methodology):**
- House-passed version: Michigan 10-year federal spending reduction = **$25.707B** (range $19.3B–$32.1B); enrollment loss = **330,000** (range 247K–412K); ~14% of 2034 projected enrollment
- Enacted version: Michigan 10-year spending reduction = **$31.635B** (range $23.7B–$39.5B); ~17% of baseline
- These are KFF's proportional allocations of CBO national totals — not CBO-issued state figures
**Feasibility:** ✅ **Ready as projection anchor.** KFF's state-level figures are the best available public source for Michigan-specific estimates. Must be labeled "KFF allocation of CBO national projections" with ±25% uncertainty band. KFF's caution about county-level extrapolation must be surfaced in the UI.

---

### Source 11: Michigan League for Public Policy (MLPP)
**URL:** https://mlpp.org/
**Geographic fact sheets:** https://mlpp.org/geographic-fact-sheets/ (last modified January 29, 2026)
**Key articles:** https://mlpp.org/medicaid-in-michigan/ (March 2025); https://mlpp.org/protecting-medicaid-for-michigan-kids/ (June 2025)
**Access method:** Free web articles; downloadable PDF fact sheets; CSV data downloadable from geographic fact sheets page.
**Update frequency:** Geographic fact sheets updated periodically (January 2026 most recent). Articles as advocacy events dictate.
**Last update observed:** January 29, 2026 (geographic fact sheets).
**County-or-better resolution:** Partial. Geographic fact sheets provide county-level data but for general health insurance coverage (from ACS), not direct Medicaid enrollment. No standalone county-level Medicaid enrollment table found publicly.
**License/terms:** Publicly accessible; no explicit open data license. Contact info@mlpp.org for reuse.
**Fields available:**
- Statewide: ~2.5M Michiganders on Medicaid (~23%); federal share ~76% of spending
- County-level fact sheets: population, age/race, income/poverty, health insurance (uninsured rate from ACS), disability, education — all from ACS 5-year estimates
- Children: 42.8% of Michigan children ages 0–18 enrolled in Medicaid (2024)
**Key verification gap:** The "41 counties with >20% Medicaid coverage, 37 rural" statistic cited in the V2 plan was **not confirmed** in any publicly accessible MLPP document during this audit. MLPP's county data uses ACS health insurance figures, not direct Medicaid administrative enrollment. This claim needs source verification before publishing.
**Feasibility:** ⚠️ **Usable for statewide context; county data requires verification.** MLPP fact sheets are good for advocacy-framing context. Direct county-level Medicaid enrollment is better derived from ACS B27010 or MDHHS administrative data.

---

### Source 12: GAO Reports on Medicaid Work Requirements
**URL:** GAO.gov (blocks all programmatic access — all product pages return 403). Relevant report: GAO-20-149 (administrative costs of work requirements).
**Access method:** PDF download from GAO.gov product pages (browser only). No API, no structured data.
**Update frequency:** One-time reports per congressional request.
**Last update observed:** GAO-20-149 published 2020. No 2024–2025 GAO report specifically on work requirements confirmed.
**County-or-better resolution:** No. State-level and national analysis only.
**License/terms:** U.S. government work, public domain.
**Key historical benchmark figures (from KFF and peer-reviewed literature citing GAO and Arkansas data):**
- Arkansas implemented June 2018, ended March 2019 (court ruling)
- ~18,000 people lost coverage (~25% of the ~72,000 adults subject to the requirement)
- ~70% of required enrollees who needed to actively report failed to comply
- Georgia Pathways (July 2023–Jan 2025): only ~6,500 enrolled vs. 25,000 projected; >90% of $26.6M admin cost was non-care spending
**Feasibility:** ⚠️ **Usable as methodology benchmark only.** No downloadable structured dataset. Enrollment loss figures come from state administrative data and peer-reviewed literature (Sommers et al., NEJM 2019), not GAO directly. GAO's value is administrative cost data for work requirement implementation. The Arkansas 25% coverage loss rate is the appropriate modeling input for "Coverage at Risk" projections — cite as "KFF analysis of Arkansas experience per GAO and CMS data."

---

### Source 13: AHA (American Hospital Association) Closure Tracking
**URL:** https://www.aha.org/; data products at https://ahadata.com/
**Access method:** Commercial license required for Annual Survey Database. Free resources: Fast Facts PDF (national aggregate only), narrative advocacy reports.
**Update frequency:** Annual Survey Database updated annually.
**Last update observed:** Fast Facts 2026 is current edition.
**County-or-better resolution:** Annual Survey Database: yes (facility-level). Free public resources: no (national aggregate only).
**License/terms:** Commercial license required for structured data. Fast Facts PDF freely available.
**Fields available (Annual Survey Database, licensed):** Facility name, type, ownership, location, staffed beds, admissions, ED visits, service lines, staffing, expenses. No dedicated closure flag/date — closure tracking is not the primary purpose.
**Feasibility:** 🔴 **Blocked without license.** AHA does not maintain a public, freely downloadable hospital closure dataset. Use Sheps Center (Source 14) for closure tracking. AHA's value is service-line presence and ED status, both behind a paywall.

---

### Source 14: Sheps Center at UNC — Rural Hospital Closures
**URL:** https://www.shepscenter.unc.edu/programs-projects/rural-health/rural-hospital-closures/
**Access method:** Free public website with sortable HTML table and direct CSV download ("Rural Hospital Closure Data for Download"). No API. Contact: ncrural@unc.edu.
**Update frequency:** Ongoing/reactive — updated when closures are documented. Last metadata update: **December 4, 2025**.
**Last update observed:** December 4, 2025. 2025 closures confirmed in table (5 hospitals listed for 2025 as of that date).
**County-or-better resolution:** Yes — facility-level. Table columns: Hospital Name, State, RUCA, CBSA, Medicare Payment Classification, Closure Year, Number of Beds, Services Remaining. County FIPS not a visible column but derivable from CBSA/RUCA codes or geocoding.
**License/terms:** Academic/research use standard (UNC). Contact ncrural@unc.edu for specific terms. No explicit open license (e.g., CC) stated.
**Fields available:** Hospital name, state, RUCA code, CBSA, Medicare payment classification (CAH, PPS, etc.), closure year, bed count, services remaining post-closure.
**Feasibility:** ✅ **Ready.** Gold-standard public source for rural hospital closures. Free CSV download. Michigan closures filterable by state. ~2005–present coverage. No API — data must be downloaded and ingested to Supabase; update trigger needed (quarterly manual or automated scraper).

---

### Source 15: Chartis Center for Rural Health — Rural Hospital Vulnerability Index
**URL:** https://www.chartis.com/expertise/rural-health; 2026 report: https://www.chartis.com/insights/2026-rural-health-state-state
**Access method:** Free web access to published reports. No downloadable dataset of hospital-level vulnerability scores. No API. Proprietary scores available only through Chartis consulting engagement.
**Update frequency:** Annual report (2026 edition uses HCRIS Q3 2025 data).
**Last update observed:** 2026 Rural Health State of the State report.
**County-or-better resolution:** Published reports: state-level aggregate counts only. Hospital-level scores: proprietary (not public).
**License/terms:** © 2026 Chartis. All Rights Reserved. No open data license. Methodology is publicly documented in report appendix, but index scores are proprietary.
**Methodology inputs (publicly documented):** Multi-level logistic regression on 2,081 rural U.S. hospitals using: case mix index, government control status, average daily census, average age of plant, average length of stay, occupancy rates, % change in net patient revenue, years with negative operating margins, Medicaid expansion status, traditional Medicare % of patient days. Data: HCRIS through Q3 2025 + SAFOP + Census.
**Michigan context:** 60 rural hospitals in Michigan per 2026 report. 417 hospitals nationally flagged as vulnerable.
**Feasibility:** ⚠️ **Methodology adaptable; scores not available.** Build PVI independently from HCRIS (already audited as Source 2) using Chartis's publicly documented indicator set. Credit "methodology adapted from Chartis Rural Hospital Performance INDEX." The inputs (HCRIS, CMS POS, FORHP designations) are all independently accessible. Do not brand or imply Chartis endorsement. Chartis has not granted a license — "All Rights Reserved" means we adapt the methodology, not the scores.

---

## Part C — Already-Integrated Sources to Extend

---

### Source 16: County Health Rankings
**URL:** https://www.countyhealthrankings.org/
**Access method:** Bulk CSV/XLSX/SAS download. GitHub repo for select datasets. No REST API.
**Update frequency:** Annual. 2025 release + March 2026 supplemental confirmed.
**Last update observed:** March 2026 (supplemental).
**County-or-better resolution:** Yes — all U.S. counties.
**License/terms:** © 2026 County Health Rankings. Specific redistribution rights require Terms of Use review.
**Fields available for V2:**
- **Uninsured rate** (v060): YES — % uninsured adults; sourced from SAHIE (Census). Available at county level. ✅
- **Medicaid enrollment %**: NOT present — CHR does not include Medicaid enrollment as a measure
- **Preventable hospitalizations** (PQI composite): YES — available, useful for vulnerability context
- **Primary care ratio**: YES — available
- **Mental health provider ratio**: YES — available
**Feasibility:** ✅ **Extend existing integration.** Uninsured rate via SAHIE is a clean county-level V2 input. Do not use CHR as the Medicaid enrollment source — use ACS B27010 instead.

---

### Source 17: CDC PLACES
**URL:** https://www.cdc.gov/places/; API at https://data.cdc.gov/resource/swc5-untb.json
**Access method:** Socrata REST API (data.cdc.gov). Confirmed working: `GET https://data.cdc.gov/resource/swc5-untb.json` with standard Socrata query params. Also bulk CSV download.
**Update frequency:** Annual. August 2024 release (data year 2023).
**Last update observed:** August 2024.
**County-or-better resolution:** Yes — county, census tract, ZCTA, and place levels.
**License/terms:** Public domain / CDC open data.
**Fields available for V2:**
- **Uninsured rate** ("Current lack of health insurance among adults aged 18–64"): YES ✅ — confirmed present for Michigan counties (2023 prevalence ~5.6%–8.7% by county)
- **Health-Related Social Needs (HRSN) measures (7 new measures):** food insecurity, housing insecurity, utility shutoff threat, lack of transportation, loneliness — all relevant to Medicaid population vulnerability ✅
- **Medicaid enrollment**: NOT present
- **Poverty rate**: NOT present
- **Preventable hospitalizations**: NOT present
**Feasibility:** ✅ **Extend existing integration.** Uninsured rate and HRSN measures are directly relevant. Dataset ID `swc5-untb` for county-level queries. API is already usable.

---

### Source 18: EPA EJScreen
**URL:** https://www.epa.gov/ejscreen
**Access method:** Bulk CSV/shapefile download. REST API at ejscreen.epa.gov — DNS currently unresolvable (possible EPA site reorganization as of April 2026). FTP path at gaftp.epa.gov/EJSCREEN/ returned 404. Bulk download from main EPA page is the reliable access path.
**Update frequency:** Annual. EJScreen 2.3 is current.
**Last update observed:** EJScreen 2.3 (ACS data through ~2022). EPA site shows significant URL disruption — confirm data file locations before ingesting.
**County-or-better resolution:** Yes — Census tract natively; county-level aggregates available.
**License/terms:** Public domain EPA data. No redistribution restrictions.
**Fields available for V2:**
- % low income (below 2x FPL): YES — useful as Medicaid eligibility proxy ✅
- % people of color, % linguistic isolation, % under 5, % over 64: YES ✅
- Environmental burden indicators: YES (air quality, water, toxics)
- **Medicaid enrollment**: NOT present
- **Health insurance coverage**: NOT present
**Feasibility:** ⚠️ **Already integrated as vulnerability overlay.** No new V2 data here — use for vulnerability multiplier scoring as currently planned. REST API disruption warrants confirming bulk download URL before next ingest.

---

### Source 19: Census ACS
**URL:** https://api.census.gov/
**Access method:** REST API. No key required for standard queries; key recommended for high volume. Endpoint: `https://api.census.gov/data/{year}/acs/acs5?get={vars}&for=county:*&in=state:26`
**Update frequency:** ACS 1-year: annual (counties 65K+ population). ACS 5-year: annual rolling (all geographies).
**Last update observed:** ACS 2024 1-year confirmed. ACS 2023 5-year confirmed. ACS 2024 5-year (released December 2024) likely available.
**County-or-better resolution:** Yes — county level (5-year for all 83 Michigan counties; 1-year for ~30 larger counties only).
**License/terms:** Public domain U.S. government data.
**Key tables for V2:**
- **B27010** — "Types of Health Insurance Coverage by Age": **THE Medicaid proxy table.** Provides "Medicaid/means-tested public coverage only" by age cohort (`B27010_007E` under-19, `B27010_023E` 19-34, `B27010_039E` 35-64) plus dual-enrollment variables. Summing these divided by `B27010_001E` (total population) yields county-level Medicaid share estimate. ✅
- **B27001** — "Health Insurance Coverage Status by Sex by Age": Overall insured/uninsured. Does NOT distinguish Medicaid from other coverage types.
- **B27003** — "Public Health Insurance Status by Sex by Age": Public coverage (Medicaid + Medicare + VA + CHIP combined). Does NOT isolate Medicaid.
- **B27010 derivation caveat:** ACS underestimates true enrollment by 5–15% (survey-based; people with Medicaid + private are counted in "multiple coverage" category). Use 5-year estimates for small Michigan counties. This is the best publicly available proxy absent T-MSIS.
**Feasibility:** ✅ **Ready and already integrated.** B27010 is the county-level Medicaid enrollment proxy. Use ACS 2023 5-year (all 83 counties) for Coverage at Risk feature. Platform already has Census API plumbing — add B27010 to existing calls.

---

## Part D — Claim Verification

These figures appear in the V2 plan. Each was checked against accessible public sources.

| Claim | Verified? | Source / Notes |
|-------|-----------|----------------|
| "2.6 million Michiganders on Medicaid" | **Partial** | KFF 2024 state indicator page showed ~2,234,200 (22.5% of 9.9M Michiganders). Pandemic peak was ~3.2M; post-redetermination stabilized figure of 2.6M is plausible for mid-2023. CMS MBES and MDHHS pages were inaccessible. Verify against latest MDHHS enrollment snapshot before publishing. |
| "Munson Healthcare $30M annual loss projection" | **Not confirmed** | MDHHS and Munson Healthcare sites blocked/404 during audit. Likely from a Munson press release or MHA analysis. Original source must be located before citing on platform. |
| "200,000 Michiganders at risk of losing coverage" (MDHHS, 2026) | **Not confirmed** | MDHHS press release pages returned 403. Figure is consistent with 8–10% of 2.2–2.6M enrollees. Likely sourced from Urban Institute or KFF state model adopted by MDHHS. Requires direct MDHHS contact or legislative fiscal analysis citation. |
| "One Big Beautiful Bill / $2B+ annually from Michigan Medicaid" | **Partially consistent** | Michigan Independent site blocked (403). KFF enacted bill brief confirms $31.635B 10-year reduction = ~$3.16B/year average, though cuts phase in over time; early-year impact lower. The "$2B+" annual figure is plausible for early-implementation years. Michigan Independent likely sourced from CBPP or Michigan Senate Fiscal Agency. Verify exact source. |
| "$173M Rural Health Transformation Fund Michigan" | **Confirmed (FY2026 allocation)** | $173,128,201 confirmed as Michigan's FY2026 RHTP allocation. This is a federal CMS program (HR 1, Sec. XXX), not a state program. Annual allocation for FY2026 only; not a multi-year total. GFO not yet released. |

---

## Summary: V2 Build Feasibility by Feature

| Feature | Data availability | Blocking issues | Earliest ship |
|---------|------------------|-----------------|---------------|
| **Provider Vulnerability Index (PVI)** | HCRIS ✅, POS ✅, FORHP ✅, UDS ✅, Sheps ✅ | HCRIS 12–18 month lag; no pre-built maternity/ED flag; Chartis scores proprietary (methodology public) | Phase 2 start |
| **Federal Dollar Tracker** | USASpending ✅ (HRSA direct awards), CMS enrollment ⚠️ (state-level only) | Medicaid flows are state-level block grants — county allocation requires ACS B27010 modeling, not direct award data | Phase 2 start |
| **Coverage at Risk** | ACS B27010 ✅, KFF ✅ (state), GAO/Arkansas benchmark ⚠️ | No county-level Medicaid admin data publicly available; must derive from ACS (±5–15% accuracy); enrollment claims need citation cleanup | Phase 2, after claim verification |
| **Closure Watch** | Sheps Center ✅ (free CSV, Dec 2025), POS ✅ (certification status), HCRIS ✅ (financial context) | AHA service-line data behind paywall; maternity/ED closure requires alternative source; no API, quarterly manual ingest | Phase 2 start — fastest ship |
| **Policy Timeline (HR 1 / OBBB)** | CBO ✅ (national, PDF only), KFF ✅ (state allocations, CSV), MLPP ✅ (context) | PDF extraction only; no structured CBO data; county extrapolation explicitly discouraged by KFF | Phase 2, ship last per plan |
| **MDHHS Rural Health Transformation (Source 6)** | None yet | No structured data exists; GFO not released; earliest usable data mid-to-late 2026 | Skip for V2 Phase 2; monitor |

---

## Key Recommendations Before Phase 1

1. **Verify the four unconfirmed claims** (Munson $30M, 200K Michiganders, $2B+ annual figure, MDHHS statement) before any of them appear in the UI. Suggested approach: direct email to MDHHS communications, MHA press contact, Michigan Senate Fiscal Agency publications page.

2. **County-level Medicaid enrollment has no clean federal API source.** The practical solution for V2 is ACS B27010 (derives county Medicaid share from 5-year survey data, ~5–15% undercount vs. admin data). Label prominently as "ACS-derived estimate" with a link to methodology. If MDHHS publishes county-level enrollment data, that supersedes — check michigan.gov/mdhhs data portal.

3. **Medicaid (CFDA 93.778) does not appear as county-level award data on USASpending.** The federal dollar tracker for Medicaid must use an enrollment-proportional model, not direct award lookups. Only HRSA direct grants (FQHCs, health centers, CFDA 93.224) will resolve to county-level recipients in USASpending.

4. **HCRIS is the right data source for PVI** but will require a non-trivial ETL pipeline (multi-file relational structure, derived metrics). Open-source parsers (NBER, `imccart/HCRIS`) reduce this burden. Commit to FY2022 as the baseline year (most complete) with FY2023/2024 supplemented as records become available.

5. **Closure Watch is the fastest, lowest-risk V2 ship.** Sheps Center CSV is free, well-maintained (Dec 2025), and requires only a Supabase ingest + map render. Build this first to establish V2 credibility before the more complex PVI and Coverage at Risk features.

6. **KFF's explicit warning against county-level projection** must be surfaced in the UI anywhere county-level cut estimates appear. Proposed language: "County-level figures are modeled estimates derived from KFF's state allocations of CBO projections, proportional to ACS Medicaid enrollment share. KFF notes these allocations carry ±25% uncertainty and should not be interpreted as precise county-level predictions."
