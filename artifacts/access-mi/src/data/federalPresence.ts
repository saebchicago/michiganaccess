// Federal agency presence in Michigan
// Sources: OPM FedScope Employment Cube (public dataset),
// GSA Federal Building portfolio,
// SSA Field Office Location data (data.gov),
// FACA Database (facadatabase.gov) - Excel download
// USASpending.gov FY2024

export interface FederalAgencyPresence {
  agency: string;
  acronym: string;
  missionRelevance: string;
  michiganOffices: number;
  michiganEmployees: string;
  keyCounties: string[];
  publicContactUrl: string;
  advisoryCommittees?: string[];
}

export const MICHIGAN_FEDERAL_AGENCIES: FederalAgencyPresence[] = [
  {
    agency: "Social Security Administration",
    acronym: "SSA",
    missionRelevance: "Social Security, disability benefits, SSI",
    michiganOffices: 29,
    michiganEmployees: "2,000\u20132,500",
    keyCounties: ["Wayne", "Oakland", "Kent", "Genesee", "Ingham"],
    publicContactUrl: "https://www.ssa.gov/locator",
  },
  {
    agency: "Dept of Health & Human Services",
    acronym: "HHS / HRSA / CMS",
    missionRelevance: "Medicaid, Medicare, HRSA grants, FQHC funding, public health programs",
    michiganOffices: 8,
    michiganEmployees: "400\u2013600",
    keyCounties: ["Wayne", "Ingham"],
    publicContactUrl: "https://hhs.gov",
    advisoryCommittees: [
      "HHS Region 5 Rural Health Advisory Committee",
      "Preventive Services Task Force (public nominations)",
    ],
  },
  {
    agency: "Dept of Housing & Urban Development",
    acronym: "HUD",
    missionRelevance: "Section 8, CDBG, HOME grants, fair housing enforcement",
    michiganOffices: 3,
    michiganEmployees: "150\u2013250",
    keyCounties: ["Wayne", "Ingham", "Kent"],
    publicContactUrl: "https://hud.gov/michigan",
  },
  {
    agency: "Dept of Veterans Affairs",
    acronym: "VA",
    missionRelevance: "Veteran healthcare, benefits, housing",
    michiganOffices: 12,
    michiganEmployees: "3,500\u20134,500",
    keyCounties: ["Wayne", "Washtenaw", "Kent", "Ingham", "Saginaw"],
    publicContactUrl: "https://www.va.gov/find-locations",
  },
  {
    agency: "Environmental Protection Agency",
    acronym: "EPA Region 5",
    missionRelevance: "Environmental enforcement, Superfund cleanup, air/water quality",
    michiganOffices: 2,
    michiganEmployees: "200\u2013400 (region-wide, Chicago HQ)",
    keyCounties: ["Wayne", "Ingham"],
    publicContactUrl: "https://www.epa.gov/aboutepa/epa-region-5",
    advisoryCommittees: [
      "Clean Air Act Advisory Committee",
      "National Environmental Justice Advisory Council",
    ],
  },
  {
    agency: "Dept of Agriculture",
    acronym: "USDA",
    missionRelevance: "SNAP, rural development, food safety, farm service",
    michiganOffices: 83,
    michiganEmployees: "1,000\u20131,500",
    keyCounties: ["All 83 counties via FSA offices"],
    publicContactUrl: "https://www.nrcs.usda.gov/contact/find",
  },
  {
    agency: "Dept of Labor",
    acronym: "DOL",
    missionRelevance: "Workforce development, OSHA, unemployment, worker protections",
    michiganOffices: 5,
    michiganEmployees: "200\u2013350",
    keyCounties: ["Wayne", "Kent", "Ingham"],
    publicContactUrl: "https://www.dol.gov/agencies/whd/contact",
  },
];

export const MICHIGAN_RELEVANT_FACA = [
  {
    name: "Advisory Committee on Minority Health",
    agency: "HHS / OMH",
    relevance: "Advises on health disparities - directly relevant to Detroit, Flint, Saginaw",
    publicNominations: true,
    nominationUrl: "https://minorityhealth.hhs.gov/committees",
    michiganRepresentation: "Historically underrepresented",
  },
  {
    name: "National Advisory Council on Migrant Health",
    agency: "HRSA",
    relevance: "Migrant and seasonal farmworker health - relevant to West Michigan agricultural counties",
    publicNominations: true,
    nominationUrl: "https://bphc.hrsa.gov",
    michiganRepresentation: "1 current Michigan member",
  },
  {
    name: "Advisory Council on Alzheimer's Research",
    agency: "HHS / NIA",
    relevance: "National Alzheimer's plan - Michigan has high prevalence",
    publicNominations: true,
    nominationUrl: "https://aspe.hhs.gov/collaborations-committees",
    michiganRepresentation: "Typically 0\u20131 Michigan members",
  },
  {
    name: "EPA Science Advisory Board",
    agency: "EPA",
    relevance: "Reviews environmental science - critical for Great Lakes and Flint water recovery",
    publicNominations: true,
    nominationUrl: "https://www.epa.gov/sab",
    michiganRepresentation: "Occasionally represented",
  },
];
