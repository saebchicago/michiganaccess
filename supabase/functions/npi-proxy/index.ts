import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const NPI_BASE = "https://npiregistry.cms.hhs.gov/api/?version=2.1";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    // Forward all query params to NPI API
    const params = new URLSearchParams(url.search);
    const npiUrl = `${NPI_BASE}&${params.toString()}`;

    const res = await fetch(npiUrl, {
      headers: { "Accept": "application/json" },
    });

    const data = await res.text();

    return new Response(data, {
      status: res.status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error) {
    console.error("NPI proxy error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch from NPI registry" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
