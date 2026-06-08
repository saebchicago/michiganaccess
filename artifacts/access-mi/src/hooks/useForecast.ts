import { useQuery } from "@tanstack/react-query";

export interface ForecastPeriod {
  name: string;
  temperature: number;
  temperatureUnit: string;
  windSpeed: string;
  windDirection: string;
  shortForecast: string;
  detailedForecast: string;
  isDaytime: boolean;
}

const FALLBACK: ForecastPeriod[] = [
  { name: "Today", temperature: 45, temperatureUnit: "F", windSpeed: "10 mph", windDirection: "W", shortForecast: "Partly Cloudy", detailedForecast: "Forecast unavailable - check weather.gov", isDaytime: true },
  { name: "Tonight", temperature: 32, temperatureUnit: "F", windSpeed: "5 mph", windDirection: "NW", shortForecast: "Mostly Clear", detailedForecast: "Forecast unavailable - check weather.gov", isDaytime: false },
  { name: "Tomorrow", temperature: 48, temperatureUnit: "F", windSpeed: "8 mph", windDirection: "SW", shortForecast: "Sunny", detailedForecast: "Forecast unavailable - check weather.gov", isDaytime: true },
  { name: "Tomorrow Night", temperature: 34, temperatureUnit: "F", windSpeed: "5 mph", windDirection: "W", shortForecast: "Clear", detailedForecast: "Forecast unavailable - check weather.gov", isDaytime: false },
];

export const MI_CITIES: { name: string; lat: number; lng: number }[] = [
  { name: "Detroit", lat: 42.3314, lng: -83.0458 },
  { name: "Grand Rapids", lat: 42.9634, lng: -85.6681 },
  { name: "Lansing", lat: 42.7325, lng: -84.5555 },
  { name: "Ann Arbor", lat: 42.2808, lng: -83.7430 },
  { name: "Flint", lat: 43.0125, lng: -83.6875 },
  { name: "Traverse City", lat: 44.7631, lng: -85.6206 },
  { name: "Marquette", lat: 46.5436, lng: -87.3954 },
  { name: "Kalamazoo", lat: 42.2917, lng: -85.5872 },
];

export function useForecast(lat: number, lng: number) {
  return useQuery<ForecastPeriod[]>({
    queryKey: ["nws-forecast", lat, lng],
    queryFn: async () => {
      try {
        const headers = { "User-Agent": "(accessmi.org, civic-platform)" };

        const pointRes = await fetch(`https://api.weather.gov/points/${lat.toFixed(4)},${lng.toFixed(4)}`, { headers });
        if (!pointRes.ok) return FALLBACK;
        const pointData = await pointRes.json();
        const forecastUrl = pointData?.properties?.forecast;
        if (!forecastUrl) return FALLBACK;

        const forecastRes = await fetch(forecastUrl, { headers });
        if (!forecastRes.ok) return FALLBACK;
        const forecastData = await forecastRes.json();
        const periods = forecastData?.properties?.periods || [];

        return periods.slice(0, 8).map((p: any) => ({
          name: p.name || "",
          temperature: p.temperature || 0,
          temperatureUnit: p.temperatureUnit || "F",
          windSpeed: p.windSpeed || "",
          windDirection: p.windDirection || "",
          shortForecast: p.shortForecast || "",
          detailedForecast: p.detailedForecast || "",
          isDaytime: p.isDaytime ?? true,
        }));
      } catch {
        return FALLBACK;
      }
    },
    staleTime: 60 * 60 * 1000,
    retry: 1,
    enabled: lat !== 0 && lng !== 0,
  });
}
