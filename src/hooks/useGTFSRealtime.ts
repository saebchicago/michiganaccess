import { useQuery } from "@tanstack/react-query";

export interface VehiclePosition {
  id: string;
  latitude: number;
  longitude: number;
  bearing?: number;
  speed?: number;
  routeId?: string;
  tripId?: string;
  label?: string;
  timestamp?: number;
  agency: string;
  color: string;
}

interface GTFSRealtimeResponse {
  feed: string;
  agency: string;
  vehicles: VehiclePosition[];
  count: number;
  fetched_at: string;
  feed_timestamp: string | null;
}

export type GTFSFeed = "ddot" | "theride";

export function useGTFSRealtime(feed: GTFSFeed, enabled = true) {
  return useQuery({
    queryKey: ["gtfs-rt", feed],
    queryFn: async (): Promise<GTFSRealtimeResponse> => {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gtfs-rt-proxy?feed=${feed}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`GTFS-RT proxy error: ${response.status}`);
      }

      return response.json();
    },
    enabled,
    refetchInterval: 30_000, // 30-second auto-refresh
    staleTime: 15_000,
    gcTime: 60_000,
    retry: 1,
  });
}
