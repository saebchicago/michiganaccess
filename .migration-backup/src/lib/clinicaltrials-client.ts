const CT_BASE = "https://clinicaltrials.gov/api/v2";

export interface ClinicalTrial {
  nctId: string;
  title: string;
  status: string;
  conditions: string[];
  phase: string;
  locations: string[];
  startDate: string;
  sponsor: string;
  url: string;
}

export async function searchMichiganTrials(condition?: string): Promise<ClinicalTrial[]> {
  try {
    const params = new URLSearchParams({
      "query.locn": "Michigan",
      "filter.overallStatus": "RECRUITING",
      pageSize: "15",
      format: "json",
    });
    if (condition) params.set("query.cond", condition);

    const res = await fetch(`${CT_BASE}/studies?${params}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.studies || []).map((s: any) => {
      const p = s.protocolSection;
      return {
        nctId: p?.identificationModule?.nctId || "",
        title: p?.identificationModule?.briefTitle || "",
        status: p?.statusModule?.overallStatus || "",
        conditions: p?.conditionsModule?.conditions || [],
        phase: (p?.designModule?.phases || [])[0] || "N/A",
        locations: (p?.contactsLocationsModule?.locations || [])
          .filter((l: any) => l.state === "Michigan")
          .slice(0, 3)
          .map((l: any) => `${l.facility || ""}, ${l.city || ""}`),
        startDate: p?.statusModule?.startDateStruct?.date || "",
        sponsor: p?.sponsorCollaboratorsModule?.leadSponsor?.name || "",
        url: `https://clinicaltrials.gov/study/${p?.identificationModule?.nctId}`,
      };
    });
  } catch {
    return [];
  }
}
