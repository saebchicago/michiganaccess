export interface DataStory {
  id: string;
  title: string;
  hook: string;
  narrative: string;
  stat: { value: number; label: string; suffix: string };
  source: string;
  sourceUrl?: string;
  href: string;
  color: string;
  /** Counties this story names directly (by county name, e.g. "Wayne").
   *  Omitted = statewide story. Used for county-page cross-links. */
  counties?: string[];
}

export const DATA_STORIES: DataStory[] = [
  {
    id: "alice-gap",
    title: "40% of Michigan households faced financial hardship",
    hook: "The figure includes households in poverty and those above poverty who cannot afford basic expenses.",
    narrative:
      "40% of Michigan households fell below the ALICE Threshold in 2024, including households in poverty and households above poverty that could not afford basic expenses.",
    stat: {
      value: 40,
      label: "of households below ALICE Threshold",
      suffix: "%",
    },
    source: "United For ALICE 2026 Report (2024 data)",
    sourceUrl: "https://www.unitedforalice.org/michigan",
    href: "/equity",
    color: "hsl(var(--coral-deep))",
  },
  {
    id: "pfas-water",
    title: "PFAS in Michigan's Water",
    hook: "350 sites identified. State limits since 2020.",
    narrative:
      "Michigan had identified 350 PFAS sites as of July 2026. The state set drinking water limits in August 2020, including 8 ppt for PFOA and 16 ppt for PFOS.",
    stat: { value: 350, label: "PFAS sites identified, July 2026", suffix: "" },
    source: "EGLE / MPART, Aug 2026",
    sourceUrl: "https://www.michigan.gov/egle/newsroom/mi-environment/2026/08/12/pfas-contamination",
    href: "/environment#water-safety",
    color: "hsl(var(--warm-gold-deep))",
  },
  {
    id: "reentry-success",
    title: "Fewer People in Prison, Fewer Returning",
    hook: "Prison population at its lowest since 1991. Recidivism at a record low.",
    narrative:
      "Michigan's prison population fell from 51,554 in 2007 to 32,778, the lowest since 1991. Three-year recidivism reached 21.0%, the lowest rate on state record.",
    stat: { value: 21, label: "three-year recidivism rate", suffix: "%" },
    source: "Michigan Department of Corrections, July 2, 2025",
    sourceUrl: "https://www.michigan.gov/corrections/about/newsroom/press-releases/2025/07/02/michigan-department-of-corrections-reports-new-historic-low",
    href: "/reentry",
    color: "hsl(var(--forest-green-deep))",
  },
  {
    id: "dental-desert",
    title: "Dental Shortage Areas",
    hook: "76 of 83 counties contain a designated dental shortage area.",
    narrative:
      "76 of Michigan's 83 counties contain at least one HRSA-designated dental Health Professional Shortage Area. A designation can cover a whole county, part of one, a population group or a single facility, so this is not a count of counties without dentists.",
    stat: { value: 76, label: "of 83 counties with a dental HPSA", suffix: "" },
    source: "HRSA HPSA Dental Health detail file (dated 11/02/2026), county rollup by AccessMI (MODELED)",
    sourceUrl: "https://data.hrsa.gov/data/download?data=SHORT",
    href: "/equity",
    color: "hsl(var(--teal-deep))",
  },
  {
    id: "prek-for-all-coverage",
    title: "Record PreK Enrollment",
    hook: "Nearly 55,000 children are enrolled in Michigan's free PreK.",
    narrative:
      "Michigan's Great Start Readiness Program enrolled nearly 55,000 children as of January 2026, a record, according to the state.",
    stat: { value: 55000, label: "children enrolled in GSRP, January 2026 (nearly)", suffix: "" },
    source: "Governor's office and MiLEAP, Mar 25, 2026",
    sourceUrl: "https://www.michigan.gov/whitmer/news/press-releases/2026/03/25/whitmer-and-mileap-announce-record-enrollment-in-prek-for-all",
    href: "/early-childhood",
    color: "hsl(var(--michigan-blue))",
  },
  {
    id: "vocational-village-outcomes",
    title: "Trade Skills Before Release",
    hook: "Graduates of Michigan's prison trade-skills program return to prison at about half the statewide rate.",
    narrative:
      "Michigan's Vocational Village program trains incarcerated residents in skilled trades before release. MDOC reports a recidivism rate of roughly 12% for graduates, compared with approximately 22% statewide.",
    stat: { value: 12, label: "recidivism for graduates (roughly), vs about 22% statewide", suffix: "%" },
    source: "Michigan Department of Corrections, June 2, 2026",
    sourceUrl: "https://www.michigan.gov/corrections/about/newsroom/press-releases/2026/06/02/mdoc-earns-national-recognition-for-innovative-vocational-village-programming",
    href: "/reentry",
    color: "hsl(var(--coral-deep))",
  },
];
