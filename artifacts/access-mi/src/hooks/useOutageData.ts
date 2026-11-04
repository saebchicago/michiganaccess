import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OutageZone {
  county: string;
  lat: number;
  lng: number;
  utility: "DTE" | "Consumers";
  customersAffected: number;
  customersServed: number;
  cause: string;
  estimatedRestore: string;
  severity: "none" | "low" | "moderate" | "high" | "critical";
}

interface OutageResponse {
  zones: OutageZone[];
  meta: {
    source: "live" | "demo" | "aggregated";
    timestamp: string;
    totalAffected: number;
    activeOutageCount: number;
    refreshInterval: number;
  };
}

export function useOutageData(enabled = true) {
  return useQuery({
    queryKey: ["outage-data"],
    queryFn: async (): Promise<OutageResponse | null> => {
      const { data, error } = await supabase.functions.invoke("outage-proxy");
      if (error) throw error;
      const response = data as OutageResponse | null;
      return response?.meta?.source === "live" &&
        Array.isArray(response.zones)
        ? response
        : null;
    },
    enabled,
    refetchInterval: 15 * 60 * 1000, // 15 minutes
    staleTime: 10 * 60 * 1000,
  });
}
