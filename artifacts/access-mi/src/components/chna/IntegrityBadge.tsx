import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { IntegrityLabel } from "@/types/chna";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const CONFIG: Record<
  IntegrityLabel,
  { text: string; className: string; baseTitle: string }
> = {
  VERIFIED: {
    text: "verified",
    className: "bg-emerald-50 text-emerald-800 border-emerald-200",
    baseTitle: "Measured directly from a primary federal or state source.",
  },
  MODELED: {
    text: "modeled",
    className: "bg-sky-50 text-sky-800 border-sky-200",
    baseTitle: "Derived or calculated from verified inputs.",
  },
  PROJECTED: {
    text: "projected",
    className: "bg-amber-50 text-amber-800 border-amber-200",
    baseTitle: "Forward-looking estimate.",
  },
};

interface IntegrityBadgeProps {
  label: IntegrityLabel;
  /** Source organization (e.g. "CDC PLACES"). Shown in the popover. */
  source?: string;
  /** Data vintage (e.g. "2022 5-Year ACS"). Shown in the popover. */
  vintage?: string;
  className?: string;
}

/**
 * Integrity chip with a click/focus-activated popover that exposes the
 * description, source, and vintage, plus a one-click link to the full
 * source ledger. Keyboard-accessible via Radix Popover. The native title
 * attribute remains as a hover fallback.
 */
export function IntegrityBadge({
  label,
  source,
  vintage,
  className,
}: IntegrityBadgeProps) {
  const { text, className: colorClass, baseTitle } = CONFIG[label];
  const provenance = [source, vintage].filter(Boolean).join(" - ");
  const title = provenance
    ? `${baseTitle} ${provenance}. Click for source ledger.`
    : `${baseTitle} Click for source ledger.`;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium leading-tight transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            colorClass,
            className,
          )}
          title={title}
          aria-label={`Data integrity: ${text}${provenance ? ` (${provenance})` : ""}. Click for source ledger.`}
        >
          {text}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 text-xs" align="start">
        <p className="font-semibold text-foreground text-[11px] uppercase tracking-wider mb-1.5">
          {text}
        </p>
        <p className="text-muted-foreground leading-relaxed">{baseTitle}</p>
        {provenance && (
          <p className="mt-2 text-foreground/80 leading-relaxed">
            <span className="font-semibold">Source:</span> {provenance}
          </p>
        )}
        <Link
          to="/data-sources"
          className="mt-3 inline-flex items-center gap-1 text-primary hover:underline text-[11px] font-medium"
        >
          View source ledger
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </PopoverContent>
    </Popover>
  );
}
