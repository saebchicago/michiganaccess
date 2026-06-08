/**
 * Neighborhood Health Score - composite 0-100 from CDC PLACES data.
 * Higher = healthier community. THIS IS AN ILLUSTRATIVE COMPOSITE.
 */

// Measure names must match CDC PLACES API short_question_text exactly
const SCORE_MEASURES: { measure: string; stateAvg: number; weight: number; lowerIsBetter: boolean }[] = [
  { measure: "Diabetes", stateAvg: 12.1, weight: 1.2, lowerIsBetter: true },
  { measure: "Obesity", stateAvg: 36.4, weight: 1.0, lowerIsBetter: true },
  { measure: "Current Asthma", stateAvg: 11.2, weight: 0.8, lowerIsBetter: true },
  { measure: "Depression", stateAvg: 23.8, weight: 1.0, lowerIsBetter: true },
  { measure: "Current Cigarette Smoking", stateAvg: 18.7, weight: 1.0, lowerIsBetter: true },
  { measure: "Physical Inactivity", stateAvg: 27.6, weight: 0.8, lowerIsBetter: true },
  { measure: "Health Insurance", stateAvg: 6.8, weight: 1.2, lowerIsBetter: true },
  { measure: "General Health", stateAvg: 20.1, weight: 1.0, lowerIsBetter: true },
  { measure: "Annual Checkup", stateAvg: 76.3, weight: 0.8, lowerIsBetter: false },
  { measure: "Dental Visit", stateAvg: 62.1, weight: 0.6, lowerIsBetter: false },
  { measure: "Frequent Mental Distress", stateAvg: 17.2, weight: 1.0, lowerIsBetter: true },
  { measure: "Any Disability", stateAvg: 30.3, weight: 0.6, lowerIsBetter: true },
];

export function computeHealthScore(zipData: Record<string, number>) {
  let totalWeight = 0;
  let weightedScore = 0;
  const strengths: string[] = [];
  const concerns: string[] = [];

  for (const m of SCORE_MEASURES) {
    const val = zipData[m.measure];
    if (val == null) continue;

    const ratio = m.lowerIsBetter
      ? m.stateAvg > 0 ? (m.stateAvg - val) / m.stateAvg : 0
      : m.stateAvg > 0 ? (val - m.stateAvg) / m.stateAvg : 0;

    const clamped = Math.max(-1, Math.min(1, ratio));
    const measureScore = 50 + clamped * 50;

    weightedScore += measureScore * m.weight;
    totalWeight += m.weight;

    if (measureScore >= 60) strengths.push(m.measure);
    if (measureScore <= 40) concerns.push(m.measure);
  }

  const score = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
  const tier = getAccessTier(score);
  const color = score >= 80 ? "#22c55e" : score >= 65 ? "#84cc16" : score >= 50 ? "#eab308" : score >= 35 ? "#f97316" : "#ef4444";

  return { score, grade: tier.badge, color, strengths: strengths.slice(0, 3), concerns: concerns.slice(0, 3), tier };
}

export interface AccessTier {
  tier: number;
  label: string;
  badge: string;
  color: string;
  context: string;
  opportunity: string;
}

export function getAccessTier(score: number): AccessTier {
  if (score >= 80) return {
    tier: 1,
    label: "Strong Access",
    badge: "Tier 1 - Strong Access",
    color: "text-emerald-600",
    context: "This ZIP ranks among Michigan's strongest for healthcare access.",
    opportunity: "Model community for replication strategies.",
  };
  if (score >= 60) return {
    tier: 2,
    label: "Moderate Access",
    badge: "Tier 2 - Moderate Access",
    color: "text-teal-600",
    context: "This ZIP is near the Michigan average for healthcare access.",
    opportunity: "Targeted investments could move this community to Tier 1.",
  };
  if (score >= 40) return {
    tier: 3,
    label: "Limited Access",
    badge: "Tier 3 - Limited Access",
    color: "text-amber-600",
    context: "This ZIP faces notable gaps in healthcare access.",
    opportunity: "Priority area for ambulatory network expansion.",
  };
  if (score >= 20) return {
    tier: 4,
    label: "Priority Access Area",
    badge: "Tier 4 - Priority Access Area",
    color: "text-orange-700",
    context: "This ZIP is in the bottom 40% for healthcare access in Michigan.",
    opportunity: "High-opportunity area for health investment and FQHC expansion.",
  };
  return {
    tier: 5,
    label: "Critical Access Area",
    badge: "Tier 5 - Critical Access Area",
    color: "text-red-700",
    context: "This ZIP faces critical gaps across health, economic, and access dimensions.",
    opportunity: "Highest-priority area for state and federal health equity investment.",
  };
}
