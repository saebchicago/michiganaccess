// Source Manifest — verified data anchors for the platform
// Every numeric claim should trace to an entry here
// Used by QA scripts and data freshness tracker

export interface VerifiedClaim {
  value: string;
  context: string;
  source: string;
  url: string;
  verified: boolean;
  notes?: string;
}

export const SOURCE_MANIFEST: VerifiedClaim[] = [
  { value: "683,234", context: "FQHC patients served 2024", source: "HRSA UDS 2024", url: "https://data.hrsa.gov/tools/data-reporting/program-data/state/MI", verified: true },
  { value: "41%", context: "Michigan households below ALICE threshold", source: "United For ALICE 2023", url: "https://unitedforalice.org/michigan", verified: true },
  { value: "625,852", context: "Michigan 211 annual requests", source: "Michigan 211", url: "https://mi211.org", verified: true },
  { value: "35", context: "Critical Access Hospitals in Michigan", source: "Flex Monitoring Team", url: "https://flexmonitoring.org", verified: true },
  { value: "$183.3M", context: "LIHEAP allocation Michigan", source: "LIHEAP Clearinghouse", url: "https://liheapch.acf.hhs.gov", verified: true },
  { value: "$211M", context: "MiHER allocation (IRA/DOE energy rebates)", source: "EGLE", url: "https://michigan.gov/egle", verified: true, notes: "Michigan Home Energy Rebates — energy efficiency program, NOT Medicaid HRSN" },
  { value: "11,000+", context: "MiHER households served", source: "EGLE 2025 EOY Report", url: "https://michigan.gov/egle", verified: true },
  { value: "$96.6M", context: "Michigan Saves financed 2024", source: "Michigan Saves", url: "https://michigansaves.org", verified: true },
  { value: "328", context: "Confirmed PFAS contamination sites + 38 AOI", source: "MPART/EGLE", url: "https://michigan.gov/pfasresponse", verified: true },
  { value: "18", context: "Counties that are full maternity care deserts (21.7%)", source: "March of Dimes 2024", url: "https://marchofdimes.org/peristats", verified: true },
  { value: "6.3", context: "Infant mortality rate per 1,000 (2024)", source: "MDHHS Vital Stats", url: "https://vitalstats.michigan.gov", verified: true },
  { value: "13.5", context: "Black infant mortality per 1,000 (2019-2023)", source: "MDHHS Vital Stats", url: "https://vitalstats.michigan.gov", verified: true },
  { value: "79.3", context: "Maternal mortality ratio per 100K (2016-2020)", source: "MDHHS MMMS", url: "https://michigan.gov/mdhhs", verified: true },
  { value: "13", context: "At-risk rural hospitals (5 immediate risk)", source: "CHQPR Dec 2025", url: "https://ruralhospitals.chqpr.org", verified: true },
  { value: "July 6, 2023", context: "Sturgis REH conversion date", source: "Sturgis Hospital", url: "https://sturgishospital.com", verified: true },
  { value: "17+", context: "OB closures since 2008", source: "Bridge MI + MHA", url: "https://bridgemi.com", verified: true },
  { value: "1,544,250", context: "Food insecure Michigan residents", source: "Feeding America 2024", url: "https://feedingamerica.org", verified: true },
  { value: "$1.70", context: "SNAP economic multiplier per $1", source: "USDA ERS", url: "https://ers.usda.gov", verified: true },
  { value: "$5.51B", context: "Annual hunger cost Michigan", source: "Bread for the World", url: "https://bread.org", verified: true },
  { value: "~1,772,000", context: "Total MCO enrollment Mar 2025", source: "HMA", url: "https://healthmanagement.com", verified: true },
  { value: "115", context: "CHW programs surveyed across 93 orgs", source: "MiCHWA 2024", url: "https://michwa.org", verified: true },
  { value: "~98%", context: "Flint lead lines replaced (~11,000)", source: "City of Flint", url: "https://michigan.gov/flintwater", verified: true },
  { value: "12 months", context: "Postpartum Medicaid coverage since April 2023", source: "MDHHS", url: "https://michigan.gov/mdhhs", verified: true },
  { value: "~98%", context: "Rx Kids enrollment take-up rate", source: "Rx Kids", url: "https://rxkids.org", verified: true },
  { value: "~16%", context: "Trinity Health preventable hospitalization reduction", source: "Trinity Health/FindHelp case study 2025", url: "https://findhelp.org", verified: false, notes: "System-reported, not independently verified or peer-reviewed" },
  { value: "27.4%", context: "Trinity Health unmet social need screening rate", source: "Trinity Health FY2025", url: "https://trinity-health.org", verified: true },
];
