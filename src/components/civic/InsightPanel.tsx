import { useMemo } from "react";
import { BarChart3, MapPin, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface InsightPanelProps {
  data: Record<string, unknown>[];
  datasetName: string;
}

/**
 * Auto-detect insight type and render accordingly:
 * - Numeric fields → summary stat
 * - Geographic fields → geographic summary
 * - Fallback → plain-language explanation
 */
export default function InsightPanel({ data, datasetName }: InsightPanelProps) {
  const insight = useMemo(() => {
    if (data.length === 0) {
      return { type: "empty" as const, message: "No data available yet for this dataset." };
    }

    const sample = data[0];
    const keys = Object.keys(sample);

    // Check for numeric fields
    const numericKeys = keys.filter((k) => typeof sample[k] === "number");
    if (numericKeys.length > 0) {
      const key = numericKeys[0];
      const values = data.map((r) => Number(r[key])).filter((v) => !isNaN(v));
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      return {
        type: "numeric" as const,
        field: key,
        avg: avg.toFixed(1),
        min,
        max,
        count: values.length,
      };
    }

    // Check for geographic fields
    const geoKeys = keys.filter((k) =>
      ["county", "city", "neighborhood", "region", "district", "zip", "address"].includes(
        k.toLowerCase()
      )
    );
    if (geoKeys.length > 0) {
      const geoKey = geoKeys[0];
      const uniquePlaces = new Set(data.map((r) => String(r[geoKey] ?? "Unknown")));
      return {
        type: "geographic" as const,
        field: geoKey,
        uniqueCount: uniquePlaces.size,
        total: data.length,
      };
    }

    // Fallback
    return {
      type: "summary" as const,
      recordCount: data.length,
      fieldCount: keys.length,
    };
  }, [data]);

  return (
    <Card className="border-dashed">
      <CardContent className="py-4 space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px]">
            Auto-Insight
          </Badge>
          <span className="text-xs font-semibold text-foreground">{datasetName}</span>
        </div>

        {insight.type === "numeric" && (
          <div className="flex items-start gap-3">
            <BarChart3 className="h-5 w-5 text-primary mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Average <span className="text-muted-foreground font-normal">{insight.field}</span>:{" "}
                <span className="text-primary font-bold">{insight.avg}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Range: {insight.min} – {insight.max} across {insight.count} records
              </p>
            </div>
          </div>
        )}

        {insight.type === "geographic" && (
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-foreground">
                <span className="text-primary font-bold">{insight.uniqueCount}</span> unique{" "}
                {insight.field} values
              </p>
              <p className="text-xs text-muted-foreground">
                Across {insight.total} records in the dataset
              </p>
            </div>
          </div>
        )}

        {insight.type === "summary" && (
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-primary mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-foreground">
                <span className="text-primary font-bold">{insight.recordCount}</span> records with{" "}
                {insight.fieldCount} data fields
              </p>
            </div>
          </div>
        )}

        {insight.type === "empty" && (
          <p className="text-xs text-muted-foreground">{insight.message}</p>
        )}

        <p className="text-[11px] text-muted-foreground border-t border-border/50 pt-2 mt-2">
          <strong>What this means for residents:</strong>{" "}
          {insight.type === "numeric"
            ? `This dataset contains measurable indicators that can help track trends and identify areas needing attention in your community.`
            : insight.type === "geographic"
            ? `This data covers multiple locations, helping residents understand how conditions vary across different areas.`
            : `This public dataset is available for civic transparency and community awareness.`}
        </p>
      </CardContent>
    </Card>
  );
}
