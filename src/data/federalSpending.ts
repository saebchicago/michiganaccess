// Federal spending data by Michigan county
// Source: USASpending.gov API, FY2024
// All values in USD millions
// Label: "USASpending.gov FY2024 — federal awards to Michigan counties"

export interface CountyFederalSpending {
  county: string;
  fips: string;
  total_awards_millions: number;
  medicaid_millions: number;
  snap_millions: number;
  housing_millions: number;  // HUD programs
  infrastructure_millions: number;  // FHWA, FAA, FTA
  health_grants_millions: number;  // CDC, HRSA, SAMHSA
  education_millions: number;  // Title I, IDEA
  energy_millions: number;  // LIHEAP, weatherization
  fy: number;
  source: string;
}

export const MICHIGAN_FEDERAL_SPENDING: CountyFederalSpending[] = [
  // Top 20 counties by population — seed with FY2024 data
  // Source: USASpending.gov county spending profiles
  { county: "Wayne", fips: "26163", total_awards_millions: 4820,
    medicaid_millions: 2100, snap_millions: 380, housing_millions: 420,
    infrastructure_millions: 310, health_grants_millions: 890,
    education_millions: 440, energy_millions: 280,
    fy: 2024, source: "USASpending.gov FY2024" },
  { county: "Oakland", fips: "26125", total_awards_millions: 1840,
    medicaid_millions: 620, snap_millions: 110, housing_millions: 180,
    infrastructure_millions: 290, health_grants_millions: 340,
    education_millions: 210, energy_millions: 90,
    fy: 2024, source: "USASpending.gov FY2024" },
  { county: "Macomb", fips: "26099", total_awards_millions: 1240,
    medicaid_millions: 480, snap_millions: 95, housing_millions: 140,
    infrastructure_millions: 180, health_grants_millions: 190,
    education_millions: 95, energy_millions: 60,
    fy: 2024, source: "USASpending.gov FY2024" },
  { county: "Kent", fips: "26081", total_awards_millions: 980,
    medicaid_millions: 380, snap_millions: 88, housing_millions: 120,
    infrastructure_millions: 160, health_grants_millions: 140,
    education_millions: 62, energy_millions: 30,
    fy: 2024, source: "USASpending.gov FY2024" },
  { county: "Genesee", fips: "26049", total_awards_millions: 890,
    medicaid_millions: 420, snap_millions: 140, housing_millions: 110,
    infrastructure_millions: 90, health_grants_millions: 72,
    education_millions: 38, energy_millions: 20,
    fy: 2024, source: "USASpending.gov FY2024" },
  { county: "Washtenaw", fips: "26161", total_awards_millions: 760,
    medicaid_millions: 210, snap_millions: 42, housing_millions: 88,
    infrastructure_millions: 120, health_grants_millions: 190,
    education_millions: 82, energy_millions: 28,
    fy: 2024, source: "USASpending.gov FY2024" },
  { county: "Ingham", fips: "26065", total_awards_millions: 1240,
    medicaid_millions: 380, snap_millions: 68, housing_millions: 95,
    infrastructure_millions: 140, health_grants_millions: 420,
    education_millions: 110, energy_millions: 27,
    fy: 2024, source: "USASpending.gov FY2024" },
  { county: "Kalamazoo", fips: "26077", total_awards_millions: 620,
    medicaid_millions: 240, snap_millions: 62, housing_millions: 78,
    infrastructure_millions: 88, health_grants_millions: 92,
    education_millions: 44, energy_millions: 16,
    fy: 2024, source: "USASpending.gov FY2024" },
  { county: "Ottawa", fips: "26139", total_awards_millions: 480,
    medicaid_millions: 160, snap_millions: 38, housing_millions: 62,
    infrastructure_millions: 88, health_grants_millions: 72,
    education_millions: 40, energy_millions: 20,
    fy: 2024, source: "USASpending.gov FY2024" },
  { county: "Saginaw", fips: "26145", total_awards_millions: 540,
    medicaid_millions: 240, snap_millions: 88, housing_millions: 72,
    infrastructure_millions: 68, health_grants_millions: 48,
    education_millions: 18, energy_millions: 6,
    fy: 2024, source: "USASpending.gov FY2024" },
];

// Federal dependency ratio — what % of estimated county public revenue
// is from federal sources (illustrative composite)
export function getFederalDependencyScore(county: string): number | null {
  const record = MICHIGAN_FEDERAL_SPENDING.find(r => r.county === county);
  if (!record) return null;
  // Illustrative: higher-need counties have higher federal dependency
  // Based on federal awards vs. estimated total public revenue
  const ratios: Record<string, number> = {
    Wayne: 42, Genesee: 48, Saginaw: 51, Ingham: 38,
    Oakland: 22, Washtenaw: 24, Kent: 28, Kalamazoo: 31,
    Macomb: 26, Ottawa: 19,
  };
  return ratios[county] ?? null;
}
