# SDWIS Feasibility and PWS-to-Geography Crosswalk

**Status: research only. Renders nothing. Changes no source count.**
**This document is the GO / GO-WITH-CAVEAT / NO-GO gate before any SDWIS
integration PR is written.**

Authored: 2026-06-27. Branch: `docs/sdwis-feasibility-crosswalk`.

## Disposition: GO-WITH-CAVEAT

The data supports building the metric. Two reframes are required first; they
change what the rendered sentence can say, not whether it can be rendered.

### What CAN be rendered

> Share of Michigan residents **served by a community water system** whose
> system has an active health-based drinking-water violation.

Both the numerator (PWS with active health-based violations) and the
denominator (population on a regulated CWS) are computable from EPA-published
fields with no hand-construction, modulo one methodology choice spelled out
below.

### What CANNOT be rendered

> Share of Michiganders with an active health-based drinking-water violation.

That framing implies a denominator of all Michigan residents (~10.14 million,
PEP V2024). About 27% of that population is on private wells outside SDWA
scope. SDWIS has no opinion on their water; presenting them in the denominator
turns the share into a number with no source defense. The integration PR must
use the CWS-served denominator (~7.43M) and the rendered copy must name it.

### Why GO-WITH-CAVEAT, not GO

The join holds. The data exists. The labels reach EPA's own definitions for
each piece, except one: the pairing of `VIOLATION_STATUS` values that
constitutes "active" is **AccessMI methodology**, not an EPA-attributable
quote. See Q3 below; the integration PR must label it as such.

The two caveats are:
1. The metric's universe is "Michiganders served by a CWS," not "Michiganders."
2. The "active" filter is a documented AccessMI methodology choice, not a
   verbatim EPA filter.

---

## Source currency (standing rule)

EPA's ECHO **SDWA Data Download Summary** page states verbatim:

> "remain current as of April 15, 2025"
> "refreshed quarterly"
> "Last updated on December 9, 2025"

Source: <https://echo.epa.gov/tools/data-downloads/sdwa-download-summary>

The actual file behind that page tells a different story:

- `SDWA_latest_downloads.zip`, last-modified `2026-04-08`, size 523,560,928 bytes
- Every row in the extracted CSVs carries `SUBMISSIONYEARQUARTER = "2026Q1"`.

The page narrative is stale; the data is the **FY2026Q1 snapshot** with file
date 2026-04-08. The integration PR's vintage label should be derived from the
file's `SUBMISSIONYEARQUARTER` (e.g. `"FY2026Q1 (file 2026-04-08)"`), not the
page text. The same script that pulls the data also records the
`SUBMISSIONYEARQUARTER` it observed.

## Q1: population-served fill rate

Source: `SDWA_PUB_WATER_SYSTEMS.csv` inside `SDWA_latest_downloads.zip`
(EPA-published bulk download). Filter `PRIMACY_AGENCY_CODE = 'MI'` and
`PWS_ACTIVITY_CODE = 'A'`.

| Subset | Rows | `POPULATION_SERVED_COUNT > 0` | `= 0` | null/blank |
|---|---|---|---|---|
| MI Active (all PWS types) | 10,955 | 99.9% | 6 | 0 |
| MI Active CWS only (the (c) universe) | 1,377 | 99.6% | 6 | 0 |

Aggregate population served by MI active CWS in this snapshot: 7,427,437. This
is the only honest denominator for the (c) metric.

CWS = Community Water System (`PWS_TYPE_CODE = 'CWS'`). EPA's own definition of
CWS is "a public water system that supplies water to the same population
year-round" (40 CFR 141.2) and is the system type whose subscribers are
"residents served." Non-CWS types (TNCWS transient, NTNCWS non-transient
non-community) serve schools, factories, campgrounds, etc. and have different
denominator semantics. They are out of scope for "Michiganders served by their
home water system."

**Q1 verdict: fill rate is essentially 100%. Q1 is not a blocker.**

## Q2: PWS-to-geography resolution

Source: `SDWA_GEOGRAPHIC_AREAS.csv`, joined to `SDWA_PUB_WATER_SYSTEMS.csv` on
`PWSID`. EPA-published.

For each MI active PWS, count rows by `AREA_TYPE_CODE`:

| Geography | `AREA_TYPE_CODE` | MI rows total | MI active PWS with >= 1 row |
|---|---|---|---|
| County | `CN` | 26,821 | 10,953 of 10,955 (99.98%) |
| City | `CT` | 3,859 | not measured |
| ZIP | `ZC` | 3,265 | 3,265 |

For active CWS specifically (the (c) universe):

- All 1,377 MI active CWS have at least one county row.
- All such county rows carry a valid 3-digit ANSI FIPS code in
  `ANSI_ENTITY_CODE` (zero blanks).
- Population coverage of the county join: 100.00% (all 7,427,437 served
  residents fall under a system with at least one county row).
- Across the full MI active PWS set (10,955 systems of all types), 2 PWS have
  a multi-county footprint. Filtered to the (c) universe (1,377 active CWS), 1
  PWS has a multi-county footprint. EPA records each county-of-service as a
  separate row in `SDWA_GEOGRAPHIC_AREAS` but does **not** split the population
  field across them.

ZIP coverage is sparse: only 3,265 MI PWS have any `ZC` rows. The ZIP variant
(b) is not viable on the publisher's own attribution; it would have to be
synthesised from PWS service-area polygons that EPA does not publish.

**Q2 verdict: GO on county resolution. Multi-county PWS are the only error
source for the (c) join, and they are bounded at 2 systems.**

Known error for the (c) join:

- A small number of systems serve multiple counties. EPA writes one row per
  county in `SDWA_GEOGRAPHIC_AREAS` and does not apportion the
  `POPULATION_SERVED_COUNT`. Naive aggregation by `county_fips` will count
  those systems' populations in every county-of-service. **With 1 affected
  active CWS in this snapshot** (the (c) universe), the population at risk of
  double-count is bounded and disclosable in the methodology copy. The
  integration PR must pick one rule from {split equally; attribute to first
  listed; attribute to primary county only} and disclose it.

## Q3: "health-based" and "active" as filterable fields

### Health-based: EPA pre-computes this

`SDWA_VIOLATIONS_ENFORCEMENT.csv` carries a column **`IS_HEALTH_BASED_IND`**
(Y/N). EPA's own SDWA FAQ defines the underlying categories verbatim:

> "Health-Based violations fall into three categories: 1) exceedances of the
> maximum contaminant levels (MCLs) which specify the highest allowable
> contaminant concentrations in drinking water, 2) exceedances of the maximum
> residual disinfectant levels (MRDLs), which specify the highest
> concentrations of disinfectants allowed in drinking water, and 3) treatment
> technique requirements, which specify certain processes intended to reduce
> the level of a contaminant."

Source: <https://echo.epa.gov/help/sdwa-faqs>

Maps directly to `SDWA_REF_CODE_VALUES.csv` `VIOLATION_CATEGORY_CODE` values:

| Code | Description (REF table verbatim) | Health-based? |
|---|---|---|
| `MCL` | Maximum Contaminant Level Violation | yes |
| `MRDL` | Maximum Residual Disinfectant Level | yes |
| `TT` | Treatment Technique Violation | yes |
| `MR` | Monitoring and Reporting | no |
| `MON` | Monitoring Violation | no |
| `RPT` | Reporting Violation | no |
| `Other` | Other Violation | no |

The integration PR should filter on `IS_HEALTH_BASED_IND = 'Y'` (the
pre-computed field) rather than rebuilding the category list. The mapping
above is for documentation, not as a hand-built filter.

### "Active": four EPA-defined statuses, no EPA-defined pairing

`SDWA_VIOLATIONS_ENFORCEMENT.csv` has a `VIOLATION_STATUS` column with these
four values, per EPA's ECHO help text (each definition verbatim):

| Status | EPA definition |
|---|---|
| **Unaddressed** | "The violation is not Resolved or Archived and has not been addressed by formal enforcement actions." |
| **Addressed** | "The violation is not Resolved or Archived, and is addressed by one or more formal enforcement actions." |
| **Resolved** | "The violation has at least one resolving enforcement action. In SDWIS, this indicates that either the system has returned to compliance from the violation, the rule that was violated was no longer applicable, or no further action was needed." |
| **Archived** | "The violation is not Resolved, but is more than five years past its noncompliance period end date. In keeping with the Enforcement Response Policy, the violation no longer contributes to the public water system's overall compliance status." |

Source: <https://echo.epa.gov/help/sdwa-faqs> and
<https://echo.epa.gov/help/drinking-water-qlik-dashboard-help>

**EPA does not publish an explicit "current violations =
{Unaddressed, Addressed}" statement.** Both the help pages and the Drinking
Water Dashboard reference page state which statuses exist; neither states
which combination the dashboard uses to compute its visible counts. I checked.

This means the choice of how to pair statuses into "active" is an
**AccessMI methodology decision**, not a quote from EPA. The integration PR
must label it that way in copy and methodology, never as "EPA's definition of
active."

Two defensible filters are available; both must carry the AccessMI label.

| AccessMI filter | What it counts | Trade-off |
|---|---|---|
| `Unaddressed` ∪ `Addressed` (recommended) | All current violations the state has not yet returned to compliance, whether or not formal enforcement has started. Matches the everyday meaning of "active." | Sets a slightly higher number than the narrower variant. |
| `Unaddressed` only | Current violations with no formal enforcement action yet. Highlights enforcement backlog. | Excludes violations that are still in noncompliance but have an enforcement action open. |

The integration PR should choose, label the choice as AccessMI methodology,
and surface the count under both filters once during development to confirm
the metric is robust to the choice (a difference of less than, say, 20% means
either filter tells the same civic story; a larger difference means the choice
is itself the story).

`PRIMACY_AGENCY_CODE` and `IS_HEALTH_BASED_IND` need no methodology layer.
Only the status pairing does.

**Q3 verdict: GO on the categorical fields. The "active" pairing must be
labeled AccessMI methodology, not EPA's. This is the load-bearing caveat.**

## Recommended join for the (c) metric

Inputs (all from `SDWA_latest_downloads.zip`):

- `SDWA_PUB_WATER_SYSTEMS.csv`: filter `PRIMACY_AGENCY_CODE = 'MI'`,
  `PWS_ACTIVITY_CODE = 'A'`, `PWS_TYPE_CODE = 'CWS'`. Carries
  `POPULATION_SERVED_COUNT`.
- `SDWA_GEOGRAPHIC_AREAS.csv`: filter to MI PWSIDs above,
  `AREA_TYPE_CODE = 'CN'`. Carries `ANSI_ENTITY_CODE` (3-digit county FIPS).
- `SDWA_VIOLATIONS_ENFORCEMENT.csv`: filter to MI PWSIDs above,
  `IS_HEALTH_BASED_IND = 'Y'`, `VIOLATION_STATUS IN ('Unaddressed', 'Addressed')`
  (AccessMI methodology).
- `SDWA_REF_ANSI_AREAS.csv`: county FIPS to county-name reference (state code
  26 = Michigan).

Output shape per county:

- `population_on_cws` = sum of `POPULATION_SERVED_COUNT` across systems mapped
  to the county.
- `population_with_active_health_violation` = sum of `POPULATION_SERVED_COUNT`
  across systems that have at least one row passing the violations filter.
- `share` = ratio of the two, capped at 1.0. Multi-county PWS apportionment
  rule disclosed.

Statewide rollup uses the same numerators and denominators, summed.

This PR does not compute any of those values. It establishes that the join
works.

## What this PR does NOT do

- It does not compute or render any per-county share.
- It does not add a source to `sourcesRegistry.ts`.
- It does not change `SOURCES_TOTAL`, `EXPECTED_SOURCE_COUNT`, or any
  `routeMeta.ts` literal.
- It does not write a refresh script or pipeline.
- It does not add or imply an integrity-tier label for a future tile.

Those belong to the integration PR that this gate authorizes.

## Caveats the integration PR must surface in copy

These are not optional. They follow directly from the findings above.

1. **Denominator is CWS-served residents (~7.43M in the FY2026Q1 snapshot),
   not all Michigan residents (~10.14M).** Rendered copy must say "served by
   a community water system" or equivalent. Residents on private wells are
   outside SDWA scope.
2. **The `Unaddressed` ∪ `Addressed` pairing of `VIOLATION_STATUS` is an
   AccessMI methodology decision**, not an EPA-attributable definition. EPA
   defines each status; the integration PR documents the chosen pair.
3. **Multi-county PWS (1 active CWS in this snapshot, of 1,377) need an
   apportionment rule.** Pick one and disclose it.
4. **Source vintage label uses `SUBMISSIONYEARQUARTER` from the file**, not
   the ECHO page narrative. The page narrative is publicly stale.
5. **Tier:** the rendered value is computed from EPA's primary published
   fields, so a future tile is eligible for the **VERIFIED** tier. The
   AccessMI methodology layer (status pairing, multi-county rule) is part of
   what gets declared at point of render and does not demote the tier;
   methodology and tier are orthogonal.

## Access path used in this research

| Pull | Endpoint | Result |
|---|---|---|
| Currency date narrative | ECHO SDWA Data Download Summary page | confirmed verbatim |
| PWS roster | `SDWA_PUB_WATER_SYSTEMS.csv` in `SDWA_latest_downloads.zip` | used |
| PWS geography | `SDWA_GEOGRAPHIC_AREAS.csv` in same zip | used |
| Code values | `SDWA_REF_CODE_VALUES.csv` in same zip | used |
| Violations schema | header of `SDWA_VIOLATIONS_ENFORCEMENT.csv` (4 GB; not loaded in full) | schema confirmed |
| Status definitions | ECHO SDWA FAQ and Drinking Water Dashboard help | quoted verbatim |
| "Current = U+A" pairing | searched ECHO FAQ, Drinking Water Dashboard help, and dashboard reference page; **no EPA statement found** | AccessMI methodology label required |

All endpoints in this section resolve. The Envirofacts SDWIS REST API was not
needed; the ECHO bulk download answered every question with a single 520 MB
file. The integration PR could use either.

## Companion artifact

`artifacts/access-mi/docs/sdwis-mi-pws-county-crosswalk.csv` is checked in
alongside this doc. It is the MI active CWS slice of
`SDWA_GEOGRAPHIC_AREAS.csv` joined to `SDWA_PUB_WATER_SYSTEMS.csv`, pinned to
the FY2026Q1 snapshot. Columns: `pwsid`, `pws_name`, `population_served`,
`county_fips`, `county_name`, `is_multi_county`. Row count, conservation
check, and shape are documented at the top of that file.

The integration PR may regenerate the crosswalk from EPA's tables; the
checked-in version pins the snapshot date that this gate document is
authored against.
