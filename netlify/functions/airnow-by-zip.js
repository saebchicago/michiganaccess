// netlify/functions/airnow-by-zip.js
// Secure AirNow proxy - API key stays server-side.
// Accepts ?zip=NNNNN (5-digit US zip) and returns the upstream JSON.

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
    "Cache-Control": "public, max-age=600, s-maxage=600",
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

  const apiKey = process.env.AIRNOW_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: getCors(event),
      body: JSON.stringify({
        error: "AIRNOW_API_KEY not configured on server",
      }),
    };
  }

  const zip = (event.queryStringParameters || {}).zip || "";
  if (!/^\d{5}$/.test(zip)) {
    return {
      statusCode: 400,
      headers: getCors(event),
      body: JSON.stringify({ error: "zip must be a 5-digit US ZIP code" }),
    };
  }

  try {
    const url =
      "https://www.airnowapi.org/aq/observation/zipCode/current/" +
      `?format=application/json&zipCode=${zip}&API_KEY=${encodeURIComponent(apiKey)}`;
    const upstream = await fetch(url);
    if (!upstream.ok) {
      console.error("AirNow upstream error:", upstream.status);
      return {
        statusCode: upstream.status === 429 ? 429 : 502,
        headers: getCors(event),
        body: JSON.stringify({
          error:
            upstream.status === 429
              ? "Rate limit exceeded"
              : "AirNow upstream error",
        }),
      };
    }
    const data = await upstream.json();
    return {
      statusCode: 200,
      headers: getCors(event),
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error("airnow-by-zip error:", err && err.message);
    return {
      statusCode: 502,
      headers: getCors(event),
      body: JSON.stringify({ error: "AirNow proxy failure" }),
    };
  }
}
