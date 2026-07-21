import { Link } from "react-router-dom";
import { ArrowRight, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { WEEKLY_INSIGHTS, type WeeklyInsight } from "@/data/insights";
import { DATA_STORIES, type DataStory } from "@/data/data-stories";

export interface RelatedFinding {
  key: string;
  text: string;
  source: string;
  href: string;
  /** true when the finding names this county directly. */
  countySpecific: boolean;
}

/**
 * Pick the findings and stories most relevant to a county: everything
 * that names the county directly, topped up with at most `statewideLimit`
 * statewide items so every county page has something to show.
 */
export function selectRelatedFindings(
  countyName: string,
  statewideLimit = 2,
  insights: readonly WeeklyInsight[] = WEEKLY_INSIGHTS,
  stories: readonly DataStory[] = DATA_STORIES,
): RelatedFinding[] {
  const fromInsights: RelatedFinding[] = insights.map((i) => ({
    key: `insight-${i.week}`,
    text: i.text,
    source: i.source,
    href: i.href,
    countySpecific: i.counties?.includes(countyName) ?? false,
  }));
  const fromStories: RelatedFinding[] = stories.map((s) => ({
    key: `story-${s.id}`,
    text: s.hook,
    source: s.source,
    href: s.href,
    countySpecific: s.counties?.includes(countyName) ?? false,
  }));

  const all = [...fromInsights, ...fromStories];
  const specific = all.filter((f) => f.countySpecific);
  const statewide = all.filter((f) => !f.countySpecific).slice(0, statewideLimit);
  return [...specific, ...statewide].slice(0, 4);
}

/**
 * "Related findings" cross-links for a county page: curated insights and
 * data stories placed next to the county's own numbers, so the narrative
 * layer is discoverable from the primary user journey.
 */
export default function CountyInsightLinks({ countyName }: { countyName: string }) {
  const findings = selectRelatedFindings(countyName);
  if (findings.length === 0) return null;

  return (
    <section className="space-y-3" aria-labelledby="related-findings-heading">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-michigan-gold-deep" aria-hidden="true" />
        <h2 id="related-findings-heading" className="text-lg font-bold text-foreground">
          Related findings
        </h2>
        <Link
          to="/insights"
          className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          All insights
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {findings.map((f) => (
          <Link key={f.key} to={f.href} className="block group h-full">
            <Card className="h-full">
              <CardContent className="py-3 space-y-2">
                {f.countySpecific && (
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-michigan-teal-deep">
                    {countyName} County
                  </p>
                )}
                <p className="text-sm font-medium text-foreground leading-snug">{f.text}</p>
                <p className="flex items-center justify-between text-[10px] text-muted-foreground">
                  Source: {f.source}
                  <ArrowRight
                    className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-hidden="true"
                  />
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
