import { useState, useCallback } from "react";
import { resolveLocation } from "@/data/michigan-county-seats";

const NPI_BASE = "https://npiregistry.cms.hhs.gov/api/?version=2.1&state=MI&limit=50";

export interface NPIProvider {
  npi: string;
  name: string;
  credential: string;
  specialty: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  isOrganization: boolean;
}

interface NPIAddress {
  address_1: string;
  city: string;
  state: string;
  postal_code: string;
  telephone_number: string;
  address_purpose: string;
}

interface NPIResult {
  number: number;
  basic: {
    first_name?: string;
    last_name?: string;
    credential?: string;
    organization_name?: string;
    gender?: string;
    enumeration_type?: string;
  };
  taxonomies?: { desc: string; primary: boolean }[];
  addresses?: NPIAddress[];
  enumeration_type?: string;
}

function parseResult(r: NPIResult): NPIProvider {
  const isOrg = r.enumeration_type === "NPI-2" || !!r.basic.organization_name;
  const locAddr = r.addresses?.find((a) => a.address_purpose === "LOCATION") || r.addresses?.[0];

  return {
    npi: String(r.number),
    name: isOrg
      ? r.basic.organization_name || "Unknown Organization"
      : `${r.basic.first_name || ""} ${r.basic.last_name || ""}`.trim(),
    credential: r.basic.credential || "",
    specialty: r.taxonomies?.[0]?.desc || "General",
    gender: r.basic.gender || "",
    address: locAddr?.address_1 || "",
    city: locAddr?.city || "",
    state: locAddr?.state || "MI",
    zip: (locAddr?.postal_code || "").slice(0, 5),
    phone: locAddr?.telephone_number || "",
    isOrganization: isOrg,
  };
}

export function useNPISearch() {
  const [results, setResults] = useState<NPIProvider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const search = useCallback(async (
    taxonomies: string[],
    enumerationType: string,
    location: string,
  ) => {
    setIsLoading(true);
    setError(null);
    setSearched(true);
    setResults([]);

    const locParams = resolveLocation(location);
    const locStr = Object.entries(locParams)
      .map(([k, v]) => `&${k}=${encodeURIComponent(v)}`)
      .join("");

    try {
      // Run all taxonomy queries in parallel
      const fetches = taxonomies.map(async (tax) => {
        const url = `${NPI_BASE}&taxonomy_description=${encodeURIComponent(tax)}&enumeration_type=${enumerationType}${locStr}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`NPI API error: ${res.status}`);
        const data = await res.json();
        return (data.results || []) as NPIResult[];
      });

      const allResults = await Promise.all(fetches);
      const merged = allResults.flat();

      // Deduplicate by NPI number
      const seen = new Set<string>();
      const unique = merged.filter((r) => {
        const npi = String(r.number);
        if (seen.has(npi)) return false;
        seen.add(npi);
        return true;
      });

      setResults(unique.map(parseResult));
    } catch (e) {
      setError("Something went wrong. Try again, or call 2-1-1 for help.");
      console.error("NPI search error:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResults([]);
    setError(null);
    setSearched(false);
  }, []);

  return { results, isLoading, error, searched, search, reset };
}
