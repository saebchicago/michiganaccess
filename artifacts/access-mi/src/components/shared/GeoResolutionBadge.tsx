import {
  Building2,
  MapPin,
  Grid3x3,
  Crosshair,
  Sigma,
  HelpCircle,
} from "lucide-react";
import type { GeoResolution } from "@/types/data-layers";

interface GeoResolutionBadgeProps {
  resolution: GeoResolution;
  /** Optional county name surfaces inside the tooltip when resolution is "county". */
  countyName?: string;
  /** Optional ZIP code surfaces inside the tooltip when the badge renders in a ZIP context. */
  zip?: string;
}

interface ResolutionConfig {
  label: string;
  icon: typeof MapPin;
  tooltipBase: string;
  className: string;
}

const RESOLUTION_CONFIG: Record<GeoResolution, ResolutionConfig> = {
  county: {
    label: "County",
    icon: Building2,
    tooltipBase:
      "Reported at the county level (county FIPS), the resolution most federal civic datasets are keyed to.",
    className:
      "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/30 dark:text-amber-100 dark:border-amber-800/60",
  },
  zcta: {
    label: "ZCTA",
    icon: MapPin,
    tooltipBase:
      "Reported at the ZIP Code Tabulation Area level, the Census Bureau's approximation of a USPS ZIP code.",
    className:
      "bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/30 dark:text-sky-100 dark:border-sky-800/60",
  },
  tract: {
    label: "Tract",
    icon: Grid3x3,
    tooltipBase:
      "Reported at the census tract or block group level, finer than ZIP or county.",
    className:
      "bg-violet-100 text-violet-900 border-violet-300 dark:bg-violet-950/30 dark:text-violet-100 dark:border-violet-800/60",
  },
  point: {
    label: "Point",
    icon: Crosshair,
    tooltipBase:
      "Reported for a specific site, such as a clinic, FQHC, or monitoring station.",
    className:
      "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-100 dark:border-emerald-800/60",
  },
  modeled_to_zip: {
    label: "Modeled to ZIP",
    icon: Sigma,
    tooltipBase:
      "Apportioned or imputed from a larger area down to a ZIP. Always paired with a MODELED integrity tier.",
    className:
      "bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-950/30 dark:text-orange-100 dark:border-orange-800/60",
  },
  unverified: {
    label: "Resolution unverified",
    icon: HelpCircle,
    tooltipBase:
      "Native geographic resolution has not been confirmed against the upstream source. Treat with caution.",
    className:
      "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
  },
};

function buildTooltip({
  resolution,
  countyName,
  zip,
}: GeoResolutionBadgeProps): string {
  const base = RESOLUTION_CONFIG[resolution].tooltipBase;
  if (resolution === "county" && countyName && zip) {
    return `${base} This figure reflects ${countyName} County, which contains ZIP ${zip}. It is not specific to the ZIP.`;
  }
  if (resolution === "county" && countyName) {
    return `${base} This figure reflects ${countyName} County.`;
  }
  return base;
}

/**
 * Small, visually distinct badge that exposes the native geographic
 * resolution of a figure. Pairs with, but is independent from, the
 * VERIFIED / MODELED / PROJECTED integrity chip rendered by
 * ProvenanceTag - both can appear on the same metric.
 */
export function GeoResolutionBadge(props: GeoResolutionBadgeProps) {
  const config = RESOLUTION_CONFIG[props.resolution];
  const Icon = config.icon;
  const tooltip = buildTooltip(props);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${config.className}`}
      title={tooltip}
      aria-label={`${config.label} geographic resolution. ${tooltip}`}
      tabIndex={0}
    >
      <Icon className="h-2.5 w-2.5" aria-hidden="true" />
      {config.label}
    </span>
  );
}
