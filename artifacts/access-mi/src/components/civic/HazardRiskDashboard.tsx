import { ExternalLink, AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const FEMA_LINKS = [
  {
    body: "FEMA Resilience Analysis and Planning Tool (RAPT)",
    url: "https://www.fema.gov/emergency-managers/practitioners/resilience-analysis-and-planning-tool",
    label: "View county risk data",
  },
  {
    body: "FEMA National Risk Index",
    url: "https://www.fema.gov/flood-maps/products-tools/national-risk-index",
    label: "NRI overview and methodology",
  },
];

export default function HazardRiskDashboard() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-5 w-5 text-michigan-coral" />
          Michigan County Hazard Risk
        </CardTitle>
        <CardDescription>
          County-level hazard risk data is published by FEMA. View current
          expected annual loss, social vulnerability, and community resilience
          figures at the National Risk Index.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {FEMA_LINKS.map((item) => (
            <div
              key={item.body}
              className="flex flex-col gap-2 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="font-semibold text-foreground">{item.body}</p>
              <a
                href={item.url}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline shrink-0"
              >
                {item.label} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          FEMA updates National Risk Index data annually. The standalone NRI map
          was retired December 2025; current figures are available through RAPT.
        </p>
      </CardContent>
    </Card>
  );
}
