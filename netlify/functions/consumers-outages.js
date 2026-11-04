const ODIN = "https://odin.ornl.gov/odi";
const UTILITY_ID = "4254";
const MAX_FEED_AGE_MS = 60 * 60 * 1000;

async function readJson(path) {
  const response = await fetch(`${ODIN}${path}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(6000),
  });
  if (!response.ok) throw new Error("ODIN request failed");
  return response.json();
}

export async function handler(event) {
  const headers = { "Content-Type": "application/json", "Cache-Control": "no-store" };
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, headers: { ...headers, Allow: "GET" }, body: "" };
  }

  try {
    const [status, reports] = await Promise.all([
      readJson("/status"),
      readJson(`/${UTILITY_ID}?format=json&stateCd=26`),
    ]);
    const feed = status.find((row) => row.eiaId === UTILITY_ID);
    const age = Date.now() - Date.parse(feed?.receivedDate);
    if (feed?.hasError !== false || !Number.isFinite(age) || age < 0 || age >= MAX_FEED_AGE_MS) {
      throw new Error("Consumers Energy feed is unavailable or stale");
    }

    const counties = new Map();
    for (const row of reports.outage) {
      if (row.mrid === null && row.communityDescriptor === null && row.metersAffected === null) continue;
      const county = row.communityDescriptor;
      const count = row.metersAffected;
      if (!/^26\d{3}$/.test(county) || !Number.isSafeInteger(count) || count < 0) {
        throw new Error("Unexpected ODIN county report");
      }
      if (counties.has(county)) throw new Error("Duplicate ODIN county report");
      counties.set(county, count);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reportedAt: feed.receivedDate,
        counties: [...counties]
          .filter(([, metersAffected]) => metersAffected > 0)
          .map(([fips, metersAffected]) => ({ fips, metersAffected })),
      }),
    };
  } catch {
    return { statusCode: 503, headers, body: JSON.stringify({ error: "Outage feed unavailable" }) };
  }
}
