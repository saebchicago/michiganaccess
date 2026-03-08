import { useState, useRef } from "react";
import { usePersonalProfile } from "@/hooks/usePersonalProfile";
import { useTranslation } from "react-i18next";
import { useCounty, MICHIGAN_COUNTIES, type MichiganCounty } from "@/contexts/CountyContext";
import { COUNTY_PROFILES } from "@/data/michigan-county-profiles";
import { getCountyCrossDomain, MI_STATE_AVERAGES } from "@/data/cross-domain-indicators";
import { usePageMeta } from "@/hooks/usePageMeta";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, TrendingUp, TrendingDown, Minus, MapPin, BarChart3, FileText, Activity, Zap, Droplets, TreePine, AlertTriangle } from "lucide-react";
import { CivicInsightGauge } from "@/components/shared/CivicInsightGauge";
import CivicScoreBreakdown from "@/components/shared/CivicScoreBreakdown";
import { DataClassification } from "@/components/shared/DataClassification";
import AskCopilotButton from "@/components/shared/AskCopilotButton";
import ViewModeToggle, { type ViewMode } from "@/components/shared/ViewModeToggle";
import CHNAViewSection from "@/components/brief/CHNAViewSection";
import UtilityStressSection from "@/components/brief/UtilityStressSection";
import GetToCarePanel from "@/components/brief/GetToCarePanel";
import PartnerCTABar from "@/components/brief/PartnerCTABar";

function computeCivicScore(county: string): number {
  const profile = COUNTY_PROFILES[county];
  if (!profile) return 50;
  let score = 60;
  const uninsured = parseFloat(profile.healthHighlights[0]?.value || "6");
  if (uninsured < 5) score += 15;
  else if (uninsured < 7) score += 5;
  else score -= 5;
  if (profile.countyType === "urban") score += 5;
  if (profile.countyType === "suburban") score += 3;
  const foodIns = parseFloat(profile.healthHighlights[2]?.value || "13");
  if (foodIns < 11) score += 10;
  else if (foodIns > 15) score -= 5;
  return Math.max(10, Math.min(95, score));
}

function getVal(hh: { label: string; value: string }[] | undefined, search: string): string {
  if (!hh) return "—";
  return hh.find((h) => h.label.toLowerCase().includes(search.toLowerCase()))?.value || "—";
}

const trendIcon = (t?: "up" | "down" | "stable") => {
  if (t === "up") return <TrendingUp className="h-3.5 w-3.5 text-destructive" />;
  if (t === "down") return <TrendingDown className="h-3.5 w-3.5 text-michigan-forest" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
};

function buildUrgentSummary(county: string, profile: typeof COUNTY_PROFILES[string]): string[] {
  const lines: string[] = [];
  const hh = profile.healthHighlights;
  const uninsuredRaw = getVal(hh, "uninsured");
  const foodRaw = getVal(hh, "food");
  const uninsured = parseFloat(uninsuredRaw);
  const food = parseFloat(foodRaw);

  if (isNaN(uninsured)) {
    lines.push(`Health: Uninsured rate data is pending for ${county} County. Check back soon or visit the county page for details.`);
  } else if (uninsured > 8) {
    lines.push(`Health: ${county} County's uninsured rate (${uninsured}%) is above the state average of 6.2%, signaling gaps in coverage access.`);
  } else {
    lines.push(`Health: ${county} County has a manageable uninsured rate (${uninsured}%), but primary care access varies by community.`);
  }

  if (isNaN(food)) {
    lines.push(`Housing & Food: Food insecurity data is pending for ${county} County.`);
  } else if (food > 14) {
    lines.push(`Housing & Food: Food insecurity at ${food}% exceeds the state average (13.5%), compounding chronic health conditions.`);
  } else {
    lines.push(`Housing & Food: Food insecurity (${food}%) is near or below state norms, though pockets of need persist.`);
  }
  lines.push(`Utilities & Environment: Energy burden and outage data are key equity indicators — check the Value & Performance section on the county page for details.`);
  return lines;
}

type TensionTag = "outages_plus_medical_vulnerability" | "high_medicaid_plus_rent_burden" | "high_crash_plus_low_transit";
interface TensionLine { tag: TensionTag; text: string; }

function getCrossSectorTensions(county: string, profile: typeof COUNTY_PROFILES[string]): TensionLine[] {
  const tensions: TensionLine[] = [];
  const cd = getCountyCrossDomain(county);
  const uninsured = parseFloat(getVal(profile.healthHighlights, "uninsured") || "0");
  if (uninsured > 7 && cd.rentBurden !== null && cd.rentBurden > MI_STATE_AVERAGES.rentBurden!) {
    tensions.push({ tag: "high_medicaid_plus_rent_burden", text: `A key issue here is that high housing cost burden (${cd.rentBurden}% rent-burdened) overlaps with an elevated uninsured rate (${uninsured}%), meaning residents may struggle to afford both housing and healthcare.` });
  }
  if (cd.vehicleAccess !== null && cd.vehicleAccess < MI_STATE_AVERAGES.vehicleAccess! && cd.commuteTime !== null && cd.commuteTime > MI_STATE_AVERAGES.commuteTime!) {
    tensions.push({ tag: "high_crash_plus_low_transit", text: `Lower vehicle access (${cd.vehicleAccess}% of households) combined with longer commute times (${cd.commuteTime} min) suggests transportation gaps that may limit access to jobs, healthcare, and services.` });
  }
  if (cd.povertyRate !== null && cd.povertyRate > 18 && cd.drinkingWaterCompliance !== null && cd.drinkingWaterCompliance < 90) {
    tensions.push({ tag: "outages_plus_medical_vulnerability", text: `High poverty (${cd.povertyRate}%) paired with drinking water compliance concerns (${cd.drinkingWaterCompliance}%) means vulnerable residents may face compounding environmental and economic stress.` });
  }
  return tensions.slice(0, 2);
}

export default function BriefPage() {
  const { t } = useTranslation();
  const { county, setCounty } = useCounty();
  const printRef = useRef<HTMLDivElement>(null);
  const { profile: personalProfile } = usePersonalProfile();
  const [viewMode, setViewMode] = useState<ViewMode>("standard");

  usePageMeta({
    title: county ? `${county} County Brief — Access Michigan` : "County Brief — Access Michigan",
    description: county
      ? `Civic snapshot for ${county} County, Michigan — key health, economic, and access metrics at a glance.`
      : "Generate a quick civic brief for any Michigan county.",
    path: "/brief",
  });

  const profile = county ? COUNTY_PROFILES[county] : null;
  const score = county ? computeCivicScore(county) : null;
  const urgentLines = county && profile ? buildUrgentSummary(county, profile) : [];
  const tensions = county && profile ? getCrossSectorTensions(county, profile) : [];

  const profileEmphasis: string[] = [];
  if (personalProfile.mobility === "no_car" || personalProfile.mobility === "limited") {
    if (tensions.some((t) => t.tag === "high_crash_plus_low_transit")) {
      profileEmphasis.push("Based on your profile, transportation access may be especially relevant to you in this area.");
    }
  }
  if (personalProfile.housingStatus === "at_risk" || personalProfile.housingStatus === "homeless") {
    if (tensions.some((t) => t.tag === "high_medicaid_plus_rent_burden")) {
      profileEmphasis.push("Based on your profile, housing cost burden and coverage gaps may directly affect you here.");
    }
  }

  const copilotContext = county && profile
    ? `County Brief for ${county} County, Michigan. Population: ${profile.population}. Type: ${profile.countyType}. Cities: ${profile.majorCities.join(", ")}. Uninsured: ${getVal(profile.healthHighlights, "uninsured")}. Food insecurity: ${getVal(profile.healthHighlights, "food")}. Civic Score: ${score}/100.`
    : "";

  return (
    <Layout>
      <section className="bg-gradient-to-b from-primary/5 to-background py-12 lg:py-16">
        <div className="container max-w-3xl text-center">
          <Breadcrumbs items={[{ label: "County Brief" }]} />
          <Badge variant="secondary" className="mb-3">Beta</Badge>
          <h1 className="text-2xl font-bold text-foreground lg:text-4xl mb-2">
            {county ? `${county} County Brief` : "Generate Your County Brief"}
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            A quick civic snapshot — key health, economic, and access metrics at a glance.
          </p>
        </div>
      </section>

      <div className="container max-w-3xl py-10 space-y-8 print:py-4">
        {/* County picker + view mode toggle */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary" />
              Select a county:
            </label>
            <Select value={county ?? ""} onValueChange={(v) => setCounty(v as MichiganCounty)}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Choose a county…" />
              </SelectTrigger>
              <SelectContent>
                {MICHIGAN_COUNTIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ViewModeToggle value={viewMode} onChange={setViewMode} />
        </div>

        {county && profile && score !== null && (
          <div ref={printRef} className="space-y-6">
            {/* Score card */}
            <Card>
              <CardContent className="py-6 flex flex-col sm:flex-row items-center gap-6">
                <CivicInsightGauge score={score} color="hsl(var(--primary))" showClassification />
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-xl font-bold text-foreground">{county} County</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Civic Insight Score: <strong className="text-foreground">{score}/100</strong>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Population: {profile.population.toLocaleString()} · Type: {profile.countyType}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Major cities: {profile.majorCities.join(", ")}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5 print:hidden" onClick={() => window.print()}>
                  <Printer className="h-3.5 w-3.5" /> Print / PDF
                </Button>
              </CardContent>
            </Card>

            {/* CHNA / VBC View */}
            {viewMode === "chna" && <CHNAViewSection county={county} />}

            {/* Standard view sections */}
            {viewMode === "standard" && (
              <>
                {/* Cross-sector tensions */}
                {tensions.length > 0 && (
                  <Card className="border-destructive/20 bg-destructive/5 dark:bg-destructive/10">
                    <CardContent className="py-5">
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 mb-3">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        Cross-Sector Tensions
                      </h3>
                      <ul className="space-y-2">
                        {tensions.map((t) => (
                          <li key={t.tag} className="text-sm text-foreground/90 leading-relaxed">
                            {t.text}
                          </li>
                        ))}
                      </ul>
                      <p className="text-[10px] text-muted-foreground mt-2">
                        Rule-based flags from existing indicators — prompts for attention, not causal analyses. <a href="/methodology" className="text-primary hover:underline">See methodology</a>.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Profile-based emphasis */}
                {profileEmphasis.length > 0 && (
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="py-4">
                      <p className="text-xs font-medium text-primary mb-1">Based on your My Settings profile:</p>
                      {profileEmphasis.map((line, i) => (
                        <p key={i} className="text-sm text-foreground/80 leading-relaxed">{line}</p>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* What's Most Urgent */}
                <Card className="border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
                  <CardContent className="py-5">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 mb-3">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      What's Most Urgent in {county} County
                    </h3>
                    <ol className="space-y-2">
                      {urgentLines.map((line, i) => (
                        <li key={i} className="text-sm text-foreground/90 leading-relaxed pl-5 relative">
                          <span className="absolute left-0 top-0 text-xs font-bold text-amber-600">{i + 1}.</span>
                          {line}
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>

                {/* VBC & Systems */}
                <Card className="border-primary/20">
                  <CardContent className="py-5">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 mb-3">
                      <Activity className="h-4 w-4 text-primary" />
                      For Value-Based Care & Health Systems
                    </h3>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      <li className="flex gap-2">• <span>Social risk factors: food insecurity at <strong className="text-foreground">{getVal(profile.healthHighlights, "food")}</strong>, uninsured at <strong className="text-foreground">{getVal(profile.healthHighlights, "uninsured")}</strong></span></li>
                      <li className="flex gap-2">• <span>Primary care access ratio: <strong className="text-foreground">{getVal(profile.healthHighlights, "primary care") || "See county page"}</strong> — critical for VBC program design</span></li>
                      <li className="flex gap-2">• <span>ED reliance proxy: preventable hospital stays data available on county page's Value & Performance section</span></li>
                      <li className="flex gap-2">• <span>Use for CHNAs, community benefit reporting, and VBC network adequacy assessments</span></li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Utilities & Infrastructure */}
                <Card className="border-amber-500/20">
                  <CardContent className="py-5">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 mb-3">
                      <Zap className="h-4 w-4 text-amber-600" />
                      For Utilities & Infrastructure
                    </h3>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      <li className="flex gap-2">• <span>Outage data (SAIDI/SAIFI) and energy burden metrics available on the county Value & Performance page</span></li>
                      <li className="flex gap-2">• <span>Energy assistance uptake and weatherization eligibility: see <a href="/financial-help" className="text-primary hover:underline">Financial Help</a></span></li>
                      <li className="flex gap-2">• <span>Environmental indicators: air quality, drinking water violations, EJ Screen index on <a href="/environment" className="text-primary hover:underline">Environment page</a></span></li>
                      <li className="flex gap-2">• <span>Transportation gaps and crash burden: see <a href="/transportation" className="text-primary hover:underline">Transportation page</a></span></li>
                    </ul>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Utility Customer Stress — shown in both views */}
            <UtilityStressSection county={county} />

            {/* Get to Care panel */}
            <GetToCarePanel county={county} zip={personalProfile.primaryZip} coverageType={personalProfile.coverageType} />

            {/* Score breakdown */}
            <CivicScoreBreakdown countyName={county} compositeScore={score} />

            {/* Headline metrics */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-primary" /> Headline Metrics
              </h3>
              {profile.healthHighlights && profile.healthHighlights.length > 0 ? (
                <div className="space-y-3">
                  <DataClassification type="verified" />
                  <div className="grid gap-3 sm:grid-cols-3">
                    {profile.healthHighlights.map((m) => (
                      <Card key={m.label}>
                        <CardContent className="py-4 text-center">
                          <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
                          <p className="text-2xl font-bold text-foreground">{m.value}</p>
                          <div className="flex items-center justify-center gap-1 mt-1">
                            {trendIcon(m.trend)}
                            <span className="text-[10px] text-muted-foreground capitalize">{m.trend || "stable"}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <DataClassification type="pending" />
                  <p className="text-sm text-muted-foreground">Headline metrics are not yet available for this county.</p>
                </div>
              )}
            </div>

            {/* Partner CTA */}
            <PartnerCTABar context="brief" />

            {/* Ask Copilot */}
            <div className="print:hidden">
              <AskCopilotButton context={copilotContext} label={`Ask Copilot about ${county} County`} />
            </div>

            {/* Data note */}
            <div className="rounded-lg border border-border bg-muted/50 p-4 print:border-border">
              <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                <FileText className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                Data drawn from County Health Rankings 2024, U.S. Census 2023, and USDA Food Environment Atlas.
                This brief is for informational purposes only.
                <a href="/methodology" className="text-primary hover:underline ml-0.5">Full methodology →</a>
              </p>
            </div>

            {/* Print + Feedback */}
            <div className="flex items-center justify-end print:hidden">
              <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5">
                <Printer className="h-4 w-4" /> Print / Save as PDF
              </Button>
            </div>
            <PageFeedback />
          </div>
        )}

        {county && !profile && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>Profile data is not yet available for {county} County. We're adding more counties regularly.</p>
            </CardContent>
          </Card>
        )}

        {!county && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>Select a county above to generate your brief.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
