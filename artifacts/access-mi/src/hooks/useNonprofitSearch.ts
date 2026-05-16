// ProPublica Nonprofit Explorer API — no key required
// Source: projects.propublica.org/nonprofits/api/v2

import { useQuery } from "@tanstack/react-query";

export interface NonprofitResult {
  ein: string;
  name: string;
  city: string;
  state: string;
  nteeCode: string;
  revenue: number;
  assets: number;
  filingYear: string;
  source: string;
}

export async function searchMichiganNonprofits(
  query: string
): Promise<NonprofitResult[]> {
  if (!query || query.length < 3) return [];
  try {
    const url = `https://projects.propublica.org/nonprofits/api/v2/search.json?q=${encodeURIComponent(query)}&state[id]=MI`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.organizations || []).slice(0, 20).map(
      (org: Record<string, unknown>) => ({
        ein: (org.ein as string) || "",
        name: (org.name as string) || "",
        city: (org.city as string) || "",
        state: (org.state as string) || "MI",
        nteeCode: (org.ntee_code as string) || "",
        revenue: (org.income_amount as number) || 0,
        assets: (org.asset_amount as number) || 0,
        filingYear: (org.tax_prd as string) || "",
        source: "ProPublica Nonprofit Explorer / IRS Form 990",
      })
    );
  } catch {
    return [];
  }
}

export function useNonprofitSearch(query: string) {
  return useQuery({
    queryKey: ["nonprofit-search", query],
    queryFn: () => searchMichiganNonprofits(query),
    enabled: query.length >= 3,
    staleTime: 1000 * 60 * 60,
    retry: 1,
  });
}
