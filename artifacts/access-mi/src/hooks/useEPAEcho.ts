// EPA ECHO - Enforcement and Compliance History Online
// Public REST API - no key required
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

export async function fetchECHOFacilities(
  county: string,
  state: string = "MI"
): Promise<ECHOFacility[]> {
  try {
    const url = `https://echodata.epa.gov/echo/` +
      `dfr_rest_services.get_facilities` +
      `?output=JSON&p_st=${state}` +
      `&p_county=${encodeURIComponent(county)}` +
      `&p_act=Y&qcolumns=1,2,3,4,5,8,9,10,13,14,22,23`;
    const res = await fetch(url);
    if (!res.ok) return [];
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
  } catch {
    return [];
  }
}

export function useECHOFacilities(county: string | null) {
  return useQuery({
    queryKey: ["echo-facilities", county],
    queryFn: () => county
      ? fetchECHOFacilities(county)
      : Promise.resolve([]),
    enabled: !!county,
    staleTime: 1000 * 60 * 60 * 12,
    retry: 1,
  });
}
