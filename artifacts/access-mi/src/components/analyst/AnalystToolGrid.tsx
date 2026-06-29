import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IntegrityBadge } from "@/components/chna/IntegrityBadge";
import type { AnalystDashboardEntry } from "@/data/analystDashboardRegistry";

interface AnalystToolGridProps {
  tools: AnalystDashboardEntry[];
  columns?: 2 | 3;
}

export default function AnalystToolGrid({
  tools,
  columns = 3,
}: AnalystToolGridProps) {
  const gridClass =
    columns === 2
      ? "grid gap-4 sm:grid-cols-2"
      : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={gridClass}>
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <Link key={tool.id} to={tool.href}>
            <Card className="h-full hover:shadow-md hover:border-primary/25 transition-all group">
              <CardContent className="py-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <Icon className="h-6 w-6 text-primary shrink-0" />
                  <div className="flex flex-wrap gap-1 justify-end">
                    <Badge variant="outline" className="text-[9px]">
                      {tool.useCase}
                    </Badge>
                    {tool.badge && (
                      <Badge className="text-[9px] bg-primary/10 text-primary border-primary/20">
                        {tool.badge}
                      </Badge>
                    )}
                  </div>
                </div>
                <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                  {tool.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {tool.summary}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <IntegrityBadge
                    label={tool.integrityLabel}
                    source="Dashboard registry"
                    vintage="2026"
                  />
                  <span className="text-[10px] text-primary font-medium flex items-center gap-0.5">
                    Open <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}