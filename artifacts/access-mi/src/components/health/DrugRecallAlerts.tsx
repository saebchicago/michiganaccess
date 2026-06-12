import { AlertTriangle, CheckCircle2, ExternalLink, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDrugRecalls } from "@/hooks/useDrugRecalls";

const CLASS_COLORS: Record<string, string> = {
  "Class I": "bg-red-600 text-white",
  "Class II": "bg-orange-500 text-white",
  "Class III": "bg-yellow-400 text-black",
};

function formatDate(raw: string) {
  if (!raw || raw.length < 8) return raw;
  return `${raw.substring(4, 6)}/${raw.substring(6, 8)}/${raw.substring(0, 4)}`;
}

export default function DrugRecallAlerts() {
  const { data, isLoading } = useDrugRecalls();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Checking FDA recalls...</span>
        </CardContent>
      </Card>
    );
  }

  const hasRecalls = data && data.length > 0;

  return (
    <Card className={hasRecalls ? "border-red-600/20" : "border-michigan-forest/20"}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          {hasRecalls ? (
            <AlertTriangle className="h-5 w-5 text-red-600" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-michigan-forest" />
          )}
          {hasRecalls ? `${data!.length} Active Class I Drug Recall${data!.length > 1 ? "s" : ""}` : "No active Class I drug recalls. Class I = risk of death or serious injury."}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {hasRecalls && (
          <div className="space-y-2">
            {data!.map((recall) => (
              <div key={recall.recallNumber} className="rounded-lg border border-border p-3 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-foreground leading-snug">{recall.productDescription}</p>
                  <Badge className={`text-[9px] shrink-0 ${CLASS_COLORS[recall.classification] || "bg-gray-400 text-white"}`}>
                    {recall.classification}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground"><strong>Reason:</strong> {recall.reason}</p>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{recall.recallingFirm}{recall.city ? `, ${recall.city}` : ""}{recall.state ? `, ${recall.state}` : ""}</span>
                  <span>{formatDate(recall.reportDate)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground">
            Source: FDA openFDA - Class I recalls (risk of serious injury or death)
          </p>
          <a
            href="https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
          >
            All FDA Recalls <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
