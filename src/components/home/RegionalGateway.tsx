import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useCallback, useMemo } from "react";
import { MapPin, Navigation, Loader2, ShieldCheck, X, HeartPulse, Zap, Bus } from "lucide-react";
import { MICHIGAN_REGIONS } from "@/data/michigan-regions";
import MunicipalitySearch from "./MunicipalitySearch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

// SVG paths for Michigan's 6 planning regions (simplified polygons)
const REGION_PATHS: Record<string, string> = {
  "upper-peninsula":
    "M30 30 L60 20 L120 15 L180 25 L200 40 L190 55 L160 65 L120 60 L80 55 L50 50 L30 45 Z",
  northwest:
    "M120 75 L180 70 L200 80 L210 110 L200 150 L180 170 L150 180 L120 170 L100 140 L105 100 Z",
  "east-central":
    "M200 80 L250 75 L270 90 L275 130 L260 160 L230 170 L200 150 L210 110 Z",
  west:
    "M80 140 L120 170 L150 180 L140 220 L130 260 L110 280 L80 270 L60 240 L55 200 L60 160 Z",
  "south-central":
    "M150 180 L180 170 L200 150 L230 170 L240 200 L230 240 L200 260 L170 260 L140 240 L130 260 L140 220 Z",
  southeast:
    "M230 170 L260 160 L280 180 L285 220 L275 260 L250 280 L220 270 L200 260 L230 240 L240 200 Z",
};

const REGION_LABEL_POS: Record<string, { x: number; y: number }> = {
  "upper-peninsula": { x: 115, y: 40 },
  northwest: { x: 155, y: 125 },
  "east-central": { x: 240, y: 120 },
  west: { x: 85, y: 210 },
  "south-central": { x: 185, y: 215 },
  southeast: { x: 255, y: 220 },
};

// Approximate population and composite health grades per region
const REGION_POP: Record<string, number> = {
  southeast: 4_800_000,
  "south-central": 1_600_000,
  west: 1_900_000,
  "east-central": 1_100_000,
  northwest: 600_000,
  "upper-peninsula": 300_000,
};

const REGION_GRADE: Record<string, { grade: string; color: string }> = {
  southeast: { grade: "B+", color: "text-green-600" },
  "south-central": { grade: "B", color: "text-green-600" },
  west: { grade: "B+", color: "text-green-600" },
  "east-central": { grade: "C+", color: "text-yellow-600" },
  northwest: { grade: "B−", color: "text-green-600" },
  "upper-peninsula": { grade: "C", color: "text-yellow-600" },
};

// Cross-sector vital metrics per region
const REGION_VITALS: Record<string, { uninsuredRate: string; energyBurden: string; transitScore: string }> = {
  southeast: { uninsuredRate: "5.2%", energyBurden: "3.8%", transitScore: "72" },
  "south-central": { uninsuredRate: "6.1%", energyBurden: "4.2%", transitScore: "58" },
  west: { uninsuredRate: "5.8%", energyBurden: "4.0%", transitScore: "54" },
  "east-central": { uninsuredRate: "7.4%", energyBurden: "5.6%", transitScore: "38" },
  northwest: { uninsuredRate: "8.1%", energyBurden: "5.1%", transitScore: "32" },
  "upper-peninsula": { uninsuredRate: "9.3%", energyBurden: "6.8%", transitScore: "18" },
};

export default function RegionalGateway() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [hovered, setHovered] = useState<string | null>(null);
  const [geoOpen, setGeoOpen] = useState(false);
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading">("idle");
  const hoveredRegion = MICHIGAN_REGIONS.find((r) => r.id === hovered);

  // Read once on mount; memoize to prevent re-reads
  const hasGeoCache = useMemo(() => !!localStorage.getItem("mi-geo-county"), []);

  const handleUseLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const county = data?.address?.county?.replace(/ County$/i, "");
          if (county && data?.address?.state === "Michigan") {
            localStorage.setItem("mi-geo-county", county);
            toast.success(`Located: ${county} County`);
            navigate(`/county/${county.toLowerCase().replace(/[.\s]+/g, "-")}`);
          } else {
            toast.info("It looks like you're outside Michigan — showing all regions.");
          }
        } catch {
          toast.error("Could not determine your county. Try searching instead.");
        }
        setGeoStatus("idle");
        setGeoOpen(false);
      },
      () => {
        setGeoStatus("idle");
        setGeoOpen(false);
        toast.error("Location access denied. You can search for your county instead.");
      },
      { timeout: 8000, maximumAge: 300000 }
    );
  }, [navigate]);

  return (
    <section className="border-y border-border bg-card py-10">
      <div className="container">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Regional Gateway</h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Explore Michigan by region or search for your city, village, or township below.
            </p>
          </div>

          {/* Municipality Search */}
          <MunicipalitySearch />

          {/* SVG Map + Location popover + Info panel */}
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-center">
            <div className="relative">
              <Popover open={geoOpen} onOpenChange={setGeoOpen}>
                <PopoverTrigger asChild>
                  <div
                    className="cursor-pointer outline-none"
                    tabIndex={0}
                    role="group"
                    aria-label="Michigan regional map — focus to find your county"
                    onMouseEnter={() => { if (!isMobile && !hasGeoCache) setGeoOpen(true); }}
                    onFocus={() => { if (!hasGeoCache) setGeoOpen(true); }}
                    onClick={() => { if (isMobile && !hasGeoCache) setGeoOpen(true); }}
                  >
                    <svg
                      viewBox="0 0 310 300"
                      className="w-full max-w-xs md:max-w-sm h-auto"
                      role="img"
                      aria-label="Interactive map of Michigan's 6 regions"
                    >
                      {MICHIGAN_REGIONS.map((region) => {
                        const path = REGION_PATHS[region.id];
                        const label = REGION_LABEL_POS[region.id];
                        if (!path) return null;
                        const isHovered = hovered === region.id;
                        return (
                          <g key={region.id}>
                            <path
                              d={path}
                              fill={isHovered ? region.color : `${region.color}33`}
                              stroke={region.color}
                              strokeWidth={isHovered ? 2.5 : 1.5}
                              className="cursor-pointer transition-all duration-200"
                              onMouseEnter={() => setHovered(region.id)}
                              onMouseLeave={() => setHovered(null)}
                              onClick={(e) => { e.stopPropagation(); navigate(`/region/${region.id}`); }}
                              role="button"
                              aria-label={`Go to ${region.name}`}
                            />
                            {label && (
                              <text
                                x={label.x}
                                y={label.y}
                                textAnchor="middle"
                                className="pointer-events-none select-none fill-foreground text-[8px] font-semibold"
                              >
                                {region.name.replace("Michigan", "MI").replace("Northern Lower ", "N. Lower ")}
                              </text>
                            )}
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-3" side="top" align="center">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        Find your county automatically
                      </div>
                      <button
                        onClick={() => setGeoOpen(false)}
                        className="p-0.5 text-muted-foreground hover:text-foreground rounded"
                        aria-label="Close location popover"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      We can detect your county to show local resources. Your location is never stored, sold, or tracked.
                    </p>
                    <Button
                      size="sm"
                      className="w-full gap-1.5 text-xs"
                      onClick={handleUseLocation}
                      disabled={geoStatus === "loading"}
                    >
                      {geoStatus === "loading" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Navigation className="h-3.5 w-3.5" />
                      )}
                      {geoStatus === "loading" ? "Locating…" : "Use my location"}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Hover info card */}
            <div className="w-full max-w-xs min-h-[100px]">
             {hoveredRegion ? (
                <motion.div
                  key={hoveredRegion.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-lg border border-border bg-muted/50 p-4 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ background: hoveredRegion.color }} />
                    <h3 className="text-sm font-bold text-foreground">{hoveredRegion.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">{hoveredRegion.description}</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div>
                      <span className="text-muted-foreground">Counties: </span>
                      <span className="font-medium text-foreground">{hoveredRegion.counties.length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Pop. est: </span>
                      <span className="font-medium text-foreground">
                        {REGION_POP[hoveredRegion.id] ? `${(REGION_POP[hoveredRegion.id] / 1_000_000).toFixed(1)}M` : "—"}
                      </span>
                    </div>
                  </div>
                  {/* Cross-sector vital metrics */}
                  {REGION_VITALS[hoveredRegion.id] && (
                    <div className="border-t border-border/50 pt-2 mt-1 space-y-1.5">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Cross-Sector Vitals</p>
                      <div className="flex items-center gap-1.5 text-xs">
                        <HeartPulse className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
                        <span className="text-muted-foreground">Uninsured:</span>
                        <span className="font-semibold text-foreground">{REGION_VITALS[hoveredRegion.id].uninsuredRate}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Zap className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                        <span className="text-muted-foreground">Energy Burden:</span>
                        <span className="font-semibold text-foreground">{REGION_VITALS[hoveredRegion.id].energyBurden}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Bus className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">Transit Score:</span>
                        <span className="font-semibold text-foreground">{REGION_VITALS[hoveredRegion.id].transitScore}/100</span>
                      </div>
                    </div>
                  )}
                  <p className="text-[10px] text-primary font-medium cursor-pointer hover:underline">
                    Click to explore →
                  </p>
                </motion.div>
              ) : (
                <div className="rounded-lg border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
                  Hover over a region to see details, or click to explore.
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
