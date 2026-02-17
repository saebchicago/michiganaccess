import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const HEALTH_SYSTEMS = [
  { key: "Corewell Health", label: "Corewell Health" },
  { key: "Henry Ford Health", label: "Henry Ford Health" },
  { key: "Trinity Health", label: "Trinity Health" },
  { key: "McLaren Health", label: "McLaren Health" },
  { key: "Ascension", label: "Ascension" },
  { key: "Michigan Medicine", label: "U-M Health / Michigan Medicine" },
  { key: "Munson Healthcare", label: "Munson Healthcare" },
  { key: "MyMichigan Health", label: "MyMichigan Health" },
  { key: "Bronson Healthcare", label: "Bronson Healthcare" },
  { key: "Aspirus", label: "Aspirus" },
] as const;

/** Normalize DB values to filter keys */
export function matchesSystem(affiliation: string | null, filterKey: string): boolean {
  if (!affiliation) return false;
  const a = affiliation.toLowerCase();
  const k = filterKey.toLowerCase();
  // Handle variants like "McLaren Health Care" matching "McLaren Health"
  if (k === "michigan medicine") return a.includes("michigan medicine") || a.includes("university of michigan");
  if (k === "ascension") return a.includes("ascension");
  if (k === "mclaren health") return a.includes("mclaren");
  return a.includes(k);
}

interface NetworkFilterProps {
  selectedSystem: string | null;
  onSelect: (system: string | null) => void;
}

export default function NetworkFilter({ selectedSystem, onSelect }: NetworkFilterProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="rounded-lg border border-border bg-card p-4 shadow-md"
    >
      <h3 className="mb-3 text-sm font-semibold text-foreground flex items-center gap-2">
        <Building2 className="h-4 w-4 text-primary" />
        Network Density
      </h3>
      <div className="flex flex-wrap gap-1.5">
        <Badge
          variant={selectedSystem === null ? "default" : "outline"}
          className="cursor-pointer text-[10px] transition-colors"
          onClick={() => onSelect(null)}
        >
          All Systems
        </Badge>
        {HEALTH_SYSTEMS.map((sys) => (
          <Badge
            key={sys.key}
            variant={selectedSystem === sys.key ? "default" : "outline"}
            className="cursor-pointer text-[10px] transition-colors"
            onClick={() => onSelect(selectedSystem === sys.key ? null : sys.key)}
          >
            {sys.label}
          </Badge>
        ))}
      </div>
      {selectedSystem && (
        <p className="mt-2 text-[10px] text-muted-foreground">
          Highlighted facilities belong to <strong className="text-foreground">{selectedSystem}</strong>. Others shown at reduced opacity.
        </p>
      )}
    </motion.div>
  );
}

export { HEALTH_SYSTEMS };
