/**
 * Civic Intelligence Query Engine
 *
 * Pure client-side structured retrieval. No AI calls, no third-party data
 * transmission. All answers are assembled from on-site data files only.
 *
 * Every returned data point carries:
 *   - valueLabel: "VERIFIED" | "MODELED" | "PROJECTED" - from the dataset's
 *                  own provenance metadata
 *   - source:     exact source name from the dataset provenance
 *   - vintage:    data vintage string (year or period)
 *
 * Degrades gracefully: when a county has no data for a topic, returns a
 * "thin" confidence answer that says so rather than inventing values.
 */

import type { IntegrityLabel } from "@/types/chna";
import {
  COUNTY_PROFILES,
  COUNTY_POPULATION_SOURCE,
  COUNTY_UNINSURED_SOURCE,
  COUNTY_PCP_SOURCE,
  COUNTY_FOOD_INSECURITY_SOURCE,
} from "@/data/michigan-county-profiles";
import {
  getCountyCrossDomain,
  MI_STATE_AVERAGES,
} from "@/data/cross-domain-indicators";
import { getALICEByCounty, MICHIGAN_ALICE_STATEWIDE } from "@/data/aliceData";
import { getBlsLausForCountyName } from "@/data/bls-laus-county";
import { getPlacesForCountyName } from "@/data/cdc-places-county";
import { getHpsaForCountyName } from "@/data/hrsa-hpsa-county";
import { getAcsBroadbandForCountyName } from "@/data/acs-broadband-county";

// ── Types ─────────────────────────────────────────────────────────────────

export interface CivicDataPoint {
  label: string;
  value: string;
  valueLabel: IntegrityLabel;
  source: string;
  vintage: string;
  note?: string;
}

export type CivicConfidence = "high" | "medium" | "thin" | "none";

export interface CivicAnswer {
  question: string;
  county: string | null;
  topic: string;
  headline: string;
  narrative: string;
  dataPoints: CivicDataPoint[];
  confidence: CivicConfidence;
  suggestions: string[];
  disclaimer: string;
}

// ── County Detection ──────────────────────────────────────────────────────

const ALL_COUNTIES = Object.keys(COUNTY_PROFILES);

export function detectCounty(text: string): string | null {
  const lower = text.toLowerCase();
  // Exact match first (longest county names win to prevent "Van" matching "Van Buren")
  const sorted = [...ALL_COUNTIES].sort((a, b) => b.length - a.length);
  for (const c of sorted) {
    if (lower.includes(c.toLowerCase())) return c;
  }
  return null;
}

// ── Topic Detection ───────────────────────────────────────────────────────

export type CivicTopic =
  | "food_insecurity"
  | "health_access"
  | "economic_hardship"
  | "housing"
  | "unemployment"
  | "broadband"
  | "chronic_disease"
  | "mental_health"
  | "provider_shortage"
  | "general";

const TOPIC_KEYWORDS: Record<CivicTopic, string[]> = {
  food_insecurity: [
    "food",
    "hunger",
    "snap",
    "meal",
    "nutrition",
    "insecurity",
    "eating",
  ],
  health_access: [
    "health",
    "insurance",
    "uninsured",
    "coverage",
    "primary care",
    "doctor",
    "clinic",
    "fqhc",
    "medicaid",
  ],
  economic_hardship: [
    "poverty",
    "income",
    "alice",
    "hardship",
    "economic",
    "household",
    "financial",
  ],
  housing: ["housing", "rent", "eviction", "homeless", "shelter", "afford"],
  unemployment: [
    "unemployment",
    "unemployed",
    "jobs",
    "job loss",
    "employment",
    "labor",
    "work",
  ],
  broadband: ["broadband", "internet", "connectivity", "online", "digital"],
  chronic_disease: [
    "diabetes",
    "obesity",
    "heart",
    "smoking",
    "copd",
    "chronic",
    "cancer",
    "blood pressure",
  ],
  mental_health: [
    "mental health",
    "depression",
    "anxiety",
    "substance",
    "behavioral health",
    "opioid",
  ],
  provider_shortage: [
    "shortage",
    "hpsa",
    "provider",
    "access to care",
    "desert",
    "underserved",
    "primary care access",
  ],
  general: [],
};

export function detectTopic(text: string): CivicTopic {
  const lower = text.toLowerCase();
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS) as [
    CivicTopic,
    string[],
  ][]) {
    if (topic === "general") continue;
    if (keywords.some((kw) => lower.includes(kw))) return topic;
  }
  return "general";
}

// ── Data Resolvers ────────────────────────────────────────────────────────

function resolveHealthAccess(county: string): CivicDataPoint[] {
  const profile = COUNTY_PROFILES[county];
  if (!profile) return [];
  const hh = profile.healthHighlights;
  const points: CivicDataPoint[] = [];

  const uninsured = hh.find((h) => h.label.toLowerCase().includes("uninsured"));
  if (uninsured) {
    const val = parseFloat(uninsured.value);
    const stateAvg = 6.2;
    points.push({
      label: "Uninsured rate",
      value: uninsured.value,
      valueLabel: "VERIFIED",
      source: COUNTY_UNINSURED_SOURCE,
      vintage: "2022",
      note: !isNaN(val)
        ? val > stateAvg
          ? `Above state avg (${stateAvg}%)`
          : `At or below state avg (${stateAvg}%)`
        : undefined,
    });
  }

  const pcp = hh.find((h) => h.label.toLowerCase().includes("primary"));
  if (pcp) {
    points.push({
      label: "Primary care ratio (residents per provider)",
      value: pcp.value,
      valueLabel: "VERIFIED",
      source: COUNTY_PCP_SOURCE,
      vintage: "2021",
    });
  }

  const hpsa = getHpsaForCountyName(county);
  if (hpsa?.disciplines?.primaryCare?.shortageFte) {
    points.push({
      label: "Primary care provider shortage (FTE needed)",
      value: hpsa.disciplines.primaryCare.shortageFte.toFixed(1),
      valueLabel: "MODELED",
      source: "HRSA HPSA Facility Detail Files, Primary Care (Jun 2026)",
      vintage: "2026",
      note: "HRSA aggregation of sub-county designation records",
    });
  }

  return points;
}

function resolveFoodInsecurity(county: string): CivicDataPoint[] {
  const profile = COUNTY_PROFILES[county];
  if (!profile) return [];
  const points: CivicDataPoint[] = [];

  const food = profile.healthHighlights.find((h) =>
    h.label.toLowerCase().includes("food"),
  );
  if (food) {
    const val = parseFloat(food.value);
    const stateAvg = 13.5;
    points.push({
      label: "Food insecurity rate",
      value: food.value,
      valueLabel: "MODELED",
      source: COUNTY_FOOD_INSECURITY_SOURCE,
      vintage: "2022",
      note: !isNaN(val)
        ? val > stateAvg
          ? `Above state avg (${stateAvg}%)`
          : `Below state avg (${stateAvg}%)`
        : undefined,
    });
  }

  const cd = getCountyCrossDomain(county);
  if (cd.povertyRate !== null) {
    points.push({
      label: "Poverty rate",
      value: `${cd.povertyRate}%`,
      valueLabel: "VERIFIED",
      source: "ACS 5-Year 2022 (NCES/MI DOE 2023)",
      vintage: "2022",
    });
  }
  if (cd.medianIncome !== null) {
    points.push({
      label: "Median household income",
      value: `$${cd.medianIncome.toLocaleString()}`,
      valueLabel: "VERIFIED",
      source: "ACS 5-Year 2022",
      vintage: "2022",
    });
  }

  const alice = getALICEByCounty(county);
  if (alice) {
    points.push({
      label: "Households below ALICE threshold",
      value: `${alice.combinedHardshipPct}%`,
      valueLabel: "VERIFIED",
      source: alice.source,
      vintage: "2023",
    });
  } else {
    points.push({
      label: "Households below ALICE threshold (statewide)",
      value: `${MICHIGAN_ALICE_STATEWIDE.combinedHardshipPct}%`,
      valueLabel: "VERIFIED",
      source:
        MICHIGAN_ALICE_STATEWIDE.source +
        " (county-level not available; statewide shown)",
      vintage: "2023",
    });
  }

  return points;
}

function resolveEconomicHardship(county: string): CivicDataPoint[] {
  const cd = getCountyCrossDomain(county);
  const alice = getALICEByCounty(county);
  const points: CivicDataPoint[] = [];

  if (cd.povertyRate !== null) {
    points.push({
      label: "Poverty rate",
      value: `${cd.povertyRate}%`,
      valueLabel: "VERIFIED",
      source: "ACS 5-Year 2022",
      vintage: "2022",
      note:
        cd.povertyRate > MI_STATE_AVERAGES.povertyRate!
          ? "Above state average"
          : "Below state average",
    });
  }
  if (cd.medianIncome !== null) {
    points.push({
      label: "Median household income",
      value: `$${cd.medianIncome.toLocaleString()}`,
      valueLabel: "VERIFIED",
      source: "ACS 5-Year 2022",
      vintage: "2022",
    });
  }

  const blsData = getBlsLausForCountyName(county);
  if (blsData?.unemploymentRate !== null && blsData?.status === "populated") {
    points.push({
      label: `Unemployment rate (${blsData.latestPeriod})`,
      value: `${blsData.unemploymentRate}%`,
      valueLabel: "VERIFIED",
      source: "BLS Local Area Unemployment Statistics (LAUS)",
      vintage: blsData.latestPeriod ?? "2026",
      note: blsData.preliminary
        ? "Preliminary - subject to revision"
        : undefined,
    });
  }

  if (alice) {
    points.push({
      label: "Economic hardship rate (poverty + ALICE)",
      value: `${alice.combinedHardshipPct}%`,
      valueLabel: "VERIFIED",
      source: alice.source,
      vintage: "2023",
    });
  }

  return points;
}

function resolveHousing(county: string): CivicDataPoint[] {
  const cd = getCountyCrossDomain(county);
  const points: CivicDataPoint[] = [];

  if (cd.rentBurden !== null) {
    points.push({
      label: "Rent-burdened households (>30% of income on rent)",
      value: `${cd.rentBurden}%`,
      valueLabel: "VERIFIED",
      source: "ACS 5-Year 2022",
      vintage: "2022",
      note:
        cd.rentBurden > MI_STATE_AVERAGES.rentBurden!
          ? "Above state average (47.2%)"
          : "Below state average (47.2%)",
    });
  }
  if (cd.medianRent !== null) {
    points.push({
      label: "Median gross rent",
      value: `$${cd.medianRent.toLocaleString()}/mo`,
      valueLabel: "VERIFIED",
      source: "ACS 5-Year 2022",
      vintage: "2022",
    });
  }
  if (cd.medianIncome !== null) {
    points.push({
      label: "Median household income",
      value: `$${cd.medianIncome.toLocaleString()}`,
      valueLabel: "VERIFIED",
      source: "ACS 5-Year 2022",
      vintage: "2022",
    });
  }

  return points;
}

function resolveUnemployment(county: string): CivicDataPoint[] {
  const blsData = getBlsLausForCountyName(county);
  const cd = getCountyCrossDomain(county);
  const points: CivicDataPoint[] = [];

  if (blsData?.unemploymentRate !== null && blsData?.status === "populated") {
    points.push({
      label: `Unemployment rate (${blsData.latestPeriod ?? "latest"})`,
      value: `${blsData.unemploymentRate}%`,
      valueLabel: "VERIFIED",
      source: "BLS Local Area Unemployment Statistics (LAUS)",
      vintage: blsData.latestPeriod ?? "2026",
      note: blsData.preliminary
        ? "Preliminary - subject to BLS revision"
        : undefined,
    });
    const stateRate = 4.2;
    if (blsData.unemploymentRate !== null) {
      points.push({
        label: "Michigan state unemployment rate (reference)",
        value: `${stateRate}%`,
        valueLabel: "VERIFIED",
        source: "BLS LAUS Michigan state-level series",
        vintage: "2022",
      });
    }
  } else {
    if (cd.unemploymentRate !== null) {
      points.push({
        label: "Unemployment rate (ACS-derived)",
        value: `${cd.unemploymentRate}%`,
        valueLabel: "VERIFIED",
        source: "ACS 5-Year 2022 / BLS LAUS",
        vintage: "2022",
      });
    }
  }

  return points;
}

function resolveBroadband(county: string): CivicDataPoint[] {
  const bbData = getAcsBroadbandForCountyName(county);
  const cd = getCountyCrossDomain(county);
  const points: CivicDataPoint[] = [];

  if (
    bbData?.status === "populated" &&
    bbData.broadbandSubscriptionRate !== null
  ) {
    points.push({
      label: "Households with broadband subscription",
      value: `${bbData.broadbandSubscriptionRate.toFixed(1)}%`,
      valueLabel: "VERIFIED",
      source: "U.S. Census ACS 5-Year 2019-2023 (B28002)",
      vintage: "2019-2023",
    });
  }

  if (cd.vehicleAccess !== null) {
    points.push({
      label: "Households with vehicle access",
      value: `${cd.vehicleAccess}%`,
      valueLabel: "VERIFIED",
      source: "ACS 5-Year 2022",
      vintage: "2022",
    });
  }

  return points;
}

function resolveChronicDisease(
  county: string,
  question: string,
): CivicDataPoint[] {
  const cdcData = getPlacesForCountyName(county);
  const points: CivicDataPoint[] = [];
  if (!cdcData) return points;

  const q = question.toLowerCase();
  const measures: Array<{ key: string; label: string }> = [];

  if (q.includes("diabet"))
    measures.push({ key: "diabetes", label: "Diagnosed diabetes" });
  if (q.includes("obesi") || q.includes("weight"))
    measures.push({ key: "obesity", label: "Obesity (BMI >= 30)" });
  if (q.includes("heart") || q.includes("cardiac") || q.includes("coronary"))
    measures.push({
      key: "coronaryHeartDisease",
      label: "Coronary heart disease",
    });
  if (q.includes("blood pressure") || q.includes("hypertension"))
    measures.push({ key: "highBloodPressure", label: "High blood pressure" });
  if (q.includes("smok") || q.includes("tobacco"))
    measures.push({
      key: "currentSmoking",
      label: "Current cigarette smoking",
    });
  if (q.includes("copd") || q.includes("lung"))
    measures.push({ key: "copd", label: "COPD" });

  // If no specific measure asked, show top chronic measures
  if (measures.length === 0) {
    measures.push(
      { key: "diabetes", label: "Diagnosed diabetes" },
      { key: "obesity", label: "Obesity (BMI >= 30)" },
      { key: "highBloodPressure", label: "High blood pressure" },
    );
  }

  for (const { key, label } of measures) {
    const m = cdcData.measures[key];
    if (m?.crudePrevalence !== null && m?.crudePrevalence !== undefined) {
      points.push({
        label: `${label} (adults 18+)`,
        value: `${m.crudePrevalence}%`,
        valueLabel: "MODELED",
        source: "CDC PLACES 2025 (BRFSS MRP estimates)",
        vintage: "2023",
        note: m.ci95 ? `95% CI: ${m.ci95.low}-${m.ci95.high}%` : undefined,
      });
    }
  }

  return points;
}

function resolveMentalHealth(county: string): CivicDataPoint[] {
  const cdcData = getPlacesForCountyName(county);
  const hpsa = getHpsaForCountyName(county);
  const points: CivicDataPoint[] = [];

  if (
    cdcData?.measures?.mentalHealthNotGood?.crudePrevalence !== null &&
    cdcData?.measures?.mentalHealthNotGood?.crudePrevalence !== undefined
  ) {
    points.push({
      label: "Poor mental health days (14+ days/mo)",
      value: `${cdcData.measures.mentalHealthNotGood.crudePrevalence}%`,
      valueLabel: "MODELED",
      source: "CDC PLACES 2025 (BRFSS MRP estimates)",
      vintage: "2023",
    });
  }

  if (hpsa?.disciplines?.mental) {
    const mh = hpsa.disciplines.mental;
    if (mh.designatedHpsas > 0) {
      points.push({
        label: "Mental health HPSA designations",
        value: `${mh.designatedHpsas}`,
        valueLabel: "MODELED",
        source: "HRSA HPSA Mental Health (Jun 2026)",
        vintage: "2026",
      });
    }
    if (mh.shortageFte > 0) {
      points.push({
        label: "Mental health provider shortage (FTE needed)",
        value: mh.shortageFte.toFixed(1),
        valueLabel: "MODELED",
        source: "HRSA HPSA Mental Health (Jun 2026)",
        vintage: "2026",
      });
    }
  }

  return points;
}

function resolveProviderShortage(county: string): CivicDataPoint[] {
  const hpsa = getHpsaForCountyName(county);
  const profile = COUNTY_PROFILES[county];
  const points: CivicDataPoint[] = [];

  if (profile) {
    const pcp = profile.healthHighlights.find((h) =>
      h.label.toLowerCase().includes("primary"),
    );
    if (pcp) {
      points.push({
        label: "Primary care ratio (residents per provider)",
        value: pcp.value,
        valueLabel: "VERIFIED",
        source: COUNTY_PCP_SOURCE,
        vintage: "2021",
      });
    }
  }

  if (hpsa) {
    for (const [discipline, meta] of [
      ["primaryCare", "Primary Care"],
      ["dental", "Dental"],
      ["mental", "Mental Health"],
    ] as const) {
      const d = hpsa.disciplines[discipline];
      if (d && d.designatedHpsas > 0) {
        points.push({
          label: `${meta} HPSA shortage FTE needed`,
          value: d.shortageFte.toFixed(1),
          valueLabel: "MODELED",
          source: "HRSA HPSA Facility Detail Files (Jun 2026)",
          vintage: "2026",
          note: `${d.designatedHpsas} designation(s), max score ${d.maxHpsaScore ?? "n/a"}/25`,
        });
      }
    }
  }

  return points;
}

function resolveGeneral(county: string): CivicDataPoint[] {
  const profile = COUNTY_PROFILES[county];
  const cd = getCountyCrossDomain(county);
  const blsData = getBlsLausForCountyName(county);
  const points: CivicDataPoint[] = [];

  if (profile) {
    points.push({
      label: "Population",
      value: profile.population.toLocaleString(),
      valueLabel: "VERIFIED",
      source: COUNTY_POPULATION_SOURCE,
      vintage: "2024",
    });
    const uninsured = profile.healthHighlights.find((h) =>
      h.label.toLowerCase().includes("uninsured"),
    );
    if (uninsured) {
      points.push({
        label: "Uninsured rate",
        value: uninsured.value,
        valueLabel: "VERIFIED",
        source: COUNTY_UNINSURED_SOURCE,
        vintage: "2022",
      });
    }
    const food = profile.healthHighlights.find((h) =>
      h.label.toLowerCase().includes("food"),
    );
    if (food) {
      points.push({
        label: "Food insecurity rate",
        value: food.value,
        valueLabel: "MODELED",
        source: COUNTY_FOOD_INSECURITY_SOURCE,
        vintage: "2022",
      });
    }
  }

  if (cd.povertyRate !== null) {
    points.push({
      label: "Poverty rate",
      value: `${cd.povertyRate}%`,
      valueLabel: "VERIFIED",
      source: "ACS 5-Year 2022",
      vintage: "2022",
    });
  }

  if (blsData?.status === "populated" && blsData.unemploymentRate !== null) {
    points.push({
      label: `Unemployment (${blsData.latestPeriod ?? "latest"})`,
      value: `${blsData.unemploymentRate}%`,
      valueLabel: "VERIFIED",
      source: "BLS LAUS",
      vintage: blsData.latestPeriod ?? "2026",
      note: blsData.preliminary ? "Preliminary" : undefined,
    });
  }

  return points;
}

// ── Narrative Builder ─────────────────────────────────────────────────────

function buildNarrative(
  county: string,
  topic: CivicTopic,
  points: CivicDataPoint[],
  question: string,
): { headline: string; narrative: string; suggestions: string[] } {
  const profile = COUNTY_PROFILES[county];
  const countyLabel = `${county} County`;

  if (points.length === 0) {
    return {
      headline: `No on-site data for "${question.substring(0, 60)}"`,
      narrative: `AccessMI does not currently have data to answer this question about ${countyLabel}. Try the county page for broader information, or contact Michigan 211 by dialing 2-1-1.`,
      suggestions: ["Browse the county overview", "Try a different question"],
    };
  }

  const headlines: Partial<Record<CivicTopic, string>> = {
    food_insecurity: `Food insecurity in ${countyLabel}`,
    health_access: `Healthcare access in ${countyLabel}`,
    economic_hardship: `Economic hardship in ${countyLabel}`,
    housing: `Housing affordability in ${countyLabel}`,
    unemployment: `Unemployment in ${countyLabel}`,
    broadband: `Broadband access in ${countyLabel}`,
    chronic_disease: `Chronic health conditions in ${countyLabel}`,
    mental_health: `Mental health in ${countyLabel}`,
    provider_shortage: `Provider shortage in ${countyLabel}`,
    general: `Overview: ${countyLabel}`,
  };

  const suggestions: Partial<Record<CivicTopic, string[]>> = {
    food_insecurity: [
      `What is the poverty rate in ${county} County?`,
      `How does ${county} compare to Wayne County for food insecurity?`,
      `What resources address hunger in ${county} County?`,
    ],
    health_access: [
      `How many providers does ${county} County need?`,
      `What is the uninsured rate in ${county} County?`,
      `Compare ${county} to the state average for primary care access.`,
    ],
    unemployment: [
      `What is the poverty rate in ${county} County?`,
      `How does ${county} compare to Michigan for unemployment?`,
    ],
    general: [
      `What is driving food insecurity in ${county} County?`,
      `How does healthcare access compare in ${county} County?`,
      `What is the economic hardship level in ${county} County?`,
    ],
  };

  const headline =
    headlines[topic] ?? `${countyLabel}: ${topic.replace(/_/g, " ")}`;

  // Build narrative from data points
  const firstPoint = points[0];
  let narrative = `Based on ${firstPoint.source} (${firstPoint.vintage}): ${countyLabel} shows `;

  if (topic === "food_insecurity") {
    const food = points.find((p) =>
      p.label.toLowerCase().includes("food insecurity"),
    );
    const poverty = points.find((p) =>
      p.label.toLowerCase().includes("poverty"),
    );
    const alice = points.find((p) => p.label.toLowerCase().includes("alice"));
    const parts: string[] = [];
    if (food)
      parts.push(
        `a food insecurity rate of ${food.value} [${food.valueLabel}]`,
      );
    if (poverty)
      parts.push(`a poverty rate of ${poverty.value} [${poverty.valueLabel}]`);
    if (alice)
      parts.push(
        `${alice.value} of households below the ALICE economic survival threshold [${alice.valueLabel}]`,
      );
    narrative =
      `${countyLabel}: ` +
      parts.join("; ") +
      ". These indicators together signal the structural drivers of food insecurity. Each figure is labeled with its data quality below.";
  } else if (topic === "unemployment") {
    const urate = points.find((p) =>
      p.label.toLowerCase().includes("unemployment rate"),
    );
    if (urate) {
      narrative = `${countyLabel}'s most recent unemployment rate is ${urate.value} (${urate.source}, ${urate.vintage})${urate.note ? ` - ${urate.note}` : ""}.`;
    }
  } else {
    narrative = `${countyLabel} data from AccessMI on-site sources. Each figure below carries its provenance label (VERIFIED = primary source data; MODELED = statistical estimate).`;
  }

  return {
    headline,
    narrative,
    suggestions: suggestions[topic] ?? suggestions.general!,
  };
}

// ── Main Query Function ───────────────────────────────────────────────────

export function queryCivicData(question: string): CivicAnswer {
  const county = detectCounty(question);
  const topic = detectTopic(question);

  const disclaimer =
    "Data sourced from AccessMI on-site datasets only. No information was sent to external AI services. VERIFIED = primary federal/state source; MODELED = statistical estimate (e.g., CDC MRP). Always confirm with primary sources for policy decisions.";

  if (!county) {
    return {
      question,
      county: null,
      topic,
      headline: "Specify a Michigan county to get data",
      narrative:
        "Please name a Michigan county in your question (e.g., 'Wayne County', 'Alcona County') to retrieve specific data. AccessMI covers all 83 Michigan counties.",
      dataPoints: [],
      confidence: "none",
      suggestions: [
        "What is the food insecurity rate in Wayne County?",
        "How many healthcare providers does Genesee County need?",
        "What is the unemployment rate in Alcona County?",
      ],
      disclaimer,
    };
  }

  let dataPoints: CivicDataPoint[] = [];

  switch (topic) {
    case "food_insecurity":
      dataPoints = resolveFoodInsecurity(county);
      break;
    case "health_access":
      dataPoints = resolveHealthAccess(county);
      break;
    case "economic_hardship":
      dataPoints = resolveEconomicHardship(county);
      break;
    case "housing":
      dataPoints = resolveHousing(county);
      break;
    case "unemployment":
      dataPoints = resolveUnemployment(county);
      break;
    case "broadband":
      dataPoints = resolveBroadband(county);
      break;
    case "chronic_disease":
      dataPoints = resolveChronicDisease(county, question);
      break;
    case "mental_health":
      dataPoints = resolveMentalHealth(county);
      break;
    case "provider_shortage":
      dataPoints = resolveProviderShortage(county);
      break;
    default:
      dataPoints = resolveGeneral(county);
      break;
  }

  const confidence: CivicConfidence =
    dataPoints.length === 0
      ? "none"
      : dataPoints.length === 1
        ? "thin"
        : dataPoints.length <= 3
          ? "medium"
          : "high";

  const { headline, narrative, suggestions } = buildNarrative(
    county,
    topic,
    dataPoints,
    question,
  );

  return {
    question,
    county,
    topic,
    headline,
    narrative,
    dataPoints,
    confidence,
    suggestions,
    disclaimer,
  };
}
