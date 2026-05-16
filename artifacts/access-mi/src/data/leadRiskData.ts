// Lead paint risk data
// Source 1: HUD ELHD (Environmental and Location Likelihood of lead hazards)
// Source 2: Michigan MDHHS Blood Lead Surveillance

export interface LeadRiskData {
  county: string;
  fips: string;
  elhd_score: number;
  pre1940HousingPct: number;
  pre1980HousingPct: number;
  childrenTested: number;
  elevatedBloodLeadPct: number;
  year: number;
  notes?: string;
  source: string;
}

export const MICHIGAN_LEAD_RISK: LeadRiskData[] = [
  { county: "Wayne", fips: "26163", elhd_score: 8.4, pre1940HousingPct: 42.1, pre1980HousingPct: 78.4, childrenTested: 28400, elevatedBloodLeadPct: 6.8, year: 2023, notes: "Detroit has highest housing stock age in Michigan", source: "HUD ELHD + Michigan MDHHS Blood Lead 2023" },
  { county: "Genesee", fips: "26049", elhd_score: 9.1, pre1940HousingPct: 38.4, pre1980HousingPct: 74.2, childrenTested: 8200, elevatedBloodLeadPct: 9.4, year: 2023, notes: "Flint water crisis legacy \u2014 ongoing elevated blood lead monitoring", source: "HUD ELHD + Michigan MDHHS Blood Lead 2023" },
  { county: "Saginaw", fips: "26145", elhd_score: 8.8, pre1940HousingPct: 36.2, pre1980HousingPct: 72.8, childrenTested: 4100, elevatedBloodLeadPct: 7.2, year: 2023, source: "HUD ELHD + Michigan MDHHS Blood Lead 2023" },
  { county: "Oakland", fips: "26125", elhd_score: 4.2, pre1940HousingPct: 12.4, pre1980HousingPct: 48.2, childrenTested: 14200, elevatedBloodLeadPct: 2.1, year: 2023, source: "HUD ELHD + Michigan MDHHS Blood Lead 2023" },
  { county: "Kent", fips: "26081", elhd_score: 5.8, pre1940HousingPct: 18.6, pre1980HousingPct: 56.4, childrenTested: 8900, elevatedBloodLeadPct: 3.4, year: 2023, source: "HUD ELHD + Michigan MDHHS Blood Lead 2023" },
  { county: "Washtenaw", fips: "26161", elhd_score: 3.8, pre1940HousingPct: 14.2, pre1980HousingPct: 42.8, childrenTested: 6200, elevatedBloodLeadPct: 1.8, year: 2023, source: "HUD ELHD + Michigan MDHHS Blood Lead 2023" },
  { county: "Ingham", fips: "26065", elhd_score: 5.4, pre1940HousingPct: 22.8, pre1980HousingPct: 58.4, childrenTested: 5100, elevatedBloodLeadPct: 3.2, year: 2023, source: "HUD ELHD + Michigan MDHHS Blood Lead 2023" },
];

export function getLeadRiskByCounty(county: string): LeadRiskData | null {
  return MICHIGAN_LEAD_RISK.find(l => l.county === county) ?? null;
}
