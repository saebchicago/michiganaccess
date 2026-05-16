// Live federal spending data from USASpending.gov
// No API key required — public DATA Act endpoint
// Docs: https://api.usaspending.gov/

import { useQuery } from "@tanstack/react-query";

const USASPENDING_BASE = "https://api.usaspending.gov/api/v2";

// Michigan state FIPS: 26
// County FIPS codes are 5-digit: 26XXX

export interface LiveFederalAward {
  county: string;
  fips: string;
  total_obligated: number;  // dollars
  award_count: number;
  top_agency: string;
  top_program: string;
  fy: number;
}

// Fetch total federal obligations for a Michigan county by FIPS
export async function fetchCountySpending(
  countyFips: string,
  fy: number = 2024
): Promise<LiveFederalAward | null> {
  try {
    const res = await fetch(
      `${USASPENDING_BASE}/search/spending_by_geography/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope: "place_of_performance",
          geo_layer: "county",
          geo_layer_filters: [countyFips],
          filters: {
            time_period: [{ start_date: `${fy - 1}-10-01`,
                            end_date: `${fy}-09-30` }],
            recipient_locations: [{ country: "USA", state: "MI" }],
          },
          subawards: false,
        }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const result = data.results?.[0];
    if (!result) return null;
    return {
      county: result.display_name,
      fips: countyFips,
      total_obligated: result.aggregated_amount ?? 0,
      award_count: result.award_count ?? 0,
      top_agency: "Federal Awards",
      top_program: "Multiple Programs",
      fy,
    };
  } catch {
    return null;
  }
}

// Hook for county-level spending
export function useCountyFederalSpending(
  countyFips: string | null,
  fy: number = 2024
) {
  return useQuery({
    queryKey: ["federal-spending", countyFips, fy],
    queryFn: () => countyFips
      ? fetchCountySpending(countyFips, fy)
      : null,
    enabled: !!countyFips,
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 1,
  });
}

// Fetch spending breakdown by assistance category for a county
export async function fetchCountySpendingByCategory(
  countyFips: string,
  fy: number = 2024
): Promise<Record<string, number>> {
  // CFDA prefix mapping to federal departments:
  // 93 = HHS (Health & Medicaid)
  // 14 = HUD (Housing)
  // 10.551/10.557/10.558 = USDA Food & Nutrition (SNAP)
  // 84 = Dept of Education
  // 20 = DOT (Infrastructure)
  // 81/66 = DOE/EPA (Energy & Environment)
  const categories: Record<string, string[]> = {
    "Health & Medicaid": ["93"],
    "Housing": ["14"],
    "Food & Nutrition": ["10.551", "10.557", "10.558"],
    "Education": ["84"],
    "Infrastructure": ["20"],
    "Energy & Environment": ["81", "66"],
  };

  const results: Record<string, number> = {};

  for (const [label, cfdas] of Object.entries(categories)) {
    try {
      const res = await fetch(
        `${USASPENDING_BASE}/search/spending_by_geography/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scope: "place_of_performance",
            geo_layer: "county",
            geo_layer_filters: [countyFips],
            filters: {
              time_period: [{ start_date: `${fy - 1}-10-01`,
                              end_date: `${fy}-09-30` }],
              program_numbers: cfdas,
            },
            subawards: false,
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        results[label] = data.results?.[0]?.aggregated_amount ?? 0;
      }
    } catch {
      results[label] = 0;
    }
  }

  return results;
}
