import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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

interface CountyContextValue {
  county: MichiganCounty | null;
  setCounty: (county: MichiganCounty | null) => void;
  countyLabel: string;
}

const CountyContext = createContext<CountyContextValue | undefined>(undefined);

const STORAGE_KEY = "michigan-access-county";

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

  useEffect(() => {
    try {
      if (county) {
        localStorage.setItem(STORAGE_KEY, county);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {}
  }, [county]);

  const setCounty = (c: MichiganCounty | null) => setCountyState(c);
  const countyLabel = county ? `${county} County` : "All Michigan";

  return (
    <CountyContext.Provider value={{ county, setCounty, countyLabel }}>
      {children}
    </CountyContext.Provider>
  );
}

export function useCounty() {
  const ctx = useContext(CountyContext);
  if (!ctx) throw new Error("useCounty must be used within CountyProvider");
  return ctx;
}
