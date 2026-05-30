# Phase 0 — Data Provenance Audit: CivicDataPage

**File audited:** `artifacts/access-mi/src/pages/CivicDataPage.tsx`
**Branch:** `civic-data-provenance` (cut from `main` @ `4456a73`)
**Audit date:** 2026-05-30

---

## GIT STATE REPORT

- Stash contents: `stash@{0}: WIP on chore/llm-proxy-audit: dd712f3 chore: route Mistral LLM calls through Express API proxy` (unstaged changes to `.migration-backup/A11Y_VIOLATIONS.md` and `.migration-backup/FAILED_ROUTES.md` — not related to this work)
- Main pulled clean: yes, fast-forwarded to `4456a73` (26 commits ahead of prior local state)
- Real page confirmed at: `artifacts/access-mi/src/pages/CivicDataPage.tsx` (614 lines)
- `.migration-backup/` tree: present in repo root but **not** the target of this audit or any Phase 1–4 edits

---

## VOTER TURNOUT — CONFIRMED FIGURES (UF Election Lab)

These are the authoritative VEP figures pulled directly from UF Election Lab CSV datasets. Every value is exact from the source file, not approximated.

| Year | MI VEP (code) | **MI VEP (actual)** | National VEP (code) | **National VEP (actual)** | Delta MI | Source file |
|------|--------------|---------------------|--------------------|-----------------------------|----------|-------------|
| 2016 | 63.2% | **65.54%** | 60.1% | **60.12%** | −2.3 pts | `Turnout_2016G_v1.0.csv` |
| 2018 | 57.8% | **57.62%** | 50.3% | **50.05%** | +0.2 pts | `Turnout_2018G_v1.1.csv` |
| 2020 | 71.4% | **73.27%** | 66.8% | **66.38%** | −1.9 pts | `Turnout_2020G_v1.2.csv` |
| 2022 | 55.2% | **58.92%** | 46.8% | **46.22%** | −3.7 pts | `Turnout_2022G_v1.0.csv` |
| 2024 | 68.9% | **74.64%** | 62.5% | **64.07%** | −5.7 pts | `Turnout_2024G_v0.3.csv` |

Primary source: UF Election Lab (Michael McDonald), `election.lab.ufl.edu/voter-turnout/`
License: Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International

**Secondary consequence — stat card:** The "68.9% voter turnout" Quick Stat card is the 2024 Michigan figure. Actual is **74.64%**.

**Secondary consequence — narrative claim:** Line 288 reads "The 2020 election saw a record 71.4% turnout." Actual 2020 MI VEP was **73.27%**, and 2024 VEP of 74.64% is the actual record. The claim is wrong on both the number and the "record" characterization.

**Decision received:** Rebuild from UF Election Lab VEP, both lines. Use the confirmed figures above.

---

## A. QUICK STAT CARDS (`getQuickStats`, lines 82–87)

| # | Claim | Current value | Proposed level | Decision |
|---|-------|--------------|----------------|----------|
| 1 | State departments | "19" | UNSOURCED | **Remove.** No confirmed primary source. Michigan Constitution Art. V §2 caps at 20 but current count varies by reorganization. |
| 2 | Annual FOIA requests | "19,500" | UNSOURCED — Demo Data | **Remove.** Michigan has no statewide FOIA aggregate. Value is fabricated. |
| 3 | Voter turnout | "68.9%" | **WRONG** — replace | **Fix:** `74.64%`, source: UF Election Lab `Turnout_2024G_v0.3.csv`, as-of Nov 2024 |
| 4 | FY budget | "$60B" | UNSOURCED — wrong | **Fix:** Replace with two VERIFIED cards per decision below. |

---

## B. BUDGET SECTION (lines 32–48, 146–203)

**Decision received:** Remove fabricated pie/bar charts. Replace with two VERIFIED stat cards:

| Stat | Verified figure | Source | As-of |
|------|----------------|--------|-------|
| All-funds total | $82.52 billion | Michigan House/Senate Fiscal Agencies; Detroit Free Press | FY2025 enacted |
| General Fund | ~$14.8 billion | Michigan House/Senate Fiscal Agencies | FY2025 enacted |

Note: FY2026 (~$81B) was enacted October 2025. Both cards need as-of labels. Link to State Budget Office: `michigan.gov/budget`.

**Removes from code:** `budgetData` array (lines 32–40), `budgetPie` array (lines 42–48), entire bar chart and pie chart JSX (lines 148–203), narrative "Education leads at 28%..." (line 198). Also removes `PieChart`, `Pie`, `Cell`, `BarChart`, `Bar` from recharts import if no longer used elsewhere.

---

## C. FOIA VOLUME CHART (lines 50–57, 207–233)

**Decision received:** Remove entirely. Michigan has no public statewide FOIA aggregate.

**Removes from code:** `foiaRequests` array (lines 50–57), entire FOIA chart Card (lines 209–233).

**Keeps:** The "How to file a FOIA" accordion (lines 235–259), "Filing a FOIA Request" educational card (lines 430–451), and FOIA fee correction (see Section G below).

---

## D. VOTER TURNOUT CHART (lines 59–65, 263–313)

**Decision received:** Rebuild from UF Election Lab VEP. Use confirmed figures from table above.

**Replace `voterTurnout` array** (lines 59–65) with:

```ts
const voterTurnout = [
  { year: "2016", turnout: 65.54, national: 60.12 },
  { year: "2018", turnout: 57.62, national: 50.05 },
  { year: "2020", turnout: 73.27, national: 66.38 },
  { year: "2022", turnout: 58.92, national: 46.22 },
  { year: "2024", turnout: 74.64, national: 64.07 },
];
```

Source citation to add below chart: UF Election Lab, `election.lab.ufl.edu/voter-turnout/`, data as of March 2, 2026.

**Fix narrative** (line 288): "The 2020 election saw record 71.4% turnout" → correct to "Michigan's 2024 election set a new turnout record at 74.6% of eligible voters, surpassing the prior 2020 record (73.3%). Both elections followed expanded voting access under Proposal 3 (2018)."

---

## E. ELECTED OFFICIALS (`electedOfficials`, lines 67–72)

| # | Official | Status | Level | Source |
|---|----------|--------|-------|--------|
| 23 | Gov. Gretchen Whitmer | Correct. Re-elected 2022, term 2023–2027. | VERIFIED | michigan.gov/whitmer |
| 24 | Lt. Gov. Garlin Gilchrist II | Correct. Re-elected 2022, term 2023–2027. | VERIFIED | michigan.gov/ltgovernor |
| 25 | AG Dana Nessel | Correct. Re-elected 2022, term 2023–2027. | VERIFIED | michigan.gov/ag |
| 26 | SoS Jocelyn Benson | Correct. Re-elected 2022, term 2023–2027. | VERIFIED | michigan.gov/sos |

No changes needed to the data. "Since 2019" is accurate as continuous start of service.

---

## F. PUBLIC MEETINGS (`publicMeetings`, lines 74–80)

All 5 meetings are in **March 2026** — 80+ days in the past as of 2026-05-30.

**Decision received:** Option A — remove static list, replace with linkouts to official Open Meetings Act calendars per body.

**Replacement linkouts:**

| Body | Official calendar URL |
|------|-----------------------|
| State Board of Education | `michigan.gov/mde/about/boardofeducation` |
| Natural Resources Commission | `michigan.gov/dnr/about/nrc` |
| Environmental Rules Committee | `michigan.gov/egle/about/advisory-bodies` |
| MPSC Rate Cases | `mi-psc.my.site.com/s/` |
| Transportation Commission | `michigan.gov/mdot/about/transportation-commission` |

Card copy: "Meetings listed here go stale quickly. Find current dates and agendas at each body's official calendar."

**Removes from code:** `publicMeetings` array (lines 74–80) and the map rendering it (lines 384–399).

---

## G. FOIA FEE COPY — FACTUAL ERROR (line 255)

**Current (wrong):** "the first $20 of costs is waived for most requests"

**Correct (MCL 15.234(1)(c)):** The $20 fee reduction applies to indigent individuals who certify by affidavit that they receive public assistance or that their household income does not exceed 125% of the federal poverty level. It does not apply to most requests.

**Fix:** "Agencies can charge for search, review, and copying. Indigent individuals may receive a fee reduction of up to $20 by submitting an affidavit of eligibility (MCL 15.234). Electronic records are generally less expensive than paper copies."

---

## H. BROADBAND SECTION (lines 504–538)

**Decision received:** Remove unsourced figures; keep BEAD and ROBIN (confirmed).

| # | Claim | Status | Action |
|---|-------|--------|--------|
| 32 | "95.3% of Michigan has 25/3 Mbps access" | UNSOURCED — no FCC source confirmed | **Remove** |
| 33 | "32.5% don't subscribe" | UNSOURCED — no Census ACS citation confirmed | **Remove** |
| 34 | "BEAD program: $1.5+ billion for 200,000+ unserved locations" | VERIFIED — NTIA BEAD Program, ntia.gov | **Keep** |
| 35 | "ROBIN Grant: $250M from Coronavirus Capital Projects Fund" | VERIFIED — U.S. Treasury Capital Projects Fund | **Keep** |
| 36 | "Data Center Pipeline — $11.3B+ in projects" (line 532) | UNSOURCED | **Remove inline copy**; the link to /data-centers can remain |

Revised broadband card copy (items 32, 33 removed; 34, 35 kept):
> "Michigan has received $1.5+ billion through the federal BEAD program targeting 200,000+ unserved locations, and $250M through the ROBIN Grant (Coronavirus Capital Projects Fund) for broadband infrastructure. [Sources: NTIA BEAD Program; U.S. Treasury CPF]"

---

## I. EMBEDDED SUB-COMPONENTS (out of scope for this pass)

The following components render on `/civic-data` and contain additional factual claims not audited here:

- `ALICEDashboard` — `artifacts/access-mi/src/components/civic/ALICEDashboard.tsx`
- `BroadbandDashboard` — `artifacts/access-mi/src/components/broadband/BroadbandDashboard.tsx`
- `EconomicVitalityDashboard` — `artifacts/access-mi/src/components/civic/EconomicVitalityDashboard.tsx`
- `HazardRiskDashboard` — `artifacts/access-mi/src/components/civic/HazardRiskDashboard.tsx`
- `EconomicPulse` — `artifacts/access-mi/src/components/economic/EconomicPulse.tsx`
- `LegislativeTracker` — `artifacts/access-mi/src/components/civic/LegislativeTracker.tsx`

---

## SUMMARY — WHAT PHASES 1–4 WILL DO

### Remove (fabricated / unsourced):
- `budgetData` + `budgetPie` arrays + both charts
- `foiaRequests` array + FOIA volume chart
- `publicMeetings` array + meeting list rendering
- Stat card: "19" state departments
- Stat card: "19,500" FOIA requests
- Broadband figures: 95.3%, 32.5%, $11.3B+ inline copy

### Fix data values:
- `voterTurnout` array → UF Election Lab confirmed figures (table in Section D)
- Stat card voter turnout: 68.9% → 74.64%
- Budget stat cards: "$60B" → two VERIFIED cards ($82.52B all-funds, ~$14.8B GF)
- Narrative line 288: correct "record 71.4%" claim

### Fix copy error:
- FOIA fee accordion: "waived for most requests" → indigent individuals per MCL 15.234

### Add:
- `DataProvenance` badge component + `provenance.ts` types (Phase 1)
- Methodology-note card at top of page (mirrors LeanHealthcarePage pattern)
- Open Meetings linkouts replacing static meeting list
- Source + as-of label on voter turnout chart

### Keep unchanged:
- Four elected officials (all VERIFIED)
- BEAD $1.5B+ and ROBIN $250M broadband claims
- FOIA 5-business-day window (MCL 15.235 — correct)
- All educational content (how-to-FOIA steps, open data portals list)
- "Regulatory & Legislative Tools" card links
- All embedded sub-components (out of scope)
