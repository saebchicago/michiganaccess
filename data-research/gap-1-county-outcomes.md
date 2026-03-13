# Gap 1: County Readmission & ED Rates
**Data Completeness:** 75% MVP-ready
## Sources
### CMS Medicare Disparities: https://data.cms.gov/tools/mapping-medicare-disparities-by-population
- Year: 2018-2019 (⚠️ Pre-2023)
- Counties: All 83 Michigan
- Access: Free
- Metrics: Readmits, ED visits, preventable hosp
### County Health Rankings: https://www.countyhealthrankings.org
- Year: 2022 (✅ Current)
- Counties: All 83 Michigan
- Access: Free
- Metrics: Preventable hosp (4,357 per 100k state avg)
### CDC SVI: https://svi.cdc.gov/dataDownloads
- Year: 2022 (✅ Current)
- Counties: All 83 Michigan
- Access: Free
- Includes: CSV + GeoJSON polygons
### Michigan DHHS ACS: https://www.mdch.state.mi.us/OSR/CHI/HOSP/PHT6TT.ASP
- Year: Through 2022
- Access: Free
- Data: Trend back to 2006
## MVP Ready
Bivariate map: SVI vs preventable hosp (all 83 counties, free data)
## Phase 2 Needed
- All-payer ED data (HCUP SEDD, 4-8 weeks, $500-2k)
- Recent readmit data (CMS releases 18-24 mo behind)
- Transportation barriers (Michigan DOT, FOIA)
