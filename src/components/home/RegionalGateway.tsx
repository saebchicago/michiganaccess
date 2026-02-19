import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useCallback, useMemo } from "react";
import { MapPin, Navigation, Loader2, ShieldCheck, X, HeartPulse, Zap, Bus, ArrowRight } from "lucide-react";
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

const REGION_POP: Record<string, number> = {
  southeast: 4_800_000,
  "south-central": 1_600_000,
  west: 1_900_000,
  "east-central": 1_100_000,
  northwest: 600_000,
  "upper-peninsula": 300_000,
};

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
    <section className="relative py-16 md:py-20 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-accent/[0.03] to-michigan-gold/[0.04] dark:from-primary/[0.08] dark:via-accent/[0.06] dark:to-michigan-gold/[0.06]" />
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.15'%3E%3Ccircle cx='1' cy='1' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      }} aria-hidden="true" />

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
              <MapPin className="h-3.5 w-3.5" />
              Explore by Region
            </div>
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              Find resources near you
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Select your region on the map, search for your city, or let us detect your county automatically.
            </p>
          </div>

          {/* Municipality Search — prominent */}
          <div className="max-w-lg mx-auto">
            <MunicipalitySearch />
          </div>

          {/* Map + Info panel */}
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-center lg:items-start">
            {/* Map container with decorative ring */}
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-accent/10 blur-sm" aria-hidden="true" />
              <div className="relative rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-4 md:p-6 shadow-lg">
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
                        className="w-64 h-auto md:w-80"
                        role="img"
                        aria-label="Interactive map of Michigan's 6 regions"
                      >
                        {/* Subtle grid lines for polish */}
                        <defs>
                          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.2" className="text-border" />
                          </pattern>
                        </defs>
                        <rect width="310" height="300" fill="url(#grid)" opacity="0.3" />

                        {MICHIGAN_REGIONS.map((region) => {
                          const path = REGION_PATHS[region.id];
                          const label = REGION_LABEL_POS[region.id];
                          if (!path) return null;
                          const isHovered = hovered === region.id;
                          return (
                            <g key={region.id}>
                              <path
                                d={path}
                                fill={isHovered ? region.color : `${region.color}22`}
                                stroke={region.color}
                                strokeWidth={isHovered ? 3 : 1.5}
                                className="cursor-pointer transition-all duration-300"
                                style={{
                                  filter: isHovered ? `drop-shadow(0 0 8px ${region.color}66)` : "none",
                                }}
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
                                  style={{ opacity: isHovered ? 1 : 0.7 }}
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

                {/* Use Location CTA below map */}
                <div className="mt-3 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs rounded-full"
                    onClick={handleUseLocation}
                    disabled={geoStatus === "loading"}
                  >
                    {geoStatus === "loading" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Navigation className="h-3.5 w-3.5" />
                    )}
                    {geoStatus === "loading" ? "Locating…" : "Detect my county"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Hover info card — right side */}
            <div className="w-full max-w-sm lg:pt-4">
              {hoveredRegion ? (
                <motion.div
                  key={hoveredRegion.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-xl border border-border bg-card shadow-md overflow-hidden"
                >
                  {/* Colored header strip */}
                  <div
                    className="h-1.5"
                    style={{ background: `linear-gradient(90deg, ${hoveredRegion.color}, ${hoveredRegion.color}88)` }}
                  />
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-4 w-4 rounded-full shadow-sm" style={{ background: hoveredRegion.color }} />
                      <h3 className="text-base font-bold text-foreground">{hoveredRegion.name}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{hoveredRegion.description}</p>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <div>
                        <span className="text-muted-foreground">Counties: </span>
                        <span className="font-semibold text-foreground">{hoveredRegion.counties.length}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Pop. est: </span>
                        <span className="font-semibold text-foreground">
                          {REGION_POP[hoveredRegion.id] ? `${(REGION_POP[hoveredRegion.id] / 1_000_000).toFixed(1)}M` : "—"}
                        </span>
                      </div>
                    </div>

                    {/* Cross-sector vital metrics */}
                    {REGION_VITALS[hoveredRegion.id] && (
                      <div className="border-t border-border/50 pt-3 space-y-2">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Cross-Sector Vitals</p>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="rounded-lg bg-destructive/5 p-2.5 text-center">
                            <HeartPulse className="h-4 w-4 text-destructive mx-auto mb-1" />
                            <p className="text-xs font-bold text-foreground">{REGION_VITALS[hoveredRegion.id].uninsuredRate}</p>
                            <p className="text-[9px] text-muted-foreground">Uninsured</p>
                          </div>
                          <div className="rounded-lg bg-michigan-gold/10 p-2.5 text-center">
                            <Zap className="h-4 w-4 text-michigan-gold mx-auto mb-1" />
                            <p className="text-xs font-bold text-foreground">{REGION_VITALS[hoveredRegion.id].energyBurden}</p>
                            <p className="text-[9px] text-muted-foreground">Energy Burden</p>
                          </div>
                          <div className="rounded-lg bg-primary/5 p-2.5 text-center">
                            <Bus className="h-4 w-4 text-primary mx-auto mb-1" />
                            <p className="text-xs font-bold text-foreground">{REGION_VITALS[hoveredRegion.id].transitScore}/100</p>
                            <p className="text-[9px] text-muted-foreground">Transit</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button
                      size="sm"
                      className="w-full gap-1.5 text-xs mt-1"
                      onClick={() => navigate(`/region/${hoveredRegion.id}`)}
                    >
                      Explore {hoveredRegion.name} <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div className="rounded-xl border border-dashed border-border/60 bg-card/50 p-8 text-center space-y-3">
                  <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Select a region</p>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px] mx-auto">
                    Hover or tap a region on the map to see local health, energy, and transit data.
                  </p>
                </div>
              )}

              {/* Quick region links for mobile */}
              {isMobile && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {MICHIGAN_REGIONS.map((region) => (
                    <button
                      key={region.id}
                      onClick={() => navigate(`/region/${region.id}`)}
                      className="flex items-center gap-2 rounded-lg border border-border bg-card p-2.5 text-left text-xs hover:bg-muted/50 transition-colors"
                    >
                      <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: region.color }} />
                      <span className="font-medium text-foreground truncate">{region.name.replace("Michigan", "MI")}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
