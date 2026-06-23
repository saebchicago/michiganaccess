import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Download, Filter, ArrowRight, Info, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { COUNTY_PROFILES, getCountyProfile, type CountyProfile } from "@/data/michigan-county-profiles";

type Metric = "uninsured" | "foodInsecurity" | "pcpRatio";

const METRICS: { id: Metric; label: string; unit: string; description: string; higherIsBad: boolean }[] = [
  { id: "uninsured", label: "Uninsured Rate", unit: "%", description: "% of population without health insurance", higherIsBad: true },
  { id: "foodInsecurity", label: "Food Insecurity", unit: "%", description: "% of population experiencing food insecurity", higherIsBad: true },
  { id: "pcpRatio", label: "Primary Care Ratio", unit: ":1", description: "Population per primary care physician", higherIsBad: true },
];

// Color scale: 5-stop gradient from green (good) to red (bad)
const HEATMAP_COLORS = [
  "hsl(145, 50%, 40%)",  // Best
  "hsl(80, 45%, 50%)",   // Good
  "hsl(45, 80%, 55%)",   // Average
  "hsl(20, 80%, 55%)",   // Concerning
  "hsl(0, 70%, 50%)",    // Critical
];

function parseMetricValue(county: string, metric: Metric): number | null {
  const profile = getCountyProfile(county);
  if (!profile.healthHighlights?.length) return null;

  switch (metric) {
    case "uninsured": {
      const v = profile.healthHighlights[0]?.value;
      const n = parseFloat(v?.replace(/[^0-9.]/g, "") || "");
      return isNaN(n) ? null : n;
    }
    case "foodInsecurity": {
      const v = profile.healthHighlights[2]?.value;
      const n = parseFloat(v?.replace(/[^0-9.]/g, "") || "");
      return isNaN(n) ? null : n;
    }
    case "pcpRatio": {
      const v = profile.healthHighlights[1]?.value;
      if (!v || v === "-" || v === "Varies") return null;
      const n = parseFloat(v.replace(/[,:]/g, "").split(":")[0] || "");
      return isNaN(n) ? null : n;
    }
    default:
      return null;
  }
}

function getColorIndex(value: number, min: number, max: number): number {
  if (max === min) return 2;
  const ratio = (value - min) / (max - min);
  return Math.min(4, Math.floor(ratio * 5));
}

function formatValue(value: number, metric: Metric): string {
  if (metric === "pcpRatio") return `${value.toLocaleString()}:1`;
  return `${value}%`;
}

interface CountyEntry {
  name: string;
  value: number | null;
  profile: CountyProfile;
}

export default function CountyChoropleth({ compact = false, highlightCounty }: { compact?: boolean; highlightCounty?: string }) {
  const [metric, setMetric] = useState<Metric>("uninsured");
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | "urban" | "suburban" | "rural">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const activeHighlight = searchQuery
    ? Object.keys(COUNTY_PROFILES).find(n => n.toLowerCase().startsWith(searchQuery.toLowerCase())) ?? highlightCounty
    : highlightCounty;

  const metricConfig = METRICS.find(m => m.id === metric)!;

  const countyData = useMemo(() => {
    const entries: CountyEntry[] = Object.entries(COUNTY_PROFILES).map(([name, profile]) => ({
      name,
      value: parseMetricValue(name, metric),
      profile,
    }));
    return entries.filter(e => e.value !== null && (typeFilter === "all" || e.profile.countyType === typeFilter));
  }, [metric, typeFilter]);

  const { min, max, sortedData } = useMemo(() => {
    const values = countyData.filter(d => d.value !== null).map(d => d.value!);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const sortedData = [...countyData].sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
    return { min, max, sortedData };
  }, [countyData]);

  const hoveredData = hoveredCounty ? countyData.find(c => c.name === hoveredCounty) : null;

  const downloadCSV = useCallback(() => {
    const header = `County,Type,Population,${metricConfig.label}\n`;
    const rows = sortedData.map(d =>
      `"${d.name}",${d.profile.countyType},${d.profile.population},${formatValue(d.value!, metric)}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `michigan-${metric}-by-county.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sortedData, metric, metricConfig]);

  const legendLabels = useMemo(() => {
    if (countyData.length === 0) return [];
    const step = (max - min) / 5;
    return HEATMAP_COLORS.map((color, i) => {
      const low = min + step * i;
      const high = min + step * (i + 1);
      return {
        color,
        label: metric === "pcpRatio"
          ? `${Math.round(low).toLocaleString()}–${Math.round(high).toLocaleString()}`
          : `${low.toFixed(1)}–${high.toFixed(1)}%`,
      };
    });
  }, [min, max, metric, countyData]);

  const topCounties = sortedData.slice(0, 5);
  const bottomCounties = [...sortedData].reverse().slice(0, 5);

  return (
    <Card className="overflow-hidden">
      <CardHeader className={compact ? "pb-2" : ""}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              County Health Heatmap
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {metricConfig.description} across Michigan's 83 counties
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                placeholder="Find county…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[140px] h-8 text-xs pl-7"
                aria-label="Search for a county"
              />
            </div>
            <Select value={metric} onValueChange={(v) => setMetric(v as Metric)}>
              <SelectTrigger className="w-[160px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METRICS.map(m => (
                  <SelectItem key={m.id} value={m.id} className="text-xs">{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!compact && (
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
                <SelectTrigger className="w-[120px] h-8 text-xs">
                  <Filter className="h-3 w-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Types</SelectItem>
                  <SelectItem value="urban" className="text-xs">Urban</SelectItem>
                  <SelectItem value="suburban" className="text-xs">Suburban</SelectItem>
                  <SelectItem value="rural" className="text-xs">Rural</SelectItem>
                </SelectContent>
              </Select>
            )}
            {!compact && (
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={downloadCSV}>
                <Download className="h-3 w-3" /> CSV
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className={compact ? "pt-0" : ""}>
        {/* Color Legend */}
        <div className="flex items-center gap-1 mb-4">
          <span className="text-[10px] text-michigan-forest-deep font-medium">Best</span>
          <div className="flex flex-1 h-3 rounded-full overflow-hidden">
            {legendLabels.map((l, i) => (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <div className="flex-1 cursor-help" style={{ background: l.color }} />
                </TooltipTrigger>
                <TooltipContent className="text-xs">{l.label}</TooltipContent>
              </Tooltip>
            ))}
          </div>
          <span className="text-[10px] text-michigan-coral-deep font-medium">Critical</span>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-[3px] mb-5" role="grid" aria-label={`County heatmap showing ${metricConfig.label}`}>
          {sortedData.map((d) => {
            const colorIdx = getColorIndex(d.value!, min, max);
            const isHovered = hoveredCounty === d.name;
            // Pattern overlay for colorblind accessibility
            const patternStyle = colorIdx >= 3
              ? { backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)` }
              : colorIdx <= 1
              ? { backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(255,255,255,0.15) 3px, rgba(255,255,255,0.15) 5px)` }
              : {};
            return (
              <Tooltip key={d.name}>
                <TooltipTrigger asChild>
                  <Link
                    to={`/county/${d.name.toLowerCase().replace(/[.\s]+/g, "-")}`}
                    className="block"
                    onMouseEnter={() => setHoveredCounty(d.name)}
                    onMouseLeave={() => setHoveredCounty(null)}
                  >
                    <motion.div
                      className="relative rounded-sm cursor-pointer transition-shadow"
                      style={{
                        background: HEATMAP_COLORS[colorIdx],
                        aspectRatio: "1",
                        boxShadow: isHovered
                          ? "0 0 0 2px hsl(var(--primary))"
                          : activeHighlight && d.name === activeHighlight
                          ? "0 0 0 3px hsl(var(--primary)), 0 0 8px hsl(var(--primary) / 0.4)"
                          : "none",
                        ...patternStyle,
                      }}
                      whileHover={{ scale: 1.15, zIndex: 10 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      role="gridcell"
                      aria-label={`${d.name} County: ${formatValue(d.value!, metric)} - rank ${sortedData.indexOf(d) + 1} of ${sortedData.length}`}
                    >
                      <span className="absolute inset-0 flex items-center justify-center text-[7px] sm:text-[8px] font-bold text-white/90 leading-none text-center px-0.5 drop-shadow-sm">
                        {d.name.length > 6 ? d.name.substring(0, 5) + "…" : d.name}
                      </span>
                    </motion.div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent className="text-xs">
                  <p className="font-semibold">{d.name} County</p>
                  <p>{metricConfig.label}: <strong>{formatValue(d.value!, metric)}</strong></p>
                  <p className="text-muted-foreground">Pop: {d.profile.population.toLocaleString()} · {d.profile.countyType}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Top/Bottom counties */}
        {!compact && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-michigan-coral-deep mb-2 flex items-center gap-1">
                <Info className="h-3 w-3" /> Highest {metricConfig.label} (Most Need)
              </p>
              <div className="space-y-1">
                {topCounties.map((d, i) => (
                  <Link key={d.name} to={`/county/${d.name.toLowerCase().replace(/[.\s]+/g, "-")}`}
                    className="flex items-center justify-between px-2 py-1.5 rounded-md bg-michigan-coral/5 hover:bg-michigan-coral/10 transition-colors text-xs group">
                    <span className="flex items-center gap-2">
                      <span className="font-bold text-michigan-coral-deep w-4">{i + 1}</span>
                      <span className="text-foreground group-hover:text-michigan-coral-deep transition-colors">{d.name}</span>
                      <Badge variant="outline" className="text-[9px] h-4">{d.profile.countyType}</Badge>
                    </span>
                    <span className="font-semibold text-michigan-coral-deep">{formatValue(d.value!, metric)}</span>
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-michigan-forest-deep mb-2 flex items-center gap-1">
                <Info className="h-3 w-3" /> Lowest {metricConfig.label} (Best Outcomes)
              </p>
              <div className="space-y-1">
                {bottomCounties.map((d, i) => (
                  <Link key={d.name} to={`/county/${d.name.toLowerCase().replace(/[.\s]+/g, "-")}`}
                    className="flex items-center justify-between px-2 py-1.5 rounded-md bg-michigan-forest/5 hover:bg-michigan-forest/10 transition-colors text-xs group">
                    <span className="flex items-center gap-2">
                      <span className="font-bold text-michigan-forest-deep w-4">{i + 1}</span>
                      <span className="text-foreground group-hover:text-michigan-forest-deep transition-colors">{d.name}</span>
                      <Badge variant="outline" className="text-[9px] h-4">{d.profile.countyType}</Badge>
                    </span>
                    <span className="font-semibold text-michigan-forest-deep">{formatValue(d.value!, metric)}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {compact && (
          <div className="flex justify-center mt-2">
            <Button asChild size="sm" variant="outline" className="text-xs gap-1">
              <Link to="/data">
                Explore Full Dashboard <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        )}

        <p className="text-[10px] text-muted-foreground mt-4">
          Source: County Health Rankings & Roadmaps, 2025 edition, CDC BRFSS, USDA Food Environment Atlas. Click any county to view its full profile.
        </p>
      </CardContent>
    </Card>
  );
}
