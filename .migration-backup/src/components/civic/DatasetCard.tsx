import { Link } from "react-router-dom";
import {
  Heart,
  Leaf,
  Bus,
  Home,
  Shield,
  GraduationCap,
  Landmark,
  ArrowRight,
  Database,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CivicSource, CivicSourceCategory } from "@/data/civicSources";

const CATEGORY_ICONS: Record<CivicSourceCategory, typeof Heart> = {
  health: Heart,
  environment: Leaf,
  transport: Bus,
  housing: Home,
  safety: Shield,
  education: GraduationCap,
  civic: Landmark,
};

const CATEGORY_COLORS: Record<CivicSourceCategory, string> = {
  health: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  environment: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  transport: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  housing: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  safety: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  education: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  civic: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
};

interface DatasetCardProps {
  source: CivicSource;
  recordCount?: number;
  lastUpdated?: Date | null;
}

export default function DatasetCard({ source, recordCount, lastUpdated }: DatasetCardProps) {
  const Icon = CATEGORY_ICONS[source.category] ?? Database;
  const colorClass = CATEGORY_COLORS[source.category] ?? CATEGORY_COLORS.civic;

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${colorClass}`}>
            <Icon className="h-4.5 w-4.5" aria-hidden="true" />
          </div>
          <Badge variant="outline" className="text-[10px] shrink-0">
            {source.provider}
          </Badge>
        </div>

        <div>
          <h3 className="font-semibold text-sm text-foreground leading-tight mb-1">
            {source.name}
          </h3>
          {source.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {source.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <Badge variant="secondary" className="text-[10px] capitalize">
            {source.category}
          </Badge>
          <span className="capitalize">{source.geography}</span>
          {recordCount !== undefined && <span>{recordCount.toLocaleString()} records</span>}
          {lastUpdated && (
            <span className="ml-auto" aria-label={`Last refreshed ${lastUpdated.toLocaleDateString()}`}>
              {lastUpdated.toLocaleDateString()}
            </span>
          )}
        </div>

        <Link to={`/civic-data?dataset=${source.id}`} className="block">
          <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs mt-1">
            Explore Dataset <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
