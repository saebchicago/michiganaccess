const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Michigan center coordinates for radius search
const MI_LAT = 44.3148;
const MI_LNG = -85.6024;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get("limit") || "50"), 100);

    // Try HRSA HDW API (GetHealthCentersByArea with Michigan FIPS = 26)
    const apiUrl = `https://data.hrsa.gov/HDWAPI3_External/api/v1/GetHealthCentersByArea?StateFips=26`;
    console.log("Fetching HRSA data from:", apiUrl);

    const response = await fetch(apiUrl, {
      headers: { Accept: "application/json" },
    });

    const contentType = response.headers.get("content-type") || "";

    if (response.ok && contentType.includes("json")) {
      const data = await response.json();
      const rawResults = data.HCC || data.Results || data || [];

      if (Array.isArray(rawResults) && rawResults.length > 0) {
        const results = rawResults.slice(0, limit).map((item: any) => ({
          name: item.SITE_NM || item.Name || "Health Center",
          address: item.SITE_ADDRESS || item.Address || "",
          city: item.SITE_CITY || item.City || "",
          state: item.SITE_STATE_ABBR || "MI",
          zip: item.SITE_ZIP || item.Zip || "",
          phone: item.SITE_TELEPHONE || item.Phone || "",
          lat: parseFloat(item.GEOCODING_ARTIFACT_ADDRESS_PRIMARY_Y_COORDINATE || item.Latitude || "0") || null,
          lng: parseFloat(item.GEOCODING_ARTIFACT_ADDRESS_PRIMARY_X_COORDINATE || item.Longitude || "0") || null,
          type: "fqhc",
          website: item.SITE_URL || "",
        }));

        return new Response(
          JSON.stringify({ results, count: results.length, source: "HRSA Health Center Data", cached_at: new Date().toISOString() }),
          { headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=3600" } }
        );
      }
    }

    // Fallback: try the GetHealthCentersAroundALocation (center of Michigan, large radius)
    console.log("Primary failed, trying location-based fallback...");
    const fallbackUrl = `https://data.hrsa.gov/HDWAPI3_External/api/v1/GetHealthCentersAroundALocation?Latitude=${MI_LAT}&Longitude=${MI_LNG}&Radius=200&MinRecs=${limit}`;

    const fallbackRes = await fetch(fallbackUrl, {
      headers: { Accept: "application/json" },
    });

    const fbContentType = fallbackRes.headers.get("content-type") || "";

    if (fallbackRes.ok && fbContentType.includes("json")) {
      const fbData = await fallbackRes.json();
      const fbResults = fbData.HCC || fbData.Results || fbData || [];

      if (Array.isArray(fbResults) && fbResults.length > 0) {
        const results = fbResults.slice(0, limit).map((item: any) => ({
          name: item.SITE_NM || item.Name || "Health Center",
          address: item.SITE_ADDRESS || item.Address || "",
          city: item.SITE_CITY || item.City || "",
          state: item.SITE_STATE_ABBR || "MI",
          zip: item.SITE_ZIP || item.Zip || "",
          phone: item.SITE_TELEPHONE || item.Phone || "",
          lat: parseFloat(item.GEOCODING_ARTIFACT_ADDRESS_PRIMARY_Y_COORDINATE || item.Latitude || "0") || null,
          lng: parseFloat(item.GEOCODING_ARTIFACT_ADDRESS_PRIMARY_X_COORDINATE || item.Longitude || "0") || null,
          type: "fqhc",
          website: item.SITE_URL || "",
        }));

        return new Response(
          JSON.stringify({ results, count: results.length, source: "HRSA Health Center Locator", cached_at: new Date().toISOString() }),
          { headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=3600" } }
        );
      }
    }

    // Both failed — return graceful fallback
    console.error("All HRSA endpoints returned non-JSON or empty");
    return new Response(
      JSON.stringify({ error: "HRSA API unavailable", results: [], count: 0, fallback: true, source: "HRSA" }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("HRSA proxy error:", error);
    return new Response(
      JSON.stringify({ error: String(error), results: [], count: 0, fallback: true }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
