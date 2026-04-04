import { Info } from "lucide-react";

interface FacilityCountDisclosureProps {
  county: string;
}

export function FacilityCountDisclosure({ county }: FacilityCountDisclosureProps) {
  return (
    <div className="flex items-start gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
      <Info className="mt-0.5 h-3 w-3 flex-shrink-0" />
      <span>
        Facility counts for {county} County reflect only providers currently in our database. Additional facilities may
        operate in this area. Data is updated periodically from state licensing records.
      </span>
    </div>
  );
}
