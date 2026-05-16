const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get("limit") || "50"), 100);

    // Use the public findahealthcenter.hrsa.gov API (no auth required)
    const apiUrl = `https://findahealthcenter.hrsa.gov/recapi/api/services?&saddr=Michigan&slat=44.3148&slng=-85.6024&radius=200&pagesize=${limit}`;
    console.log("Fetching HRSA data from:", apiUrl);

    const response = await fetch(apiUrl, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      console.error("HRSA API returned status:", response.status);
      throw new Error(`HRSA API status ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("json")) {
      console.error("HRSA API returned non-JSON content-type:", contentType);
      throw new Error("HRSA API returned non-JSON response");
    }

    const data = await response.json();
    const rawResults = data.provider || data.providers || data.results || [];

    if (Array.isArray(rawResults) && rawResults.length > 0) {
      const results = rawResults.slice(0, limit).map((item: any) => ({
        name: item.name || item.siteName || "Health Center",
        address: item.address || item.siteAddress || "",
        city: item.city || "",
        state: item.state || "MI",
        zip: item.zip || "",
        phone: item.phone || item.telephone || "",
        lat: parseFloat(item.latitude || item.lat || "0") || null,
        lng: parseFloat(item.longitude || item.lng || "0") || null,
        type: "fqhc",
        website: item.website || item.url || "",
      }));

      return new Response(
        JSON.stringify({
          results,
          count: results.length,
          source: "HRSA Health Center Finder",
          cached_at: new Date().toISOString(),
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=3600",
          },
        }
      );
    }

    // If the response structure was unexpected, return what we got for debugging
    console.log("HRSA response keys:", Object.keys(data));
    return new Response(
      JSON.stringify({
        results: [],
        count: 0,
        source: "HRSA Health Center Finder",
        cached_at: new Date().toISOString(),
        debug_keys: Object.keys(data),
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300",
        },
      }
    );
  } catch (error) {
    console.error("HRSA proxy error:", error);
    return new Response(
      JSON.stringify({
        error: String(error),
        results: [],
        count: 0,
        fallback: true,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
