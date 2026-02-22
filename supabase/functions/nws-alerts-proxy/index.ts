import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

let cachedData: { alerts: unknown[]; ts: number } | null = null;
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const county = url.searchParams.get("county")?.trim() || "";

    // Return cached if fresh
    if (cachedData && Date.now() - cachedData.ts < CACHE_TTL) {
      const filtered = county
        ? cachedData.alerts.filter((a: any) =>
            a.county?.toLowerCase().includes(county.toLowerCase()) ||
            a.areaDesc?.toLowerCase().includes(county.toLowerCase())
          )
        : cachedData.alerts;
      return new Response(JSON.stringify({ alerts: filtered }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const res = await fetch("https://api.weather.gov/alerts/active?area=MI", {
      headers: { "User-Agent": "AccessMichigan/1.0 (saeb@fulbrightmail.org)" },
    });

    if (!res.ok) {
      throw new Error(`NWS API returned ${res.status}`);
    }

    const json = await res.json();
    const features = json.features || [];

    const alerts = features.slice(0, 50).map((f: any) => ({
      id: f.properties?.id || f.id,
      event: f.properties?.event || "Unknown",
      headline: f.properties?.headline || "",
      description: (f.properties?.description || "").slice(0, 300),
      severity: f.properties?.severity || "Unknown",
      urgency: f.properties?.urgency || "Unknown",
      areaDesc: f.properties?.areaDesc || "",
      effective: f.properties?.effective || "",
      expires: f.properties?.expires || "",
      senderName: f.properties?.senderName || "NWS",
    }));

    cachedData = { alerts, ts: Date.now() };

    const filtered = county
      ? alerts.filter((a: any) =>
          a.areaDesc?.toLowerCase().includes(county.toLowerCase())
        )
      : alerts;

    return new Response(JSON.stringify({ alerts: filtered }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error("NWS proxy error:", err);
    return new Response(JSON.stringify({ alerts: [], error: "Failed to fetch weather alerts" }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
