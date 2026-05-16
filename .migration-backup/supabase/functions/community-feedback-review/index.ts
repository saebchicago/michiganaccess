import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Require Authorization header with service role key
  const authHeader = req.headers.get("Authorization");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!authHeader || authHeader !== `Bearer ${serviceRoleKey}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey!);

    const url = new URL(req.url);
    const statusFilter = url.searchParams.get("status") ?? "new";
    const pagePath = url.searchParams.get("page");

    let query = supabase
      .from("community_feedback")
      .select(
        "id, page_path, category, element_reference, description, suggested_correction, source_reference, contact_opt_in, status, created_at"
      )
      .order("created_at", { ascending: false });

    if (pagePath) {
      query = query.eq("page_path", pagePath);
    } else {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error("community_feedback query error:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch feedback" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Group by category
    const grouped: Record<string, typeof data> = {};
    for (const row of data ?? []) {
      const cat = row.category ?? "other";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(row);
    }

    return new Response(
      JSON.stringify({
        total: data?.length ?? 0,
        filters: { status: pagePath ? null : statusFilter, page: pagePath ?? null },
        by_category: grouped,
        rows: data,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("community-feedback-review error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
