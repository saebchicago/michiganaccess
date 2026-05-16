import { getHOLCData, HOLC_GRADE_CONFIG } from "@/data/redliningData";
import { motion } from "framer-motion";
import { History } from "lucide-react";

interface HistoricalContextCardProps {
  zip: string;
}

export default function HistoricalContextCard({ zip }: HistoricalContextCardProps) {
  const holc = getHOLCData(zip);
  if (!holc) return null;

  const config = HOLC_GRADE_CONFIG[holc.holcGrade];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border ${config.borderColor} ${config.darkBorder} ${config.bgColor} ${config.darkBg} p-4`}>
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/60 dark:bg-black/20">
          <History className={`h-4 w-4 ${config.textColor} ${config.darkText}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${config.textColor} ${config.darkText}`}>
              Historical Context
            </span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold bg-white/60 dark:bg-black/20 ${config.textColor} ${config.darkText}`}>
              HOLC Grade {holc.holcGrade} — {holc.holcLabel}
            </span>
          </div>
          <p className="text-xs text-foreground leading-relaxed mb-2">{holc.historicalDescription}</p>
          {holc.keyFactories && holc.keyFactories.length > 0 && (
            <p className="text-[10px] text-muted-foreground mb-1.5">
              <span className="font-medium">Major closures:</span> {holc.keyFactories.join(" \u00B7 ")}
            </p>
          )}
          <p className="text-xs text-foreground/80 leading-relaxed border-l-2 pl-2 mt-2" style={{ borderColor: config.color }}>
            {holc.currentEquityContext}
          </p>
          <p className="text-[9px] text-muted-foreground/60 mt-2">Source: {holc.source}</p>
        </div>
      </div>
    </motion.div>
  );
}
