/**
 * React hook for live Census Bureau ACS data via the census-acs-proxy edge function.
 */
import { useQuery } from "@tanstack/react-query";
import { SUPABASE_URL, SUPABASE_ANON_KEY as SUPABASE_KEY } from "@/integrations/supabase/client";

export type GeoType = "state" | "county" | "place" | "tract" | "zcta";

export interface UseCensusACSOptions {
  tables: string[];
  geoType: GeoType;
  geoFips: string;
  year?: number;
  enabled?: boolean;
}

export interface CensusTableResult {
  name: string;
  variables: Record<string, number | string | null>;
}

export interface CensusACSResponse {
  year: number;
  dataset: string;
  geoType: string;
  geoFips: string;
  tables: Record<string, CensusTableResult>;
  source: string;
  error?: string;
}

export function useCensusACS(options: UseCensusACSOptions) {
  const { tables, geoType, geoFips, year = 2022, enabled = true } = options;

  return useQuery<CensusACSResponse>({
    queryKey: ["census-acs", tables.join(","), geoType, geoFips, year],
    queryFn: async () => {
      const params = new URLSearchParams({
        tables: tables.join(","),
        geoType,
        geoFips,
        year: String(year),
      });

      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/census-acs-proxy?${params}`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error(`Census API error: ${res.status}`);
      }

      return res.json();
    },
    enabled: enabled && tables.length > 0 && !!geoFips,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** Helper: extract a single numeric value from Census response */
export function getCensusValue(
  data: CensusACSResponse | undefined,
  tableId: string,
  variableCode: string
): number | null {
  if (!data) return null;
  const table = data.tables[tableId];
  if (!table) return null;
  const val = table.variables[variableCode];
  return typeof val === "number" ? val : null;
}

/** Helper: get margin of error for a variable */
export function getCensusMOE(
  data: CensusACSResponse | undefined,
  tableId: string,
  variableCode: string
): number | null {
  const moeCode = variableCode.replace(/E$/, "M");
  return getCensusValue(data, tableId, moeCode);
}

/** Format currency */
export function formatDollars(val: number | null): string {
  if (val === null) return "N/A";
  return `$${val.toLocaleString()}`;
}

/** Format count with commas */
export function formatCount(val: number | null): string {
  if (val === null) return "N/A";
  return val.toLocaleString();
}

/** Format as percentage (given numerator/denominator) */
export function formatPercent(num: number | null, denom: number | null): string {
  if (num === null || denom === null || denom === 0) return "N/A";
  return `${((num / denom) * 100).toFixed(1)}%`;
}
