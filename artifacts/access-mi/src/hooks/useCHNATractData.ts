import { useQuery } from "@tanstack/react-query";
import type { DataMode, IntegrityLabel } from "@/types/chna";

const PROXY_BASE =
  (import.meta.env.VITE_SUPABASE_URL ??
    "https://znahhtdbcgepezrxwnah.supabase.co") +
  "/functions/v1/chna-data-proxy";

const AUTH_HEADERS = {
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? ""}`,
  apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "",
};

async function fetchCHNA<T>(
  source: string,
  transform: (raw: unknown) => T[],
): Promise<T[]> {
  const resp = await fetch(`${PROXY_BASE}?source=${source}`, {
    headers: AUTH_HEADERS,
  });
  if (!resp.ok) throw new Error(`chna-data-proxy ${resp.status} for ${source}`);
  const json = await resp.json();
  return transform(json.data);
}

// ---------------------------------------------------------------------------
// EJScreen tracts (EPA EJScreen 2.32)  integrity: MODELED
// ---------------------------------------------------------------------------

export interface EJScreenTract {
  id: string;
  tractFips: string;
  county: string;
  pm25Percentile: number | null;
  ozonePercentile: number | null;
  airToxicsCancerRisk: number | null;
  trafficPercentile: number | null;
  lat: number;
  lng: number;
}

const EJSCREEN_FALLBACK: EJScreenTract[] = [
  {
    id: "261630001",
    tractFips: "26163000100",
    county: "Wayne",
    pm25Percentile: 84,
    ozonePercentile: 79,
    airToxicsCancerRisk: 35,
    trafficPercentile: 91,
    lat: 42.3314,
    lng: -83.0458,
  },
  {
    id: "261630025",
    tractFips: "26163002500",
    county: "Wayne",
    pm25Percentile: 76,
    ozonePercentile: 72,
    airToxicsCancerRisk: 28,
    trafficPercentile: 85,
    lat: 42.3584,
    lng: -83.0732,
  },
  {
    id: "261250101",
    tractFips: "26125010100",
    county: "Oakland",
    pm25Percentile: 58,
    ozonePercentile: 61,
    airToxicsCancerRisk: 19,
    trafficPercentile: 55,
    lat: 42.5783,
    lng: -83.2645,
  },
];

export const EJSCREEN_META: {
  integrityLabel: IntegrityLabel;
  source: string;
  vintage: string;
} = {
  integrityLabel: "MODELED",
  source: "EJScreen 2.32 (EPA)",
  vintage: "2023",
};

export function useEJScreenTracts(enabled = true): {
  data: EJScreenTract[];
  dataMode: DataMode;
} {
  const { data, isError } = useQuery({
    queryKey: ["chna-ejscreen"],
    queryFn: () =>
      fetchCHNA<EJScreenTract>("ejscreen", (raw: unknown) => {
        const features =
          (raw as { features?: { attributes: Record<string, unknown> }[] })
            ?.features ?? [];
        return features.map((f, i) => ({
          id: String(f.attributes.ID ?? i),
          tractFips: String(f.attributes.ID ?? "").substring(0, 11),
          county: String(f.attributes.CNTY_NAME ?? ""),
          pm25Percentile: (f.attributes.P_PM25 as number) ?? null,
          ozonePercentile: (f.attributes.P_OZONE as number) ?? null,
          airToxicsCancerRisk: (f.attributes.CANCER as number) ?? null,
          trafficPercentile: (f.attributes.P_TRAFFIC as number) ?? null,
          lat: (f.attributes.CENTROID_LAT as number) ?? 42.33,
          lng: (f.attributes.CENTROID_LON as number) ?? -83.05,
        }));
      }),
    enabled,
    staleTime: 4 * 60 * 60 * 1000,
    retry: 1,
  });

  const live = !isError && data != null && data.length > 0;
  return {
    data: live ? data : EJSCREEN_FALLBACK,
    dataMode: live ? "live" : "fallback",
  };
}

// ---------------------------------------------------------------------------
// AQS / AirNow PM2.5 monitors  integrity: VERIFIED
// ---------------------------------------------------------------------------

export interface AQSMonitor {
  id: string;
  name: string;
  lat: number;
  lng: number;
  pm25: number | null;
  aqi: number | null;
  provisional: boolean;
  city?: string;
}

const AQS_FALLBACK: AQSMonitor[] = [
  {
    id: "261630001-aqs",
    name: "Detroit East 7 Mile",
    lat: 42.4074,
    lng: -82.9965,
    pm25: 9.2,
    aqi: 38,
    provisional: false,
    city: "Detroit",
  },
  {
    id: "261630002-aqs",
    name: "Detroit Southwestern HS",
    lat: 42.3148,
    lng: -83.1191,
    pm25: 11.4,
    aqi: 47,
    provisional: false,
    city: "Detroit",
  },
  {
    id: "261250001-aqs",
    name: "Pontiac",
    lat: 42.6389,
    lng: -83.2911,
    pm25: 7.8,
    aqi: 32,
    provisional: false,
    city: "Pontiac",
  },
  {
    id: "260990001-aqs",
    name: "Macomb Township",
    lat: 42.6703,
    lng: -82.9136,
    pm25: 8.1,
    aqi: 34,
    provisional: false,
    city: "Macomb Twp",
  },
];

export const AQS_META: {
  integrityLabel: IntegrityLabel;
  source: string;
  vintage: string;
} = {
  integrityLabel: "VERIFIED",
  source: "EPA AirNow / AQS PM2.5 monitors",
  vintage: "current",
};

export function useAQSMonitors(enabled = true): {
  data: AQSMonitor[];
  dataMode: DataMode;
} {
  const { data, isError } = useQuery({
    queryKey: ["chna-aqs-monitors"],
    queryFn: async (): Promise<AQSMonitor[]> => {
      const url =
        (import.meta.env.VITE_SUPABASE_URL ??
          "https://znahhtdbcgepezrxwnah.supabase.co") +
        "/functions/v1/airnow-proxy";
      const resp = await fetch(url, { headers: AUTH_HEADERS });
      if (!resp.ok) throw new Error(`airnow-proxy ${resp.status}`);
      const json = await resp.json();
      return (json.stations ?? []).map(
        (s: {
          id: string;
          name: string;
          latitude: number;
          longitude: number;
          aqi: number;
          category: string;
          city?: string;
        }) => ({
          id: s.id,
          name: s.name,
          lat: s.latitude,
          lng: s.longitude,
          pm25: null,
          aqi: s.aqi,
          provisional: false,
          city: s.city,
        }),
      );
    },
    enabled,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });

  const live = !isError && data != null && data.length > 0;
  return {
    data: live ? data : AQS_FALLBACK,
    dataMode: live ? "live" : "fallback",
  };
}

// ---------------------------------------------------------------------------
// EGLE CSO outfalls  integrity: VERIFIED
// ---------------------------------------------------------------------------

export interface CSOOutfall {
  id: string;
  name: string;
  lat: number;
  lng: number;
  permitId?: string;
  waterBody?: string;
}

const CSO_FALLBACK: CSOOutfall[] = [
  {
    id: "cso-001",
    name: "Detroit River Outfall A",
    lat: 42.3314,
    lng: -83.0458,
    waterBody: "Detroit River",
  },
  {
    id: "cso-002",
    name: "Rouge River Outfall B",
    lat: 42.2731,
    lng: -83.1454,
    waterBody: "Rouge River",
  },
  {
    id: "cso-003",
    name: "Clinton River Outfall C",
    lat: 42.5803,
    lng: -82.9177,
    waterBody: "Clinton River",
  },
];

export const CSO_META: {
  integrityLabel: IntegrityLabel;
  source: string;
  vintage: string;
} = {
  integrityLabel: "VERIFIED",
  source: "EGLE CSO Outfall Inventory",
  vintage: "2023",
};

export function useCSOOutfalls(enabled = true): {
  data: CSOOutfall[];
  dataMode: DataMode;
} {
  const { data, isError } = useQuery({
    queryKey: ["chna-cso"],
    queryFn: () =>
      fetchCHNA<CSOOutfall>("cso", (raw: unknown) => {
        const features =
          (
            raw as {
              features?: {
                attributes: Record<string, unknown>;
                geometry?: { x: number; y: number };
              }[];
            }
          )?.features ?? [];
        return features.map((f, i) => ({
          id: String(f.attributes.OBJECTID ?? i),
          name: String(
            f.attributes.FACILITY_NAME ??
              f.attributes.PERMIT_ID ??
              `Outfall ${i + 1}`,
          ),
          lat: f.geometry?.y ?? 0,
          lng: f.geometry?.x ?? 0,
          permitId: String(f.attributes.PERMIT_ID ?? ""),
          waterBody: String(f.attributes.RECEIVING_WATER ?? ""),
        }));
      }),
    enabled,
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });

  const live = !isError && data != null && data.length > 0;
  return {
    data: live ? data : CSO_FALLBACK,
    dataMode: live ? "live" : "fallback",
  };
}

// ---------------------------------------------------------------------------
// EGLE PFAS sites  integrity: VERIFIED
// ---------------------------------------------------------------------------

export interface PFASSite {
  id: string;
  name: string;
  lat: number;
  lng: number;
  siteType?: string;
  status?: string;
}

const PFAS_FALLBACK: PFASSite[] = [
  {
    id: "pfas-001",
    name: "Wolverine Worldwide (Belmont)",
    lat: 43.0586,
    lng: -85.5979,
    siteType: "Industrial",
  },
  {
    id: "pfas-002",
    name: "Wurtsmith Air Force Base",
    lat: 44.4503,
    lng: -83.5233,
    siteType: "Military",
  },
  {
    id: "pfas-003",
    name: "Kalamazoo PFAS Site",
    lat: 42.2917,
    lng: -85.5872,
    siteType: "Industrial",
  },
];

export const PFAS_META: {
  integrityLabel: IntegrityLabel;
  source: string;
  vintage: string;
} = {
  integrityLabel: "VERIFIED",
  source: "EGLE PFAS Sites and Areas of Interest",
  vintage: "2024",
};

export function usePFASSites(enabled = true): {
  data: PFASSite[];
  dataMode: DataMode;
} {
  const { data, isError } = useQuery({
    queryKey: ["chna-pfas"],
    queryFn: () =>
      fetchCHNA<PFASSite>("pfas", (raw: unknown) => {
        const features =
          (
            raw as {
              features?: {
                attributes: Record<string, unknown>;
                geometry?: { x: number; y: number };
              }[];
            }
          )?.features ?? [];
        return features.map((f, i) => ({
          id: String(f.attributes.OBJECTID ?? i),
          name: String(
            f.attributes.SITE_NAME ?? f.attributes.NAME ?? `PFAS Site ${i + 1}`,
          ),
          lat: f.geometry?.y ?? 0,
          lng: f.geometry?.x ?? 0,
          siteType: String(f.attributes.SITE_TYPE ?? ""),
          status: String(f.attributes.STATUS ?? ""),
        }));
      }),
    enabled,
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });

  const live = !isError && data != null && data.length > 0;
  return {
    data: live ? data : PFAS_FALLBACK,
    dataMode: live ? "live" : "fallback",
  };
}

// ---------------------------------------------------------------------------
// FEMA National Risk Index tracts  integrity: MODELED
// ---------------------------------------------------------------------------

export interface NRITract {
  id: string;
  tractFips: string;
  county: string;
  riskRating: string | null;
  riskScore: number | null;
  socialVulnerability: number | null;
  lat: number;
  lng: number;
}

const NRI_FALLBACK: NRITract[] = [
  {
    id: "nri-26163-0001",
    tractFips: "26163000100",
    county: "Wayne",
    riskRating: "High",
    riskScore: 71.4,
    socialVulnerability: 0.82,
    lat: 42.3314,
    lng: -83.0458,
  },
  {
    id: "nri-26163-0025",
    tractFips: "26163002500",
    county: "Wayne",
    riskRating: "High",
    riskScore: 68.9,
    socialVulnerability: 0.79,
    lat: 42.3584,
    lng: -83.0732,
  },
  {
    id: "nri-26125-0101",
    tractFips: "26125010100",
    county: "Oakland",
    riskRating: "Relatively Moderate",
    riskScore: 41.2,
    socialVulnerability: 0.35,
    lat: 42.5783,
    lng: -83.2645,
  },
];

export const NRI_META: {
  integrityLabel: IntegrityLabel;
  source: string;
  vintage: string;
} = {
  integrityLabel: "MODELED",
  source: "FEMA National Risk Index",
  vintage: "2023",
};

export function useNRITracts(enabled = true): {
  data: NRITract[];
  dataMode: DataMode;
} {
  const { data, isError } = useQuery({
    queryKey: ["chna-nri"],
    queryFn: () =>
      fetchCHNA<NRITract>("nri", (raw: unknown) => {
        const features =
          (raw as { features?: { attributes: Record<string, unknown> }[] })
            ?.features ?? [];
        return features.map((f, i) => ({
          id: String(f.attributes.OBJECTID ?? i),
          tractFips: String(f.attributes.TRACTFIPS ?? ""),
          county: String(f.attributes.COUNTY ?? ""),
          riskRating: String(f.attributes.RISK_RATNG ?? "") || null,
          riskScore: (f.attributes.RISK_SCORE as number) ?? null,
          socialVulnerability: (f.attributes.SOVI_SCORE as number) ?? null,
          lat: (f.attributes.CENTROID_LAT as number) ?? 42.33,
          lng: (f.attributes.CENTROID_LON as number) ?? -83.05,
        }));
      }),
    enabled,
    staleTime: 7 * 24 * 60 * 60 * 1000,
    retry: 1,
  });

  const live = !isError && data != null && data.length > 0;
  return {
    data: live ? data : NRI_FALLBACK,
    dataMode: live ? "live" : "fallback",
  };
}

// ---------------------------------------------------------------------------
// Census ACS vehicle access (B08201)  integrity: VERIFIED (survey estimate)
// ---------------------------------------------------------------------------

export interface ACSTractVehicle {
  id: string;
  tractFips: string;
  county: string;
  totalHouseholds: number;
  noVehicleHouseholds: number;
  noVehiclePct: number;
  lat: number;
  lng: number;
}

const ACS_FALLBACK: ACSTractVehicle[] = [
  {
    id: "acs-26163-0001",
    tractFips: "26163000100",
    county: "Wayne",
    totalHouseholds: 1842,
    noVehicleHouseholds: 621,
    noVehiclePct: 33.7,
    lat: 42.3314,
    lng: -83.0458,
  },
  {
    id: "acs-26163-0025",
    tractFips: "26163002500",
    county: "Wayne",
    totalHouseholds: 2104,
    noVehicleHouseholds: 441,
    noVehiclePct: 21.0,
    lat: 42.3584,
    lng: -83.0732,
  },
  {
    id: "acs-26125-0101",
    tractFips: "26125010100",
    county: "Oakland",
    totalHouseholds: 1987,
    noVehicleHouseholds: 98,
    noVehiclePct: 4.9,
    lat: 42.5783,
    lng: -83.2645,
  },
];

export const ACS_META: {
  integrityLabel: IntegrityLabel;
  source: string;
  vintage: string;
} = {
  integrityLabel: "VERIFIED",
  source: "ACS 5-Year Estimates (Census B08201)",
  vintage: "2022",
};

export function useACSTract(enabled = true): {
  data: ACSTractVehicle[];
  dataMode: DataMode;
} {
  const { data, isError } = useQuery({
    queryKey: ["chna-acs-vehicle"],
    queryFn: () =>
      fetchCHNA<ACSTractVehicle>("census-acs", (raw: unknown) => {
        const rows = raw as string[][];
        if (!rows || rows.length < 2) return [];
        const [header, ...dataRows] = rows;
        const idx = (key: string) => header.indexOf(key);

        return dataRows.map((row) => {
          const total = parseInt(row[idx("B08201_001E")] ?? "0", 10);
          const noVeh = parseInt(row[idx("B08201_002E")] ?? "0", 10);
          const state = row[idx("state")] ?? "";
          const county = row[idx("county")] ?? "";
          const tract = row[idx("tract")] ?? "";
          return {
            id: `acs-${state}${county}-${tract}`,
            tractFips: `${state}${county}${tract}`,
            county: String(row[idx("NAME")] ?? ""),
            totalHouseholds: total,
            noVehicleHouseholds: noVeh,
            noVehiclePct:
              total > 0 ? Math.round((noVeh / total) * 1000) / 10 : 0,
            lat: 42.33,
            lng: -83.05,
          };
        });
      }),
    enabled,
    staleTime: 7 * 24 * 60 * 60 * 1000,
    retry: 1,
  });

  const live = !isError && data != null && data.length > 0;
  return {
    data: live ? data : ACS_FALLBACK,
    dataMode: live ? "live" : "fallback",
  };
}
