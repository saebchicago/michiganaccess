import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CDCPlacesResult {
  stateabbr?: string;
  statedesc?: string;
  locationname?: string;
  category?: string;
  measure?: string;
  data_value?: string;
  data_value_unit?: string;
  data_value_type?: string;
  low_confidence_limit?: string;
  high_confidence_limit?: string;
  totalpopulation?: string;
  year?: string;
  short_question_text?: string;
}

interface CDCResponse {
  results: CDCPlacesResult[];
  count: number;
  source: string;
  cached_at: string;
  error?: string;
  fallback?: boolean;
  message?: string;
}

export function useCDCData(
  dataset: string = "places-county",
  measure: string = "",
  limit: number = 50
) {
  return useQuery<CDCResponse>({
    queryKey: ["cdc-data", dataset, measure, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        dataset,
        limit: String(limit),
      });
      if (measure) params.set("measure", measure);

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cdc-proxy?${params.toString()}`;
      const res = await fetch(url, {
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error(`CDC API error: ${res.status}`);
      }
      return res.json();
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
  });
}

// Transform CDC PLACES county data into AQI-like display format
export function transformPlacesToAQI(results: CDCPlacesResult[]) {
  // Filter for air quality / health-related measures and group by county
  const byCounty = new Map<string, { value: number; measure: string }>();

  for (const r of results) {
    const county = r.locationname || "Unknown";
    const value = parseFloat(r.data_value || "0");
    if (value > 0 && !byCounty.has(county)) {
      byCounty.set(county, { value, measure: r.short_question_text || r.measure || "" });
    }
  }

  return Array.from(byCounty.entries())
    .slice(0, 10)
    .map(([county, data]) => ({
      city: county.replace(" County", ""),
      aqi: Math.round(data.value),
      measure: data.measure,
      status: data.value < 15 ? "Good" : data.value < 25 ? "Moderate" : "Elevated",
      color:
        data.value < 15
          ? "hsl(145, 32%, 30%)"
          : data.value < 25
          ? "hsl(27, 87%, 67%)"
          : "hsl(0, 100%, 71%)",
    }));
}
