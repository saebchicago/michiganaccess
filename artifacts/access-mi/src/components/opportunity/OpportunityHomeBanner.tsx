import { ArrowRight, MapPinned } from "lucide-react";
import { Link } from "react-router-dom";

/** Homepage-only flagship rail. Kept outside the existing Index component so
 * the Opportunity Atlas can ship without duplicating or destabilizing the
 * editorial homepage's tightly governed destination taxonomy. */
export function OpportunityHomeBanner() {
  return (
    <div className="border-b border-emerald-950/15 bg-emerald-950 text-emerald-50">
      <div className="container flex min-h-11 max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm">
        <div className="flex items-center gap-2">
          <MapPinned className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="font-semibold">Community Opportunity Atlas</span>
          <span className="hidden text-emerald-100/80 sm:inline">
            What stands out here - and what could change it?
          </span>
        </div>
        <Link
          to="/opportunity"
          className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 font-semibold underline decoration-emerald-300/50 underline-offset-4 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-100"
        >
          Explore your community
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
