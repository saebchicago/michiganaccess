/**
 * Live Air Quality Card — fetches real-time AQI data from the airnow-proxy edge function.
 * Shows localized AQI for the nearest station to the user's place, with health alert banner when AQI > 100.
 */
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Wind, AlertTriangle, ShieldCheck, Loader2, ExternalLink, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAirQuality, type AQIStation, AQI_COLORS } from "@/hooks/useAirQuality";

interface Props {
  zipCode?: string;
  city?: string;
  county?: string;
}

const SENSITIVE_PRECAUTIONS = [
  "Limit prolonged outdoor exertion, especially children and older adults.",
  "People with asthma or heart disease should reduce outdoor activity.",
  "Keep windows closed and use air filters if available.",
  "Check AirNow.gov for hourly updates in your area.",
  "Contact your local MDHHS office for health guidance.",
];

function findNearestStations(stations: AQIStation[], city?: string, county?: string): AQIStation[] {
  if (!stations.length) return [];

  // Try exact city match first
  if (city) {
    const cityMatch = stations.filter(s => s.city?.toLowerCase() === city.toLowerCase());
    if (cityMatch.length) return cityMatch.slice(0, 3);
  }

  // Return top 3 by AQI (most relevant)
  return [...stations].sort((a, b) => b.aqi - a.aqi).slice(0, 5);
}

function getAQILabel(aqi: number): { label: string; color: string; textColor: string } {
  if (aqi <= 50) return { label: "Good", color: "bg-emerald-100 dark:bg-emerald-900/30", textColor: "text-emerald-800 dark:text-emerald-300" };
  if (aqi <= 100) return { label: "Moderate", color: "bg-yellow-100 dark:bg-yellow-900/30", textColor: "text-yellow-800 dark:text-yellow-300" };
  if (aqi <= 150) return { label: "Unhealthy for Sensitive Groups", color: "bg-orange-100 dark:bg-orange-900/30", textColor: "text-orange-800 dark:text-orange-300" };
  if (aqi <= 200) return { label: "Unhealthy", color: "bg-red-100 dark:bg-red-900/30", textColor: "text-red-800 dark:text-red-300" };
  if (aqi <= 300) return { label: "Very Unhealthy", color: "bg-purple-100 dark:bg-purple-900/30", textColor: "text-purple-800 dark:text-purple-300" };
  return { label: "Hazardous", color: "bg-rose-200 dark:bg-rose-900/30", textColor: "text-rose-900 dark:text-rose-300" };
}

export default function LiveEnvironmentalCard({ zipCode, city, county }: Props) {
  const { data, isLoading, isError } = useAirQuality();

  const nearbyStations = useMemo(() => {
    if (!data?.stations) return [];
    return findNearestStations(data.stations, city, county);
  }, [data, city, county]);

  const maxAQI = useMemo(() => {
    if (!nearbyStations.length) return 0;
    return Math.max(...nearbyStations.map(s => s.aqi));
  }, [nearbyStations]);

  const isAlert = maxAQI > 100;
  const aqiInfo = getAQILabel(maxAQI);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading air quality data…</span>
        </CardContent>
      </Card>
    );
  }

  if (isError || !nearbyStations.length) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Wind className="h-4 w-4" />
            <p className="text-sm">Air quality data temporarily unavailable. Check <a href="https://www.airnow.gov/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">AirNow.gov</a> directly.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Health Alert Banner when AQI > 100 */}
      {isAlert && (
        <div className="mb-3 rounded-lg border-2 border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-bold text-red-800 dark:text-red-300 text-sm">
                Community Health Alert — Air Quality {aqiInfo.label}
              </h3>
              <p className="text-xs text-red-700 dark:text-red-400">
                Current AQI is {maxAQI}, which is {aqiInfo.label.toLowerCase()}. MDHHS recommends the following precautions:
              </p>
              <Accordion type="single" collapsible>
                <AccordionItem value="precautions" className="border-red-200 dark:border-red-800">
                  <AccordionTrigger className="text-xs font-semibold text-red-800 dark:text-red-300 py-2">
                    <Heart className="h-3.5 w-3.5 mr-1.5" /> Protect Your Lungs — Precautions for Sensitive Groups
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1.5">
                      {SENSITIVE_PRECAUTIONS.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-red-700 dark:text-red-400">
                          <span className="h-1 w-1 rounded-full bg-red-500 shrink-0 mt-1.5" />
                          {p}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3">
                      <Button size="sm" variant="outline" asChild className="text-xs border-red-300 dark:border-red-700">
                        <a href="https://www.michigan.gov/mdhhs/keep-mi-healthy/environmental-health" target="_blank" rel="noopener noreferrer">
                          MDHHS Environmental Health <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      )}

      <Card className={isAlert ? "border-red-200 dark:border-red-800" : ""}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wind className="h-4 w-4 text-primary" />
            Live Air Quality
            <Badge variant="outline" className={`text-[10px] ml-auto ${aqiInfo.color} ${aqiInfo.textColor} border-0`}>
              AQI {maxAQI} — {aqiInfo.label}
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs">
            Real-time data from EPA monitoring stations near {city || county || "your area"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Station readings */}
          <div className="space-y-2">
            {nearbyStations.map(station => {
              const info = getAQILabel(station.aqi);
              return (
                <div key={station.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{station.name}</p>
                    <p className="text-[11px] text-muted-foreground">{station.parameter} · {station.city || "MI"}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: station.color }} />
                    <span className={`text-sm font-bold ${info.textColor}`}>{station.aqi}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">
                {data?.cached ? "Cached" : "Live"} · Updated {data?.fetched_at ? new Date(data.fetched_at).toLocaleTimeString() : "recently"}
              </span>
            </div>
            <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" asChild>
              <a href="https://www.airnow.gov/" target="_blank" rel="noopener noreferrer">
                AirNow.gov <ExternalLink className="h-2.5 w-2.5 ml-1" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
