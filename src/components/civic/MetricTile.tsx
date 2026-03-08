import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface MetricTileProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: "up" | "down" | "stable";
  badge?: string;
  badgeVariant?: "default" | "destructive" | "outline" | "secondary";
  onClick?: () => void;
  className?: string;
}

const trendConfig = {
  up: { icon: TrendingUp, className: "text-accent" },
  down: { icon: TrendingDown, className: "text-destructive" },
  stable: { icon: Minus, className: "text-muted-foreground" },
};

export default function MetricTile({
  label,
  value,
  subtext,
  trend,
  badge,
  badgeVariant = "outline",
  onClick,
  className,
}: MetricTileProps) {
  const TrendIcon = trend ? trendConfig[trend].icon : null;
  const trendClass = trend ? trendConfig[trend].className : "";

  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "rounded-lg border border-border bg-card p-4 text-left transition-shadow",
        onClick && "cursor-pointer hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
      aria-label={onClick ? `${label}: ${value}` : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground leading-tight">{label}</p>
        {TrendIcon && (
          <TrendIcon className={cn("h-3.5 w-3.5 shrink-0", trendClass)} aria-label={`Trend: ${trend}`} />
        )}
      </div>
      <p className="mt-1.5 text-xl font-bold text-foreground tabular-nums leading-none break-words">
        {value}
      </p>
      {(subtext || badge) && (
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          {subtext && (
            <p className="text-[11px] text-muted-foreground leading-relaxed">{subtext}</p>
          )}
          {badge && (
            <Badge variant={badgeVariant} className="text-[10px] px-1.5 py-0">
              {badge}
            </Badge>
          )}
        </div>
      )}
    </Wrapper>
  );
}
