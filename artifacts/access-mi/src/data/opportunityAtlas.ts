import type { ProvenanceLabel } from "@/types/provenance";
import {
  COUNTY_SNAP_RETAILERS,
  SNAP_SOURCE,
  SNAP_VINTAGE,
} from "@/data/county-snap-retailers";
import {
  ACS_BROADBAND_COUNTY_RECORDS,
  ACS_BROADBAND_COUNTY_PROVENANCE,
  getAcsBroadbandForCountyName,
} from "@/data/acs-broadband-county";
import {
  BLS_LAUS_COUNTY_RECORDS,
  BLS_LAUS_COUNTY_PROVENANCE,
  getBlsLausForCountyName,
} from "@/data/bls-laus-county";
import {
  HRSA_HPSA_COUNTY_RECORDS,
  HRSA_HPSA_COUNTY_PROVENANCE,
  getHpsaForCountyName,
} from "@/data/hrsa-hpsa-county";

export type OpportunityGeographyType = "city" | "county" | "zcta";
export type OpportunityDomain =
  | "food"
  | "greenery"
  | "parks"
  | "environment"
  | "connectivity"
  | "economy"
  | "health-access";

export interface OpportunityPlace {
  id: string;
  geographyType: OpportunityGeographyType;
  label: string;
  countyName: string;
  countyFips: string;
  resolutionNote: string;
}

export interface OpportunityBenchmark {
  label: string;
  summary: string;
  method: string;
  provenanceLabel: "MODELED";
}

export interface OpportunityInsight {
  id: string;
  metricId: string;
  domain: OpportunityDomain;
  title: string;
  value: number;
  displayValue: string;
  unit: string;
  summary: string;
  whyItMatters: string;
  nativeResolution: "county";
  provenanceLabel: ProvenanceLabel;
  source: string;
  sourceUrl: string;
  vintage: string;
  benchmark: OpportunityBenchmark;
}

export type OpportunityLensStatus =
  | "live"
  | "ingestion-pending"
  | "permission-review";

export interface OpportunityLens {
  id: string;
  domain: OpportunityDomain;
  label: string;
  shortLabel: string;
  nativeResolution: "county" | "tract" | "blockGroup" | "walkshed";
  status: OpportunityLensStatus;
  provenanceLabel: ProvenanceLabel;
  source: string;
  sourceUrl: string;
  vintage: string;
  description: string;
  caveat: string;
}

export type OpportunityActionStatus =
  | "available-now"
  | "opens-soon"
  | "next-cycle"
  | "resource";

export interface OpportunityAction {
  id: string;
  domain: Extract<OpportunityDomain, "food" | "greenery" | "parks">;
  title: string;
  actor: string;
  description: string;
  source: string;
  sourceUrl: string;
  verifiedDate: string;
  opensOn?: string;
  closesOn?: string;
  recurring?: string;
  status: OpportunityActionStatus;
}

function percentile(value: number, values: number[]): number {
  const valid = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!valid.length) return 0;
  return Math.round((valid.filter((v) => v <= value).length / valid.length) * 100);
}

function percentileBenchmark(
  value: number,
  values: number[],
  label: string,
): OpportunityBenchmark {
  return {
    label,
    summary: `${percentile(value, values)}th percentile among Michigan counties with available values.`,
    method:
      "Derived by ranking the displayed source-native county value against the current Michigan county distribution. This comparison is MODELED; the underlying value retains its source provenance.",
    provenanceLabel: "MODELED",
  };
}

const pct = (value: number) => `${value.toFixed(1)}%`;

export function getOpportunityInsights(
  place: OpportunityPlace,
): OpportunityInsight[] {
  const county = place.countyName;
  const insights: OpportunityInsight[] = [];

  const snap = COUNTY_SNAP_RETAILERS[county];
  if (snap) {
    const distribution = Object.values(COUNTY_SNAP_RETAILERS).map(
      (record) => record.ratePer10k,
    );
    insights.push({
      id: `${place.id}-snap-retailers`,
      metricId: "snap-retailers-per-10k",
      domain: "food",
      title: "SNAP-authorized food retailer presence",
      value: snap.ratePer10k,
      displayValue: `${snap.ratePer10k.toFixed(1)} per 10,000 residents`,
      unit: "retailers per 10,000 residents",
      summary: `${county} County has ${snap.retailerCount.toLocaleString()} currently authorized SNAP retailers in the current AccessMI retailer extract. Retailer density is a supply-presence signal, not a travel-time or healthy-food-access measure.`,
      whyItMatters:
        "Retailer presence helps describe food-system capacity, but neighborhood access depends on distance, road network, vehicle access, retailer type, affordability, and other factors. The 2025 USDA SRAM tract lens below is the appropriate next layer for travel-access analysis.",
      nativeResolution: "county",
      provenanceLabel: "VERIFIED",
      source: SNAP_SOURCE,
      sourceUrl: "https://www.fns.usda.gov/snap/retailer/data",
      vintage: SNAP_VINTAGE,
      benchmark: percentileBenchmark(
        snap.ratePer10k,
        distribution,
        "Michigan county context",
      ),
    });
  }

  const broadband = getAcsBroadbandForCountyName(county);
  if (
    broadband?.status === "populated" &&
    broadband.broadbandSubscriptionRate !== null
  ) {
    const distribution = ACS_BROADBAND_COUNTY_RECORDS.flatMap((record) =>
      record.broadbandSubscriptionRate === null
        ? []
        : [record.broadbandSubscriptionRate],
    );
    insights.push({
      id: `${place.id}-broadband`,
      metricId: "household-broadband-subscription",
      domain: "connectivity",
      title: "Household broadband subscription",
      value: broadband.broadbandSubscriptionRate,
      displayValue: pct(broadband.broadbandSubscriptionRate),
      unit: "percent of households",
      summary: `${pct(broadband.broadbandSubscriptionRate)} of households in ${county} County have a broadband subscription in the AccessMI ACS extract. This is adoption/subscription, not physical network availability.`,
      whyItMatters:
        "Subscription affects access to telehealth, education, jobs, benefits, and civic information. Cost, device access, skills, and infrastructure can each contribute to a subscription gap.",
      nativeResolution: "county",
      provenanceLabel: "VERIFIED",
      source: ACS_BROADBAND_COUNTY_PROVENANCE.source_name,
      sourceUrl: ACS_BROADBAND_COUNTY_PROVENANCE.source_url,
      vintage: ACS_BROADBAND_COUNTY_PROVENANCE.vintage_window,
      benchmark: percentileBenchmark(
        broadband.broadbandSubscriptionRate,
        distribution,
        "Michigan county context",
      ),
    });
  }

  const unemployment = getBlsLausForCountyName(county);
  if (
    unemployment?.status === "populated" &&
    unemployment.unemploymentRate !== null
  ) {
    const distribution = BLS_LAUS_COUNTY_RECORDS.flatMap((record) =>
      record.unemploymentRate === null ? [] : [record.unemploymentRate],
    );
    const preliminary = unemployment.preliminary ? " Preliminary." : "";
    insights.push({
      id: `${place.id}-unemployment`,
      metricId: "unemployment-rate",
      domain: "economy",
      title: "Local unemployment",
      value: unemployment.unemploymentRate,
      displayValue: pct(unemployment.unemploymentRate),
      unit: "percent of labor force",
      summary: `${county} County's latest LAUS unemployment rate is ${pct(unemployment.unemploymentRate)} for ${unemployment.latestPeriod ?? "the latest available month"}.${preliminary}`,
      whyItMatters:
        "Employment conditions can shape household financial stability and demand for community supports. Monthly estimates may be revised, so the period and preliminary flag travel with the figure.",
      nativeResolution: "county",
      provenanceLabel: "VERIFIED",
      source: BLS_LAUS_COUNTY_PROVENANCE.source_name,
      sourceUrl: BLS_LAUS_COUNTY_PROVENANCE.source_url,
      vintage:
        unemployment.latestPeriod ??
        BLS_LAUS_COUNTY_PROVENANCE.latest_vintage ??
        "Latest available",
      benchmark: percentileBenchmark(
        unemployment.unemploymentRate,
        distribution,
        "Michigan county context",
      ),
    });
  }

  const hpsa = getHpsaForCountyName(county);
  const primaryCare = hpsa?.disciplines.primaryCare;
  if (
    primaryCare &&
    (primaryCare.designatedHpsas > 0 || primaryCare.maxHpsaScore !== null)
  ) {
    const value = primaryCare.maxHpsaScore ?? 0;
    const distribution = HRSA_HPSA_COUNTY_RECORDS.map(
      (record) => record.disciplines.primaryCare.maxHpsaScore ?? 0,
    );
    const vintage = HRSA_HPSA_COUNTY_PROVENANCE.per_discipline.find(
      (entry) => entry.disciplineId === "primaryCare",
    )?.dwCreateDate;
    insights.push({
      id: `${place.id}-primary-care-hpsa`,
      metricId: "primary-care-hpsa-severity",
      domain: "health-access",
      title: "Primary-care shortage designation severity",
      value,
      displayValue: `max HPSA score ${value}`,
      unit: "HPSA score",
      summary: `${county} County has ${primaryCare.designatedHpsas} primary-care HPSA designation${primaryCare.designatedHpsas === 1 ? "" : "s"}; the highest designation score is ${value}. AccessMI does not add designation populations or staffing fields because HPSA service areas can overlap.`,
      whyItMatters:
        "HPSA designations identify areas or populations with provider shortages. This county rollup is derived from HRSA facility-detail files and therefore remains MODELED rather than being presented as a HRSA-published county summary.",
      nativeResolution: "county",
      provenanceLabel: "MODELED",
      source: HRSA_HPSA_COUNTY_PROVENANCE.source_name,
      sourceUrl: HRSA_HPSA_COUNTY_PROVENANCE.source_url,
      vintage: vintage ?? "Latest ingested HRSA detail files",
      benchmark: percentileBenchmark(
        value,
        distribution,
        "Michigan county context",
      ),
    });
  }

  return insights.slice(0, 5);
}

/**
 * Fine-grain lenses remain explicit about ingestion/legal state. A coarse
 * county proxy must never be presented as tract/block-group/walkshed data.
 */
export const OPPORTUNITY_LENSES: readonly OpportunityLens[] = [
  {
    id: "usda-sram-2025",
    domain: "food",
    label: "2025 SNAP-authorized retailer access",
    shortLabel: "Food access",
    nativeResolution: "tract",
    status: "ingestion-pending",
    provenanceLabel: "PENDING",
    source:
      "USDA Economic Research Service - 2025 SNAP-authorized Retailer Access Map (SRAM)",
    sourceUrl:
      "https://www.ers.usda.gov/data-products/food-access-research-atlas/download-the-data",
    vintage: "2025 retailers; 2020 Census tracts; 2020-2024 ACS context",
    description:
      "The current USDA tract product adds straight-line and road-network retailer-access measures. AccessMI's reproducible Michigan ingestion pipeline is tracked separately from the older county retailer-presence signal.",
    caveat:
      "Until the normalized Michigan extract passes schema and plausibility checks, AccessMI shows the primary source rather than inventing tract values or applying its own unqualified 'food desert' label.",
  },
  {
    id: "tree-equity",
    domain: "greenery",
    label: "Tree Equity Score",
    shortLabel: "Tree equity",
    nativeResolution: "blockGroup",
    status: "ingestion-pending",
    provenanceLabel: "PENDING",
    source: "American Forests - Tree Equity Score",
    sourceUrl: "https://www.treeequityscore.org/methodology",
    vintage: "Current publisher release; ingestion not yet pinned in AccessMI",
    description:
      "Block-group tree-equity methodology can support canopy-gap and planting-priority context once a versioned Michigan extract and redistribution terms are pinned.",
    caveat:
      "AccessMI does not infer tree canopy from rurality, park presence, satellite imagery it has not processed, or any other proxy.",
  },
  {
    id: "parkserve",
    domain: "parks",
    label: "10-minute park access",
    shortLabel: "Park access",
    nativeResolution: "walkshed",
    status: "permission-review",
    provenanceLabel: "PENDING",
    source: "Trust for Public Land - ParkServe",
    sourceUrl: "https://www.tpl.org/park-data-downloads",
    vintage: "Current ParkServe release; redistribution not enabled in AccessMI",
    description:
      "ParkServe's network-based walksheds account for walkable streets and barriers and are methodologically preferable to a simple radius.",
    caveat:
      "AccessMI will not reproduce or redistribute ParkServe geometry until the applicable terms permit the intended use. A circular-distance approximation will never be labeled as ParkServe's 10-minute result.",
  },
  {
    id: "miejscreen-1-5",
    domain: "environment",
    label: "MiEJScreen 1.5 environmental context",
    shortLabel: "Environmental context",
    nativeResolution: "tract",
    status: "ingestion-pending",
    provenanceLabel: "PENDING",
    source: "Michigan EGLE - MiEJScreen 1.5",
    sourceUrl: "https://www.michigan.gov/egle/maps-data/miejscreen",
    vintage: "Version 1.5 (2026)",
    description:
      "Michigan's tract-level environmental-justice screening tool can add indicator and percentile context once a versioned extract is pinned and validated.",
    caveat:
      "MiEJScreen percentiles are relative screening measures, not individual health-risk predictions or causal estimates. AccessMI will preserve that distinction.",
  },
];

export const OPPORTUNITY_ACTIONS: readonly OpportunityAction[] = [
  {
    id: "dte-tree-grant-2026",
    domain: "greenery",
    title: "2026-27 DTE Foundation Tree Planting Grant",
    actor:
      "Eligible local governments, schools, and nonprofits in DTE service territory",
    description:
      "Michigan DNR is accepting applications for community tree-planting projects. Awards provide up to $4,000 per applicant with a 1:1 match requirement.",
    source: "Michigan Department of Natural Resources",
    sourceUrl: "https://www.michigan.gov/dnr/managing-resources/forestry/urban",
    verifiedDate: "2026-08-25",
    closesOn: "2026-09-14",
    status: "available-now",
  },
  {
    id: "mi-good-food-fund",
    domain: "food",
    title: "Michigan Good Food Fund financing",
    actor: "Michigan-based food and farm businesses",
    description:
      "Flexible financing and business assistance for eligible Michigan food and farm businesses, including food retailers and enterprises serving under-resourced communities.",
    source: "Michigan Good Food Fund",
    sourceUrl: "https://migoodfoodfund.org/support-for-entrepreneurs/get-funded/",
    verifiedDate: "2026-08-25",
    status: "resource",
  },
  {
    id: "mi-good-food-seed-2026",
    domain: "food",
    title: "Michigan Good Food Fund 2026 Seed Awards",
    actor: "Eligible Michigan food and farm businesses",
    description:
      "The next Seed Awards round is scheduled to open September 7, 2026, with grants described by the program as $5,000-$20,000.",
    source: "Michigan Good Food Fund",
    sourceUrl:
      "https://migoodfoodfund.org/support-for-entrepreneurs/seed-awards/",
    verifiedDate: "2026-08-25",
    opensOn: "2026-09-07",
    status: "opens-soon",
  },
  {
    id: "recreation-passport",
    domain: "parks",
    title: "Michigan Recreation Passport grants",
    actor: "Eligible local units of government",
    description:
      "Annual Michigan DNR grants support public recreation development and renovation. The 2026 application period closed April 1; the program lists April 1 as the annual deadline.",
    source: "Michigan Department of Natural Resources",
    sourceUrl: "https://www.michigan.gov/dnr/buy-and-apply/grants/rec/rec-pp",
    verifiedDate: "2026-08-25",
    recurring: "Annual application deadline: April 1",
    status: "next-cycle",
  },
];
