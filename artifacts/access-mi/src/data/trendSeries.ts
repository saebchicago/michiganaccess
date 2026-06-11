import rawData from "./trendSeries.json";

export interface TrendPoint {
  vintage: number;
  value: number;
}

export interface AcsPoint {
  vintageYear: number;
  vintageLabel: string;
  value: number;
}

export interface PopulationTrend {
  series: TrendPoint[];
  label: "VERIFIED";
  source: string;
  sourceUrl: string;
}

export interface UninsuredTrend {
  points: AcsPoint[];
  label: "VERIFIED";
  source: string;
  sourceUrl: string;
  overlapGapYears: number;
  marginOfErrorNote?: string;
}

export interface UninsuredPending {
  status: "pending-ci";
  pendingReason: string;
  vintages: number[];
  label: "VERIFIED";
  source: string;
  sourceUrl: string;
  overlapGapYears: number;
}

export interface CountyTrends {
  population: PopulationTrend;
  uninsuredRate: UninsuredTrend | UninsuredPending;
}

type TrendSeriesData = {
  $schema: string;
  provenance: Record<string, unknown>;
  counties: Record<string, CountyTrends>;
};

const data = rawData as unknown as TrendSeriesData;

export function getCountyTrends(county: string): CountyTrends | null {
  return data.counties[county] ?? null;
}

export function isUninsuredPending(
  u: UninsuredTrend | UninsuredPending,
): u is UninsuredPending {
  return (u as UninsuredPending).status === "pending-ci";
}

export const TREND_SERIES_GENERATED_AT: string =
  (data.provenance as { generatedAt?: string }).generatedAt ?? "";
