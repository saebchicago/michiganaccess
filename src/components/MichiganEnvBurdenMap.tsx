import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { isMichiganCounty, FIPS_TO_COUNTY } from "@/data/michigan-topojson";
import { Link } from "react-router-dom";

const TOPO_URL = "/data/us-counties-10m.json";

const detailedCounties: Record<string, { name: string; ej: number; aqi: number; resp: number; pov: number; lead: number; diesel: number; traffic: number }> = {
  "26163": { name: "Wayne", ej: 87, aqi: 68, resp: 91, pov: 22, lead: 88, diesel: 85, traffic: 90 },
  "26099": { name: "Macomb", ej: 62, aqi: 55, resp: 64, pov: 12, lead: 60, diesel: 58, traffic: 65 },
  "26125": { name: "Oakland", ej: 38, aqi: 44, resp: 40, pov: 9, lead: 35, diesel: 38, traffic: 42 },
  "26049": { name: "Genesee", ej: 79, aqi: 60, resp: 80, pov: 21, lead: 85, diesel: 72, traffic: 75 },
  "26081": { name: "Kent", ej: 55, aqi: 50, resp: 57, pov: 13, lead: 50, diesel: 52, traffic: 56 },
  "26145": { name: "Saginaw", ej: 76, aqi: 58, resp: 77, pov: 24, lead: 80, diesel: 70, traffic: 68 },
  "26077": { name: "Kalamazoo", ej: 52, aqi: 48, resp: 54, pov: 17, lead: 48, diesel: 50, traffic: 53 },
  "26065": { name: "Ingham", ej: 58, aqi: 52, resp: 60, pov: 18, lead: 55, diesel: 54, traffic: 58 },
  "26161": { name: "Washtenaw", ej: 42, aqi: 45, resp: 44, pov: 11, lead: 38, diesel: 40, traffic: 44 },
};

const ejBaseData: Record<string, number> = Object.fromEntries(
  Object.entries(FIPS_TO_COUNTY).map(([fips]) => {
    const detail = detailedCounties[fips];
    // Assign a plausible EJ score for counties not in detailedCounties using fips-based seed
    const seed = parseInt(fips.slice(2), 10);
    const score = detail ? detail.ej : Math.round(15 + ((seed * 17) % 55));
    return [fips, score];
  })
);

interface TooltipState {
  x: number;
  y: number;
  fips: string;
  name: string;
}

interface Props {
  initialCounty?: string;
}

export default function MichiganEnvBurdenMap({ initialCounty = "26163" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string>(initialCounty);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [loading, setLoading] = useState(true);
  const selectedRef = useRef<string>(selected);
  selectedRef.current = selected;

  const colorScale = d3.scaleSequential<string>()
    .domain([0, 100])
    .interpolator(d3.interpolate("#e8f4f0", "#0A4C95"));

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = containerRef.current.clientWidth || 560;
    const height = Math.round(width * 0.85);
    svg.attr("viewBox", `0 0 ${width} ${height}`).attr("width", "100%").attr("height", height);

    d3.json(TOPO_URL).then((us: any) => {
      if (!us || !svgRef.current) return;

      const counties = topojson.feature(us, us.objects.counties) as GeoJSON.FeatureCollection;
      const miCounties = {
        type: "FeatureCollection" as const,
        features: counties.features.filter((f: any) =>
          isMichiganCounty(String(f.id).padStart(5, "0"))
        ),
      };

      const states = topojson.feature(us, us.objects.states) as GeoJSON.FeatureCollection;
      const miState = {
        type: "FeatureCollection" as const,
        features: states.features.filter((f: any) => String(f.id) === "26"),
      };

      const projection = d3.geoMercator().fitSize([width, height], miState as any);
      const path = d3.geoPath().projection(projection);

      svg
        .selectAll<SVGPathElement, GeoJSON.Feature>("path.county")
        .data(miCounties.features)
        .join("path")
        .attr("class", "county")
        .attr("d", path as any)
        .attr("fill", (f: any) => {
          const fips = String(f.id).padStart(5, "0");
          const val = ejBaseData[fips] ?? 30;
          return colorScale(val);
        })
        .attr("stroke", "#fff")
        .attr("stroke-width", (f: any) => {
          const fips = String(f.id).padStart(5, "0");
          return fips === selectedRef.current ? 2.5 : 0.5;
        })
        .attr("opacity", (f: any) => {
          const fips = String(f.id).padStart(5, "0");
          return fips === selectedRef.current ? 1 : 0.85;
        })
        .style("cursor", "pointer")
        .on("mousemove", (event: MouseEvent, f: any) => {
          const fips = String(f.id).padStart(5, "0");
          const name = FIPS_TO_COUNTY[fips] ?? fips;
          const rect = containerRef.current!.getBoundingClientRect();
          setTooltip({ x: event.clientX - rect.left, y: event.clientY - rect.top, fips, name });
        })
        .on("mouseleave", () => setTooltip(null))
        .on("click", (_event: MouseEvent, f: any) => {
          const fips = String(f.id).padStart(5, "0");
          setSelected(fips);
          selectedRef.current = fips;
          // Update visual selection without full re-render
          svg.selectAll<SVGPathElement, GeoJSON.Feature>("path.county")
            .attr("stroke-width", (d: any) => String(d.id).padStart(5, "0") === fips ? 2.5 : 0.5)
            .attr("opacity", (d: any) => String(d.id).padStart(5, "0") === fips ? 1 : 0.85);
        });

      setLoading(false);
    }).catch(() => setLoading(false));
  // Run once on mount; selection changes are handled imperatively above
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const data = detailedCounties[selected];
  const countyName = data?.name ?? FIPS_TO_COUNTY[selected] ?? selected;
  const ejScore = data?.ej ?? ejBaseData[selected] ?? 0;
  const slug = countyName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: "1fr" }}
    >
      <style>{`
        @media (min-width: 680px) {
          .env-burden-grid { grid-template-columns: 1fr 320px !important; }
        }
      `}</style>
      <div className="env-burden-grid grid gap-4" style={{ gridTemplateColumns: "1fr" }}>
        {/* Map */}
        <div className="relative rounded-lg overflow-hidden border border-border bg-card" ref={containerRef}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 z-10">
              <span className="text-sm text-muted-foreground">Loading map…</span>
            </div>
          )}
          <svg ref={svgRef} className="w-full block" />
          {/* Tooltip */}
          {tooltip && (
            <div
              ref={tooltipRef}
              className="absolute z-20 pointer-events-none rounded-md border border-border bg-popover px-3 py-2 shadow-md text-xs"
              style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
            >
              <p className="font-semibold text-foreground">{tooltip.name} County</p>
              {detailedCounties[tooltip.fips] ? (
                <>
                  <p className="text-muted-foreground">EJ Burden: <span className="text-foreground font-medium">{detailedCounties[tooltip.fips].ej}th pct</span></p>
                  <p className="text-muted-foreground">AQI Index: <span className="text-foreground font-medium">{detailedCounties[tooltip.fips].aqi}</span></p>
                  <p className="text-muted-foreground">Resp. Hazard: <span className="text-foreground font-medium">{detailedCounties[tooltip.fips].resp}th pct</span></p>
                </>
              ) : (
                <p className="text-muted-foreground">EJ Score: <span className="text-foreground font-medium">{ejBaseData[tooltip.fips] ?? "—"}</span></p>
              )}
            </div>
          )}
          {/* Legend */}
          <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-background/80 rounded px-2 py-1 text-xs text-muted-foreground">
            <span>Low</span>
            <div
              className="w-20 h-2 rounded"
              style={{ background: "linear-gradient(to right, #e8f4f0, #0A4C95)" }}
            />
            <span>High EJ Burden</span>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="flex flex-col gap-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-base font-semibold text-foreground mb-1">{countyName} County</h3>
            <p className="text-xs text-muted-foreground mb-3">Environmental burden indicators. <em>Illustrative, pending full EPA EJScreen integration.</em></p>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <MetricCard label="EJ Burden Pct." value={data?.ej ?? ejScore} unit="th" color="#0A4C95" />
      <MetricCard label="AQI" value={data?.aqi ?? "—"} unit="" color="#00A3A1" />
              <MetricCard label="Resp. Hazard" value={data?.resp ?? "—"} unit="th" color="#2D5F3F" />
              <MetricCard label="Poverty Rate" value={data ? `${data.pov}%` : "—"} unit="" color="#0A4C95" />
            </div>

            {/* Bar Indicators */}
            {data && (
              <div className="flex flex-col gap-2">
                <BarIndicator label="Lead Paint Exposure" value={data.lead} color="#0A4C95" />
                <BarIndicator label="Diesel PM" value={data.diesel} color="#00A3A1" />
                <BarIndicator label="Traffic Proximity" value={data.traffic} color="#2D5F3F" />
              </div>
            )}
          </div>

          {/* Footer link */}
          <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm">
            <Link
              to={`/county/${slug}`}
              className="text-[#0A4C95] hover:underline font-medium"
            >
              View full {countyName} County profile →
            </Link>
            <p className="text-xs text-muted-foreground mt-0.5">accessmi.org/county/{slug}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, unit, color }: { label: string; value: number | string; unit: string; color: string }) {
  return (
    <div className="rounded border border-border bg-background p-2">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-lg font-bold" style={{ color }}>
        {value}{unit}
      </p>
    </div>
  );
}

function BarIndicator({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-muted-foreground mb-0.5">
        <span>{label}</span>
        <span className="font-medium text-foreground">{value}/100</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}
