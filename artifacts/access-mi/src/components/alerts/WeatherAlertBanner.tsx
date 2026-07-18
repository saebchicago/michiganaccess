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

  // Compact dismissible pill (never a full-width band). Sits just under the
  // header; clicking expands a small panel with the active alerts.
  return (
    <div className="container flex justify-start py-1.5 print:hidden">
      <div className="relative">
        <div
          className={`${bg} inline-flex max-w-[90vw] items-center gap-1.5 rounded-full px-3 py-1 text-xs shadow-sm`}
        >
          <CloudLightning className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <button
            onClick={() => setExpanded(!expanded)}
            className="max-w-[60vw] truncate text-left font-medium sm:max-w-xs"
            aria-expanded={expanded}
            aria-label={`Weather alert: ${primary.event}${top.length > 1 ? `, +${top.length - 1} more` : ""}. Click to ${expanded ? "collapse" : "expand"}.`}
          >
            {primary.event}
            {top.length > 1 && (
              <span className="ml-1 font-semibold">+{top.length - 1}</span>
            )}
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 p-0.5"
            aria-label="Toggle alert details"
          >
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 p-0.5"
            aria-label="Dismiss weather alerts"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 top-full z-40 mt-1 w-80 max-w-[90vw] rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-lg"
              role="region"
              aria-label="Active weather alerts"
            >
              <div className="space-y-1.5">
                {top.map((a) => (
                  <div key={a.id} className="text-[11px]">
                    <strong>{a.event}</strong> -{" "}
                    {a.areaDesc?.split(";").slice(0, 3).join(", ")}
                    {a.expires && (
                      <span className="text-muted-foreground">
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
                <p className="text-[9px] text-muted-foreground">
                  Source: National Weather Service
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
