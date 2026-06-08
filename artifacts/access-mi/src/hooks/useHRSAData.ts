import { useQuery } from "@tanstack/react-query";
import { MICHIGAN_FQHCS } from "@/data/michigan-fqhcs";

interface HRSAFacility {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  lat: number;
  lng: number;
  type: string;
  website?: string;
}

interface HRSAResponse {
  results: HRSAFacility[];
  count: number;
  source: string;
  cached_at: string;
  error?: string;
  fallback?: boolean;
}

const FALLBACK_RESPONSE: HRSAResponse = {
  results: MICHIGAN_FQHCS as HRSAFacility[],
  count: MICHIGAN_FQHCS.length,
  source: "Static Fallback (HRSA Public Data)",
  cached_at: new Date().toISOString(),
  fallback: true,
};

export function useHRSAData(state: string = "MI", limit: number = 50) {
  return useQuery<HRSAResponse>({
    queryKey: ["hrsa-data", state, limit],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          state,
          limit: String(limit),
        });

        const url = `${import.meta.env.VITE_SUPABASE_URL ?? "https://znahhtdbcgepezrxwnah.supabase.co"}/functions/v1/hrsa-data?${params.toString()}`;
        const res = await fetch(url, {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          console.warn(`HRSA API returned ${res.status}, using fallback data`);
          return FALLBACK_RESPONSE;
        }

        const data: HRSAResponse = await res.json();

        // If the API returned empty results or an error, use fallback
        if (!data.results || data.results.length === 0 || data.error) {
          console.warn("HRSA API returned empty/error, using fallback data");
          return FALLBACK_RESPONSE;
        }

        return data;
      } catch (err) {
        console.warn("HRSA API fetch failed, using fallback data:", err);
        return FALLBACK_RESPONSE;
      }
    },
    staleTime: 60 * 60 * 1000,
    retry: 0, // No retries needed - fallback handles failures
  });
}
