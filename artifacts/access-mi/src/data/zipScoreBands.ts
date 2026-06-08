export interface ZipScoreBand {
  min: number;
  max: number;
  label: string;
  color: string;
  description: string;
  callToAction: string;
}

export const ZIP_SCORE_BANDS: ZipScoreBand[] = [
  {
    min: 0,
    max: 20,
    label: "Tier 5 - Critical Access Area",
    color: "bg-red-600",
    description:
      "This ZIP faces critical gaps across health, economic, and access dimensions.",
    callToAction:
      "Highest-priority area for state and federal health equity investment.",
  },
  {
    min: 21,
    max: 40,
    label: "Tier 4 - Priority Access Area",
    color: "bg-orange-500",
    description:
      "This ZIP is in the bottom 40% for healthcare access in Michigan.",
    callToAction:
      "High-opportunity area for health investment and FQHC expansion.",
  },
  {
    min: 41,
    max: 60,
    label: "Tier 3 - Limited Access",
    color: "bg-yellow-500",
    description:
      "This ZIP faces notable gaps in healthcare access.",
    callToAction:
      "Priority area for ambulatory network expansion.",
  },
  {
    min: 61,
    max: 80,
    label: "Tier 2 - Moderate Access",
    color: "bg-lime-500",
    description:
      "This ZIP is near the Michigan average for healthcare access.",
    callToAction:
      "Targeted investments could move this community to Tier 1.",
  },
  {
    min: 81,
    max: 100,
    label: "Tier 1 - Strong Access",
    color: "bg-green-600",
    description:
      "This ZIP ranks among Michigan's strongest for healthcare access.",
    callToAction:
      "Model community for replication strategies.",
  },
];

export function getScoreBand(score: number): ZipScoreBand {
  return (
    ZIP_SCORE_BANDS.find((b) => score >= b.min && score <= b.max) ??
    ZIP_SCORE_BANDS[2]
  );
}
