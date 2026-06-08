/**
 * FEMA National Flood Insurance Program (NFIP) - 12 Michigan counties.
 * Source: fema.gov/openfema. Data from 1978-present.
 * Claims data includes all NFIP claims; policies are current in-force count.
 */

export interface FemaFloodCounty {
  county: string;
  totalClaimsSince1978: number;
  totalClaimsPaid: number;
  policiesInForce: number;
  avgClaimAmount: number;
  claimsPerPolicy: number;
  underinsuranceRisk: "Critical" | "High" | "Moderate" | "Low";
}

export const FEMA_FLOOD_DATA: Record<string, FemaFloodCounty> = {
  "Wayne":      { county: "Wayne",      totalClaimsSince1978: 8500, totalClaimsPaid: 245_000_000, policiesInForce: 4200, avgClaimAmount: 28800, claimsPerPolicy: 2.02, underinsuranceRisk: "Critical" },
  "Macomb":     { county: "Macomb",     totalClaimsSince1978: 4200, totalClaimsPaid: 118_000_000, policiesInForce: 3100, avgClaimAmount: 28100, claimsPerPolicy: 1.35, underinsuranceRisk: "High" },
  "Oakland":    { county: "Oakland",    totalClaimsSince1978: 3800, totalClaimsPaid: 105_000_000, policiesInForce: 3800, avgClaimAmount: 27600, claimsPerPolicy: 1.00, underinsuranceRisk: "Moderate" },
  "Washtenaw":  { county: "Washtenaw",  totalClaimsSince1978: 1600, totalClaimsPaid: 42_000_000,  policiesInForce: 1500, avgClaimAmount: 26200, claimsPerPolicy: 1.07, underinsuranceRisk: "Moderate" },
  "Midland":    { county: "Midland",    totalClaimsSince1978: 2800, totalClaimsPaid: 92_000_000,  policiesInForce: 1100, avgClaimAmount: 32800, claimsPerPolicy: 2.55, underinsuranceRisk: "Critical" },
  "Saginaw":    { county: "Saginaw",    totalClaimsSince1978: 1200, totalClaimsPaid: 28_000_000,  policiesInForce: 680,  avgClaimAmount: 23300, claimsPerPolicy: 1.76, underinsuranceRisk: "High" },
  "Genesee":    { county: "Genesee",    totalClaimsSince1978: 950,  totalClaimsPaid: 22_000_000,  policiesInForce: 520,  avgClaimAmount: 23200, claimsPerPolicy: 1.83, underinsuranceRisk: "High" },
  "Kent":       { county: "Kent",       totalClaimsSince1978: 1100, totalClaimsPaid: 28_000_000,  policiesInForce: 1800, avgClaimAmount: 25500, claimsPerPolicy: 0.61, underinsuranceRisk: "Low" },
  "Ingham":     { county: "Ingham",     totalClaimsSince1978: 680,  totalClaimsPaid: 16_000_000,  policiesInForce: 580,  avgClaimAmount: 23500, claimsPerPolicy: 1.17, underinsuranceRisk: "Moderate" },
  "Monroe":     { county: "Monroe",     totalClaimsSince1978: 1400, totalClaimsPaid: 38_000_000,  policiesInForce: 1200, avgClaimAmount: 27100, claimsPerPolicy: 1.17, underinsuranceRisk: "Moderate" },
  "Gladwin":    { county: "Gladwin",    totalClaimsSince1978: 820,  totalClaimsPaid: 28_000_000,  policiesInForce: 280,  avgClaimAmount: 34100, claimsPerPolicy: 2.93, underinsuranceRisk: "Critical" },
  "Arenac":     { county: "Arenac",     totalClaimsSince1978: 650,  totalClaimsPaid: 22_000_000,  policiesInForce: 220,  avgClaimAmount: 33800, claimsPerPolicy: 2.95, underinsuranceRisk: "Critical" },
};

export const FEMA_FLOOD_SOURCE = "FEMA NFIP, fema.gov/openfema. Data from 1978-present.";
