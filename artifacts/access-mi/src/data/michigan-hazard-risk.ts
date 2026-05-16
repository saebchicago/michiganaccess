export interface CountyHazardRisk {
  county: string;
  riskRating: "Very High" | "Relatively High" | "Relatively Moderate" | "Relatively Low" | "Very Low";
  expectedAnnualLoss: string;
  socialVulnerability: "Very High" | "Relatively High" | "Relatively Moderate" | "Relatively Low" | "Very Low";
  communityResilience: "Very High" | "Relatively High" | "Relatively Moderate" | "Relatively Low" | "Very Low";
  topHazards: string[];
}

export const HAZARD_RISK_DATA: CountyHazardRisk[] = [
  { county: "Wayne", riskRating: "Very High", expectedAnnualLoss: "$892M", socialVulnerability: "Very High", communityResilience: "Relatively Low", topHazards: ["Severe Storm", "Flooding", "Extreme Heat"] },
  { county: "Oakland", riskRating: "Relatively High", expectedAnnualLoss: "$412M", socialVulnerability: "Relatively Low", communityResilience: "Relatively High", topHazards: ["Severe Storm", "Tornado", "Winter Weather"] },
  { county: "Macomb", riskRating: "Relatively High", expectedAnnualLoss: "$287M", socialVulnerability: "Relatively Moderate", communityResilience: "Relatively Moderate", topHazards: ["Severe Storm", "Flooding", "Winter Weather"] },
  { county: "Kent", riskRating: "Relatively Moderate", expectedAnnualLoss: "$198M", socialVulnerability: "Relatively Moderate", communityResilience: "Relatively High", topHazards: ["Severe Storm", "Tornado", "Flooding"] },
  { county: "Genesee", riskRating: "Relatively High", expectedAnnualLoss: "$156M", socialVulnerability: "Very High", communityResilience: "Relatively Low", topHazards: ["Severe Storm", "Flooding", "Extreme Heat"] },
  { county: "Washtenaw", riskRating: "Relatively Moderate", expectedAnnualLoss: "$134M", socialVulnerability: "Relatively Low", communityResilience: "Very High", topHazards: ["Severe Storm", "Flooding", "Tornado"] },
  { county: "Ingham", riskRating: "Relatively Moderate", expectedAnnualLoss: "$98M", socialVulnerability: "Relatively Moderate", communityResilience: "Relatively Moderate", topHazards: ["Severe Storm", "Tornado", "Winter Weather"] },
  { county: "Kalamazoo", riskRating: "Relatively Moderate", expectedAnnualLoss: "$87M", socialVulnerability: "Relatively Moderate", communityResilience: "Relatively Moderate", topHazards: ["Severe Storm", "Tornado", "Flooding"] },
  { county: "Saginaw", riskRating: "Relatively High", expectedAnnualLoss: "$76M", socialVulnerability: "Very High", communityResilience: "Relatively Low", topHazards: ["Severe Storm", "Flooding", "Winter Weather"] },
  { county: "Muskegon", riskRating: "Relatively Moderate", expectedAnnualLoss: "$62M", socialVulnerability: "Relatively High", communityResilience: "Relatively Low", topHazards: ["Severe Storm", "Great Lakes Flooding", "Winter Weather"] },
  { county: "Berrien", riskRating: "Relatively Moderate", expectedAnnualLoss: "$54M", socialVulnerability: "Relatively High", communityResilience: "Relatively Low", topHazards: ["Severe Storm", "Tornado", "Great Lakes Flooding"] },
  { county: "Marquette", riskRating: "Relatively Low", expectedAnnualLoss: "$28M", socialVulnerability: "Relatively Moderate", communityResilience: "Relatively Moderate", topHazards: ["Winter Weather", "Wildfire", "Severe Storm"] },
  { county: "Houghton", riskRating: "Relatively Low", expectedAnnualLoss: "$18M", socialVulnerability: "Relatively High", communityResilience: "Relatively Low", topHazards: ["Winter Weather", "Wildfire", "Flooding"] },
  { county: "Chippewa", riskRating: "Relatively Low", expectedAnnualLoss: "$14M", socialVulnerability: "Relatively High", communityResilience: "Relatively Low", topHazards: ["Winter Weather", "Ice Storm", "Wildfire"] },
  { county: "Emmet", riskRating: "Relatively Low", expectedAnnualLoss: "$16M", socialVulnerability: "Relatively Moderate", communityResilience: "Relatively Moderate", topHazards: ["Winter Weather", "Great Lakes Flooding", "Severe Storm"] },
  { county: "Grand Traverse", riskRating: "Relatively Moderate", expectedAnnualLoss: "$38M", socialVulnerability: "Relatively Low", communityResilience: "Relatively High", topHazards: ["Severe Storm", "Winter Weather", "Great Lakes Flooding"] },
  { county: "Monroe", riskRating: "Relatively Moderate", expectedAnnualLoss: "$56M", socialVulnerability: "Relatively Moderate", communityResilience: "Relatively Moderate", topHazards: ["Severe Storm", "Tornado", "Flooding"] },
  { county: "Jackson", riskRating: "Relatively Moderate", expectedAnnualLoss: "$48M", socialVulnerability: "Relatively Moderate", communityResilience: "Relatively Moderate", topHazards: ["Severe Storm", "Tornado", "Flooding"] },
  { county: "Calhoun", riskRating: "Relatively Moderate", expectedAnnualLoss: "$44M", socialVulnerability: "Relatively High", communityResilience: "Relatively Low", topHazards: ["Severe Storm", "Tornado", "Flooding"] },
  { county: "Bay", riskRating: "Relatively Moderate", expectedAnnualLoss: "$36M", socialVulnerability: "Relatively High", communityResilience: "Relatively Moderate", topHazards: ["Severe Storm", "Flooding", "Winter Weather"] },
];

export const RISK_COLORS: Record<string, string> = {
  "Very High": "bg-red-600 text-white",
  "Relatively High": "bg-orange-500 text-white",
  "Relatively Moderate": "bg-yellow-400 text-black",
  "Relatively Low": "bg-green-500 text-white",
  "Very Low": "bg-green-700 text-white",
};
