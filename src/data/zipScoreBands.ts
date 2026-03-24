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
    label: "Critical Need",
    color: "bg-red-600",
    description:
      "This ZIP code shows severe deficits across health, economic, and environmental indicators. Residents face compounding barriers to wellbeing.",
    callToAction:
      "Connect with local FQHCs, apply for Medicaid and SNAP, and contact 211 for immediate assistance.",
  },
  {
    min: 21,
    max: 40,
    label: "High Need",
    color: "bg-orange-500",
    description:
      "Multiple indicators fall well below state averages. Economic stress and limited healthcare access compound health risks.",
    callToAction:
      "Explore financial help programs, check insurance options, and review community resources in your county.",
  },
  {
    min: 41,
    max: 60,
    label: "Moderate Need",
    color: "bg-yellow-500",
    description:
      "Some indicators are below average while others are near or at state norms. Targeted investment could shift outcomes.",
    callToAction:
      "Use the Data Explorer to identify which specific domains need attention in this ZIP code.",
  },
  {
    min: 61,
    max: 80,
    label: "Good Access",
    color: "bg-lime-500",
    description:
      "Most indicators meet or exceed state averages. Residents generally have adequate access to health, economic, and environmental resources.",
    callToAction:
      "Compare this ZIP to neighboring areas and explore volunteer or advocacy opportunities.",
  },
  {
    min: 81,
    max: 100,
    label: "Strong Access",
    color: "bg-green-600",
    description:
      "This ZIP code performs well above state averages across nearly all dimensions. Strong infrastructure supports resident wellbeing.",
    callToAction:
      "Consider how resources here could support adjacent high-need ZIPs through regional collaboration.",
  },
];

export function getScoreBand(score: number): ZipScoreBand {
  return (
    ZIP_SCORE_BANDS.find((b) => score >= b.min && score <= b.max) ??
    ZIP_SCORE_BANDS[2]
  );
}
