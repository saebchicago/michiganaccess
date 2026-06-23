import {
  Baby,
  BookOpen,
  Briefcase,
  HeartHandshake,
  UserCog,
  Accessibility,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ProvenanceTag } from "@/components/shared/ProvenanceTag";
import { OfficialChannelNotice } from "@/components/shared/OfficialChannelNotice";
import {
  OFFICIAL_MI_BRIDGES_URL,
  OFFICIAL_SSA_URL,
  OFFICIAL_WIC_URL,
  OFFICIAL_MSP_URL,
} from "@/data/benefitsRules";

interface LifeStageNode {
  id: string;
  stage: string;
  icon: typeof Baby;
  summary: string;
  programs: {
    name: string;
    blurb: string;
    sourceName: string;
    sourceUrl: string;
    applyUrl: string;
  }[];
}

const STAGES: LifeStageNode[] = [
  {
    id: "pregnancy",
    stage: "Pregnancy",
    icon: Baby,
    summary:
      "Coverage and nutrition support that begin once a pregnancy is confirmed.",
    programs: [
      {
        name: "Healthy Michigan Plan or pregnancy Medicaid",
        blurb:
          "Full Medicaid coverage during pregnancy. Stays in effect for 12 months after the end of pregnancy under Michigan's continuous postpartum coverage rule.",
        sourceName: "Michigan MDHHS - Health Care Programs Eligibility",
        sourceUrl:
          "https://www.michigan.gov/mdhhs/assistance-programs/medicaid/health-care-programs-eligibility",
        applyUrl: OFFICIAL_MI_BRIDGES_URL,
      },
      {
        name: "WIC",
        blurb:
          "Nutrition support and food package during pregnancy and through the postpartum year. Income limit is 185% FPL.",
        sourceName: "USDA FNS - WIC Income Eligibility Guidelines",
        sourceUrl:
          "https://www.fns.usda.gov/wic/income-eligibility-guidelines-2025-26",
        applyUrl: OFFICIAL_WIC_URL,
      },
    ],
  },
  {
    id: "birth_early_childhood",
    stage: "Birth and early childhood",
    icon: BookOpen,
    summary:
      "Health coverage, nutrition, and early care once the baby is here.",
    programs: [
      {
        name: "WIC (children under 5)",
        blurb:
          "Continues for the child through age 5 if household income stays at or under 185% FPL.",
        sourceName: "USDA FNS - WIC Income Eligibility Guidelines",
        sourceUrl:
          "https://www.fns.usda.gov/wic/income-eligibility-guidelines-2025-26",
        applyUrl: OFFICIAL_WIC_URL,
      },
      {
        name: "MIChild / CHIP",
        blurb:
          "Health coverage for uninsured children under 19. Income limit is 212% FPL.",
        sourceName: "Michigan MDHHS - Children's Health Coverage",
        sourceUrl:
          "https://www.michigan.gov/mdhhs/assistance-programs/medicaid/health-care-programs-eligibility",
        applyUrl: OFFICIAL_MI_BRIDGES_URL,
      },
    ],
  },
  {
    id: "job_loss",
    stage: "Job loss or sudden income drop",
    icon: Briefcase,
    summary: "Coverage and food assistance to bridge a gap in earnings.",
    programs: [
      {
        name: "Healthy Michigan Plan",
        blurb:
          "Medicaid expansion for adults 19-64. Income test is 138% FPL on a current-income basis, so a recent job loss often makes a household newly eligible.",
        sourceName: "Michigan MDHHS - Health Care Programs Eligibility",
        sourceUrl:
          "https://www.michigan.gov/mdhhs/assistance-programs/medicaid/health-care-programs-eligibility",
        applyUrl: OFFICIAL_MI_BRIDGES_URL,
      },
      {
        name: "SNAP (Bridge Card)",
        blurb:
          "Monthly food assistance. Federal baseline rule is 130% FPL gross income.",
        sourceName: "USDA FNS - FY2026 SNAP Cost-of-Living Adjustments",
        sourceUrl: "https://www.fns.usda.gov/snap/allotment/cola/fy26",
        applyUrl: OFFICIAL_MI_BRIDGES_URL,
      },
      {
        name: "State Emergency Relief",
        blurb:
          "One-time help for shutoffs, eviction, and similar emergencies. Income limit is 150% FPL.",
        sourceName: "Michigan MDHHS - FY2026 LIHEAP State Plan",
        sourceUrl:
          "https://www.michigan.gov/mdhhs/inside-mdhhs/newsroom/2025/08/07/public-notice-proposed-liheap-state-plan-for-fy-2026",
        applyUrl: OFFICIAL_MI_BRIDGES_URL,
      },
    ],
  },
  {
    id: "turning_65",
    stage: "Turning 65",
    icon: UserCog,
    summary:
      "Medicare opens up. For low-income households the Medicare Savings Programs cover premiums and cost-sharing.",
    programs: [
      {
        name: "Medicare",
        blurb:
          "Initial enrollment runs from three months before the month a person turns 65 through three months after.",
        sourceName: "Medicare.gov",
        sourceUrl:
          "https://www.medicare.gov/basics/get-started-with-medicare/sign-up/when-does-medicare-coverage-start",
        applyUrl: OFFICIAL_SSA_URL,
      },
      {
        name: "Medicare Savings Programs (QMB, SLMB, QI)",
        blurb:
          "Three tiers based on income: QMB at 100% FPL, SLMB at 120% FPL, QI at 135% FPL. Asset test applies.",
        sourceName: "CMS - Medicare Savings Programs (2026)",
        sourceUrl: OFFICIAL_MSP_URL,
        applyUrl: OFFICIAL_MI_BRIDGES_URL,
      },
    ],
  },
  {
    id: "disability_aging",
    stage: "Disability or aging",
    icon: Accessibility,
    summary:
      "Cash assistance and dual-eligible paths for low-income adults with a disability or who are 65+.",
    programs: [
      {
        name: "Supplemental Security Income (SSI)",
        blurb:
          "Federal cash assistance for low-income adults 65+ or with a qualifying disability, and for low-income disabled children. 2026 federal benefit rate is $994 per month for an individual.",
        sourceName: "SSA - 2026 SSI Federal Payment Amounts",
        sourceUrl: "https://www.ssa.gov/oact/cola/SSI.html",
        applyUrl: OFFICIAL_SSA_URL,
      },
      {
        name: "Dual-eligible Medicaid + Medicare",
        blurb:
          "People on Medicare who also qualify for Medicaid (typically through QMB) get help with premiums, cost-sharing, and benefits Medicare does not cover.",
        sourceName: "Michigan MDHHS - Medicaid",
        sourceUrl:
          "https://www.michigan.gov/mdhhs/assistance-programs/medicaid/health-care-programs-eligibility",
        applyUrl: OFFICIAL_MI_BRIDGES_URL,
      },
    ],
  },
  {
    id: "household_food",
    stage: "Household food security (any stage)",
    icon: HeartHandshake,
    summary: "Anchor food-support programs that apply across life stages.",
    programs: [
      {
        name: "SNAP (Bridge Card)",
        blurb:
          "Federal baseline rule is 130% FPL gross income. Michigan's categorical eligibility raises the effective gross income test for some households.",
        sourceName: "USDA FNS - SNAP Eligibility",
        sourceUrl: "https://www.fns.usda.gov/snap/recipient/eligibility",
        applyUrl: OFFICIAL_MI_BRIDGES_URL,
      },
    ],
  },
];

export function LifeStageMap() {
  return (
    <div className="space-y-4">
      <OfficialChannelNotice variant="compact" />
      <p className="px-1 text-[11px] text-muted-foreground">
        Life-stage entries below are informational. Eligibility for each program
        is decided by the program, not by this page. Apply links go to official
        .gov portals only.
      </p>

      <ol className="relative space-y-4 border-l border-border pl-6">
        {STAGES.map((stage) => (
          <li key={stage.id} className="relative">
            <span
              aria-hidden="true"
              className="absolute -left-9 mt-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-primary/30 bg-background"
            >
              <stage.icon className="h-3.5 w-3.5 text-primary" />
            </span>
            <Card>
              <CardContent className="space-y-3 py-4">
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    {stage.stage}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {stage.summary}
                  </p>
                </div>
                <ul className="space-y-3">
                  {stage.programs.map((p) => (
                    <li
                      key={p.name}
                      className="rounded-lg border border-border bg-background p-3"
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {p.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {p.blurb}
                          </p>
                        </div>
                        <ProvenanceTag label="VERIFIED" source={p.sourceName} />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs">
                        <a
                          href={p.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          How to apply at the official portal
                          <ExternalLink
                            className="h-3 w-3"
                            aria-hidden="true"
                          />
                        </a>
                        <a
                          href={p.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-muted-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          Source
                          <ExternalLink
                            className="h-3 w-3"
                            aria-hidden="true"
                          />
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>
    </div>
  );
}
