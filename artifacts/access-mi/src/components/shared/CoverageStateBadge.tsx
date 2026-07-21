import { CheckCircle2, EyeOff, CircleSlash, Sigma } from "lucide-react";
import type { CoverageState } from "@/data/snapCoverageRegistry";

interface CoverageStateBadgeProps {
  state: CoverageState;
  /** Optional reason shown in the title attribute. Falls back to the
   * built-in description if absent. */
  reason?: string;
  /** Display size; default is compact. */
  size?: "xs" | "sm";
}

interface StateConfig {
  label: string;
  icon: typeof CheckCircle2;
  description: string;
  className: string;
}

// Colors follow the shared provenance grammar (see shared/ProvenanceTag.tsx
// and chna/IntegrityBadge.tsx): brand tokens whose -deep variants are
// AA-tuned per theme, so no raw palette classes or dark: overrides.
const STATE_CONFIG: Record<CoverageState, StateConfig> = {
  present: {
    label: "Present",
    icon: CheckCircle2,
    description:
      "Direct county-native value read from the primary source. No transformation, no aggregation.",
    className:
      "border-michigan-forest/30 bg-michigan-forest/10 text-michigan-forest-deep",
  },
  suppressed: {
    label: "Suppressed",
    icon: EyeOff,
    description:
      "The source publishes the indicator but a federal or state small-cell rule blocks this cell from showing a value.",
    className:
      "border-michigan-gold/30 bg-michigan-gold/10 text-michigan-gold-deep",
  },
  "not-ingested": {
    label: "Not ingested",
    icon: CircleSlash,
    description:
      "The source publishes the indicator at this resolution but it is not yet bundled in this build. The gap is visible by design.",
    className: "border-border bg-muted text-muted-foreground",
  },
  "modeled-estimate": {
    label: "Modeled",
    icon: Sigma,
    description:
      "Value computed at runtime from data at a different geographic resolution. Always labeled MODELED at minimum, regardless of input labels.",
    className:
      "border-michigan-teal/30 bg-michigan-teal/10 text-michigan-teal-deep",
  },
};

/**
 * Distinct visual for each of the four coverage states. Kept compact so
 * it can sit inside chart tooltips and per-row indicators without crowding
 * other badges (provenance, geo-resolution).
 */
export function CoverageStateBadge({
  state,
  reason,
  size = "xs",
}: CoverageStateBadgeProps) {
  const config = STATE_CONFIG[state];
  const Icon = config.icon;
  const title = reason ?? config.description;
  const padding = size === "xs" ? "px-1.5 py-0.5" : "px-2 py-0.5";
  const text = size === "xs" ? "text-[10px]" : "text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border ${padding} ${text} font-medium ${config.className}`}
      title={title}
      aria-label={`Coverage: ${config.label}. ${title}`}
      tabIndex={0}
    >
      <Icon className="h-2.5 w-2.5" aria-hidden="true" />
      {config.label}
    </span>
  );
}
