import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Aggregate feedback by page — no personal data exposed
    const { data: feedback, error } = await supabase
      .from("page_feedback")
      .select("page_path, is_helpful, comment, created_at");

    if (error) {
      console.error("Feedback query error:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch feedback" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Aggregate: group by page_path, count helpful/not, collect anonymized comments
    const aggregated: Record<string, {
      page: string;
      total: number;
      helpful: number;
      not_helpful: number;
      satisfaction_rate: number;
      comments: string[];
      period_start: string;
      period_end: string;
    }> = {};

    for (const row of feedback || []) {
      const page = row.page_path;
      if (!aggregated[page]) {
        aggregated[page] = {
          page,
          total: 0,
          helpful: 0,
          not_helpful: 0,
          satisfaction_rate: 0,
          comments: [],
          period_start: row.created_at,
          period_end: row.created_at,
        };
      }
      const agg = aggregated[page];
      agg.total++;
      if (row.is_helpful) agg.helpful++;
      else agg.not_helpful++;
      if (row.comment) agg.comments.push(row.comment);
      if (row.created_at < agg.period_start) agg.period_start = row.created_at;
      if (row.created_at > agg.period_end) agg.period_end = row.created_at;
    }

    // Calculate satisfaction rates
    const pages = Object.values(aggregated).map((agg) => ({
      ...agg,
      satisfaction_rate: agg.total > 0 ? Math.round((agg.helpful / agg.total) * 100) : 0,
      comments: agg.comments.slice(0, 20), // limit comments per page
    }));

    // Sort by total feedback volume
    pages.sort((a, b) => b.total - a.total);

    const report = {
      generated_at: new Date().toISOString(),
      total_responses: (feedback || []).length,
      total_pages_reviewed: pages.length,
      overall_satisfaction_rate: (feedback || []).length > 0
        ? Math.round(((feedback || []).filter(f => f.is_helpful).length / (feedback || []).length) * 100)
        : 0,
      note: "Anonymous aggregated feedback — no personal data collected. Suitable for CHNA reporting.",
      pages,
    };

    return new Response(JSON.stringify(report, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("feedback-export error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
