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
import {
  HUD_CHAS_COUNTY_PROVENANCE,
  getChasForCountyName,
} from "@/data/hud-chas-county";
import {
  ACS_SDOH_COUNTY_PROVENANCE,
  getAcsSdohValue,
} from "@/data/acs-sdoh-county";
import { MDE_COUNTY_PROVENANCE, MDE_SOURCE_LABEL, getMdeValue } from "@/data/mde-county";
import { SVI_COUNTY_PROVENANCE, getSviOverallPercentile } from "@/data/cdc-svi-county";
import { getOverdoseForCountyName, overdosePeriodLabel } from "@/data/nchs-overdose-county";

/** Source string for ACS county SDOH bundle points. */
const ACS_SDOH_SOURCE = `U.S. Census ACS 5-Year ${ACS_SDOH_COUNTY_PROVENANCE.vintage_window}`;

/**
 * Poverty point: the ACS bundle (2020-2024, B17001) when populated,
 * otherwise the static cross-domain "ACS 5-Year 2022" column. Shared by
 * resolveEconomicHardship and resolveGeneral so the two never disagree.
 */
function povertyPoint(county: string, cdPovertyRate: number | null): CivicDataPoint | null {
  const bundled = getAcsSdohValue(county, "povertyPct");
  if (bundled !== null) {
    return {
      label: "Poverty rate",
      value: `${bundled.toFixed(1)}%`,
      valueLabel: "VERIFIED",
      source: `${ACS_SDOH_SOURCE} (B17001)`,
      vintage: ACS_SDOH_COUNTY_PROVENANCE.vintage_window,
      note:
        bundled > MI_STATE_AVERAGES.povertyRate!
          ? "Above state average"
          : "Below state average",
    };
  }
  if (cdPovertyRate === null) return null;
  return {
    label: "Poverty rate",
    value: `${cdPovertyRate}%`,
    valueLabel: "VERIFIED",
    source: "ACS 5-Year 2022",
    vintage: "2022",
    note:
      cdPovertyRate > MI_STATE_AVERAGES.povertyRate!
        ? "Above state average"
        : "Below state average",
  };
}

// ── Types ─────────────────────────────────────────────────────────────────

export interface CivicDataPoint {
  label: string;
  value: string;
  valueLabel: IntegrityLabel;
  source: string;
  vintage: string;
  note?: string;
  /**
   * True when this point is adjacent context rather than the measure the user
   * actually asked for (e.g. the generic top-3 chronic measures shown for an
   * unspecific question). Confidence is capped when any point is a fallback,
   * so an answer that did not address the question cannot report "high".
   */
  isFallback?: boolean;
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
  housing: [
    "housing",
    "rent",
    "eviction",
    "homeless",
    "shelter",
    "afford",
    "cost burden",
    "housing cost",
    "chas",
  ],
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
    // Both are in the CDC PLACES rollup and have resolver branches, but were
    // missing here - so "stroke in Wayne County" fell through to `general` and
    // answered with population/poverty/unemployment at "high" confidence.
    "stroke",
    "arthritis",
  ],
  mental_health: [
    "mental health",
    "depression",
    "anxiety",
    "substance",
    "behavioral health",
    "opioid",
    "overdose",
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

/**
 * The topics this engine can actually answer, in the wording a visitor would
 * use.
 *
 * The panel copy promises "any of the 83 Michigan counties", which oversells a
 * nine-topic county-metric lookup: ask about anything else and the router falls
 * through to `general` and returns population/poverty/unemployment. Declaring
 * the scope up front converts the common failure from confidently-wrong into
 * honestly-limited.
 *
 * Typed as a Record over the non-general topics so adding a CivicTopic without
 * giving it a label is a type error, and this list cannot drift.
 */
export const TOPIC_LABELS: Record<Exclude<CivicTopic, "general">, string> = {
  food_insecurity: "Food insecurity",
  health_access: "Health coverage and access",
  economic_hardship: "Economic hardship",
  housing: "Housing",
  unemployment: "Unemployment",
  broadband: "Broadband",
  chronic_disease: "Chronic disease",
  mental_health: "Mental health",
  provider_shortage: "Provider shortage",
};

export const ANSWERABLE_TOPICS = Object.entries(TOPIC_LABELS) as [
  Exclude<CivicTopic, "general">,
  string,
][];

/**
 * Detect the topic by the LONGEST matching keyword across all topics, not by
 * declaration order.
 *
 * Declaration order was actively wrong: `health_access` is declared before
 * `mental_health` and lists the bare keyword "health", so every mental-health
 * question ("mental health services in Kent County") matched `health_access`
 * first and came back with uninsured rate and PCP ratio. Preferring the longest
 * match makes "mental health" (13 chars) beat "health" (6), and fixes the whole
 * class rather than that one pair - any specific multi-word keyword now wins
 * over a generic substring of itself.
 *
 * Ties keep declaration order, which is the previous behavior.
 */
export function detectTopic(text: string): CivicTopic {
  const lower = text.toLowerCase();
  let best: { topic: CivicTopic; length: number } | null = null;

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS) as [
    CivicTopic,
    string[],
  ][]) {
    if (topic === "general") continue;
    for (const kw of keywords) {
      if (!lower.includes(kw)) continue;
      if (best === null || kw.length > best.length) {
        best = { topic, length: kw.length };
      }
    }
  }

  return best?.topic ?? "general";
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

  const poverty = povertyPoint(county, cd.povertyRate);
  if (poverty) points.push(poverty);
  const childPoverty = getAcsSdohValue(county, "childPovertyPct");
  if (childPoverty !== null) {
    points.push({
      label: "Children under 18 below the poverty line",
      value: `${childPoverty.toFixed(1)}%`,
      valueLabel: "VERIFIED",
      source: `${ACS_SDOH_SOURCE} (B17020)`,
      vintage: ACS_SDOH_COUNTY_PROVENANCE.vintage_window,
    });
  }
  const svi = getSviOverallPercentile(county);
  if (svi !== null) {
    points.push({
      label: "Social vulnerability (US county percentile)",
      value: `${svi.toFixed(0)}th`,
      valueLabel: "MODELED",
      source: `CDC/ATSDR SVI ${SVI_COUNTY_PROVENANCE.svi_year}, county rankings`,
      vintage: String(SVI_COUNTY_PROVENANCE.svi_year),
      note: "ATSDR composite of ACS inputs; higher = more vulnerable.",
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
    // Below-threshold share is a classification against a constructed
    // Survival Budget; aliceData.ts labels every row MODELED. This point
    // said VERIFIED with a hardcoded 2023 vintage after the payload moved
    // to the 2026 sheet (2024 data).
    points.push({
      label: "Economic hardship rate (poverty + ALICE)",
      value: `${alice.combinedHardshipPct}%`,
      valueLabel: "MODELED",
      source: alice.source,
      vintage: String(alice.year),
    });
  }

  return points;
}

function resolveHousing(county: string): CivicDataPoint[] {
  const cd = getCountyCrossDomain(county);
  const points: CivicDataPoint[] = [];

  // HUD CHAS cost burden across all tenures and income bands. When it is
  // populated the older static ACS rent-burden point below is kept as
  // context but flagged isFallback so two burden figures cannot inflate
  // confidence; when CHAS is pending-ci the static point stands alone.
  const chas = getChasForCountyName(county);
  const chasPopulated =
    chas?.status === "populated" && chas.costBurdened30Pct !== null;
  if (chasPopulated) {
    const vintage = HUD_CHAS_COUNTY_PROVENANCE.vintage_window ?? "latest";
    points.push({
      label: "Cost-burdened households (>30% of income on housing)",
      value: `${chas!.costBurdened30Pct!.toFixed(1)}%`,
      valueLabel: "VERIFIED",
      source: `HUD CHAS ${vintage} (Table 8, all tenures)`,
      vintage,
      note:
        chas!.costBurdened50Pct !== null
          ? `${chas!.costBurdened50Pct.toFixed(1)}% severely burdened (>50%)`
          : undefined,
    });
    if (chas!.renterCostBurdened30Pct !== null) {
      points.push({
        label: "Renter households cost-burdened (>30%)",
        value: `${chas!.renterCostBurdened30Pct.toFixed(1)}%`,
        valueLabel: "VERIFIED",
        source: `HUD CHAS ${vintage} (Table 8, renters)`,
        vintage,
      });
    }
  }

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
      isFallback: chasPopulated,
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

  // Fallback for when the ACS broadband rollup has no value for this county
  // (rows carry status "pending-ci" until a refresh populates them). Without
  // this point the resolver answered a broadband question with household
  // VEHICLE access alone, under a "Broadband access in X County" headline: a
  // different measure presented as the answer. State the gap explicitly
  // instead. As of the 2026-08-07 refresh all 83 counties are populated, so
  // this branch is dormant - it stays because a future refresh can fail.
  if (points.length === 0) {
    points.push({
      label: "Broadband subscription rate",
      value: "Not yet available",
      valueLabel: "PENDING",
      source: "U.S. Census ACS 5-Year (B28002)",
      vintage: "pending ingestion",
      note: "County-level broadband data has not been ingested yet.",
    });
  }

  // Retained as related digital/physical access context, not as broadband.
  // Flagged isFallback so it cannot lift the answer's confidence. Reads the
  // ACS bundle (B08201) when populated, else the static 2022 column.
  const noVehicle = getAcsSdohValue(county, "noVehicleHouseholdsPct");
  if (noVehicle !== null) {
    points.push({
      label: "Households with no vehicle available",
      value: `${noVehicle.toFixed(1)}%`,
      valueLabel: "VERIFIED",
      source: `${ACS_SDOH_SOURCE} (B08201)`,
      vintage: ACS_SDOH_COUNTY_PROVENANCE.vintage_window,
      note: "Related access measure, not a broadband figure.",
      isFallback: true,
    });
  } else if (cd.vehicleAccess !== null) {
    points.push({
      label: "Households with vehicle access",
      value: `${cd.vehicleAccess}%`,
      valueLabel: "VERIFIED",
      source: "ACS 5-Year 2022",
      vintage: "2022",
      note: "Related access measure, not a broadband figure.",
      isFallback: true,
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
  // Both are present in the CDC PLACES rollup but previously had no branch, so
  // asking about them fell through to the generic top-three below.
  if (q.includes("stroke")) measures.push({ key: "stroke", label: "Stroke" });
  if (q.includes("arthritis"))
    measures.push({ key: "arthritis", label: "Arthritis" });

  // Measures a user may reasonably ask about that this dataset does not carry.
  // "cancer" is a chronic_disease keyword, so without this the question fell to
  // the generic top-three and answered about diabetes without ever saying that
  // cancer data is unavailable.
  const UNAVAILABLE: Array<{ match: string; label: string }> = [
    { match: "cancer", label: "Cancer prevalence" },
    { match: "oncolog", label: "Cancer prevalence" },
  ];
  const unavailable = UNAVAILABLE.find((u) => q.includes(u.match));
  if (unavailable && measures.length === 0) {
    return [
      {
        label: unavailable.label,
        value: "Not available",
        valueLabel: "PENDING",
        source: "CDC PLACES county rollup",
        vintage: "2025 release",
        note: "This measure is not in the CDC PLACES dataset on the platform. Showing unrelated chronic-disease figures instead would not answer the question.",
      },
    ];
  }

  // If no specific measure asked, show top chronic measures as general context.
  // Flagged isFallback so an unspecific question cannot report high confidence.
  const isGenericFallback = measures.length === 0;
  if (isGenericFallback) {
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
        isFallback: isGenericFallback,
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

  // Provisional overdose deaths (NCHS VSRR). A suppressed county states the
  // suppression rather than reporting nothing; pending rows push nothing.
  const od = getOverdoseForCountyName(county);
  const odPeriod = overdosePeriodLabel();
  if (od?.status === "populated" && od.provisionalDeaths12mo !== null) {
    points.push({
      label: `Drug overdose deaths (provisional, ${odPeriod ?? "12 months"})`,
      value: od.provisionalDeaths12mo.toLocaleString(),
      valueLabel: "VERIFIED",
      source: "CDC / NCHS Vital Statistics Rapid Release, county counts",
      vintage: odPeriod ?? "latest",
      note: "Provisional; NCHS revises as death certificates finalize.",
    });
  } else if (od?.status === "suppressed") {
    points.push({
      label: `Drug overdose deaths (provisional, ${odPeriod ?? "12 months"})`,
      value: "under 10 (suppressed by NCHS)",
      valueLabel: "VERIFIED",
      source: "CDC / NCHS Vital Statistics Rapid Release, county counts",
      vintage: odPeriod ?? "latest",
      note: "NCHS withholds counts under 10 to protect privacy.",
    });
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

  const poverty = povertyPoint(county, cd.povertyRate);
  if (poverty) points.push({ ...poverty, note: undefined });

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

  // K-12 chronic absenteeism (MDE / CEPI county export). Null while the
  // dataset is pending or the county cell is suppressed, so nothing is
  // pushed rather than a zero.
  const absent = getMdeValue(county, "chronicAbsenteeismPct");
  if (absent !== null) {
    points.push({
      label: "Chronically absent K-12 students",
      value: `${absent.toFixed(1)}%`,
      valueLabel: "VERIFIED",
      source: MDE_SOURCE_LABEL,
      vintage: MDE_COUNTY_PROVENANCE.school_year ?? "latest",
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

  // Confidence used to be a pure row count, so an answer that addressed the
  // wrong measure could still render "high" simply by returning four rows.
  // It now reflects whether the answer actually addressed the question:
  //   - any fallback point (adjacent context, not what was asked)  -> cap "thin"
  //   - every point PENDING (the data is not on the platform yet)  -> "none"
  // Row count only breaks ties among genuinely responsive answers.
  const answered = dataPoints.filter((p) => !p.isFallback);
  const allPending =
    dataPoints.length > 0 &&
    dataPoints.every((p) => p.valueLabel === "PENDING");
  const hasFallback = dataPoints.some((p) => p.isFallback);

  const confidence: CivicConfidence =
    dataPoints.length === 0 || allPending
      ? "none"
      : hasFallback || answered.length === 1
        ? "thin"
        : answered.length <= 3
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
