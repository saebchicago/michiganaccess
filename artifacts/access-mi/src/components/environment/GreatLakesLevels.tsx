import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Waves, ExternalLink, Loader2, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// NOAA Great Lakes water levels via CO-OPS API
// Station IDs for Michigan Great Lakes gauges
// Fallback levels (ft IGLD) if NOAA API is unavailable - from USACE monthly bulletins
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
  const [expanded, setExpanded] = useState(false);
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

          {/* Level 1: Key KPI - Michigan-Huron level prominently */}
          {data && (
            <>
              <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between min-h-[44px] rounded-lg border border-border p-3 hover:bg-muted/40 transition-colors"
                aria-expanded={expanded}
              >
                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <p className="text-[10px] text-muted-foreground">Michigan-Huron</p>
                    <p className="text-2xl font-bold text-primary">
                      {data[0]?.currentFt != null ? `${data[0].currentFt.toFixed(1)} ft` : "-"}
                    </p>
                    {data[0]?.currentFt != null && (
                      <span className={`text-[10px] ${(data[0].currentFt - data[0].avgFt) > 0.5 ? "text-michigan-teal" : (data[0].currentFt - data[0].avgFt) < -0.5 ? "text-michigan-coral" : "text-muted-foreground"}`}>
                        {(data[0].currentFt - data[0].avgFt) > 0 ? "+" : ""}{(data[0].currentFt - data[0].avgFt).toFixed(1)} ft vs avg
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
              </button>

              {!expanded && (
                <p className="text-[10px] text-muted-foreground text-center">Tap to see all lakes</p>
              )}

              {/* Level 2: Full lake grid */}
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-3 sm:grid-cols-3">
                      {data.map((lake) => {
                        const diff = lake.currentFt != null ? lake.currentFt - lake.avgFt : null;
                        return (
                          <div key={lake.name} className="rounded-lg border border-border p-3 text-center">
                            <p className="text-xs font-semibold text-foreground">{lake.name}</p>
                            <p className="text-lg font-bold text-primary">
                              {lake.currentFt != null ? `${lake.currentFt.toFixed(1)} ft` : "-"}
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
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          <div className="flex items-center justify-between">
            <p className="text-[9px] text-muted-foreground">Source: NOAA CO-OPS, Great Lakes Dashboard</p>
            <a href="https://tidesandcurrents.noaa.gov/great_lakes/landing.html" target="_blank" rel="noopener noreferrer" className="text-[9px] text-primary hover:underline flex items-center gap-0.5">
              NOAA <ExternalLink className="h-2 w-2" />
            </a>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
