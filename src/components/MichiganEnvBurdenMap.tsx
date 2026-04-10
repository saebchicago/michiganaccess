import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { isMichiganCounty, FIPS_TO_COUNTY } from "@/data/michigan-topojson";
import { Link } from "react-router-dom";
import { MICHIGAN_EJSCREEN, type EjscreenRecord } from "@/data/ejscreen";

const TOPO_URL = "/data/us-counties-10m.json";
const NO_DATA_COLOR = "#E5E7EB";

// Maps each ZCTA in ejscreen.ts to its Michigan county FIPS code.
const ZCTA_TO_FIPS: Record<string, string> = {
  "48201": "26163", // Wayne -- Detroit core
  "48126": "26163", // Wayne -- Dearborn
  "48154": "26163", // Wayne -- Livonia
  "48075": "26125", // Oakland -- Southfield
  "48084": "26125", // Oakland -- Troy
  "48067": "26125", // Oakland -- Royal Oak
  "49503": "26081", // Kent -- Grand Rapids
  "48502": "26049", // Genesee -- Flint
  "48601": "26145", // Saginaw
  "48104": "26161", // Washtenaw -- Ann Arbor
  "49684": "26055", // Grand Traverse -- Traverse City
  "49855": "26103", // Marquette
  "49853": "26095", // Luce County
  "49001": "26077", // Kalamazoo
  "48310": "26099", // Macomb -- Sterling Heights
};

// Build county EJ data: for each county, keep the ZCTA with the highest ej_index
// (the highest-burden area within the county -- most relevant for EJ screening).
// Result: 11 counties with real EJScreen data; 72 counties show "no data" state.
const countyEJData: Record<string, EjscreenRecord> = {};
for (const [, record] of Object.entries(MICHIGAN_EJSCREEN)) {
  const fips = ZCTA_TO_FIPS[record.zcta];
  if (!fips) continue;
  if (!countyEJData[fips] || record.ej_index > countyEJData[fips].ej_index) {
    countyEJData[fips] = record;
  }
}

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
          const ejData = countyEJData[fips];
          return ejData ? colorScale(ejData.ej_index) : NO_DATA_COLOR;
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
          svg.selectAll<SVGPathElement, GeoJSON.Feature>("path.county")
            .attr("stroke-width", (d: any) => String(d.id).padStart(5, "0") === fips ? 2.5 : 0.5)
            .attr("opacity", (d: any) => String(d.id).padStart(5, "0") === fips ? 1 : 0.85);
        });

      setLoading(false);
    }).catch(() => setLoading(false));
  // Run once on mount; selection changes are handled imperatively above
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ejData = countyEJData[selected];
  const countyName = FIPS_TO_COUNTY[selected] ?? selected;
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
              <span className="text-sm text-muted-foreground">Loading map...</span>
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
              {countyEJData[tooltip.fips] ? (
                <>
                  <p className="text-muted-foreground">EJ Index: <span className="text-foreground font-medium">{countyEJData[tooltip.fips].ej_index}th pct</span></p>
                  <p className="text-muted-foreground">PM2.5: <span className="text-foreground font-medium">{countyEJData[tooltip.fips].pm25_percentile}th pct</span></p>
                  <p className="text-muted-foreground">Ozone: <span className="text-foreground font-medium">{countyEJData[tooltip.fips].ozone_percentile}th pct</span></p>
                </>
              ) : (
                <p className="text-muted-foreground italic">No sub-county EJScreen data</p>
              )}
            </div>
          )}
          {/* Legend */}
          <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-background/80 rounded px-2 py-1 text-xs text-muted-foreground flex-wrap">
            <span>Low</span>
            <div
              className="w-20 h-2 rounded"
              style={{ background: "linear-gradient(to right, #e8f4f0, #0A4C95)" }}
            />
            <span>High EJ Burden</span>
            <span className="flex items-center gap-1 ml-1">
              <span className="inline-block w-3 h-2 rounded-sm border border-border" style={{ background: NO_DATA_COLOR }} />
              No data
            </span>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="flex flex-col gap-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-base font-semibold text-foreground mb-1">{countyName} County</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Environmental burden indicators. Source:{" "}
              <a
                href="https://www.epa.gov/ejscreen"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                EPA EJScreen v2.3
              </a>{" "}
              (ZCTA-level, representative highest-burden area per county).{" "}
              <Link to="/methodology/environmental" className="underline hover:text-primary">
                Methodology
              </Link>
            </p>

            {ejData ? (
              <>
                {/* Metric Cards */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <MetricCard label="EJ Index" value={ejData.ej_index} unit="th pct" color="#0A4C95" />
                  <MetricCard label="PM2.5" value={ejData.pm25_percentile} unit="th pct" color="#00A3A1" />
                  <MetricCard label="Ozone" value={ejData.ozone_percentile} unit="th pct" color="#2D5F3F" />
                  <MetricCard label="Traffic Proximity" value={ejData.traffic_percentile} unit="th pct" color="#0A4C95" />
                </div>

                {/* Bar Indicators */}
                <div className="flex flex-col gap-2">
                  <BarIndicator label="Wastewater Discharge" value={ejData.wastewater_percentile} color="#0A4C95" />
                  <BarIndicator label="RMP Facility Proximity" value={ejData.rmp_percentile} color="#00A3A1" />
                </div>

                {/* Demographic context */}
                <div className="mt-3 flex gap-4 text-xs text-muted-foreground border-t border-border/50 pt-3">
                  <span>Low-income: <span className="font-medium text-foreground">{ejData.pct_low_income.toFixed(1)}%</span></span>
                  <span>Minority: <span className="font-medium text-foreground">{ejData.pct_minority.toFixed(1)}%</span></span>
                </div>
                <p className="mt-1.5 text-[10px] text-muted-foreground">
                  ZCTA {ejData.zcta} (highest-burden ZCTA in county). National percentile 0-100, higher = more burdened. Data year: {ejData.data_year}.
                </p>
              </>
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Sub-county EJScreen data not yet available for {countyName} County.
                </p>
                <p className="text-xs text-muted-foreground mt-1">Statewide data integration in progress.</p>
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
