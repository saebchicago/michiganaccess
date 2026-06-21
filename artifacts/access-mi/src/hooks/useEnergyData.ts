import { useQuery } from "@tanstack/react-query";

export interface EIADataPoint {
  period: string;
  price: number;
}

export interface EnergyData {
  michigan: EIADataPoint[];
  national: EIADataPoint[];
  latestMI: number | null;
  latestUS: number | null;
}

const FALLBACK: EnergyData = {
  michigan: [
    { period: "2025-01", price: 20.1 },
    { period: "2025-02", price: 20.3 },
    { period: "2025-03", price: 20.0 },
    { period: "2025-04", price: 19.8 },
    { period: "2025-05", price: 20.2 },
    { period: "2025-06", price: 20.8 },
    { period: "2025-07", price: 21.2 },
    { period: "2025-08", price: 21.5 },
    { period: "2025-09", price: 20.9 },
    { period: "2025-10", price: 20.6 },
    { period: "2025-11", price: 20.4 },
    { period: "2025-12", price: 20.2 },
  ],
  national: [
    { period: "2025-01", price: 16.2 },
    { period: "2025-02", price: 16.4 },
    { period: "2025-03", price: 16.1 },
    { period: "2025-04", price: 16.5 },
    { period: "2025-05", price: 17.0 },
    { period: "2025-06", price: 17.5 },
    { period: "2025-07", price: 17.8 },
    { period: "2025-08", price: 17.6 },
    { period: "2025-09", price: 17.2 },
    { period: "2025-10", price: 16.9 },
    { period: "2025-11", price: 16.7 },
    { period: "2025-12", price: 16.5 },
  ],
  latestMI: 20.2,
  latestUS: 16.5,
};

export function useEnergyData() {
  return useQuery<EnergyData>({
    queryKey: ["eia-energy-prices"],
    queryFn: async () => {
      try {
        const res = await fetch("/.netlify/functions/eia-retail-prices");
        if (!res.ok) return FALLBACK;
        const { mi: miJson, us: usJson } = await res.json();

        const parse = (raw: any[]): EIADataPoint[] =>
          (raw || [])
            .map((d: any) => ({
              period: d.period as string,
              price: parseFloat(d.price) || 0,
            }))
            .filter((d) => d.price > 0)
            .reverse();

        const mi = parse(miJson?.response?.data);
        const us = parse(usJson?.response?.data);

        return {
          michigan: mi.length > 0 ? mi : FALLBACK.michigan,
          national: us.length > 0 ? us : FALLBACK.national,
          latestMI: mi.length > 0 ? mi[mi.length - 1].price : FALLBACK.latestMI,
          latestUS: us.length > 0 ? us[us.length - 1].price : FALLBACK.latestUS,
        };
      } catch (err) {
        console.warn("EIA fetch failed:", err);
        return FALLBACK;
      }
    },
    staleTime: 6 * 60 * 60 * 1000,
    retry: 1,
  });
}
