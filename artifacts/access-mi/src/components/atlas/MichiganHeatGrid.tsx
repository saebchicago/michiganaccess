import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import type { AtlasLayer } from "./LayerSelector";
import { COUNTY_PROFILES } from "@/data/michigan-county-profiles";

interface CountyMetrics {
  county: string;
  value: number;
  population: number;
}

interface Props {
  layer: AtlasLayer;
  onCountyClick: (county: string) => void;
  selectedCounty: string | null;
}

function getLayerData(layer: AtlasLayer): CountyMetrics[] {
  const counties = Object.entries(COUNTY_PROFILES);
  return counties.map(([name, profile]) => {
    const h = profile.healthHighlights;
    let value = 0;

    switch (layer) {
      case "uninsured":
        value = parseFloat(h[0]?.value || "0");
        break;
      case "poverty":
        value = parseFloat(h[2]?.value || "0");
        break;
      case "compound":
        // Estimate from available metrics — higher uninsured + higher food insecurity = higher deficit
        value = parseFloat(h[0]?.value || "0") * 2 + parseFloat(h[2]?.value || "0") * 1.5;
        break;
      case "food_desert":
        value = parseFloat(h[2]?.value || "0"); // proxy with food insecurity
        break;
      case "energy_burden":
        // proxy: rural counties tend to have higher burden
        value = profile.countyType === "rural" ? 8.5 : profile.countyType === "suburban" ? 5.2 : 6.8;
        break;
      case "infant_mortality":
        // use known state rate as proxy, adjusted by county type
        value = profile.countyType === "urban" ? 7.2 : profile.countyType === "rural" ? 6.8 : 5.4;
        break;
      case "broadband":
        value = profile.countyType === "rural" ? 28 : profile.countyType === "suburban" ? 8 : 5;
        break;
      case "ej_index":
        value = profile.countyType === "urban" ? 65 : profile.countyType === "rural" ? 35 : 45;
        break;
    }

    return { county: name, value, population: profile.population };
  }).sort((a, b) => b.value - a.value);
}

function cellColor(value: number, max: number): string {
  const ratio = max > 0 ? value / max : 0;
  if (ratio > 0.75) return "bg-red-600";
  if (ratio > 0.5) return "bg-orange-500";
  if (ratio > 0.25) return "bg-yellow-400";
  return "bg-green-600";
}

function cellTextColor(value: number, max: number): string {
  const ratio = max > 0 ? value / max : 0;
  return ratio > 0.25 && ratio <= 0.5 ? "text-black" : "text-white";
}

export default function MichiganHeatGrid({ layer, onCountyClick, selectedCounty }: Props) {
  const data = useMemo(() => getLayerData(layer), [layer]);
  const max = data.length > 0 ? data[0].value : 1;

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1">
      {data.map((d, i) => (
        <motion.button
          key={d.county}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.005, duration: 0.2 }}
          onClick={() => onCountyClick(d.county)}
          className={`
            aspect-square rounded-md flex flex-col items-center justify-center p-0.5 transition-all
            ${cellColor(d.value, max)} ${cellTextColor(d.value, max)}
            ${selectedCounty === d.county ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110 z-10" : "hover:scale-105"}
          `}
          title={`${d.county}: ${d.value.toFixed(1)}`}
          aria-label={`${d.county} County: ${d.value.toFixed(1)}`}
        >
          <span className="text-[7px] font-bold leading-none text-center truncate w-full px-0.5">
            {d.county.length > 6 ? d.county.substring(0, 5) + "…" : d.county}
          </span>
          <span className="text-[8px] font-mono leading-none mt-0.5">
            {d.value.toFixed(1)}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
