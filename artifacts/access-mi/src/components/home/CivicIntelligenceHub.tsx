import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Building2,
  Download,
  FileSearch,
  HeartPulse,
  Layers3,
  MapPinned,
  ShieldCheck,
} from "lucide-react";
import InsightSummary from "@/components/home/InsightSummary";
import InsightNarrative from "@/components/home/InsightNarrative";
import TrendExplorer from "@/components/home/TrendExplorer";
import ResearchModeToggle from "@/components/home/ResearchModeToggle";
import CountySelector from "@/components/shared/CountySelector";
import HealthDataSnapshot from "@/components/home/HealthDataSnapshot";
import { useCounty } from "@/contexts/CountyContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  EXPLORATION_QUESTIONS,
  MICHIGAN_DATA_STORY,
  MICHIGAN_INTELLIGENCE_FEED,
  MICHIGAN_AVERAGES,
  buildHealthWatchlists,
  getCountyIntelligence,
  getPolicySignal,
  type ExplorationQuestion,
  type PolicySignal,
} from "@/data/michigan-intelligence";

const CountyChoropleth = lazy(() => import("@/components/dashboard/CountyChoropleth"));
const CountyCompare = lazy(() => import("@/components/dashboard/CountyCompare"));
const EnergyBurdenMap = lazy(() => import("@/components/dashboard/EnergyBurdenMap"));

const signalTone: Record<PolicySignal, string> = {
  "Rising Risk": "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300",
  Improving: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300",
  Stable: "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
  Critical: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300",
};

const EXPLORATION_HISTORY_KEY = "mi-access-exploration-history";

type ExplorationHistoryItem =
  | { type: "county"; value: string }
  | { type: "question"; value: ExplorationQuestion["id"] };

const layerCards = [
  {
    id: "disease",
    title: "Disease prevalence",
    description: "Scan county risk patterns to find where chronic disease burdens are clustering.",
  },
  {
    id: "access",
    title: "Healthcare access",
    description: "Use county search and comparison to spot thin primary care markets and coverage gaps.",
  },
  {
    id: "environment",
    title: "Environmental exposure",
    description: "Open energy burden and exposure overlays to understand where environmental risk compounds health risk.",
  },
  {
    id: "disparities",
    title: "Disparities",
    description: "Jump from statewide signals to equity scorecards and county-level gaps.",
  },
];

function renderSignalBadge(signal: PolicySignal) {
  return <Badge className={signalTone[signal]}>{signal}</Badge>;
}

export default function CivicIntelligenceHub() {
  const { county, setCounty, countyLabel } = useCounty();
  const [activeQuestion, setActiveQuestion] = useState<ExplorationQuestion["id"]>("life-expectancy");
  const [activeStoryStep, setActiveStoryStep] = useState(0);
  const [researchMode, setResearchMode] = useState(false);
  const [explorationHistory, setExplorationHistory] = useState<ExplorationHistoryItem[]>([]);
  const selectedCounty = county ?? "Oakland";

  useEffect(() => {
    try {
      const stored = localStorage.getItem(EXPLORATION_HISTORY_KEY);
      if (stored) {
        setExplorationHistory(JSON.parse(stored) as ExplorationHistoryItem[]);
      }
    } catch {
      setExplorationHistory([]);
    }
  }, []);

  useEffect(() => {
    const nextItems: ExplorationHistoryItem[] = [];
    if (county) nextItems.push({ type: "county", value: county });
    nextItems.push({ type: "question", value: activeQuestion });

    setExplorationHistory((previous) => {
      const merged = [...nextItems, ...previous].filter((item, index, array) => {
        return array.findIndex((candidate) => candidate.type === item.type && candidate.value === item.value) === index;
      }).slice(0, 6);

      try {
        localStorage.setItem(EXPLORATION_HISTORY_KEY, JSON.stringify(merged));
      } catch {
        // Intentionally ignore localStorage persistence failures.
      }

      return merged;
    });
  }, [activeQuestion, county]);

  const selectedCountyIntelligence = useMemo(() => getCountyIntelligence(selectedCounty), [selectedCounty]);
  const watchlists = useMemo(() => buildHealthWatchlists(), []);
  const activeQuestionData = useMemo(
    () => EXPLORATION_QUESTIONS.find((question) => question.id === activeQuestion) ?? EXPLORATION_QUESTIONS[0],
    [activeQuestion],
  );

  const localMetrics = useMemo(() => {
    return [
      {
        label: "Population",
        value: selectedCountyIntelligence.population.toLocaleString(),
        description: "Residents in the county profile.",
        signal: getPolicySignal(undefined),
      },
      {
        label: "Life expectancy",
        value: `${selectedCountyIntelligence.lifeExpectancy.toFixed(1)} years`,
        description: `${(selectedCountyIntelligence.lifeExpectancy - MICHIGAN_AVERAGES.lifeExpectancy).toFixed(1)} vs. Michigan average.`,
        signal: selectedCountyIntelligence.lifeExpectancy < MICHIGAN_AVERAGES.lifeExpectancy ? "Critical" : "Improving",
      },
      {
        label: "Insurance coverage",
        value: `${selectedCountyIntelligence.insuranceRate.toFixed(1)}%`,
        description: `${(selectedCountyIntelligence.insuranceRate - MICHIGAN_AVERAGES.insuranceRate).toFixed(1)} vs. Michigan average.`,
        signal: selectedCountyIntelligence.insuranceRate < MICHIGAN_AVERAGES.insuranceRate ? "Rising Risk" : "Improving",
      },
      {
        label: "Primary care",
        value: selectedCountyIntelligence.primaryCareRatio,
        description: `${selectedCountyIntelligence.mentalHealthAccess}% mental health access index.`,
        signal: getPolicySignal(
          selectedCountyIntelligence.primaryCareRatio === "-" ? "stable" : undefined,
          selectedCountyIntelligence.erVisitRate > MICHIGAN_AVERAGES.erVisitRate,
        ),
      },
      {
        label: "Food insecurity",
        value: selectedCountyIntelligence.foodInsecurity,
        description: "Share of residents facing food access pressure.",
        signal: getPolicySignal(
          selectedCountyIntelligence.foodInsecurity === "-" ? "stable" : undefined,
          Number.parseFloat(selectedCountyIntelligence.foodInsecurity) >= 16,
        ),
      },
    ] as const;
  }, [selectedCountyIntelligence]);

  return (
    <>
      <InsightSummary />

      <section id="exploration" className="py-14 bg-background" aria-labelledby="exploration-title">
        <div className="container max-w-6xl space-y-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <Badge variant="outline" className="text-[10px] uppercase tracking-[0.2em]">
                Exploration
              </Badge>
              <h2 id="exploration-title" className="text-2xl font-bold text-foreground">
                Ask the question first, then open the right visualization
              </h2>
              <p className="text-base leading-7 text-muted-foreground">
                This layer reorganizes the health dashboard into guided questions so residents, journalists, and planners
                can understand the signal before they drop into the full data stack.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/70 px-4 py-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">What would you like to understand?</p>
              <p className="mt-1">{activeQuestionData.prompt}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {EXPLORATION_QUESTIONS.map((question) => (
              <Button
                key={question.id}
                variant={question.id === activeQuestion ? "default" : "outline"}
                className="whitespace-normal text-left"
                onClick={() => setActiveQuestion(question.id)}
              >
                {question.question}
              </Button>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
            <div className="space-y-6">
              {activeQuestion === "life-expectancy" ? (
                <>
                  <TrendExplorer />
                  <InsightNarrative
                    title="Why life expectancy still feels fragile"
                    summary="Michigan has recovered some ground since the sharp post-2019 drop, but communities with weaker primary care access and higher chronic disease burdens have not recovered evenly."
                    explanation="The trend explorer combines statewide health signals to show how chronic disease and access moved together over time. Use county selection below to compare your community’s current baseline against the statewide pattern."
                    source="CDC BRFSS · MDHHS Vital Records · CMS"
                  />
                </>
              ) : null}

              {activeQuestion === "care-deserts" ? (
                <>
                  <InsightNarrative
                    title="Where healthcare deserts are forming"
                    summary="Counties with the weakest primary care ratios and lower insurance coverage tend to experience the highest emergency visit rates and longer travel burdens for care."
                    explanation="Use the county heatmap to scan for areas with elevated need, then compare counties or generate a county brief to understand specific service gaps."
                    source="County Health Rankings · CMS Provider Data · HRSA"
                  />
                  <Suspense fallback={<div className="h-48 animate-pulse rounded-2xl bg-muted/50" />}>
                    <CountyChoropleth compact={false} highlightCounty={selectedCounty} />
                  </Suspense>
                </>
              ) : null}

              {activeQuestion === "diabetes" ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {watchlists.diabetes.map((item, index) => (
                    <Card key={item.county} className="border-border/60 bg-card/80">
                      <CardContent className="space-y-3 p-5">
                        <Badge variant="outline">#{index + 1} fastest rising</Badge>
                        <div>
                          <p className="text-lg font-semibold text-foreground">{item.county} County</p>
                          <p className="text-sm text-muted-foreground">{item.note}</p>
                        </div>
                        <p className="text-3xl font-bold tabular-nums text-foreground">{item.value}</p>
                        {renderSignalBadge("Rising Risk")}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : null}

              {activeQuestion === "disparities" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      title: "Income disparity",
                      body: "Lower-income communities face steeper food insecurity and delayed care, even when statewide averages improve.",
                    },
                    {
                      title: "Race and ethnicity",
                      body: "Mortality and maternal health gaps remain much wider for Black residents than statewide averages suggest.",
                    },
                    {
                      title: "Rural vs. urban",
                      body: "Rural counties often carry the highest primary care ratios and longest care journeys.",
                    },
                    {
                      title: "Insurance status",
                      body: "Coverage gains help, but underinsurance still leaves many communities exposed to unstable care access.",
                    },
                  ].map((card) => (
                    <Card key={card.title} className="border-border/60 bg-card/80">
                      <CardContent className="space-y-3 p-5">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-lg font-semibold text-foreground">{card.title}</h3>
                          {renderSignalBadge("Critical")}
                        </div>
                        <p className="text-sm leading-6 text-muted-foreground">{card.body}</p>
                        <Button asChild variant="ghost" size="sm" className="px-0">
                          <Link to="/equity">
                            Open Equity Explorer <ArrowRight className="ml-1 h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="space-y-4">
              <Card className="border-border/60 bg-card/80">
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <p className="font-semibold text-foreground">Guided data story</p>
                  </div>
                  <div className="space-y-2">
                    {MICHIGAN_DATA_STORY.map((step, index) => (
                      <button
                        key={step.title}
                        type="button"
                        onClick={() => setActiveStoryStep(index)}
                        className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                          index === activeStoryStep
                            ? "border-primary/40 bg-primary/5"
                            : "border-border/60 bg-background hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Step {index + 1}</Badge>
                          <span className="font-medium text-foreground">{step.title}</span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{step.detail}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card/80">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    <p className="font-semibold text-foreground">Curiosity hooks</p>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>Which county improved the most?</p>
                    <p>Where is diabetes actually declining?</p>
                    <p>What changed most after 2019?</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card/80">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-center gap-2">
                    <FileSearch className="h-4 w-4 text-primary" />
                    <p className="font-semibold text-foreground">Latest insights</p>
                  </div>
                  <div className="space-y-3">
                    {MICHIGAN_INTELLIGENCE_FEED.map((item) => (
                      <Link key={item.title} to={item.href} className="block rounded-xl border border-border/60 bg-background p-3 transition-colors hover:bg-muted/40">
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">{item.month}</p>
                        <p className="mt-1 font-semibold text-foreground">{item.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{item.summary}</p>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <HealthDataSnapshot />
        </div>
      </section>

      <section id="local-intelligence" className="py-14 bg-muted/20 border-y border-border/40" aria-labelledby="local-intelligence-title">
        <div className="container max-w-6xl space-y-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <Badge variant="outline" className="text-[10px] uppercase tracking-[0.2em]">
                Local Intelligence
              </Badge>
              <h2 id="local-intelligence-title" className="text-2xl font-bold text-foreground">
                Select your county and localize the entire intelligence layer
              </h2>
              <p className="text-base leading-7 text-muted-foreground">
                Prompt people into local context immediately, then show how their county compares with Michigan averages and where to go next.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Select your county</p>
              <CountySelector variant="compact" />
            </div>
          </div>

          <Card className="border-border/60 bg-card/80">
            <CardContent className="space-y-4 p-5">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{county ? countyLabel : "Michigan default county view"}</p>
                  <h3 className="text-lg font-semibold text-foreground">{selectedCounty} County Health Intelligence</h3>
                  <p className="text-sm text-muted-foreground">
                    Population {selectedCountyIntelligence.population.toLocaleString()} · {selectedCountyIntelligence.majorCities.slice(0, 3).join(", ")}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/brief?county=${selectedCounty}`}>
                    Generate county report <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>

              <motion.div
                key={selectedCounty}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-3 md:grid-cols-2 xl:grid-cols-5"
              >
                {localMetrics.map((metric) => (
                  <Card key={metric.label} className="border-border/60 bg-background/85 shadow-sm">
                    <CardContent className="space-y-3 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="cursor-help text-sm font-medium text-foreground underline decoration-dotted underline-offset-4">
                              {metric.label}
                            </p>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs text-xs">{metric.description}</TooltipContent>
                        </Tooltip>
                        {renderSignalBadge(metric.signal)}
                      </div>
                      <p className="text-3xl font-bold tabular-nums text-foreground">{metric.value}</p>
                      <p className="text-xs text-muted-foreground">{metric.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>

              <InsightNarrative
                title={`Why ${selectedCounty} stands out`}
                summary={`${selectedCounty} County combines ${selectedCountyIntelligence.primaryCareRatio} primary care capacity with ${selectedCountyIntelligence.foodInsecurity} food insecurity and ${selectedCountyIntelligence.erVisitRate} emergency visits per 100k residents, making it easier to compare local strain with statewide averages.`}
                explanation="County cards use the public county profile dataset already in Access Michigan, then add statewide comparison signals so people can interpret whether a county is improving, steady, or under pressure."
                source="County Health Rankings & Roadmaps, 2025 edition · Census ACS 2023"
              />
            </CardContent>
          </Card>

          <Tabs defaultValue="disease" className="space-y-4">
            <TabsList className="grid h-auto grid-cols-2 gap-2 bg-transparent p-0 lg:grid-cols-4">
              {layerCards.map((layer) => (
                <TabsTrigger key={layer.id} value={layer.id} className="rounded-xl border border-border/60 bg-card/80 px-4 py-3 data-[state=active]:border-primary/40 data-[state=active]:bg-primary/5">
                  {layer.title}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="disease">
              <Suspense fallback={<div className="h-48 animate-pulse rounded-2xl bg-muted/50" />}>
                <CountyChoropleth highlightCounty={selectedCounty} />
              </Suspense>
            </TabsContent>
            <TabsContent value="access">
              <InsightNarrative
                title="Healthcare access overlay"
                summary="The county map and compare tools surface where coverage, provider supply, and emergency care dependence are moving out of balance."
                explanation="Use the metric selector in the county heatmap to switch between uninsured rate, food insecurity, and primary care ratio. Then compare counties side by side in the decision tools layer."
                source="County Health Rankings · CMS Provider Data"
              />
            </TabsContent>
            <TabsContent value="environment">
              <Suspense fallback={<div className="h-48 animate-pulse rounded-2xl bg-muted/50" />}>
                <EnergyBurdenMap compact />
              </Suspense>
            </TabsContent>
            <TabsContent value="disparities">
              <InsightNarrative
                title="Disparities layer"
                summary="Equity gaps are most useful when paired with county context, not hidden in a separate research workflow."
                explanation="Open the equity scorecard to explore the largest gaps by race, income, and rurality, then return to county intelligence cards to see which places warrant deeper attention."
                source="CDC WONDER · MDHHS · County Health Rankings"
              />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section id="decision-tools" className="py-14 bg-background" aria-labelledby="decision-tools-title">
        <div className="container max-w-6xl space-y-8">
          <div className="max-w-3xl space-y-3">
            <Badge variant="outline" className="text-[10px] uppercase tracking-[0.2em]">
              Decision Tools
            </Badge>
            <h2 id="decision-tools-title" className="text-2xl font-bold text-foreground">
              Move from insight to comparison, watchlists, and action
            </h2>
            <p className="text-base leading-7 text-muted-foreground">
              Keep the platform usable for civic organizations and strategists by surfacing the highest-need counties, county comparison, and direct action links without removing the existing routes.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {[
              {
                title: "Fastest rising diabetes",
                items: watchlists.diabetes.map((item) => `${item.county} County · ${item.value}`),
              },
              {
                title: "Lowest insurance coverage",
                items: watchlists.uninsured.map((item) => `${item.county} County · ${(100 - item.uninsured).toFixed(1)}% insured`),
              },
              {
                title: "Primary care deserts",
                items: watchlists.primaryCare.map((item) => `${item.county} County · ${item.primaryCareRatio.toLocaleString()}:1`),
              },
            ].map((watchlist) => (
              <Card key={watchlist.title} className="border-border/60 bg-card/80">
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-foreground">{watchlist.title}</p>
                    {renderSignalBadge("Rising Risk")}
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {watchlist.items.map((item) => (
                      <div key={item} className="rounded-xl border border-border/60 bg-background px-3 py-2">
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Suspense fallback={<div className="h-48 animate-pulse rounded-2xl bg-muted/50" />}>
            <CountyCompare />
          </Suspense>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                icon: HeartPulse,
                title: "Find care",
                body: "Open local health resources and county profiles.",
                href: county ? `/county/${county.toLowerCase().replace(/[.\s]+/g, "-")}` : "/data",
              },
              {
                icon: Building2,
                title: "Local programs",
                body: "Review county guides and resource finders.",
                href: county ? `/brief?county=${county}` : "/brief",
              },
              {
                icon: Download,
                title: "Community reports",
                body: "Generate a downloadable brief for county, city, or ZIP.",
                href: county ? `/brief?county=${county}` : "/brief",
              },
              {
                icon: MapPinned,
                title: "Research pathways",
                body: "Continue exploring through dashboards and compare pages.",
                href: "/data-and-insights",
              },
            ].map((action) => (
              <Card key={action.title} className="border-border/60 bg-card/80">
                <CardContent className="space-y-3 p-5">
                  <action.icon className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">{action.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{action.body}</p>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="px-0">
                    <Link to={action.href}>
                      Open <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {explorationHistory.length > 0 ? (
            <Card className="border-border/60 bg-card/80">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center gap-2">
                  <Layers3 className="h-4 w-4 text-primary" />
                  <p className="font-semibold text-foreground">Recently viewed</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {explorationHistory.map((item) => (
                    <Button
                      key={`${item.type}-${item.value}`}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (item.type === "county") {
                          setCounty(item.value as typeof county);
                          return;
                        }
                        setActiveQuestion(item.value);
                      }}
                    >
                      {item.type === "county"
                        ? `${item.value} County`
                        : EXPLORATION_QUESTIONS.find((question) => question.id === item.value)?.question}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </section>

      <section id="research-access" className="py-14 bg-slate-950 text-white" aria-labelledby="research-access-title">
        <div className="container max-w-6xl space-y-8">
          <div className="max-w-3xl space-y-3">
            <Badge variant="outline" className="border-white/20 text-slate-200">
              Research Access
            </Badge>
            <h2 id="research-access-title" className="text-2xl font-bold">
              Keep research depth one toggle away
            </h2>
            <p className="text-base leading-7 text-slate-300">
              The upgraded experience keeps simple interpretation in front while exposing methodology, downloads, and API routes for researchers and policy teams.
            </p>
          </div>

          <ResearchModeToggle checked={researchMode} onCheckedChange={setResearchMode} />

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-white/10 bg-white/5 text-white">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-cyan-300" />
                  <p className="font-semibold">Trust before interaction</p>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="source">
                    <AccordionTrigger>Source and update cadence</AccordionTrigger>
                    <AccordionContent className="text-sm text-slate-300">
                      Public datasets from MDHHS, CMS, HRSA, CDC, Census, and County Health Rankings. Most indicators update annually; telehealth and service access indicators refresh when the upstream sources refresh.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="methodology">
                    <AccordionTrigger>Methodology and interpretation</AccordionTrigger>
                    <AccordionContent className="text-sm text-slate-300">
                      Access Michigan presents aggregate county and statewide indicators. Visual signals summarize relative change and comparison to statewide baselines; they do not replace the official source methodology.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="limitations">
                    <AccordionTrigger>Limitations</AccordionTrigger>
                    <AccordionContent className="text-sm text-slate-300">
                      County-level averages can hide neighborhood variation, and some indicators update at different intervals. Use research mode to inspect source pathways before making high-stakes policy decisions.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/5 text-white">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-cyan-300" />
                  <p className="font-semibold">Research tools</p>
                </div>
                <div className="grid gap-3">
                  {[
                    { title: "CSV downloads", body: "Open the data hub for county exports and statewide downloads.", href: "/data-and-insights" },
                    { title: "API endpoints", body: "Use the data hub to access API-friendly endpoints and source documentation.", href: "/data-and-insights" },
                    { title: "Methodology", body: "Inspect methods, update cadence, and limitations.", href: "/methodology" },
                    { title: "Compare and brief tools", body: "Generate county reports or compare counties side by side.", href: "/compare" },
                  ].map((item) => (
                    <Link key={item.title} to={item.href} className="rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10">
                      <p className="font-medium text-white">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-300">{item.body}</p>
                      {researchMode ? (
                        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-cyan-200">Research view enabled</p>
                      ) : null}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
