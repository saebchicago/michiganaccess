/**
 * Economic Stress Insight Cards
 *
 * Real-data cards for the economic pillar:
 * 1. ACS poverty & unemployment via county profiles
 * 2. Detroit blight data (for Wayne County)
 * 3. Financial assistance programs
 *
 * Uses Supabase tables + Socrata. No mock data.
 */

import { useMemo } from "react";
import { DollarSign, Home, Briefcase, HelpCircle } from "lucide-react";
import PillarInsightCard from "./PillarInsightCard";
import { usePillarData } from "@/hooks/usePillarData";
import { resolveGeoDimension } from "@/models/GeoDimension";
import { COUNTY_PROFILES } from "@/data/michigan-county-profiles";
import { MI_STATE_BENCHMARKS } from "@/data/state-benchmarks";

interface EconomicStressCardsProps {
  countyName: string;
}

export default function EconomicStressCards({
  countyName,
}: EconomicStressCardsProps) {
  const geo = resolveGeoDimension({ countyName });
  const profile = COUNTY_PROFILES[countyName];

  // Detroit blight data (for Wayne County)
  const isWayne = countyName.toLowerCase() === "wayne";
  const { data: blightData, status: blightStatus } = usePillarData(
    "econ-det-blight",
    undefined,
    isWayne,
  );

  // Financial programs
  const { data: programsData, status: programsStatus } = usePillarData(
    "econ-financial-programs",
  );

  const programCount = programsData?.length ?? 0;

  // Extract uninsured as economic stress proxy
  const uninsured =
    profile?.healthHighlights.find((h) => h.label === "Uninsured rate")
      ?.value ?? null;
  const foodInsecurity =
    profile?.healthHighlights.find((h) => h.label === "Food insecurity")
      ?.value ?? null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Population & County Type */}
      <PillarInsightCard
        title="Population & Classification"
        pattern="count-summary"
        geography={geo}
        value={profile?.population ?? null}
        unit="residents"
        icon={Briefcase}
        source="U.S. Census Bureau Population Estimates Program, Vintage 2024"
        status={profile ? "live" : "empty"}
        description={
          profile
            ? `${countyName} County is classified as ${profile.countyType} with ${profile.population.toLocaleString()} residents.`
            : undefined
        }
      />

      {/* Food Insecurity as economic stress */}
      <PillarInsightCard
        title="Food Insecurity Rate"
        pattern="comparison"
        geography={geo}
        value={foodInsecurity}
        compareValue={`${MI_STATE_BENCHMARKS.foodInsecurityRate}%`}
        compareLabel="State average"
        icon={DollarSign}
        source="USDA Food Environment Atlas 2024"
        status={foodInsecurity ? "live" : "empty"}
        description="Food insecurity rate as a proxy for economic stress."
      />

      {/* Detroit Blight (Wayne only) */}
      {isWayne ? (
        <PillarInsightCard
          title="Blight Violations (Detroit)"
          pattern="count-summary"
          geography={geo}
          value={blightStatus === "live" ? blightData.length : null}
          unit="recent violations"
          icon={Home}
          source="City of Detroit Open Data"
          status={blightStatus}
          description={
            blightStatus === "live"
              ? `${blightData.length} blight violation records from the City of Detroit indicating housing stress.`
              : undefined
          }
        />
      ) : (
        <PillarInsightCard
          title="Housing Stress Indicators"
          pattern="count-summary"
          geography={geo}
          value={null}
          icon={Home}
          source="Local open data"
          status="empty"
          description={`Detailed housing stress data (blight, demolitions) is currently available for Detroit/Wayne County only. Statewide housing indicators pending.`}
        />
      )}

      {/* Financial Assistance Programs */}
      <PillarInsightCard
        title="Financial Assistance Programs"
        pattern="count-summary"
        geography={geo}
        value={programsStatus === "live" ? programCount : null}
        unit="programs available"
        icon={HelpCircle}
        source="Michigan MDHHS & partner agencies"
        status={programsStatus}
        description={
          programsStatus === "live"
            ? `${programCount} financial assistance programs available to Michigan residents.`
            : undefined
        }
      />

      {/* Need vs Capacity: uninsured rate vs financial programs */}
      <PillarInsightCard
        title="Insurance Gap vs Support"
        pattern="need-vs-capacity"
        geography={geo}
        value={uninsured ? parseFloat(uninsured) : null}
        compareValue={programsStatus === "live" ? programCount : null}
        unit="%"
        icon={DollarSign}
        source="County Health Rankings + Access Michigan database"
        status={uninsured && programsStatus === "live" ? "live" : "empty"}
        description="Comparing uninsured rate (need) against available financial assistance programs (capacity)."
      />
    </div>
  );
}
