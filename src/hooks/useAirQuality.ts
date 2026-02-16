import { useQuery } from "@tanstack/react-query";

export interface AQIStation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  aqi: number;
  category: string;
  color: string;
  parameter: string;
  unit: string;
  lastUpdated: string;
  city?: string;
}

interface AQICategory {
  min: number;
  max: number;
  label: string;
  color: string;
}

interface AQIResponse {
  stations: AQIStation[];
  count: number;
  fetched_at: string;
  cached: boolean;
  aqi_categories: AQICategory[];
}

export function useAirQuality(enabled = true) {
  return useQuery({
    queryKey: ["aqi-data"],
    queryFn: async (): Promise<AQIResponse> => {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/airnow-proxy`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`AQI proxy error: ${response.status}`);
      }

      return response.json();
    },
    enabled,
    staleTime: 30 * 60 * 1000, // 30 min
    gcTime: 60 * 60 * 1000,
    retry: 1,
  });
}

// Standard EPA AQI color scale
export const AQI_COLORS = {
  good: "#00E400",
  moderate: "#FFFF00",
  usg: "#FF7E00",
  unhealthy: "#FF0000",
  veryUnhealthy: "#8F3F97",
  hazardous: "#7E0023",
};
