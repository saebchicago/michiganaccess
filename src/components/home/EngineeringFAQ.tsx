import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Activity, Database, GitBranch, HeartPulse } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    id: "throughput",
    icon: Activity,
    category: "System Throughput",
    question: "How does this platform divert low-acuity cases from the ED to Urgent Care?",
    answer:
      "The platform applies a multi-signal triage logic: when users search for care, the system surfaces urgent care, retail clinics, and telehealth options above emergency departments for non-emergent conditions. Filtering algorithms prioritize facilities by wait time estimates, walk-in availability, and service match — reducing unnecessary ED utilization by routing low-acuity demand to appropriate points of care. This mirrors industrial throughput optimization by matching demand type to the correct service tier.",
  },
  {
    id: "integrity",
    icon: Database,
    category: "Data Integrity",
    question: "How do you validate sources from CMS and MDHHS to prevent 'resource decay'?",
    answer:
      "Every data source is ingested through Edge Function proxies with a 1-hour cache TTL. Each record carries a freshness indicator showing the last-verified date. Cross-source validation compares CMS Hospital Compare records against HRSA UDS data and Michigan DHHS facility registries. Stale records (>90 days without verification) are flagged with degraded confidence scores. Automated reconciliation jobs detect closures, address changes, and service modifications — preventing the 'resource decay' that plagues static directories.",
  },
  {
    id: "leakage",
    icon: GitBranch,
    category: "Leakage Reduction",
    question: "How does centralizing SDOH resources reduce network leakage?",
    answer:
      "Network leakage occurs when patients exit a coordinated care ecosystem due to unmet social needs — housing instability, food insecurity, or transportation barriers. By integrating 15,000+ community resources (food banks, housing assistance, transit programs) into a single search interface alongside clinical providers, the platform keeps patients connected to wraparound services within their geographic network. This reduces out-of-network referrals and supports care continuity, directly aligning with managed care leakage reduction strategies.",
  },
  {
    id: "vbc",
    icon: HeartPulse,
    category: "Value-Based Care",
    question: "How does bridging gaps in housing and food security support long-term outcomes?",
    answer:
      "Social determinants account for 40–60% of health outcomes. Trinity Health screened 1M+ outpatients and found 27.4% reported at least one unmet social need; their 162 CHWs addressed 16,300+ social needs. Trinity Health system-reported a ~16% reduction in preventable hospitalizations among dually-enrolled patients (July 2021–July 2024; source: Trinity Health/FindHelp case study 2025, not independently verified). The platform's SDOH integration surfaces housing stability programs, SNAP enrollment, utility assistance, and employment services alongside clinical care — creating a unified access layer for the non-clinical factors that drive readmissions, chronic disease progression, and ED overutilization. For value-based contracts, this supports total cost of care reduction by addressing root causes rather than downstream symptoms. The system tracks resource availability across all 83 counties to ensure equitable SDOH coverage.",
  },
];

export default function EngineeringFAQ() {
  const [search, setSearch] = useState("");

  const filtered = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="py-16 bg-muted/30">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            Management Engineering
          </span>
          <h2 className="text-2xl font-bold text-foreground lg:text-3xl mb-2">
            System Architecture FAQ
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            How this platform applies engineering principles to population health infrastructure.
          </p>
        </motion.div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by topic (e.g., throughput, leakage, VBC)…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Accordion type="multiple" className="space-y-3">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <AccordionItem value={item.id} className="rounded-lg border bg-card px-4">
                <AccordionTrigger className="text-left hover:no-underline py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-primary mb-0.5">
                        {item.category}
                      </span>
                      <span className="text-sm font-semibold text-foreground">{item.question}</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-11 text-xs text-muted-foreground leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>

        {filtered.length === 0 && (
          <p className="text-center py-8 text-sm text-muted-foreground">No matching topics found.</p>
        )}
      </div>
    </section>
  );
}
