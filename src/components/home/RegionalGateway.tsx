import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useCallback, useMemo, useRef } from "react";
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
  "upper-peninsula": { x: 115, y: 38 },
  northwest:         { x: 155, y: 120 },
  "east-central":    { x: 240, y: 115 },
  west:              { x: 85,  y: 205 },
  "south-central":   { x: 185, y: 210 },
  southeast:         { x: 255, y: 215 },
};

const REGION_POP: Record<string, number> = {
  southeast:         4_800_000,
  "south-central":   1_600_000,
  west:              1_900_000,
  "east-central":    1_100_000,
  northwest:           600_000,
  "upper-peninsula":   300_000,
};

const REGION_VITALS: Record<string, {
  uninsuredRate: string;
  energyBurden: string;
  transitScore: string;
  headlineStat: string;
}> = {
  southeast:       { uninsuredRate: "5.2%", energyBurden: "3.8%", transitScore: "72", headlineStat: "Best transit access in Michigan" },
  "south-central": { uninsuredRate: "6.1%", energyBurden: "4.2%", transitScore: "58", headlineStat: "Home to Michigan's capital" },
  west:            { uninsuredRate: "5.8%", energyBurden: "4.0%", transitScore: "54", headlineStat: "Fastest-growing metro region" },
  "east-central":  { uninsuredRate: "7.4%", energyBurden: "5.6%", transitScore: "38", headlineStat: "Highest uninsured rate in Lower MI" },
  northwest:       { uninsuredRate: "8.1%", energyBurden: "5.1%", transitScore: "32", headlineStat: "Seasonal healthcare demand" },
  "upper-peninsula": { uninsuredRate: "9.3%", energyBurden: "6.8%", transitScore: "18", headlineStat: "Highest energy burden statewide" },
};

// Two-line short labels that fit inside the SVG region shapes
const REGION_SHORT_NAME: Record<string, [string, string]> = {
  "upper-peninsula": ["Upper", "Peninsula"],
  northwest:         ["N. Lower", "Michigan"],
  "east-central":    ["East Central", "/ Thumb"],
  west:              ["West", "Michigan"],
  "south-central":   ["South", "Central MI"],
  southeast:         ["Southeast", "Michigan"],
};

export default function RegionalGateway() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  // On touch/mobile: first tap selects (shows info panel), second tap navigates
  const [selected, setSelected] = useState<string | null>(null);
  const [geoOpen, setGeoOpen] = useState(false);
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading">("idle");
  // Info panel shows for hovered region (desktop) OR touch-selected region (mobile)
  const hoveredRegion = MICHIGAN_REGIONS.find((r) => r.id === (hovered ?? selected));

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
    <section
      ref={sectionRef}
      className="relative py-16 md:py-20 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/20 dark:from-background dark:via-primary/[0.05] dark:to-accent/[0.04]"
      aria-label="Explore Michigan by region"
      onClick={(e) => {
        // Clicking on the section background (not on the SVG paths) clears selection
        if (sectionRef.current && e.target === sectionRef.current) {
          setSelected(null);
        }
      }}
    >
      {/* Decorative blur rings */}
      <div
        className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-blue-100/50 dark:bg-primary/[0.07] blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-teal-100/40 dark:bg-accent/[0.05] blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Section header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              Explore by Region
            </div>
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              Find resources near you
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Select your region on the map, search for your city, or let us detect your county automatically.
            </p>
            <p className="text-xs text-muted-foreground/60">
              All 83 counties · 10M+ Michigan residents
            </p>
          </div>

          {/* Municipality Search */}
          <div className="max-w-lg mx-auto">
            <MunicipalitySearch />
          </div>

          {/* Map + info panel */}
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-center lg:items-start">

            {/* ── Map card ── */}
            <div className="relative flex-shrink-0">
              {/* Dynamic outer glow that responds to hovered region */}
              <div
                className="absolute -inset-2 rounded-2xl blur-md opacity-25 pointer-events-none transition-all duration-500"
                style={{
                  background: hovered
                    ? `radial-gradient(ellipse at center, ${MICHIGAN_REGIONS.find(r => r.id === hovered)?.color ?? "transparent"} 0%, transparent 70%)`
                    : "linear-gradient(135deg, hsl(205,80%,33%), hsl(174,60%,34%))",
                }}
                aria-hidden="true"
              />

              <div className="relative rounded-2xl border border-border/40 bg-white/90 dark:bg-card/90 backdrop-blur-sm p-4 md:p-6 shadow-xl">
                <Popover open={geoOpen} onOpenChange={setGeoOpen}>
                  <PopoverTrigger asChild>
                    <div
                      className="cursor-pointer outline-none"
                      tabIndex={0}
                      role="group"
                      aria-label="Michigan regional map — click to find your county"
                      onMouseEnter={() => { if (!isMobile && !hasGeoCache) setGeoOpen(true); }}
                      onFocus={() => { if (!hasGeoCache) setGeoOpen(true); }}
                      onClick={() => { if (isMobile && !hasGeoCache) setGeoOpen(true); }}
                    >
                      <svg
                        viewBox="0 0 310 300"
                        className="w-full max-w-[280px] md:max-w-[320px] h-auto"
                        role="img"
                        aria-label="Interactive map of Michigan's 6 regions. Click or tap a region to explore."
                      >
                        <defs>
                          {/* Glow effect applied to hovered region */}
                          <filter id="region-glow" x="-25%" y="-25%" width="150%" height="150%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feMerge>
                              <feMergeNode in="blur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                          {/* Subtle dot texture for county-outline depth */}
                          <pattern id="county-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                            <circle cx="1" cy="1" r="0.55" fill="#94a3b8" opacity="0.18" />
                          </pattern>
                        </defs>

                        {/* Dot-grid background */}
                        <rect width="310" height="300" fill="url(#county-grid)" />

                        {MICHIGAN_REGIONS.map((region) => {
                          const path = REGION_PATHS[region.id];
                          const label = REGION_LABEL_POS[region.id];
                          const [line1, line2] = REGION_SHORT_NAME[region.id] ?? [region.name, ""];
                          const vitals = REGION_VITALS[region.id];
                          if (!path) return null;
                          const isActive = hovered === region.id || selected === region.id;

                          return (
                            <g key={region.id}>
                              {/* Native browser tooltip */}
                              <title>
                                {`${region.name}${vitals ? ` — ${vitals.headlineStat}` : ""}`}
                              </title>

                              {/* Region polygon */}
                              <path
                                d={path}
                                fill={region.color}
                                fillOpacity={isActive ? 1 : 0.45}
                                stroke={region.color}
                                strokeWidth={isActive ? 2.5 : 1.5}
                                strokeOpacity={isActive ? 1 : 0.75}
                                filter={isActive ? "url(#region-glow)" : undefined}
                                style={{
                                  transition: "fill-opacity 0.2s ease, stroke-width 0.2s ease, filter 0.2s ease",
                                  cursor: "pointer",
                                }}
                                onMouseEnter={() => setHovered(region.id)}
                                onMouseLeave={() => setHovered(null)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isMobile) {
                                    // First tap: select to preview; second tap on same: navigate
                                    if (selected === region.id) {
                                      navigate(`/region/${region.id}`);
                                    } else {
                                      setSelected(region.id);
                                    }
                                  } else {
                                    navigate(`/region/${region.id}`);
                                  }
                                }}
                                role="button"
                                aria-label={
                                  isMobile && selected !== region.id
                                    ? `Preview ${region.name}`
                                    : `Go to ${region.name}`
                                }
                              />

                              {/* Line 1 label — white with dark stroke for universal readability */}
                              {label && (
                                <text
                                  x={label.x}
                                  y={label.y}
                                  textAnchor="middle"
                                  fill="white"
                                  stroke="rgba(0,0,0,0.55)"
                                  strokeWidth="3.5"
                                  paintOrder="stroke"
                                  fontSize="7.5"
                                  fontWeight="700"
                                  letterSpacing="0.4"
                                  className="pointer-events-none select-none"
                                  style={{ opacity: isHovered ? 1 : 0.9, transition: "opacity 0.2s ease" }}
                                >
                                  {line1}
                                </text>
                              )}

                              {/* Line 2 label */}
                              {label && line2 && (
                                <text
                                  x={label.x}
                                  y={label.y + 10}
                                  textAnchor="middle"
                                  fill="white"
                                  stroke="rgba(0,0,0,0.55)"
                                  strokeWidth="3.5"
                                  paintOrder="stroke"
                                  fontSize="7.5"
                                  fontWeight="700"
                                  letterSpacing="0.4"
                                  className="pointer-events-none select-none"
                                  style={{ opacity: isHovered ? 1 : 0.9, transition: "opacity 0.2s ease" }}
                                >
                                  {line2}
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
                          <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
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
                          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                        ) : (
                          <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        {geoStatus === "loading" ? "Locating…" : "Use my location"}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Detect county CTA below map */}
                <div className="mt-3 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs rounded-full border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-colors"
                    onClick={handleUseLocation}
                    disabled={geoStatus === "loading"}
                  >
                    {geoStatus === "loading" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    ) : (
                      <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {geoStatus === "loading" ? "Locating…" : "Detect my county"}
                  </Button>
                </div>
              </div>
            </div>

            {/* ── Info panel ── */}
            <div className="w-full max-w-sm lg:pt-4">
              {hoveredRegion ? (
                <motion.div
                  key={hoveredRegion.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-xl border border-border bg-card shadow-md overflow-hidden"
                >
                  {/* Color-matched top strip */}
                  <div
                    className="h-1.5"
                    style={{ background: `linear-gradient(90deg, ${hoveredRegion.color}, ${hoveredRegion.color}88)` }}
                  />
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="h-4 w-4 rounded-full shadow-sm ring-2 ring-white/40 dark:ring-black/30 flex-shrink-0"
                        style={{ background: hoveredRegion.color }}
                        aria-hidden="true"
                      />
                      <h3 className="text-base font-bold text-foreground">{hoveredRegion.name}</h3>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">{hoveredRegion.description}</p>

                    {/* Headline stat */}
                    {REGION_VITALS[hoveredRegion.id] && (
                      <div
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold text-white"
                        style={{ background: hoveredRegion.color }}
                      >
                        <MapPin className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                        {REGION_VITALS[hoveredRegion.id].headlineStat}
                      </div>
                    )}

                    {/* County + pop */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <div>
                        <span className="text-muted-foreground">Counties: </span>
                        <span className="font-semibold text-foreground">{hoveredRegion.counties.length}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Pop. est: </span>
                        <span className="font-semibold text-foreground">
                          {REGION_POP[hoveredRegion.id]
                            ? `${(REGION_POP[hoveredRegion.id] / 1_000_000).toFixed(1)}M`
                            : "—"}
                        </span>
                      </div>
                    </div>

                    {/* Cross-sector vitals */}
                    {REGION_VITALS[hoveredRegion.id] && (
                      <div className="border-t border-border/50 pt-3 space-y-2">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Cross-Sector Vitals
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="rounded-lg bg-destructive/5 p-2.5 text-center">
                            <HeartPulse className="h-4 w-4 text-destructive mx-auto mb-1" aria-hidden="true" />
                            <p className="text-xs font-bold text-foreground">
                              {REGION_VITALS[hoveredRegion.id].uninsuredRate}
                            </p>
                            <p className="text-[9px] text-muted-foreground">Uninsured</p>
                          </div>
                          <div className="rounded-lg bg-michigan-gold/10 p-2.5 text-center">
                            <Zap className="h-4 w-4 text-michigan-gold mx-auto mb-1" aria-hidden="true" />
                            <p className="text-xs font-bold text-foreground">
                              {REGION_VITALS[hoveredRegion.id].energyBurden}
                            </p>
                            <p className="text-[9px] text-muted-foreground">Energy Burden</p>
                          </div>
                          <div className="rounded-lg bg-primary/5 p-2.5 text-center">
                            <Bus className="h-4 w-4 text-primary mx-auto mb-1" aria-hidden="true" />
                            <p className="text-xs font-bold text-foreground">
                              {REGION_VITALS[hoveredRegion.id].transitScore}/100
                            </p>
                            <p className="text-[9px] text-muted-foreground">Transit</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button
                      size="sm"
                      className="w-full gap-1.5 text-xs mt-1 hover:opacity-90 transition-opacity"
                      style={{ background: hoveredRegion.color }}
                      onClick={() => navigate(`/region/${hoveredRegion.id}`)}
                    >
                      Explore {hoveredRegion.name}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                    {/* Mobile hint — only visible when region is touch-selected */}
                    {isMobile && selected === hoveredRegion.id && (
                      <p className="text-center text-[10px] text-muted-foreground mt-1.5">
                        Tap the map region again to open →
                      </p>
                    )}
                  </div>
                </motion.div>
              ) : (
                /* Empty state with region legend */
                <div className="rounded-xl border border-dashed border-border/50 bg-white/60 dark:bg-card/50 p-8 text-center space-y-3 shadow-sm">
                  <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
                    <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Select a region</p>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px] mx-auto">
                    Hover or tap a region on the map to see local health, energy, and transit data.
                  </p>
                  {/* Color legend */}
                  <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 pt-1">
                    {MICHIGAN_REGIONS.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => navigate(`/region/${r.id}`)}
                        className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                      >
                        <div
                          className="h-2 w-2 rounded-full flex-shrink-0"
                          style={{ background: r.color }}
                          aria-hidden="true"
                        />
                        <span className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                          {r.name
                            .replace(" Michigan", " MI")
                            .replace("Northern Lower ", "N. Lower ")}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile quick-links grid */}
              {isMobile && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {MICHIGAN_REGIONS.map((region) => (
                    <button
                      key={region.id}
                      onClick={() => navigate(`/region/${region.id}`)}
                      className="flex items-center gap-2 rounded-lg border-l-[3px] border border-border bg-white dark:bg-card p-2.5 text-left text-xs hover:bg-muted/40 transition-colors shadow-sm"
                      style={{ borderLeftColor: region.color }}
                    >
                      <div
                        className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                        style={{ background: region.color }}
                        aria-hidden="true"
                      />
                      <span className="font-medium text-foreground truncate">
                        {region.name
                          .replace(" Michigan", " MI")
                          .replace("Northern Lower ", "N. Lower ")}
                      </span>
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
