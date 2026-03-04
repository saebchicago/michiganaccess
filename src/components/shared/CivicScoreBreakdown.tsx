/**
 * CivicScoreBreakdown — Segmented Civic Insight Score with sub-indices.
 *
 * Phase 1: Two sub-indices displayed as stacked bars inside an accordion.
 *   1) Community Vulnerability Index (40%): income + poverty + education z-scores
 *   2) Access Friction Score (60%): outages, appeals, reports per 1K residents
 *
 * Phase 3: Expandable methodology panel with data sources & PDF link.
 */

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronDown, Info, Download, Shield, Activity, BookOpen, AlertTriangle } from "lucide-react";
import { COUNTY_PROFILES, type CountyProfile } from "@/data/michigan-county-profiles";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

/* ── State-level benchmarks for z-score normalization ── */
const MI_BENCHMARKS = {
  uninsuredRate: { mean: 6.5, sd: 1.4 },
  foodInsecurity: { mean: 13.2, sd: 2.8 },
  // primaryCareRatio higher = worse → inverted
  primaryCareRatio: { mean: 1500, sd: 600 },
};

function zScore(value: number, mean: number, sd: number): number {
  return sd === 0 ? 0 : (value - mean) / sd;
}

/** Clamp z-score to 0-100 sub-index scale (lower vulnerability = higher score) */
function zToScore(z: number, invertBetter = false): number {
  // z < 0 means below-average (better for rates); invert if needed
  const adjusted = invertBetter ? z : -z;
  // Map [-2, +2] → [20, 80], clamped to [5, 95]
  const score = 50 + adjusted * 15;
  return Math.max(5, Math.min(95, Math.round(score)));
}

/* ── Sub-index computations ── */

interface SubIndex {
  label: string;
  score: number; // 0-100
  weight: number; // 0-1
  icon: React.ElementType;
  color: string;
  details: string;
}

function computeVulnerabilityIndex(profile: CountyProfile): SubIndex {
  const uninsured = parseFloat(profile.healthHighlights[0]?.value || "6.5");
  const food = parseFloat(profile.healthHighlights[2]?.value || "13.2");
  const pcrRaw = profile.healthHighlights[1]?.value || "1500:1";
  const pcr = parseInt(pcrRaw.replace(/[^0-9]/g, ""), 10) || 1500;

  const zUninsured = zScore(uninsured, MI_BENCHMARKS.uninsuredRate.mean, MI_BENCHMARKS.uninsuredRate.sd);
  const zFood = zScore(food, MI_BENCHMARKS.foodInsecurity.mean, MI_BENCHMARKS.foodInsecurity.sd);
  const zPCR = zScore(pcr, MI_BENCHMARKS.primaryCareRatio.mean, MI_BENCHMARKS.primaryCareRatio.sd);

  // Average of inverted z-scores → lower rates = higher score
  const avg = (zToScore(zUninsured) + zToScore(zFood) + zToScore(zPCR, true)) / 3;

  return {
    label: "Community Vulnerability",
    score: Math.round(avg),
    weight: 0.4,
    icon: Shield,
    color: "hsl(var(--michigan-blue))",
    details: `Uninsured ${uninsured}% · Food insecurity ${food}% · PCP ratio ${pcrRaw}`,
  };
}

function computeAccessFriction(
  profile: CountyProfile,
  realtimeCounts: { appeals: number; reports: number; outageAffected: number }
): SubIndex {
  const pop = profile.population || 100000;
  const per1K = (v: number) => (v / pop) * 1000;

  const appealRate = per1K(realtimeCounts.appeals);
  const reportRate = per1K(realtimeCounts.reports);
  const outageRate = per1K(realtimeCounts.outageAffected);

  // Lower rates = less friction = higher score
  // Scale: 0 rate → 90, 5+ per 1K → 20
  const rateToScore = (r: number) => Math.max(10, Math.min(90, Math.round(90 - r * 14)));

  const avg = (rateToScore(appealRate) + rateToScore(reportRate) + rateToScore(outageRate)) / 3;

  return {
    label: "Access Friction",
    score: Math.round(avg),
    weight: 0.6,
    icon: Activity,
    color: "hsl(var(--teal))",
    details: `Appeals ${appealRate.toFixed(1)}/1K · Reports ${reportRate.toFixed(1)}/1K · Outage exposure ${outageRate.toFixed(1)}/1K`,
  };
}

/* ── Stacked bar component ── */
function SubIndexBar({ sub }: { sub: SubIndex }) {
  const tierColor =
    sub.score >= 70
      ? "text-green-700 dark:text-green-400"
      : sub.score >= 45
      ? "text-amber-600 dark:text-amber-400"
      : "text-red-600 dark:text-red-400";

  const barBg =
    sub.score >= 70
      ? "bg-green-500"
      : sub.score >= 45
      ? "bg-amber-500"
      : "bg-red-500";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <sub.icon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">{sub.label}</span>
          <Badge variant="outline" className="text-[9px] h-4 px-1.5">
            {Math.round(sub.weight * 100)}%
          </Badge>
        </div>
        <span className={`text-sm font-bold tabular-nums ${tierColor}`}>
          {sub.score}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${barBg}`}
          initial={{ width: 0 }}
          animate={{ width: `${sub.score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground leading-relaxed">{sub.details}</p>
    </div>
  );
}

/* ── Main component ── */
interface CivicScoreBreakdownProps {
  countyName: string;
  compositeScore: number;
}

export default function CivicScoreBreakdown({ countyName, compositeScore }: CivicScoreBreakdownProps) {
  const [open, setOpen] = useState(false);
  const [methodOpen, setMethodOpen] = useState(false);
  const profile = COUNTY_PROFILES[countyName];

  // Fetch real-time counts for access friction
  const { data: realtimeCounts } = useQuery({
    queryKey: ["civic-score-realtime", countyName],
    queryFn: async () => {
      const [appeals, reports] = await Promise.all([
        supabase.from("appeal_outcomes").select("id", { count: "exact", head: true }).eq("county", countyName),
        supabase.from("community_reports").select("id", { count: "exact", head: true }).eq("county", countyName),
      ]);
      return {
        appeals: appeals.count || 0,
        reports: reports.count || 0,
        outageAffected: 0, // Will use outage data when available
      };
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!profile,
  });

  const subIndices = useMemo(() => {
    if (!profile) return null;
    const counts = realtimeCounts || { appeals: 0, reports: 0, outageAffected: 0 };
    const vuln = computeVulnerabilityIndex(profile);
    const friction = computeAccessFriction(profile, counts);
    return [vuln, friction];
  }, [profile, realtimeCounts]);

  if (!profile || !subIndices) return null;

  const weighted = Math.round(subIndices[0].score * subIndices[0].weight + subIndices[1].score * subIndices[1].weight);

  return (
    <div className="space-y-3">
      {/* Score breakdown accordion */}
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline cursor-pointer w-full justify-center">
          <Info className="h-3 w-3" />
          {open ? "Hide" : "View"} Score Breakdown
          <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-3 space-y-4 rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Composite Score
              </p>
              <span className="text-sm font-bold text-foreground tabular-nums">{weighted}/100</span>
            </div>

            {subIndices.map((sub) => (
              <SubIndexBar key={sub.label} sub={sub} />
            ))}

            {/* Weighted summary */}
            <div className="pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden flex">
                  <motion.div
                    className="h-full"
                    style={{ backgroundColor: subIndices[0].color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${subIndices[0].weight * 100}%` }}
                    transition={{ duration: 0.6 }}
                  />
                  <motion.div
                    className="h-full"
                    style={{ backgroundColor: subIndices[1].color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${subIndices[1].weight * 100}%` }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  />
                </div>
                <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                  40/60 weight split
                </span>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Phase 3: Methodology panel */}
      <Collapsible open={methodOpen} onOpenChange={setMethodOpen}>
        <CollapsibleTrigger className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-primary cursor-pointer w-full justify-center">
          <BookOpen className="h-3 w-3" />
          {methodOpen ? "Hide" : "View"} Methodology & Sources
          <ChevronDown className={`h-3 w-3 transition-transform ${methodOpen ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2 rounded-lg border border-dashed border-border bg-muted/20 p-4 space-y-3 text-xs text-muted-foreground">
            <div className="space-y-1.5">
              <p className="font-semibold text-foreground text-[11px]">Data Sources</p>
              <ul className="space-y-1 ml-3 list-disc">
                <li><strong>Community Vulnerability (40%):</strong> U.S. Census ACS 2024 5-year estimates — uninsured rate, food insecurity, primary care physician ratio</li>
                <li><strong>Access Friction (60%):</strong> Real-time platform data — insurance appeal outcomes, community incident reports, utility outage exposure per 1,000 residents</li>
              </ul>
            </div>

            <div className="space-y-1.5">
              <p className="font-semibold text-foreground text-[11px]">Normalization</p>
              <p>Metrics are converted to z-scores against Michigan statewide benchmarks, then mapped to a 0–100 scale. Sub-indices are combined using a 40/60 weighted average.</p>
            </div>

            <div className="space-y-1.5">
              <p className="font-semibold text-foreground text-[11px]">Refresh Cadence</p>
              <div className="flex items-center gap-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="text-[9px] cursor-help">
                        ACS: Annual
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>Census ACS data updated annually (latest: 2024 5-year)</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="text-[9px] cursor-help">
                        Real-time: 10 min
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>Appeals, reports & outage data refreshed every 10 minutes</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Link
                to="/methodology"
                className="inline-flex items-center gap-1 text-primary hover:underline text-[11px] font-medium"
              >
                Full methodology page →
              </Link>
              <Link
                to="/data-validation"
                className="inline-flex items-center gap-1 text-primary hover:underline text-[11px] font-medium"
              >
                <Download className="h-3 w-3" />
                Download Methodology PDF
              </Link>
            </div>

            <div className="flex items-start gap-1.5 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-2 mt-1">
              <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <p className="text-[10px] text-amber-700 dark:text-amber-300">
                This score is a model estimate for informational comparison only. It does not represent an official assessment.
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
