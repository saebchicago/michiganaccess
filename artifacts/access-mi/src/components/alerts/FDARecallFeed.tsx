import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ExternalLink,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FDARecall {
  recallNumber: string;
  productDescription: string;
  reason: string;
  classification: string;
  recallingFirm: string;
  city: string;
  state: string;
  reportDate: string;
}

const CLASS_COLORS: Record<string, string> = {
  "Class I": "bg-red-600 text-white",
  "Class II": "bg-amber-500 text-white",
  "Class III": "bg-gray-400 text-white",
};

async function fetchMichiganFoodRecalls(): Promise<FDARecall[]> {
  try {
    const res = await fetch(
      'https://api.fda.gov/food/enforcement.json?search=state:"Michigan"&limit=8&sort=report_date:desc',
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).map((r: any) => ({
      recallNumber: r.recall_number || "",
      productDescription: (r.product_description || "").substring(0, 150),
      reason: r.reason_for_recall || "",
      classification: r.classification || "",
      recallingFirm: r.recalling_firm || "",
      city: r.city || "",
      state: r.state || "",
      reportDate: r.report_date || "",
    }));
  } catch {
    return [];
  }
}

function formatDate(raw: string) {
  if (!raw || raw.length < 8) return raw;
  return `${raw.substring(4, 6)}/${raw.substring(6, 8)}/${raw.substring(0, 4)}`;
}

export default function FDARecallFeed() {
  const { data: recalls, isLoading } = useQuery({
    queryKey: ["fda-food-recalls-mi"],
    queryFn: fetchMichiganFoodRecalls,
    staleTime: 6 * 60 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Checking FDA recalls...
          </span>
        </CardContent>
      </Card>
    );
  }

  const hasRecalls = recalls && recalls.length > 0;

  return (
    <Card
      className={
        hasRecalls ? "border-amber-500/20" : "border-michigan-forest/20"
      }
    >
      <CardHeader className="pb-2">
        <h2 className="text-base font-semibold leading-none tracking-tight flex items-center gap-2">
          {hasRecalls ? (
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-michigan-forest-deep" />
          )}
          Michigan Food Safety Recalls
        </h2>
      </CardHeader>
      <CardContent className="space-y-2">
        {hasRecalls ? (
          recalls!.map((r) => (
            <div
              key={r.recallNumber}
              className="rounded-lg border border-border p-3 space-y-1"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs text-foreground line-clamp-2">
                  {r.productDescription}
                </p>
                <Badge
                  className={`text-[8px] shrink-0 ${CLASS_COLORS[r.classification] || "bg-gray-400 text-white"}`}
                >
                  {r.classification}
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">{r.reason}</p>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>
                  {r.recallingFirm}
                  {r.city ? `, ${r.city}` : ""}
                </span>
                <span>{formatDate(r.reportDate)}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">
            No recent Michigan food recalls.
          </p>
        )}
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground">
            Source: FDA openFDA - Michigan food enforcement
          </p>
          <a
            href="https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
          >
            All Recalls <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
