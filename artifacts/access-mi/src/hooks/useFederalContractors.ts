// Federal contractor data for Michigan
// Sources: USASpending.gov (live, no key) + SAM.gov Entity API (free key)

import { useQuery } from "@tanstack/react-query";

export interface FederalContractor {
  uei: string;
  name: string;
  city: string;
  county: string;
  state: string;
  naicsCode: string;
  naicsDescription: string;
  totalAwardsFY2024: number;
  awardCount: number;
  topAgency: string;
  businessType: string;
  source: string;
}

export async function fetchTopMichiganContractors(
  county?: string,
  limit: number = 20
): Promise<FederalContractor[]> {
  try {
    const body: Record<string, unknown> = {
      filters: {
        time_period: [{ start_date: "2023-10-01", end_date: "2024-09-30" }],
        place_of_performance_locations: [
          { country: "USA", state: "MI", ...(county ? { county: county.toUpperCase() } : {}) },
        ],
        award_type_codes: ["A", "B", "C", "D"],
      },
      fields: [
        "recipient_name", "recipient_unique_id",
        "recipient_location_city_name", "recipient_location_county_name",
        "naics_code", "naics_description", "awarding_agency_name",
        "total_obligated_amount",
      ],
      sort: "total_obligated_amount",
      order: "desc",
      limit,
      page: 1,
    };

    const res = await fetch(
      "https://api.usaspending.gov/api/v2/search/spending_by_award/",
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
    );
    if (!res.ok) return [];
    const data = await res.json();

    return (data.results || []).map((r: Record<string, unknown>) => ({
      uei: (r.recipient_unique_id as string) || "",
      name: (r.recipient_name as string) || "",
      city: (r.recipient_location_city_name as string) || "",
      county: (r.recipient_location_county_name as string) || county || "",
      state: "MI",
      naicsCode: (r.naics_code as string) || "",
      naicsDescription: (r.naics_description as string) || "",
      totalAwardsFY2024: (r.total_obligated_amount as number) || 0,
      awardCount: 1,
      topAgency: (r.awarding_agency_name as string) || "",
      businessType: "Federal Contractor",
      source: "USASpending.gov FY2024",
    }));
  } catch {
    return [];
  }
}

export function useMichiganContractors(county?: string) {
  return useQuery({
    queryKey: ["mi-contractors", county],
    queryFn: () => fetchTopMichiganContractors(county),
    staleTime: 1000 * 60 * 60 * 6,
    retry: 1,
  });
}
