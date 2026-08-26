import { ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import {
  HRSA_HPSA_COUNTY_PROVENANCE,
  HRSA_HPSA_COUNTY_RECORDS,
} from "@/data/hrsa-hpsa-county";
import { EDITORIAL as C } from "@/components/home/editorialTheme";

const LENSES = [
  {
    eyebrow: "Capacity",
    title: "Where providers are scarce",
    description:
      "Review HRSA dental shortage designations and severity alongside local safety-net capacity.",
    href: "/equity",
    link: "Explore dental shortages",
  },
  {
    eyebrow: "Use",
    title: "Who received dental care",
    description:
      "Compare CDC estimates of adults reporting a dental visit in the past year across Michigan places.",
    href: "/data-explorer",
    link: "Compare dental visits",
  },
  {
    eyebrow: "Coverage",
    title: "How people pay for care",
    description:
      "Connect insurance and Medicaid context to care-access signals without treating coverage as proof of access.",
    href: "/insurance-coverage",
    link: "Review coverage context",
  },
] as const;

/** A fully data-derived summary; no metric, denominator, vintage, or source is duplicated in UI copy. */
export function OralHealthIntelligence() {
  const countyCount = HRSA_HPSA_COUNTY_RECORDS.length;
  const dentalShortageCount = HRSA_HPSA_COUNTY_RECORDS.filter(
    (county) => county.disciplines.dental.designatedHpsas > 0,
  ).length;
  const shortageShare = Math.round((dentalShortageCount / countyCount) * 100);
  const dentalVintage = HRSA_HPSA_COUNTY_PROVENANCE.per_discipline.find(
    (discipline) => discipline.disciplineId === "dental",
  )?.dwCreateDate;

  return (
    <section
      className="container mx-auto max-w-6xl px-4 pb-14"
      aria-labelledby="oral-health-heading"
    >
      <div
        className="grid overflow-hidden border lg:grid-cols-[0.8fr_2fr]"
        style={{ borderColor: `${C.emerald}33` }}
      >
        <div className="p-6 md:p-8" style={{ backgroundColor: C.emerald }}>
          <p
            className="text-[11px] font-semibold uppercase"
            style={{ color: C.goldBright, letterSpacing: "0.18em" }}
          >
            Oral-health intelligence
          </p>
          <p
            className="mt-5 font-serif text-5xl tabular-nums"
            style={{ color: C.cream }}
          >
            {shortageShare}%
          </p>
          <p
            className="mt-2 text-sm leading-relaxed"
            style={{ color: `${C.cream}D6` }}
          >
            of Michigan counties ({dentalShortageCount} of {countyCount}) have
            at least one dental Health Professional Shortage Area designation.
          </p>
          <div
            className="mt-4 space-y-2 text-[11px]"
            style={{ color: `${C.cream}C7` }}
          >
            <p>
              {HRSA_HPSA_COUNTY_PROVENANCE.value_label} county rollup
              {dentalVintage ? ` · source records dated ${dentalVintage}` : ""}
            </p>
            <a
              href={HRSA_HPSA_COUNTY_PROVENANCE.source_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-[44px] items-center gap-1 underline underline-offset-4"
            >
              Verify with {HRSA_HPSA_COUNTY_PROVENANCE.source_name}
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className="p-6 md:p-8">
          <h2
            id="oral-health-heading"
            className="font-serif text-2xl md:text-3xl"
            style={{ color: C.emerald }}
          >
            See the whole dental-care picture.
          </h2>
          <p
            className="mt-2 max-w-2xl text-sm leading-relaxed"
            style={{ color: `${C.emerald}CC` }}
          >
            Capacity, utilization, and coverage answer different questions. Read
            them together to spot service gaps and plan a responsible response.
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {LENSES.map((lens) => (
              <article
                key={lens.eyebrow}
                className="border-t pt-4"
                style={{ borderColor: `${C.emerald}26` }}
              >
                <p
                  className="text-[10px] font-bold uppercase"
                  style={{ color: C.goldInk, letterSpacing: "0.16em" }}
                >
                  {lens.eyebrow}
                </p>
                <h3
                  className="mt-2 font-serif text-lg leading-tight"
                  style={{ color: C.emerald }}
                >
                  {lens.title}
                </h3>
                <p
                  className="mt-2 text-xs leading-relaxed"
                  style={{ color: `${C.emerald}CC` }}
                >
                  {lens.description}
                </p>
                <Link
                  to={lens.href}
                  className="mt-3 inline-flex min-h-[44px] items-center gap-1 text-xs font-semibold underline underline-offset-4"
                  style={{ color: C.emeraldMid }}
                >
                  {lens.link}
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
