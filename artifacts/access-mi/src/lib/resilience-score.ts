/**
 * Community Resilience Score - composite 0-100 from multiple dimensions.
 * Higher = more resilient community.
 * THIS IS AN ILLUSTRATIVE COMPOSITE - not a validated resilience index.
 */

export interface ResilienceInput {
  county: string;
  disasterCount: number;
  sbaPerCapita: number;
  medianIncome: number;
  healthScore: number;
  aliceRate: number;
  broadbandPct: number;
}

export interface ResilienceResult {
  score: number;
  grade: string;
  dimensions: {
    disaster: number;
    economic: number;
    health: number;
    safetyNet: number;
    digital: number;
  };
  strengths: string[];
  vulnerabilities: string[];
}

export function computeResilienceScore(input: ResilienceInput): ResilienceResult {
  const disaster = Math.max(0, Math.min(100, 100 - (input.disasterCount / 30) * 100));
  const economic = Math.min(100, (input.sbaPerCapita / 800) * 60 + (input.medianIncome / 100000) * 40);
  const health = Math.max(0, Math.min(100, input.healthScore));
  const safetyNet = Math.max(0, Math.min(100, 100 - (input.aliceRate / 60) * 100));
  const digital = Math.max(0, Math.min(100, input.broadbandPct));

  const score = Math.round(disaster * 0.25 + economic * 0.25 + health * 0.20 + safetyNet * 0.15 + digital * 0.15);
  const grade = score >= 80 ? "Tier 1 - Strong" : score >= 70 ? "Tier 2 - Moderate" : score >= 55 ? "Tier 3 - Limited" : score >= 40 ? "Tier 4 - Priority" : "Tier 5 - Critical";

  const dims = { disaster, economic, health, safetyNet, digital };
  const LABELS: Record<string, string> = {
    disaster: "Disaster Preparedness",
    economic: "Economic Capacity",
    health: "Health Infrastructure",
    safetyNet: "Social Safety Net",
    digital: "Digital Connectivity",
  };
  const dimEntries = Object.entries(dims) as [string, number][];
  const strengths = dimEntries.filter(([, v]) => v >= 70).map(([k]) => LABELS[k] || k);
  const vulnerabilities = dimEntries.filter(([, v]) => v < 40).map(([k]) => LABELS[k] || k);

  return { score, grade, dimensions: dims, strengths, vulnerabilities };
}
