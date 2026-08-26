import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  MapPinned,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProvenanceTag } from "@/components/shared/ProvenanceTag";
import { InsightShareCard } from "@/components/opportunity/InsightShareCard";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  OPPORTUNITY_LENSES,
  getOpportunityInsights,
  type OpportunityInsight,
  type OpportunityPlace,
} from "@/data/opportunityAtlas";
import {
  resolveOpportunityPlace,
  resolveOpportunityPlaceId,
} from "@/lib/opportunityPlaceResolver";
import { getCurrentOpportunityActions } from "@/lib/opportunityActions";
import {
  buildOpportunityUrl,
  parseOpportunityState,
} from "@/lib/opportunityState";
import { trackOpportunityEvent } from "@/lib/opportunityAnalytics";
import {
  getOpportunityPlaceChanges,
  listSavedOpportunityPlaces,
  removeOpportunityPlace,
  saveOpportunityPlace,
  type SavedOpportunityPlace,
} from "@/lib/opportunityWatchlist";

const STATUS_COPY = {
  live: "Live in AccessMI",
  "ingestion-pending": "Primary source published · AccessMI ingestion pending",
  "permission-review": "Source available · redistribution permission review",
} as const;

function SearchForm({
  label,
  initialValue = "",
  onResolve,
}: {
  label: string;
  initialValue?: string;
  onResolve: (place: OpportunityPlace) => void;
}) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const place = resolveOpportunityPlace(value);
    if (!place) {
      setError(
        "Enter a Michigan county, supported city, or 5-digit Michigan ZIP. Raw street addresses are intentionally not stored or resolved in this version.",
      );
      return;
    }
    setError(null);
    onResolve(place);
  };

  return (
    <form onSubmit={submit} className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Detroit, Wayne County, or 48201"
          aria-label={label}
          className="min-h-11"
        />
        <Button type="submit" className="min-h-11 gap-1.5">
          <Search className="h-4 w-4" aria-hidden="true" />
          Explore
        </Button>
      </div>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </form>
  );
}

function ComparisonTable({
  leftPlace,
  leftInsights,
  rightPlace,
  rightInsights,
}: {
  leftPlace: OpportunityPlace;
  leftInsights: OpportunityInsight[];
  rightPlace: OpportunityPlace;
  rightInsights: OpportunityInsight[];
}) {
  const rows = leftInsights.flatMap((left) => {
    const right = rightInsights.find((item) => item.metricId === left.metricId);
    return right ? [{ left, right }] : [];
  });

  if (!rows.length) return null;
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-[620px] text-sm">
        <caption className="sr-only">
          Source-aligned comparison between {leftPlace.label} and {rightPlace.label}
        </caption>
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="p-3 font-semibold">Measure</th>
            <th className="p-3 font-semibold">{leftPlace.label}</th>
            <th className="p-3 font-semibold">{rightPlace.label}</th>
            <th className="p-3 font-semibold">Source</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ left, right }) => (
            <tr key={left.metricId} className="border-t border-border align-top">
              <th className="p-3 text-left font-medium">{left.title}</th>
              <td className="p-3 font-semibold">{left.displayValue}</td>
              <td className="p-3 font-semibold">{right.displayValue}</td>
              <td className="p-3 text-muted-foreground">
                {left.source}
                <div className="mt-1 text-xs">{left.vintage}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function OpportunityAtlasPage() {
  usePageMeta({
    title: "Community Opportunity Atlas — Access Michigan",
    description:
      "Find what stands out in a Michigan community, trace every figure to its source, compare places, find current action pathways, and share the exact finding.",
    path: "/opportunity",
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const parsedState = useMemo(
    () => parseOpportunityState(searchParams),
    [searchParams],
  );
  const place = parsedState
    ? resolveOpportunityPlaceId(parsedState.placeId)
    : null;
  const comparePlace = parsedState?.comparePlaceId
    ? resolveOpportunityPlaceId(parsedState.comparePlaceId)
    : null;
  const insights = useMemo(
    () => (place ? getOpportunityInsights(place) : []),
    [place?.id],
  );
  const compareInsights = useMemo(
    () => (comparePlace ? getOpportunityInsights(comparePlace) : []),
    [comparePlace?.id],
  );
  const [saved, setSaved] = useState<SavedOpportunityPlace[]>([]);

  useEffect(() => {
    setSaved(listSavedOpportunityPlaces());
  }, []);

  useEffect(() => {
    if (!place) return;
    trackOpportunityEvent("opportunity_place_selected", {
      geography_type: place.geographyType,
      place_id: place.id,
    });
  }, [place?.id]);

  const savedCurrent = place
    ? saved.find((item) => item.placeId === place.id) ?? null
    : null;
  const changes = savedCurrent
    ? getOpportunityPlaceChanges(savedCurrent, insights)
    : [];
  const domains = Array.from(new Set(insights.map((insight) => insight.domain)));
  const actions = getCurrentOpportunityActions([
    ...domains,
    "food",
    "greenery",
    "parks",
  ]);

  const selectPlace = (next: OpportunityPlace) => {
    const params = new URLSearchParams();
    params.set("place", next.id);
    setSearchParams(params);
  };

  const selectCompare = (next: OpportunityPlace) => {
    if (!place) return;
    const params = new URLSearchParams(searchParams);
    params.set("place", place.id);
    params.set("compare", next.id);
    setSearchParams(params);
    trackOpportunityEvent("opportunity_compare_started", {
      geography_type: place.geographyType,
      place_id: place.id,
    });
  };

  const focusLens = (lensId: string) => {
    if (!place) return;
    const params = new URLSearchParams(searchParams);
    params.set("place", place.id);
    params.set("lens", lensId);
    setSearchParams(params);
    trackOpportunityEvent("opportunity_lens_viewed", {
      geography_type: place.geographyType,
      place_id: place.id,
      lens_id: lensId,
    });
  };

  const toggleSaved = () => {
    if (!place) return;
    if (savedCurrent) {
      setSaved(removeOpportunityPlace(place.id));
      trackOpportunityEvent("opportunity_place_removed", {
        geography_type: place.geographyType,
        place_id: place.id,
      });
    } else {
      setSaved(saveOpportunityPlace(place, insights));
      trackOpportunityEvent("opportunity_place_saved", {
        geography_type: place.geographyType,
        place_id: place.id,
      });
    }
  };

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Explore", href: "/explore" }, { label: "Opportunity Atlas" }]} />
      <main className="container max-w-6xl py-8 sm:py-12">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)] lg:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <MapPinned className="h-4 w-4" aria-hidden="true" />
              Michigan · place-first civic intelligence
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              What stands out in your community?
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Start with a Michigan place, not a dataset. AccessMI shows a short source-backed local brief, explains the comparison math, connects gaps to current avenues for action, and makes each finding shareable.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <SearchForm label="Explore a Michigan place" onResolve={selectPlace} />
            <p className="mt-3 flex gap-2 text-xs leading-relaxed text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              Search text is not placed in analytics or saved. Shared URLs use canonical public geography IDs only.
            </p>
          </div>
        </section>

        {!place ? (
          <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Atlas principles">
            {[
              ["See the signal", "A short brief first; advanced source layers second."],
              ["Know the geography", "County, tract, block-group, and walkshed measures stay labeled at their native resolution."],
              ["Trace the evidence", "VERIFIED, MODELED, PROJECTED, or PENDING follows every claim."],
              ["Move toward action", "Current programs and funding are separated from observed conditions."],
            ].map(([title, body]) => (
              <div key={title} className="rounded-xl border border-border bg-card p-5">
                <h2 className="font-semibold text-foreground">{title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </section>
        ) : (
          <>
            <section className="mt-10 rounded-2xl border border-border bg-muted/25 p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Local Gap Brief
                  </p>
                  <h2 className="mt-1 font-display text-3xl font-bold text-foreground">
                    {place.label}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                    {place.resolutionNote}
                  </p>
                </div>
                <Button variant={savedCurrent ? "secondary" : "outline"} onClick={toggleSaved} className="gap-1.5">
                  {savedCurrent ? (
                    <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Bookmark className="h-4 w-4" aria-hidden="true" />
                  )}
                  {savedCurrent ? "Following" : "Follow this place"}
                </Button>
              </div>
              {savedCurrent ? (
                <div className="mt-4 rounded-lg border border-border bg-background p-3 text-sm">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    Source-change watch
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {changes.length
                      ? `${changes.length} saved metric snapshot${changes.length === 1 ? " has" : "s have"} changed in value or vintage since this place was last saved. This is a source update signal, not a causal or statistical-significance claim.`
                      : "No saved metric value or vintage has changed since this place was last saved."}
                  </p>
                  {changes.length ? (
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-1 h-auto px-0"
                      onClick={() => setSaved(saveOpportunityPlace(place, insights))}
                    >
                      Mark current source snapshot as reviewed
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </section>

            <section className="mt-8" aria-labelledby="brief-findings-heading">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    01 · What stands out
                  </p>
                  <h2 id="brief-findings-heading" className="font-display text-2xl font-bold text-foreground">
                    Source-backed local signals
                  </h2>
                </div>
                <p className="max-w-xl text-xs text-muted-foreground">
                  County-context comparisons are derived percentiles and therefore MODELED. Raw source values retain their own provenance label.
                </p>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {insights.map((insight) => (
                  <div
                    key={insight.id}
                    id={`metric-${insight.metricId}`}
                    onFocus={() =>
                      trackOpportunityEvent("opportunity_metric_viewed", {
                        geography_type: place.geographyType,
                        place_id: place.id,
                        metric_id: insight.metricId,
                      })
                    }
                    className={
                      parsedState?.metricId === insight.metricId
                        ? "rounded-2xl ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : undefined
                    }
                  >
                    <InsightShareCard place={place} insight={insight} />
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-12" aria-labelledby="fine-grain-heading">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                02 · Where is the gap?
              </p>
              <h2 id="fine-grain-heading" className="mt-1 font-display text-2xl font-bold text-foreground">
                Neighborhood-resolution lenses
              </h2>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                These are the intended tract, block-group, and network-walkshed lenses. AccessMI does not substitute a coarse proxy merely to fill the map. A primary source may be available while normalized AccessMI ingestion or redistribution permission is still pending.
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {OPPORTUNITY_LENSES.map((lens) => (
                  <article
                    key={lens.id}
                    className={`rounded-xl border bg-card p-5 ${
                      parsedState?.lensId === lens.id
                        ? "border-primary ring-1 ring-primary"
                        : "border-border"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {lens.nativeResolution}
                        </p>
                        <h3 className="mt-1 text-lg font-semibold text-foreground">
                          {lens.label}
                        </h3>
                      </div>
                      <ProvenanceTag label={lens.provenanceLabel} source={lens.source} vintage={lens.vintage} />
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{lens.description}</p>
                    <p className="mt-3 rounded-lg bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
                      <span className="font-semibold text-foreground">Current state: </span>
                      {STATUS_COPY[lens.status]}. {lens.caveat}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => focusLens(lens.id)}>
                        Focus lens
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={lens.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() =>
                            trackOpportunityEvent("opportunity_source_opened", {
                              geography_type: place.geographyType,
                              place_id: place.id,
                              lens_id: lens.id,
                            })
                          }
                        >
                          Primary source <ExternalLink className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="mt-12" aria-labelledby="actions-heading">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                03 · What could change it?
              </p>
              <h2 id="actions-heading" className="mt-1 font-display text-2xl font-bold text-foreground">
                Current avenues to act
              </h2>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                Programs and financing are maintained separately from observed data. Availability does not mean a community is eligible; follow the primary program rules before acting. Date-bounded statuses are recalculated when this page loads.
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {actions.map((action) => (
                  <article key={action.id} className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                          {action.status.replace(/-/g, " ")}
                        </span>
                        <h3 className="mt-3 text-lg font-semibold text-foreground">{action.title}</h3>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{action.description}</p>
                    <dl className="mt-4 space-y-2 text-xs">
                      <div>
                        <dt className="font-semibold text-foreground">Potential actor / eligibility lane</dt>
                        <dd className="text-muted-foreground">{action.actor}</dd>
                      </div>
                      {action.opensOn ? (
                        <div><dt className="font-semibold text-foreground">Opens</dt><dd className="text-muted-foreground">{action.opensOn}</dd></div>
                      ) : null}
                      {action.closesOn ? (
                        <div><dt className="font-semibold text-foreground">Closes</dt><dd className="text-muted-foreground">{action.closesOn}</dd></div>
                      ) : null}
                      {action.recurring ? (
                        <div><dt className="font-semibold text-foreground">Cadence</dt><dd className="text-muted-foreground">{action.recurring}</dd></div>
                      ) : null}
                      <div><dt className="font-semibold text-foreground">Verified</dt><dd className="text-muted-foreground">{action.verifiedDate}</dd></div>
                    </dl>
                    <Button variant="outline" size="sm" className="mt-4" asChild>
                      <a
                        href={action.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          trackOpportunityEvent("opportunity_action_opened", {
                            geography_type: place.geographyType,
                            place_id: place.id,
                            action_id: action.id,
                          })
                        }
                      >
                        Program details <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    </Button>
                  </article>
                ))}
              </div>
            </section>

            <section className="mt-12" aria-labelledby="compare-heading">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                04 · Compare carefully
              </p>
              <h2 id="compare-heading" className="mt-1 font-display text-2xl font-bold text-foreground">
                Compare another Michigan community
              </h2>
              <div className="mt-4 max-w-xl">
                <SearchForm label="Add comparison place" onResolve={selectCompare} />
              </div>
              {comparePlace ? (
                <div className="mt-5 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    The table compares like-for-like source metrics at the same county context. It does not create a best/worst composite ranking.
                  </p>
                  <ComparisonTable
                    leftPlace={place}
                    leftInsights={insights}
                    rightPlace={comparePlace}
                    rightInsights={compareInsights}
                  />
                </div>
              ) : null}
            </section>

            <section className="mt-12 rounded-2xl border border-border bg-card p-6" aria-labelledby="saved-heading">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    05 · Return loop
                  </p>
                  <h2 id="saved-heading" className="mt-1 font-display text-2xl font-bold text-foreground">
                    Saved communities
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground">
                  Stored only on this device · clearable from “Clear my activity”
                </p>
              </div>
              {saved.length ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {saved.map((item) => {
                    const href = new URL(
                      buildOpportunityUrl({ placeId: item.placeId }),
                    );
                    return (
                      <Link
                        key={item.placeId}
                        to={`${href.pathname}${href.search}`}
                        className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <div className="font-semibold text-foreground">{item.label}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{item.countyName} County context</div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  Follow a place above to save a source snapshot for later comparison.
                </p>
              )}
            </section>
          </>
        )}

        <section className="mt-12 border-t border-border pt-8 text-sm text-muted-foreground">
          <h2 className="font-semibold text-foreground">Interpretation guardrail</h2>
          <p className="mt-2 max-w-4xl leading-relaxed">
            AccessMI separates observed source values from derived comparisons and future projections. Cross-geography summaries, percentile comparisons, and any future intervention simulation are modeling steps and must be labeled accordingly. Ecological screening data describe places and should not be used to infer an individual resident's risk or outcome.
          </p>
        </section>
      </main>
    </Layout>
  );
}
