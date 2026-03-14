/**
 * CHNA Planner Notes — actionable bullet insights and discussion questions.
 */
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";
import { COUNTY_PROFILES } from "@/data/michigan-county-profiles";
import { getCountyCrossDomain, MI_STATE_AVERAGES } from "@/data/cross-domain-indicators";

function getVal(hh: { label: string; value: string }[] | undefined, search: string): number {
  if (!hh) return NaN;
  const v = hh.find((h) => h.label.toLowerCase().includes(search.toLowerCase()))?.value;
  return v ? parseFloat(v) : NaN;
}

export default function CHNAPlannerNotes({ county }: { county: string }) {
  const profile = COUNTY_PROFILES[county];
  if (!profile) return null;

  const cd = getCountyCrossDomain(county);
  const uninsured = getVal(profile.healthHighlights, "uninsured");
  const food = getVal(profile.healthHighlights, "food");

  const insights: string[] = [];

  if (!isNaN(uninsured) && uninsured > 7) {
    insights.push(`Uninsured rate (${uninsured}%) exceeds the state average — coverage outreach should be a priority.`);
  }
  if (!isNaN(food) && food > 13.5) {
    insights.push(`Food insecurity (${food}%) is above the state norm — consider food pharmacy or pantry partnerships.`);
  }
  if (cd.rentBurden !== null && cd.rentBurden > (MI_STATE_AVERAGES.rentBurden ?? 30)) {
    insights.push(`Housing cost burden (${cd.rentBurden}% rent-burdened) may drive housing instability and health impacts.`);
  }
  if (cd.vehicleAccess !== null && cd.vehicleAccess < (MI_STATE_AVERAGES.vehicleAccess ?? 92)) {
    insights.push(`Lower vehicle access (${cd.vehicleAccess}%) suggests NEMT and transit partnerships are critical.`);
  }

  if (insights.length === 0) {
    insights.push("Key indicators are near or below state averages — focus on maintaining access and monitoring trends.");
  }

  const questions = [
    "Which community organizations are already addressing the highest-priority domains?",
    "Are current interventions reaching the most affected populations in this county?",
    "What data gaps need to be closed before the next CHNA cycle?",
    "How can VBC incentives be aligned with the county's most urgent SDOH needs?",
  ];

  return (
    <Card className="border-primary/20">
      <CardContent className="py-5 space-y-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <ClipboardList className="h-4 w-4 text-primary" />
          Planner Notes — {county} County
        </h3>
        <div className="space-y-2">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Key Insights</p>
          <ul className="space-y-1.5">
            {insights.map((line, i) => (
              <li key={i} className="text-xs text-foreground/80 leading-relaxed flex items-start gap-1.5">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0" />
                {line}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-2 border-t border-border/40 pt-3">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Questions for Your Next CHNA or VBC Meeting</p>
          <ol className="space-y-1.5">
            {questions.map((q, i) => (
              <li key={i} className="text-xs text-foreground/70 leading-relaxed flex items-start gap-1.5">
                <span className="text-primary font-bold text-[10px] mt-0.5 shrink-0">{i + 1}.</span>
                {q}
              </li>
            ))}
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
