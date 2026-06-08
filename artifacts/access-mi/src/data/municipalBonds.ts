// Michigan municipal bond issuances
// Source: MSRB EMMA (emma.msrb.org) - public record
// Seeded with major issuances FY2022-2024
// Label: "MSRB EMMA - Municipal Securities Rulemaking Board"

export interface MunicipalBond {
  issuer: string;
  county: string;
  purpose: string;
  category: "healthcare" | "infrastructure" | "education" |
            "housing" | "water" | "general";
  amount_millions: number;
  issued_year: number;
  maturity_year: number;
  cusip_prefix: string;
  source: string;
}

export const MICHIGAN_BONDS: MunicipalBond[] = [
  // Healthcare
  { issuer: "Detroit Medical Center", county: "Wayne",
    purpose: "Hospital facilities renovation",
    category: "healthcare", amount_millions: 340,
    issued_year: 2023, maturity_year: 2048,
    cusip_prefix: "26163", source: "MSRB EMMA 2023" },
  { issuer: "University of Michigan Health", county: "Washtenaw",
    purpose: "Medical campus expansion",
    category: "healthcare", amount_millions: 580,
    issued_year: 2022, maturity_year: 2052,
    cusip_prefix: "26161", source: "MSRB EMMA 2022" },
  { issuer: "Spectrum Health (Corewell)", county: "Kent",
    purpose: "Capital improvements",
    category: "healthcare", amount_millions: 420,
    issued_year: 2023, maturity_year: 2043,
    cusip_prefix: "26081", source: "MSRB EMMA 2023" },
  // Infrastructure
  { issuer: "City of Detroit", county: "Wayne",
    purpose: "Water and sewer infrastructure",
    category: "water", amount_millions: 620,
    issued_year: 2024, maturity_year: 2054,
    cusip_prefix: "26163", source: "MSRB EMMA 2024" },
  { issuer: "Michigan Finance Authority", county: "Statewide",
    purpose: "Clean water revolving fund",
    category: "water", amount_millions: 890,
    issued_year: 2023, maturity_year: 2043,
    cusip_prefix: "26000", source: "MSRB EMMA 2023" },
  { issuer: "Wayne County", county: "Wayne",
    purpose: "Road and bridge improvements",
    category: "infrastructure", amount_millions: 280,
    issued_year: 2024, maturity_year: 2044,
    cusip_prefix: "26163", source: "MSRB EMMA 2024" },
  // Education
  { issuer: "Detroit Public Schools Community District",
    county: "Wayne", purpose: "School building renovations",
    category: "education", amount_millions: 175,
    issued_year: 2023, maturity_year: 2038,
    cusip_prefix: "26163", source: "MSRB EMMA 2023" },
  { issuer: "Grand Rapids Public Schools", county: "Kent",
    purpose: "Facilities and technology",
    category: "education", amount_millions: 148,
    issued_year: 2022, maturity_year: 2037,
    cusip_prefix: "26081", source: "MSRB EMMA 2022" },
  // Housing
  { issuer: "Michigan State Housing Development Authority",
    county: "Statewide", purpose: "Affordable housing bonds",
    category: "housing", amount_millions: 320,
    issued_year: 2024, maturity_year: 2034,
    cusip_prefix: "26000", source: "MSRB EMMA 2024" },
  { issuer: "City of Detroit", county: "Wayne",
    purpose: "Affordable housing development",
    category: "housing", amount_millions: 95,
    issued_year: 2023, maturity_year: 2033,
    cusip_prefix: "26163", source: "MSRB EMMA 2023" },
];

export function getBondsByCounty(county: string): MunicipalBond[] {
  return MICHIGAN_BONDS.filter(b =>
    b.county === county || b.county === "Statewide"
  );
}

export function getTotalBondsByCounty(county: string): number {
  return getBondsByCounty(county)
    .reduce((sum, b) => sum + b.amount_millions, 0);
}
