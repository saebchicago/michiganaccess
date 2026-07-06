import { useState, useEffect } from "react";
import { runHealthChecks, type HealthCheckResult } from "@/lib/health-check";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  LIVE_MONITORED_COUNT,
  DATA_SOURCE_DISPLAY,
} from "@/config/platformConstants";

const statusIcon = (s: string) =>
  s === "ok" ? (
    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
  ) : s === "degraded" ? (
    <AlertTriangle className="h-4 w-4 text-amber-500" />
  ) : (
    <XCircle className="h-4 w-4 text-destructive" />
  );

const statusBadge = (s: string) =>
  s === "ok"
    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
    : s === "degraded"
      ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
      : "bg-destructive/10 text-destructive border-destructive/20";

export default function StatusPage2() {
  const [results, setResults] = useState<HealthCheckResult[]>([]);
  const [loading, setLoading] = useState(true);

  usePageMeta({
    title: "System Status - Access Michigan",
    description: "Live API health status for Access Michigan data sources.",
    path: "/status",
  });

  const refresh = async () => {
    setLoading(true);
    const r = await runHealthChecks();
    setResults(r);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const allOk = results.length > 0 && results.every((r) => r.status === "ok");
  const anyDown = results.some((r) => r.status === "down");

  return (
    <Layout>
      <div className="container max-w-2xl py-12 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">System Status</h1>
          <Badge
            className={
              allOk
                ? "bg-emerald-500/10 text-emerald-600"
                : anyDown
                  ? "bg-destructive/10 text-destructive"
                  : "bg-amber-500/10 text-amber-600"
            }
          >
            {loading
              ? "Checking..."
              : allOk
                ? "All Systems Operational"
                : anyDown
                  ? "Service Disruption"
                  : "Partial Degradation"}
          </Badge>
        </div>

        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">External Data Sources</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Monitoring {LIVE_MONITORED_COUNT} of {DATA_SOURCE_DISPLAY}{" "}
                sources with live endpoint checks
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={refresh}
              disabled={loading}
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {results.map((r) => (
              <div
                key={r.name}
                className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  {statusIcon(r.status)}
                  <div>
                    <p className="text-sm font-medium">{r.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      Powers: {r.affects}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className={statusBadge(r.status)}>
                    {r.status === "ok"
                      ? "Operational"
                      : r.status === "degraded"
                        ? "Degraded"
                        : "Down"}
                  </Badge>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {r.latencyMs}ms
                  </p>
                </div>
              </div>
            ))}
            {results.length === 0 && !loading && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No results yet. Click refresh.
              </p>
            )}
          </CardContent>
        </Card>

        <p className="text-[10px] text-muted-foreground text-center">
          These are external government APIs. Access Michigan does not control
          their availability.
          {results.length > 0 &&
            ` Last checked: ${new Date(results[0].lastChecked).toLocaleString()}`}
        </p>
      </div>
    </Layout>
  );
}
