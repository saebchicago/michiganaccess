import { ShieldCheck, Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type DataConfidenceSourceId = "acs" | "cms" | "mdhhs" | "chr" | "other";

export type DataConfidence = {
  score: number; // 0–100
  sources: { id: DataConfidenceSourceId; label: string; present: boolean }[];
};

const SOURCE_LABELS: Record<DataConfidenceSourceId, string> = {
  acs: "Census ACS",
  cms: "CMS",
  mdhhs: "MDHHS",
  chr: "County Health Rankings",
  other: "Other",
};

export function buildDataConfidence(opts: {
  facilityCount: number;
  resourceCount: number;
  highlightCount: number;
  eventCount: number;
  hasMajorSystem: boolean;
  hasPopulation: boolean;
}): DataConfidence {
  let score = 0;
  const sources: DataConfidence["sources"] = [];

  const cms = opts.facilityCount > 0;
  if (cms) score += 25;
  sources.push({ id: "cms", label: SOURCE_LABELS.cms, present: cms });

  const chr = opts.highlightCount >= 3;
  if (chr) score += 20;
  sources.push({ id: "chr", label: SOURCE_LABELS.chr, present: chr });

  const acs = opts.hasPopulation;
  if (acs) score += 10;
  sources.push({ id: "acs", label: SOURCE_LABELS.acs, present: acs });

  const mdhhs = opts.resourceCount >= 3;
  if (mdhhs) score += 20;
  sources.push({ id: "mdhhs", label: SOURCE_LABELS.mdhhs, present: mdhhs });

  if (opts.eventCount > 0) score += 15;
  if (opts.hasMajorSystem) score += 10;

  sources.push({ id: "other", label: "Live Feeds", present: opts.eventCount > 0 });

  return { score: Math.min(score, 100), sources };
}

export default function DataConfidenceCard({ data }: { data: DataConfidence | null }) {
  if (!data) {
    return (
      <Card className="border-muted">
        <CardContent className="py-4 text-center">
          <p className="text-sm text-muted-foreground">We're still validating data for this county.</p>
        </CardContent>
      </Card>
    );
  }

  const level = data.score >= 80 ? "High" : data.score >= 50 ? "Moderate" : "Limited";
  const barColor =
    data.score >= 80
      ? "hsl(var(--michigan-forest))"
      : data.score >= 50
      ? "hsl(var(--michigan-gold))"
      : "hsl(var(--destructive))";
  const textColor =
    data.score >= 80 ? "text-michigan-forest-deep" : data.score >= 50 ? "text-michigan-gold-deep" : "text-destructive";

  return (
    <Card className="border-muted">
      <CardContent className="py-4">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className={`h-5 w-5 ${textColor} flex-shrink-0`} />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Data Confidence</h3>
              <Badge variant="outline" className={`text-xs ${textColor}`}>
                {level} · {data.score}%
              </Badge>
            </div>
            <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${data.score}%`, backgroundColor: barColor }}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {data.sources.map((s) => (
            <Badge
              key={s.id}
              variant="outline"
              className={`text-[10px] gap-1 ${
                s.present ? "border-michigan-forest/30 text-michigan-forest-deep" : "border-muted-foreground/20 text-muted-foreground"
              }`}
            >
              {s.present ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
              {s.label}
            </Badge>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">
          Score reflects the breadth of verified data sources available. Higher scores indicate more real-time feeds.
        </p>
      </CardContent>
    </Card>
  );
}
