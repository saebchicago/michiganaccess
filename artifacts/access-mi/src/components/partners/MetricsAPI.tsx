import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Mail, Shield, FileText } from "lucide-react";

const METRICS_FEATURES = [
  {
    icon: BarChart3,
    title: "Aggregated Usage Metrics",
    description:
      "Page-level satisfaction rates, resource category utilization, and county-level engagement - fully anonymized.",
  },
  {
    icon: Shield,
    title: "Aggregated, Non-Identifying Design",
    description:
      "No individual user attribution. All metrics are aggregated at the page or county level.",
  },
  {
    icon: FileText,
    title: "CHNA-Ready Reports",
    description:
      "Export feedback data in formats compatible with Community Health Needs Assessments and IRS Schedule H reporting.",
  },
];

export default function MetricsAPI() {
  return (
    <section aria-labelledby="metrics-heading">
      <div className="text-center mb-8">
        <Badge className="bg-accent/10 text-accent-foreground border-accent/20 mb-3">
          <BarChart3 className="h-3 w-3 mr-1" />
          Anonymous Metrics
        </Badge>
        <h2 id="metrics-heading" className="text-2xl font-bold text-foreground">
          Share Impact Without Sharing Data
        </h2>
        <p className="mt-2 text-muted-foreground max-w-2xl mx-auto text-sm">
          Access aggregated, non-identifiable platform metrics for community
          benefit reporting, grant applications, and population health
          benchmarking.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {METRICS_FEATURES.map((f) => (
          <Card key={f.title} className="h-full">
            <CardHeader className="pb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent-foreground mb-2">
                <f.icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">{f.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        {/* Metrics exports are fulfilled by staff on request. The former
            one-click download called a service-role endpoint that returned raw
            free-text feedback comments to any anonymous visitor. */}
        <Button asChild className="bg-gradient-michigan">
          <a href="mailto:partners@accessmi.org?subject=Aggregated%20metrics%20request">
            <Mail className="h-4 w-4 mr-2" />
            Request an Aggregated Metrics Report
          </a>
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          Reviewed and sent by our team · Aggregated satisfaction rates · No
          personal data or free-text comments included
        </p>
      </div>
    </section>
  );
}
