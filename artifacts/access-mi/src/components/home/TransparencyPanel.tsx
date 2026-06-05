import { Link } from "react-router-dom";
import { ShieldCheck, Database, Clock, ExternalLink } from "lucide-react";
import {
  DATA_SOURCE_DISPLAY,
  COUNTIES_COVERED,
  PLATFORM_FRESHNESS,
} from "@/config/platformConstants";

const STATS = [
  {
    icon: Database,
    label: "Source Organizations",
    value: DATA_SOURCE_DISPLAY,
    detail: "Federal, state, and nonprofit publishers",
  },
  {
    icon: ShieldCheck,
    label: "Counties Covered",
    value: String(COUNTIES_COVERED),
    detail: "Every Michigan county",
  },
  {
    icon: Clock,
    label: "Last Verified",
    value: PLATFORM_FRESHNESS.lastVerified,
    detail: `Last pulled ${PLATFORM_FRESHNESS.lastPulled}`,
  },
];

export default function TransparencyPanel() {
  return (
    <section className="py-6 border-b border-border/30">
      <div className="container max-w-4xl">
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">
              Data Transparency
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center space-y-1">
                <s.icon className="h-4 w-4 text-primary mx-auto" />
                <div className="text-lg font-bold text-foreground tabular-nums">
                  {s.value}
                </div>
                <div className="text-[11px] text-muted-foreground leading-tight">
                  {s.detail}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 justify-center text-xs">
            <Link
              to="/methodology"
              className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
            >
              Methodology <ExternalLink className="h-3 w-3" />
            </Link>
            <Link
              to="/data-sources"
              className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
            >
              All Sources <ExternalLink className="h-3 w-3" />
            </Link>
            <Link
              to="/changelog"
              className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
            >
              Changelog <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
