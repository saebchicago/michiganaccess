/**
 * CivicScoreBreakdown - explains the Civic Insight Score shown on the county
 * brief, using the same inputs and point rules as src/lib/civic-score.ts.
 *
 * Until 2026-11-22 this panel described a different model (a 40/60 blend of a
 * "Community Vulnerability" z-score index and an "Access Friction" index). Its
 * composite did not match the headline score; the friction index counted
 * outages as zero because no outage feed was wired, scored missing Supabase
 * counts as the best case, and the primary care ratio was inverted. It now
 * shows only what the displayed score is actually made of.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Info, BookOpen, AlertTriangle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { IntegrityBadge } from "@/components/chna/IntegrityBadge";
import { CIVIC_SCORE_METHODOLOGY, explainCivicScore } from "@/lib/civic-score";

interface CivicScoreBreakdownProps {
  countyName: string;
  compositeScore: number;
}

function signed(n: number): string {
  return n > 0 ? `+${n}` : n === 0 ? "0" : `${n}`;
}

export default function CivicScoreBreakdown({ countyName, compositeScore }: CivicScoreBreakdownProps) {
  const [open, setOpen] = useState(false);
  const explanation = explainCivicScore(countyName);
  if (!explanation) return null;
  const mismatch = explanation.score !== compositeScore;

  return (
    <div className="space-y-3">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline cursor-pointer w-full justify-center">
          <Info className="h-3 w-3" aria-hidden="true" />
          {open ? "Hide" : "View"} how this score is calculated
          <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-3 space-y-3 rounded-lg border border-border bg-muted/30 p-4 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-foreground">Civic Insight Score: {explanation.score}/100</p>
              <IntegrityBadge label="MODELED" source="AccessMI threshold score" vintage="County Health Rankings 2025 inputs" />
            </div>
            <table className="w-full text-left">
              <caption className="sr-only">Inputs and points behind the Civic Insight Score for {countyName} County</caption>
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th scope="col" className="py-1 pr-2">Input</th>
                  <th scope="col" className="py-1 pr-2">Value</th>
                  <th scope="col" className="py-1 pr-2">Points</th>
                  <th scope="col" className="py-1">Rule and source</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <th scope="row" className="py-1.5 pr-2 font-medium text-foreground">Starting value</th>
                  <td className="py-1.5 pr-2">-</td>
                  <td className="py-1.5 pr-2 tabular-nums">{explanation.base}</td>
                  <td className="py-1.5 text-muted-foreground">Fixed base, then clamped to 10-95</td>
                </tr>
                {explanation.inputs.map((i) => (
                  <tr key={i.label} className="border-t border-border align-top">
                    <th scope="row" className="py-1.5 pr-2 font-medium text-foreground">{i.label}</th>
                    <td className="py-1.5 pr-2">
                      {i.imputed ? <span className="text-amber-700 dark:text-amber-300">Not reported ({i.value ?? "blank"})</span> : i.value}
                    </td>
                    <td className="py-1.5 pr-2 tabular-nums">{signed(i.points)}</td>
                    <td className="py-1.5 text-muted-foreground">
                      {i.rule}. {i.source}.
                      {i.imputed ? " Missing value: scored by the default rule, so treat this score as less reliable." : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {mismatch && (
              <p role="alert" className="text-red-700 dark:text-red-300">
                The breakdown ({explanation.score}) does not match the displayed score ({compositeScore}). Report this on the feedback page.
              </p>
            )}
            <div className="flex items-start gap-1.5 rounded-md border border-amber-200 bg-amber-50 p-2 dark:border-amber-800 dark:bg-amber-950/20">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              <p className="text-[11px] text-amber-800 dark:text-amber-300">
                {CIVIC_SCORE_METHODOLOGY} It is a rough comparison aid, not an official assessment, and it has no uncertainty range.
              </p>
            </div>
            <Link to="/methodology" className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline">
              <BookOpen className="h-3 w-3" aria-hidden="true" />
              Full methodology
            </Link>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
