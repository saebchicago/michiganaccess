import {
  ArrowRight,
  ExternalLink,
  TrendingUp,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ProvenanceTag } from "@/components/shared/ProvenanceTag";
import {
  ATLANTA_FED_CLIFF_URL,
  ATLANTA_FED_POLICY_RULES_URL,
} from "@/data/benefitsRules";

/**
 * Phase 4 cliff illustration. Per the project compliance frame, this
 * component does NOT model the cliff inline. It explains the concept
 * in plain language and routes the user to the Federal Reserve Bank
 * of Atlanta's CLIFF Dashboard, which is the canonical interactive
 * model. The dashboard already uses the Policy Rules Database, which
 * is the only sourced ruleset we are allowed to rely on for cliff
 * math.
 */
export function CliffExplainer() {
  return (
    <Card className="border-michigan-gold/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp
            className="h-5 w-5 text-michigan-gold"
            aria-hidden="true"
          />
          Will a raise help?
        </CardTitle>
        <CardDescription>
          A higher wage usually means more take-home pay. Sometimes it means
          losing benefits worth more than the raise. This page explains the
          trade-off and links to a calculator built by the Federal Reserve Bank
          of Atlanta.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <section aria-labelledby="cliff-what" className="space-y-2">
          <h3 id="cliff-what" className="text-sm font-semibold text-foreground">
            What is a benefits cliff?
          </h3>
          <p className="text-sm text-muted-foreground">
            A benefits cliff is when an increase in earned income causes a
            household to lose more in public benefits than it gains in wages.
            The household ends up with less total resources than before the
            raise. Cliffs typically show up around the income limits for
            Medicaid, childcare subsidies, SNAP, and housing assistance.
          </p>
        </section>

        <section aria-labelledby="cliff-real" className="space-y-2">
          <h3 id="cliff-real" className="text-sm font-semibold text-foreground">
            Why this matters
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span
                aria-hidden="true"
                className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
              />
              <span>
                A raise that pushes earned income just over the Healthy Michigan
                Plan limit can mean the difference between Medicaid coverage and
                a Marketplace plan with a deductible.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span
                aria-hidden="true"
                className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
              />
              <span>
                Childcare subsidies often phase out at a specific income line,
                which can make a $1/hour raise net-negative for a single parent
                with young children.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span
                aria-hidden="true"
                className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
              />
              <span>
                SNAP and energy assistance both have income tests, so the same
                raise can trigger two reductions at once.
              </span>
            </li>
          </ul>
        </section>

        <section aria-labelledby="cliff-tool" className="space-y-3">
          <h3 id="cliff-tool" className="text-sm font-semibold text-foreground">
            Use the Atlanta Fed CLIFF Dashboard
          </h3>
          <p className="text-sm text-muted-foreground">
            The Federal Reserve Bank of Atlanta built a calculator that models
            how Michigan household resources change as wages rise. It uses the
            Policy Rules Database, which tracks federal and state rules for
            childcare, SNAP, housing, Medicaid, ACA subsidies, TANF, LIHEAP,
            Head Start, school meals, and tax credits.
          </p>
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
            <div className="flex items-start gap-3 flex-wrap">
              <BarChart3
                className="mt-0.5 h-5 w-5 shrink-0 text-michigan-teal"
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  Career Ladder Identifier and Financial Forecaster (CLIFF)
                </p>
                <p className="text-xs text-muted-foreground">
                  Federal Reserve Bank of Atlanta. Free to use. No account
                  required.
                </p>
              </div>
              <ProvenanceTag
                label="MODELED"
                source="Federal Reserve Bank of Atlanta - CLIFF Dashboard"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={ATLANTA_FED_CLIFF_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Open the CLIFF Dashboard
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
              <a
                href={ATLANTA_FED_POLICY_RULES_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                About the Policy Rules Database
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="cliff-disclaimer"
          className="rounded-lg border border-michigan-gold/30 bg-michigan-gold/5 p-3"
        >
          <h3
            id="cliff-disclaimer"
            className="flex items-center gap-2 text-sm font-semibold text-foreground"
          >
            <AlertCircle
              className="h-4 w-4 text-michigan-gold"
              aria-hidden="true"
            />
            Disclaimer
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            This page is educational and informational. It is not a
            determination of eligibility, not financial advice, and not legal
            advice. Eligibility for any program is decided solely by the
            program. Access Michigan does not collect or store anything about
            your household or income.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            If a raise might affect your benefits, the right next step is
            usually to talk to a MI Bridges Navigator, a benefits counselor at
            211, or, for legal questions, Michigan Legal Help. We do not give
            advice about timing, structuring, or sheltering income.
          </p>
        </section>
      </CardContent>
    </Card>
  );
}
