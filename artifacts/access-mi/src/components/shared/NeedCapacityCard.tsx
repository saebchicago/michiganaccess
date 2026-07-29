import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProvenanceTag } from "@/components/shared/ProvenanceTag";
import {
  HRSA_HPSA_COUNTY_RECORDS,
  getHpsaForCountyName,
  type HpsaDisciplineId,
} from "@/data/hrsa-hpsa-county";

const DISCIPLINE_LABELS: Record<HpsaDisciplineId, string> = {
  primaryCare: "Primary Care",
  dental: "Dental Health",
  mental: "Mental Health",
};

const DISCIPLINE_ORDER: HpsaDisciplineId[] = ["primaryCare", "dental", "mental"];

/**
 * Statewide rollup of the only two HPSA measures that survive aggregation.
 *
 * HRSA designations are facility-based and their service areas overlap, so
 * designationPopulation, estimatedUnderservedPopulation, providerFte and
 * shortageFte MUST NOT be summed - see the warning in
 * src/data/hrsa-hpsa-county.ts. Counts of designations, counts of counties,
 * and a max score are all non-additive and therefore safe.
 */
function aggregateStatewide(disciplineId: HpsaDisciplineId): {
  designatedHpsas: number;
  countiesWithDesignation: number;
  maxHpsaScore: number | null;
} {
  let designatedHpsas = 0;
  let countiesWithDesignation = 0;
  let maxHpsaScore: number | null = null;

  for (const county of HRSA_HPSA_COUNTY_RECORDS) {
    const d = county.disciplines[disciplineId];
    designatedHpsas += d.designatedHpsas;
    if (d.designatedHpsas > 0) countiesWithDesignation += 1;
    if (d.maxHpsaScore !== null) {
      maxHpsaScore =
        maxHpsaScore === null ? d.maxHpsaScore : Math.max(maxHpsaScore, d.maxHpsaScore);
    }
  }

  return { designatedHpsas, countiesWithDesignation, maxHpsaScore };
}

interface NeedCapacityCardProps {
  /** County name to scope to. Pass null/omit for a statewide rollup. */
  county?: string | null;
  className?: string;
}

/**
 * Where HRSA has designated a provider shortage, by discipline. Powered by
 * the already-ingested src/data/hrsa-hpsa-county dataset - no new fetch, no
 * modeled-from-scratch numbers.
 *
 * This card deliberately reports designation counts and severity scores
 * rather than population or FTE totals. The underlying facility-level
 * designations overlap, so summing their populations produced figures like
 * "24,282,165 residents in an underserved area" statewide - more than twice
 * Michigan's population - and a Wayne County primary-care shortage of 7,283
 * FTE against a whole-county baseline need of roughly 512 FTE. Those totals
 * were removed rather than approximated; see docs/audit-2026-07.md (D8).
 */
export function NeedCapacityCard({ county, className }: NeedCapacityCardProps) {
  const record = county ? getHpsaForCountyName(county) : null;
  const countyNotFound = Boolean(county) && !record;
  const scopeLabel = county ? `${county} County` : "Michigan statewide";

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">Designated Provider Shortage Areas</CardTitle>
          {/* MODELED, matching hrsa-hpsa-county.generated.json's own
              value_label: these are county rollups of the three HRSA
              facility-detail files, not a figure HRSA publishes per county. */}
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
            const label = DISCIPLINE_LABELS[disciplineId];
            const countyMetrics = county ? record?.disciplines[disciplineId] : null;
            const statewide = county ? null : aggregateStatewide(disciplineId);

            const designatedHpsas = county
              ? (countyMetrics?.designatedHpsas ?? 0)
              : (statewide?.designatedHpsas ?? 0);
            const maxHpsaScore = county
              ? (countyMetrics?.maxHpsaScore ?? null)
              : (statewide?.maxHpsaScore ?? null);

            if (designatedHpsas === 0) {
              return (
                <div key={disciplineId} className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">
                    No designated shortage area on file.
                  </p>
                </div>
              );
            }

            const areaLabel = `designated shortage area${designatedHpsas === 1 ? "" : "s"}`;

            return (
              <div key={disciplineId} className="space-y-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-sm font-semibold text-foreground">
                    {designatedHpsas.toLocaleString()} {areaLabel}
                  </p>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {statewide
                    ? `Across ${statewide.countiesWithDesignation} of ${HRSA_HPSA_COUNTY_RECORDS.length} counties`
                    : "In this county"}
                  {maxHpsaScore !== null
                    ? ` - highest severity score ${maxHpsaScore} (higher means greater shortage)`
                    : ""}
                </p>
              </div>
            );
          })}
        {!countyNotFound && (
          <p className="text-[11px] text-muted-foreground border-t pt-3">
            HRSA shortage designations are facility-based and their service
            areas overlap, so the population and staffing figures attached to
            individual designations cannot be added into a county or statewide
            total. Counts and severity scores are shown instead.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
