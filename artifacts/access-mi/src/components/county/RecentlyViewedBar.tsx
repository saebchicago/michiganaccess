import { Link } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

interface Props {
  currentCounty: string;
  currentSlug: string;
}

export default function RecentlyViewedBar({ currentCounty, currentSlug }: Props) {
  const { recentCounties } = useRecentlyViewed(currentCounty, currentSlug);

  if (recentCounties.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap rounded-lg border border-border bg-muted/30 px-3 py-2">
      <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
        <Clock className="h-3 w-3" /> Recently Viewed
      </span>
      {recentCounties.map((r) => (
        <Link key={r.county} to={`/county/${r.slug}`}>
          <Badge variant="outline" className="text-[10px] cursor-pointer hover:bg-primary/10 transition-colors gap-1">
            {r.county} <ArrowRight className="h-2.5 w-2.5" />
          </Badge>
        </Link>
      ))}
    </div>
  );
}
