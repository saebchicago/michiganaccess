import { useQuery } from "@tanstack/react-query";

export type ArcGISLayer =
  | "county-boundaries"
  | "mdot-workzones"
  | "egle-air"
  | "ev-stations";

interface ArcGISResponse {
  data: GeoJSON.FeatureCollection;
  cached: boolean;
  cached_at?: string;
  fetched_at?: string;
}

export function useArcGISData(layer: ArcGISLayer, enabled = true) {
  return useQuery({
    queryKey: ["arcgis", layer],
    queryFn: async (): Promise<ArcGISResponse> => {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/arcgis-proxy?layer=${layer}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`ArcGIS proxy error: ${response.status}`);
      }

      return response.json();
    },
    enabled,
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
    retry: 1,
  });
}
