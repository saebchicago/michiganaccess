import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProvenanceTag } from "@/components/shared/ProvenanceTag";
import {
  HRSA_HPSA_COUNTY_RECORDS,
  getHpsaForCountyName,
  type HpsaDisciplineId,
  type HpsaDisciplineMetrics,
} from "@/data/hrsa-hpsa-county";

const DISCIPLINE_LABELS: Record<HpsaDisciplineId, string> = {
  primaryCare: "Primary Care",
  dental: "Dental Health",
  mental: "Mental Health",
};

const DISCIPLINE_ORDER: HpsaDisciplineId[] = ["primaryCare", "dental", "mental"];

function aggregateStatewide(disciplineId: HpsaDisciplineId): HpsaDisciplineMetrics {
  return HRSA_HPSA_COUNTY_RECORDS.reduce<HpsaDisciplineMetrics>(
    (acc, county) => {
      const d = county.disciplines[disciplineId];
      return {
        designatedHpsas: acc.designatedHpsas + d.designatedHpsas,
        maxHpsaScore: null,
        designationPopulation: acc.designationPopulation + d.designationPopulation,
        estimatedUnderservedPopulation:
          acc.estimatedUnderservedPopulation + d.estimatedUnderservedPopulation,
        providerFte: acc.providerFte + d.providerFte,
        shortageFte: acc.shortageFte + d.shortageFte,
      };
    },
    {
      designatedHpsas: 0,
      maxHpsaScore: null,
      designationPopulation: 0,
      estimatedUnderservedPopulation: 0,
      providerFte: 0,
      shortageFte: 0,
    },
  );
}

interface NeedCapacityCardProps {
  /** County name to scope to. Pass null/omit for a statewide rollup. */
  county?: string | null;
  className?: string;
}

/**
 * Shows the gap between designated provider need (HRSA HPSA shortage FTE)
 * and the provider capacity already in place, per discipline. Powered by
 * the already-ingested src/data/hrsa-hpsa-county dataset - no new fetch,
 * no modeled-from-scratch numbers.
 */
export function NeedCapacityCard({ county, className }: NeedCapacityCardProps) {
  const record = county ? getHpsaForCountyName(county) : null;
  const countyNotFound = Boolean(county) && !record;
  const scopeLabel = county ? `${county} County` : "Michigan statewide";

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">Care Capacity vs. Need</CardTitle>
          <ProvenanceTag
            label="MODELED"
            source="HRSA HPSA facility detail files"
            vintage="Jun 2026"
          />
        </div>
        <p className="text-xs text-muted-foreground">{scopeLabel}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {countyNotFound && (
          <p className="text-sm text-muted-foreground">
            No HPSA data on file for this county.
          </p>
        )}
        {!countyNotFound &&
          DISCIPLINE_ORDER.map((disciplineId) => {
          const metrics = county
            ? (record?.disciplines[disciplineId] ?? null)
            : aggregateStatewide(disciplineId);
          const label = DISCIPLINE_LABELS[disciplineId];

          if (
            !metrics ||
            (metrics.providerFte === 0 &&
              metrics.shortageFte === 0 &&
              metrics.designatedHpsas === 0)
          ) {
            return (
              <div key={disciplineId} className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">
                  No designated shortage area on file.
                </p>
              </div>
            );
          }

          const total = metrics.providerFte + metrics.shortageFte;
          const capacityPct = total > 0 ? Math.round((metrics.providerFte / total) * 100) : 0;

          return (
            <div key={disciplineId} className="space-y-1.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">
                  {metrics.providerFte.toFixed(1)} FTE in place, {metrics.shortageFte.toFixed(1)}{" "}
                  FTE still needed
                </p>
              </div>
              <Progress
                value={capacityPct}
                aria-label={`${label}: ${capacityPct}% of needed provider capacity in place, ${metrics.shortageFte.toFixed(1)} FTE still needed`}
                className="h-2.5"
              />
              <p className="text-[11px] text-muted-foreground/80">
                {metrics.estimatedUnderservedPopulation.toLocaleString()} residents in an
                underserved area
                {metrics.designatedHpsas > 0
                  ? ` - ${metrics.designatedHpsas} designated shortage area${metrics.designatedHpsas === 1 ? "" : "s"}`
                  : ""}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
