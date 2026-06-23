import { useQuery } from "@tanstack/react-query";

export interface WeatherAlert {
  id: string;
  event: string;
  severity: string;
  urgency: string;
  headline: string;
  description: string;
  areaDesc: string;
  effective: string;
  expires: string;
  senderName: string;
}

export const SEVERITY_COLORS: Record<string, string> = {
  Extreme: "bg-red-900 text-white",
  Severe: "bg-red-600 text-white",
  Moderate: "bg-orange-700 text-white",
  Minor: "bg-yellow-400 text-black",
  Unknown: "bg-gray-400 text-white",
};

export const SEVERITY_BORDER: Record<string, string> = {
  Extreme: "border-red-900/40",
  Severe: "border-red-600/30",
  Moderate: "border-orange-500/30",
  Minor: "border-yellow-400/30",
  Unknown: "border-gray-400/30",
};

const FALLBACK: WeatherAlert[] = [];

export function useWeatherAlerts() {
  return useQuery<WeatherAlert[]>({
    queryKey: ["nws-weather-alerts-mi"],
    queryFn: async () => {
      try {
        const res = await fetch(
          "https://api.weather.gov/alerts/active?area=MI",
          {
            headers: {
              Accept: "application/geo+json",
              "User-Agent": "(accessmi.org, civic-platform)",
            },
          },
        );
        if (!res.ok) return FALLBACK;
        const data = await res.json();
        const features = data?.features || [];
        if (features.length === 0) return FALLBACK;

        return features.slice(0, 10).map((f: any) => ({
          id: f.properties?.id || f.id || String(Math.random()),
          event: f.properties?.event || "Weather Alert",
          severity: f.properties?.severity || "Unknown",
          urgency: f.properties?.urgency || "Unknown",
          headline: f.properties?.headline || "",
          description: (f.properties?.description || "").substring(0, 500),
          areaDesc: f.properties?.areaDesc || "Michigan",
          effective: f.properties?.effective || new Date().toISOString(),
          expires: f.properties?.expires || "",
          senderName: f.properties?.senderName || "NWS",
        }));
      } catch {
        return FALLBACK;
      }
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}
