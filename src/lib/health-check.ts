export interface HealthCheckResult {
  name: string;
  status: "ok" | "degraded" | "down";
  latencyMs: number;
  lastChecked: string;
  affects: string;
}

const ENDPOINTS = [
  { name: "CDC PLACES", url: "https://data.cdc.gov/resource/qnzd-25i4.json?$limit=1", timeout: 10000, affects: "ZIP Intelligence Builder" },
  { name: "NWS Weather", url: "https://api.weather.gov/alerts/active?area=MI", timeout: 5000, affects: "Weather Alert Banner", headers: { "User-Agent": "accessmi.org" } },
  { name: "FDA Recalls", url: "https://api.fda.gov/food/enforcement.json?limit=1", timeout: 5000, affects: "FDA Recall Feed" },
  { name: "ClinicalTrials.gov", url: "https://clinicaltrials.gov/api/v2/studies?pageSize=1", timeout: 8000, affects: "Clinical Trials Search" },
];

export async function runHealthChecks(): Promise<HealthCheckResult[]> {
  return Promise.all(
    ENDPOINTS.map(async (ep) => {
      const start = Date.now();
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), ep.timeout);
        const res = await fetch(ep.url, {
          signal: controller.signal,
          headers: (ep as any).headers || {},
        });
        clearTimeout(timer);
        return {
          name: ep.name,
          status: res.ok ? "ok" as const : "degraded" as const,
          latencyMs: Date.now() - start,
          lastChecked: new Date().toISOString(),
          affects: ep.affects,
        };
      } catch {
        return {
          name: ep.name,
          status: "down" as const,
          latencyMs: Date.now() - start,
          lastChecked: new Date().toISOString(),
          affects: ep.affects,
        };
      }
    })
  );
}
