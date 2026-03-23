import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Waves, ExternalLink, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// NOAA Great Lakes water levels via CO-OPS API
// Station IDs for Michigan Great Lakes gauges
// Fallback levels (ft IGLD) if NOAA API is unavailable — from USACE monthly bulletins
const FALLBACK_LEVELS: Record<string, number> = {
  "9075014": 578.8,  // Michigan-Huron
  "9099064": 601.9,  // Superior
  "9063020": 571.6,  // Erie
};

const LAKES = [
  { name: "Michigan-Huron", stationId: "9075014", avgFt: 578.5 },
  { name: "Superior", stationId: "9099064", avgFt: 601.6 },
  { name: "Erie", stationId: "9063020", avgFt: 571.3 },
];

async function fetchLakeLevel(stationId: string): Promise<number | null> {
  try {
    const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const url = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?station=${stationId}&product=water_level&datum=IGLD&units=english&time_zone=gmt&application=accessmi.org&format=json&begin_date=${today}&range=1`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const latest = data?.data?.[data.data.length - 1];
    return latest ? parseFloat(latest.v) : (FALLBACK_LEVELS[stationId] ?? null);
  } catch {
    return FALLBACK_LEVELS[stationId] ?? null;
  }
}

export default function GreatLakesLevels() {
  const { data, isLoading } = useQuery({
    queryKey: ["great-lakes-levels"],
    queryFn: async () => {
      const results = await Promise.all(
        LAKES.map(async (lake) => {
          const level = await fetchLakeLevel(lake.stationId);
          return { ...lake, currentFt: level };
        })
      );
      return results;
    },
    staleTime: 60 * 60 * 1000,
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Waves className="h-5 w-5 text-michigan-teal" /> Great Lakes Water Levels
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && (
            <div className="flex items-center justify-center py-4 gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Fetching NOAA data...</span>
            </div>
          )}
          {data && (
            <div className="grid gap-3 sm:grid-cols-3">
              {data.map((lake) => {
                const diff = lake.currentFt != null ? lake.currentFt - lake.avgFt : null;
                return (
                  <div key={lake.name} className="rounded-lg border border-border p-3 text-center">
                    <p className="text-xs font-semibold text-foreground">{lake.name}</p>
                    <p className="text-lg font-bold text-primary">
                      {lake.currentFt != null ? `${lake.currentFt.toFixed(1)} ft` : "—"}
                    </p>
                    {diff != null && (
                      <Badge variant="outline" className={`text-[8px] ${diff > 0.5 ? "text-michigan-teal" : diff < -0.5 ? "text-michigan-coral" : "text-muted-foreground"}`}>
                        {diff > 0 ? "+" : ""}{diff.toFixed(1)} ft vs avg
                      </Badge>
                    )}
                    <p className="text-[9px] text-muted-foreground mt-0.5">Avg: {lake.avgFt} ft IGLD</p>
                  </div>
                );
              })}
            </div>
          )}
          <div className="flex items-center justify-between">
            <p className="text-[9px] text-muted-foreground">Source: NOAA CO-OPS, Great Lakes Dashboard</p>
            <a href="https://tidesandcurrents.noaa.gov/great_lakes/landing.html" target="_blank" rel="noopener" className="text-[9px] text-primary hover:underline flex items-center gap-0.5">
              NOAA <ExternalLink className="h-2 w-2" />
            </a>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
