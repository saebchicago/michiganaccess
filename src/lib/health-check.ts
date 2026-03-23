/**
 * Health check — verifies external APIs are responding.
 * Results stored for status page display.
 */

export interface HealthCheckResult {
  name: string;
  status: "ok" | "degraded" | "down";
  latencyMs: number;
  lastChecked: string;
}

const CHECKS = [
  { name: "CDC PLACES", url: "https://data.cdc.gov/resource/qnzd-25i4.json?$limit=1", timeout: 8000 },
  { name: "NWS Weather", url: "https://api.weather.gov/alerts/active?area=MI&limit=1", timeout: 5000, headers: { "User-Agent": "accessmi.org" } },
  { name: "FDA Recalls", url: "https://api.fda.gov/food/enforcement.json?limit=1", timeout: 5000 },
];

export async function runHealthChecks(): Promise<HealthCheckResult[]> {
  return Promise.all(
    CHECKS.map(async (check) => {
      const start = Date.now();
      try {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), check.timeout);
        const res = await fetch(check.url, {
          signal: controller.signal,
          headers: (check as any).headers || {},
        });
        clearTimeout(t);
        return {
          name: check.name,
          status: res.ok ? "ok" as const : "degraded" as const,
          latencyMs: Date.now() - start,
          lastChecked: new Date().toISOString(),
        };
      } catch {
        return {
          name: check.name,
          status: "down" as const,
          latencyMs: Date.now() - start,
          lastChecked: new Date().toISOString(),
        };
      }
    })
  );
}
