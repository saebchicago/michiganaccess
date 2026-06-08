import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { MICHIGAN_REGIONS, type MichiganRegion } from "@/data/michigan-regions";
import { zipToCounty } from "@/data/michigan-county-seats";

export const MICHIGAN_COUNTIES = [
  "Alcona",
  "Alger",
  "Allegan",
  "Alpena",
  "Antrim",
  "Arenac",
  "Baraga",
  "Barry",
  "Bay",
  "Benzie",
  "Berrien",
  "Branch",
  "Calhoun",
  "Cass",
  "Charlevoix",
  "Cheboygan",
  "Chippewa",
  "Clare",
  "Clinton",
  "Crawford",
  "Delta",
  "Dickinson",
  "Eaton",
  "Emmet",
  "Genesee",
  "Gladwin",
  "Gogebic",
  "Grand Traverse",
  "Gratiot",
  "Hillsdale",
  "Houghton",
  "Huron",
  "Ingham",
  "Ionia",
  "Iosco",
  "Iron",
  "Isabella",
  "Jackson",
  "Kalamazoo",
  "Kalkaska",
  "Kent",
  "Keweenaw",
  "Lake",
  "Lapeer",
  "Leelanau",
  "Lenawee",
  "Livingston",
  "Luce",
  "Mackinac",
  "Macomb",
  "Manistee",
  "Marquette",
  "Mason",
  "Mecosta",
  "Menominee",
  "Midland",
  "Missaukee",
  "Monroe",
  "Montcalm",
  "Montmorency",
  "Muskegon",
  "Newaygo",
  "Oakland",
  "Oceana",
  "Ogemaw",
  "Ontonagon",
  "Osceola",
  "Oscoda",
  "Otsego",
  "Ottawa",
  "Presque Isle",
  "Roscommon",
  "Saginaw",
  "Sanilac",
  "Schoolcraft",
  "Shiawassee",
  "St. Clair",
  "St. Joseph",
  "Tuscola",
  "Van Buren",
  "Washtenaw",
  "Wayne",
  "Wexford",
] as const;

export type MichiganCounty = (typeof MICHIGAN_COUNTIES)[number];

export type Audience = "resident" | "health-system";

export type SubPersona = "caregiver" | "immigrant" | "disabled";

/** Granularity level for current location selection */
export type GranularityLevel = "state" | "region" | "county" | "zip" | "tract";

/** Granular location fields stored alongside county */
export interface GranularLocation {
  zip: string | null;
  censusTract: string | null;
  /** The resolved county for this ZIP/tract (may differ from manually selected county) */
  resolvedCounty: MichiganCounty | null;
  granularity: GranularityLevel;
}

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
  /** Sub-persona tags (active within Resident persona) */
  subPersonas: SubPersona[];
  toggleSubPersona: (sp: SubPersona) => void;
  /** Eligibility profile for FPL-based filtering */
  eligibility: EligibilityProfile;
  setEligibility: (
    e: Partial<Pick<EligibilityProfile, "householdSize" | "annualIncome">>,
  ) => void;
  clearEligibility: () => void;
  /** Granular location (ZIP / census tract) */
  granularLocation: GranularLocation;
  setZip: (zip: string | null) => void;
  setCensusTract: (tract: string | null) => void;
  clearGranularLocation: () => void;
  /** Best available location label for display */
  locationLabel: string;
  /** Current granularity level */
  granularity: GranularityLevel;
}

const CountyContext = createContext<CountyContextValue | undefined>(undefined);

const STORAGE_KEY = "michigan-access-county";
const REGION_STORAGE_KEY = "michigan-access-region";
const AUDIENCE_STORAGE_KEY = "mi-access-audience";
const ELIGIBILITY_STORAGE_KEY = "mi-access-eligibility";
const SUBPERSONA_STORAGE_KEY = "mi-access-subpersonas";
const GRANULAR_STORAGE_KEY = "mi-access-granular";

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
      const stored = localStorage.getItem(AUDIENCE_STORAGE_KEY);
      // Migrate: "policymaker" was a third persona; coerce to null
      if (stored === "policymaker") return null;
      return stored as Audience | null;
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

  const [subPersonas, setSubPersonas] = useState<SubPersona[]>(() => {
    try {
      const stored = localStorage.getItem(SUBPERSONA_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const [granularLoc, setGranularLoc] = useState<
    Omit<GranularLocation, "granularity">
  >(() => {
    try {
      const stored = localStorage.getItem(GRANULAR_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return { zip: null, censusTract: null, resolvedCounty: null };
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
      localStorage.setItem(
        ELIGIBILITY_STORAGE_KEY,
        JSON.stringify(eligibilityInputs),
      );
    } catch {}
  }, [eligibilityInputs]);

  // Persist sub-personas
  useEffect(() => {
    try {
      localStorage.setItem(SUBPERSONA_STORAGE_KEY, JSON.stringify(subPersonas));
    } catch {}
  }, [subPersonas]);

  // Persist granular location
  useEffect(() => {
    try {
      localStorage.setItem(GRANULAR_STORAGE_KEY, JSON.stringify(granularLoc));
    } catch {}
  }, [granularLoc]);

  // Setters are wrapped in useCallback so their identity is stable across
  // renders. Consumers that pass these into useEffect dep arrays
  // (CountyPage syncs the URL county into the context via such an
  // effect) would otherwise loop infinitely on every provider render.
  const setCounty = useCallback((c: MichiganCounty | null) => {
    setCountyState(c);
    if (c) {
      setRegionState(null);
      // Clear granular if switching county
      setGranularLoc({ zip: null, censusTract: null, resolvedCounty: null });
    }
  }, []);

  const setRegion = useCallback((r: MichiganRegion | null) => {
    setRegionState(r);
    if (r) {
      setCountyState(null);
      setGranularLoc({ zip: null, censusTract: null, resolvedCounty: null });
    }
  }, []);

  const setAudience = useCallback((a: Audience | null) => {
    setAudienceState(a);
  }, []);

  const toggleSubPersona = useCallback((sp: SubPersona) => {
    setSubPersonas((prev) =>
      prev.includes(sp) ? prev.filter((s) => s !== sp) : [...prev, sp],
    );
  }, []);

  const setEligibility = useCallback(
    (
      partial: Partial<
        Pick<EligibilityProfile, "householdSize" | "annualIncome">
      >,
    ) => {
      setEligibilityInputs((prev) => ({ ...prev, ...partial }));
    },
    [],
  );

  const clearEligibility = useCallback(() => {
    setEligibilityInputs({ householdSize: null, annualIncome: null });
  }, []);

  const setZip = useCallback((zip: string | null) => {
    if (zip) {
      const resolved = zipToCounty(zip) as MichiganCounty | null;
      setGranularLoc({ zip, censusTract: null, resolvedCounty: resolved });
      // Auto-set county context if resolved
      if (resolved) setCountyState(resolved);
    } else {
      setGranularLoc((prev) => ({
        ...prev,
        zip: null,
        resolvedCounty: prev.censusTract ? prev.resolvedCounty : null,
      }));
    }
  }, []);

  const setCensusTract = useCallback((tract: string | null) => {
    setGranularLoc((prev) => ({ ...prev, censusTract: tract }));
  }, []);

  const clearGranularLocation = useCallback(() => {
    setGranularLoc({ zip: null, censusTract: null, resolvedCounty: null });
  }, []);

  // Compute FPL percentage
  const fplPercent =
    eligibilityInputs.householdSize && eligibilityInputs.annualIncome
      ? Math.round(
          (eligibilityInputs.annualIncome /
            getFPLThreshold(eligibilityInputs.householdSize)) *
            100,
        )
      : null;

  const eligibility: EligibilityProfile = {
    ...eligibilityInputs,
    fplPercent,
  };

  // Determine granularity level
  const granularity: GranularityLevel = granularLoc.censusTract
    ? "tract"
    : granularLoc.zip
      ? "zip"
      : county
        ? "county"
        : region
          ? "region"
          : "state";

  const granularLocation: GranularLocation = {
    ...granularLoc,
    granularity,
  };

  const countyLabel = county ? `${county} County` : "All Michigan";

  // Best available location label
  const locationLabel = granularLoc.censusTract
    ? `Tract ${granularLoc.censusTract}`
    : granularLoc.zip
      ? `ZIP ${granularLoc.zip}${granularLoc.resolvedCounty ? ` · ${granularLoc.resolvedCounty} County` : ""}`
      : county
        ? `${county} County`
        : region
          ? region.name
          : "All Michigan";

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

  // Memoize the context value so consumers don't re-render on every
  // provider render. With the useCallback'd setters above, this object
  // only changes when an actual state value changes.
  const value = useMemo<CountyContextValue>(
    () => ({
      county,
      setCounty,
      countyLabel,
      region,
      setRegion,
      activeCounties,
      filterLabel,
      audience,
      setAudience,
      subPersonas,
      toggleSubPersona,
      eligibility,
      setEligibility,
      clearEligibility,
      granularLocation,
      setZip,
      setCensusTract,
      clearGranularLocation,
      locationLabel,
      granularity,
    }),
    [
      county,
      setCounty,
      countyLabel,
      region,
      setRegion,
      activeCounties,
      filterLabel,
      audience,
      setAudience,
      subPersonas,
      toggleSubPersona,
      eligibility,
      setEligibility,
      clearEligibility,
      granularLocation,
      setZip,
      setCensusTract,
      clearGranularLocation,
      locationLabel,
      granularity,
    ],
  );

  return (
    <CountyContext.Provider value={value}>{children}</CountyContext.Provider>
  );
}

export function useCounty() {
  const ctx = useContext(CountyContext);
  if (!ctx) throw new Error("useCounty must be used within CountyProvider");
  return ctx;
}
