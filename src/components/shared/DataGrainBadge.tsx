import { MapPin, Building2 } from "lucide-react";

type Grain = "zip" | "county" | "state" | "pending";

interface DataGrainBadgeProps {
  grain: Grain;
  countyName?: string;
}

const GRAIN_CONFIG: Record<Grain, { label: string; icon: typeof MapPin; className: string }> = {
  zip: {
    label: "ZIP-Level",
    icon: MapPin,
    className: "bg-primary/10 text-primary border-primary/20",
  },
  county: {
    label: "County Avg",
    icon: Building2,
    className:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-800",
  },
  state: {
    label: "State Avg",
    icon: Building2,
    className:
      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
  pending: {
    label: "Data Pending",
    icon: Building2,
    className: "bg-muted text-muted-foreground border-border",
  },
};

export function DataGrainBadge({ grain, countyName }: DataGrainBadgeProps) {
  const config = GRAIN_CONFIG[grain];
  const Icon = config.icon;
  const displayLabel =
    grain === "county" && countyName ? `${countyName} Co. Avg` : config.label;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${config.className}`}
    >
      <Icon className="h-2.5 w-2.5" />
      {displayLabel}
    </span>
  );
}
