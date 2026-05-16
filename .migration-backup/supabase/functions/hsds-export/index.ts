import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * HSDS v3.x Export Endpoint
 *
 * Returns community resources in HSDS-compliant JSON format for 211/CIE interoperability.
 *
 * Query params:
 *   ?county=Wayne  — filter by county
 *   ?limit=50      — limit results (default 50)
 *
 * Open Referral HSDS: https://docs.openreferral.org/
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const county = url.searchParams.get("county");
    const limit = parseInt(url.searchParams.get("limit") || "50");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    let query = supabase.from("community_resources").select("*").limit(limit);
    if (county) query = query.ilike("county", `%${county}%`);

    const { data, error } = await query;
    if (error) throw error;

    // Map to HSDS-like structure
    const hsdsOutput = {
      organizations: (data || []).map((r: any) => ({
        id: r.id,
        name: r.name || r.organization || "",
        description: r.description || "",
        url: r.url || "",
      })),
      services: (data || []).map((r: any) => ({
        id: `svc-${r.id}`,
        organization_id: r.id,
        name: r.name || "",
        description: r.description || "",
        status: "active",
        eligibility_description: r.eligibility || "",
        fees_description: r.fees || "",
      })),
      locations: (data || []).filter((r: any) => r.latitude && r.longitude).map((r: any) => ({
        id: `loc-${r.id}`,
        organization_id: r.id,
        name: r.name || "",
        latitude: r.latitude,
        longitude: r.longitude,
      })),
      meta: {
        total_count: (data || []).length,
        format: "HSDS v3.x compatible",
        source: "Access Michigan",
        generated_at: new Date().toISOString(),
      },
    };

    return new Response(JSON.stringify(hsdsOutput), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
