import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";
import { IRS_ZIP_DATA, MI_IRS_STATE_AVERAGES } from "@/data/irs-zip-income";

interface Props {
  zip: string;
}

function ComparisonBar({ label, value, stateAvg, format = "pct" }: { label: string; value: number; stateAvg: number; format?: "pct" | "dollar" }) {
  const maxVal = Math.max(value, stateAvg) * 1.2;
  const valuePct = (value / maxVal) * 100;
  const statePct = (stateAvg / maxVal) * 100;
  const isAbove = value > stateAvg;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">
          {format === "dollar" ? `$${value.toLocaleString()}` : `${value}%`}
        </span>
      </div>
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${isAbove ? "bg-michigan-blue" : "bg-michigan-teal"}`}
          style={{ width: `${valuePct}%` }}
        />
        <div
          className="absolute inset-y-0 w-0.5 bg-foreground/40"
          style={{ left: `${statePct}%` }}
          title={`MI avg: ${format === "dollar" ? `$${stateAvg.toLocaleString()}` : `${stateAvg}%`}`}
        />
      </div>
      <div className="text-[10px] text-muted-foreground">
        MI avg: {format === "dollar" ? `$${stateAvg.toLocaleString()}` : `${stateAvg}%`}
      </div>
    </div>
  );
}

export default function IRSIncomeCard({ zip }: Props) {
  const data = IRS_ZIP_DATA[zip];
  if (!data) return null;

  return (
    <Card className="border-michigan-blue/20">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-michigan-blue" />
          <h4 className="text-sm font-semibold text-foreground">IRS Income Data</h4>
          <Badge variant="outline" className="text-[9px] ml-auto">{data.city}</Badge>
        </div>

        <ComparisonBar
          label="Average AGI"
          value={data.avgAGI}
          stateAvg={MI_IRS_STATE_AVERAGES.avgAGI}
          format="dollar"
        />

        <ComparisonBar
          label="EITC Claim Rate"
          value={data.eitcPct}
          stateAvg={MI_IRS_STATE_AVERAGES.eitcPct}
        />

        <div className="rounded-md bg-muted/50 px-3 py-2 text-xs text-foreground">
          {data.eitcPct}% of filers claim EITC - ${(data.eitcTotalAmount / 1000000).toFixed(1)}M total claimed
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-0.5">
            <p className="text-[10px] text-muted-foreground">Charitable Giving</p>
            <p className="text-sm font-semibold">{data.charitablePct}%</p>
            <p className="text-[10px] text-muted-foreground">
              avg ${data.avgCharitable.toLocaleString()} (MI: ${MI_IRS_STATE_AVERAGES.avgCharitable.toLocaleString()})
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] text-muted-foreground">Self-Employed</p>
            <p className="text-sm font-semibold">{data.selfEmployedPct}%</p>
            <p className="text-[10px] text-muted-foreground">
              MI avg: {MI_IRS_STATE_AVERAGES.selfEmployedPct}%
            </p>
          </div>
        </div>

        <p className="text-[9px] text-muted-foreground">
          Source: IRS Statistics of Income, Tax Year 2021. irs.gov/statistics/soi-tax-stats
        </p>
      </CardContent>
    </Card>
  );
}
