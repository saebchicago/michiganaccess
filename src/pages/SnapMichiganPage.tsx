import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpDown, ChevronDown, ChevronUp, ExternalLink, Users, Store, Building2, TrendingDown } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProvenanceDisclaimer } from "@/components/shared/ProvenanceDisclaimer";
import { DataProvenance } from "@/components/shared/DataProvenance";
import { useSnapMichigan } from "@/hooks/useSnapMichigan";
import { usePageMeta } from "@/hooks/usePageMeta";
import type { SnapCountyData } from "@/data/snapMichiganFallback";

// ── Types ─────────────────────────────────────────────────────────────────────

type SortKey = "county" | "enrollmentTotal" | "enrollmentPct" | "retailerCount";
type SortDir = "asc" | "desc";

// Michigan county populations (ACS 2022 5-year estimates, approximate)
// Used only to compute enrollment % of population — does not affect source-cited figures.
const COUNTY_POP: Record<string, number> = {
  Alcona: 10_600, Alger: 9_100, Allegan: 120_800, Alpena: 28_200, Antrim: 23_800,
  Arenac: 14_800, Baraga: 8_300, Barry: 62_300, Bay: 103_200, Benzie: 17_900,
  Berrien: 150_700, Branch: 43_600, Calhoun: 133_000, Cass: 51_400, Charlevoix: 26_900,
  Cheboygan: 25_500, Chippewa: 37_500, Clare: 31_000, Clinton: 79_900, Crawford: 13_900,
  Delta: 36_000, Dickinson: 25_100, Eaton: 110_300, Emmet: 33_400, Genesee: 404_900,
  Gladwin: 25_300, Gogebic: 14_800, "Grand Traverse": 96_200, Gratiot: 39_400,
  Hillsdale: 45_800, Houghton: 36_000, Huron: 31_700, Ingham: 292_400, Ionia: 64_900,
  Iosco: 25_200, Iron: 11_200, Isabella: 70_200, Jackson: 158_100, Kalamazoo: 265_900,
  Kalkaska: 17_900, Kent: 665_400, Keweenaw: 2_100, Lake: 12_000, Lapeer: 88_300,
  Leelanau: 21_900, Lenawee: 97_800, Livingston: 199_600, Luce: 6_400, Mackinac: 10_700,
  Macomb: 882_900, Manistee: 24_300, Marquette: 66_300, Mason: 29_300, Mecosta: 43_100,
  Menominee: 22_700, Midland: 82_700, Missaukee: 14_800, Monroe: 150_600,
  Montcalm: 63_900, Montmorency: 9_500, Muskegon: 175_100, Newaygo: 48_300,
  Oakland: 1_263_000, Oceana: 26_200, Ogemaw: 21_400, Ontonagon: 5_900, Osceola: 23_200,
  Oscoda: 8_100, Otsego: 24_600, Ottawa: 298_200, "Presque Isle": 12_600,
  Roscommon: 24_200, Saginaw: 188_900, Sanilac: 40_700, Schoolcraft: 8_100,
  Shiawassee: 68_600, "St. Clair": 159_600, "St. Joseph": 60_400, Tuscola: 53_100,
  "Van Buren": 75_200, Washtenaw: 373_200, Wayne: 1_780_700, Wexford: 33_300,
};

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  value,
  label,
  provenance,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  provenance: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-primary">{icon}</div>
          <div className="flex-1 min-w-0">
            <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
            <p className="text-xs text-muted-foreground leading-tight">{label}</p>
            <div className="mt-1">{provenance}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Column header button ───────────────────────────────────────────────────────

function SortButton({
  col,
  label,
  sortKey,
  sortDir,
  onSort,
}: {
  col: SortKey;
  label: string;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
}) {
  const active = sortKey === col;
  return (
    <button
      onClick={() => onSort(col)}
      className={`flex items-center gap-1 text-left text-xs font-medium hover:text-primary transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
      aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
    >
      {label}
      <ArrowUpDown className="h-3 w-3 shrink-0" />
    </button>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SnapMichiganPage() {
  usePageMeta({
    title: "SNAP in Michigan | accessmi.org",
    description:
      "Food assistance enrollment and retailer access across all 83 Michigan counties, sourced from USDA FNS and the SNAP Retailer Locator.",
  });

  const { data, isLoading } = useSnapMichigan();

  const [sortKey, setSortKey] = useState<SortKey>("enrollmentTotal");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [methodologyOpen, setMethodologyOpen] = useState(false);

  const counties = useMemo(() => data?.counties ?? [], [data]);
  const stateData = data?.state;

  // Derived stats
  const retailerStateTotal = 9_200; // USDA SNAP Retailer CSV, Dec 2025 (statewide, V3_SOURCE_AUDIT.md)

  const countiesAbove20Pct = useMemo(() => {
    return counties.filter((c) => {
      const pop = COUNTY_POP[c.county];
      if (!pop || !c.enrollmentTotal) return false;
      return c.enrollmentTotal / pop >= 0.2;
    }).length;
  }, [counties]);

  // Sort
  const sorted = useMemo(() => {
    return [...counties].sort((a, b) => {
      let av: number;
      let bv: number;
      if (sortKey === "county") {
        const cmp = a.county.localeCompare(b.county);
        return sortDir === "asc" ? cmp : -cmp;
      }
      if (sortKey === "enrollmentPct") {
        const ap = COUNTY_POP[a.county];
        const bp = COUNTY_POP[b.county];
        av = ap && a.enrollmentTotal ? a.enrollmentTotal / ap : 0;
        bv = bp && b.enrollmentTotal ? b.enrollmentTotal / bp : 0;
      } else if (sortKey === "enrollmentTotal") {
        av = a.enrollmentTotal ?? 0;
        bv = b.enrollmentTotal ?? 0;
      } else {
        // retailerCount
        av = a.retailerCount ?? -1;
        bv = b.retailerCount ?? -1;
      }
      return sortDir === "asc" ? av - bv : bv - av;
    });
  }, [counties, sortKey, sortDir]);

  function handleSort(col: SortKey) {
    if (sortKey === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(col);
      setSortDir(col === "county" ? "asc" : "desc");
    }
  }

  function fmtN(n: number | null | undefined): string {
    if (n == null) return "—";
    return n.toLocaleString();
  }

  function fmtPct(county: SnapCountyData): string {
    const pop = COUNTY_POP[county.county];
    if (!pop || !county.enrollmentTotal) return "—";
    return ((county.enrollmentTotal / pop) * 100).toFixed(1) + "%";
  }

  function countySlug(name: string): string {
    return name.toLowerCase().replace(/\s+/g, "-").replace(/\./g, "");
  }

  return (
    <Layout>
      <div className="container max-w-5xl py-8 space-y-8">
        <Breadcrumbs
          items={[
            { label: "Data & Insights", href: "/data-and-insights" },
            { label: "SNAP in Michigan" },
          ]}
        />

        {/* ── Hero ── */}
        <section>
          <div className="flex items-start gap-3 mb-3">
            <Badge variant="outline" className="mt-1 shrink-0">V3</Badge>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">SNAP in Michigan</h1>
              <p className="text-muted-foreground mt-1">
                Food assistance enrollment and retailer access across all 83 Michigan counties,
                sourced from the most current public data.
              </p>
            </div>
          </div>
          <ProvenanceDisclaimer />
          <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
            SNAP enrollment: county-level data is annual from USDA FNS (most recent: FY2022).
            Statewide monthly totals are current within ~2 months. Where county monthly data is
            available from MDHHS extraction, it is labeled separately with its report date.
          </p>
        </section>

        {/* ── Stat cards ── */}
        <section>
          <h2 className="sr-only">Statewide statistics</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              icon={<Users className="h-5 w-5" />}
              value={isLoading ? "…" : stateData ? (stateData.stateTotal / 1_000_000).toFixed(1) + "M" : "—"}
              label="Michigan residents receiving SNAP (statewide, current month)"
              provenance={
                <DataProvenance
                  sourceName="USDA FNS SNAP Data Tables"
                  sourceUrl="https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap"
                  asOfDate={stateData?.stateAsOf ?? "January 2026"}
                  cadence="Monthly"
                  dataKind="measured"
                  compact
                />
              }
            />
            <StatCard
              icon={<TrendingDown className="h-5 w-5" />}
              value={isLoading ? "…" : stateData ? "$" + (stateData.benefitIssuanceMonthly / 1_000_000).toFixed(0) + "M" : "—"}
              label="Estimated monthly benefit issuance (statewide)"
              provenance={
                <DataProvenance
                  sourceName="USDA FNS SNAP Data Tables"
                  sourceUrl="https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap"
                  asOfDate={stateData?.benefitAsOf ?? "January 2026"}
                  cadence="Monthly"
                  dataKind="measured"
                  compact
                />
              }
            />
            <StatCard
              icon={<Store className="h-5 w-5" />}
              value={isLoading ? "…" : "9,200+"}
              label="Authorized SNAP retailers statewide"
              provenance={
                <DataProvenance
                  sourceName="USDA SNAP Retailer Locator"
                  sourceUrl="https://www.fns.usda.gov/snap/retailer-locator/data"
                  asOfDate="Dec 31, 2025"
                  cadence="Quarterly"
                  dataKind="measured"
                  compact
                />
              }
            />
            <StatCard
              icon={<Building2 className="h-5 w-5" />}
              value={isLoading ? "…" : countiesAbove20Pct}
              label="Counties where SNAP enrollment exceeds 20% of population (FY2022)"
              provenance={
                <DataProvenance
                  sourceName="USDA FNS · ACS 2022 population estimates"
                  sourceUrl="https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap"
                  asOfDate="FY2022 / ACS 2022"
                  cadence="Annual"
                  dataKind="measured"
                  compact
                />
              }
            />
          </div>
        </section>

        {/* ── County table ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">All 83 Michigan Counties</h2>
            <span className="text-[11px] text-muted-foreground">
              SNAP enrollment data: USDA FNS FY2022 (most recent annual county file)
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm" role="grid" aria-label="Michigan county SNAP enrollment">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-2.5 text-left font-medium">
                    <SortButton col="county" label="County" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium">
                    <SortButton col="enrollmentTotal" label="SNAP Persons" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium">
                    <SortButton col="enrollmentPct" label="% of Pop." sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium">
                    <SortButton col="retailerCount" label="Retailers" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium text-muted-foreground text-xs">
                    Data as of
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((c, i) => (
                  <tr
                    key={c.fips}
                    className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}
                  >
                    <td className="px-4 py-2">
                      <Link
                        to={`/county/${countySlug(c.county)}`}
                        className="font-medium text-primary hover:underline"
                        aria-label={`View ${c.county} County data`}
                      >
                        {c.county}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {fmtN(c.enrollmentTotal)}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">
                      {fmtPct(c)}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">
                      {fmtN(c.retailerCount)}
                    </td>
                    <td className="px-4 py-2 text-right text-[11px] text-muted-foreground whitespace-nowrap">
                      {c.enrollmentAsOf}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border bg-muted/20">
                  <td colSpan={5} className="px-4 py-2.5">
                    <DataProvenance
                      sourceName="USDA FNS SNAP Data Tables"
                      sourceUrl="https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap"
                      asOfDate="FY2022 (most recent annual county file)"
                      cadence="Annual"
                      dataKind="measured"
                    />
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <p className="text-[11px] text-muted-foreground mt-2">
            % of population derived from ACS 2022 5-year estimates. Retailer counts pending
            USDA SNAP Retailer Locator CSV parse — county-level data not yet extracted.{" "}
            <a
              href="https://www.fns.usda.gov/snap/retailer-locator/data"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary inline-flex items-center gap-0.5"
            >
              USDA Retailer Locator <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </p>
        </section>

        {/* ── Methodology ── */}
        <section className="border border-border rounded-lg">
          <button
            onClick={() => setMethodologyOpen((o) => !o)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors rounded-lg"
            aria-expanded={methodologyOpen}
          >
            <span className="font-semibold text-sm">How we source SNAP data</span>
            {methodologyOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          {methodologyOpen && (
            <div className="px-5 pb-5 pt-1 space-y-3 text-sm text-muted-foreground border-t border-border/50">
              <p>
                <strong className="text-foreground">Two-tier freshness model.</strong> USDA FNS
                publishes statewide SNAP participation monthly, typically with a ~2-month lag.
                County-level data is published annually; the most recent county file available
                as of April 2026 is FY2022 (October 2021–September 2022). This means county
                figures shown here are approximately 2–3 years old.
              </p>
              <p>
                <strong className="text-foreground">Planned improvement.</strong> MDHHS publishes
                a "Green Book" monthly that includes county-level SNAP enrollment with a ~6-week
                lag. Automated extraction of this PDF is specced in our{" "}
                <Link to="/methodology" className="underline hover:text-primary">
                  methodology documentation
                </Link>{" "}
                and planned for a future update. When extraction is live, county data will be
                labeled with the MDHHS report month rather than the FY2022 vintage.
              </p>
              <p>
                <strong className="text-foreground">Retailer counts.</strong> The USDA SNAP
                Retailer Locator publishes an authorized-retailer CSV quarterly. County-level
                aggregation requires geocoding ZIP codes to counties. This is planned for a
                future update; currently only the statewide total (9,200+, December 2025) is shown.
              </p>
              <p>
                <strong className="text-foreground">Enrollment % of population.</strong> Derived
                by dividing SNAP enrollment by ACS 2022 5-year county population estimates. This
                is a rough indicator of relative participation — not an eligibility rate or
                coverage rate.
              </p>
              <div className="mt-2 space-y-1.5">
                <p className="font-medium text-foreground text-xs uppercase tracking-wide">Sources</p>
                <DataProvenance
                  sourceName="USDA FNS SNAP Data Tables"
                  sourceUrl="https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap"
                  asOfDate="FY2022 (county) / January 2026 (state)"
                  cadence="Annual (county) · Monthly (state)"
                  dataKind="measured"
                />
                <DataProvenance
                  sourceName="USDA SNAP Retailer Locator"
                  sourceUrl="https://www.fns.usda.gov/snap/retailer-locator/data"
                  asOfDate="Dec 31, 2025"
                  cadence="Quarterly"
                  dataKind="measured"
                />
              </div>
            </div>
          )}
        </section>

        {/* ── Page-level provenance ── */}
        <DataProvenance
          sourceName="USDA FNS SNAP Data Tables · USDA SNAP Retailer Locator"
          sourceUrl="https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap"
          asOfDate="FY2022 (county) · January 2026 (state) · December 2025 (retailers)"
          cadence="Annual (county) · Monthly (state) · Quarterly (retailers)"
          dataKind="measured"
        />
      </div>
    </Layout>
  );
}
