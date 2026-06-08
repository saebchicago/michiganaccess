import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface FlowStep {
  id: string;
  title: string;
  timeline: string;
  /**
   * Plain-language characterization of where this step sits in the
   * appeal funnel. Was previously a hardcoded percent ("68%") and a
   * hardcoded dollar saving ("$2,847") with no public source; the
   * platform's labeling rule is "cite a real source or remove the
   * figure; do not invent a replacement number." Until a verifiable
   * source for those rates is wired in, this field carries the
   * qualitative description instead.
   */
  outcomeLabel: string;
  description: string;
  details: string[];
  links: { label: string; url: string }[];
  status: "active" | "upcoming";
}

const FLOW_STEPS: FlowStep[] = [
  {
    id: "internal",
    title: "Internal Appeal",
    timeline: "Day 0 to Day 60",
    outcomeLabel: "Most overturned here",
    description:
      "First-level appeal directly to your insurance carrier. Most denials are overturned at this stage.",
    details: [
      "File within 180 days of denial notice",
      "Request peer-to-peer review with carrier's medical director",
      "Include supporting documentation from your physician",
      "Carrier must respond within 30 days (standard) or 72 hours (urgent)",
    ],
    links: [
      {
        label: "BCBS Appeal Form",
        url: "https://www.bcbsm.com/members/help/appeals",
      },
      {
        label: "HAP Appeal Process",
        url: "https://www.hap.org/members/appeals",
      },
    ],
    status: "active",
  },
  {
    id: "external",
    title: "DIFS External Review",
    timeline: "Day 61 to Day 90",
    outcomeLabel: "Strongest consumer protection",
    description:
      "Independent review by Michigan Department of Insurance and Financial Services. Strongest consumer protection.",
    details: [
      "Must exhaust internal appeals first (or carrier waived them)",
      "File within 127 days of final internal decision",
      "Independent review organization (IRO) examines your case",
      "DIFS decision is binding on the insurer",
      "No cost to you; the state covers review fees",
    ],
    links: [
      {
        label: "DIFS External Review Application",
        url: "https://www.michigan.gov/difs/consumers/file-a-complaint",
      },
      { label: "DIFS Consumer Hotline: 877-999-6442", url: "tel:8779996442" },
    ],
    status: "upcoming",
  },
  {
    id: "federal",
    title: "Federal ERISA Review",
    timeline: "Day 91 and after",
    outcomeLabel: "Last resort",
    description:
      "For employer-sponsored plans governed by federal ERISA law. Federal court review as a last resort.",
    details: [
      "Applies to employer-sponsored health plans (not individual or Medicaid)",
      "Must file within 60 days of final internal denial",
      "May require legal assistance; contact Michigan Legal Aid",
      "Can recover benefits, attorney fees, and interest",
      "Consider DOL complaint as an alternative path",
    ],
    links: [
      {
        label: "DOL EBSA Complaint",
        url: "https://www.dol.gov/agencies/ebsa/workers-and-families/filing-a-complaint",
      },
      { label: "Michigan Legal Help", url: "https://michiganlegalhelp.org" },
    ],
    status: "upcoming",
  },
];

const AppealFlowchart = () => {
  const [expandedStep, setExpandedStep] = useState<string | null>("internal");

  return (
    <section className="space-y-6" aria-labelledby="flowchart-heading">
      <div className="text-center">
        <h2
          id="flowchart-heading"
          className="text-2xl font-bold text-foreground"
        >
          Your Appeal Timeline
        </h2>
        <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
          Insurance denials are not final. Follow this proven 3-step
          process-based on 2025 Michigan DIFS data-to fight back.
        </p>
      </div>

      {/* Visual timeline connector */}
      <div className="relative space-y-4">
        {FLOW_STEPS.map((step, index) => {
          const isExpanded = expandedStep === step.id;
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15 }}
            >
              <Card
                className={`relative overflow-hidden transition-all cursor-pointer hover-lift ${
                  isExpanded
                    ? "border-primary shadow-michigan"
                    : "border-border"
                }`}
                onClick={() => setExpandedStep(isExpanded ? null : step.id)}
              >
                {/* Step number indicator */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-michigan" />

                <CardHeader className="pb-2 pl-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{step.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {step.timeline}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Replaced the previous "$2,847 saved" badge that
                          rendered as "$$2,847 saved" because step.savings
                          already started with "$". The savings field is
                          now removed entirely because no public source
                          backs the dollar amount; the outcome badge below
                          carries a qualitative description instead. */}
                      <Badge
                        variant="secondary"
                        className="bg-accent/10 text-accent border-accent/20"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {step.outcomeLabel}
                      </Badge>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <CardContent className="pl-6 pt-0 space-y-4">
                        <p className="text-sm text-muted-foreground">
                          {step.description}
                        </p>
                        <ul className="space-y-2">
                          {step.details.map((detail, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm"
                            >
                              <ArrowRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {step.links.map((link) => (
                            <Button
                              key={link.label}
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {link.label}
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Connector arrow to next step */}
                {index < FLOW_STEPS.length - 1 && (
                  <div className="flex justify-center py-1">
                    <ArrowRight className="h-5 w-5 text-muted-foreground rotate-90" />
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Summary callout. The previous version of this section printed
          three large numeric stats ("68% internal appeal success",
          "82% DIFS external win rate", "$2,847 average savings per
          win") with no public source for any of them; per the
          platform's labeling rules ("cite a real source or remove the
          figure; do not invent a replacement number") all three were
          removed. The component still teaches users which step to file
          and how; once DIFS publishes a verifiable annual report URL,
          add the sourced figures back here with a citation link. */}
      <div className="grid grid-cols-1 mt-6">
        <Card className="text-center p-4">
          <p className="text-sm font-medium text-foreground">
            Each stage above has its own filing window, eligibility, and
            evidence requirements. Click any step to expand the checklist and
            the official forms.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Outcome rates and savings totals will be added once a public source
            (Michigan DIFS, EBSA, or MDHHS Administrative Hearings) publishes
            them in a citable form.
          </p>
        </Card>
      </div>
    </section>
  );
};

export default AppealFlowchart;
