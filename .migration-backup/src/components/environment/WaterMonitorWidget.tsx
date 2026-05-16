import { Droplets, ExternalLink, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWaterData, type WaterSite } from "@/hooks/useWaterData";

function flowStatus(cfs: number | null): { label: string; className: string } {
  if (cfs === null) return { label: "—", className: "text-muted-foreground" };
  if (cfs > 5000) return { label: "High", className: "text-michigan-coral font-semibold" };
  if (cfs > 1000) return { label: "Above Normal", className: "text-michigan-gold font-semibold" };
  return { label: "Normal", className: "text-michigan-forest" };
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  } catch {
    return "—";
  }
}

function SiteRow({ site }: { site: WaterSite }) {
  const status = flowStatus(site.streamflow);

  return (
    <tr className="border-b border-border/50 last:border-0">
      <td className="py-2.5 pr-3">
        <a
          href={`https://waterdata.usgs.gov/nwis/uv?site_no=${site.siteNumber}`}
          target="_blank"
          rel="noopener"
          className="text-sm font-medium text-foreground hover:text-primary hover:underline transition-colors"
        >
          {site.siteName}
        </a>
      </td>
      <td className="py-2.5 pr-3 text-right">
        <span className="text-sm tabular-nums font-mono text-foreground">
          {site.streamflow !== null ? site.streamflow.toLocaleString() : "—"}
        </span>
      </td>
      <td className="py-2.5 pr-3 text-right">
        <span className="text-sm tabular-nums font-mono text-foreground">
          {site.gageHeight !== null ? site.gageHeight.toFixed(1) : "—"}
        </span>
      </td>
      <td className="py-2.5 pr-3">
        <span className={`text-xs ${status.className}`}>{status.label}</span>
      </td>
      <td className="py-2.5 text-right">
        <span className="text-[10px] text-muted-foreground">{formatTime(site.dateTime)}</span>
      </td>
    </tr>
  );
}

export default function WaterMonitorWidget() {
  const { data, isLoading } = useWaterData();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading stream data...</span>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Droplets className="h-5 w-5 text-michigan-teal" />
          Live Michigan Stream & River Monitoring
        </CardTitle>
        <CardDescription>
          Real-time streamflow and gage height from USGS monitoring sites
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-michigan-forest" /> Normal
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-michigan-gold" /> Above Normal
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-michigan-coral" /> High
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-2 text-xs font-medium text-muted-foreground">Site</th>
                <th className="pb-2 text-xs font-medium text-muted-foreground text-right">Flow (cfs)</th>
                <th className="pb-2 text-xs font-medium text-muted-foreground text-right">Gage (ft)</th>
                <th className="pb-2 text-xs font-medium text-muted-foreground">Status</th>
                <th className="pb-2 text-xs font-medium text-muted-foreground text-right">Updated</th>
              </tr>
            </thead>
            <tbody>
              {data.map((site) => (
                <SiteRow key={site.siteNumber} site={site} />
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            Source:{" "}
            <a
              href="https://waterdata.usgs.gov/state/michigan/"
              target="_blank"
              rel="noopener"
              className="text-primary hover:underline inline-flex items-center gap-0.5"
            >
              USGS National Water Information System <ExternalLink className="h-2.5 w-2.5" />
            </a>{" "}
            — updated every 15 minutes
          </p>
          <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
            <a href="https://waterdata.usgs.gov/state/michigan/" target="_blank" rel="noopener">
              Full Data <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
