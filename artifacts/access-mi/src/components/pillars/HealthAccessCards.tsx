/**
 * Health Access Insight Cards
 *
 * Real-data cards for the health pillar:
 * 1. Care availability per population
 * 2. Proximity to care (approximate)
 * 3. Need vs capacity
 * 4. Comparison view
 *
 * All data from Supabase facilities/resources tables + county profiles.
 * No mock data - shows "data not available" when missing.
 */

import { useMemo, useState } from "react";
import {
  Heart,
  Building2,
  Stethoscope,
  MapPin,
  Activity,
  Users,
} from "lucide-react";
import PillarInsightCard from "./PillarInsightCard";
import { useFacilities, type Facility } from "@/hooks/useFacilities";
import {
  resolveGeoDimension,
  ratePer,
  percentileRank,
} from "@/models/GeoDimension";
import { COUNTY_PROFILES } from "@/data/michigan-county-profiles";
import { FacilityCountDisclosure } from "@/components/shared/FacilityCountDisclosure";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MI_STATE_BENCHMARKS } from "@/data/state-benchmarks";

interface HealthAccessCardsProps {
  countyName: string;
  /** Optional second county for comparison */
  compareCounty?: string;
}

function useCountyFacilityDensity(countyName: string | undefined) {
  const { data: facilities } = useFacilities(undefined, countyName ?? null);
  const geo = countyName ? resolveGeoDimension({ countyName }) : null;
  const profile = countyName ? COUNTY_PROFILES[countyName] : undefined;

  return useMemo(() => {
    if (!facilities || !geo || !profile) return null;

    const hospitals = facilities.filter((f) => f.facility_type === "hospital");
    const clinics = facilities.filter((f) =>
      ["clinic", "fqhc", "urgent_care", "community_health_center"].includes(
        f.facility_type,
      ),
    );
    const sud = facilities.filter(
      (f) =>
        f.specialties?.some((s) => s.toLowerCase().includes("substance")) ||
        f.facility_type === "behavioral_health",
    );

    return {
      totalFacilities: facilities.length,
      hospitals: hospitals.length,
      clinics: clinics.length,
      sudFacilities: sud.length,
      population: profile.population,
      facilitiesPerCapita: ratePer(facilities.length, profile.population),
      hospitalsPerCapita: ratePer(hospitals.length, profile.population),
      uninsuredRate:
        profile.healthHighlights.find((h) => h.label === "Uninsured rate")
          ?.value ?? null,
      pcpRatio:
        profile.healthHighlights.find((h) => h.label === "Primary care ratio")
          ?.value ?? null,
      foodInsecurity:
        profile.healthHighlights.find((h) => h.label === "Food insecurity")
          ?.value ?? null,
      facilities,
    };
  }, [facilities, geo, profile]);
}

const FACILITY_TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "hospital", label: "Hospital" },
  { value: "fqhc", label: "Community Health Center (FQHC)" },
  { value: "urgent_care", label: "Urgent Care" },
  { value: "behavioral_health", label: "Behavioral Health" },
  { value: "specialty", label: "Specialty" },
] as const;

export default function HealthAccessCards({
  countyName,
  compareCounty,
}: HealthAccessCardsProps) {
  const primary = useCountyFacilityDensity(countyName);
  const compare = useCountyFacilityDensity(compareCounty);
  const [facilityTypeFilter, setFacilityTypeFilter] = useState<string>("all");

  const geo = resolveGeoDimension({ countyName });

  // Compute statewide facility density distribution for percentile
  const allDensities = useMemo(() => {
    return Object.entries(COUNTY_PROFILES).map(([, p]) => p.population);
  }, []);

  const filteredFacilities = useMemo(() => {
    if (!primary?.facilities) return null;
    if (facilityTypeFilter === "all") return primary.facilities;
    return primary.facilities.filter(
      (f) => f.facility_type === facilityTypeFilter,
    );
  }, [primary?.facilities, facilityTypeFilter]);

  const filteredCount = filteredFacilities?.length ?? null;

  return (
    <div className="space-y-4">
      {/* Facility type filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          Filter by type:
        </span>
        <Select
          value={facilityTypeFilter}
          onValueChange={setFacilityTypeFilter}
        >
          <SelectTrigger className="h-8 w-52 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FACILITY_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {facilityTypeFilter !== "all" && filteredCount !== null && (
          <span className="text-xs text-muted-foreground">
            {filteredCount} {filteredCount === 1 ? "facility" : "facilities"}{" "}
            shown
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Care Availability — facility counts withheld until verified
          against an MDHHS/LARA reference extract. Per PAUSE 2 we ship
          the metric tile without the descriptive sentence so a thin
          live count (audit found Saginaw=1) cannot mislead a reader. */}
        <PillarInsightCard
          title="Care Availability"
          pattern="rate-per-population"
          geography={geo}
          value={primary?.totalFacilities ?? null}
          unit="facilities per 10,000"
          perPopulation={10000}
          icon={Building2}
          source="State licensing data via Access Michigan database"
          status={primary ? "live" : "empty"}
          description="Facility data under verification."
        />

        {/* Hospitals per capita */}
        <PillarInsightCard
          title="Hospital Access"
          pattern="rate-per-population"
          geography={geo}
          value={primary?.hospitals ?? null}
          unit="hospitals per 10,000"
          perPopulation={10000}
          icon={Heart}
          source="Licensed facilities database"
          status={primary ? "live" : "empty"}
          description={
            primary
              ? `${primary.hospitals} hospital${primary.hospitals !== 1 ? "s" : ""} in ${countyName} County.`
              : undefined
          }
        />

        {/* Uninsured Rate */}
        <PillarInsightCard
          title="Uninsured Rate"
          pattern="comparison"
          geography={geo}
          value={primary?.uninsuredRate ?? null}
          compareValue="5%"
          compareLabel="State average"
          icon={Users}
          source="County Health Rankings & Roadmaps, 2025 edition"
          status={primary?.uninsuredRate ? "live" : "empty"}
          description="Percentage of residents without health insurance coverage."
        />

        {/* Primary Care Ratio */}
        <PillarInsightCard
          title="Primary Care Ratio"
          pattern="comparison"
          geography={geo}
          value={primary?.pcpRatio ?? null}
          compareValue="1,240:1"
          compareLabel="State average"
          icon={Stethoscope}
          source="County Health Rankings & Roadmaps, 2025 edition"
          status={primary?.pcpRatio ? "live" : "empty"}
          description="Population-to-primary care physician ratio. Lower ratios indicate better provider access (more doctors per patient)."
        />

        {/* SUD/Behavioral Health */}
        <PillarInsightCard
          title="SUD & Behavioral Health"
          pattern="count-summary"
          geography={geo}
          value={primary?.sudFacilities ?? null}
          unit="facilities"
          icon={Activity}
          source="Community resources database"
          status={primary ? "live" : "empty"}
          description={
            primary
              ? primary.sudFacilities > 0
                ? `${primary.sudFacilities} substance use disorder and behavioral health facilities in ${countyName} County.`
                : `No dedicated SUD facilities found in ${countyName} County database.`
              : undefined
          }
        />

        {/* Food Insecurity */}
        <PillarInsightCard
          title="Food Insecurity"
          pattern="comparison"
          geography={geo}
          value={primary?.foodInsecurity ?? null}
          compareValue={`${MI_STATE_BENCHMARKS.foodInsecurityRate}%`}
          compareLabel="State average"
          icon={MapPin}
          source="USDA Food Environment Atlas / County Health Rankings & Roadmaps, 2025 edition"
          status={primary?.foodInsecurity ? "live" : "empty"}
          description="Percentage of population experiencing food insecurity."
        />

        {/* Comparison card (if compare county provided) */}
        {compareCounty && (
          <PillarInsightCard
            title={`${countyName} vs ${compareCounty}`}
            pattern="comparison"
            geography={geo}
            value={primary?.facilitiesPerCapita ?? null}
            compareValue={compare?.facilitiesPerCapita ?? null}
            compareLabel={`${compareCounty} County`}
            unit="facilities per 10,000"
            icon={Building2}
            source="Access Michigan database"
            status={primary && compare ? "live" : "empty"}
            description={
              primary && compare
                ? `Comparing facility density between ${countyName} and ${compareCounty} counties.`
                : `Data not available for one or both counties.`
            }
          />
        )}
      </div>

      {/* Disclosure about data completeness */}
      <FacilityCountDisclosure county={countyName} />
    </div>
  );
}
