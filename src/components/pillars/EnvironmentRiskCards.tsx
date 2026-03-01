/**
 * Environment Risk Insight Cards
 *
 * Real-data cards for the environment pillar:
 * 1. PFAS proximity/exposure
 * 2. Air quality monitoring
 *
 * Uses ArcGIS proxy for EGLE data. No mock data.
 */

import { useMemo } from "react";
import { Droplets, Wind, AlertTriangle } from "lucide-react";
import PillarInsightCard from "./PillarInsightCard";
import { usePillarData } from "@/hooks/usePillarData";
import { resolveGeoDimension } from "@/models/GeoDimension";

interface EnvironmentRiskCardsProps {
  countyName: string;
}

export default function EnvironmentRiskCards({ countyName }: EnvironmentRiskCardsProps) {
  const geo = resolveGeoDimension({ countyName });

  // PFAS sites data
  const { data: pfasData, status: pfasStatus } = usePillarData("env-pfas-sites");

  // Air quality data
  const { data: airData, status: airStatus } = usePillarData("env-air-quality");

  // Filter PFAS sites by county
  const pfasInCounty = useMemo(() => {
    if (!pfasData?.length) return [];
    return pfasData.filter((row) => {
      const county = String(row.County ?? row.county ?? row.COUNTY ?? "");
      return county.toLowerCase().includes(countyName.toLowerCase());
    });
  }, [pfasData, countyName]);

  // Filter air stations by proximity (simple county matching from properties)
  const airInCounty = useMemo(() => {
    if (!airData?.length) return [];
    return airData.filter((row) => {
      const addr = String(row.StationAddress ?? row.station_address ?? row.SiteName ?? "");
      return addr.toLowerCase().includes(countyName.toLowerCase());
    });
  }, [airData, countyName]);

  // EJScreen is pending
  const ejStatus = "pending" as const;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* PFAS Sites */}
      <PillarInsightCard
        title="PFAS Investigation Sites"
        pattern="count-summary"
        geography={geo}
        value={pfasStatus === "live" ? pfasInCounty.length : null}
        unit="sites in county"
        icon={Droplets}
        source="Michigan EGLE PFAS Response"
        status={pfasStatus === "live" ? (pfasInCounty.length > 0 ? "live" : "live") : pfasStatus}
        description={
          pfasStatus === "live"
            ? pfasInCounty.length > 0
              ? `${pfasInCounty.length} PFAS investigation site${pfasInCounty.length !== 1 ? "s" : ""} identified in ${countyName} County by EGLE.`
              : `No PFAS investigation sites currently identified in ${countyName} County.`
            : undefined
        }
      />

      {/* Air Quality Monitors */}
      <PillarInsightCard
        title="Air Quality Monitors"
        pattern="count-summary"
        geography={geo}
        value={airStatus === "live" ? airInCounty.length : null}
        unit="stations"
        icon={Wind}
        source="EGLE Air Quality Division"
        status={airStatus === "live" ? "live" : airStatus}
        description={
          airStatus === "live"
            ? airInCounty.length > 0
              ? `${airInCounty.length} EPA-registered air quality monitoring station${airInCounty.length !== 1 ? "s" : ""} in ${countyName} County.`
              : `No air quality monitoring stations found in ${countyName} County. Nearest regional data may apply.`
            : undefined
        }
      />

      {/* EJ Index — Pending */}
      <PillarInsightCard
        title="EPA EJScreen Index"
        pattern="percentile"
        geography={geo}
        value={null}
        icon={AlertTriangle}
        source="EPA EJScreen"
        status={ejStatus}
        description="EPA Environmental Justice screening index by census tract. Integration pending."
      />
    </div>
  );
}
