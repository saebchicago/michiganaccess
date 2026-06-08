import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Download, Shield, FileText } from "lucide-react";
import { toast } from "sonner";

const METRICS_FEATURES = [
  {
    icon: BarChart3,
    title: "Aggregated Usage Metrics",
    description: "Page-level satisfaction rates, resource category utilization, and county-level engagement - fully anonymized.",
  },
  {
    icon: Shield,
    title: "Privacy-First Design",
    description: "No individual user tracking, no cookies, no PII. All metrics are aggregated at the page or county level.",
  },
  {
    icon: FileText,
    title: "CHNA-Ready Reports",
    description: "Export feedback data in formats compatible with Community Health Needs Assessments and IRS Schedule H reporting.",
  },
];

export default function MetricsAPI() {
  const handleExport = async () => {
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL ?? "https://znahhtdbcgepezrxwnah.supabase.co"}/functions/v1/feedback-export`;
      const resp = await fetch(url, {
        headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
      });
      if (!resp.ok) throw new Error("Export failed");
      const data = await resp.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `michigan-access-metrics-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      toast.success("Metrics report downloaded");
    } catch {
      toast.error("Unable to export metrics. Please try again.");
    }
  };

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
          Access aggregated, non-identifiable platform metrics for community benefit reporting, grant applications, and population health benchmarking.
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
        <Button onClick={handleExport} className="bg-gradient-michigan">
          <Download className="h-4 w-4 mr-2" />
          Download Sample Metrics Report
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          JSON format · Aggregated satisfaction rates · No personal data included
        </p>
      </div>
    </section>
  );
}
