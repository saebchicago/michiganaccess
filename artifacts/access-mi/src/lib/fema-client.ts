/**
 * OpenFEMA API client - Disaster Declarations for Michigan
 * Source: FEMA NEMIS via OpenFEMA
 * API: Free, no key required, REST JSON
 * IMPORTANT: state field uses abbreviation 'MI', not 'Michigan'
 */
const FEMA_BASE = "https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries";

export interface FEMADisaster {
  disasterNumber: number;
  declarationDate: string;
  declarationTitle: string;
  incidentType: string;
  designatedArea: string;
  state: string;
  incidentBeginDate: string;
  incidentEndDate: string;
  declarationType: string;
  ihProgramDeclared: boolean;
  iaProgramDeclared: boolean;
  paProgramDeclared: boolean;
  hmProgramDeclared: boolean;
}

export async function fetchMichiganDisasters(): Promise<FEMADisaster[]> {
  try {
    const url = `${FEMA_BASE}?$filter=state eq 'MI'&$orderby=declarationDate desc&$top=1000`;
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.DisasterDeclarationsSummaries || []).map((d: any) => ({
      disasterNumber: d.disasterNumber,
      declarationDate: d.declarationDate,
      declarationTitle: d.declarationTitle,
      incidentType: d.incidentType,
      designatedArea: d.designatedArea,
      state: d.state,
      incidentBeginDate: d.incidentBeginDate,
      incidentEndDate: d.incidentEndDate,
      declarationType: d.declarationType,
      ihProgramDeclared: d.ihProgramDeclared,
      iaProgramDeclared: d.iaProgramDeclared,
      paProgramDeclared: d.paProgramDeclared,
      hmProgramDeclared: d.hmProgramDeclared,
    }));
  } catch {
    return [];
  }
}

export function getCountyDisasterCount(disasters: FEMADisaster[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const d of disasters) {
    const county = d.designatedArea?.replace(/ \(County\)/i, "").trim();
    if (county) counts[county] = (counts[county] || 0) + 1;
  }
  return counts;
}

export function getDisastersByDecade(disasters: FEMADisaster[]): Record<string, number> {
  const decades: Record<string, number> = {};
  for (const d of disasters) {
    const year = new Date(d.declarationDate).getFullYear();
    const decade = `${Math.floor(year / 10) * 10}s`;
    decades[decade] = (decades[decade] || 0) + 1;
  }
  return decades;
}

export function getUniqueDisasters(disasters: FEMADisaster[]): FEMADisaster[] {
  const seen = new Set<number>();
  return disasters.filter(d => {
    if (seen.has(d.disasterNumber)) return false;
    seen.add(d.disasterNumber);
    return true;
  });
}
