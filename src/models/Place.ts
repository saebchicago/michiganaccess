/**
 * Unified Place Model & Resolver
 * Normalizes all geographic routes into a consistent Place type with fallback chains.
 */

import { COUNTY_PROFILES, getCountyProfile, type CountyProfile } from "@/data/michigan-county-profiles";
import { MICHIGAN_CITIES, zipToCounty } from "@/data/michigan-county-seats";
import { getRegionForCounty, type MichiganRegion } from "@/data/michigan-regions";
import { countyToSlug } from "@/utils/countyUtils";

export type PlaceType = "state" | "region" | "county" | "city" | "zip";

export interface Place {
  placeType: PlaceType;
  slug: string;
  name: string;
  parentCounty?: string;
  region?: MichiganRegion;
  geoGrainLabel: string;
  fallbackChain: PlaceType[];
  confidence: "high" | "moderate" | "limited";
  countyProfile: CountyProfile;
  /** Whether the displayed data is a fallback from a coarser geography */
  isFallback: boolean;
  fallbackLabel?: string;
  zip?: string;
  city?: string;
}

export interface PlaceIndicator {
  id: string;
  domain: "health" | "housing" | "energy" | "environment" | "transportation" | "safety" | "education" | "food";
  label: string;
  value: string;
  numericValue: number;
  unit: string;
  stateAvg: number;
  countyAvg?: number;
  direction: "lower-is-better" | "higher-is-better";
  implication: string;
  source: string;
  sourceUrl: string;
  updated: string;
  grain: string;
}

// ── State Averages (curated from CHR, ACS, USDA) ──
export const STATE_AVERAGES: Record<string, { value: number; label: string; unit: string }> = {
  uninsured: { value: 6.5, label: "Uninsured Rate", unit: "%" },
  pcRatio: { value: 1290, label: "Primary Care Ratio", unit: ":1" },
  foodInsecurity: { value: 13.0, label: "Food Insecurity", unit: "%" },
  energyBurden: { value: 3.5, label: "Energy Burden", unit: "%" },
  violentCrime: { value: 450, label: "Violent Crime Rate", unit: "per 100k" },
  graduationRate: { value: 82, label: "HS Graduation Rate", unit: "%" },
  broadband: { value: 87, label: "Broadband Access", unit: "%" },
  drinkingWater: { value: 92, label: "Clean Drinking Water", unit: "% compliant" },
};

// ── Parsers ──
function parseRate(val: string): number {
  const m = val.match(/([\d.]+)/);
  return m ? parseFloat(m[1]) : 0;
}

function parseRatio(val: string): number {
  const m = val.match(/([\d,]+)/);
  return m ? parseFloat(m[1].replace(",", "")) : 0;
}

// ── Resolver ──
export function resolvePlace(params: {
  type: PlaceType;
  slug?: string;
  cityName?: string;
  zipcode?: string;
}): Place | null {
  const { type } = params;

  if (type === "state") {
    return {
      placeType: "state",
      slug: "michigan",
      name: "Michigan",
      geoGrainLabel: "Statewide",
      fallbackChain: [],
      confidence: "high",
      countyProfile: getCountyProfile("Wayne"), // placeholder
      isFallback: false,
    };
  }

  if (type === "county" && params.slug) {
    const normalized = params.slug.replace(/-county$/i, "");
    for (const name of Object.keys(COUNTY_PROFILES)) {
      if (countyToSlug(name) === normalized || countyToSlug(name) === params.slug) {
        const profile = COUNTY_PROFILES[name];
        const region = getRegionForCounty(name) || undefined;
        return {
          placeType: "county",
          slug: params.slug,
          name: `${name} County`,
          parentCounty: name,
          region,
          geoGrainLabel: "County",
          fallbackChain: ["region", "state"],
          confidence: "high",
          countyProfile: profile,
          isFallback: false,
        };
      }
    }
    // case-insensitive space match
    const lower = normalized.replace(/-/g, " ").toLowerCase();
    for (const name of Object.keys(COUNTY_PROFILES)) {
      if (name.toLowerCase() === lower) {
        const profile = COUNTY_PROFILES[name];
        const region = getRegionForCounty(name) || undefined;
        return {
          placeType: "county",
          slug: params.slug,
          name: `${name} County`,
          parentCounty: name,
          region,
          geoGrainLabel: "County",
          fallbackChain: ["region", "state"],
          confidence: "high",
          countyProfile: profile,
          isFallback: false,
        };
      }
    }
    return null;
  }

  if (type === "city" && params.cityName) {
    const lower = params.cityName.toLowerCase().replace(/-/g, " ");
    const match = MICHIGAN_CITIES.find(c => c.city.toLowerCase() === lower);
    if (match) {
      const profile = COUNTY_PROFILES[match.county];
      if (profile) {
        return {
          placeType: "city",
          slug: params.cityName,
          name: match.city,
          parentCounty: match.county,
          region: getRegionForCounty(match.county) || undefined,
          geoGrainLabel: "County Average (city-level data limited)",
          fallbackChain: ["county", "region", "state"],
          confidence: "moderate",
          countyProfile: profile,
          isFallback: true,
          fallbackLabel: `${match.county} County average`,
          city: match.city,
          zip: match.zip,
        };
      }
    }
    // search majorCities
    for (const [county, profile] of Object.entries(COUNTY_PROFILES)) {
      if (profile.majorCities.some(c => c.toLowerCase() === lower)) {
        const cityName = params.cityName.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
        return {
          placeType: "city",
          slug: params.cityName,
          name: cityName,
          parentCounty: county,
          region: getRegionForCounty(county) || undefined,
          geoGrainLabel: "County Average (city-level data limited)",
          fallbackChain: ["county", "region", "state"],
          confidence: "moderate",
          countyProfile: profile,
          isFallback: true,
          fallbackLabel: `${county} County average`,
          city: cityName,
        };
      }
    }
    return null;
  }

  if (type === "zip" && params.zipcode) {
    const cityMatch = MICHIGAN_CITIES.find(c => c.zip === params.zipcode);
    if (cityMatch) {
      const profile = COUNTY_PROFILES[cityMatch.county];
      if (profile) {
        return {
          placeType: "zip",
          slug: params.zipcode,
          name: `ZIP ${params.zipcode}`,
          parentCounty: cityMatch.county,
          region: getRegionForCounty(cityMatch.county) || undefined,
          geoGrainLabel: "County Average (ZIP-level data limited)",
          fallbackChain: ["city", "county", "region", "state"],
          confidence: "limited",
          countyProfile: profile,
          isFallback: true,
          fallbackLabel: `${cityMatch.county} County average`,
          city: cityMatch.city,
          zip: params.zipcode,
        };
      }
    }
    const county = zipToCounty(params.zipcode);
    if (county) {
      const profile = COUNTY_PROFILES[county];
      if (profile) {
        return {
          placeType: "zip",
          slug: params.zipcode,
          name: `ZIP ${params.zipcode}`,
          parentCounty: county,
          region: getRegionForCounty(county) || undefined,
          geoGrainLabel: "County Average (ZIP-level data limited)",
          fallbackChain: ["county", "region", "state"],
          confidence: "limited",
          countyProfile: profile,
          isFallback: true,
          fallbackLabel: `${county} County average`,
          zip: params.zipcode,
        };
      }
    }
    return null;
  }

  return null;
}

// ── Indicator Builder ──
export function buildPlaceIndicators(place: Place): PlaceIndicator[] {
  const p = place.countyProfile;
  const hh = p.healthHighlights;
  const grain = place.isFallback ? place.fallbackLabel || "County Average" : place.geoGrainLabel;
  const indicators: PlaceIndicator[] = [];

  const uninsured = parseRate(hh[0]?.value || "6.5%");
  indicators.push({
    id: "uninsured",
    domain: "health",
    label: "Uninsured Rate",
    value: hh[0]?.value || "~6.5%",
    numericValue: uninsured,
    unit: "%",
    stateAvg: 6.5,
    direction: "lower-is-better",
    implication: uninsured > 8 ? "Suggests limited insurance access; residents may delay care." : uninsured < 5 ? "Strong insurance coverage; most residents have access to care." : "Near state average for insurance coverage.",
    source: "County Health Rankings",
    sourceUrl: "https://www.countyhealthrankings.org/",
    updated: "2025",
    grain,
  });

  const pcRatio = parseRatio(hh[1]?.value || "1,290:1");
  indicators.push({
    id: "pc-ratio",
    domain: "health",
    label: "Primary Care Ratio",
    value: hh[1]?.value || "1,290:1",
    numericValue: pcRatio,
    unit: ":1",
    stateAvg: 1290,
    direction: "lower-is-better",
    implication: pcRatio > 3000 ? "Significant provider shortage; may indicate long wait times." : pcRatio < 1000 ? "Strong primary care access relative to population." : "Moderate primary care access.",
    source: "HRSA Area Health Resources",
    sourceUrl: "https://data.hrsa.gov/",
    updated: "2025",
    grain,
  });

  const food = parseRate(hh[2]?.value || "13%");
  indicators.push({
    id: "food-insecurity",
    domain: "food",
    label: "Food Insecurity",
    value: hh[2]?.value || "~13%",
    numericValue: food,
    unit: "%",
    stateAvg: 13.0,
    direction: "lower-is-better",
    implication: food > 16 ? "Higher food insecurity; residents may benefit from SNAP or food bank services." : food < 10 ? "Lower food insecurity than state average." : "Near state average for food access.",
    source: "USDA Food Environment Atlas",
    sourceUrl: "https://www.ers.usda.gov/data-products/food-environment-atlas/",
    updated: "2024",
    grain,
  });

  // Energy burden (estimated from county type)
  const energyBurden = p.countyType === "rural" ? 4.2 : p.countyType === "suburban" ? 3.3 : 3.8;
  indicators.push({
    id: "energy-burden",
    domain: "energy",
    label: "Energy Burden",
    value: `~${energyBurden}%`,
    numericValue: energyBurden,
    unit: "% of income",
    stateAvg: 3.5,
    direction: "lower-is-better",
    implication: energyBurden > 4 ? "Higher energy costs relative to income; LIHEAP may help." : "Energy costs are near or below state average.",
    source: "DOE LEAD Tool (Estimated)",
    sourceUrl: "https://www.energy.gov/scep/slsc/lead-tool",
    updated: "2024",
    grain: `Estimated from ${p.countyType} classification`,
  });

  // Transportation access proxy
  const hasTransit = p.countyType === "urban" || p.countyType === "suburban";
  indicators.push({
    id: "transit-access",
    domain: "transportation",
    label: "Public Transit Access",
    value: hasTransit ? "Available" : "Limited",
    numericValue: hasTransit ? 1 : 0,
    unit: "",
    stateAvg: 0.5,
    direction: "higher-is-better",
    implication: !hasTransit ? "Limited public transit; transportation may be a barrier to care." : "Public transit options available in this area.",
    source: "MDOT / Local Transit Agencies",
    sourceUrl: "https://www.michigan.gov/mdot",
    updated: "2025",
    grain: "County",
  });

  // Broadband proxy
  const broadband = p.countyType === "rural" ? 72 : p.countyType === "suburban" ? 89 : 93;
  indicators.push({
    id: "broadband",
    domain: "education",
    label: "Broadband Access",
    value: `~${broadband}%`,
    numericValue: broadband,
    unit: "%",
    stateAvg: 87,
    direction: "higher-is-better",
    implication: broadband < 80 ? "Lower broadband access may limit telehealth and online services." : "Broadband access is near or above state average.",
    source: "FCC Broadband Data (Estimated)",
    sourceUrl: "https://broadbandmap.fcc.gov/",
    updated: "2024",
    grain: `Estimated from ${p.countyType} classification`,
  });

  return indicators;
}

// ── "What Stands Out" Generator ──
export function buildStandouts(indicators: PlaceIndicator[]): { label: string; delta: string; direction: "better" | "worse" | "neutral" }[] {
  const standouts: { label: string; delta: string; direction: "better" | "worse" | "neutral"; absDelta: number }[] = [];

  for (const ind of indicators) {
    if (ind.numericValue === 0 || ind.stateAvg === 0) continue;
    if (ind.unit === "") continue; // skip non-numeric

    const diff = ind.numericValue - ind.stateAvg;
    const pct = Math.abs(diff / ind.stateAvg * 100);
    if (pct < 10) continue; // not notable

    const isBetter = ind.direction === "lower-is-better" ? diff < 0 : diff > 0;

    standouts.push({
      label: ind.label,
      delta: ind.direction === "lower-is-better"
        ? `${diff > 0 ? "+" : ""}${diff.toFixed(1)}${ind.unit} vs state avg`
        : `${diff > 0 ? "+" : ""}${diff.toFixed(1)}${ind.unit} vs state avg`,
      direction: isBetter ? "better" : "worse",
      absDelta: pct,
    });
  }

  return standouts.sort((a, b) => b.absDelta - a.absDelta).slice(0, 3);
}

// ── Breadcrumb Builder ──
export function buildPlaceBreadcrumbs(place: Place): { label: string; href?: string }[] {
  const crumbs: { label: string; href?: string }[] = [{ label: "Regions", href: "/regions" }];

  if (place.region) {
    crumbs.push({ label: place.region.name, href: `/region/${place.region.id}` });
  }

  if (place.placeType === "city" || place.placeType === "zip") {
    if (place.parentCounty) {
      crumbs.push({
        label: `${place.parentCounty} County`,
        href: `/place/${countyToSlug(place.parentCounty)}-county`,
      });
    }
  }

  crumbs.push({ label: place.name });
  return crumbs;
}
