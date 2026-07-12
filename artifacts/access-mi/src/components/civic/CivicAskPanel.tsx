import { useState, useRef, useEffect } from "react";
import {
  Search,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { IntegrityBadge } from "@/components/chna/IntegrityBadge";
import {
  queryCivicData,
  type CivicAnswer,
  type CivicDataPoint,
} from "@/lib/civicQueryEngine";

const SAMPLE_QUESTIONS = [
  "What is driving food insecurity in Wayne County?",
  "How does Alcona County's healthcare access compare to the state?",
  "What is the unemployment rate in Genesee County?",
  "What are the chronic disease rates in Washtenaw County?",
  "How severe is the provider shortage in Huron County?",
];

function ConfidenceBadge({ level }: { level: CivicAnswer["confidence"] }) {
  if (level === "none") return null;
  const map = {
    high: {
      text: "High coverage",
      className: "bg-emerald-100 text-emerald-800",
    },
    medium: { text: "Partial data", className: "bg-sky-100 text-sky-800" },
    thin: { text: "Limited data", className: "bg-amber-100 text-amber-800" },
  } as const;
  const { text, className } = map[level];
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-medium rounded-full px-2 py-0.5 ${className}`}
    >
      <ShieldCheck className="h-3 w-3" />
      {text}
    </span>
  );
}

function DataPointCard({ point }: { point: CivicDataPoint }) {
  return (
    <div
      className="rounded-lg border border-border bg-card p-3"
      data-civic-data-point
    >
      <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">
        {point.label}
      </p>
      <p className="text-xl font-bold text-foreground leading-none mb-2">
        {point.value}
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        <IntegrityBadge
          label={point.valueLabel}
          source={point.source}
          vintage={point.vintage}
        />
        <span className="text-[10px] text-muted-foreground truncate max-w-[160px]">
          {point.source} · {point.vintage}
        </span>
      </div>
      {point.note && (
        <p className="mt-1.5 text-[11px] text-muted-foreground italic">
          {point.note}
        </p>
      )}
    </div>
  );
}

interface Props {
  initialQuestion?: string;
  compact?: boolean;
}

export function CivicAskPanel({ initialQuestion, compact = false }: Props) {
  const [query, setQuery] = useState(initialQuestion ?? "");
  const [answer, setAnswer] = useState<CivicAnswer | null>(null);
  const [loading, setLoading] = useState(false);
  const answerRef = useRef<HTMLDivElement>(null);

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    // queryCivicData is synchronous (all data is on-site), but we yield
    // to the event loop so the loading state renders before the heavy work.
    setTimeout(() => {
      setAnswer(queryCivicData(q));
      setLoading(false);
    }, 0);
  }

  useEffect(() => {
    if (answer && answerRef.current) {
      answerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [answer]);

  function handleSuggestion(q: string) {
    setQuery(q);
    setLoading(true);
    setTimeout(() => {
      setAnswer(queryCivicData(q));
      setLoading(false);
    }, 0);
  }

  return (
    <Card className="overflow-hidden border-primary/20 shadow-md">
      <CardHeader className="bg-gradient-to-r from-primary/8 to-michigan-blue/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-gradient-michigan flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-base">Civic Intelligence</CardTitle>
            <p className="text-xs text-muted-foreground">
              Ask about any of the 83 Michigan counties - answers come only from
              on-site verified data.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. What is driving food insecurity in Wayne County?"
            className="flex-1 text-sm"
            aria-label="Civic intelligence question"
            maxLength={300}
          />
          <Button
            type="submit"
            size="sm"
            disabled={loading || !query.trim()}
            className="bg-gradient-michigan hover:opacity-90 flex-shrink-0"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Button>
        </form>

        {!answer && !loading && (
          <div className="space-y-2">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
              Try asking
            </p>
            <div className="flex flex-col gap-1.5">
              {SAMPLE_QUESTIONS.slice(0, compact ? 3 : 5).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSuggestion(q)}
                  className="text-left text-xs text-primary hover:underline flex items-start gap-1 group"
                >
                  <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Looking up on-site data...
          </div>
        )}

        {answer && !loading && (
          <div ref={answerRef} className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground flex-1">
                {answer.headline}
              </h3>
              <ConfidenceBadge level={answer.confidence} />
              {answer.county && (
                <Badge variant="outline" className="text-[10px]">
                  {answer.county} County
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {answer.narrative}
            </p>

            {answer.confidence === "none" && (
              <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{answer.narrative}</span>
              </div>
            )}

            {answer.dataPoints.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {answer.dataPoints.map((dp, i) => (
                  <DataPointCard key={i} point={dp} />
                ))}
              </div>
            )}

            {answer.suggestions.length > 0 && (
              <div className="pt-1 border-t border-border/50">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1.5">
                  Follow-up questions
                </p>
                <div className="flex flex-col gap-1">
                  {answer.suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSuggestion(s)}
                      className="text-left text-xs text-primary hover:underline flex items-start gap-1 group"
                    >
                      <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-[10px] text-muted-foreground italic border-t border-border/50 pt-2 leading-relaxed">
              {answer.disclaimer}
            </p>

            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2"
              onClick={() => setAnswer(null)}
            >
              Ask another question
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
