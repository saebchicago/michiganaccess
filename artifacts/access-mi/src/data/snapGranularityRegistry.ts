/**
 * SNAP food-access family - granularity + provenance registry.
 *
 * This file is the slice's source of truth for "what is a metric in this
 * family, at what geographic resolution, with what provenance label, from
 * what source, at what vintage, with what denominator." Every chart in the
 * Food Access Explorer reads metric definitions from here; the per-chart
 * provenance panel reads its denominator + source + vintage from here; the
 * granularity gate (renderer-side) reads nativeResolution from here.
 *
 * This is NOT a new source declaration. The sources (USDA FNS-388A, USDA
 * SNAP Retailer Locator, Census PEP) are already in the platform's
 * sourcesRegistry. This file only declares which fields of the family's
 * existing data files (snapCountyGenerated.json, county-snap-retailers.ts,
 * snapMichiganFallback.ts) correspond to renderable metrics.
 *
 * Rules of the registry (see CLAUDE.md, accessmi-provenance-labels.md):
 *  - nativeResolution is the resolution at which the data is published by
 *    its primary source. It is never inferred. If the data file does not
 *    state it explicitly, the metric belongs in the "unknown" bucket and
 *    must not participate in multi-variable crossing.
 *  - primaryLabel is the label that applies to county-level values as read
 *    from the source. Any derived view (aggregation, fitted element) must
 *    downgrade to MODELED via resolveCompositeLabel() at render time.
 *  - vintage is the data file's own published vintage, copied verbatim from
 *    the file headers. It is not the date the script ran.
 */
import {
  SNAP_VINTAGE as RETAILER_VINTAGE,
  SNAP_SOURCE as RETAILER_SOURCE,
} from "./county-snap-retailers";
import { SNAP_COUNTY_PROVENANCE } from "./snapMichiganFallback";
import type { GeoResolution } from "@/types/data-layers";

export type ProvenanceLabel = "VERIFIED" | "MODELED" | "PROJECTED";

export type { GeoResolution };
/** Slug used in the registry when native resolution cannot be confirmed
 * from the source's own published metadata. Maps to the platform's
 * "unverified" GeoResolution. */
export const UNKNOWN_RESOLUTION: GeoResolution = "unverified";

export interface SnapMetricDef {
  /** Stable identifier used in URLs, charts, and registries. */
  id: string;
  /** Human-readable label for headers and legend. */
  label: string;
  /** Compact label for axis ticks and chips. */
  shortLabel: string;
  /** Unit string for tooltips ("persons", "per 10k residents", etc). */
  unit: string;
  /** Brief plain-language description for the methodology panel. */
  description: string;
  /** Resolution at which the source publishes; never inferred. */
  nativeResolution: GeoResolution;
  /** Provenance label for raw county values as read from the source. */
  primaryLabel: ProvenanceLabel;
  /** Source attribution. URL points at the source's own data page. */
  source: { name: string; url: string };
  /** Vintage string as carried in the data file header. */
  vintage: string;
  /** What is divided in (or "raw count" if none). */
  denominator: string;
  /** One-line description of how the value is computed from the source. */
  computation: string;
  /** True when the metric naturally pairs with another on the same axis
   * (i.e. is a normalized rate). Used by chart pickers to suggest crossings. */
  isRate: boolean;
}

const USDA_FNS_SNAP_DATA_PAGE =
  "https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap";

const USDA_RETAILER_DATA_PAGE = "https://www.fns.usda.gov/snap/retailer/data";

/**
 * The slice's 4 core metrics. All four are county-native, all four are
 * VERIFIED at the source. They are intentionally homogeneous: this is what
 * lets the multi-variable view cross them without invoking the granularity
 * gate. Cross-overlays with non-county metrics (e.g. ACS tract-level
 * poverty) belong to a separate registry and would invoke the gate.
 */
export const SNAP_FAMILY_METRICS: SnapMetricDef[] = [
  {
    id: "enrollmentTotal",
    label: "SNAP enrollment (persons)",
    shortLabel: "Enrollment",
    unit: "persons (avg monthly)",
    description:
      "Average monthly individuals certified to receive SNAP benefits in the county, FY2022.",
    nativeResolution: "county",
    primaryLabel: "VERIFIED",
    source: {
      name: SNAP_COUNTY_PROVENANCE.source_name,
      url: SNAP_COUNTY_PROVENANCE.source_url,
    },
    vintage: SNAP_COUNTY_PROVENANCE.vintage,
    denominator: "raw count (no denominator)",
    computation:
      "Average monthly participants reported by USDA FNS-388A for each county, fiscal year 2022.",
    isRate: false,
  },
  {
    id: "enrollmentHouseholds",
    label: "SNAP-certified households",
    shortLabel: "Households",
    unit: "households (avg monthly)",
    description:
      "Average monthly households certified to receive SNAP benefits in the county, FY2022.",
    nativeResolution: "county",
    primaryLabel: "VERIFIED",
    source: {
      name: SNAP_COUNTY_PROVENANCE.source_name,
      url: SNAP_COUNTY_PROVENANCE.source_url,
    },
    vintage: SNAP_COUNTY_PROVENANCE.vintage,
    denominator: "raw count (no denominator)",
    computation:
      "Average monthly certified households reported by USDA FNS-388A for each county, fiscal year 2022.",
    isRate: false,
  },
  {
    id: "retailerCount",
    label: "SNAP-authorized retailers",
    shortLabel: "Retailers",
    unit: "stores currently authorized",
    description:
      "Count of currently authorized SNAP food retailers operating in the county (rows whose End Date is blank in the source CSV).",
    nativeResolution: "county",
    primaryLabel: "VERIFIED",
    source: { name: RETAILER_SOURCE, url: USDA_RETAILER_DATA_PAGE },
    vintage: RETAILER_VINTAGE,
    denominator: "raw count (no denominator)",
    computation:
      "Sum of rows in USDA SNAP Retailer Locator with a non-blank Authorization Date and a blank End Date, assigned to county by the source's own County field (normalized).",
    isRate: false,
  },
  {
    id: "retailersPer10k",
    label: "Retailers per 10,000 residents",
    shortLabel: "Retailers / 10k",
    unit: "stores per 10,000 residents",
    description:
      "Currently authorized SNAP retailers per 10,000 residents in the county.",
    nativeResolution: "county",
    primaryLabel: "VERIFIED",
    source: { name: RETAILER_SOURCE, url: USDA_RETAILER_DATA_PAGE },
    vintage: RETAILER_VINTAGE,
    denominator: "Census PEP V2024 county population",
    computation:
      "(retailerCount / PEP V2024 population) * 10,000. Both numerator and denominator are county-native; the rate inherits county resolution.",
    isRate: true,
  },
];

/** Family-level metadata for the slice. */
export const SNAP_FAMILY = {
  id: "snap-food-access",
  label: "SNAP food access",
  shortLabel: "Food access",
  description:
    "USDA Supplemental Nutrition Assistance Program participation and retail-access metrics for Michigan counties.",
  primarySource: {
    name: "USDA Food and Nutrition Service",
    url: USDA_FNS_SNAP_DATA_PAGE,
  },
  // Native resolution of the family as a whole. The slice does not mix
  // resolutions; the granularity gate applies only when cross-overlaying
  // with a non-county family.
  nativeResolution: "county" as GeoResolution,
} as const;

/** Lookup a metric definition by id. Returns null if unknown. */
export function getSnapMetric(id: string): SnapMetricDef | null {
  return SNAP_FAMILY_METRICS.find((m) => m.id === id) ?? null;
}

/** Return all metric ids in display order. */
export function getSnapMetricIds(): string[] {
  return SNAP_FAMILY_METRICS.map((m) => m.id);
}

/**
 * Decide whether two metrics share an axis without invoking the granularity
 * gate. Two county-native metrics may share an axis. Mixing county with
 * sub-county (zcta, tract, point) without explicit aggregation must be
 * blocked by the renderer.
 */
export function canShareAxis(a: SnapMetricDef, b: SnapMetricDef): boolean {
  if (
    a.nativeResolution === UNKNOWN_RESOLUTION ||
    b.nativeResolution === UNKNOWN_RESOLUTION
  ) {
    return false;
  }
  return a.nativeResolution === b.nativeResolution;
}
