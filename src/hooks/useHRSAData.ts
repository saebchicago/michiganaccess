import { useQuery } from "@tanstack/react-query";

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
}

interface HRSAResponse {
  results: HRSAFacility[];
  count: number;
  source: string;
  cached_at: string;
  error?: string;
  fallback?: boolean;
}

export function useHRSAData(state: string = "MI", limit: number = 50) {
  return useQuery<HRSAResponse>({
    queryKey: ["hrsa-data", state, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        dataset: "health-centers",
        state,
        limit: String(limit),
      });

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hrsa-data?${params.toString()}`;
      const res = await fetch(url, {
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error(`HRSA API error: ${res.status}`);
      }
      return res.json();
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
  });
}
