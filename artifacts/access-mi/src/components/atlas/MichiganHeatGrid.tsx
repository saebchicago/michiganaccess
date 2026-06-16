import { useMemo } from "react";
import { motion } from "framer-motion";
import type { AtlasLayer } from "./LayerSelector";
import { COUNTY_PROFILES } from "@/data/michigan-county-profiles";
import { computeCompoundDeficit } from "@/utils/compoundDeficit";

interface CountyMetrics {
  county: string;
  value: number | null;
  population: number;
}

interface Props {
  layer: AtlasLayer;
  onCountyClick: (county: string) => void;
  selectedCounty: string | null;
}

// Guard 3: all cases without a verified source return null.
// null renders as gray cell with "N/A" - no proxy values used.
// Per-layer status tracked in scripts/atlas-provenance-status.json.
function getLayerData(layer: AtlasLayer): CountyMetrics[] {
  const counties = Object.entries(COUNTY_PROFILES);
  return counties
    .map(([name, profile]) => {
      const h = profile.healthHighlights;
      let value: number | null = null;

      switch (layer) {
        case "uninsured":
          // ACS via County Health Rankings 2025 - all 83 counties
          value = parseFloat(h[0]?.value || "0");
          break;
        case "poverty":
          // Guard 3: food insecurity (h[2]) != ACS poverty rate; pending ACS ingestion
          value = null;
          break;
        case "compound":
          value = computeCompoundDeficit(profile).compound;
          break;
        case "food_desert":
          // Guard 3: food insecurity != food desert tracts; pending USDA tract ingestion
          value = null;
          break;
        case "energy_burden":
          // Guard 3: proxy removed; partial ACEEE data (7/83) not wired to mobile grid
          value = null;
          break;
        case "infant_mortality":
          // Guard 3: data unavailable until MDHHS 2020-2024 CSV seeded
          value = null;
          break;
        case "broadband":
          // Guard 3: proxy removed; partial FCC data (10/83) not wired to mobile grid
          value = null;
          break;
        case "ej_index":
          // Guard 3: FEMA NRI compositeRisk != EPA EJScreen index (source mismatch)
          value = null;
          break;
        case "alice":
          // Guard 3: proxy removed; partial ALICE data (7/83) not wired to mobile grid
          value = null;
          break;
        case "pharmacy":
          // Guard 3: no verified county-level source exists
          value = null;
          break;
      }

      return { county: name, value, population: profile.population };
    })
    .sort((a, b) => {
      if (a.value === null && b.value === null) return 0;
      if (a.value === null) return 1;
      if (b.value === null) return -1;
      return b.value - a.value;
    });
}

function cellColor(value: number | null, max: number): string {
  if (value === null) return "bg-muted";
  const ratio = max > 0 ? value / max : 0;
  if (ratio > 0.75) return "bg-red-600";
  if (ratio > 0.5) return "bg-orange-500";
  if (ratio > 0.25) return "bg-yellow-400";
  return "bg-green-600";
}

function cellTextColor(value: number | null, max: number): string {
  if (value === null) return "text-muted-foreground";
  const ratio = max > 0 ? value / max : 0;
  return ratio > 0.25 && ratio <= 0.5 ? "text-black" : "text-white";
}

export default function MichiganHeatGrid({
  layer,
  onCountyClick,
  selectedCounty,
}: Props) {
  const data = useMemo(() => getLayerData(layer), [layer]);
  const max = data.find((d) => d.value !== null)?.value ?? 1;

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
          title={`${d.county}: ${d.value !== null ? d.value.toFixed(1) : "Data unavailable"}`}
          aria-label={`${d.county} County: ${d.value !== null ? d.value.toFixed(1) : "Data unavailable"}`}
        >
          <span className="text-[7px] font-bold leading-none text-center truncate w-full px-0.5">
            {d.county.length > 6 ? d.county.substring(0, 5) + "…" : d.county}
          </span>
          <span className="text-[8px] font-mono leading-none mt-0.5">
            {d.value !== null ? d.value.toFixed(1) : "N/A"}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
