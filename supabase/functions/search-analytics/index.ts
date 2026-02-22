import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const url = new URL(req.url);
    const days = parseInt(url.searchParams.get("days") || "30");
    const limitDays = Math.min(Math.max(days, 1), 90);
    const since = new Date(Date.now() - limitDays * 86400000).toISOString();

    // Top search terms (aggregated, no PII)
    const { data: topTerms } = await supabase
      .from("search_analytics")
      .select("search_term, had_correction, corrected_to, result_count, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(1000);

    const rows = topTerms ?? [];

    // Aggregate top terms
    const termCounts: Record<string, { count: number; zeroResults: number }> = {};
    let totalSearches = 0;
    let totalCorrections = 0;
    let totalZeroResults = 0;

    // Daily volume
    const dailyMap: Record<string, number> = {};
    // Source breakdown
    const sourceMap: Record<string, number> = {};

    for (const r of rows) {
      totalSearches++;
      if (r.had_correction) totalCorrections++;
      if (r.result_count === 0) totalZeroResults++;

      const term = r.search_term;
      if (!termCounts[term]) termCounts[term] = { count: 0, zeroResults: 0 };
      termCounts[term].count++;
      if (r.result_count === 0) termCounts[term].zeroResults++;

      const day = r.created_at.slice(0, 10);
      dailyMap[day] = (dailyMap[day] || 0) + 1;
    }

    const topTermsSorted = Object.entries(termCounts)
      .map(([term, data]) => ({ term, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 25);

    const dailyVolume = Object.entries(dailyMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return new Response(
      JSON.stringify({
        totalSearches,
        totalCorrections,
        totalZeroResults,
        correctionRate: totalSearches > 0 ? Math.round((totalCorrections / totalSearches) * 100) : 0,
        zeroResultRate: totalSearches > 0 ? Math.round((totalZeroResults / totalSearches) * 100) : 0,
        topTerms: topTermsSorted,
        dailyVolume,
        period: `${limitDays} days`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch analytics" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
