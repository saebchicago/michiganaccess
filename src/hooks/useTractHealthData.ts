import { useQuery } from "@tanstack/react-query";

export interface TractHealthData {
  countyname: string;
  locationname: string;
  measure: string;
  data_value: number;
  short_question_text: string;
  totalpopulation: string;
  year: string;
}

export const TRACT_MEASURES = [
  { id: "DIABETES", label: "Diabetes" },
  { id: "CASTHMA", label: "Asthma" },
  { id: "OBESITY", label: "Obesity" },
  { id: "DEPRESSION", label: "Depression" },
  { id: "BPHIGH", label: "High Blood Pressure" },
  { id: "COPD", label: "COPD" },
  { id: "STROKE", label: "Stroke" },
] as const;

export function useTractHealthData(countyFips: string, measureId: string = "DIABETES") {
  return useQuery<TractHealthData[]>({
    queryKey: ["cdc-tract", countyFips, measureId],
    queryFn: async () => {
      if (!countyFips) return [];
      try {
        const url = `https://data.cdc.gov/resource/cwsq-ngmh.json?stateabbr=MI&measureid=${measureId}&countyfips=${countyFips}&$limit=200&$order=data_value DESC`;
        const res = await fetch(url, { headers: { Accept: "application/json" } });
        if (!res.ok) return [];
        const data = await res.json();
        return data
          .filter((d: any) => d.data_value)
          .map((d: any) => ({
            countyname: d.countyname || "",
            locationname: d.locationname || d.tractfips || "",
            measure: d.measure || "",
            data_value: parseFloat(d.data_value) || 0,
            short_question_text: d.short_question_text || "",
            totalpopulation: d.totalpopulation || "",
            year: d.year || "",
          }));
      } catch {
        return [];
      }
    },
    staleTime: 60 * 60 * 1000,
    retry: 1,
    enabled: !!countyFips,
  });
}
