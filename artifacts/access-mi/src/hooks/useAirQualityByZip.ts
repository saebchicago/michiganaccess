import { useQuery } from "@tanstack/react-query";

export interface AirQualityObservation {
  DateObserved: string;
  HourObserved: number;
  LocalTimeZone: string;
  ReportingArea: string;
  StateCode: string;
  Latitude: number;
  Longitude: number;
  ParameterName: string;
  AQI: number;
  Category: {
    Number: number;
    Name: string;
  };
}

export const AQI_CATEGORY_COLORS: Record<number, string> = {
  1: "#00E400",
  2: "#FFFF00",
  3: "#FF7E00",
  4: "#FF0000",
  5: "#8F3F97",
  6: "#7E0023",
};

export const AQI_CATEGORY_TEXT_COLORS: Record<number, string> = {
  1: "text-green-700 dark:text-green-400",
  2: "text-yellow-700 dark:text-yellow-400",
  3: "text-orange-700 dark:text-orange-400",
  4: "text-red-700 dark:text-red-400",
  5: "text-purple-700 dark:text-purple-400",
  6: "text-red-900 dark:text-red-300",
};

export const AQI_CATEGORY_BG: Record<number, string> = {
  1: "bg-green-100 dark:bg-green-900/30",
  2: "bg-yellow-100 dark:bg-yellow-900/30",
  3: "bg-orange-100 dark:bg-orange-900/30",
  4: "bg-red-100 dark:bg-red-900/30",
  5: "bg-purple-100 dark:bg-purple-900/30",
  6: "bg-red-200 dark:bg-red-900/50",
};

const FALLBACK: AirQualityObservation[] = [
  {
    DateObserved: new Date().toISOString().split("T")[0],
    HourObserved: 12,
    LocalTimeZone: "EST",
    ReportingArea: "Detroit-Ann Arbor",
    StateCode: "MI",
    Latitude: 42.33,
    Longitude: -83.05,
    ParameterName: "PM2.5",
    AQI: 42,
    Category: { Number: 1, Name: "Good" },
  },
];

export function useAirQualityByZip(zipCode: string) {
  return useQuery<AirQualityObservation[]>({
    queryKey: ["air-quality-zip", zipCode],
    queryFn: async () => {
      if (!zipCode || zipCode.length !== 5) return FALLBACK;

      try {
        const res = await fetch(
          `/.netlify/functions/airnow-by-zip?zip=${zipCode}`,
        );

        if (!res.ok) {
          console.warn(`AirNow proxy returned ${res.status}`);
          return FALLBACK;
        }

        const data = await res.json();
        return Array.isArray(data) && data.length > 0 ? data : FALLBACK;
      } catch (err) {
        console.warn("AirNow fetch failed:", err);
        return FALLBACK;
      }
    },
    staleTime: 30 * 60 * 1000,
    retry: 1,
    enabled: zipCode.length === 5,
  });
}
