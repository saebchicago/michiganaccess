import { useQuery } from "@tanstack/react-query";

export interface HealthAlert {
  id: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "critical";
  source: string;
  measure: string;
  county?: string;
  value?: number;
  date: string;
}

// Thresholds for generating alerts from CDC PLACES data
const ALERT_THRESHOLDS: { measure: string; threshold: number; label: string; severity: "warning" | "critical" }[] = [
  { measure: "CASTHMA", threshold: 12, label: "Elevated adult asthma prevalence", severity: "warning" },
  { measure: "OBESITY", threshold: 40, label: "High obesity prevalence", severity: "warning" },
  { measure: "DIABETES", threshold: 14, label: "Elevated diabetes prevalence", severity: "warning" },
  { measure: "BPHIGH", threshold: 35, label: "High blood pressure prevalence", severity: "warning" },
  { measure: "DEPRESSION", threshold: 25, label: "Elevated depression prevalence", severity: "warning" },
  { measure: "STROKE", threshold: 4, label: "Elevated stroke prevalence", severity: "critical" },
];

// Static fallback alerts for when CDC API is unavailable
const FALLBACK_ALERTS: HealthAlert[] = [
  {
    id: "fallback-flu",
    title: "Flu Season Advisory",
    description: "Michigan is experiencing elevated influenza activity. The MDHHS recommends flu vaccination for all residents aged 6 months and older.",
    severity: "info",
    source: "MDHHS",
    measure: "Influenza",
    date: new Date().toISOString(),
  },
  {
    id: "fallback-mental-health",
    title: "Mental Health Resources Available",
    description: "If you or someone you know is struggling, call 988 (Suicide & Crisis Lifeline) or text HOME to 741741. Free, confidential support is available 24/7.",
    severity: "info",
    source: "SAMHSA",
    measure: "Mental Health",
    date: new Date().toISOString(),
  },
];

export function useHealthAlerts() {
  return useQuery<HealthAlert[]>({
    queryKey: ["health-alerts"],
    queryFn: async () => {
      try {
        const url = `${import.meta.env.VITE_SUPABASE_URL ?? "https://znahhtdbcgepezrxwnah.supabase.co"}/functions/v1/cdc-proxy?dataset=places-county&limit=200`;
        const res = await fetch(url, {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          console.warn("CDC API unavailable for alerts, using fallback");
          return FALLBACK_ALERTS;
        }

        const data = await res.json();
        if (!data.results || data.results.length === 0) return FALLBACK_ALERTS;

        const alerts: HealthAlert[] = [];
        const seen = new Set<string>();

        for (const r of data.results) {
          const value = parseFloat(r.data_value || "0");
          const measureId = r.measureid || "";
          const county = r.locationname || "";

          for (const t of ALERT_THRESHOLDS) {
            if (measureId === t.measure && value >= t.threshold) {
              const key = `${t.measure}-${county}`;
              if (seen.has(key)) continue;
              seen.add(key);

              alerts.push({
                id: key,
                title: `${t.label} in ${county} County`,
                description: `${r.measure || t.label}: ${value}${r.data_value_unit || "%"} (${r.data_value_type || "prevalence"}). Data from CDC PLACES ${r.year || "2023"}.`,
                severity: t.severity,
                source: "CDC PLACES",
                measure: t.measure,
                county,
                value,
                date: data.cached_at || new Date().toISOString(),
              });
            }
          }
        }

        // Return top 3 most severe, or fallback if none generated
        const sorted = alerts.sort((a, b) => {
          const sev = { critical: 3, warning: 2, info: 1 };
          return (sev[b.severity] - sev[a.severity]) || (b.value || 0) - (a.value || 0);
        });

        return sorted.length > 0 ? sorted.slice(0, 3) : FALLBACK_ALERTS;
      } catch (e) {
        console.warn("Health alerts fetch failed, using fallback:", e);
        return FALLBACK_ALERTS;
      }
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 0,
  });
}
