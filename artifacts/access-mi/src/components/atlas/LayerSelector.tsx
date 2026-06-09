import { Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ATLAS_LAYERS, type AtlasLayer } from "@/config/atlasLayers";

export type { AtlasLayer };

interface Props {
  active: AtlasLayer;
  onChange: (layer: AtlasLayer) => void;
}

const LAYERS = ATLAS_LAYERS;

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
          <Radio
            className={`h-3 w-3 shrink-0 ${active === layer.key ? "text-primary" : "text-muted-foreground/40"}`}
          />
          <span className="flex-1">{layer.label}</span>
          <Badge variant="outline" className="text-[8px] shrink-0">
            {layer.source}
          </Badge>
        </button>
      ))}
    </div>
  );
}
