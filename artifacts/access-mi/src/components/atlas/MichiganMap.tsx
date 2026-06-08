import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { motion } from "framer-motion";
import { FIPS_TO_COUNTY, isMichiganCounty } from "@/data/michigan-topojson";
import { Loader2 } from "lucide-react";

interface Props {
  data: Record<string, number>;
  metric: string;
  colorScale?: "red-green" | "blue" | "orange";
  unit?: string;
  onCountyClick?: (county: string) => void;
  onCountyHover?: (county: string | null) => void;
  height?: number;
  className?: string;
}

// Bundled locally for reliability - CDN was failing in some environments
const TOPO_URL = "/data/us-counties-10m.json";

export default function MichiganMap({
  data,
  metric,
  colorScale = "red-green",
  unit = "%",
  onCountyClick,
  onCountyHover,
  height = 480,
  className = "",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Stable data reference for D3
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = containerRef.current.clientWidth || 600;

    d3.json(TOPO_URL)
      .then((us: any) => {
        if (!us || !svgRef.current) return;

        const counties = topojson.feature(us, us.objects.counties) as any;
        const miCounties = {
          type: "FeatureCollection" as const,
          features: counties.features.filter((f: any) =>
            isMichiganCounty(String(f.id).padStart(5, "0"))
          ),
        };

        const states = topojson.feature(us, us.objects.states) as any;
        const miState = {
          type: "FeatureCollection" as const,
          features: states.features.filter((f: any) => String(f.id) === "26"),
        };

        const projection = d3.geoMercator().fitSize([width, height], miState as any);
        const path = d3.geoPath().projection(projection);

        const values = Object.values(dataRef.current).filter((v) => v != null && !isNaN(v));
        const extent = d3.extent(values) as [number, number];

        const color =
          colorScale === "red-green"
            ? d3.scaleSequential(d3.interpolateRdYlGn).domain([extent[1], extent[0]])
            : colorScale === "blue"
            ? d3.scaleSequential(d3.interpolateBlues).domain(extent)
            : d3.scaleSequential(d3.interpolateOranges).domain(extent);

        svg
          .append("g")
          .selectAll("path")
          .data(miCounties.features)
          .join("path")
          .attr("d", path as any)
          .attr("fill", (d: any) => {
            const fips = String(d.id).padStart(5, "0");
            const name = FIPS_TO_COUNTY[fips];
            const val = name ? dataRef.current[name] : undefined;
            return val != null ? color(val) : "#e5e7eb";
          })
          .attr("stroke", "#fff")
          .attr("stroke-width", 0.5)
          .attr("cursor", "pointer")
          .on("mouseenter", function (event: MouseEvent, d: any) {
            d3.select(this).attr("stroke", "#0A4C95").attr("stroke-width", 2).raise();
            const fips = String(d.id).padStart(5, "0");
            const name = FIPS_TO_COUNTY[fips] || "Unknown";
            const val = dataRef.current[name];
            onCountyHover?.(name);
            if (tooltipRef.current) {
              tooltipRef.current.style.display = "block";
              tooltipRef.current.style.left = `${event.offsetX + 12}px`;
              tooltipRef.current.style.top = `${event.offsetY - 28}px`;
              tooltipRef.current.innerHTML = `<strong>${name}</strong><br/>${metric}: ${val != null ? val.toLocaleString() + unit : "N/A"}`;
            }
          })
          .on("mousemove", function (event: MouseEvent) {
            if (tooltipRef.current) {
              tooltipRef.current.style.left = `${event.offsetX + 12}px`;
              tooltipRef.current.style.top = `${event.offsetY - 28}px`;
            }
          })
          .on("mouseleave", function () {
            d3.select(this).attr("stroke", "#fff").attr("stroke-width", 0.5);
            onCountyHover?.(null);
            if (tooltipRef.current) tooltipRef.current.style.display = "none";
          })
          .on("click", (_, d: any) => {
            const fips = String(d.id).padStart(5, "0");
            const name = FIPS_TO_COUNTY[fips];
            if (name) {
              onCountyClick?.(name);
              navigate(`/county/${name.toLowerCase().replace(/[\s.]+/g, "-")}`);
            }
          });

        // State border
        svg
          .append("path")
          .datum(topojson.mesh(us, us.objects.states, (a: any, b: any) => String(a.id) === "26" || String(b.id) === "26"))
          .attr("fill", "none")
          .attr("stroke", "#0A4C95")
          .attr("stroke-width", 1.5)
          .attr("d", path as any)
          .attr("pointer-events", "none");

        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [colorScale, height, metric, unit, navigate, onCountyClick, onCountyHover]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-muted/30 rounded-xl ${className}`} style={{ height }}>
        <p className="text-xs text-muted-foreground">Map unavailable - showing data in table view</p>
      </div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: loading ? 0.5 : 1 }}
      className={`relative ${className}`}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
      <svg ref={svgRef} width="100%" height={height} className="overflow-visible" />
      <div
        ref={tooltipRef}
        className="absolute hidden pointer-events-none z-50 rounded-lg bg-popover border border-border shadow-lg px-3 py-1.5 text-xs"
      />
    </motion.div>
  );
}
