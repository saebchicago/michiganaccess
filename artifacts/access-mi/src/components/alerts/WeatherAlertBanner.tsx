import { useState } from "react";
import { CloudLightning, ChevronDown, X } from "lucide-react";
import { useWeatherAlerts } from "@/hooks/useWeatherAlerts";
import { motion, AnimatePresence } from "framer-motion";

// Backgrounds chosen for WCAG 2.1 AA contrast against the white
// text-xs / font-medium banner content. Minor was previously
// bg-blue-500 (~2.8:1 with white) which failed AA; bg-blue-700 puts
// the ratio above 7:1.
const SEV_BG: Record<string, string> = {
  Extreme: "bg-red-800 text-white",
  Severe: "bg-red-700 text-white",
  Moderate: "bg-amber-700 text-white",
  Minor: "bg-blue-700 text-white",
};

export default function WeatherAlertBanner() {
  const { data: alerts } = useWeatherAlerts();
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (!alerts || alerts.length === 0 || dismissed) return null;

  const top = alerts.slice(0, 3);
  const primary = top[0];
  const bg = SEV_BG[primary.severity] || SEV_BG.Minor;

  return (
    <div className={`${bg} print:hidden`}>
      <div className="container flex items-center gap-2 py-1.5 text-sm">
        <CloudLightning className="h-4 w-4 shrink-0" aria-hidden="true" />
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 text-left text-xs font-medium truncate"
        >
          {primary.event} - {primary.areaDesc?.split(";")[0]}
          {top.length > 1 && (
            <span className="ml-1 font-semibold">+{top.length - 1} more</span>
          )}
        </button>
        <button
          onClick={() => setExpanded(!expanded)}
          className="shrink-0 p-0.5"
          aria-label="Toggle alerts"
        >
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 p-0.5"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="container pb-2 space-y-1">
              {top.map((a) => (
                <div key={a.id} className="text-[11px] opacity-90">
                  <strong>{a.event}</strong> -{" "}
                  {a.areaDesc?.split(";").slice(0, 3).join(", ")}
                  {a.expires && (
                    <span className="opacity-70">
                      {" "}
                      · Until{" "}
                      {new Date(a.expires).toLocaleString("en-US", {
                        weekday: "short",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              ))}
              <p className="text-[9px] opacity-60">
                Source: National Weather Service
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
