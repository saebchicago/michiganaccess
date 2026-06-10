import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Info,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProvenanceTag } from "@/components/shared/ProvenanceTag";
import { OfficialChannelNotice } from "@/components/shared/OfficialChannelNotice";
import {
  BENEFITS_GLOSSARY,
  FPL_EFFECTIVE_YEAR,
  FPL_SOURCE_NAME,
  FPL_SOURCE_URL,
  OFFICIAL_MI_BRIDGES_URL,
  type ApplicantCondition,
} from "@/data/benefitsRules";
import { evaluatePrograms } from "@/utils/benefitsEligibility";

type Step = "size" | "income" | "conditions" | "results";

interface ConditionOption {
  value: ApplicantCondition;
  label: string;
}

const CONDITION_OPTIONS: ConditionOption[] = [
  { value: "pregnant", label: "Pregnant" },
  { value: "child_under_5", label: "Child under 5" },
  { value: "child_under_19", label: "Child under 19" },
  { value: "age_65_plus", label: "Age 65 or older" },
  { value: "disability", label: "Has a qualifying disability" },
  { value: "medicare_enrolled", label: "Enrolled in Medicare" },
];

function Acronym({ term }: { term: keyof typeof BENEFITS_GLOSSARY }) {
  const def = BENEFITS_GLOSSARY[term];
  return (
    <abbr
      title={def}
      className="cursor-help underline decoration-dotted underline-offset-2"
      aria-label={`${term}: ${def}`}
    >
      {term}
    </abbr>
  );
}

interface BenefitsScreenerProps {
  /** When true, the card uses a wider layout for the standalone hub. */
  compact?: boolean;
}

export function BenefitsScreener({ compact = false }: BenefitsScreenerProps) {
  const [step, setStep] = useState<Step>("size");
  const [householdSize, setHouseholdSize] = useState<number | null>(null);
  const [incomeInput, setIncomeInput] = useState("");
  const [conditions, setConditions] = useState<ApplicantCondition[]>([]);

  const annualIncome = useMemo(() => {
    const cleaned = incomeInput.replace(/[^0-9.]/g, "");
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  }, [incomeInput]);

  const results = useMemo(() => {
    if (householdSize == null || !incomeInput) return null;
    return evaluatePrograms({
      householdSize,
      annualIncome,
      conditions,
    });
  }, [householdSize, annualIncome, incomeInput, conditions]);

  const reset = () => {
    setStep("size");
    setHouseholdSize(null);
    setIncomeInput("");
    setConditions([]);
  };

  const toggleCondition = (c: ApplicantCondition) => {
    setConditions((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  };

  return (
    <Card id="screener" className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
          How eligibility rules work
        </CardTitle>
        <CardDescription>
          Enter household details to see what 2026 federal and Michigan income
          rules indicate. The program decides eligibility, not this page.
        </CardDescription>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Calculations happen in your browser. Nothing about your situation is
          sent anywhere or stored.
        </p>
      </CardHeader>
      <CardContent className={compact ? "" : "max-w-2xl"}>
        <AnimatePresence mode="wait">
          {step === "size" && (
            <motion.div
              key="size"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <Label className="text-sm font-semibold text-foreground">
                How many people are in your household?
              </Label>
              <p className="text-xs text-muted-foreground">
                Count everyone who lives with you and shares meals.
              </p>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <Button
                    key={n}
                    size="lg"
                    variant={householdSize === n ? "default" : "outline"}
                    className="min-h-11 min-w-11"
                    aria-pressed={householdSize === n}
                    onClick={() => {
                      setHouseholdSize(n);
                      setStep("income");
                    }}
                  >
                    {n}
                  </Button>
                ))}
                <Button
                  size="lg"
                  variant={householdSize === 9 ? "default" : "outline"}
                  className="min-h-11 px-3"
                  aria-pressed={householdSize === 9}
                  onClick={() => {
                    setHouseholdSize(9);
                    setStep("income");
                  }}
                >
                  9+
                </Button>
              </div>
            </motion.div>
          )}

          {step === "income" && (
            <motion.div
              key="income"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <Label
                htmlFor="annual-income"
                className="text-sm font-semibold text-foreground"
              >
                What is your approximate annual household income?
              </Label>
              <p className="text-xs text-muted-foreground">
                Best estimate is fine. Programs use <Acronym term="MAGI" /> or
                gross income depending on the rule.
              </p>
              <Input
                id="annual-income"
                inputMode="numeric"
                placeholder="e.g. 32000"
                value={incomeInput}
                onChange={(e) => setIncomeInput(e.target.value)}
                className="text-lg max-w-xs"
                aria-describedby="annual-income-help"
              />
              <p
                id="annual-income-help"
                className="text-[11px] text-muted-foreground"
              >
                Enter your best estimate of total household income for the year.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setStep("size")}
                  className="text-sm"
                >
                  <ArrowLeft className="mr-1 h-3 w-3" aria-hidden="true" /> Back
                </Button>
                <Button
                  onClick={() => setStep("conditions")}
                  disabled={!incomeInput || annualIncome <= 0}
                  className="text-sm"
                >
                  Next{" "}
                  <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === "conditions" && (
            <motion.div
              key="conditions"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <Label className="text-sm font-semibold text-foreground">
                Any of these apply? (optional)
              </Label>
              <p className="text-xs text-muted-foreground">
                Some programs are open only to specific groups, like pregnant
                people, children, or people enrolled in Medicare.
              </p>
              <div className="flex flex-wrap gap-2">
                {CONDITION_OPTIONS.map((c) => (
                  <Button
                    key={c.value}
                    size="sm"
                    variant={
                      conditions.includes(c.value) ? "default" : "outline"
                    }
                    className="min-h-11"
                    aria-pressed={conditions.includes(c.value)}
                    onClick={() => toggleCondition(c.value)}
                  >
                    {c.label}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setStep("income")}
                  className="text-sm"
                >
                  <ArrowLeft className="mr-1 h-3 w-3" aria-hidden="true" /> Back
                </Button>
                <Button onClick={() => setStep("results")} className="text-sm">
                  See what the rules indicate{" "}
                  <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === "results" && results && householdSize != null && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    What the rules indicate
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Household of {householdSize}, income about $
                    {annualIncome.toLocaleString()} ( roughly{" "}
                    {results.incomeAsPercentOfFpl}% of <Acronym term="FPL" />)
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={reset}
                  className="text-xs"
                >
                  <RotateCcw className="mr-1 h-3 w-3" aria-hidden="true" />{" "}
                  Start over
                </Button>
              </div>

              <div
                role="status"
                aria-live="polite"
                className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-foreground"
              >
                <p className="font-semibold">
                  This shows what the rules indicate, not a determination.
                </p>
                <p className="mt-1 text-muted-foreground">
                  Eligibility is decided by the program. To apply, use
                  Michigan's official portal (MI Bridges) or call 211.
                </p>
              </div>

              <OfficialChannelNotice variant="compact" />

              <section
                aria-labelledby="may-qualify-heading"
                className="space-y-2"
              >
                <h3
                  id="may-qualify-heading"
                  className="text-sm font-semibold text-foreground"
                >
                  Programs whose rules match this household (
                  {results.mayQualify.length})
                </h3>
                {results.mayQualify.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No programs in this list matched on income and category.
                    Programs often have exceptions and deductions, so an
                    application can still be worth filing. Call 211 to talk
                    through your situation.
                  </p>
                )}
                {results.mayQualify.map((r) => (
                  <article
                    key={r.program.id}
                    className="rounded-lg border border-border bg-background p-3"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-start gap-2 min-w-0 flex-1">
                        <CheckCircle2
                          className="mt-0.5 h-4 w-4 shrink-0 text-michigan-forest"
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">
                            {r.program.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {r.program.summary}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        Rules match
                      </Badge>
                    </div>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Estimated against {r.program.ruleLabel} for a household of{" "}
                      {householdSize}, or about $
                      {r.thresholdAnnual.toLocaleString()} per year.
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <a
                        href={OFFICIAL_MI_BRIDGES_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        Apply at Michigan's official portal (MI Bridges)
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      </a>
                      <a
                        href={r.program.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        Source ({r.program.sourceName})
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      </a>
                      <ProvenanceTag
                        label={r.program.provenance}
                        source={r.program.sourceName}
                      />
                    </div>
                  </article>
                ))}
              </section>

              <section
                aria-labelledby="may-not-qualify-heading"
                className="space-y-2"
              >
                <h3
                  id="may-not-qualify-heading"
                  className="text-sm font-semibold text-foreground"
                >
                  Above the income test or wrong category (
                  {results.mayNotQualify.length})
                </h3>
                <p className="text-xs text-muted-foreground">
                  Rules have exceptions. Several Michigan programs apply
                  deductions or categorical eligibility on top of the income
                  test, so an application can still be worth filing for
                  borderline situations.
                </p>
                {results.mayNotQualify.map((r) => (
                  <article
                    key={r.program.id}
                    className="rounded-lg border border-border bg-muted/30 p-3"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-start gap-2 min-w-0 flex-1">
                        <XCircle
                          className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {r.program.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {r.reason}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        Borderline
                      </Badge>
                    </div>
                    <a
                      href={r.program.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      Source ({r.program.sourceName})
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  </article>
                ))}
              </section>

              <div className="rounded-lg border border-border bg-background p-3 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <Info
                    className="mt-0.5 h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                  <p>
                    Need help applying? Call 211 (free) or talk to a MI Bridges
                    Navigator through Michigan's official portal. This screener
                    does not store, share, or transmit anything about you.
                    Calculations happen in your browser only.
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground">
                Income tests use the {FPL_EFFECTIVE_YEAR} HHS Federal Poverty
                Guidelines (
                <a
                  href={FPL_SOURCE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  {FPL_SOURCE_NAME}
                </a>
                ).
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
