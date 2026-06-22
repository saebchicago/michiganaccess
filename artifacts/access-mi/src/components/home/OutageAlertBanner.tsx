import { Link } from "react-router-dom";
import { Zap, AlertTriangle, ArrowRight, X } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useOutageData } from "@/hooks/useOutageData";
import { useCounty } from "@/contexts/CountyContext";

export default function OutageAlertBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { county } = useCounty();
  const { data } = useOutageData();

  if (dismissed || !data) return null;

  const { zones, meta } = data;

  const relevantZones = county
    ? zones.filter((z) => z.county === county && z.severity !== "none")
    : zones.filter((z) => z.severity !== "none");

  if (relevantZones.length === 0) return null;

  const totalAffected = relevantZones.reduce(
    (s, z) => s + z.customersAffected,
    0,
  );
  const criticalCount = relevantZones.filter(
    (z) => z.severity === "critical" || z.severity === "high",
  ).length;
  const isCritical = criticalCount > 0;

  const label = county
    ? `${relevantZones.length} active outage${relevantZones.length !== 1 ? "s" : ""} in ${county} County`
    : `${relevantZones.length} active outage${relevantZones.length !== 1 ? "s" : ""} across Michigan`;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className={`border-b ${isCritical ? "border-destructive/30 bg-destructive/10" : "border-amber-500/30 bg-amber-500/10"}`}
    >
      <div className="container flex items-center justify-between gap-3 py-2.5">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {isCritical ? (
            <AlertTriangle
              className="h-4 w-4 text-destructive shrink-0 animate-pulse"
              aria-hidden="true"
            />
          ) : (
            <Zap
              className="h-4 w-4 text-amber-500 shrink-0"
              aria-hidden="true"
            />
          )}
          <p
            className={`text-xs font-medium truncate ${isCritical ? "text-destructive" : "text-amber-600 dark:text-amber-300"}`}
          >
            <strong className="font-extrabold">{label}</strong>
            <span className="hidden sm:inline">
              {" · "}
              {totalAffected.toLocaleString()} customers affected
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/outages"
            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
              isCritical
                ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                : "bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-700 dark:text-amber-300"
            }`}
          >
            Outage Tracker
            <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            to="/health-map"
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Map
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded hover:bg-foreground/10 transition-colors"
            aria-label="Dismiss outage alert"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
