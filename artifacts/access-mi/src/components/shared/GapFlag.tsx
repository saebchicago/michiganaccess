import { Landmark, ArrowRight, FileSearch } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  getGapById,
  GAP_LANE_LABELS,
  GAP_STATUS_LABELS,
} from "@/data/openDataGaps";

interface GapFlagProps {
  /** Id of an entry in OPEN_DATA_GAPS. Renders nothing for unknown ids. */
  gapId: string;
  className?: string;
}

/**
 * The "known gap" flag - a sibling of ProvenanceTag for the places where the
 * honest answer is "this data does not exist here, and here is why."
 *
 * ProvenanceTag answers "where did this number come from?"; GapFlag answers
 * "why is there no number?" Everything it shows comes from the openDataGaps
 * registry, where each gap claim carries its own citation and the tone rules
 * (two lanes, no blame language) are enforced by test.
 */
export function GapFlag({ gapId, className }: GapFlagProps) {
  const gap = getGapById(gapId);
  if (!gap) return null;

  const isOurs = gap.lane === "not-yet-ingested";
  const Icon = isOurs ? FileSearch : Landmark;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            "border-michigan-blue/30 bg-michigan-blue/5 text-michigan-blue",
            className,
          )}
          title={`Known data gap: ${gap.title}. Click for details.`}
          aria-label={`Known data gap: ${gap.title}. ${GAP_LANE_LABELS[gap.lane]}. Click for details.`}
        >
          <Icon className="h-2.5 w-2.5" aria-hidden="true" />
          Data gap
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 text-xs" align="start">
        <p className="font-semibold text-foreground text-[11px] uppercase tracking-wider">
          {gap.title}
        </p>
        <p className="mt-1 inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {GAP_LANE_LABELS[gap.lane]} · {GAP_STATUS_LABELS[gap.status]}
        </p>
        <p className="mt-2 text-muted-foreground leading-relaxed">
          {gap.whatIsMissing}
        </p>
        {gap.statedReason && (
          <p className="mt-1.5 text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground/80">
              Stated reason:
            </span>{" "}
            {gap.statedReason}
          </p>
        )}
        {gap.noStatedReason && (
          <p className="mt-1.5 text-muted-foreground leading-relaxed italic">
            No published reason - the data has simply never been released.
          </p>
        )}
        <p className="mt-1.5 text-foreground/80 leading-relaxed">
          <span className="font-semibold">Holds the data:</span> {gap.holder}
        </p>
        <p className="mt-1 text-[10px] text-muted-foreground">
          Gap citation: {gap.gapSource.name}
        </p>
        <Link
          to={`/data-gaps#${gap.id}`}
          className="mt-3 inline-flex items-center gap-1 text-primary hover:underline text-[11px] font-medium"
        >
          See all open data gaps
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </PopoverContent>
    </Popover>
  );
}
