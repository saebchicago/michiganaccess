// OpenStreetMap Overpass API - no key required
// Docs: overpass-api.de - rate limited, cache aggressively

import { useQuery } from "@tanstack/react-query";

export interface OSMAmenity {
  id: number;
  type: string;
  name: string;
  lat: number;
  lon: number;
  source: string;
}

export async function fetchOSMAmenities(
  lat: number,
  lon: number,
  radiusMeters: number = 5000,
  amenityTypes: string[] = ["hospital", "clinic", "pharmacy", "supermarket", "library", "school"]
): Promise<OSMAmenity[]> {
  try {
    const amenityFilter = amenityTypes
      .map(a => `node["amenity"="${a}"](around:${radiusMeters},${lat},${lon});`)
      .join("\n");

    const query = `[out:json][timeout:25];\n(\n${amenityFilter}\n);\nout body;`;

    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: `data=${encodeURIComponent(query)}`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    if (!res.ok) return [];
    const data = await res.json();

    return (data.elements || []).map((e: Record<string, unknown>) => ({
      id: e.id as number,
      type: (e.tags as Record<string, string>)?.amenity || "unknown",
      name: (e.tags as Record<string, string>)?.name || "Unnamed",
      lat: e.lat as number,
      lon: e.lon as number,
      source: "OpenStreetMap contributors",
    }));
  } catch {
    return [];
  }
}

export function useOSMAmenities(lat: number | null, lon: number | null, amenityTypes?: string[]) {
  return useQuery({
    queryKey: ["osm-amenities", lat, lon, amenityTypes?.join(",")],
    queryFn: () => lat && lon ? fetchOSMAmenities(lat, lon, 5000, amenityTypes) : Promise.resolve([]),
    enabled: !!lat && !!lon,
    staleTime: 1000 * 60 * 60 * 24 * 7,
    retry: 1,
  });
}
