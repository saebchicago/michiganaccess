/**
 * Neighborhood Health Score — composite 0-100 from CDC PLACES data.
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
  const grade = score >= 80 ? "A" as const : score >= 65 ? "B" as const : score >= 50 ? "C" as const : score >= 35 ? "D" as const : "F" as const;
  const color = score >= 80 ? "#22c55e" : score >= 65 ? "#84cc16" : score >= 50 ? "#eab308" : score >= 35 ? "#f97316" : "#ef4444";

  return { score, grade, color, strengths: strengths.slice(0, 3), concerns: concerns.slice(0, 3) };
}
