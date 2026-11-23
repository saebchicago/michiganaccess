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
      // Aggregate counts only; individual report text is staff-only.
      const { data, error } = await (supabase as any).rpc("community_report_counts", {
        _county: county ?? null,
        _place_slug: placeSlug ?? null,
      });
      if (error) return { total: 0, categories: {} as Record<string, number> };
      const categories: Record<string, number> = {};
      let total = 0;
      ((data || []) as { category: string; report_count: number | string }[]).forEach((r) => {
        const n = Number(r.report_count);
        categories[r.category] = n;
        total += n;
      });
      return { total, categories };
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
