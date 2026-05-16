/** Michigan pharmacy access data.
 * Source: NCPDP 2024, FTC 2024 Report on PBMs, Clare County Cleaver analysis */

export const MI_PHARMACY_STATS = {
  totalPharmacies: 2247,
  independents: 1100,
  chains: 1147,
  chainDecline5yr: -7.4,
  independentGrowth5yr: 1.4,
};

export const PHARMACY_DESERT_RISK: Record<string, "high" | "moderate" | "low"> = {
  "Keweenaw": "high", "Ontonagon": "high", "Baraga": "high",
  "Luce": "high", "Schoolcraft": "high", "Oscoda": "high",
  "Montmorency": "high", "Alcona": "high", "Crawford": "high",
  "Missaukee": "high", "Lake": "high", "Arenac": "high",
  "Ogemaw": "high", "Iron": "high", "Gogebic": "high",
  "Roscommon": "moderate", "Gladwin": "moderate", "Clare": "moderate",
  "Osceola": "moderate", "Mecosta": "moderate", "Dickinson": "moderate",
  "Wayne": "low", "Oakland": "low", "Macomb": "low",
  "Kent": "low", "Washtenaw": "low", "Ingham": "low",
  "Genesee": "low", "Kalamazoo": "low", "Ottawa": "low",
};
