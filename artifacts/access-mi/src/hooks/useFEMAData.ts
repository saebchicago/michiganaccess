// FEMA Disaster Declarations & National Risk Index
// Public REST API — no key required
// Docs: www.fema.gov/api/open

import { useQuery } from "@tanstack/react-query";

export interface FEMADisasterDeclaration {
  disasterNumber: number;
  declarationDate: string;
  disasterType: string;
  incidentType: string;
  title: string;
  state: string;
  county: string;
  programsActivated: string[];
  closeoutDate?: string;
  source: string;
}

export async function fetchFEMADeclarations(
  county: string
): Promise<FEMADisasterDeclaration[]> {
  try {
    const countyParam = encodeURIComponent(`${county.toUpperCase()} (County)`);
    const url = `https://www.fema.gov/api/open/v2/` +
      `DisasterDeclarationsSummaries` +
      `?$filter=state eq 'Michigan' and ` +
      `designatedArea eq '${countyParam}'` +
      `&$orderby=declarationDate desc&$top=50`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.DisasterDeclarationsSummaries || [])
      .map((d: Record<string, unknown>) => ({
        disasterNumber: d.disasterNumber as number,
        declarationDate: d.declarationDate as string,
        disasterType: d.disasterType as string,
        incidentType: d.incidentType as string,
        title: (d.declarationTitle as string) || "",
        state: "MI",
        county,
        programsActivated: [
          ...(d.ihProgramDeclared ? ["Individual Assistance"] : []),
          ...(d.iaProgramDeclared ? ["IA"] : []),
          ...(d.paProgramDeclared ? ["Public Assistance"] : []),
          ...(d.hmProgramDeclared ? ["Hazard Mitigation"] : []),
        ],
        closeoutDate: d.closeoutDate as string | undefined,
        source: "FEMA Disaster Declarations API",
      }));
  } catch {
    return [];
  }
}

export function useFEMADeclarations(county: string | null) {
  return useQuery({
    queryKey: ["fema-declarations", county],
    queryFn: () => county
      ? fetchFEMADeclarations(county)
      : Promise.resolve([]),
    enabled: !!county,
    staleTime: 1000 * 60 * 60 * 24,
    retry: 1,
  });
}
