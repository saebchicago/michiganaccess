// src/components/investment/MoneyFlowSankey.tsx
// Animated Sankey diagram showing federal money flow
// Source: USASpending.gov FY2024

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { sankey as d3Sankey, sankeyLinkHorizontal } from "d3-sankey";

interface NodeExtra { name: string; category: string }
interface LinkExtra { value: number }

interface SankeyData {
  nodes: NodeExtra[];
  links: Array<{ source: number; target: number; value: number }>;
}

const SANKEY_DATA: SankeyData = {
  nodes: [
    // Source: Federal
    { name: "U.S. Federal Government", category: "federal" },
    // Program categories
    { name: "Health & Medicaid ($2.1B)", category: "health" },
    { name: "Housing & HUD ($420M)", category: "housing" },
    { name: "Food & SNAP ($380M)", category: "food" },
    { name: "Infrastructure ($310M)", category: "infra" },
    { name: "Education ($440M)", category: "education" },
    { name: "Energy & LIHEAP ($280M)", category: "energy" },
    // Counties (top 5)
    { name: "Wayne County", category: "county" },
    { name: "Genesee County", category: "county" },
    { name: "Saginaw County", category: "county" },
    { name: "Oakland County", category: "county" },
    { name: "Rest of Michigan", category: "county" },
    // Outcomes
    { name: "Healthcare Access", category: "outcome" },
    { name: "Housing Stability", category: "outcome" },
    { name: "Food Security", category: "outcome" },
    { name: "Economic Mobility", category: "outcome" },
  ],
  links: [
    // Federal → Programs
    { source: 0, target: 1, value: 2100 },
    { source: 0, target: 2, value: 420 },
    { source: 0, target: 3, value: 380 },
    { source: 0, target: 4, value: 310 },
    { source: 0, target: 5, value: 440 },
    { source: 0, target: 6, value: 280 },
    // Programs → Counties
    { source: 1, target: 7, value: 890 },
    { source: 1, target: 8, value: 320 },
    { source: 1, target: 9, value: 240 },
    { source: 1, target: 10, value: 420 },
    { source: 1, target: 11, value: 230 },
    { source: 2, target: 7, value: 180 },
    { source: 2, target: 10, value: 140 },
    { source: 2, target: 11, value: 100 },
    { source: 3, target: 7, value: 160 },
    { source: 3, target: 8, value: 90 },
    { source: 3, target: 11, value: 130 },
    { source: 4, target: 7, value: 110 },
    { source: 4, target: 10, value: 120 },
    { source: 4, target: 11, value: 80 },
    { source: 5, target: 7, value: 180 },
    { source: 5, target: 8, value: 80 },
    { source: 5, target: 11, value: 180 },
    { source: 6, target: 7, value: 120 },
    { source: 6, target: 8, value: 40 },
    { source: 6, target: 11, value: 120 },
    // Counties → Outcomes
    { source: 7, target: 12, value: 620 },
    { source: 7, target: 13, value: 280 },
    { source: 7, target: 14, value: 420 },
    { source: 7, target: 15, value: 320 },
    { source: 8, target: 12, value: 280 },
    { source: 8, target: 14, value: 180 },
    { source: 8, target: 15, value: 110 },
    { source: 9, target: 12, value: 200 },
    { source: 9, target: 14, value: 140 },
    { source: 10, target: 12, value: 380 },
    { source: 10, target: 13, value: 180 },
    { source: 10, target: 15, value: 120 },
    { source: 11, target: 12, value: 280 },
    { source: 11, target: 13, value: 140 },
    { source: 11, target: 14, value: 160 },
    { source: 11, target: 15, value: 140 },
  ],
};

const CATEGORY_COLORS: Record<string, string> = {
  federal: "#0A4C95",
  health: "#00A3A1",
  housing: "#2D5F3F",
  food: "#f59e0b",
  infra: "#6366f1",
  education: "#ec4899",
  energy: "#f97316",
  county: "#64748b",
  outcome: "#22c55e",
};

export default function MoneyFlowSankey() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = ref.current.clientWidth || 900;
    const height = 480;
    const margin = { top: 20, right: 160, bottom: 20, left: 160 };

    const sankeyLayout = d3Sankey<NodeExtra, LinkExtra>()
      .nodeWidth(18)
      .nodePadding(12)
      .extent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ]);

    const graph = sankeyLayout({
      nodes: SANKEY_DATA.nodes.map(d => ({ ...d })),
      links: SANKEY_DATA.links.map(d => ({ ...d })),
    });

    // Draw links
    const link = svg.append("g")
      .attr("fill", "none")
      .selectAll("g")
      .data(graph.links)
      .join("g")
      .style("mix-blend-mode", "multiply");

    link.append("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke", d => {
        const sourceNode = d.source as unknown as NodeExtra & { x0: number };
        return CATEGORY_COLORS[sourceNode.category] || "#94a3b8";
      })
      .attr("stroke-width", d => Math.max(1, (d as unknown as { width: number }).width ?? 1))
      .attr("opacity", 0.4)
      .on("mouseover", function () {
        d3.select(this).attr("opacity", 0.8);
      })
      .on("mouseout", function () {
        d3.select(this).attr("opacity", 0.4);
      })
      .append("title")
      .text(d => {
        const s = d.source as unknown as NodeExtra;
        const t = d.target as unknown as NodeExtra;
        return `${s.name} → ${t.name}: $${((d.value as number) / 1000).toFixed(1)}B`;
      });

    // Draw nodes
    const node = svg.append("g")
      .selectAll("g")
      .data(graph.nodes)
      .join("g");

    node.append("rect")
      .attr("x", d => (d as unknown as { x0: number }).x0 ?? 0)
      .attr("y", d => (d as unknown as { y0: number }).y0 ?? 0)
      .attr("height", d => {
        const n = d as unknown as { y0: number; y1: number };
        return (n.y1 ?? 0) - (n.y0 ?? 0);
      })
      .attr("width", d => {
        const n = d as unknown as { x0: number; x1: number };
        return (n.x1 ?? 0) - (n.x0 ?? 0);
      })
      .attr("fill", d => CATEGORY_COLORS[(d as unknown as NodeExtra).category] || "#64748b")
      .attr("rx", 3)
      .on("mouseover", function () {
        d3.select(this).attr("opacity", 0.8);
      })
      .on("mouseout", function () {
        d3.select(this).attr("opacity", 1);
      })
      .append("title")
      .text(d => (d as unknown as NodeExtra).name);

    // Node labels
    node.append("text")
      .attr("x", d => {
        const n = d as unknown as { x0: number; x1: number };
        return (n.x0 ?? 0) < width / 2 ? (n.x1 ?? 0) + 6 : (n.x0 ?? 0) - 6;
      })
      .attr("y", d => {
        const n = d as unknown as { y0: number; y1: number };
        return ((n.y1 ?? 0) + (n.y0 ?? 0)) / 2;
      })
      .attr("dy", "0.35em")
      .attr("text-anchor", d => {
        const n = d as unknown as { x0: number };
        return (n.x0 ?? 0) < width / 2 ? "start" : "end";
      })
      .style("font-size", "10px")
      .style("font-family", "system-ui")
      .style("fill", "currentColor")
      .text(d => (d as unknown as NodeExtra).name);

  }, []);

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-bold text-foreground">
            Federal Money Flow — Michigan FY2024
          </h3>
          <p className="text-xs text-muted-foreground">
            Source: USASpending.gov FY2024 — federal awards to Michigan counties
          </p>
        </div>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
          Hover nodes and flows for details
        </span>
      </div>
      <div className="overflow-x-auto">
        <svg
          ref={ref}
          className="w-full min-w-[700px]"
          style={{ height: 480 }}
          viewBox="0 0 900 480"
          preserveAspectRatio="xMidYMid meet"
        />
      </div>
      <p className="text-[9px] text-muted-foreground/60 mt-2">
        Values in USD millions. Illustrative flow allocation based on USASpending.gov FY2024 county-level data.
        Not a complete accounting of all federal spending.
      </p>
    </div>
  );
}
