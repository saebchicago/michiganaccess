import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { MICHIGAN_REGIONS, type MichiganRegion } from "@/data/michigan-regions";

export const MICHIGAN_COUNTIES = [
  "Alcona", "Alger", "Allegan", "Alpena", "Antrim", "Arenac", "Baraga", "Barry",
  "Bay", "Benzie", "Berrien", "Branch", "Calhoun", "Cass", "Charlevoix", "Cheboygan",
  "Chippewa", "Clare", "Clinton", "Crawford", "Delta", "Dickinson", "Eaton", "Emmet",
  "Genesee", "Gladwin", "Gogebic", "Grand Traverse", "Gratiot", "Hillsdale", "Houghton",
  "Huron", "Ingham", "Ionia", "Iosco", "Iron", "Isabella", "Jackson", "Kalamazoo",
  "Kalkaska", "Kent", "Keweenaw", "Lake", "Lapeer", "Leelanau", "Lenawee", "Livingston",
  "Luce", "Mackinac", "Macomb", "Manistee", "Marquette", "Mason", "Mecosta", "Menominee",
  "Midland", "Missaukee", "Monroe", "Montcalm", "Montmorency", "Muskegon", "Newaygo",
  "Oakland", "Oceana", "Ogemaw", "Ontonagon", "Osceola", "Oscoda", "Otsego", "Ottawa",
  "Presque Isle", "Roscommon", "Saginaw", "Sanilac", "Schoolcraft", "Shiawassee",
  "St. Clair", "St. Joseph", "Tuscola", "Van Buren", "Washtenaw", "Wayne", "Wexford",
] as const;

export type MichiganCounty = (typeof MICHIGAN_COUNTIES)[number];

export type Audience = "resident" | "health-system" | "policymaker";

export interface EligibilityProfile {
  householdSize: number | null;
  annualIncome: number | null;
  /** Computed FPL percentage, null if inputs missing */
  fplPercent: number | null;
}

interface CountyContextValue {
  county: MichiganCounty | null;
  setCounty: (county: MichiganCounty | null) => void;
  countyLabel: string;
  region: MichiganRegion | null;
  setRegion: (region: MichiganRegion | null) => void;
  activeCounties: MichiganCounty[];
  filterLabel: string;
  /** Persona / audience filter */
  audience: Audience | null;
  setAudience: (audience: Audience | null) => void;
  /** Eligibility profile for FPL-based filtering */
  eligibility: EligibilityProfile;
  setEligibility: (e: Partial<Pick<EligibilityProfile, "householdSize" | "annualIncome">>) => void;
  clearEligibility: () => void;
}

const CountyContext = createContext<CountyContextValue | undefined>(undefined);

const STORAGE_KEY = "michigan-access-county";
const REGION_STORAGE_KEY = "michigan-access-region";
const AUDIENCE_STORAGE_KEY = "mi-access-audience";
const ELIGIBILITY_STORAGE_KEY = "mi-access-eligibility";

/** 2024 Federal Poverty Level base + per-person increment */
const getFPLThreshold = (householdSize: number): number => {
  const base = 15060;
  const perPerson = 5380;
  return base + perPerson * (householdSize - 1);
};

export function CountyProvider({ children }: { children: ReactNode }) {
  const [county, setCountyState] = useState<MichiganCounty | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && (MICHIGAN_COUNTIES as readonly string[]).includes(stored)) {
        return stored as MichiganCounty;
      }
    } catch {}
    return null;
  });

  const [region, setRegionState] = useState<MichiganRegion | null>(() => {
    try {
      const stored = localStorage.getItem(REGION_STORAGE_KEY);
      if (stored) {
        const found = MICHIGAN_REGIONS.find((r) => r.id === stored);
        return found ?? null;
      }
    } catch {}
    return null;
  });

  const [audience, setAudienceState] = useState<Audience | null>(() => {
    try {
      return localStorage.getItem(AUDIENCE_STORAGE_KEY) as Audience | null;
    } catch {
      return null;
    }
  });

  const [eligibilityInputs, setEligibilityInputs] = useState<{
    householdSize: number | null;
    annualIncome: number | null;
  }>(() => {
    try {
      const stored = localStorage.getItem(ELIGIBILITY_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return { householdSize: null, annualIncome: null };
  });

  // Persist county
  useEffect(() => {
    try {
      if (county) localStorage.setItem(STORAGE_KEY, county);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, [county]);

  // Persist region
  useEffect(() => {
    try {
      if (region) localStorage.setItem(REGION_STORAGE_KEY, region.id);
      else localStorage.removeItem(REGION_STORAGE_KEY);
    } catch {}
  }, [region]);

  // Persist audience
  useEffect(() => {
    try {
      if (audience) localStorage.setItem(AUDIENCE_STORAGE_KEY, audience);
      else localStorage.removeItem(AUDIENCE_STORAGE_KEY);
    } catch {}
  }, [audience]);

  // Persist eligibility
  useEffect(() => {
    try {
      localStorage.setItem(ELIGIBILITY_STORAGE_KEY, JSON.stringify(eligibilityInputs));
    } catch {}
  }, [eligibilityInputs]);

  const setCounty = (c: MichiganCounty | null) => {
    setCountyState(c);
    if (c) setRegionState(null);
  };

  const setRegion = (r: MichiganRegion | null) => {
    setRegionState(r);
    if (r) setCountyState(null);
  };

  const setAudience = (a: Audience | null) => {
    setAudienceState(a);
  };

  const setEligibility = (partial: Partial<Pick<EligibilityProfile, "householdSize" | "annualIncome">>) => {
    setEligibilityInputs((prev) => ({ ...prev, ...partial }));
  };

  const clearEligibility = () => {
    setEligibilityInputs({ householdSize: null, annualIncome: null });
  };

  // Compute FPL percentage
  const fplPercent =
    eligibilityInputs.householdSize && eligibilityInputs.annualIncome
      ? Math.round((eligibilityInputs.annualIncome / getFPLThreshold(eligibilityInputs.householdSize)) * 100)
      : null;

  const eligibility: EligibilityProfile = {
    ...eligibilityInputs,
    fplPercent,
  };

  const countyLabel = county ? `${county} County` : "All Michigan";

  const filterLabel = county
    ? `${county} County`
    : region
    ? region.name
    : "All Michigan";

  const activeCounties: MichiganCounty[] = county
    ? [county]
    : region
    ? region.counties
    : [...MICHIGAN_COUNTIES];

  return (
    <CountyContext.Provider
      value={{
        county, setCounty, countyLabel,
        region, setRegion,
        activeCounties, filterLabel,
        audience, setAudience,
        eligibility, setEligibility, clearEligibility,
      }}
    >
      {children}
    </CountyContext.Provider>
  );
}

export function useCounty() {
  const ctx = useContext(CountyContext);
  if (!ctx) throw new Error("useCounty must be used within CountyProvider");
  return ctx;
}
