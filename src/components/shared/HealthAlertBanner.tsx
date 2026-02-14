import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info, X, ShieldAlert, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useHealthAlerts, type HealthAlert } from "@/hooks/useHealthAlerts";
import { Button } from "@/components/ui/button";

const DISMISSED_KEY = "michigan-access-dismissed-alerts";

function getDismissed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]");
  } catch {
    return [];
  }
}

function setDismissed(ids: string[]) {
  localStorage.setItem(DISMISSED_KEY, JSON.stringify(ids));
}

const severityConfig = {
  critical: {
    icon: ShieldAlert,
    bg: "bg-destructive/10 border-destructive/30",
    text: "text-destructive",
    badge: "bg-destructive text-destructive-foreground",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-michigan-gold/10 border-michigan-gold/30",
    text: "text-michigan-gold",
    badge: "bg-michigan-gold text-white",
  },
  info: {
    icon: Info,
    bg: "bg-primary/5 border-primary/20",
    text: "text-primary",
    badge: "bg-primary text-primary-foreground",
  },
};

export default function HealthAlertBanner() {
  const { t } = useTranslation();
  const { data: alerts = [] } = useHealthAlerts();
  const [dismissed, setDismissedState] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setDismissedState(getDismissed());
  }, []);

  const visible = alerts.filter((a) => !dismissed.includes(a.id));
  if (visible.length === 0) return null;

  const dismiss = (id: string) => {
    const next = [...dismissed, id];
    setDismissedState(next);
    setDismissed(next);
  };

  const dismissAll = () => {
    const next = [...dismissed, ...visible.map((a) => a.id)];
    setDismissedState(next);
    setDismissed(next);
  };

  const getSeverityLabel = (severity: string) => {
    if (severity === "critical") return t("alerts.alert");
    if (severity === "warning") return t("alerts.advisory");
    return t("alerts.info");
  };

  const topAlert = visible[0];
  const remaining = visible.slice(1);
  const config = severityConfig[topAlert.severity];
  const Icon = config.icon;

  return (
    <div className="border-b" role="alert" aria-live="polite">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={topAlert.id}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className={`${config.bg} border-b`}
        >
          <div className="container flex items-start gap-3 py-2.5">
            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${config.text}`} aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${config.badge}`}>
                  {getSeverityLabel(topAlert.severity)}
                </span>
                <span className="text-xs font-semibold text-foreground">{topAlert.title}</span>
                <span className="text-[10px] text-muted-foreground">· {topAlert.source}</span>
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">{topAlert.description}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {remaining.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-1.5 text-[10px]"
                  onClick={() => setExpanded(!expanded)}
                  aria-label={expanded ? "Collapse alerts" : `Show ${remaining.length} more`}
                >
                  +{remaining.length}
                  {expanded ? <ChevronUp className="ml-0.5 h-3 w-3" /> : <ChevronDown className="ml-0.5 h-3 w-3" />}
                </Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => dismiss(topAlert.id)}
                aria-label="Dismiss alert"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </motion.div>

        {expanded &&
          remaining.map((alert) => {
            const c = severityConfig[alert.severity];
            const AlertIcon = c.icon;
            return (
              <motion.div
                key={alert.id}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className={`${c.bg} border-b`}
              >
                <div className="container flex items-start gap-3 py-2">
                  <AlertIcon className={`mt-0.5 h-4 w-4 shrink-0 ${c.text}`} aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${c.badge}`}>
                        {getSeverityLabel(alert.severity)}
                      </span>
                      <span className="text-xs font-semibold text-foreground">{alert.title}</span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{alert.description}</p>
                  </div>
                  <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => dismiss(alert.id)} aria-label="Dismiss alert">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
      </AnimatePresence>

      {visible.length > 1 && (
        <div className="container flex justify-end py-1">
          <button onClick={dismissAll} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">
            {t("alerts.dismissAll")}
          </button>
        </div>
      )}
    </div>
  );
}
