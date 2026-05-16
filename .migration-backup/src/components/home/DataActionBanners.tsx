import { Link } from "react-router-dom";
import { AlertTriangle, Zap, ArrowRight } from "lucide-react";
import { useCounty } from "@/contexts/CountyContext";
import { motion } from "framer-motion";

/**
 * Conditional alert strips that surface when county data shows
 * high uninsured rates or energy burden. Renders below KPI cards
 * inside HealthDataSnapshot.
 */

// Same COUNTY_KPIS structure used in HealthDataSnapshot
const COUNTY_UNINSURED: Record<string, number> = {
  Wayne: 7.2, Oakland: 4.8, Macomb: 5.6, Kent: 6.8, Genesee: 7.9,
  Washtenaw: 3.9, Ingham: 6.5, Kalamazoo: 6.1, Saginaw: 7.4,
  Ottawa: 5.1, "Grand Traverse": 8.2, Marquette: 6.4, Berrien: 7.3,
  Livingston: 4.2,
};

const COUNTY_ENERGY_BURDEN: Record<string, number> = {
  Wayne: 8.1, Oakland: 4.2, Macomb: 5.8, Kent: 5.5, Genesee: 9.2,
  Washtenaw: 4.0, Ingham: 5.9, Kalamazoo: 5.6, Saginaw: 8.5,
  Ottawa: 4.5, "Grand Traverse": 6.3, Marquette: 7.8, Berrien: 7.5,
  Livingston: 4.1,
};

export default function DataActionBanners() {
  const { county } = useCounty();
  if (!county) return null;

  const uninsured = COUNTY_UNINSURED[county];
  const energyBurden = COUNTY_ENERGY_BURDEN[county];
  const showUninsured = uninsured !== undefined && uninsured > 8;
  const showEnergy = energyBurden !== undefined && energyBurden > 7;

  if (!showUninsured && !showEnergy) return null;

  return (
    <div className="space-y-2 mt-4">
      {showUninsured && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2"
        >
          <div className="flex items-center gap-2 flex-1">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
            <p className="text-xs text-amber-200">
              <strong>High uninsured rate detected in {county} County ({uninsured}%).</strong>{" "}
              Enroll in Medicaid or find sliding-scale clinics.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link to="/find-care" className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 px-3 py-1.5 text-[11px] font-medium text-amber-300 transition-colors">
              Find Care <ArrowRight className="h-3 w-3" />
            </Link>
            <Link to="/financial-help" className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 px-3 py-1.5 text-[11px] font-medium text-amber-300 transition-colors">
              Financial Help <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </motion.div>
      )}

      {showEnergy && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2"
        >
          <div className="flex items-center gap-2 flex-1">
            <Zap className="h-4 w-4 text-blue-400 shrink-0" />
            <p className="text-xs text-blue-200">
              <strong>High energy burden detected in {county} County ({energyBurden}%).</strong>{" "}
              Apply for LIHEAP or explore weatherization programs.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link to="/financial-help" className="inline-flex items-center gap-1 rounded-md bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 px-3 py-1.5 text-[11px] font-medium text-blue-300 transition-colors">
              Apply for LIHEAP <ArrowRight className="h-3 w-3" />
            </Link>
            <Link to="/environment" className="inline-flex items-center gap-1 rounded-md bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 px-3 py-1.5 text-[11px] font-medium text-blue-300 transition-colors">
              Weatherization <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
