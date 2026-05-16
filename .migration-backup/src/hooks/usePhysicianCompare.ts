import { useQuery } from "@tanstack/react-query";

export interface PhysicianData {
  npi: string;
  firstName: string;
  lastName: string;
  credential: string;
  specialty: string;
  groupPractice: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  hospitalAffiliation: string;
  medicalSchool: string;
  graduationYear: string;
  acceptsMedicare: boolean;
}

export function usePhysicianCompare(lastName: string, city?: string) {
  return useQuery<PhysicianData[]>({
    queryKey: ["cms-physician", lastName, city],
    queryFn: async () => {
      if (!lastName || lastName.length < 2) return [];
      try {
        const conditions: Record<string, string>[] = [
          { property: "st", value: "MI", operator: "=" },
          { property: "lst_nm", value: lastName.toUpperCase(), operator: "=" },
        ];
        if (city) {
          conditions.push({ property: "cty", value: city.toUpperCase(), operator: "=" });
        }

        const res = await fetch("https://data.cms.gov/provider-data/api/1/datastore/query/mj5m-pzi6/0", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conditions, limit: 20, offset: 0 }),
        });
        if (!res.ok) return [];
        const data = await res.json();
        return (data.results || []).map((r: any) => ({
          npi: r.npi || "",
          firstName: r.frst_nm || "",
          lastName: r.lst_nm || "",
          credential: r.cred || "",
          specialty: r.pri_spec || "",
          groupPractice: r.org_nm || "",
          city: r.cty || "",
          state: r.st || "MI",
          zip: (r.zip || "").substring(0, 5),
          phone: r.phn_numbr || "",
          hospitalAffiliation: r.hosp_afl_1 || "",
          medicalSchool: r.med_sch || "",
          graduationYear: r.grd_yr || "",
          acceptsMedicare: r.assgn === "Y",
        }));
      } catch {
        return [];
      }
    },
    staleTime: 30 * 60 * 1000,
    retry: 1,
    enabled: lastName.length >= 2,
  });
}
