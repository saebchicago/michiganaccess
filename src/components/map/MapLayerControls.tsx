import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Hospital, Heart, Brain, Stethoscope, Siren, Pill } from "lucide-react";

const LAYERS = [
  { id: "hospital", label: "Hospitals", icon: Hospital, defaultOn: true },
  { id: "fqhc", label: "Community Health Centers (FQHCs)", icon: Heart, defaultOn: true },
  { id: "behavioral_health", label: "Behavioral Health", icon: Brain, defaultOn: true },
  { id: "specialty", label: "Specialty Centers", icon: Stethoscope, defaultOn: true },
  { id: "urgent_care", label: "Urgent Care", icon: Siren, defaultOn: true },
  { id: "pharmacy", label: "Pharmacies", icon: Pill, defaultOn: false },
];

interface MapLayerControlsProps {
  activeLayers: string[];
  onToggleLayer: (layerId: string) => void;
}

export { LAYERS };

export default function MapLayerControls({ activeLayers, onToggleLayer }: MapLayerControlsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-lg border border-border bg-card p-4 shadow-md"
    >
      <h3 className="mb-3 text-sm font-semibold text-foreground">Facility Layers</h3>
      <div className="flex flex-col gap-2.5">
        {LAYERS.map((layer) => {
          const Icon = layer.icon;
          return (
            <label
              key={layer.id}
              className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-muted"
            >
              <Checkbox
                checked={activeLayers.includes(layer.id)}
                onCheckedChange={() => onToggleLayer(layer.id)}
              />
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">{layer.label}</span>
            </label>
          );
        })}
      </div>
    </motion.div>
  );
}
