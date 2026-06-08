import { RX_KIDS_SUMMARY } from "@/data/maternalHealthData";
import { Baby } from "lucide-react";

interface RxKidsCalloutProps {
  county: string;
}

export default function RxKidsCallout({ county }: RxKidsCalloutProps) {
  const isActive = county === "Genesee";
  const isExpanding = county === "Wayne";
  if (!isActive && !isExpanding) return null;

  return (
    <div className="rounded-xl border border-teal-200 dark:border-teal-900/40 bg-teal-50 dark:bg-teal-950/20 p-4">
      <div className="flex items-start gap-3">
        <Baby className="h-4 w-4 text-teal-600 mt-0.5 shrink-0" />
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-bold text-teal-700 dark:text-teal-400">Rx Kids - National Innovation</span>
            {isActive && <span className="text-[9px] bg-teal-600 text-white px-1.5 py-0.5 rounded font-semibold">ACTIVE IN {county.toUpperCase()}</span>}
            {isExpanding && !isActive && <span className="text-[10px] bg-teal-100 dark:bg-teal-800 text-teal-900 dark:text-teal-200 px-1.5 py-0.5 rounded font-semibold">EXPANDING TO {county.toUpperCase()}</span>}
          </div>
          <p className="text-xs text-teal-800 dark:text-teal-300 mb-2">
            {RX_KIDS_SUMMARY.programName} is the nation's first citywide maternal and infant cash prescription program - {RX_KIDS_SUMMARY.strings.toLowerCase()}. Launched in Flint in January 2024.
          </p>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div className="text-center bg-white/60 dark:bg-black/20 rounded-lg p-2">
              <p className="text-sm font-bold text-teal-700 dark:text-teal-400">{RX_KIDS_SUMMARY.enrollmentRate}%</p>
              <p className="text-[9px] text-teal-800 dark:text-teal-300">of Flint babies enrolled</p>
            </div>
            <div className="text-center bg-white/60 dark:bg-black/20 rounded-lg p-2">
              <p className="text-sm font-bold text-teal-700 dark:text-teal-400">14pp</p>
              <p className="text-[9px] text-teal-800 dark:text-teal-300">PPD reduction</p>
            </div>
            <div className="text-center bg-white/60 dark:bg-black/20 rounded-lg p-2">
              <p className="text-sm font-bold text-teal-700 dark:text-teal-400">4.2pp</p>
              <p className="text-[9px] text-teal-800 dark:text-teal-300">Eviction risk drop</p>
            </div>
          </div>
          <p className="text-[10px] text-teal-800 dark:text-teal-300">Source: Rx Kids Research Brief 2024\u20132025 \u00B7 rxkids.org \u00B7 U-M Poverty Solutions</p>
        </div>
      </div>
    </div>
  );
}
