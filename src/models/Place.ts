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
  domain: "health" | "housing" | "energy" | "environment" | "transportation" | "safety" | "education" | "food" | "workforce" | "benefits";
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

// ── State Averages (curated from CHR 2025, ACS, USDA, BLS, FBI UCR) ──
// CHR 2025: https://www.countyhealthrankings.org/health-data/michigan
// Feeding America 2024: https://map.feedingamerica.org/county/2022/overall/michigan
export const STATE_AVERAGES: Record<string, { value: number; label: string; unit: string }> = {
  uninsured: { value: 5, label: "Uninsured Rate", unit: "%" },
  pcRatio: { value: 1240, label: "Primary Care Ratio", unit: ":1" },
  foodInsecurity: { value: 13.3, label: "Food Insecurity", unit: "%" },
  energyBurden: { value: 3.5, label: "Energy Burden", unit: "%" },
  violentCrime: { value: 450, label: "Violent Crime Rate", unit: "per 100k" },
  graduationRate: { value: 82, label: "HS Graduation Rate", unit: "%" },
  broadband: { value: 87, label: "Broadband Access", unit: "%" },
  drinkingWater: { value: 92, label: "Clean Drinking Water", unit: "% compliant" },
  medianIncome: { value: 63498, label: "Median Household Income", unit: "$" },
  povertyRate: { value: 13.8, label: "Poverty Rate", unit: "%" },
  rentBurden: { value: 47.2, label: "Rent Burden", unit: "%" },
  vehicleAccess: { value: 92.1, label: "Vehicle Access", unit: "%" },
  commuteTime: { value: 24.8, label: "Avg Commute", unit: "min" },
  unemploymentRate: { value: 4.2, label: "Unemployment Rate", unit: "%" },
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
    
    // Township alias resolution: e.g. "west-bloomfield-township" → Oakland County
    const TOWNSHIP_ALIASES: Record<string, { county: string; label: string }> = {
      "west-bloomfield-township": { county: "Oakland", label: "West Bloomfield Township" },
      "west-bloomfield-twp": { county: "Oakland", label: "West Bloomfield Township" },
      "clinton-township": { county: "Macomb", label: "Clinton Township" },
      "clinton-twp": { county: "Macomb", label: "Clinton Township" },
      "shelby-township": { county: "Macomb", label: "Shelby Township" },
      "shelby-twp": { county: "Macomb", label: "Shelby Township" },
      "meridian-township": { county: "Ingham", label: "Meridian Township" },
      "meridian-twp": { county: "Ingham", label: "Meridian Township" },
      "oshtemo-township": { county: "Kalamazoo", label: "Oshtemo Township" },
      "oshtemo-twp": { county: "Kalamazoo", label: "Oshtemo Township" },
    };

    const townshipMatch = TOWNSHIP_ALIASES[params.slug] || TOWNSHIP_ALIASES[normalized];
    if (townshipMatch) {
      const profile = COUNTY_PROFILES[townshipMatch.county];
      const region = getRegionForCounty(townshipMatch.county) || undefined;
      return {
        placeType: "county",
        slug: `${countyToSlug(townshipMatch.county)}-county`,
        name: `${townshipMatch.county} County`,
        parentCounty: townshipMatch.county,
        region,
        geoGrainLabel: "County",
        fallbackChain: ["region", "state"],
        confidence: "high",
        countyProfile: profile,
        isFallback: true,
        fallbackLabel: `Showing ${townshipMatch.county} County data — ${townshipMatch.label} is part of ${townshipMatch.county} County`,
      };
    }

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

// ── Indicator Builder (original, kept for backward compat) ──
export function buildPlaceIndicators(place: Place): PlaceIndicator[] {
  return buildFullIndicators(place);
}

// ── Full Cross-Domain Indicator Builder ──
import { getCountyCrossDomain, MI_STATE_AVERAGES } from "@/data/cross-domain-indicators";

export function buildFullIndicators(place: Place): PlaceIndicator[] {
  const p = place.countyProfile;
  const hh = p.healthHighlights;
  const grain = place.isFallback ? place.fallbackLabel || "County Average" : place.geoGrainLabel;
  const countyName = place.parentCounty || place.name.replace(/ County$/, "");
  const cd = getCountyCrossDomain(countyName);
  const indicators: PlaceIndicator[] = [];

  // ── Health Domain ──
  const uninsured = parseRate(hh[0]?.value || "5%");
  indicators.push({
    id: "uninsured", domain: "health", label: "Uninsured Rate",
    value: hh[0]?.value || "~5%", numericValue: uninsured, unit: "%",
    stateAvg: 5, direction: "lower-is-better",
    implication: uninsured > 8 ? "Suggests limited insurance access; residents may delay care." : uninsured < 5 ? "Strong insurance coverage; most residents have access to care." : "Near state average for insurance coverage.",
    source: "County Health Rankings", sourceUrl: "https://www.countyhealthrankings.org/", updated: "2025", grain,
  });

  const pcRatio = parseRatio(hh[1]?.value || "1,240:1");
  indicators.push({
    id: "pc-ratio", domain: "health", label: "Primary Care Ratio",
    value: hh[1]?.value || "1,240:1", numericValue: pcRatio, unit: ":1",
    stateAvg: 1240, direction: "lower-is-better",
    implication: pcRatio > 3000 ? "Significant provider shortage; may indicate long wait times." : pcRatio < 1000 ? "Strong primary care access relative to population." : "Moderate primary care access.",
    source: "HRSA Area Health Resources", sourceUrl: "https://data.hrsa.gov/", updated: "2025", grain,
  });

  // ── Food Domain ──
  const food = parseRate(hh[2]?.value || "13.3%");
  indicators.push({
    id: "food-insecurity", domain: "food", label: "Food Insecurity",
    value: hh[2]?.value || "~13.3%", numericValue: food, unit: "%",
    stateAvg: 13.3, direction: "lower-is-better",
    implication: food > 16 ? "Higher food insecurity; residents may benefit from SNAP or food bank services." : food < 10 ? "Lower food insecurity than state average." : "Near state average for food access.",
    source: "USDA Food Environment Atlas", sourceUrl: "https://www.ers.usda.gov/data-products/food-environment-atlas/", updated: "2024", grain,
  });

  // ── Housing Domain ──
  if (cd.povertyRate !== null) {
    indicators.push({
      id: "poverty-rate", domain: "housing", label: "Poverty Rate",
      value: `${cd.povertyRate}%`, numericValue: cd.povertyRate, unit: "%",
      stateAvg: MI_STATE_AVERAGES.povertyRate!, direction: "lower-is-better",
      implication: cd.povertyRate > 18 ? "Higher poverty rate; residents may face economic barriers to housing and services." : cd.povertyRate < 10 ? "Lower poverty rate than state average." : "Near state average for poverty.",
      source: "ACS 5-Year Estimates", sourceUrl: "https://data.census.gov/", updated: "2022", grain: "County",
    });
  }
  if (cd.rentBurden !== null) {
    indicators.push({
      id: "rent-burden", domain: "housing", label: "Rent Burden",
      value: `${cd.rentBurden}%`, numericValue: cd.rentBurden, unit: "%",
      stateAvg: MI_STATE_AVERAGES.rentBurden!, direction: "lower-is-better",
      implication: cd.rentBurden > 50 ? "Over half of renters pay more than 30% of income on housing." : "Rent burden is near or below state average.",
      source: "ACS 5-Year Estimates", sourceUrl: "https://data.census.gov/", updated: "2022", grain: "County",
    });
  }

  // ── Workforce Domain ──
  if (cd.medianIncome !== null) {
    indicators.push({
      id: "median-income", domain: "workforce", label: "Median Household Income",
      value: `$${cd.medianIncome.toLocaleString()}`, numericValue: cd.medianIncome, unit: "$",
      stateAvg: MI_STATE_AVERAGES.medianIncome!, direction: "higher-is-better",
      implication: cd.medianIncome < 45000 ? "Below state average; residents may qualify for income-based assistance." : cd.medianIncome > 70000 ? "Above state average for household income." : "Near state median household income.",
      source: "ACS 5-Year Estimates", sourceUrl: "https://data.census.gov/", updated: "2022", grain: "County",
    });
  }
  if (cd.unemploymentRate !== null) {
    indicators.push({
      id: "unemployment", domain: "workforce", label: "Unemployment Rate",
      value: `${cd.unemploymentRate}%`, numericValue: cd.unemploymentRate, unit: "%",
      stateAvg: MI_STATE_AVERAGES.unemploymentRate!, direction: "lower-is-better",
      implication: cd.unemploymentRate > 6 ? "Higher unemployment; MI Works and training programs may help." : cd.unemploymentRate < 3.5 ? "Low unemployment relative to state average." : "Near state average for unemployment.",
      source: "BLS Local Area Unemployment Statistics", sourceUrl: "https://www.bls.gov/lau/", updated: "2024", grain: "County",
    });
  }

  // ── Energy Domain ──
  const energyBurden = p.countyType === "rural" ? 4.2 : p.countyType === "suburban" ? 3.3 : 3.8;
  indicators.push({
    id: "energy-burden", domain: "energy", label: "Energy Burden",
    value: `~${energyBurden}%`, numericValue: energyBurden, unit: "% of income",
    stateAvg: 3.5, direction: "lower-is-better",
    implication: energyBurden > 4 ? "Higher energy costs relative to income; LIHEAP may help." : energyBurden > 3.5 ? "Energy costs are slightly above the state average of 3.5%." : "Energy costs are at or below the state average.",
    source: "DOE LEAD Tool (Estimated)", sourceUrl: "https://www.energy.gov/scep/slsc/lead-tool", updated: "2024",
    grain: `Estimated from ${p.countyType} classification`,
  });

  // ── Transportation Domain ──
  if (cd.vehicleAccess !== null) {
    indicators.push({
      id: "vehicle-access", domain: "transportation", label: "Vehicle Access",
      value: `${cd.vehicleAccess}%`, numericValue: cd.vehicleAccess, unit: "%",
      stateAvg: MI_STATE_AVERAGES.vehicleAccess!, direction: "higher-is-better",
      implication: cd.vehicleAccess < 90 ? "Lower vehicle access; transportation may be a barrier to services." : "Most households have vehicle access.",
      source: "ACS 5-Year Estimates", sourceUrl: "https://data.census.gov/", updated: "2022", grain: "County",
    });
  }

  // ── Education Domain ──
  if (cd.hsGradRate !== null) {
    indicators.push({
      id: "hs-grad-rate", domain: "education", label: "HS Graduation Rate",
      value: `${cd.hsGradRate}%`, numericValue: cd.hsGradRate, unit: "%",
      stateAvg: MI_STATE_AVERAGES.hsGradRate ?? 82, direction: "higher-is-better",
      implication: cd.hsGradRate < 78 ? "Below state average; education access programs may help." : cd.hsGradRate > 88 ? "Above state average graduation rate." : "Near state average for high school graduation.",
      source: "MI Dept of Education / NCES", sourceUrl: "https://www.mischooldata.org/", updated: "2023", grain: "County",
    });
  }

  // ── Safety Domain ──
  if (cd.violentCrimeRate !== null) {
    indicators.push({
      id: "violent-crime", domain: "safety", label: "Violent Crime Rate",
      value: `${cd.violentCrimeRate} per 100k`, numericValue: cd.violentCrimeRate, unit: "per 100k",
      stateAvg: MI_STATE_AVERAGES.violentCrimeRate ?? 450, direction: "lower-is-better",
      implication: cd.violentCrimeRate > 600 ? "Above state average; safety resources and community programs may be relevant." : cd.violentCrimeRate < 200 ? "Below state average for violent crime." : "Near state average for violent crime rate.",
      source: "FBI UCR / MI State Police", sourceUrl: "https://www.michigan.gov/msp", updated: "2022", grain: "County",
    });
  }

  // ── Environment Domain ──
  if (cd.drinkingWaterCompliance !== null) {
    indicators.push({
      id: "water-compliance", domain: "environment", label: "Drinking Water Compliance",
      value: `${cd.drinkingWaterCompliance}%`, numericValue: cd.drinkingWaterCompliance, unit: "%",
      stateAvg: MI_STATE_AVERAGES.drinkingWaterCompliance ?? 92, direction: "higher-is-better",
      implication: cd.drinkingWaterCompliance < 88 ? "Below state average for water compliance; check local water quality reports." : "Meets or exceeds state compliance standards.",
      source: "EPA SDWIS (Proxy)", sourceUrl: "https://www.epa.gov/enviro/sdwis-search", updated: "2024", grain: "County (Estimated)",
    });
  }

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
