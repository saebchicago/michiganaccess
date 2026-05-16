import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  county?: string;
  placeSlug?: string;
}

export default function CommunityReportCounts({ county, placeSlug }: Props) {
  const { data: counts } = useQuery({
    queryKey: ["community-reports-count", county, placeSlug],
    queryFn: async () => {
      let query = (supabase as any).from("community_reports").select("category", { count: "exact", head: false });
      if (county) query = query.eq("county", county);
      if (placeSlug) query = query.eq("place_slug", placeSlug);
      const { data, error } = await query;
      if (error) return { total: 0, categories: {} as Record<string, number> };
      const categories: Record<string, number> = {};
      (data || []).forEach((r: any) => {
        categories[r.category] = (categories[r.category] || 0) + 1;
      });
      return { total: (data || []).length, categories };
    },
    staleTime: 1000 * 60 * 10,
  });

  if (!counts || counts.total === 0) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <FileText className="h-3.5 w-3.5" />
      <span>{counts.total} community report{counts.total !== 1 ? "s" : ""}</span>
      {Object.entries(counts.categories).slice(0, 3).map(([cat, count]) => (
        <Badge key={cat} variant="outline" className="text-[9px] h-4 capitalize">
          {cat.replace("_", " ")} ({count})
        </Badge>
      ))}
    </div>
  );
}
