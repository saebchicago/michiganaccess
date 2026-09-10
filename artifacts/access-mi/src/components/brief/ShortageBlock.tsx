/**
 * One shortage, with the local programs that answer it.
 *
 * Shared by the compact resource bridge on the county brief and by the full
 * /county/:slug/help page, so both surfaces render the same programs from the
 * same rules. The only difference is `limit`: the bridge shows a few, the help
 * page shows everything.
 *
 * Program sources, in order of locality:
 *  1. Verified hospitals and health center sites physically in the county
 *     (CMS + HRSA extract) - only for shortages that clinical sites answer.
 *  2. Community resource directory rows for this county.
 *  3. Assistance programs, each labeled with its own coverage area so a
 *     statewide program never reads as a county-run one.
 * Nothing is invented; when no source has a match the block says so.
 */
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Phone } from "lucide-react";
import type { Shortage } from "@/lib/countyShortages";
import { useCountyResourcesByTypes } from "@/hooks/useCountyResourcesByTypes";
import { useFinancialPrograms } from "@/hooks/useFinancialPrograms";
import type { FinancialProgram } from "@/hooks/useFinancialPrograms";
import {
  facilitiesInCounty,
  VERIFIED_FACILITY_SOURCE_LABEL,
} from "@/data/verifiedHealthFacilities";
import { IntegrityBadge } from "@/components/chna/IntegrityBadge";

export function ExtLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
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

function ProgramLine({ program }: { program: FinancialProgram }) {
  return (
    <li className="text-xs text-muted-foreground">
      <span className="font-medium text-foreground">
        {program.application_url ? (
          <ExtLink href={program.application_url}>
            {program.program_name}
          </ExtLink>
        ) : (
          program.program_name
        )}
      </span>
      {program.coverage_area && (
        <span className="ml-1 text-[10px] uppercase tracking-wide">
          ({program.coverage_area})
        </span>
      )}
      {program.how_to_apply && <p className="mt-0.5">{program.how_to_apply}</p>}
      {program.phone && (
        <a
          href={`tel:${program.phone}`}
          className="mt-0.5 inline-flex items-center gap-1 text-primary underline"
        >
          <Phone className="h-3 w-3" /> {program.phone}
        </a>
      )}
    </li>
  );
}

export default function ShortageBlock({
  county,
  shortage,
  limit,
}: {
  county: string;
  shortage: Shortage;
  /** Cap on local rows; omit to show every row in the county. */
  limit?: number;
}) {
  const {
    data: local,
    isLoading,
    error,
  } = useCountyResourcesByTypes(county, shortage.resourceTypes);
  const { data: allPrograms } = useFinancialPrograms();

  const programs = useMemo(
    () =>
      (allPrograms ?? []).filter((p) =>
        shortage.programTypes.includes(p.program_type),
      ),
    [allPrograms, shortage.programTypes],
  );

  // County-resident clinical sites, straight from the verified extract. These
  // are the most local answer available and need no directory row to exist.
  const sites = useMemo(
    () => (shortage.showLocalFacilities ? facilitiesInCounty(county) : []),
    [shortage.showLocalFacilities, county],
  );
  const shownSites = limit ? sites.slice(0, limit) : sites;
  const localRows = limit ? (local ?? []).slice(0, limit) : (local ?? []);

  return (
    <div className="rounded-lg border border-border/60 p-4 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="text-sm font-bold text-foreground">{shortage.title}</h4>
        <Badge variant="outline" className="text-[10px] tabular-nums">
          {shortage.figure}
        </Badge>
        <IntegrityBadge label={shortage.label} source={shortage.source} />
        <span className="text-[10px] text-muted-foreground tabular-nums">
          vs {shortage.threshold}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{shortage.action}</p>

      {shortage.showLocalFacilities && (
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Care sites in {county} County
          </p>
          {sites.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No CMS-certified hospital or HRSA health center site is located in
              this county. The nearest sites are in neighboring counties - use
              Find Care to sort by distance.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {shownSites.map((f) => (
                <li key={f.id} className="text-xs">
                  <span className="font-medium text-foreground">{f.name}</span>
                  <Badge variant="secondary" className="ml-1 text-[10px]">
                    {f.type === "fqhc" ? "health center" : "hospital"}
                  </Badge>
                  {f.city && (
                    <span className="text-muted-foreground"> - {f.city}</span>
                  )}
                  {f.phone && (
                    <>
                      {" - "}
                      <a
                        href={`tel:${f.phone}`}
                        className="text-primary underline"
                      >
                        {f.phone}
                      </a>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
          {limit && sites.length > shownSites.length && (
            <p className="text-[10px] text-muted-foreground tabular-nums">
              {sites.length - shownSites.length} more in this county.
            </p>
          )}
          <p className="text-[10px] text-muted-foreground">
            Sites: {VERIFIED_FACILITY_SOURCE_LABEL}
          </p>
        </div>
      )}

      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          In {county} County
        </p>
        {isLoading && (
          <p className="text-xs text-muted-foreground">
            Loading local programs...
          </p>
        )}
        {error && (
          <p className="text-xs text-muted-foreground">
            Local program directory unavailable right now - call 2-1-1 for a
            live referral.
          </p>
        )}
        {!isLoading && !error && (local ?? []).length === 0 && (
          <p className="text-xs text-muted-foreground">
            No local program of this type is in the directory yet. The programs
            below serve this county, with their coverage area shown.
          </p>
        )}
        <ul className="space-y-1.5">
          {localRows.map((r) => (
            <li key={r.id} className="text-xs">
              <span className="font-medium text-foreground">
                {r.website ? (
                  <ExtLink href={r.website}>{r.resource_name}</ExtLink>
                ) : (
                  r.resource_name
                )}
              </span>
              {r.city && (
                <span className="text-muted-foreground"> - {r.city}</span>
              )}
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
        {limit && (local ?? []).length > localRows.length && (
          <p className="text-[10px] text-muted-foreground tabular-nums">
            {(local ?? []).length - localRows.length} more in this county.
          </p>
        )}
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

      <p className="text-[10px] text-muted-foreground">
        Shortage source: {shortage.source}
      </p>
    </div>
  );
}
