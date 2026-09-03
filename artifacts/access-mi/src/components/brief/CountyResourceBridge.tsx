/**
 * County resource bridge.
 *
 * A county brief that reports a shortage should not stop at the number. This
 * panel reads the same published county figures the brief renders, decides
 * which shortages are actually present, and then lists real local programs
 * for each one with how to apply.
 *
 * Rules this component keeps:
 * - A shortage is only claimed when a sourced figure crosses a named
 *   threshold. Every trigger prints its figure, its threshold and its source.
 * - Missing data is never treated as "no shortage" silently: unavailable
 *   inputs are listed as not yet assessed.
 * - Programs come from the database (community_resources, financial_programs).
 *   Nothing is invented here. A county with no matching local row falls back
 *   to the statewide programs, labelled as statewide.
 */
import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Phone, LifeBuoy } from "lucide-react";
import { getHpsaForCountyName } from "@/data/hrsa-hpsa-county";
import { getSviForCountyName } from "@/data/cdc-svi-county";
import { MI_BENCHMARKS } from "@/data/michiganBenchmarks";
import { useCountyResourcesByTypes } from "@/hooks/useCountyResourcesByTypes";
import { useFinancialPrograms } from "@/hooks/useFinancialPrograms";
import type { FinancialProgram } from "@/hooks/useFinancialPrograms";

type ShortageId = "primary-care" | "coverage" | "housing" | "food";

interface Shortage {
  id: ShortageId;
  title: string;
  /** The measured figure, already formatted. */
  figure: string;
  /** The threshold that made this a shortage, already formatted. */
  threshold: string;
  source: string;
  resourceTypes: string[];
  programTypes: string[];
  /** What the resident can do about it, in plain language. */
  action: string;
}

const HUD_COST_BURDEN_THRESHOLD = 30;
const POVERTY_150_THRESHOLD = 35;

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-primary underline decoration-primary/30 hover:decoration-primary"
    >
      {children} <ExternalLink className="h-3 w-3 shrink-0" />
      <span className="sr-only">(opens external site)</span>
    </a>
  );
}

/** Decide which shortages this county actually has, from published figures. */
function detectShortages(county: string): { shortages: Shortage[]; unassessed: string[] } {
  const shortages: Shortage[] = [];
  const unassessed: string[] = [];

  const hpsa = getHpsaForCountyName(county);
  const pcFte = hpsa?.disciplines?.primaryCare?.shortageFte ?? null;
  if (pcFte === null) {
    unassessed.push("Primary care shortage (no HRSA designation on file)");
  } else if (pcFte > 0) {
    shortages.push({
      id: "primary-care",
      title: "Primary care shortage",
      figure: `${pcFte.toFixed(1)} full-time clinicians short`,
      threshold: "any HRSA-designated shortage",
      source: "HRSA Health Professional Shortage Areas",
      resourceTypes: ["health_services", "health", "information_referral"],
      programTypes: ["charity_care", "insurance"],
      action:
        "Federally qualified health centers charge on a sliding scale and take patients without insurance. Hospital financial assistance can cancel or cut a bill you already have.",
    });
  }

  const svi = getSviForCountyName(county);
  const uninsured = svi?.status === "populated" ? svi.inputs.uninsuredPct : null;
  const stateUninsured = MI_BENCHMARKS["Uninsured rate"]?.stateValue ?? null;
  if (uninsured === null || stateUninsured === null) {
    unassessed.push("Uninsured rate (county value pending)");
  } else if (uninsured > stateUninsured) {
    shortages.push({
      id: "coverage",
      title: "Above-average uninsured rate",
      figure: `${uninsured.toFixed(1)}% uninsured`,
      threshold: `Michigan ${stateUninsured}%`,
      source: "CDC/ATSDR SVI (ACS inputs); benchmark: Michigan ACS",
      resourceTypes: ["health_insurance", "information_referral"],
      programTypes: ["insurance", "prescription"],
      action:
        "Healthy Michigan Plan enrollment is open year-round if you qualify on income. Marketplace plans open during enrollment or after a life change.",
    });
  }

  const costBurden = svi?.status === "populated" ? svi.inputs.housingCostBurdenPct : null;
  if (costBurden === null) {
    unassessed.push("Housing cost burden (county value pending)");
  } else if (costBurden > HUD_COST_BURDEN_THRESHOLD) {
    shortages.push({
      id: "housing",
      title: "Housing cost burden",
      figure: `${costBurden.toFixed(1)}% of households cost-burdened`,
      threshold: `HUD standard ${HUD_COST_BURDEN_THRESHOLD}%`,
      source: "CDC/ATSDR SVI (ACS inputs); threshold: HUD",
      resourceTypes: ["housing", "housing_shelter"],
      programTypes: ["social_services"],
      action:
        "Housing assessment agencies handle emergency rent help and shelter placement. Energy assistance frees up rent money in the same household budget.",
    });
  }

  const poverty150 = svi?.status === "populated" ? svi.inputs.belowPoverty150Pct : null;
  if (poverty150 === null) {
    unassessed.push("Income below 150% of poverty (county value pending)");
  } else if (poverty150 > POVERTY_150_THRESHOLD) {
    shortages.push({
      id: "food",
      title: "High share of households near poverty",
      figure: `${poverty150.toFixed(1)}% below 150% of the poverty line`,
      threshold: `${POVERTY_150_THRESHOLD}% of households`,
      source: "CDC/ATSDR SVI (ACS inputs)",
      resourceTypes: ["food", "food_nutrition"],
      programTypes: ["social_services"],
      action:
        "Food assistance (SNAP) is applied for once through MI Bridges. Pantries below do not require an application.",
    });
  }

  return { shortages, unassessed };
}

function ProgramLine({ program }: { program: FinancialProgram }) {
  return (
    <li className="text-xs text-muted-foreground">
      <span className="font-medium text-foreground">
        {program.application_url ? (
          <ExtLink href={program.application_url}>{program.program_name}</ExtLink>
        ) : (
          program.program_name
        )}
      </span>
      {program.coverage_area && (
        <span className="ml-1 text-[10px] uppercase tracking-wide">({program.coverage_area})</span>
      )}
      {program.how_to_apply && <p className="mt-0.5">{program.how_to_apply}</p>}
      {program.phone && (
        <a href={`tel:${program.phone}`} className="mt-0.5 inline-flex items-center gap-1 text-primary underline">
          <Phone className="h-3 w-3" /> {program.phone}
        </a>
      )}
    </li>
  );
}

function ShortageBlock({ county, shortage }: { county: string; shortage: Shortage }) {
  const { data: local, isLoading, error } = useCountyResourcesByTypes(county, shortage.resourceTypes);
  const { data: allPrograms } = useFinancialPrograms();

  const programs = useMemo(
    () => (allPrograms ?? []).filter((p) => shortage.programTypes.includes(p.program_type)),
    [allPrograms, shortage.programTypes],
  );

  return (
    <div className="rounded-lg border border-border/60 p-4 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="text-sm font-bold text-foreground">{shortage.title}</h4>
        <Badge variant="outline" className="text-[10px] tabular-nums">
          {shortage.figure}
        </Badge>
        <span className="text-[10px] text-muted-foreground tabular-nums">vs {shortage.threshold}</span>
      </div>
      <p className="text-xs text-muted-foreground">{shortage.action}</p>

      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          In {county} County
        </p>
        {isLoading && <p className="text-xs text-muted-foreground">Loading local programs...</p>}
        {error && (
          <p className="text-xs text-muted-foreground">
            Local program directory unavailable right now - call 2-1-1 for a live referral.
          </p>
        )}
        {!isLoading && !error && (local ?? []).length === 0 && (
          <p className="text-xs text-muted-foreground">
            No local program of this type is in the directory yet. The statewide programs below serve this
            county.
          </p>
        )}
        <ul className="space-y-1.5">
          {(local ?? []).slice(0, 4).map((r) => (
            <li key={r.id} className="text-xs">
              <span className="font-medium text-foreground">
                {r.website ? <ExtLink href={r.website}>{r.resource_name}</ExtLink> : r.resource_name}
              </span>
              {r.city && <span className="text-muted-foreground"> - {r.city}</span>}
              {r.phone && (
                <>
                  {" - "}
                  <a href={`tel:${r.phone}`} className="text-primary underline">
                    {r.phone}
                  </a>
                </>
              )}
              {r.walk_in_available && (
                <Badge variant="secondary" className="ml-1 text-[10px]">
                  walk-in
                </Badge>
              )}
              {r.is_free && (
                <Badge variant="secondary" className="ml-1 text-[10px]">
                  free
                </Badge>
              )}
            </li>
          ))}
        </ul>
      </div>

      {programs.length > 0 && (
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            How to apply
          </p>
          <ul className="space-y-1.5">
            {programs.map((p) => (
              <ProgramLine key={p.id} program={p} />
            ))}
          </ul>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground">Shortage source: {shortage.source}</p>
    </div>
  );
}

export default function CountyResourceBridge({ county }: { county?: string | null }) {
  if (!county) return null;
  const { shortages, unassessed } = detectShortages(county);

  return (
    <Card className="border-primary/20">
      <CardContent className="py-5 space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <LifeBuoy className="h-4 w-4 text-primary" />
            What to do about it in {county} County
          </h3>
          <p className="text-xs text-muted-foreground">
            Each shortage below crossed a published threshold in this county. Programs are drawn from the
            Access Michigan resource directory and statewide assistance programs.
          </p>
        </div>

        {shortages.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No tracked shortage crossed its threshold in this county on the figures above. For help with a
            specific need, call 2-1-1 or use the resource directory.
          </p>
        ) : (
          <div className="space-y-3">
            {shortages.map((s) => (
              <ShortageBlock key={s.id} county={county} shortage={s} />
            ))}
          </div>
        )}

        {unassessed.length > 0 && (
          <p className="text-[10px] text-muted-foreground">
            Not yet assessed for this county: {unassessed.join("; ")}.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
