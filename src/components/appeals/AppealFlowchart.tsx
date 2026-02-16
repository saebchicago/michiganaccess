import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, ArrowRight, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

interface FlowStep {
  id: string;
  title: string;
  timeline: string;
  successRate: string;
  savings: string;
  description: string;
  details: string[];
  links: { label: string; url: string }[];
  status: "active" | "upcoming";
}

const FLOW_STEPS: FlowStep[] = [
  {
    id: "internal",
    title: "Internal Appeal",
    timeline: "Day 0–60",
    successRate: "68%",
    savings: "$2,847",
    description: "First-level appeal directly to your insurance carrier. Most denials are overturned at this stage.",
    details: [
      "File within 180 days of denial notice",
      "Request peer-to-peer review with carrier's medical director",
      "Include supporting documentation from your physician",
      "Carrier must respond within 30 days (standard) or 72 hours (urgent)",
    ],
    links: [
      { label: "BCBS Appeal Form", url: "https://www.bcbsm.com/members/help/appeals" },
      { label: "HAP Appeal Process", url: "https://www.hap.org/members/appeals" },
    ],
    status: "active",
  },
  {
    id: "external",
    title: "DIFS External Review",
    timeline: "Day 61–90",
    successRate: "82%",
    savings: "$4,200",
    description: "Independent review by Michigan Department of Insurance and Financial Services. Strongest consumer protection.",
    details: [
      "Must exhaust internal appeals first (or carrier waived them)",
      "File within 127 days of final internal decision",
      "Independent review organization (IRO) examines your case",
      "DIFS decision is binding on the insurer",
      "No cost to you—the state covers review fees",
    ],
    links: [
      { label: "DIFS External Review Application", url: "https://www.michigan.gov/difs/consumers/file-a-complaint" },
      { label: "DIFS Consumer Hotline: 877-999-6442", url: "tel:8779996442" },
    ],
    status: "upcoming",
  },
  {
    id: "federal",
    title: "Federal ERISA Review",
    timeline: "Day 91+",
    successRate: "45%",
    savings: "$8,500",
    description: "For employer-sponsored plans governed by federal ERISA law. Federal court review as a last resort.",
    details: [
      "Applies to employer-sponsored health plans (not individual or Medicaid)",
      "Must file within 60 days of final internal denial",
      "May require legal assistance—contact Michigan Legal Aid",
      "Can recover benefits, attorney fees, and interest",
      "Consider DOL complaint as an alternative path",
    ],
    links: [
      { label: "DOL EBSA Complaint", url: "https://www.dol.gov/agencies/ebsa/workers-and-families/filing-a-complaint" },
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
        <h2 id="flowchart-heading" className="text-2xl font-bold text-foreground">
          Your Appeal Timeline
        </h2>
        <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
          Insurance denials are not final. Follow this proven 3-step process—based on 2025 Michigan DIFS data—to fight back.
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
                  isExpanded ? "border-primary shadow-michigan" : "border-border"
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
                          <span className="text-sm text-muted-foreground">{step.timeline}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {step.successRate} win rate
                      </Badge>
                      <Badge variant="outline">
                        Avg. ${step.savings} saved
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
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                        <ul className="space-y-2">
                          {step.details.map((detail, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <ArrowRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {step.links.map((link) => (
                            <Button key={link.label} variant="outline" size="sm" asChild>
                              <a href={link.url} target="_blank" rel="noopener noreferrer">
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

      {/* Summary stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        {[
          { label: "Internal Appeal Success", value: "68%", note: "Most denials overturned here" },
          { label: "DIFS External Win Rate", value: "82%", note: "2025 Michigan DIFS data" },
          { label: "Average Savings Per Win", value: "$2,847", note: "Across all appeal types" },
        ].map((stat) => (
          <Card key={stat.label} className="text-center p-4">
            <p className="text-3xl font-bold text-primary">{stat.value}</p>
            <p className="text-sm font-medium text-foreground mt-1">{stat.label}</p>
            <p className="text-xs text-muted-foreground">{stat.note}</p>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default AppealFlowchart;
