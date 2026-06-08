/**
 * Mobility Access Insight Cards
 *
 * Real-data cards for the mobility pillar:
 * 1. Transit coverage (DDOT routes)
 * 2. MDOT work zones
 * 3. EV charging access
 *
 * Uses ArcGIS proxy for real data. No mock data.
 */

import { useMemo } from "react";
import { Bus, Construction, Zap } from "lucide-react";
import PillarInsightCard from "./PillarInsightCard";
import { usePillarData } from "@/hooks/usePillarData";
import { resolveGeoDimension } from "@/models/GeoDimension";

interface MobilityAccessCardsProps {
  countyName: string;
}

export default function MobilityAccessCards({ countyName }: MobilityAccessCardsProps) {
  const geo = resolveGeoDimension({ countyName });

  const { data: workzoneData, status: workzoneStatus } = usePillarData("mobility-mdot-workzones");
  const { data: evData, status: evStatus } = usePillarData("mobility-ev-stations");
  const { data: ddotData, status: ddotStatus } = usePillarData("mobility-ddot-routes");

  // Filter work zones by county
  const workzonesInCounty = useMemo(() => {
    if (!workzoneData?.length) return [];
    return workzoneData.filter((row) => {
      const county = String(row.County ?? row.county ?? row.COUNTY ?? "");
      return county.toLowerCase().includes(countyName.toLowerCase());
    });
  }, [workzoneData, countyName]);

  // Filter EV stations by city/county
  const evInCounty = useMemo(() => {
    if (!evData?.length) return [];
    return evData.filter((row) => {
      const city = String(row.City ?? row.city ?? "");
      // Simple match - EV data has City field, not County
      // For Wayne County, match Detroit; for Kent, match Grand Rapids, etc.
      return city.toLowerCase().includes(countyName.toLowerCase());
    });
  }, [evData, countyName]);

  // DDOT is Wayne County only
  const isWayne = countyName.toLowerCase() === "wayne";

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* MDOT Work Zones */}
      <PillarInsightCard
        title="Active Road Work Zones"
        pattern="count-summary"
        geography={geo}
        value={workzoneStatus === "live" ? workzonesInCounty.length : null}
        unit="active zones"
        icon={Construction}
        source="Michigan DOT"
        status={workzoneStatus}
        description={
          workzoneStatus === "live"
            ? workzonesInCounty.length > 0
              ? `${workzonesInCounty.length} active MDOT work zone${workzonesInCounty.length !== 1 ? "s" : ""} in ${countyName} County.`
              : `No active MDOT work zones currently reported in ${countyName} County.`
            : undefined
        }
      />

      {/* EV Charging */}
      <PillarInsightCard
        title="EV Charging Stations"
        pattern="count-summary"
        geography={geo}
        value={evStatus === "live" ? evInCounty.length : null}
        unit="stations"
        icon={Zap}
        source="DOE Alternative Fuels Data Center"
        status={evStatus}
        description={
          evStatus === "live"
            ? evInCounty.length > 0
              ? `${evInCounty.length} electric vehicle charging station${evInCounty.length !== 1 ? "s" : ""} found near ${countyName} County.`
              : `No EV charging stations matched for ${countyName} County. Stations may exist in nearby areas.`
            : undefined
        }
      />

      {/* Transit Routes */}
      <PillarInsightCard
        title="Public Transit Routes"
        pattern="count-summary"
        geography={geo}
        value={
          isWayne && ddotStatus === "live"
            ? ddotData.length
            : isWayne
            ? null
            : null
        }
        unit="routes"
        icon={Bus}
        source={isWayne ? "DDOT (Detroit)" : "Regional transit data"}
        status={
          isWayne
            ? ddotStatus
            : "empty"
        }
        description={
          isWayne
            ? ddotStatus === "live"
              ? `${ddotData.length} DDOT bus routes serving the Detroit metro area.`
              : undefined
            : `No transit route data currently available for ${countyName} County. Transit coverage data is available for Wayne County (DDOT).`
        }
      />
    </div>
  );
}
