import { useTranslation } from "react-i18next";
import { usePageMeta } from "@/hooks/usePageMeta";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";

// Design scenarios, not research subjects. These are composite constraint
// profiles written from published Michigan access data (uninsurance,
// provider-shortage designations, rural drive times, LEP shares) to keep
// design arguments concrete. No interviews or usability sessions have been
// run; an earlier version of this page implied both, and did not label the
// personas or the journey maps as illustrative.
const scenarios = [
  {
    id: "uninsured-urban",
    label: "Uninsured, urban, no car",
    situation:
      "Two part-time service jobs, no employer coverage, a new diagnosis that needs regular visits. Getting to the wrong clinic costs a shift.",
    constraints: [
      "Cannot risk a wasted trip to a place that will turn her away",
      "Smartphone is the only internet access",
      "Does not know whether she is Medicaid-eligible",
      "May be reading in Spanish or Arabic, or translating for a neighbor",
    ],
    decisions: [
      {
        text: "Sliding-scale and \"no one turned away\" status shown on the listing, before the click",
        where: "/find-care",
      },
      {
        text: "Eligibility screener reachable in under five clicks from the homepage",
        where: "/benefits",
      },
      {
        text: "Every page laid out mobile-first, with 44px minimum tap targets",
        where: null,
      },
      { text: "English, Spanish, Arabic and Bengali interface", where: null },
    ],
  },
  {
    id: "rural-senior",
    label: "Rural, older, multiple specialists",
    situation:
      "Forty-five miles from the nearest hospital, six specialists across three cities, a spouse who also has appointments. Every visit is a day.",
    constraints: [
      "Prefers a phone call to a web form",
      "Needs something printable to take to an appointment",
      "Trips, not clicks, are the scarce resource",
    ],
    decisions: [
      {
        text: "Phone numbers rendered as text on the page, never behind a dropdown",
        where: "/find-care",
      },
      { text: "Print-optimized layout on resource pages", where: null },
      {
        text: "Facilities grouped by system so same-day scheduling is visible",
        where: "/compare-places",
      },
    ],
  },
];

// Each row is a change that shipped, and the reason it shipped. The reasons
// come from published guidance and from the constraint profiles above, not
// from moderated testing.
const decisions = [
  {
    change: "Primary-source citation on every rendered figure",
    because:
      "A civic data site with no visible provenance is indistinguishable from a content farm.",
  },
  {
    change: "Dollar ranges instead of the word \"affordable\"",
    because:
      "\"Affordable\" is unactionable. \"$20-50 sliding scale based on income\" tells someone whether to make the trip.",
  },
  {
    change: "988 and 2-1-1 in a persistent top bar, not the footer",
    because:
      "Crisis lines are useless at the bottom of a long page. SAMHSA's own guidance puts them first.",
  },
  {
    change: "List view alongside every map",
    because:
      "Pan-and-zoom is hard one-handed, and a map is unreadable to a screen reader.",
  },
  {
    change: "Quick Exit control on domestic-violence resource pages",
    because:
      "Standard practice for DV resources; the browsing itself can be the danger.",
  },
];

export default function ResearchPage() {
  const { t } = useTranslation();
  usePageMeta({
    title: t("researchPage.badge"),
    description: t("researchPage.subtitle"),
    path: "/research",
  });

  return (
    <Layout>
      <div className="container max-w-3xl py-10 lg:py-14">
        <Breadcrumbs items={[{ label: t("researchPage.badge") }]} />

        <h1 className="mt-6 text-3xl font-bold text-foreground lg:text-4xl">
          {t("researchPage.title")}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          {t("researchPage.subtitle")}
        </p>

        <section className="mt-12" aria-labelledby="scenarios-heading">
          <h2
            id="scenarios-heading"
            className="text-xl font-bold text-foreground"
          >
            {t("researchPage.personasTitle")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("researchPage.personasSubtitle")}
          </p>

          <div className="mt-8 space-y-10">
            {scenarios.map((s) => (
              <article key={s.id}>
                <h3 className="text-base font-semibold text-foreground">
                  {s.label}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {s.situation}
                </p>

                <div className="mt-4 grid gap-6 sm:grid-cols-2">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("researchPage.barriers")}
                    </h4>
                    <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                      {s.constraints.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("researchPage.designImplications")}
                    </h4>
                    <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                      {s.decisions.map((d) => (
                        <li key={d.text}>
                          {d.text}
                          {d.where && (
                            <>
                              {" "}
                              <a
                                href={d.where}
                                className="whitespace-nowrap underline underline-offset-2 hover:text-foreground"
                              >
                                {d.where}
                              </a>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14" aria-labelledby="decisions-heading">
          <h2
            id="decisions-heading"
            className="text-xl font-bold text-foreground"
          >
            {t("researchPage.usabilityTitle")}
          </h2>

          <dl className="mt-6 divide-y divide-border border-t border-border">
            {decisions.map((d) => (
              <div key={d.change} className="py-4">
                <dt className="text-sm font-medium text-foreground">
                  {d.change}
                </dt>
                <dd className="mt-1 text-sm text-muted-foreground">
                  {d.because}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-6 text-sm text-muted-foreground">
            {t("researchPage.testingNote")}
          </p>
        </section>
      </div>
    </Layout>
  );
}
