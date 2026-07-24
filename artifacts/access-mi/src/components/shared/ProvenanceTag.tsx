import { CheckCircle2, Calculator, TrendingUp, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { ProvenanceLabel } from "@/types/provenance";

export type { ProvenanceLabel };

interface ProvenanceTagProps {
  label: ProvenanceLabel;
  source?: string;
  vintage?: string;
  className?: string;
}

const STYLES: Record<
  ProvenanceLabel,
  { classes: string; Icon: typeof CheckCircle2; description: string }
> = {
  VERIFIED: {
    classes:
      "border-michigan-forest/30 bg-michigan-forest/10 text-michigan-forest-deep",
    Icon: CheckCircle2,
    description: "Confirmed from a primary federal or state source.",
  },
  MODELED: {
    classes:
      "border-michigan-teal/30 bg-michigan-teal/10 text-michigan-teal-deep",
    Icon: Calculator,
    description: "Derived or calculated from verified inputs.",
  },
  PROJECTED: {
    classes:
      "border-michigan-gold/30 bg-michigan-gold/10 text-michigan-gold-deep",
    Icon: TrendingUp,
    description: "Forward-looking estimate.",
  },
  PENDING: {
    classes:
      "border-michigan-slate/30 bg-michigan-slate/10 text-muted-foreground",
    Icon: Clock,
    description: "This metric has not been ingested yet.",
  },
};

/**
 * Provenance chip rendered next to a metric. Clicking, focusing, or tapping
 * the chip opens a popover with the source + vintage and a one-click link
 * to the full source ledger. The popover is keyboard-accessible by virtue of
 * the underlying Radix Popover primitive (Enter / Space open it, Escape
 * closes it, Tab moves focus into the content).
 *
 * The native `title` attribute is kept on the trigger as a fallback for
 * hover users and assistive technology that reads it before the popover
 * opens.
 */
export function ProvenanceTag({
  label,
  source,
  vintage,
  className,
}: ProvenanceTagProps) {
  const { classes, Icon, description } = STYLES[label];
  const provenance = [source, vintage].filter(Boolean).join(" - ");
  const title = provenance
    ? `${description} ${provenance}. Click to open source.`
    : `${description} Click for source ledger.`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            classes,
            className,
          )}
          title={title}
          aria-label={`Provenance: ${label}${source ? `. Source: ${source}` : ""}. Click for source ledger.`}
        >
          <Icon className="h-2.5 w-2.5" aria-hidden="true" />
          {label}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 text-xs" align="start">
        <p className="font-semibold text-foreground text-[11px] uppercase tracking-wider mb-1.5">
          {label}
        </p>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
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
