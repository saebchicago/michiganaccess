import { Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type AtlasLayer =
  | "compound"
  | "food_desert"
  | "broadband"
  | "infant_mortality"
  | "ej_index"
  | "energy_burden"
  | "uninsured"
  | "poverty";

interface Props {
  active: AtlasLayer;
  onChange: (layer: AtlasLayer) => void;
}

const LAYERS: { key: AtlasLayer; label: string; source: string }[] = [
  { key: "compound", label: "Compound Access Deficit", source: "Access Michigan Index" },
  { key: "food_desert", label: "Food Desert Tracts", source: "USDA" },
  { key: "broadband", label: "Broadband % Unserved", source: "FCC" },
  { key: "infant_mortality", label: "Infant Mortality Rate", source: "MDHHS" },
  { key: "ej_index", label: "EJ Index (max)", source: "EPA EJScreen" },
  { key: "energy_burden", label: "Energy Burden %", source: "ACEEE/DOE" },
  { key: "uninsured", label: "Uninsured Rate", source: "ACS" },
  { key: "poverty", label: "Poverty Rate", source: "ACS" },
];

export default function LayerSelector({ active, onChange }: Props) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        Data Layer
      </p>
      {LAYERS.map((layer) => (
        <button
          key={layer.key}
          onClick={() => onChange(layer.key)}
          className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
            active === layer.key
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <Radio className={`h-3 w-3 shrink-0 ${active === layer.key ? "text-primary" : "text-muted-foreground/40"}`} />
          <span className="flex-1">{layer.label}</span>
          <Badge variant="outline" className="text-[8px] shrink-0">{layer.source}</Badge>
        </button>
      ))}
    </div>
  );
}
