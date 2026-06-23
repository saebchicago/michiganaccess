import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CloudLightning, CheckCircle2, ChevronDown, ExternalLink, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWeatherAlerts, SEVERITY_COLORS, SEVERITY_BORDER, type WeatherAlert } from "@/hooks/useWeatherAlerts";

function formatExpiry(iso: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

function AlertCard({ alert }: { alert: WeatherAlert }) {
  const [expanded, setExpanded] = useState(false);
  const sevClass = SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS.Unknown;
  const borderClass = SEVERITY_BORDER[alert.severity] || SEVERITY_BORDER.Unknown;

  return (
    <div className={`rounded-lg border ${borderClass} bg-background p-3`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`text-[10px] ${sevClass}`}>{alert.severity}</Badge>
            <span className="text-sm font-semibold text-foreground">{alert.event}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{alert.areaDesc}</p>
          {alert.expires && (
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Expires: {formatExpiry(alert.expires)}
            </p>
          )}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1"
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed whitespace-pre-line">
              {alert.description}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1 italic">- {alert.senderName}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function WeatherAlerts() {
  const { data: alerts, isLoading } = useWeatherAlerts();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Checking NWS weather alerts...</span>
      </div>
    );
  }

  const hasAlerts = alerts && alerts.length > 0;
  const severeCount = alerts?.filter((a) => a.severity === "Extreme" || a.severity === "Severe").length || 0;

  return (
    <Card className={hasAlerts && severeCount > 0 ? "border-red-600/30 bg-red-600/5" : "border-michigan-forest/20 bg-michigan-forest/5"}>
      <CardContent className="py-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {hasAlerts ? (
              <CloudLightning className="h-5 w-5 text-michigan-coral-deep" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-michigan-forest-deep" />
            )}
            <span className="text-sm font-semibold text-foreground">
              {hasAlerts
                ? `${alerts!.length} Active Weather Alert${alerts!.length > 1 ? "s" : ""} for Michigan`
                : "No active NWS alerts for Michigan right now"}
            </span>
          </div>
          <a
            href="https://www.weather.gov/dtx/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
          >
            NWS <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>

        {hasAlerts && (
          <div className="space-y-2">
            {alerts!.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        )}

        <p className="text-[10px] text-muted-foreground mt-2">
          Source: National Weather Service - updated every 10 minutes
        </p>
      </CardContent>
    </Card>
  );
}
