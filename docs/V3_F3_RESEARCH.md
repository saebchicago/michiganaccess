# V3 Feature 3 Research Memo: Dual-Eligible Exposure Map

**Prepared:** 2026-04-09
**Status:** Awaiting human approval before Phase 1 begins
**Feature slug:** dual-eligible-exposure
**Routes planned:** `/data/dual-eligible-exposure` · `/methodology/dual-eligible-exposure`

---

## Summary verdict

**The "compounding exposure" framing is NOT supportable by evidence and must not be used.**

Dual-eligible individuals are categorically exempt from P.L. 119-21 work requirements. They enroll through aged (65+) or disabled Medicaid pathways — not ACA expansion — and the work requirement provisions (§71119) apply exclusively to expansion enrollees ages 19–64. There is no credible source claiming dual-eligibles face heightened aggregate risk from SNAP + Medicaid work requirements simultaneously.

**The supportable framing is: "Two programs, shared geography."**
The feature is a descriptive county-level intersection: where do the populations enrolled in both Medicare and Medicaid concentrate relative to the SNAP and Medicaid coverage-at-risk maps? This is civic intelligence about geographic overlap, not a compounding-exposure claim. A secondary, precisely scoped finding — that the federal action delays the Medicare Savings Program streamlining rule, raising costs for ~1.3 million dual-eligible individuals nationally — can be stated with attribution, provided it is scoped to the MSP provision only and not presented as a work-requirement risk.

**Recommended editorial anchor phrase:** "Two programs, shared geography — where Medicare and Medicaid overlap in Michigan."

---

## 0a. Michigan dual-eligible population — source table

| Source | Figure | Year | MI-Specific | County-Level | URL (verified live) |
|--------|--------|------|-------------|--------------|---------------------|
| MedPAC/MACPAC Dec 2025 Data Book, Exhibit 27 & Table 5 | **405,000 total** (360,000 full-benefit; 45,000 partial-benefit) | CY 2022 | Yes | No (state) | https://www.macpac.gov/wp-content/uploads/2025/12/Dec25_MedPAC_MACPAC_DualsDataBook-WEB508-FINAL.pdf — live, data extracted directly |
| KFF State Health Facts — # Dual-Eligible Individuals | **353,820 total** (296,944 full; 56,876 partial) | 2024 (March enrollment) | Yes | No (state) | https://www.kff.org/state-health-policy-data/state-indicator/number-of-dual-eligible-individuals/ — live, verified |
| KFF State Health Facts — # Dual-Eligible Individuals | **334,716 total** (269,660 full; 65,056 partial) | 2025 (Jan enrollment) | Yes | No (state) | Same URL — live, verified |
| KFF — Dual-Eligible Share of Medicare Enrollment | **16% of Michigan Medicare enrollees** are dual (13% full + 3% partial) | 2024 | Yes | No | https://www.kff.org/state-health-policy-data/state-indicator/dual-eligible-individuals-as-a-share-of-medicare-enrollment/ — live, verified |
| KFF — Full-Benefit Dual-Eligible by Coverage Arrangement | 291,100 full-benefit (breakdown by plan type: MMP/PACE 42.5K, trad Medicare + Medicaid FFS 136.2K, MA + Medicaid managed care 22.9K, other arrangements) | 2021 | Yes | No | https://www.kff.org/state-health-policy-data/state-indicator/full-benefit-dual-eligible-individuals-by-medicare-and-medicaid-coverage-arrangements/ — live, verified |
| MACPAC Exhibit 14, FY 2021 | 384K all dual; 336K full-benefit; 48K partial | FY 2021 | Yes | No | https://www.macpac.gov/wp-content/uploads/2023/12/EXHIBIT-14.-Medicaid-Enrollment-by-State-Eligibility-Group-and-Dually-Eligible-Status-FY-2021.pdf — live, extracted |
| MACPAC Exhibit 21, FY 2022 | $6,640M dual-eligible Medicaid spending (32% of Michigan's $20,712M total Medicaid spending) | FY 2022 | Yes | No | https://www.macpac.gov/wp-content/uploads/2024/12/EXHIBIT-21.-Medicaid-Spending-by-State-Eligibility-Group-and-Dually-Eligible-Status-FY-2022.pdf — live, extracted |
| MDHHS (via Oct 2024 press release) | "300,000+ full dual eligible individuals age 21+" | 2024 | Yes | No | https://www.michigan.gov/mdhhs/inside-mdhhs/newsroom/2024/10/09/mi-coordinated — live |
| CMS MMCO Enrollment Snapshots | County-level quarterly files Q2 2015–Q1 2025 (not directly downloaded; confirmed on CMS landing page) | Through Q1 2025 | Yes | **Yes — all counties** | https://www.cms.gov/data-research/research/statistical-resources-dually-eligible-beneficiaries/mmco-statistical-analytic-reports — live confirmed |
| Census ACS B27010, 5-year 2023 | Simultaneous Medicare+Medicaid coverage by age group, all 83 Michigan counties; key variables: B27010_046E (ages 35–64) + B27010_062E (ages 65+) | 2019–2023 | Yes | **Yes — all 83 counties** | https://data.census.gov/table/ACSDT5Y2023.B27010 — live, API confirmed |

### Recommended input figure

**405,000 Michigan dual-eligible individuals (CY 2022, MACPAC Dec 2025 Data Book)**
Rationale: most recent administratively-derived figure published in a peer-reviewed government data book with direct Michigan row; the KFF 2024/2025 figures (353,820 / 334,716) reflect post-unwinding Medicaid redetermination effects that likely caused some duals to lose Medicaid while retaining Medicare. For context on concentration, using 405K as the baseline with a note that KFF's more recent figure is ~354K is defensible and transparent.

**Alternative/range approach:** report "approximately 335,000–405,000 Michigan residents are enrolled in both Medicare and Medicaid simultaneously, depending on year and source, with the most recent administrative estimate at ~405,000 (MACPAC, CY 2022)."

---

## 0b. P.L. 119-21 — which provisions affect dual-eligibles, and how

### Work requirements (§71119) — EXEMPT

Dual-eligible individuals are **categorically exempt** from P.L. 119-21 work requirements. Work requirements apply only to adults ages 19–64 enrolled in the ACA Medicaid expansion group. Dual-eligible individuals qualify for Medicaid through the aged (65+) or disabled pathway — not expansion.

**Authority:** Justice in Aging analysis explicitly states: "Work requirements only apply to adults ages 19-64 enrolled in the Medicaid Expansion program... People dually eligible are not subject to work requirements."
Source: https://justiceinaging.org/how-h-r-1-impacts-people-dually-eligible-for-medicare-and-medicaid/ — live, verified

**Subpopulations exempt:**
- All persons age 65+ enrolled through the aged pathway (majority of full-benefit duals)
- All persons enrolled via SSI/SSDI (disability enrollment basis)
- All persons on the disabled Medicaid pathway regardless of age
- Persons under 65 determined "medically frail" (physical/intellectual/developmental disabilities, disabling mental disorders, serious complex medical conditions, blindness, SUD)

**Edge case that might be affected:** Partial-benefit dual-eligible individuals (QMB, SLMB, QI enrollees) under age 65 who may have enrolled through expansion rather than a disability/aged pathway — a small and poorly characterized subset. No source quantifies this for Michigan.

### MSP streamlining rule delay (§71101) — DIRECTLY AFFECTS DUAL-ELIGIBLES

P.L. 119-21 §71101 prohibits CMS from implementing the September 2023 Medicare Savings Program (MSP) streamlining final rule until October 1, 2034.

The blocked rule would have:
- Automatically enrolled SSI recipients into MSPs (eliminating a separate application step)
- Simplified MSP applications and eliminated procedural terminations
- Added an estimated 860,000 new MSP enrollees nationally (CBO estimate)

**Impact on current dual-eligible individuals:**
- CBO estimated the rule would have added 860,000 new MSP enrollees nationally who will now not be enrolled
- KFF estimates 1.3 million current low-income Medicare beneficiaries face higher cost-sharing as a result
- Average LIS/Extra Help benefit value is approximately $6,200/year; those who lose Medicaid lose automatic LIS enrollment

**Michigan proportional estimate (derived, not published):** Michigan has approximately 4% of the national dual-eligible population (405K / ~12M national). Applying 4% to the 860,000 national MSP enrollment gain blocked: approximately **34,000 Michigan residents** who would have been newly enrolled in MSP are not enrolled due to the rule delay. Applying 4% to the 1.3M higher-costs figure: approximately **52,000 Michigan dual-eligible individuals** face higher Medicare cost-sharing than they would under the blocked rule.

**Disclosure required:** These Michigan estimates are proportional derivations from national figures. No Michigan-specific figure has been published by CMS, KFF, MACPAC, or MDHHS for this provision.

Sources:
- KFF MSP/LIS analysis: https://www.kff.org/medicaid/medicaid-changes-in-house-reconciliation-bill-would-increase-costs-for-1-3-million-low-income-medicare-beneficiaries/ — live
- KFF full provision analysis: https://www.kff.org/medicaid/health-provisions-in-the-2025-federal-budget-reconciliation-law/ — live

### Provider tax cuts (§71115 + §71117) — AFFECTS DUAL-ELIGIBLES INDIRECTLY

P.L. 119-21 reduces the Medicaid provider tax safe harbor from 6% to 3.5% by FY 2031 (phased at 0.5% per year starting FY 2028). The uniformity waiver provisions (§71117) also affect states that use provider taxes to augment HCBS and institutional payments.

**Michigan is specifically named** by KFF as one of four states (alongside CA, MA, NY) facing disproportionate fiscal impact from the provider tax uniformity waiver restrictions. Michigan's Medicaid program relies on provider taxes to fund HCBS expansion programs.

Dual-eligible individuals disproportionately use HCBS and nursing facility services. Historical precedent (Great Recession) shows states cut HCBS budgets when facing Medicaid funding shortfalls.

CBO estimate: $191B federal reduction over 2025–2034; 1.1M additional uninsured by 2034.

Source: https://www.kff.org/medicaid/health-provisions-in-the-2025-federal-budget-reconciliation-law/ — live

### Retroactive coverage period reduction — AFFECTS DUAL-ELIGIBLES

P.L. 119-21 reduces maximum retroactive Medicaid coverage from 3 months to 2 months for dual-eligible individuals (non-expansion), effective January 1, 2027. (Expansion enrollees face a 1-month limit — but this provision applies to the non-expansion, i.e., the predominantly dual-eligible, population.)

Source: Justice in Aging analysis — live (URL above)

### State directed payment caps (§71116) — AFFECTS DUAL-ELIGIBLES

Caps Medicaid payments for inpatient hospital and nursing facility care at 100% of the Medicare rate (for expansion states). Nursing facility payments are a primary expenditure category for dual-eligible individuals. CBO: $149B federal reduction; no direct coverage impact projected, but payment adequacy risks affect provider participation.

### Redetermination frequency (§71107) — DUAL-ELIGIBLES TECHNICALLY EXEMPT, implementation risk remains

P.L. 119-21 requires 6-month Medicaid eligibility redeterminations for expansion enrollees. Dual-eligible individuals are not expansion enrollees and are technically exempt. However, Justice in Aging flags that Medicaid agencies may erroneously apply shortened redetermination cycles to duals during implementation, creating administrative disruption risk.

### Total Michigan federal Medicaid reduction context

KFF projects **$31.6 billion in federal Medicaid spending reductions for Michigan over 2025–2034** (range: $23.7B–$39.5B), representing approximately 17% of Michigan's baseline federal Medicaid spending. This is the top-line figure from enacted P.L. 119-21, affecting all Medicaid enrollees including duals.

Source: https://www.kff.org/medicaid/allocating-cbos-estimates-of-federal-medicaid-spending-reductions-across-the-states-enacted-reconciliation-package/ — live, verified

---

## 0c. Is there a separate dual-eligible exposure story worth telling?

**Yes, but it requires reframing away from work requirements entirely.**

The supportable story is:

1. **Geographic concentration context:** Michigan's ~405,000 dual-eligible residents are not evenly distributed. Counties with high SNAP coverage-at-risk and high Medicaid coverage-at-risk overlap with counties that have high concentrations of dual-eligible individuals. This geographic intersection is civic intelligence, not a coverage-loss claim.

2. **MSP provision exposure (scoped, attributed):** The §71101 MSP streamlining rule delay means an estimated 860,000 people nationally who would have gained MSP enrollment won't. Michigan's proportional share is approximately 34,000 — this is a derived estimate, and the methodology page must say so explicitly.

3. **HCBS and long-term care provider payment risk:** Provider tax cuts and state directed payment caps create fiscal pressure specifically in the service categories (HCBS, nursing facilities) that dual-eligible individuals disproportionately rely on. This is a second-order risk, not a direct coverage loss.

4. **Administrative exposure for all Medicaid enrollees including duals:** The $31.6B projected Michigan federal Medicaid reduction is the frame for the whole program, not a dual-specific figure.

**What the feature should NOT claim:**
- That dual-eligible individuals are at risk of losing Medicaid coverage due to work requirements (they are exempt)
- That dual-eligible individuals face "compounding exposure" from SNAP + Medicaid work requirements simultaneously (neither applies to duals)
- Any specific number of dual-eligible individuals "at risk" without citing the exact provision and showing it applies to non-expansion duals

---

## 0d. Recommended build plan

### Recommended state-level input figure

**405,000 Michigan dual-eligible individuals (MACPAC Dec 2025 Data Book, CY 2022)**
Display with context: "approximately 335,000–405,000 depending on year; most recent administrative estimate 405,000 (MACPAC, CY 2022)"

**MSP provision secondary figure:** ~34,000 Michigan residents who would have newly enrolled in MSP under the blocked CMS rule — derivation from national 860,000 CBO figure; clearly labeled as derived/modeled.

### Recommended county allocation method

**Primary source:** Census ACS B27010 5-year estimates (2019–2023) — variables B27010_046E (ages 35–64, both Medicare and Medicaid) + B27010_062E (ages 65+, both Medicare and Medicaid) — for all 83 Michigan counties.

**Allocation method:**
1. Pull B27010_046E + B27010_062E for all 83 Michigan counties from ACS 5-year 2023
2. Sum across counties to get denominator (total ACS survey-estimated simultaneous enrollees statewide)
3. Compute each county's share: `countyDualACS / totalDualACS`
4. Apply share to 405,000 MACPAC statewide figure to get county estimate
5. Apply GAO-style uncertainty band (±X%) — to be determined based on ACS margins of error; ACS MoE at county level for this table can be substantial for small counties

**Disclosure required:**
- ACS B27010 is a survey estimate with margins of error; small-county figures have high relative error
- CMS MMCO Enrollment Snapshots would be the authoritative alternative (county-level administrative data) but require downloading quarterly ZIP files; the methodology page should document both sources and explain why ACS was used for proportional allocation
- Statewide total from MACPAC administrative data is more reliable than ACS statewide total; the allocation method combines administrative reliability (statewide total) with survey-based geography (county shares)

### Recommended narrative frame

**"Two programs, shared geography"**

The feature shows where Michigan's dual-eligible population concentrates, contextualized against the SNAP and Medicaid coverage-at-risk county maps. It answers the civic question: where in Michigan are residents most likely to depend on both programs simultaneously?

A clearly scoped secondary finding covers the MSP streamlining rule delay (§71101): the provision most directly affecting dual-eligible individuals is the one that delayed automatic MSP enrollment, not the work requirements.

**What makes this civic intelligence rather than advocacy:**
- It describes current population distribution, not projected losses
- The P.L. 119-21 provision named (§71101) is one where dual-eligibles are the directly affected population, and the mechanism (MSP enrollment delay) is concrete and documented
- The editorial discipline of all prior V3 features applies: "exposure is not disenrollment," no benefit-cliff language, P.L. 119-21 citation not HR 1 or OBBBA

### Recommended editorial anchor phrase

**"Two programs, shared geography"**

The data page anchor callout (equivalent to "Exposure is not disenrollment" in Medicaid and "Exposure does not equal loss" in SNAP) should read:

> **"Dual-eligible residents are exempt from P.L. 119-21 work requirements. This map shows where they live."**

This is factually precise, civically useful, protects against the misreading that duals face compounding work-requirement exposure, and still provides the geographic context that justifies the feature.

---

## Sources cited in this memo (verified live)

1. MedPAC/MACPAC December 2025 Data Book — https://www.macpac.gov/wp-content/uploads/2025/12/Dec25_MedPAC_MACPAC_DualsDataBook-WEB508-FINAL.pdf
2. KFF — Number of Dual-Eligible Individuals by State — https://www.kff.org/state-health-policy-data/state-indicator/number-of-dual-eligible-individuals/
3. KFF — Dual-Eligible Share of Medicare Enrollment — https://www.kff.org/state-health-policy-data/state-indicator/dual-eligible-individuals-as-a-share-of-medicare-enrollment/
4. KFF — Full-Benefit Dual-Eligible by Coverage Arrangement — https://www.kff.org/state-health-policy-data/state-indicator/full-benefit-dual-eligible-individuals-by-medicare-and-medicaid-coverage-arrangements/
5. MACPAC Exhibit 14, FY 2021 — https://www.macpac.gov/wp-content/uploads/2023/12/EXHIBIT-14.-Medicaid-Enrollment-by-State-Eligibility-Group-and-Dually-Eligible-Status-FY-2021.pdf
6. MACPAC Exhibit 21, FY 2022 — https://www.macpac.gov/wp-content/uploads/2024/12/EXHIBIT-21.-Medicaid-Spending-by-State-Eligibility-Group-and-Dually-Eligible-Status-FY-2022.pdf
7. MDHHS — MI Coordinated Health press release, Oct 2024 — https://www.michigan.gov/mdhhs/inside-mdhhs/newsroom/2024/10/09/mi-coordinated
8. CMS MMCO Statistical & Analytic Reports (county-level snapshots) — https://www.cms.gov/data-research/research/statistical-resources-dually-eligible-beneficiaries/mmco-statistical-analytic-reports
9. Census ACS B27010, 5-year 2023 — https://data.census.gov/table/ACSDT5Y2023.B27010
10. KFF — Health Provisions in the 2025 Federal Budget Reconciliation Law — https://www.kff.org/medicaid/health-provisions-in-the-2025-federal-budget-reconciliation-law/
11. KFF — Work Requirement Provisions in the 2025 Federal Budget Reconciliation Law — https://www.kff.org/medicaid/a-closer-look-at-the-work-requirement-provisions-in-the-2025-federal-budget-reconciliation-law/
12. KFF — MSP/LIS Changes Affecting 1.3 Million Low-Income Medicare Beneficiaries — https://www.kff.org/medicaid/medicaid-changes-in-house-reconciliation-bill-would-increase-costs-for-1-3-million-low-income-medicare-beneficiaries/
13. KFF — Allocating CBO Estimates of Federal Medicaid Spending Reductions by State — https://www.kff.org/medicaid/allocating-cbos-estimates-of-federal-medicaid-spending-reductions-across-the-states-enacted-reconciliation-package/
14. Justice in Aging — How H.R. 1 Impacts People Dually Eligible for Medicare and Medicaid — https://justiceinaging.org/how-h-r-1-impacts-people-dually-eligible-for-medicare-and-medicaid/
