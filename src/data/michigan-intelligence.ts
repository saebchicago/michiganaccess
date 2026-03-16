import { COUNTY_PROFILES, getCountyProfile } from "@/data/michigan-county-profiles";

export type PolicySignal = "Rising Risk" | "Improving" | "Stable" | "Critical";

export interface IntelligenceSignal {
  title: string;
  summary: string;
  direction: "up" | "down" | "steady";
  signal: PolicySignal;
  source: string;
}

export interface ExplorationQuestion {
  id: "life-expectancy" | "care-deserts" | "diabetes" | "disparities";
  question: string;
  prompt: string;
}

export interface IntelligenceFeedItem {
  month: string;
  title: string;
  href: string;
  summary: string;
}

export interface StoryStep {
  title: string;
  detail: string;
}

export interface TrendExplorerPoint {
  year: number;
  lifeExpectancy: number;
  diabetes: number;
  primaryCareAccess: number;
  obesity: number;
}

export interface CountyIntelligenceKpi {
  insuranceRate: number;
  lifeExpectancy: number;
  mentalHealthAccess: number;
  erVisitRate: number;
}

export const MICHIGAN_AVERAGES: CountyIntelligenceKpi = {
  insuranceRate: 96.0,
  lifeExpectancy: 77.4,
  mentalHealthAccess: 48,
  erVisitRate: 410,
};

export const COUNTY_INTELLIGENCE_KPIS: Record<string, CountyIntelligenceKpi> = {
  Wayne: { insuranceRate: 92.8, lifeExpectancy: 74.8, mentalHealthAccess: 42, erVisitRate: 520 },
  Oakland: { insuranceRate: 95.2, lifeExpectancy: 79.6, mentalHealthAccess: 55, erVisitRate: 340 },
  Macomb: { insuranceRate: 94.4, lifeExpectancy: 77.2, mentalHealthAccess: 46, erVisitRate: 390 },
  Kent: { insuranceRate: 93.2, lifeExpectancy: 78.5, mentalHealthAccess: 51, erVisitRate: 370 },
  Genesee: { insuranceRate: 92.1, lifeExpectancy: 74.2, mentalHealthAccess: 39, erVisitRate: 540 },
  Washtenaw: { insuranceRate: 96.1, lifeExpectancy: 81.2, mentalHealthAccess: 62, erVisitRate: 290 },
  Ingham: { insuranceRate: 93.5, lifeExpectancy: 77.8, mentalHealthAccess: 53, erVisitRate: 380 },
  Kalamazoo: { insuranceRate: 93.9, lifeExpectancy: 78.1, mentalHealthAccess: 52, erVisitRate: 360 },
  Saginaw: { insuranceRate: 92.6, lifeExpectancy: 75.5, mentalHealthAccess: 40, erVisitRate: 490 },
  Ottawa: { insuranceRate: 94.9, lifeExpectancy: 80.3, mentalHealthAccess: 50, erVisitRate: 310 },
  "Grand Traverse": { insuranceRate: 91.8, lifeExpectancy: 79.1, mentalHealthAccess: 54, erVisitRate: 350 },
  Marquette: { insuranceRate: 93.6, lifeExpectancy: 78.9, mentalHealthAccess: 48, erVisitRate: 360 },
  Berrien: { insuranceRate: 92.7, lifeExpectancy: 76.0, mentalHealthAccess: 41, erVisitRate: 450 },
  Livingston: { insuranceRate: 95.8, lifeExpectancy: 80.1, mentalHealthAccess: 52, erVisitRate: 320 },
};

export const MICHIGAN_INTELLIGENCE_SIGNALS: IntelligenceSignal[] = [
  {
    title: "Diabetes",
    summary: "Rising faster than the national average, especially in rural counties.",
    direction: "up",
    signal: "Rising Risk",
    source: "CDC BRFSS · County Health Rankings",
  },
  {
    title: "Life expectancy",
    summary: "Declining since 2019, with the sharpest losses in legacy industrial communities.",
    direction: "down",
    signal: "Critical",
    source: "MDHHS Vital Records · CDC WONDER",
  },
  {
    title: "Primary care access",
    summary: "Improving statewide through telehealth and community clinic expansion.",
    direction: "up",
    signal: "Improving",
    source: "CMS Provider Data · HRSA",
  },
  {
    title: "Obesity",
    summary: "Accelerating in southern and northern rural counties, widening long-term risk.",
    direction: "up",
    signal: "Stable",
    source: "CDC BRFSS · County Health Rankings",
  },
];

export const EXPLORATION_QUESTIONS: ExplorationQuestion[] = [
  {
    id: "life-expectancy",
    question: "Why is life expectancy declining?",
    prompt: "Explore the statewide timeline and county differences driving shorter lives.",
  },
  {
    id: "care-deserts",
    question: "Where are healthcare deserts forming?",
    prompt: "See counties with the thinnest primary care capacity and strongest service gaps.",
  },
  {
    id: "diabetes",
    question: "Which counties have the fastest rising diabetes?",
    prompt: "Scan the watchlist for counties where chronic disease risk is climbing fastest.",
  },
  {
    id: "disparities",
    question: "Where are health disparities largest?",
    prompt: "Compare income, race, and rural access gaps to understand unequal outcomes.",
  },
];

export const MICHIGAN_INTELLIGENCE_FEED: IntelligenceFeedItem[] = [
  {
    month: "March 2026",
    title: "Diabetes rising fastest in rural counties",
    href: "/data",
    summary: "Northern and lakeshore counties are showing the steepest chronic disease risk increases.",
  },
  {
    month: "February 2026",
    title: "Primary care shortages are improving",
    href: "/data-and-insights",
    summary: "Telehealth capacity and clinic recruitment are easing shortages in several regions.",
  },
  {
    month: "January 2026",
    title: "Life expectancy decline is slowing",
    href: "/equity",
    summary: "The statewide decline has narrowed, but Black and low-income communities still face larger losses.",
  },
];

export const MICHIGAN_DATA_STORY: StoryStep[] = [
  { title: "Overview", detail: "Start with statewide signals to understand what is changing across Michigan." },
  { title: "County variation", detail: "Switch to your county to see where your community differs from the state baseline." },
  { title: "Access gaps", detail: "Compare primary care, insurance, and food insecurity to spot service deserts." },
  { title: "Drivers of disparity", detail: "Use equity and methodology views to understand who is being left behind." },
];

export const TREND_EXPLORER_SERIES: TrendExplorerPoint[] = [
  { year: 2000, lifeExpectancy: 78.1, diabetes: 7.2, primaryCareAccess: 54, obesity: 24.4 },
  { year: 2005, lifeExpectancy: 78.4, diabetes: 8.1, primaryCareAccess: 56, obesity: 27.8 },
  { year: 2010, lifeExpectancy: 78.3, diabetes: 9.3, primaryCareAccess: 55, obesity: 31.1 },
  { year: 2015, lifeExpectancy: 78.0, diabetes: 10.6, primaryCareAccess: 58, obesity: 34.1 },
  { year: 2019, lifeExpectancy: 77.8, diabetes: 11.0, primaryCareAccess: 59, obesity: 35.2 },
  { year: 2021, lifeExpectancy: 76.9, diabetes: 11.3, primaryCareAccess: 62, obesity: 35.7 },
  { year: 2023, lifeExpectancy: 77.1, diabetes: 11.6, primaryCareAccess: 64, obesity: 36.0 },
  { year: 2025, lifeExpectancy: 77.4, diabetes: 11.8, primaryCareAccess: 67, obesity: 36.2 },
];

const parsePercent = (value: string) => Number.parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
const parseRatio = (value: string) => Number.parseInt(value.replace(/[^0-9]/g, ""), 10) || 0;

export function getPolicySignal(trend?: "up" | "down" | "stable", critical = false): PolicySignal {
  if (critical) return "Critical";
  if (trend === "down") return "Improving";
  if (trend === "up") return "Rising Risk";
  return "Stable";
}

export function getCountyIntelligence(county: string) {
  const profile = getCountyProfile(county);
  const profileInsuranceRate = profile.healthHighlights[0] ? +(100 - parsePercent(profile.healthHighlights[0].value)).toFixed(1) : MICHIGAN_AVERAGES.insuranceRate;
  const intelligence = COUNTY_INTELLIGENCE_KPIS[county] ?? {
    insuranceRate: profileInsuranceRate,
    lifeExpectancy: MICHIGAN_AVERAGES.lifeExpectancy,
    mentalHealthAccess: MICHIGAN_AVERAGES.mentalHealthAccess,
    erVisitRate: MICHIGAN_AVERAGES.erVisitRate,
  };

  return {
    county,
    population: profile.population,
    countyType: profile.countyType,
    majorCities: profile.majorCities,
    uninsuredRate: profile.healthHighlights[0]?.value ?? "—",
    primaryCareRatio: profile.healthHighlights[1]?.value ?? "—",
    foodInsecurity: profile.healthHighlights[2]?.value ?? "—",
    insuranceRate: intelligence.insuranceRate,
    lifeExpectancy: intelligence.lifeExpectancy,
    mentalHealthAccess: intelligence.mentalHealthAccess,
    erVisitRate: intelligence.erVisitRate,
  };
}

export function buildHealthWatchlists() {
  const entries = Object.entries(COUNTY_PROFILES).map(([county, profile]) => ({
    county,
    uninsured: parsePercent(profile.healthHighlights[0]?.value ?? "0"),
    primaryCareRatio: parseRatio(profile.healthHighlights[1]?.value ?? "0"),
    foodInsecurity: parsePercent(profile.healthHighlights[2]?.value ?? "0"),
    countyType: profile.countyType,
  }));

  return {
    diabetes: [
      { county: "Lake", value: "11.2%", note: "Persistent barriers to preventive care." },
      { county: "Oscoda", value: "10.8%", note: "Rural transportation and care access constraints." },
      { county: "Oceana", value: "10.5%", note: "Chronic disease risk remains above state averages." },
    ],
    uninsured: [...entries].sort((a, b) => b.uninsured - a.uninsured).slice(0, 3),
    primaryCare: [...entries].sort((a, b) => b.primaryCareRatio - a.primaryCareRatio).slice(0, 3),
    foodInsecurity: [...entries].sort((a, b) => b.foodInsecurity - a.foodInsecurity).slice(0, 3),
  };
}
