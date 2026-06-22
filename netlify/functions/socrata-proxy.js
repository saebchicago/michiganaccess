// netlify/functions/socrata-proxy.js
// CORS proxy for Socrata Open Data endpoints whose hosts do not send a
// permissive Access-Control-Allow-Origin header. The function forwards the
// caller's query parameters to the upstream JSON endpoint and relays the
// response with our CORS headers in place. The proxy refuses any host that
// is not on the explicit allowlist.

const ALLOWED_ORIGINS = new Set([
  "https://accessmi.org",
  "https://www.accessmi.org",
  "http://localhost:5173",
  "http://localhost:4173",
  "http://localhost:8080",
  "http://localhost:8088",
]);

// Only these Socrata hosts are proxied. Add a host here if (and only if) a
// production CORS failure is confirmed for it.
const ALLOWED_HOSTS = new Set(["data.detroitmi.gov"]);

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
    // Open data is slow-changing for the use cases on /county/wayne; cache
    // at the edge for ten minutes.
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

  const params = event.queryStringParameters || {};
  const endpoint = params.endpoint || "";
  if (!endpoint) {
    return {
      statusCode: 400,
      headers: getCors(event),
      body: JSON.stringify({ error: "endpoint query parameter is required" }),
    };
  }

  let target;
  try {
    target = new URL(endpoint);
  } catch {
    return {
      statusCode: 400,
      headers: getCors(event),
      body: JSON.stringify({ error: "endpoint must be a valid URL" }),
    };
  }
  if (target.protocol !== "https:" || !ALLOWED_HOSTS.has(target.host)) {
    return {
      statusCode: 400,
      headers: getCors(event),
      body: JSON.stringify({ error: "endpoint host is not allowed" }),
    };
  }

  // Forward every query param except our own `endpoint`. Preserves Socrata
  // SoQL params ($limit, $offset, $select, $where, $order, ...).
  for (const [k, v] of Object.entries(params)) {
    if (k === "endpoint") continue;
    target.searchParams.set(k, v);
  }

  try {
    const upstream = await fetch(target.toString(), {
      headers: { Accept: "application/json" },
    });
    if (!upstream.ok) {
      console.error(
        "socrata-proxy upstream error:",
        upstream.status,
        target.host,
      );
      return {
        statusCode: upstream.status === 429 ? 429 : 502,
        headers: getCors(event),
        body: JSON.stringify({
          error:
            upstream.status === 429 ? "Rate limit exceeded" : "Upstream error",
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
    console.error("socrata-proxy error:", err && err.message);
    return {
      statusCode: 502,
      headers: getCors(event),
      body: JSON.stringify({ error: "Socrata proxy failure" }),
    };
  }
}
