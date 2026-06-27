# Data Source Candidate Registry

**Status: Non-rendered research backlog. Discovery and provenance vetting only.**
**No source listed here is integrated. No value below is rendered in the app.**
**This document gates future one-source-per-PR integration work.**

Authored: 2026-06-26. Branch: `docs/data-source-candidate-registry`.

## Purpose

The platform integrates 41 source organizations (23 federal, 9 state, 9 nonprofit) per
`src/data/sourcesRegistry.ts`. This registry catalogs additional candidate sources
that could deepen localized (county / ZIP / tract / point) coverage for Michigan.
Every candidate is vetted against the per-candidate schema before integration is
even considered. Sources whose access method or Michigan coverage cannot be
verified from official documentation are marked `unverified, manual check needed`
and held back.

## Conventions

- Geographic resolution values map to the `GeoResolution` enum at
  `src/types/data-layers.ts`: `state`, `county`, `zcta`, `tract`, `point`,
  `modeled_to_zip`, `unverified`. Census block-group resolution records as `tract`.
- Proposed provenance tier values map to the integrity-tier labels rendered by
  `IntegrityBadge`: `VERIFIED`, `MODELED`, `PROJECTED`. These tiers are proposed
  only; they become assertions when a source is wired in and audited.
- Relation to existing 41 is one of: `net-new`, `upgrades <named existing source>`,
  `duplicates <named existing source>`. The 41 are enumerated in
  `src/data/sourcesRegistry.ts`.
- Effort tiers: S (drops into existing `refresh-*.mjs` pattern, county CSV or
  open REST), M (needs transform, key handling, or schema reshaping), L (satellite
  or gridded aggregation, complex scraping, or large transform pipeline).
- Disposition: GO (recommend integration in a future PR), HOLD (needs manual
  follow-up or further vetting), NO-GO (already integrated, low civic value, or
  blocked by access).

## Per-candidate schema

**Rule for every entry: no illustrative or example data values anywhere in
this registry.** Describe what a source measures qualitatively (e.g.,
"county-month unemployment rate" or "facility-level PFAS sampling
concentrations") and never paste a sample number, a specific reading, a
ranking, or a percentage from the source. This document must not become a
secondary surface for unsourced or out-of-context figures. Dataset-spec
metadata (pixel size, file format, release lag, geographic footprint count)
is not a data value and is in scope.

Every candidate entry uses this exact 12-field order:

```
1. Source and publisher        - primary federal / state / local authority
2. Michigan-relevant measures  - what the source actually exposes for MI
3. Native geography            - GeoResolution enum value
4. Michigan coverage           - confirmed / partial / unverified
5. Latest vintage              - most recent release as of authoring date
6. Update cadence              - real-time / daily / monthly / quarterly /
                                 annual / irregular
7. Access method               - open REST (no key) / REST (free key) /
                                 bulk CSV / Socrata or data.gov /
                                 scrape / FOIA
8. Proposed provenance tier    - VERIFIED / MODELED / PROJECTED with
                                 one-line justification
9. Relation to existing 41     - net-new / upgrades <X> / duplicates <X>
10. Effort                     - S / M / L with one-line reason
11. Disposition                - GO / HOLD / NO-GO with reason
12. Source URL(s)              - primary documentation page(s)
```

## Summary table

One line per candidate. Detailed prose entries follow under "Candidates"
below. `Native geography` records the GeoResolution enum value; `Tier` is the
proposed integrity tier; `Effort` is S / M / L; `Relation` is the
classification against the existing 41 sources; `Disp.` is the disposition.

| # | Candidate | Native geography | Tier | Effort | Relation to 41 | Disp. |
|---|-----------|------------------|------|--------|----------------|-------|
| 1 | BLS LAUS | county | VERIFIED | S | upgrades `FRED / BLS` | GO |
| 2 | BLS QCEW | county | VERIFIED | S | upgrades `FRED / BLS` | GO |
| 3 | FEMA National Risk Index | county | MODELED | S | duplicates `FEMA NRI` | NO-GO |
| 4 | HUD PIT homelessness counts | unverified (CoC) | VERIFIED | S | duplicates `HUD PIT Count` | NO-GO |
| 5 | HUD Fair Market Rents | zcta | VERIFIED | S | duplicates `HUD Fair Market Rents` | NO-GO |
| 6 | HUD Picture of Subsidized Households | tract | VERIFIED | S | net-new | GO |
| 7 | HUD LIHTC database | point | VERIFIED | S | net-new | GO |
| 8 | IRS SOI county income | county | VERIFIED | S | duplicates `IRS Statistics of Income` | NO-GO (org) / HOLD (datasets) |
| 9 | IRS SOI county-to-county migration | county | VERIFIED | S | duplicates `IRS Statistics of Income` | NO-GO (org) / HOLD (datasets) |
| 10 | CDC WONDER (mortality, natality) | county (web UI only) | VERIFIED | M | net-new | HOLD |
| 11 | CDC FluView / NREVSS | state | VERIFIED | M | net-new | HOLD |
| 12 | CDC NIS (immunization) | state | VERIFIED | M | net-new | HOLD |
| 13 | NHTSA FARS | county | VERIFIED | S | net-new | GO |
| 14 | EPA ECHO | point | VERIFIED | S to M | net-new | GO |
| 15 | EPA SDWIS | point | VERIFIED | S to M | net-new | GO |
| 16 | EPA UCMR (5) | point | VERIFIED | M | net-new | GO |
| 17 | HRSA HPSA / MUA | county / tract | VERIFIED | S | duplicates `HRSA Data Warehouse` | NO-GO (org) / HOLD (datasets) |
| 18 | CMS Hospital Compare | point | VERIFIED | S | duplicates `CMS Hospital Compare` | NO-GO |
| 19 | CMS Nursing Home Compare | point | VERIFIED | S | net-new | GO |
| 20 | CMS Provider of Services file | point | VERIFIED | S | net-new | GO |
| 21 | SAMHSA FindTreatment | point | VERIFIED | S | net-new | GO |
| 22 | USDA SNAP retailer locator | point | VERIFIED | S | net-new | GO |
| 23 | FCC National Broadband Map | tract | VERIFIED | S | duplicates `FCC BDC` | NO-GO |
| 24 | Census LODES / LEHD | tract (block native) | VERIFIED | M | net-new | HOLD |
| 25 | NOAA Storm Events | county | VERIFIED | S | net-new | GO |
| 26 | NOAA Climate Normals | point (station) | VERIFIED | M | net-new | HOLD |
| 27 | EGLE PFAS / MPART | point | VERIFIED | S to M | duplicates `EGLE MPART PFAS` | NO-GO (org) / HOLD (datasets) |
| 28 | EGLE lead service line inventory | point | VERIFIED | M | duplicates `EGLE MiLeadSafe` | NO-GO (org) / HOLD (datasets) |
| 29 | MDHHS childhood lead testing (via MiTracking) | zcta | VERIFIED | M | duplicates `MDHHS Health Data` | NO-GO (org) / HOLD (datasets) |
| 30 | MiTracking (MI Env Public Health Tracking) | zcta | VERIFIED | M | duplicates `MDHHS Health Data` | NO-GO (org) / HOLD (datasets) |
| 31 | Michigan State Police MICR (crime) | unverified | VERIFIED | L | net-new | HOLD |
| 32 | MI School Data / MDE | point | VERIFIED | S | duplicates `Michigan Dept of Education` | NO-GO |
| 33 | Detroit Open Data Portal (sample municipal) | point / parcel | VERIFIED | M | net-new | HOLD |
| 34 | NASA TEMPO | unverified (gridded) | MODELED | L | net-new | HOLD |
| 35 | NASA SEDAC GPW (gridded population) | unverified (gridded) | MODELED | L | net-new | HOLD |
| 36 | NASA POWER (meteorology / solar) | unverified (gridded) | MODELED | M to L | net-new | GO |
| 37 | NASA MODIS LST (urban heat) | unverified (gridded) | MODELED | L | net-new | GO |

## Ranked integration backlog

Ordered by civic value and provenance cleanliness ahead of effort. Each item
becomes its own future one-source-per-PR work. The ranking criteria, in
order: (a) deepens local Michigan coverage at `county` / `zcta` / `tract` /
`point`; (b) clean VERIFIED tier from a primary authority; (c) low or
medium effort; (d) fills a substantive gap in the existing 41.

### Integrate first (top 5 GO)

1. **BLS LAUS** - upgrades `FRED / BLS`. All 83 counties, monthly, free
   keyed REST, VERIFIED. Each future PR for this becomes a single source
   integration.
2. **BLS QCEW** - upgrades `FRED / BLS`. County-by-industry quarterly
   panel; no key for CSV slices, VERIFIED.
3. **NHTSA FARS** - net-new. County-level federal fatal-crash authority via
   open REST with FIPS filters; complements MDOT GIS.
4. **USDA SNAP Retailer Locator** - net-new. Statewide point-level food-
   access dataset; CSV per state; directly improves the existing food-access
   surface.
5. **EPA SDWIS** - net-new. PWS-level drinking-water violations and
   enforcement history; complements MiLeadSafe and EGLE PFAS coverage with
   the federal SDWA backbone.

### Next tier of GO items

6. **CMS Nursing Home Compare** - net-new. Closes the aging-services gap;
   Provider Data Catalog drop-in.
7. **CMS Provider of Services file** - net-new. Substantial extension of
   provider directory beyond NPPES and Hospital Compare.
8. **SAMHSA FindTreatment** - net-new. Behavioral-health discoverability;
   documented developer API.
9. **HUD Picture of Subsidized Households** - net-new. Tract / ZIP / county
   subsidized-housing rolls; HUD USER CSV.
10. **HUD LIHTC database** - net-new. Project-level LIHTC properties; HUD
    USER CSV.
11. **EPA ECHO** - net-new. Cross-program facility enforcement; complements
    EPA TRI.
12. **EPA UCMR 5** - net-new. Federal PFAS monitoring stream that
    complements EGLE MPART sampling.
13. **NOAA Storm Events** - net-new. County-keyed historical hazard log;
    pairs with NWS Weather API and FEMA NRI.
14. **NASA MODIS LST** - net-new, MODELED. Urban heat vulnerability layer
    for Michigan urban centers; L effort but fills a real gap.
15. **NASA POWER** - net-new, MODELED. Energy-burden / climate-stress
    modeled inputs; integrate narrowly to specific dashboard needs.

### HOLD items requiring an owner decision before integration

- **CDC WONDER** (mortality, natality) - decide on suppression and XML-
  replay pipeline.
- **CDC FluView / NREVSS, CDC NIS** - state-only; revisit only if local
  surveillance becomes available.
- **NOAA Climate Normals** - decide station-to-county aggregation rule.
- **Census LODES / LEHD** - confirm Michigan partnership status before
  scoping.
- **MICR (crime)** - confirm access channel; consider FBI CDE alternative
  (agent-proposed addition A1).
- **NASA TEMPO** - decide render strategy (tract-aggregated mean? raster
  tile layer? ZIP rollup?) before committing.
- **NASA SEDAC GPW** - Census ACS already provides population at tract.
- **Detroit Open Data Portal (class of municipal portals)** - decide
  whether to integrate any city portals at all before scoping individual
  cities.

### Dataset-expansion (no new source slot, surface new streams from
already-counted orgs)

- **IRS SOI** - add county-income series and county-to-county migration as
  dataset streams.
- **EGLE MPART** - add fish advisories and surface-water PFAS sampling.
- **EGLE MiLeadSafe** - add CWS-level lead-service-line inventory counts.
- **MDHHS / MiTracking** - add childhood-lead, asthma, and heat measures
  per scoped sub-PR.
- **HRSA HPSA / MUA** - add MUA/P geometry alongside HPSA points if not
  already rendered.

### NO-GO (already counted in the 41-source baseline)

FEMA NRI, HUD PIT Count, HUD Fair Market Rents, FCC BDC, CMS Hospital
Compare, MI School Data / MDE.

---

## Candidates

### Federal

#### BLS LAUS - Local Area Unemployment Statistics

1. **Source and publisher:** U.S. Bureau of Labor Statistics, Local Area
   Unemployment Statistics program.
2. **Michigan-relevant measures:** Monthly civilian labor force, employment,
   unemployment counts, and unemployment rate for all 83 Michigan counties,
   Michigan MSAs (Detroit-Warren-Dearborn, Grand Rapids-Kentwood, Lansing-East
   Lansing, etc.), micropolitan areas, and many cities. State-level series
   also available (seasonally adjusted at state, MSA, and selected metro
   divisions only; county and city data are not seasonally adjusted).
3. **Native geography:** `county` (also `state` and MSA). All 83 MI counties
   reported.
4. **Michigan coverage:** confirmed. LAUS produces monthly estimates for every
   U.S. county including all 83 Michigan counties.
5. **Latest vintage:** Most recent month available; monthly releases with
   roughly a 4 to 6 week lag.
6. **Update cadence:** monthly.
7. **Access method:** REST (free key). BLS Public Data API v2 requires a free
   registration key (higher daily limits than v1, JSON POST body). Also
   available via "Create Customized Tables" web tool and bulk flat-file FTP
   for large pulls.
8. **Proposed provenance tier:** VERIFIED. Direct primary release from the
   federal statistical authority that defines the U.S. unemployment series.
9. **Relation to existing 41:** upgrades `FRED / BLS`. FRED redistributes a
   subset of BLS series; pulling from the BLS API directly gives access to the
   full LAUS county panel (not just the headline rate) and avoids a
   redistributor in the provenance chain.
10. **Effort:** S. County-month series fits the existing `refresh-*.mjs`
    pattern: paged POST requests to one endpoint, keyed by county FIPS, no
    transform beyond rate-to-percent.
11. **Disposition:** GO. Strong civic value (county-month labor market trend
    by all 83 counties), clean federal provenance, low effort.
12. **Source URL(s):**
    - https://www.bls.gov/lau/lauov.htm (program overview)
    - https://www.bls.gov/lau/lausad.htm (extraction instructions)
    - https://www.bls.gov/developers/home.htm (API getting started)
    - https://www.bls.gov/developers/api_signature_v2.htm (v2 signature)

#### BLS QCEW - Quarterly Census of Employment and Wages

1. **Source and publisher:** U.S. Bureau of Labor Statistics, Quarterly Census
   of Employment and Wages program.
2. **Michigan-relevant measures:** Quarterly employment and total wages by
   establishment size and by NAICS industry for all 83 Michigan counties,
   Michigan MSAs, and statewide. Near-universal coverage of jobs covered by
   state unemployment-insurance laws.
3. **Native geography:** `county`.
4. **Michigan coverage:** confirmed. State (FIPS 26) and every Michigan county
   have CSV "area slice" files per quarter.
5. **Latest vintage:** Most recent quarter available; quarterly releases with
   about a two-quarter lag.
6. **Update cadence:** quarterly.
7. **Access method:** open REST (no key) via CSV data slices at
   `data.bls.gov/cew/data/api/{year}/{quarter}/area/{areaCode}.csv` (area
   code 26000 for Michigan, 26XXX for individual counties). Also BLS Public
   Data API v2 (free key) for series access; also bulk downloadable annual
   files.
8. **Proposed provenance tier:** VERIFIED. Direct primary release from the
   federal statistical authority.
9. **Relation to existing 41:** upgrades `FRED / BLS`. FRED surfaces selected
   QCEW headline series; the BLS area-slice CSV API exposes the complete
   industry-by-county panel.
10. **Effort:** S. Predictable URL pattern, county FIPS keying, no auth, fits
    the `refresh-*.mjs` pattern directly.
11. **Disposition:** GO. High civic value (industry mix by county over time)
    and trivially low integration effort.
12. **Source URL(s):**
    - https://www.bls.gov/cew/ (program home)
    - https://www.bls.gov/cew/additional-resources/open-data/ (open data
      access)
    - https://www.bls.gov/cew/additional-resources/open-data/csv-data-slices.htm
      (CSV slice spec)
    - https://www.bls.gov/cew/downloadable-data-files.htm (bulk files)

#### FEMA National Risk Index

1. **Source and publisher:** Federal Emergency Management Agency, National
   Risk Index for Natural Hazards.
2. **Michigan-relevant measures:** Composite risk index and 18 hazard-specific
   risk scores by county and census tract (e.g., riverine flooding, severe
   storm, tornado, winter weather), with constituent expected annual loss
   and social-vulnerability inputs.
3. **Native geography:** `county` (also `tract`).
4. **Michigan coverage:** confirmed (national dataset; all 83 MI counties).
5. **Latest vintage:** Whichever NRI release is current at the time of
   review; refer to FEMA's release notes.
6. **Update cadence:** annual.
7. **Access method:** open REST (no key); also bulk CSV download.
8. **Proposed provenance tier:** MODELED. NRI is a composite-index model
   combining historical loss with social-vulnerability and community-
   resilience scores; not a direct measurement.
9. **Relation to existing 41:** duplicates `FEMA NRI`. Already integrated.
10. **Effort:** S (would be, if not already present).
11. **Disposition:** NO-GO. Already counted in the 41-source baseline. Listed
    here only to confirm the seed-list scan.
12. **Source URL(s):**
    - https://hazards.fema.gov/nri/ (NRI portal)

#### HUD PIT (Point-in-Time) homelessness counts

1. **Source and publisher:** U.S. Department of Housing and Urban Development;
   Continuums of Care submit annually to HUD.
2. **Michigan-relevant measures:** Sheltered and unsheltered homeless counts
   by household composition and subpopulation for each Michigan Continuum of
   Care (CoC).
3. **Native geography:** `unverified` (Continuum of Care is the native unit;
   CoCs aggregate counties but do not map one-to-one).
4. **Michigan coverage:** confirmed. Every MI CoC submits annually.
5. **Latest vintage:** Most recent annual PIT count published.
6. **Update cadence:** annual.
7. **Access method:** bulk CSV / Excel via HUD Exchange.
8. **Proposed provenance tier:** VERIFIED. Primary HUD aggregation from CoC
   submissions.
9. **Relation to existing 41:** duplicates `HUD PIT Count`.
10. **Effort:** S (would be).
11. **Disposition:** NO-GO. Already counted.
12. **Source URL(s):**
    - https://www.hudexchange.info/programs/coc/coc-homeless-populations-and-subpopulations-reports/

#### HUD Fair Market Rents

1. **Source and publisher:** U.S. Department of Housing and Urban Development,
   HUD USER.
2. **Michigan-relevant measures:** Fair Market Rent by unit size (0 to 4
   bedrooms) for FMR areas (counties or HUD-defined Metro FMR areas) and ZIP-
   code-level Small Area FMRs.
3. **Native geography:** `zcta` (Small Area FMR) and county.
4. **Michigan coverage:** confirmed.
5. **Latest vintage:** Current fiscal-year release.
6. **Update cadence:** annual.
7. **Access method:** bulk CSV via HUD USER; also REST FMR API.
8. **Proposed provenance tier:** VERIFIED. Primary HUD computation from
   American Community Survey base rents and survey adjustments.
9. **Relation to existing 41:** duplicates `HUD Fair Market Rents`.
10. **Effort:** S (would be).
11. **Disposition:** NO-GO. Already counted.
12. **Source URL(s):**
    - https://www.huduser.gov/portal/datasets/fmr.html

#### HUD Picture of Subsidized Households

1. **Source and publisher:** U.S. Department of Housing and Urban Development,
   HUD USER.
2. **Michigan-relevant measures:** Characteristics of assisted housing units
   and residents (program type, household composition, demographics, rent
   burden) summarized at the project, PHA, tract, county, city, ZIP, and CBSA
   levels.
3. **Native geography:** `tract` (also `zcta`, `county`, point at project /
   PHA).
4. **Michigan coverage:** confirmed.
5. **Latest vintage:** Most recent reporting year published; check HUD USER
   for the current year before scoping.
6. **Update cadence:** annual.
7. **Access method:** bulk CSV / SAS via HUD USER query tool; downloadable
   summary files. No key required.
8. **Proposed provenance tier:** VERIFIED. HUD's primary aggregation of
   PHA-reported HUD-assisted housing data.
9. **Relation to existing 41:** net-new. The existing HUD entries are PIT and
   FMR; subsidized-housing rolls and resident characteristics are a distinct
   dataset.
10. **Effort:** S. Bulk-CSV download fits the existing data pipeline.
11. **Disposition:** GO. Direct deepening of housing-affordability coverage
    at tract / ZIP / county for Michigan.
12. **Source URL(s):**
    - https://www.huduser.gov/portal/datasets/assthsg.html (program portal)
    - https://www.huduser.gov/portal/HHDR.html (Housing and Health Data
      Dashboard)

#### HUD LIHTC Database

1. **Source and publisher:** U.S. Department of Housing and Urban Development,
   HUD USER (Low-Income Housing Tax Credit database).
2. **Michigan-relevant measures:** Property-level register of LIHTC projects
   placed in service since 1987: address, number of units, low-income units,
   bedroom mix, year credit allocated, year placed in service, new
   construction vs rehab, credit type, financing sources.
3. **Native geography:** `point` (per-project address with lat/long).
4. **Michigan coverage:** confirmed (national database; Michigan filterable).
5. **Latest vintage:** Most recent update published; verify on HUD USER LIHTC
   database page before scoping.
6. **Update cadence:** annual (with some interim updates).
7. **Access method:** bulk CSV / MS Access download from HUD USER; also HUD
   eGIS feature service.
8. **Proposed provenance tier:** VERIFIED. HUD primary register of allocated
   LIHTC projects.
9. **Relation to existing 41:** net-new.
10. **Effort:** S. Point feature dataset, single download, county join via
    spatial filter.
11. **Disposition:** GO. Useful complement to existing affordable-housing
    coverage; specifically locates tax-credit-financed units.
12. **Source URL(s):**
    - https://www.huduser.gov/portal/datasets/lihtc.html (database home)
    - https://lihtc.huduser.gov/ (interactive query)
    - https://hudgis-hud.opendata.arcgis.com/datasets/810ccb34dd464ec4ad4697d35fff21a5_11/about
      (LIHTC properties feature service)

#### IRS SOI - County data (income, EITC, charitable giving)

1. **Source and publisher:** Internal Revenue Service, Statistics of Income
   division.
2. **Michigan-relevant measures:** Returns filed, adjusted gross income,
   wages, EITC claims, charitable contributions, and other tax items
   aggregated to the county level for all 83 Michigan counties.
3. **Native geography:** `county` (also ZIP via the SOI ZIP code data).
4. **Michigan coverage:** confirmed.
5. **Latest vintage:** Most recent SOI county data release; SOI publishes on
   a multi-year lag.
6. **Update cadence:** annual (with two-to-three-year lag).
7. **Access method:** bulk CSV.
8. **Proposed provenance tier:** VERIFIED. IRS primary aggregation of
   tax-return filings.
9. **Relation to existing 41:** duplicates `IRS Statistics of Income`. The
   existing registry entry credits SOI as an integrated org and powers
   ZIP-level income, EITC, and charitable-giving views; the county series
   is a sibling product from the same publisher.
10. **Effort:** S (would be).
11. **Disposition:** NO-GO at the org level (already counted). HOLD for a
    follow-up PR that adds the county-series stream alongside the existing
    ZIP series without changing `SOURCES_TOTAL`.
12. **Source URL(s):**
    - https://www.irs.gov/statistics/soi-tax-stats-county-data
    - https://www.irs.gov/statistics/soi-tax-stats-data-by-geographic-area

#### IRS SOI - County-to-county migration

1. **Source and publisher:** Internal Revenue Service, Statistics of Income
   division.
2. **Michigan-relevant measures:** County-to-county migration flow counts
   (returns, exemptions, AGI) for both inflows and outflows for every
   Michigan county.
3. **Native geography:** `county` (origin-destination pairs).
4. **Michigan coverage:** confirmed (Michigan-specific landing page exists).
5. **Latest vintage:** Most recent filing-year pair released; data files
   exist for filing years 1991 onward, with AGI from 1995 onward.
6. **Update cadence:** annual.
7. **Access method:** bulk CSV.
8. **Proposed provenance tier:** VERIFIED.
9. **Relation to existing 41:** duplicates `IRS Statistics of Income` at the
   org level; the migration product is a distinct dataset stream from EITC or
   county-income tables.
10. **Effort:** S (would be).
11. **Disposition:** NO-GO at the org level. HOLD for a dataset-expansion PR
    that adds the migration flow stream.
12. **Source URL(s):**
    - https://www.irs.gov/statistics/soi-tax-stats-county-to-county-migration-data-files
    - https://www.irs.gov/statistics/soi-tax-stats-migration-data-michigan
    - https://www.irs.gov/statistics/soi-tax-stats-migration-data-downloads

#### CDC WONDER (mortality and natality)

1. **Source and publisher:** Centers for Disease Control and Prevention,
   National Center for Health Statistics; WONDER online query system.
2. **Michigan-relevant measures:** Detailed mortality counts and rates
   (cause-of-death by ICD-10) and natality counts and rates (birth
   characteristics), with the option to group by county in the web UI.
3. **Native geography:** `county` via the WONDER web UI. Note: the WONDER
   API explicitly does not allow grouping by region, state, or county for
   mortality and natality queries; county slicing is only available
   interactively or via captured XML request payloads.
4. **Michigan coverage:** confirmed.
5. **Latest vintage:** Most recent annual file released by NCHS at the time
   of integration (mortality and natality both lag the calendar year).
6. **Update cadence:** annual.
7. **Access method:** scrape (web UI export of TSV) or capture XML POST from
   the UI and replay via the WONDER request controller. Suppression rules
   apply to small counts.
8. **Proposed provenance tier:** VERIFIED. NCHS primary release from vital
   statistics.
9. **Relation to existing 41:** net-new.
10. **Effort:** M. The geographic-grouping restriction on the API means the
    pipeline cannot be a simple REST loop; it has to template XML request
    payloads per county or pull state-then-aggregate and store suppression
    flags.
11. **Disposition:** HOLD. High civic value (county-level cause-specific
    mortality) but the small-cell suppression and XML-request pattern need
    an explicit integration sketch before committing the dataset-stream PR.
12. **Source URL(s):**
    - https://wonder.cdc.gov/ (WONDER portal)
    - https://wonder.cdc.gov/wonder/help/wonder-api.html (API docs and
      grouping restriction)
    - https://wonder.cdc.gov/natality.html

#### CDC FluView and NREVSS (respiratory surveillance)

1. **Source and publisher:** Centers for Disease Control and Prevention;
   ILINet and NREVSS collaborating labs (~100 public health labs and ~300
   clinical labs across all 50 states).
2. **Michigan-relevant measures:** State-level weekly influenza-like-illness
   activity, lab-confirmed influenza, and RSV laboratory positivity (NREVSS).
3. **Native geography:** `state`. National, regional, and state series only;
   no county-level Michigan series in FluView.
4. **Michigan coverage:** confirmed (state level).
5. **Latest vintage:** Most recent surveillance week.
6. **Update cadence:** weekly.
7. **Access method:** open REST (no key) via the CMU Delphi Epidata FluView
   endpoint as a programmatic mirror; CDC also publishes downloadable
   datasets at data.cdc.gov.
8. **Proposed provenance tier:** VERIFIED.
9. **Relation to existing 41:** net-new.
10. **Effort:** M. Simple ingest, but the source mostly mirrors what
    Michigan-state surveillance already publishes through MDHHS.
11. **Disposition:** HOLD. State-only series does not deepen local
    (county / ZIP / tract) coverage, which is the explicit goal of this
    backlog. Revisit if a county-resolution respiratory surveillance product
    becomes available.
12. **Source URL(s):**
    - https://www.cdc.gov/fluview/index.html
    - https://gis.cdc.gov/grasp/fluview/fluportaldashboard.html
    - https://cmu-delphi.github.io/delphi-epidata/api/fluview.html
    - https://data.cdc.gov/Laboratory-Surveillance/Respiratory-Syncytial-Virus-Laboratory-Data-NREVSS/52kb-ccu2

#### CDC NIS (National Immunization Survey)

1. **Source and publisher:** Centers for Disease Control and Prevention,
   National Center for Immunization and Respiratory Diseases.
2. **Michigan-relevant measures:** State-level vaccination coverage estimates
   for children 19-35 months (NIS-Child), teens 13-17 (NIS-Teen), pediatric
   flu and COVID coverage (NIS-Flu), and adult flu and other respiratory
   illness coverage (NIS-FRVM). Survey-based estimates.
3. **Native geography:** `state` (state and local-area estimates; "local
   area" is a small set of urban areas, not a county-by-county series).
4. **Michigan coverage:** confirmed at state level.
5. **Latest vintage:** Most recent annual NIS public-use file.
6. **Update cadence:** annual.
7. **Access method:** bulk dataset (DAT, SAS, R) on cdc.gov/nis; selected
   estimates via data.cdc.gov.
8. **Proposed provenance tier:** VERIFIED. CDC primary survey estimate.
9. **Relation to existing 41:** net-new.
10. **Effort:** M.
11. **Disposition:** HOLD. State-level only; does not deepen local Michigan
    coverage. The state estimate is already available from MDHHS without a
    second federal pipeline.
12. **Source URL(s):**
    - https://www.cdc.gov/nis/about/index.html
    - https://www.cdc.gov/nis/php/datasets-child/index.html

#### NHTSA FARS (Fatality Analysis Reporting System)

1. **Source and publisher:** National Highway Traffic Safety Administration,
   FARS program.
2. **Michigan-relevant measures:** Per-incident records of every fatal
   motor-vehicle crash on a U.S. public road, with date, time, location
   (county FIPS, route, lat/long), persons involved, vehicles, and
   contributing factors. Coverage from 1975 to the present.
3. **Native geography:** `county` (and `point` via incident lat/long).
4. **Michigan coverage:** confirmed; every county has fatal-crash records
   when applicable.
5. **Latest vintage:** Annual file (most recent published case year).
6. **Update cadence:** annual.
7. **Access method:** open REST (no key) via the NHTSA Crash API at
   `crashviewer.nhtsa.dot.gov/CrashAPI`, with endpoints supporting county
   FIPS filters. Also FTP bulk download from 1975 to present.
8. **Proposed provenance tier:** VERIFIED. NHTSA primary federal register of
   fatal crashes.
9. **Relation to existing 41:** net-new. (Crash data also appear via
   `MDOT GIS`, but MDOT GIS scope and methodology differ; FARS is the
   federal fatal-crash authority.)
10. **Effort:** S. Open REST with FIPS filtering and CSV/JSON output fits
    the refresh pattern.
11. **Disposition:** GO. Adds a clean federal fatal-crash county series
    alongside Michigan's own crash data.
12. **Source URL(s):**
    - https://www.nhtsa.gov/research-data/fatality-analysis-reporting-system-fars
    - https://crashviewer.nhtsa.dot.gov/CrashAPI (API root)

#### EPA ECHO (Enforcement and Compliance History Online)

1. **Source and publisher:** U.S. Environmental Protection Agency, ECHO
   program.
2. **Michigan-relevant measures:** Per-facility compliance and enforcement
   records for ~800,000 regulated facilities nationwide across air emissions
   (CAA / ICIS-Air), water discharges (CWA / NPDES), hazardous waste, and
   public drinking water; counts of inspections, violations, formal actions,
   and penalties.
3. **Native geography:** `point` (every record carries a regulated-facility
   address).
4. **Michigan coverage:** confirmed (national dataset; filterable by
   Michigan).
5. **Latest vintage:** Continuously refreshed.
6. **Update cadence:** monthly (with daily updates to some streams).
7. **Access method:** open REST (no key) via ECHO Web Services (Detailed
   Facility Report REST, Air Facility Search REST, Water Facility Search
   REST). Also ECHO Exporter bulk CSV and program-specific zips.
8. **Proposed provenance tier:** VERIFIED. EPA primary integrated compliance
   record.
9. **Relation to existing 41:** net-new. (The existing EPA TRI entry covers
   reported chemical releases; ECHO covers enforcement and violations.)
10. **Effort:** S to M. REST endpoints fit the pattern, but cross-program
    deduplication and Michigan-county joins require care.
11. **Disposition:** GO. Strong civic value for environmental-justice
    surfaces.
12. **Source URL(s):**
    - https://echo.epa.gov/
    - https://echo.epa.gov/tools/web-services (web-services index)
    - https://echo.epa.gov/tools/data-downloads (bulk CSV)

#### EPA SDWIS (Safe Drinking Water Information System)

1. **Source and publisher:** U.S. Environmental Protection Agency, Office of
   Ground Water and Drinking Water; SDWIS Federal Reporting Services.
2. **Michigan-relevant measures:** Per-public-water-system records of
   violations and enforcement of Safe Drinking Water Act regulations: PWS
   identity, population served, source type, plus a ten-year history of
   violations and enforcement actions.
3. **Native geography:** `point` (one row per PWS; PWS serves a defined
   service area).
4. **Michigan coverage:** confirmed; Michigan state-map filter available.
5. **Latest vintage:** Quarterly refresh of SDWA dataset files; current set
   maintained on ECHO.
6. **Update cadence:** quarterly.
7. **Access method:** bulk CSV via ECHO SDWA Download; Envirofacts RESTful
   API (CSV, JSON, Excel, XML); web search via Envirofacts SDWIS Search.
8. **Proposed provenance tier:** VERIFIED. EPA primary register of SDWA
   compliance.
9. **Relation to existing 41:** net-new.
10. **Effort:** S to M. CSV download is S; tying PWS to served ZIP/tract for
    rendering is M.
11. **Disposition:** GO. Material complement to MiLeadSafe and EGLE PFAS
    drinking-water coverage.
12. **Source URL(s):**
    - https://echo.epa.gov/tools/data-downloads/sdwa-download-summary
    - https://enviro.epa.gov/facts/sdwis/search.html
    - https://www.epa.gov/enviro/sdwis-overview

#### EPA UCMR 5 (Unregulated Contaminant Monitoring Rule)

1. **Source and publisher:** U.S. Environmental Protection Agency, Office of
   Ground Water and Drinking Water; Fifth UCMR.
2. **Michigan-relevant measures:** Per-PWS analytical results for 29 PFAS
   compounds and lithium, sampled at large and small Michigan public water
   systems during the UCMR 5 monitoring period.
3. **Native geography:** `point` (one PWS; sample-site lat/long).
4. **Michigan coverage:** confirmed.
5. **Latest vintage:** UCMR 5 monitoring (most recent rolling release).
6. **Update cadence:** quarterly during the UCMR cycle; archival otherwise.
7. **Access method:** bulk text/CSV via UCMR 5 Data Finder and the UCMR
   Occurrence Data page; archival data finder for UCMR 1 through 4.
8. **Proposed provenance tier:** VERIFIED. EPA primary monitoring results.
9. **Relation to existing 41:** net-new (federal complement to EGLE PFAS
   sampling, which is state-led).
10. **Effort:** M. Joining PWS-level samples to served ZIPs/tracts is the
    main transform.
11. **Disposition:** GO. Directly extends the platform's existing PFAS
    surfacing with federal monitoring results.
12. **Source URL(s):**
    - https://www.epa.gov/dwucmr (program home)
    - https://www.epa.gov/dwucmr/fifth-unregulated-contaminant-monitoring-rule-data-finder
    - https://www.epa.gov/dwucmr/occurrence-data-unregulated-contaminant-monitoring-rule

#### HRSA HPSA / MUA (shortage areas)

1. **Source and publisher:** Health Resources and Services Administration,
   Bureau of Health Workforce.
2. **Michigan-relevant measures:** Designated Health Professional Shortage
   Areas (Primary Care, Dental, Mental Health) and Medically Underserved
   Areas and Populations (MUA/P), with HPSA scores and service-area
   geometries.
3. **Native geography:** `county` for many MUA/P; `tract` for geographic
   HPSAs; point for facility HPSAs.
4. **Michigan coverage:** confirmed; statewide MI HPSA maps already
   published by HRSA.
5. **Latest vintage:** Continuously updated.
6. **Update cadence:** quarterly (with rolling designation updates).
7. **Access method:** bulk CSV / XLSX / ASCII / SAS / ZIP via
   `data.hrsa.gov/data/download`; also REST shortage-area lookup tools.
8. **Proposed provenance tier:** VERIFIED. HRSA primary designation.
9. **Relation to existing 41:** duplicates `HRSA Data Warehouse`. The
   existing org credit already powers HPSA/FQHC surfacing.
10. **Effort:** S (would be).
11. **Disposition:** NO-GO at the org level. HOLD for a follow-up dataset
    expansion that adds MUA/P geometry alongside HPSA points if not already
    surfaced.
12. **Source URL(s):**
    - https://data.hrsa.gov/topics/health-workforce/shortage-areas/dashboard
    - https://data.hrsa.gov/data/download?titleFilter=Shortage+Areas

#### CMS Hospital Compare

1. **Source and publisher:** Centers for Medicare and Medicaid Services,
   Provider Data Catalog.
2. **Michigan-relevant measures:** Hospital-level quality measures and star
   ratings.
3. **Native geography:** `point`.
4. **Michigan coverage:** confirmed.
5. **Latest vintage:** Quarterly Provider Data Catalog refresh.
6. **Update cadence:** quarterly.
7. **Access method:** bulk CSV / REST via Provider Data Catalog.
8. **Proposed provenance tier:** VERIFIED.
9. **Relation to existing 41:** duplicates `CMS Hospital Compare`.
10. **Effort:** S (would be).
11. **Disposition:** NO-GO. Already counted.
12. **Source URL(s):**
    - https://data.cms.gov/provider-data/topics/hospitals

#### CMS Nursing Home Compare (Care Compare)

1. **Source and publisher:** Centers for Medicare and Medicaid Services,
   Provider Data Catalog.
2. **Michigan-relevant measures:** Five-Star ratings, certified bed counts,
   quality measures, staffing, ownership, and survey results for every
   Medicare- and Medicaid-certified nursing home in Michigan (a subset of
   the ~15,000 nationwide).
3. **Native geography:** `point`.
4. **Michigan coverage:** confirmed.
5. **Latest vintage:** Quarterly refresh.
6. **Update cadence:** quarterly.
7. **Access method:** bulk CSV via Provider Data Catalog; Socrata Open Data
   API for programmatic filter / query / aggregate.
8. **Proposed provenance tier:** VERIFIED.
9. **Relation to existing 41:** net-new. The existing CMS Hospital Compare
   entry does not cover skilled-nursing facilities.
10. **Effort:** S. Drop-in CSV ingest.
11. **Disposition:** GO. Aging-services coverage is a real gap.
12. **Source URL(s):**
    - https://data.cms.gov/provider-data/topics/nursing-homes
    - https://data.cms.gov/provider-data/dataset/4pq5-n9py (Provider
      Information)
    - https://data.cms.gov/provider-data/dataset/y2hd-n93e (Ownership)

#### CMS Provider of Services file

1. **Source and publisher:** Centers for Medicare and Medicaid Services
   (iQIES Provider of Service file).
2. **Michigan-relevant measures:** Provider demographic and certification
   information across hospitals, non-hospital facilities, home health
   agencies, hospices, ambulatory surgical centers, ESRD facilities, ICF/IID,
   OPT/SLP, CORF, and portable X-ray providers - CMS Certification Number,
   name, address, characteristics.
3. **Native geography:** `point`.
4. **Michigan coverage:** confirmed.
5. **Latest vintage:** Most recent quarterly POS file.
6. **Update cadence:** quarterly.
7. **Access method:** bulk CSV (self-extracting ZIP) and TXT flat files via
   data.cms.gov.
8. **Proposed provenance tier:** VERIFIED.
9. **Relation to existing 41:** net-new.
10. **Effort:** S. Single download per quarter.
11. **Disposition:** GO. Material extension of provider-directory coverage
    beyond NPPES and the existing CMS Hospital Compare entry.
12. **Source URL(s):**
    - https://data.cms.gov/provider-characteristics/hospitals-and-other-facilities/provider-of-services-file-hospital-non-hospital-facilities

#### SAMHSA FindTreatment (behavioral health locator)

1. **Source and publisher:** Substance Abuse and Mental Health Services
   Administration; FindTreatment.gov; Behavioral Health Services Information
   System (BHSIS).
2. **Michigan-relevant measures:** Per-facility records for substance-use and
   mental-health treatment providers in Michigan: name, address, phone,
   coordinates, services offered, payment, age groups, languages.
3. **Native geography:** `point`.
4. **Michigan coverage:** confirmed.
5. **Latest vintage:** Locator is updated weekly for facility metadata;
   annual underlying survey (N-MHSS) refresh.
6. **Update cadence:** weekly (locator); annual (survey).
7. **Access method:** REST (free) via the FindTreatment.gov developer API
   (developer guide PDF); also N-SUMHSS bulk data files for the survey
   backbone.
8. **Proposed provenance tier:** VERIFIED.
9. **Relation to existing 41:** net-new. (NPPES has providers but is not
   behavioral-health-focused.)
10. **Effort:** S.
11. **Disposition:** GO. Directly improves substance-use and mental-health
    care discoverability across Michigan.
12. **Source URL(s):**
    - https://findtreatment.gov/ (locator)
    - https://findtreatment.gov/assets/FindTreatment-Developer-Guide.pdf
      (API developer guide)
    - https://www.samhsa.gov/data/data-we-collect/n-sumhss-national-substance-use-and-mental-health-services-survey/datafiles

#### USDA SNAP Retailer Locator

1. **Source and publisher:** U.S. Department of Agriculture, Food and
   Nutrition Service.
2. **Michigan-relevant measures:** Active SNAP-authorized retailer locations
   (name, type, address, lat/long, authorization dates) statewide, plus
   historical retailers from the past two decades.
3. **Native geography:** `point`.
4. **Michigan coverage:** confirmed (state-by-state CSV download).
5. **Latest vintage:** Rolling current; historical files updated.
6. **Update cadence:** monthly (rolling refresh).
7. **Access method:** bulk CSV per state; also USDA-FNS ArcGIS Hub feature
   service.
8. **Proposed provenance tier:** VERIFIED. USDA-FNS primary authorization
   register.
9. **Relation to existing 41:** net-new (food-access surface).
10. **Effort:** S. State CSV download, fits the pattern.
11. **Disposition:** GO. Direct food-access civic value, low effort.
12. **Source URL(s):**
    - https://www.fns.usda.gov/snap/retailer/historical-data
    - https://usda-snap-retailers-usda-fns.hub.arcgis.com/datasets/USDA-FNS::snap-retailer-location-data/

#### FCC National Broadband Map (BDC)

1. **Source and publisher:** Federal Communications Commission; Broadband
   Data Collection (BDC).
2. **Michigan-relevant measures:** Location-level fixed and mobile broadband
   availability by technology and speed tier, aggregable to block, tract,
   ZIP, county.
3. **Native geography:** `tract` (block native, aggregable upward).
4. **Michigan coverage:** confirmed.
5. **Latest vintage:** Semiannual BDC release.
6. **Update cadence:** semiannual.
7. **Access method:** bulk CSV via broadbandmap.fcc.gov.
8. **Proposed provenance tier:** VERIFIED.
9. **Relation to existing 41:** duplicates `FCC BDC`.
10. **Effort:** S (would be).
11. **Disposition:** NO-GO. Already counted.
12. **Source URL(s):**
    - https://broadbandmap.fcc.gov/

#### Census LODES / LEHD (Origin-Destination Employment)

1. **Source and publisher:** U.S. Census Bureau, Center for Economic Studies;
   Longitudinal Employer-Household Dynamics partnership (LED).
2. **Michigan-relevant measures:** Origin-Destination, Residence Area
   Characteristics, and Workplace Area Characteristics tables (home-to-work
   ties, jobs by industry, worker demographics) at the census block level.
3. **Native geography:** Census block (records as `tract` per the enum
   convention).
4. **Michigan coverage:** **unverified, manual check needed.** Census
   documentation lists Michigan among states that have been "out of
   partnership" with the LEHD program; Michigan LODES data may be
   unavailable, lagged, or limited to historical vintages. Confirm Michigan
   participation status directly with Census Bureau before scoping.
5. **Latest vintage:** Annual files; Michigan vintage depends on partnership
   status.
6. **Update cadence:** annual.
7. **Access method:** bulk CSV via lehd.ces.census.gov/data/lodes/; LED
   Extraction Tool.
8. **Proposed provenance tier:** VERIFIED.
9. **Relation to existing 41:** net-new.
10. **Effort:** M. Block-level rollup to tract / ZIP / county and partnership-
    status handling.
11. **Disposition:** HOLD. Strong civic value (commute flows, jobs by
    industry, neighborhood-level employment) but blocked by the Michigan
    partnership-status question. Verify availability before reopening.
12. **Source URL(s):**
    - https://lehd.ces.census.gov/data/lodes/
    - https://lehd.ces.census.gov/data/
    - https://onthemap.ces.census.gov/

#### NOAA Storm Events Database

1. **Source and publisher:** NOAA National Centers for Environmental
   Information (NCEI).
2. **Michigan-relevant measures:** Per-event records of severe weather
   (tornado, hail, flood, winter storm, wind, heat, etc.) with date, time,
   county FIPS, narrative, deaths, injuries, and property/crop damage
   estimates. Coverage from 1950 to the present.
3. **Native geography:** `county` (FIPS-keyed event records).
4. **Michigan coverage:** confirmed.
5. **Latest vintage:** Recent month's events (lag varies by event type).
6. **Update cadence:** monthly (continuous bulk-file updates).
7. **Access method:** bulk CSV via NCEI HTTP/FTP at
   `ncei.noaa.gov/pub/data/swdi/stormevents/csvfiles/`. Also interactive
   search.
8. **Proposed provenance tier:** VERIFIED.
9. **Relation to existing 41:** net-new. (Complements the existing
   `NWS Weather API` for real-time alerts with a historical event log.)
10. **Effort:** S. Direct CSV ingest with county-FIPS keying.
11. **Disposition:** GO. Strong civic value for hazard history at county
    level.
12. **Source URL(s):**
    - https://www.ncei.noaa.gov/stormevents/ftp.jsp
    - https://www.ncei.noaa.gov/pub/data/swdi/stormevents/csvfiles/

#### NOAA U.S. Climate Normals

1. **Source and publisher:** NOAA NCEI; U.S. Climate Normals (1991-2020).
2. **Michigan-relevant measures:** Station-level annual, seasonal, monthly,
   daily, and hourly temperature and precipitation normals for ~9,800 U.S.
   stations including Michigan stations.
3. **Native geography:** `point` (station-keyed).
4. **Michigan coverage:** confirmed.
5. **Latest vintage:** 1991-2020 Normals (next decadal update planned for
   2031).
6. **Update cadence:** decadal (with revisions inside the cycle).
7. **Access method:** REST (free key) via Climate Data Online v2 web
   services; also bulk file downloads; AWS Registry of Open Data mirror.
8. **Proposed provenance tier:** VERIFIED.
9. **Relation to existing 41:** net-new.
10. **Effort:** M. Station-to-county aggregation rule (nearest station? area-
    weighted across multiple stations?) requires a design decision; the
    pure ingest is S.
11. **Disposition:** HOLD. Useful baseline for heat / cold / precipitation
    context, but needs an explicit aggregation choice before integration.
12. **Source URL(s):**
    - https://www.ncei.noaa.gov/products/land-based-station/us-climate-normals
    - https://www.ncdc.noaa.gov/cdo-web/webservices/v2

### Michigan-specific

#### EGLE PFAS / MPART (Michigan PFAS Action Response Team)

1. **Source and publisher:** Michigan Department of Environment, Great Lakes,
   and Energy (EGLE); MPART (Michigan PFAS Action Response Team).
2. **Michigan-relevant measures:** Official PFAS sites and Areas of Interest;
   public water supply PFAS sampling results; surface water PFAS sampling
   results; fish contaminant monitoring (informing Do Not Eat fish
   advisories); wastewater PFAS data.
3. **Native geography:** `point` (sites are point features with lat/long;
   sampling locations are points). Aggregable to `county` and `zcta`.
4. **Michigan coverage:** confirmed. Statewide, all 83 counties; MPART is the
   designated state response team for the entire state.
5. **Latest vintage:** Ongoing (records updated as investigations progress).
6. **Update cadence:** irregular (ongoing rolling updates as investigations
   and sampling events are recorded).
7. **Access method:** bulk CSV via Socrata or data.gov pattern. The EGLE GIS
   Hub (gis-egle.hub.arcgis.com) is an ArcGIS Hub exposing datasets as open
   downloads in CSV, GeoJSON, KML, and shapefile, with a FeatureServer REST
   endpoint per dataset. No key required.
8. **Proposed provenance tier:** VERIFIED. Direct primary state-authority
   release from the agency conducting the sampling and maintaining the site
   registry.
9. **Relation to existing 41:** duplicates `EGLE MPART PFAS`. The platform
   already credits EGLE / MPART as an integrated org. A future PR could still
   broaden the dataset streams from this org (fish advisories, surface water,
   PWS sampling) without changing `SOURCES_TOTAL`, but the source-org credit
   is already counted.
10. **Effort:** S to M. Sites layer is S (single FeatureServer endpoint, point
    features). Broadening to fish-advisory + surface-water + PWS sampling is M
    (multiple endpoints, schema reconciliation, fish-advisory join logic).
11. **Disposition:** NO-GO at the org level (already counted in 41). HOLD for a
    follow-up dataset-expansion PR that surfaces fish advisories and water-
    sampling results without incrementing the source count.
12. **Source URL(s):**
    - https://www.michigan.gov/egle/maps-data/mpart-pfas-gis (MPART PFAS GIS
      app)
    - https://gis-egle.hub.arcgis.com/ (EGLE Maps and Data Hub)
    - https://gis-egle.hub.arcgis.com/datasets/egle::michigan-pfas-sites/about
      (Michigan PFAS Sites dataset)
    - https://gis-egle.hub.arcgis.com/datasets/egle::michigan-pfas-sites-and-areas-of-interest/about
      (Sites + Areas of Interest)
    - https://www.michigan.gov/pfasresponse/investigations/sites-aoi (MPART
      sites portal)

#### EGLE Lead Service Line Inventory (MiLeadSafe)

1. **Source and publisher:** Michigan Department of Environment, Great Lakes,
   and Energy (EGLE); MiLeadSafe program.
2. **Michigan-relevant measures:** Per-community-water-supply service-line
   materials inventory (lead, galvanized requiring replacement, non-lead,
   unknown) required under Michigan's Lead and Copper Rule.
3. **Native geography:** `point` (service connection or address; aggregable
   to community water supply, ZIP, and county).
4. **Michigan coverage:** confirmed (statewide CWS reporting).
5. **Latest vintage:** Ongoing reporting period.
6. **Update cadence:** annual reporting; rolling updates.
7. **Access method:** Currently surfaced through MiLeadSafe dashboards and
   EGLE GIS Hub; bulk CSV / FeatureServer for the underlying datasets.
8. **Proposed provenance tier:** VERIFIED.
9. **Relation to existing 41:** duplicates `EGLE MiLeadSafe` at the org
   level.
10. **Effort:** M. Service-line counts per CWS are tractable; address-level
    inventory is heavier.
11. **Disposition:** NO-GO at the org level (already counted). HOLD for a
    dataset-expansion PR that surfaces CWS-level lead-service-line counts
    if not already rendered.
12. **Source URL(s):**
    - https://www.michigan.gov/egle/about/featured/mi-lead-safe
    - https://gis-egle.hub.arcgis.com/

#### MDHHS Childhood Lead Testing (via MiTracking)

1. **Source and publisher:** Michigan Department of Health and Human
   Services; MiTracking (Michigan Environmental Public Health Tracking).
2. **Michigan-relevant measures:** Annual childhood blood-lead testing
   counts, percent tested, percent with elevated blood lead, and venous
   confirmation counts by ZIP and county for the under-six population.
3. **Native geography:** `zcta` (and `county`, `state`, local-health-
   department).
4. **Michigan coverage:** confirmed; statewide ZIP and county series
   published from 2010 onward.
5. **Latest vintage:** Most recent MiTracking release year (verify before
   scoping; current portal shows up to a recent year on a multi-year lag).
6. **Update cadence:** annual.
7. **Access method:** MiTracking data portal export (table / chart / map
   download); also annual MDHHS PDF reports.
8. **Proposed provenance tier:** VERIFIED. Primary MDHHS aggregation of
   reportable blood-lead lab results.
9. **Relation to existing 41:** duplicates `MDHHS Health Data` at the org
   level. The existing entry credits MDHHS broadly.
10. **Effort:** M. Portal does not appear to expose a documented public API;
    likely needs a scripted export or a request to MDHHS for a refreshed
    flat file.
11. **Disposition:** NO-GO at the org level. HOLD as a dataset-expansion
    candidate; high civic value but the access channel needs verification.
12. **Source URL(s):**
    - https://www.michigan.gov/mdhhs/safety-injury-prev/environmental-health/topics/mitracking/childhood-lead
    - https://mitracking.state.mi.us/
    - https://www.michigan.gov/documents/mdhhs/Metadata_-_Annual_Blood_Lead_Levels_557229_7.pdf

#### MiTracking (Michigan Environmental Public Health Tracking)

1. **Source and publisher:** MDHHS; part of the CDC National Environmental
   Public Health Tracking Program.
2. **Michigan-relevant measures:** A bundle of MI-specific environmental and
   health datasets (air quality, asthma, drinking water, heat, lead,
   community water systems, reproductive outcomes) at county and selected ZIP
   levels.
3. **Native geography:** `zcta` (for some measures), otherwise `county`.
4. **Michigan coverage:** confirmed.
5. **Latest vintage:** Varies by measure.
6. **Update cadence:** irregular per measure.
7. **Access method:** unverified, manual check needed. The MiTracking portal
   supports interactive query and table/map export but a documented public
   API was not located during research; integration likely depends on
   coordinated downloads or a direct request to MDHHS.
8. **Proposed provenance tier:** VERIFIED. Primary MDHHS curated tracking
   datasets.
9. **Relation to existing 41:** duplicates `MDHHS Health Data` at the org
   level.
10. **Effort:** M. Per-measure download or scripted UI export.
11. **Disposition:** NO-GO at the org level. HOLD as a dataset-expansion
    bucket; if pursued, scope per individual measure (lead, asthma, heat)
    as separate one-source-per-PR work items.
12. **Source URL(s):**
    - https://www.michigan.gov/mdhhs/safety-injury-prev/environmental-health/topics/mitracking
    - https://mitracking.state.mi.us/

#### Michigan State Police MICR (Michigan Incident Crime Reporting)

1. **Source and publisher:** Michigan State Police, Criminal Justice
   Information Center; Michigan Incident Crime Reporting program (a
   superset of NIBRS).
2. **Michigan-relevant measures:** Incident-level offense, arrest, and
   victim records submitted by Michigan law-enforcement agencies; statewide
   totals and per-agency annual breakdowns.
3. **Native geography:** **unverified.** MICR is agency-keyed (~500
   participating agencies in recent reporting years). Agency-to-county
   crosswalks exist but coverage gaps mean a clean county series is not
   automatic.
4. **Michigan coverage:** partial. Most non-tribal agencies submit complete
   12 months; some submit partial or none.
5. **Latest vintage:** Most recent calendar-year annual report.
6. **Update cadence:** annual (Crime in Michigan dashboard).
7. **Access method:** unverified, manual check needed. No documented public
   API found in research; the Crime in Michigan dashboard and annual PDFs
   are the principal release surfaces.
8. **Proposed provenance tier:** VERIFIED. Primary state record.
9. **Relation to existing 41:** net-new.
10. **Effort:** L. Lack of documented API plus agency-to-county mapping plus
    NIBRS-versus-MICR coding differences makes this a heavyweight
    integration.
11. **Disposition:** HOLD. High civic value but access channel is unclear.
    Consider whether the FBI Crime Data Explorer (NIBRS) gives an
    easier-to-ingest federal alternative; see "Agent-proposed additions."
12. **Source URL(s):**
    - https://www.michigan.gov/msp/divisions/cjic/micr
    - https://www.michigan.gov/msp/divisions/cjic/micr/annual-reports
    - https://www.michigan.gov/msp/-/media/Project/Websites/msp/micr-assets/2022/MICR-Annual-Report-2022.pdf

#### MI School Data / MDE

1. **Source and publisher:** Michigan Department of Education; Michigan
   Center for Educational Performance and Information (MI School Data
   portal).
2. **Michigan-relevant measures:** District- and school-level enrollment,
   graduation, attendance, assessment, and demographic data.
3. **Native geography:** `point` (school) and district.
4. **Michigan coverage:** confirmed.
5. **Latest vintage:** Annual (school-year).
6. **Update cadence:** annual.
7. **Access method:** bulk CSV via mischooldata.org; some Socrata-pattern
   exports.
8. **Proposed provenance tier:** VERIFIED.
9. **Relation to existing 41:** duplicates `Michigan Dept of Education`.
10. **Effort:** S (would be).
11. **Disposition:** NO-GO. Already counted at the org level.
12. **Source URL(s):**
    - https://www.mischooldata.org/

#### Detroit Open Data Portal (sample municipal portal)

1. **Source and publisher:** City of Detroit, hosted on a Socrata Foundation
   donated portal; assessed here as a class of Michigan municipal
   open-data portals.
2. **Michigan-relevant measures:** Parcels, property sales, blight
   violations, 911 calls, building permits, blight-bond payments, police
   incidents, fire incidents, SeeClickFix / Improve Detroit reports, DDOT
   transit, and similar municipal operational datasets, all within the City
   of Detroit boundary.
3. **Native geography:** `point` (most rows) and `tract` (some
   neighborhood aggregations) within the city of Detroit only.
4. **Michigan coverage:** partial. Coverage is City-of-Detroit only; not a
   statewide source. Sister portals exist for Grand Rapids, Ann Arbor, and a
   few others, but they are each separate publishers with their own
   schemas.
5. **Latest vintage:** Rolling; many feeds are daily.
6. **Update cadence:** daily to monthly per dataset.
7. **Access method:** open REST (no key) via Socrata Open Data API; also
   bulk CSV; ArcGIS Hub.
8. **Proposed provenance tier:** VERIFIED.
9. **Relation to existing 41:** net-new (as a class of municipal portals).
10. **Effort:** M. Each municipal portal is a separate publisher with its
    own schema; supporting "municipal portals" as a class is an
    architectural decision, not a single drop-in source.
11. **Disposition:** HOLD. The architectural question (do we integrate any
    city portals, or stay statewide / federal only?) should be answered by
    the owner before scoping individual city portals. If answered "yes,"
    Detroit, Grand Rapids, and Data Driven Detroit's D3 portal would be the
    first three.
12. **Source URL(s):**
    - https://data.detroitmi.gov/
    - https://data.detroitmi.gov/pages/developers
    - https://portal.datadrivendetroit.org/ (D3 regional portal for
      Southeast Michigan)

### Satellite and gridded

#### NASA TEMPO (Tropospheric Emissions: Monitoring of Pollution)

1. **Source and publisher:** NASA Langley Research Center; Atmospheric Science
   Data Center (ASDC). TEMPO is a NASA Earth Venture Instrument hosted on the
   Intelsat 40e geostationary satellite.
2. **Michigan-relevant measures:** Hourly daytime tropospheric and stratospheric
   nitrogen dioxide (NO2) columns; total formaldehyde column; total ozone
   column; boundary-layer ozone profile (coarser). North America coverage
   includes all of Michigan including the Upper Peninsula.
3. **Native geography:** Gridded. Level 2 native resolution is 2.0 km x 4.75 km
   per pixel; Level 3 is resampled to a 0.02° x 0.02° regular lat-long grid
   (roughly 2 km). Closest enum value once aggregated is `tract` or
   `modeled_to_zip`; native pixel grid does not map cleanly to the enum and is
   recorded as `unverified` until an aggregation rule is chosen.
4. **Michigan coverage:** confirmed. North America footprint covers Michigan
   continuously during daylight hours.
5. **Latest vintage:** V04 standard products are being released as
   reprocessing completes (covering Aug 2023 onward); V03 remains the legacy
   provisional version. Near real-time (NRT) products launched Sep 2025 and
   deliver within ~180 minutes of observation, retained for the past 14 days.
6. **Update cadence:** Near real-time (hourly during daylight) for NRT;
   standard products on a rolling reprocessing schedule.
7. **Access method:** NASA Earthdata Login (free registration), data delivered
   as netCDF Level 2 / Level 3 granules via NASA ASDC and Earthdata Search.
   ArcGIS Image Services also expose NO2, HCHO, and total-O3 as time-aware
   raster services. No paid key.
8. **Proposed provenance tier:** MODELED. Satellite retrievals are
   algorithm-derived column estimates, not direct ground measurement; values
   carry per-pixel quality flags and retrieval uncertainties that must be
   surfaced if rendered.
9. **Relation to existing 41:** net-new. The platform already integrates
   AirNow (ground monitor PM2.5/ozone) and EPA TRI (facility releases) but
   has no satellite-derived air pollution layer.
10. **Effort:** L. Requires a netCDF or Image Service ingestion pipeline,
    pixel-to-tract or pixel-to-ZIP spatial aggregation (area-weighted mean
    with quality-flag masking), and a refresh cadence that handles
    reprocessing flips from V03 to V04. Outside the current
    `refresh-*.mjs` pattern.
11. **Disposition:** HOLD. High civic value (Michigan-wide hourly air quality
    grid, including rural areas with no ground monitors), but L effort and the
    MODELED tier require an explicit owner decision on render strategy
    (tract-aggregated 7-day mean? hourly tile layer? ZIP rollup?) before
    integration is scoped.
12. **Source URL(s):**
    - https://www.earthdata.nasa.gov/data/instruments/tempo (Earthdata
      instrument page)
    - https://www.earthdata.nasa.gov/data/instruments/tempo/near-real-time-data
      (NRT data access)
    - https://www.earthdata.nasa.gov/news/tempo-data-available-arcgis-image-services
      (ArcGIS Image Services release)
    - https://tempo.si.edu/data_for_scientists.html (Smithsonian / Harvard
      science team data page)
    - https://www.earthdata.nasa.gov/data/catalog/larc-cloud-tempo-no2-l2-v04
      (NO2 V04 catalog entry)

#### NASA SEDAC GPW (Gridded Population of the World)

1. **Source and publisher:** NASA Socioeconomic Data and Applications Center
   (SEDAC), operated by CIESIN / Columbia University; now distributed via
   Earthdata Search.
2. **Michigan-relevant measures:** Gridded population counts and densities
   modeled to a continuous global raster; constituent inputs are national
   census tables and corresponding boundary files.
3. **Native geography:** Gridded at 30 arc-second resolution (about 1 km at
   the equator). Records as `unverified` until an aggregation rule is
   chosen.
4. **Michigan coverage:** confirmed (global product).
5. **Latest vintage:** GPWv4 Revision 11 (years 2000, 2005, 2010, 2015,
   2020).
6. **Update cadence:** irregular (decadal-style revisions tied to census
   cycles).
7. **Access method:** NASA Earthdata Login (free) via Earthdata Search.
8. **Proposed provenance tier:** MODELED. SEDAC GPW is a raster model of
   population distribution, not a direct count.
9. **Relation to existing 41:** net-new.
10. **Effort:** L. Raster pipeline plus aggregation to tract / ZIP / county.
11. **Disposition:** HOLD. Michigan population is already well served by
    the existing `Census ACS API` entry at tract resolution; GPW does not
    add meaningful Michigan-specific civic value over ACS. Reopen only if a
    cross-state or cross-border use case appears.
12. **Source URL(s):**
    - https://www.earthdata.nasa.gov/eosdis/daacs/sedac
    - https://www.earthdata.nasa.gov/data/projects/gpw

#### NASA POWER (Prediction of Worldwide Energy Resources)

1. **Source and publisher:** NASA Langley Research Center; POWER project.
2. **Michigan-relevant measures:** Daily, monthly, hourly, and climatology
   solar irradiance and meteorological parameters (temperature, humidity,
   wind, precipitation) for any lat/long in Michigan.
3. **Native geography:** Gridded: 0.5° x 0.625° for meteorology, 1° x 1°
   for solar. Records as `unverified`; the grid is too coarse to map
   cleanly to county or ZIP without acknowledged aggregation error.
4. **Michigan coverage:** confirmed (global product).
5. **Latest vintage:** Continuously updated.
6. **Update cadence:** daily (varies by parameter).
7. **Access method:** open REST (no key) at `power.larc.nasa.gov`;
   single-point and bounding-box queries; also AWS Registry of Open Data
   mirror.
8. **Proposed provenance tier:** MODELED. POWER is a reanalysis-style model
   product, not a station measurement.
9. **Relation to existing 41:** net-new.
10. **Effort:** M to L. Single-point queries are S, but tract / ZIP / county
    aggregation given the coarse grid is M; deriving solar-potential or
    energy-burden modeled inputs is L.
11. **Disposition:** GO. Useful as a modeled energy / heat / cold input
    layer to support the existing energy-burden dashboard; integration
    should be scoped narrowly to specific dashboard needs rather than
    integrating the full parameter library.
12. **Source URL(s):**
    - https://power.larc.nasa.gov/
    - https://power.larc.nasa.gov/docs/tutorials/service-data-request/api/
    - https://power.larc.nasa.gov/docs/services/api/temporal/daily/

#### NASA MODIS Land Surface Temperature (urban heat)

1. **Source and publisher:** NASA; MODIS instrument on Terra and Aqua; Land
   Processes DAAC (LP DAAC).
2. **Michigan-relevant measures:** Per-pixel Land Surface Temperature and
   Emissivity, daily and 8-day composites, at 1 km spatial resolution. Used
   for urban heat island measurement.
3. **Native geography:** Gridded at 1 km. Records as `unverified` until an
   aggregation rule is chosen.
4. **Michigan coverage:** confirmed (global product, MOD11A1 / MOD11A2 cover
   Michigan).
5. **Latest vintage:** MOD11A1 v6.1 / MOD11A2 v6.1 (v6 decommissioned
   2023-07).
6. **Update cadence:** daily (raw); 8-day composites.
7. **Access method:** NASA Earthdata Login (free); LP DAAC AppEEARS tool
   for area-of-interest extraction.
8. **Proposed provenance tier:** MODELED. Satellite-derived LST is an
   algorithm retrieval, not direct thermometer measurement.
9. **Relation to existing 41:** net-new.
10. **Effort:** L. Raster pipeline plus tract / ZIP aggregation plus an
    explicit choice of summer-mean LST, urban-heat-island anomaly relative
    to surrounding rural, or another derived metric.
11. **Disposition:** GO. Direct civic value for an urban-heat-vulnerability
    surface, particularly for Detroit, Flint, Grand Rapids, and other
    Michigan urban centers where existing AirNow stations are sparse.
12. **Source URL(s):**
    - https://www.earthdata.nasa.gov/topics/land-surface/land-surface-temperature
    - https://modis.gsfc.nasa.gov/data/dataprod/mod11.php
    - https://www.earthdata.nasa.gov/data/catalog/lpcloud-mod11a1-006
    - https://www.earthdata.nasa.gov/data/catalog/lpcloud-mod11a2-006
    - https://www.earthdata.nasa.gov/learn/trainings/satellite-remote-sensing-measuring-urban-heat-islands-constructing-heat

---

## Agent-proposed additions

_Sources discovered during research that were not in the seed list. Flagged
for owner review before being promoted into the main candidate sections.
These are not in the summary table above; the owner should decide whether
to elevate them and re-run vetting._

### A1. FBI Crime Data Explorer (CDE) - NIBRS

- Surfaced while researching Michigan State Police MICR. The FBI CDE is the
  federal NIBRS rollup; Michigan agencies that submit MICR also surface
  through CDE.
- Potentially a more accessible federal alternative to MICR for incident-
  level crime data, with a documented data download and CSV exports.
- Trade-off: CDE uses NIBRS, which collects fewer Group B offenses than MICR
  and collapses categories that MICR splits (e.g., carjacking under
  robbery). Quality and completeness of CDE's MI coverage depend on the
  same agency participation as MICR.
- URL: https://cde.ucr.cjis.gov/

### A2. HUD USPS ZIP Code Crosswalk Files

- Surfaced while researching HUD Picture of Subsidized Households. Not a
  rendered data source in itself, but a quarterly-updated utility for
  mapping ZIP codes to tracts, counties, CBSAs, and Congressional
  Districts.
- Useful as an internal join layer if more ZIP-keyed sources are added; the
  existing platform already does ZIP rollups, so the value is
  infrastructure, not a rendered metric.
- URL: https://www.huduser.gov/portal/datasets/usps_crosswalk.html

### A3. Delphi Epidata API (CMU)

- Surfaced while researching CDC FluView / NREVSS. The CMU Delphi group
  maintains a programmatic mirror of FluView, ILINet, and several other
  surveillance series. Useful as a secondary access route to CDC FluView
  rather than a separate publisher; provenance still flows back to CDC.
- URL: https://cmu-delphi.github.io/delphi-epidata/api/fluview.html

---

## Methodology notes

- Research conducted against each source's official documentation via web
  fetches from publisher domains (bls.gov, hud.gov, egle.michigan.gov, etc.).
- Geographic resolution is taken from the source's own data-dictionary or
  documentation. When the source publishes at multiple resolutions, the finest
  Michigan-relevant level is recorded.
- The existing 41 sources are read-only inputs; this PR does not edit
  `src/data/sourcesRegistry.ts` or any other tracked source file.
- No API keys appear in this document. Where a key is required, the entry
  references "free key from `<documentation URL>`" only.
