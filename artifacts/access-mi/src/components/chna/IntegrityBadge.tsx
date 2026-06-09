import type { IntegrityLabel } from "@/types/chna";
import { cn } from "@/lib/utils";

const CONFIG: Record<
  IntegrityLabel,
  { text: string; className: string; baseTitle: string }
> = {
  VERIFIED: {
    text: "verified",
    className: "bg-emerald-50 text-emerald-800 border-emerald-200",
    baseTitle: "Measured directly from a primary federal or state source",
  },
  MODELED: {
    text: "modeled",
    className: "bg-sky-50 text-sky-800 border-sky-200",
    baseTitle: "Derived or calculated from verified inputs",
  },
  PROJECTED: {
    text: "projected",
    className: "bg-amber-50 text-amber-800 border-amber-200",
    baseTitle: "Forward-looking estimate",
  },
};

interface IntegrityBadgeProps {
  label: IntegrityLabel;
  /** Source organization (e.g. "CDC PLACES"). Shown in the tooltip. */
  source?: string;
  /** Data vintage (e.g. "2022 5-Year ACS"). Shown in the tooltip. */
  vintage?: string;
  className?: string;
}

export function IntegrityBadge({
  label,
  source,
  vintage,
  className,
}: IntegrityBadgeProps) {
  const { text, className: colorClass, baseTitle } = CONFIG[label];
  const provenance = [source, vintage].filter(Boolean).join(" · ");
  const title = provenance ? `${baseTitle}. ${provenance}.` : baseTitle;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium leading-tight",
        colorClass,
        className,
      )}
      title={title}
      aria-label={`Data integrity: ${text}${provenance ? ` (${provenance})` : ""}`}
    >
      {text}
    </span>
  );
}
