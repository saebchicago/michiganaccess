import { useState } from "react";
import {
  Heart,
  Home,
  Utensils,
  Users,
  UserCheck,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Calendar,
  ShieldCheck,
  AlertCircle,
  Info,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ── Impact levels ────────────────────────────────────────────────────────────

type ImpactLevel = "major" | "access" | "review" | "stable";

const IMPACT_CONFIG: Record<
  ImpactLevel,
  {
    label: string;
    textClass: string;
    badgeClass: string;
    Icon: React.FC<{ className?: string }>;
  }
> = {
  major: {
    label: "Major Change",
    textClass: "text-rose-400",
    badgeClass: "border-rose-400/40 text-rose-400 bg-rose-400/10",
    Icon: ({ className }) => <AlertCircle className={className} />,
  },
  access: {
    label: "Impacts Access",
    textClass: "text-amber-400",
    badgeClass: "border-amber-400/40 text-amber-400 bg-amber-400/10",
    Icon: ({ className }) => <Info className={className} />,
  },
  review: {
    label: "Review",
    textClass: "text-blue-400",
    badgeClass: "border-blue-400/40 text-blue-400 bg-blue-400/10",
    Icon: ({ className }) => <ShieldCheck className={className} />,
  },
  stable: {
    label: "Stable",
    textClass: "text-emerald-500",
    badgeClass: "border-emerald-500/40 text-emerald-500 bg-emerald-500/10",
    Icon: ({ className }) => <CheckCircle2 className={className} />,
  },
};

// ── Policy data ──────────────────────────────────────────────────────────────

interface PolicyCard {
  id: string;
  title: string;
  headline: string;
  impact: ImpactLevel;
  categories: string[];
  whatItMeans: string;
  details: string;
  effective: string;
  source: string;
  serviceLink: string;
  serviceLinkLabel: string;
}

const POLICIES: PolicyCard[] = [
  {
    id: "ira-part-d",
    title: "IRA Medicare Drug Price Cap",
    headline:
      "$2,000 cap on Medicare drug costs starting 2025 — spread payments monthly",
    impact: "major",
    categories: ["health", "seniors"],
    whatItMeans:
      "If you have Medicare Part D, your out-of-pocket drug costs are now capped at $2,000 per year. You can spread those payments across monthly installments instead of paying everything at once at the pharmacy.",
    details:
      "The Inflation Reduction Act restructured Medicare Part D cost-sharing. The annual $2,000 cap applies to covered drugs. The Medicare Prescription Payment Plan (M3P) lets enrollees spread costs evenly over the year.",
    effective: "January 2025",
    source: "CMS.gov — Medicare Part D Changes 2025",
    serviceLink: "/learn",
    serviceLinkLabel: "Check your drug coverage options",
  },
  {
    id: "prior-auth",
    title: "Prior Authorization Reform",
    headline:
      "Your plan must now decide on health service requests within 7 days",
    impact: "major",
    categories: ["health"],
    whatItMeans:
      "Federal rules now require your insurer to respond to routine prior authorization requests within 7 calendar days, and urgent requests within 72 hours. If they deny a request, they must explain why in plain language.",
    details:
      "CMS Interoperability and Prior Authorization Final Rule (CMS-0057-F) sets new response timelines for Medicare Advantage, Medicaid, CHIP, and Exchange plans. Electronic prior authorization (ePA) systems are required by 2027.",
    effective: "January 2024 (Phase 1)",
    source: "CMS.gov — CMS-0057-F Final Rule",
    serviceLink: "/appeals",
    serviceLinkLabel: "Learn how to appeal a denial",
  },
  {
    id: "mhpaea",
    title: "Mental Health Parity (MHPAEA)",
    headline:
      "Mental health care must be as accessible as physical care — new rules enforce this",
    impact: "access",
    categories: ["health", "family"],
    whatItMeans:
      "Your insurance plan is required to cover mental health and substance use treatment at the same level as physical health care. The 2024 rules give federal regulators stronger tools to hold plans accountable when they fall short.",
    details:
      "The MHPAEA Final Rule (2024) strengthens enforcement of the Mental Health Parity and Addiction Equity Act. Plans must document and share comparative analyses of their nonquantitative treatment limitations with regulators.",
    effective: "2024 plan year",
    source: "DOL.gov — MHPAEA Final Rule 2024",
    serviceLink: "/find-care",
    serviceLinkLabel: "Find mental health providers",
  },
  {
    id: "mdhhs-chcp",
    title: "MDHHS Health Equity Accreditation",
    headline:
      "Michigan Medicaid plans must now earn equity accreditation to serve you",
    impact: "access",
    categories: ["health"],
    whatItMeans:
      "Michigan now requires Medicaid managed care plans to earn health equity accreditation — showing they are actively closing gaps in care based on race, language, disability, and income. This means better accountability for plan performance.",
    details:
      "MDHHS Comprehensive Health Care Program (CHCP) requires managed care organizations to pursue NCQA Health Equity Accreditation by 2025. Plans must track and close disparities in HEDIS quality measures.",
    effective: "2025",
    source: "Michigan.gov/MDHHS — MHP Contract Requirements",
    serviceLink: "/health",
    serviceLinkLabel: "Understand your Medicaid plan",
  },
  {
    id: "no-surprises",
    title: "No Surprises Act",
    headline:
      "You cannot be billed more than in-network rates for emergency care",
    impact: "stable",
    categories: ["health", "family"],
    whatItMeans:
      "If you go to the emergency room or have a procedure at an in-network facility, out-of-network providers cannot charge you more than your in-network cost-sharing amount. You must also receive a written cost estimate before non-emergency care.",
    details:
      "The No Surprises Act (part of the Consolidated Appropriations Act 2021) bans surprise billing in emergencies and for certain non-emergency services at in-network facilities. Disputes between providers and insurers go through independent dispute resolution.",
    effective: "January 2022 (ongoing enforcement)",
    source: "CMS.gov — No Surprises Act",
    serviceLink: "/find-care",
    serviceLinkLabel: "Compare care costs near you",
  },
  {
    id: "network-adequacy",
    title: "Network Adequacy Standards",
    headline:
      "Your plan is legally required to offer appointments within time and distance limits",
    impact: "review",
    categories: ["health", "seniors"],
    whatItMeans:
      "Federal and Michigan rules now set specific limits on how far you should have to travel and how long you should wait for an appointment. If your plan cannot meet those standards, it must let you see out-of-network providers at in-network costs.",
    details:
      "CMS updated network adequacy standards for Medicare Advantage (2024) and Medicaid managed care. Michigan MDHHS enforces additional time-and-distance standards for Medicaid Health Plan enrollees across all 83 counties.",
    effective: "2024 plan year",
    source: "CMS.gov — Network Adequacy Final Rule",
    serviceLink: "/find-care",
    serviceLinkLabel: "Find in-network providers near you",
  },
  {
    id: "dsnp-mich",
    title: "DSNP / MICH Program",
    headline:
      "If you have both Medicare and Medicaid, Michigan is launching a new coordinated plan",
    impact: "major",
    categories: ["seniors", "health"],
    whatItMeans:
      "The Michigan Integrated Care for Healthy Communities (MICH) program creates a single integrated plan for people who qualify for both Medicare and Medicaid. One insurance card, one care team, and fewer gaps between your two coverages.",
    details:
      "Michigan is transitioning Dual Eligible Special Needs Plans (DSNPs) to fully integrated care models under the MICH program. The phased rollout targets 2025-2026. Approximately 240,000 Michiganders are dual eligible and may be affected.",
    effective: "2025-2026 (phased rollout)",
    source: "Michigan.gov/MDHHS — Integrated Care Initiative",
    serviceLink: "/seniors",
    serviceLinkLabel: "Learn about dual-eligible plans",
  },
  {
    id: "hei-sdoh",
    title: "Health Equity and Social Needs Screening",
    headline:
      "Plans must now close gaps in care for low-income and disabled members",
    impact: "access",
    categories: ["health", "seniors", "family"],
    whatItMeans:
      "Your Medicaid or Medicare Advantage plan is now required to screen you for social needs — housing instability, food insecurity, transportation — and connect you to community services. They must track whether those referrals actually helped.",
    details:
      "CMS AHEAD Model and MDHHS contract requirements mandate that managed care plans use a validated SDOH screening tool, refer members to community-based organizations, and report rates of closed social care loops.",
    effective: "2024-2025",
    source: "CMS.gov — AHEAD Model; Michigan.gov/MDHHS",
    serviceLink: "/",
    serviceLinkLabel: "Find social services near you",
  },
  {
    id: "snap",
    title: "SNAP Food Assistance",
    headline:
      "Monthly food assistance amounts updated to reflect real grocery costs",
    impact: "stable",
    categories: ["food"],
    whatItMeans:
      "SNAP (food stamps) benefit amounts are recalculated each October based on the cost of a healthy diet. Your household's monthly amount depends on size, income, and allowable deductions. Michigan DHHS processes applications within 30 days.",
    details:
      "The Thrifty Food Plan was re-evaluated in 2021 (USDA FNS), leading to average SNAP benefit increases. Emergency allotments ended in February 2023. Gross income limits and standard deductions are updated annually each October.",
    effective: "October each year (annual update)",
    source: "USDA FNS — SNAP Program",
    serviceLink: "/food",
    serviceLinkLabel: "Check SNAP eligibility",
  },
  {
    id: "wic",
    title: "WIC Program Expansion",
    headline:
      "WIC now covers more foods and serves more families across Michigan",
    impact: "review",
    categories: ["food", "family"],
    whatItMeans:
      "The WIC program provides monthly food packages for pregnant women, new mothers, infants, and children up to age 5. A 2024 update expanded the approved food list to include more fruits, vegetables, and culturally relevant foods.",
    details:
      "USDA FNS updated WIC food packages in June 2024 to expand fruits, vegetables, and whole grains. Michigan WIC serves approximately 220,000 participants monthly through local health departments and community clinics.",
    effective: "June 2024 (food package update)",
    source: "USDA FNS — WIC Food Package Final Rule",
    serviceLink: "/food",
    serviceLinkLabel: "Find WIC services near you",
  },
  {
    id: "mshda-housing",
    title: "MSHDA Housing Assistance",
    headline:
      "State rental assistance and affordable housing programs are available statewide",
    impact: "review",
    categories: ["housing"],
    whatItMeans:
      "Michigan's state housing authority (MSHDA) offers rental assistance, down payment help, and affordable housing programs for income-qualified residents. Programs are available in all 83 counties, though some have waitlists.",
    details:
      "MSHDA programs include the Housing Choice Voucher Program (Section 8), Michigan Homeowner Assistance Fund (MIHAF), and MSHDA-financed affordable units. HUD-approved housing counselors provide free guidance for renters and buyers.",
    effective: "Ongoing",
    source: "Michigan.gov/MSHDA",
    serviceLink: "/housing",
    serviceLinkLabel: "Explore housing assistance",
  },
  {
    id: "ccap-tanf",
    title: "Child Care and Family Assistance (CCAP / TANF)",
    headline:
      "Families facing hardship may qualify for child care help and cash assistance",
    impact: "review",
    categories: ["family"],
    whatItMeans:
      "The Child Care and Development Fund (CCAP) helps low-income families pay for licensed child care. TANF (called the Family Independence Program in Michigan) provides short-term cash assistance to families with children who need support.",
    details:
      "Michigan CCAP serves families earning up to 185% of the Federal Poverty Level. The Family Independence Program provides up to 48 months of cash assistance. 2024 state budget investments expanded CCAP provider payment rates.",
    effective: "Ongoing (rate updates 2024)",
    source: "Michigan.gov/MDHHS — FIP and CCAP",
    serviceLink: "/family",
    serviceLinkLabel: "Find family assistance programs",
  },
];

// ── Categories ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    id: "health",
    label: "Health",
    Icon: Heart,
    description: "Medicaid, Medicare, commercial insurance",
  },
  {
    id: "housing",
    label: "Housing",
    Icon: Home,
    description: "MDHHS housing programs, HUD, MSHDA",
  },
  {
    id: "food",
    label: "Food & Nutrition",
    Icon: Utensils,
    description: "SNAP, WIC, food banks",
  },
  {
    id: "family",
    label: "Family Services",
    Icon: Users,
    description: "Child care, family assistance, TANF",
  },
  {
    id: "seniors",
    label: "Seniors & Dual Eligible",
    Icon: UserCheck,
    description: "DSNP, MICH program, Medicare",
  },
];

// ── Timeline ─────────────────────────────────────────────────────────────────

const TIMELINE = [
  {
    date: "Jan 2025",
    event: "Medicare Part D $2,000 out-of-pocket drug cap takes effect",
    category: "seniors",
  },
  {
    date: "Jan 2025",
    event:
      "Insurers must now respond to prior authorization requests within 7 days",
    category: "health",
  },
  {
    date: "2025",
    event:
      "MICH integrated care program begins phased rollout for dual-eligible Michiganders",
    category: "seniors",
  },
  {
    date: "2025",
    event:
      "Michigan Medicaid plans must achieve NCQA Health Equity Accreditation",
    category: "health",
  },
  {
    date: "2024-2025",
    event:
      "Social needs screening required for all Medicaid managed care enrollees in Michigan",
    category: "health",
  },
  {
    date: "Jun 2024",
    event:
      "WIC food packages expanded — more fruits, vegetables, and culturally relevant foods added",
    category: "food",
  },
  {
    date: "2024",
    event:
      "Stronger mental health parity enforcement rules take effect for all insurance plans",
    category: "family",
  },
  {
    date: "Ongoing",
    event:
      "MSHDA rental assistance applications open — availability varies by county",
    category: "housing",
  },
];

// ── Policy card component ────────────────────────────────────────────────────

function PolicyCardItem({ policy }: { policy: PolicyCard }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = IMPACT_CONFIG[policy.impact];

  return (
    <Card className="overflow-hidden border-border/60 transition-shadow hover:shadow-md">
      <button
        className="w-full text-left px-5 py-4 flex items-start gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <cfg.Icon className={`h-4 w-4 mt-0.5 shrink-0 ${cfg.textClass}`} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {policy.title}
            </span>
            <Badge
              variant="outline"
              className={`text-[10px] py-0 px-2 ${cfg.badgeClass}`}
            >
              {cfg.label}
            </Badge>
          </div>
          <p className="text-sm font-medium text-foreground leading-snug">
            {policy.headline}
          </p>
        </div>
        <span className="shrink-0 mt-0.5 text-muted-foreground">
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </span>
      </button>

      {expanded && (
        <CardContent className="px-5 pb-5 pt-0 border-t border-border/40 space-y-4">
          {/* What this means for you */}
          <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-4">
            <p className="text-xs font-semibold text-emerald-400 mb-1.5 uppercase tracking-wide">
              What this means for you
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              {policy.whatItMeans}
            </p>
          </div>

          {/* Details */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Policy details
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {policy.details}
            </p>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3 shrink-0" />
              <span>
                <span className="font-medium text-foreground">Effective:</span>{" "}
                {policy.effective}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <ExternalLink className="h-3 w-3 shrink-0" />
              <span>
                <span className="font-medium text-foreground">Source:</span>{" "}
                {policy.source}
              </span>
            </span>
          </div>

          {/* Find Services CTA */}
          <div className="pt-1">
            <Button
              asChild
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-400 text-white text-xs gap-1.5"
            >
              <a href={policy.serviceLink}>
                {policy.serviceLinkLabel}
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// ── Impact matrix ────────────────────────────────────────────────────────────

function ImpactMatrix() {
  const catLabels: Record<string, string> = {
    health: "Health",
    housing: "Housing",
    food: "Food",
    family: "Family",
    seniors: "Seniors",
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-border/60">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border/60 bg-muted/40">
            <th className="py-3 px-4 text-left font-medium text-muted-foreground whitespace-nowrap">
              Policy
            </th>
            {Object.values(catLabels).map((l) => (
              <th
                key={l}
                className="py-3 px-3 text-center font-medium text-muted-foreground whitespace-nowrap"
              >
                {l}
              </th>
            ))}
            <th className="py-3 px-4 text-center font-medium text-muted-foreground">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {POLICIES.map((p) => {
            const cfg = IMPACT_CONFIG[p.impact];
            return (
              <tr
                key={p.id}
                className="border-b border-border/30 last:border-0 hover:bg-muted/20"
              >
                <td className="py-2.5 px-4 font-medium text-foreground whitespace-nowrap">
                  {p.title}
                </td>
                {Object.keys(catLabels).map((cat) => (
                  <td key={cat} className="py-2.5 px-3 text-center">
                    {p.categories.includes(cat) ? (
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          p.categories.includes(cat)
                            ? cfg.textClass.replace("text-", "bg-")
                            : "bg-transparent"
                        }`}
                      />
                    ) : (
                      <span className="inline-block w-2 h-2 rounded-full bg-muted/40" />
                    )}
                  </td>
                ))}
                <td className="py-2.5 px-4 text-center">
                  <Badge
                    variant="outline"
                    className={`text-[10px] py-0 px-2 ${cfg.badgeClass}`}
                  >
                    {cfg.label}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export const PolicyIntel = () => {
  const [activeCategory, setActiveCategory] = useState("health");

  const visiblePolicies = POLICIES.filter((p) =>
    p.categories.includes(activeCategory),
  );
  const activeCategory_ = CATEGORIES.find((c) => c.id === activeCategory);

  const majorCount = visiblePolicies.filter((p) => p.impact === "major").length;
  const accessCount = visiblePolicies.filter(
    (p) => p.impact === "access",
  ).length;

  return (
    <section className="space-y-8" aria-labelledby="policy-intel-heading">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-emerald-500/10">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </span>
          <h2
            id="policy-intel-heading"
            className="text-xl font-bold text-foreground"
          >
            Policy Impact Tracker
          </h2>
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Tracking federal and Michigan state policy changes that affect your
          access to health care, housing, food, and family services. Updated as
          rules take effect.
        </p>
      </div>

      {/* Status legend */}
      <div className="flex flex-wrap gap-3">
        {(
          Object.entries(IMPACT_CONFIG) as [
            ImpactLevel,
            (typeof IMPACT_CONFIG)[ImpactLevel],
          ][]
        ).map(([key, cfg]) => (
          <span
            key={key}
            className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${cfg.badgeClass}`}
          >
            <cfg.Icon className="h-3 w-3" />
            {cfg.label}
          </span>
        ))}
      </div>

      {/* Category tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/60 p-1.5">
          {CATEGORIES.map(({ id, label, Icon }) => (
            <TabsTrigger
              key={id}
              value={id}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map(({ id }) => (
          <TabsContent key={id} value={id} className="mt-5 space-y-4">
            {/* Category summary bar */}
            {activeCategory === id && (
              <div className="flex flex-wrap items-center gap-4 px-1">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {activeCategory_?.description}
                  </p>
                </div>
                {majorCount > 0 && (
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${IMPACT_CONFIG.major.badgeClass}`}
                  >
                    {majorCount} major change{majorCount !== 1 ? "s" : ""}
                  </Badge>
                )}
                {accessCount > 0 && (
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${IMPACT_CONFIG.access.badgeClass}`}
                  >
                    {accessCount} impact{accessCount !== 1 ? "s" : ""} access
                  </Badge>
                )}
              </div>
            )}

            {/* Policy cards */}
            <div className="space-y-3">
              {visiblePolicies.length > 0 ? (
                visiblePolicies.map((policy) => (
                  <PolicyCardItem key={policy.id} policy={policy} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No active policy updates for this category.
                </p>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Timeline */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Calendar className="h-4 w-4 text-emerald-500" />
          Upcoming and Recent Changes
        </h3>
        <div className="space-y-2">
          {TIMELINE.map((item, i) => {
            const cat = CATEGORIES.find((c) => c.id === item.category);
            return (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border border-border/40 px-4 py-3 bg-muted/20"
              >
                <span className="text-xs font-mono font-medium text-emerald-500 whitespace-nowrap min-w-[72px]">
                  {item.date}
                </span>
                <p className="text-xs text-foreground leading-relaxed flex-1">
                  {item.event}
                </p>
                {cat && (
                  <Badge
                    variant="outline"
                    className="text-[10px] py-0 shrink-0 text-muted-foreground"
                  >
                    {cat.label}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Impact matrix */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">
          Policy Impact Matrix
        </h3>
        <ImpactMatrix />
      </div>

      {/* Footer note */}
      <p className="text-[10px] text-muted-foreground border-t border-border/40 pt-4">
        Policy summaries are written in plain language for Michigan residents.
        Sources include CMS.gov, DOL.gov, USDA FNS, Michigan.gov/MDHHS, and
        Michigan.gov/MSHDA. This tracker is for informational purposes only and
        does not constitute legal or benefits advice. accessmi.org —
        non-commercial civic technology.
      </p>
    </section>
  );
};
