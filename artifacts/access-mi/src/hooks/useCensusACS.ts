/**
 * React hook for live Census Bureau ACS data via the census-acs-proxy edge function.
 */
import { useQuery } from "@tanstack/react-query";
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY as SUPABASE_KEY,
} from "@/integrations/supabase/client";

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
  /** Populated when source === "unavailable". Carries the upstream HTTP status
   *  and a body snippet so downstream consumers can render a real diagnostic
   *  instead of a silent fallback number. */
  error?: {
    status: number;
    contentType?: string;
    bodySnippet?: string;
    message: string;
  };
}

function makeUnavailable(
  year: number,
  geoType: string,
  geoFips: string,
  errorInfo: CensusACSResponse["error"],
): CensusACSResponse {
  return {
    year,
    dataset: "acs5",
    geoType,
    geoFips,
    tables: {},
    source: "unavailable",
    error: errorInfo,
  };
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

      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/census-acs-proxy?${params}`,
          {
            headers: {
              apikey: SUPABASE_KEY,
              "Content-Type": "application/json",
            },
          },
        );

        // Read the body once so we can inspect both shape and content type
        // before deciding success or failure.
        const contentType = res.headers.get("content-type") ?? "";
        const bodyText = await res.text();

        if (!res.ok) {
          console.warn(
            `[useCensusACS] proxy returned ${res.status} for ${geoType}:${geoFips} year=${year}`,
            { contentType, bodySnippet: bodyText.slice(0, 200) },
          );
          return makeUnavailable(year, geoType, geoFips, {
            status: res.status,
            contentType,
            bodySnippet: bodyText.slice(0, 200),
            message: `census-acs-proxy returned HTTP ${res.status}`,
          });
        }

        // Even on 200, defensively check we got JSON. If the proxy somehow
        // emits HTML or text, treat as failure rather than as data.
        if (!contentType.toLowerCase().includes("application/json")) {
          console.warn(
            `[useCensusACS] proxy returned 200 with non-JSON content-type=${contentType}`,
          );
          return makeUnavailable(year, geoType, geoFips, {
            status: 200,
            contentType,
            bodySnippet: bodyText.slice(0, 200),
            message: "Proxy returned 200 but the body was not JSON",
          });
        }

        try {
          return JSON.parse(bodyText) as CensusACSResponse;
        } catch (parseErr) {
          console.warn("[useCensusACS] proxy body failed JSON.parse", parseErr);
          return makeUnavailable(year, geoType, geoFips, {
            status: 200,
            contentType,
            bodySnippet: bodyText.slice(0, 200),
            message: `JSON parse failed: ${
              parseErr instanceof Error ? parseErr.message : "unknown"
            }`,
          });
        }
      } catch (networkErr) {
        console.warn("[useCensusACS] network error", networkErr);
        return makeUnavailable(year, geoType, geoFips, {
          status: 0,
          message: `Network error: ${
            networkErr instanceof Error ? networkErr.message : "unknown"
          }`,
        });
      }
    },
    enabled: enabled && tables.length > 0 && !!geoFips,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** True when the response carries usable ACS data. Treat any
 *  unavailable-source or parse-error payload as a hard failure
 *  upstream - never as a reason to substitute defaults. */
export function isCensusAvailable(
  data: CensusACSResponse | undefined,
): data is CensusACSResponse {
  if (!data) return false;
  if (data.source === "unavailable") return false;
  if (!data.tables || Object.keys(data.tables).length === 0) return false;
  return true;
}

/** Helper: extract a single numeric value from Census response */
export function getCensusValue(
  data: CensusACSResponse | undefined,
  tableId: string,
  variableCode: string,
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
  variableCode: string,
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
export function formatPercent(
  num: number | null,
  denom: number | null,
): string {
  if (num === null || denom === null || denom === 0) return "N/A";
  return `${((num / denom) * 100).toFixed(1)}%`;
}
