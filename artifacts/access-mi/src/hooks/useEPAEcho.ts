// EPA ECHO - Enforcement and Compliance History Online
// Routed through a Netlify Function proxy because echodata.epa.gov does not
// set a permissive Access-Control-Allow-Origin header and direct browser
// fetches are CORS-blocked. The upstream API itself remains public, no key.
// Docs: echo.epa.gov/tools/web-services

import { useQuery } from "@tanstack/react-query";

export interface ECHOFacility {
  id: string;
  name: string;
  address: string;
  city: string;
  county: string;
  lat: number;
  lon: number;
  programs: string[];
  violations12mo: number;
  formalEnfActions3yr: number;
  inspections3yr: number;
  triReporter: boolean;
  naicsDescription: string;
  source: string;
}

/**
 * Throws on any transport or upstream failure. It must never return `[]`
 * for a failed request: an empty array is rendered as "0 facilities,
 * 0 violations, 0 enforcement actions", which reads as a verified finding
 * about the county rather than as missing data. Callers surface
 * `isError` as an explicit unavailable state instead.
 */
export async function fetchECHOFacilities(
  county: string,
  state: string = "MI",
): Promise<ECHOFacility[]> {
  const url =
    `/.netlify/functions/epa-echo-facilities` +
    `?state=${encodeURIComponent(state)}` +
    `&county=${encodeURIComponent(county)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("EPA ECHO data is unavailable.");
  }
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("json")) {
    // A 200 carrying HTML means the proxy returned an error page.
    throw new Error("EPA ECHO data is unavailable.");
  }
  const data = await res.json();
  const results = data.Results?.Facilities || [];
  return results.slice(0, 50).map((f: Record<string, string>) => ({
    id: f.RegistryID || f.FacilityID || "",
    name: f.FacilityName ?? "",
    address: f.LocationAddress ?? "",
    city: f.CityName ?? "",
    county,
    lat: parseFloat(f.Latitude83 || "0"),
    lon: parseFloat(f.Longitude83 || "0"),
    programs: [
      ...(f.AIRFlag === "Y" ? ["CAA"] : []),
      ...(f.WATERFlag === "Y" ? ["CWA"] : []),
      ...(f.HAZWASTEFlag === "Y" ? ["RCRA"] : []),
      ...(f.DWFlag === "Y" ? ["SDWA"] : []),
    ],
    violations12mo: parseInt(f.AllViolations || "0"),
    formalEnfActions3yr: parseInt(f.AllFormalActions || "0"),
    inspections3yr: parseInt(f.TotalInspections || "0"),
    triReporter: f.TRIFlag === "Y",
    naicsDescription: f.NAICSDescription ?? "",
    source: "EPA ECHO Enforcement & Compliance History",
  }));
}

export function useECHOFacilities(county: string | null) {
  return useQuery({
    queryKey: ["echo-facilities", county],
    queryFn: () => (county ? fetchECHOFacilities(county) : Promise.resolve([])),
    enabled: !!county,
    staleTime: 1000 * 60 * 60 * 12,
    retry: 1,
  });
}

