// netlify/functions/epa-echo-facilities.js
// CORS proxy for EPA ECHO (Enforcement and Compliance History Online).
// Public REST API, no key required, but does not allow cross-origin browser
// fetches. The function forwards a county/state query and relays the JSON
// response with our CORS headers in place.

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
    "Cache-Control": "public, max-age=43200, s-maxage=43200",
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

  const params = event.queryStringParameters || {};
  const state = (params.state || "MI").toUpperCase();
  const county = params.county || "";

  if (!/^[A-Z]{2}$/.test(state)) {
    return {
      statusCode: 400,
      headers: getCors(event),
      body: JSON.stringify({ error: "state must be a 2-letter US state code" }),
    };
  }
  if (!county || !/^[A-Za-z .'-]{1,60}$/.test(county)) {
    return {
      statusCode: 400,
      headers: getCors(event),
      body: JSON.stringify({ error: "county must be a county name" }),
    };
  }

  try {
    const url =
      "https://echodata.epa.gov/echo/dfr_rest_services.get_facilities" +
      `?output=JSON&p_st=${state}` +
      `&p_county=${encodeURIComponent(county)}` +
      "&p_act=Y&qcolumns=1,2,3,4,5,8,9,10,13,14,22,23";
    const upstream = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    if (!upstream.ok) {
      console.error("epa-echo-facilities upstream error:", upstream.status);
      return {
        statusCode: upstream.status === 429 ? 429 : 502,
        headers: getCors(event),
        body: JSON.stringify({
          error:
            upstream.status === 429
              ? "Rate limit exceeded"
              : "EPA ECHO upstream error",
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
    console.error("epa-echo-facilities error:", err && err.message);
    return {
      statusCode: 502,
      headers: getCors(event),
      body: JSON.stringify({ error: "EPA ECHO proxy failure" }),
    };
  }
}
