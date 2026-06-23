import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { ZIP_QUICKSTATS } from "@/data/zip-quickstats";
import { ZIP_RUCA, RURALITY_ICONS } from "@/data/rurality";

interface Props { zip: string; }

export default function ZipQuickStats({ zip }: Props) {
  const data = ZIP_QUICKSTATS[zip];
  if (!data) return null;

  const ruca = ZIP_RUCA[zip];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-border bg-muted/30 px-4 py-2.5">
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <MapPin className="h-3 w-3 text-primary shrink-0" />
        <span className="font-semibold text-foreground">{data.city}, {data.county} County</span>
        {ruca && (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
            {RURALITY_ICONS[ruca.class]} {ruca.class}
          </span>
        )}
        <span className="text-muted-foreground">Pop: ~{data.population.toLocaleString()}</span>
        <span className="h-3 w-px bg-border" />
        <span className="text-muted-foreground">Income: ${data.medianIncome.toLocaleString()}</span>
        <span className="h-3 w-px bg-border" />
        <span className="text-muted-foreground">Rent: ${data.medianRent}</span>
        {data.cityTax !== "0%" && (
          <>
            <span className="h-3 w-px bg-border" />
            <span className="text-michigan-coral-deep font-medium">City Tax: {data.cityTax}</span>
          </>
        )}
      </div>
    </motion.div>
  );
}
