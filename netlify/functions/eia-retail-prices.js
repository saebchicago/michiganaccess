// netlify/functions/eia-retail-prices.js
// Secure EIA proxy - API key stays server-side.
// Returns 12 months of residential electricity retail prices for MI and US.

const ALLOWED_ORIGINS = new Set([
  "https://accessmi.org",
  "https://www.accessmi.org",
  "http://localhost:5173",
  "http://localhost:4173",
  "http://localhost:8080",
  "http://localhost:8088",
]);

function getCors(event) {
  const origin = (event.headers || {}).origin || "";
  const allowedOrigin = ALLOWED_ORIGINS.has(origin)
    ? origin
    : "https://accessmi.org";
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    Vary: "Origin",
    // EIA monthly data is slow-changing; cache at the edge for an hour.
    "Cache-Control": "public, max-age=3600, s-maxage=3600",
  };
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: getCors(event), body: "" };
  }
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: getCors(event),
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const apiKey = process.env.EIA_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: getCors(event),
      body: JSON.stringify({ error: "EIA_API_KEY not configured on server" }),
    };
  }

  try {
    const base = "https://api.eia.gov/v2/electricity/retail-sales/data";
    const common =
      `api_key=${encodeURIComponent(apiKey)}` +
      "&data[]=price&facets[sectorid][]=RES&frequency=monthly" +
      "&sort[0][column]=period&sort[0][direction]=desc&length=12";
    const [miRes, usRes] = await Promise.all([
      fetch(`${base}?${common}&facets[stateid][]=MI`),
      fetch(`${base}?${common}&facets[stateid][]=US`),
    ]);
    if (!miRes.ok || !usRes.ok) {
      console.error("EIA upstream error:", miRes.status, usRes.status);
      const limited = miRes.status === 429 || usRes.status === 429;
      return {
        statusCode: limited ? 429 : 502,
        headers: getCors(event),
        body: JSON.stringify({
          error: limited ? "Rate limit exceeded" : "EIA upstream error",
        }),
      };
    }
    const [miJson, usJson] = await Promise.all([miRes.json(), usRes.json()]);
    return {
      statusCode: 200,
      headers: getCors(event),
      body: JSON.stringify({ mi: miJson, us: usJson }),
    };
  } catch (err) {
    console.error("eia-retail-prices error:", err && err.message);
    return {
      statusCode: 502,
      headers: getCors(event),
      body: JSON.stringify({ error: "EIA proxy failure" }),
    };
  }
}
