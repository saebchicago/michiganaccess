import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, ExternalLink, Building2, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getCountyUtilityStressSummary,
  stressLevelColor,
  stressLevelBg,
  type UtilityStressLevel,
} from "@/data/utility-stress";

function LevelBadge({ level }: { level: UtilityStressLevel }) {
  const label = level === "unknown" ? "Data pending" : level.charAt(0).toUpperCase() + level.slice(1);
  return (
    <Badge variant="outline" className={`text-[10px] capitalize ${stressLevelColor(level)} ${stressLevelBg(level)} border-0`}>
      {label}
    </Badge>
  );
}

export default function UtilityStressSection({ county }: { county: string }) {
  const summary = getCountyUtilityStressSummary(county);
  const isExample = summary.sourceShort.includes("illustrative") || summary.disconnectionLevel === "unknown";

  return (
    <Card className="border-amber-500/20">
      <CardContent className="py-5 space-y-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Zap className="h-4 w-4 text-amber-600" />
          Utility Customer Stress
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="text-muted-foreground hover:text-foreground" aria-label="About utility stress data">
                  <Info className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-[260px] text-xs">
                Summarizes recent disconnection, arrears, and assistance patterns using Michigan Public Service Commission data. See MPSC for full details.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </h3>

        {isExample && (
          <Badge variant="outline" className="text-[9px] text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/20">
            Example only - utility stress data integration coming soon
          </Badge>
        )}

        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-md border border-border p-2.5 space-y-1">
            <p className="text-xs text-muted-foreground">Disconnection risk</p>
            <LevelBadge level={summary.disconnectionLevel} />
          </div>
          <div className="rounded-md border border-border p-2.5 space-y-1">
            <p className="text-xs text-muted-foreground">Bill arrears stress</p>
            <LevelBadge level={summary.arrearsLevel} />
          </div>
          <div className="rounded-md border border-border p-2.5 space-y-1">
            <p className="text-xs text-muted-foreground">Assistance usage (SER/MEAP/CAP)</p>
            <LevelBadge level={summary.assistanceParticipationLevel} />
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground leading-relaxed">
          These levels summarize recent disconnection, arrears, and assistance patterns using Michigan Public Service Commission data. They are approximate and should be interpreted carefully.
          {summary.asOfQuarter && <> As of {summary.asOfQuarter}.</>}
        </p>

        <a
          href="https://www.michigan.gov/mpsc/consumer/electricity/shut-off-protection"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          See full utility data at the Michigan Public Service Commission
          <ExternalLink className="h-3 w-3" />
        </a>

        {/* For orgs note */}
        <div className="rounded-md bg-muted/30 border border-border p-2.5 mt-2">
          <p className="text-[10px] font-medium text-foreground flex items-center gap-1 mb-1">
            <Building2 className="h-3 w-3" /> For organizations
          </p>
          <ul className="text-[10px] text-muted-foreground space-y-0.5">
            <li>• Hospitals, health plans, and CBOs can use these patterns to target energy-related outreach, care management, and bill assistance navigation.</li>
            <li>• Utilities and regulators can align customer protections and performance with medically vulnerable communities.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
