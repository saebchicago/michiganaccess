import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DataTimestampProps {
  table: "facilities" | "community_resources" | "financial_programs" | "quality_metrics";
  label?: string;
}

export default function DataTimestamp({ table, label = "Data last refreshed" }: DataTimestampProps) {
  const [date, setDate] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const col = table === "quality_metrics" ? "updated_at" : "updated_at";
      const { data } = await supabase
        .from(table as "facilities")
        .select("updated_at")
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();
      const row = data as { updated_at?: string } | null;
      if (row?.updated_at) {
        setDate(new Date(row.updated_at).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric",
        }));
      }
    })();
  }, [table]);

  if (!date) return null;

  return (
    <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
      <Clock className="h-2.5 w-2.5" />
      {label}: {date}
    </p>
  );
}
