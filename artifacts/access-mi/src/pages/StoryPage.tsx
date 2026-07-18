import { useState, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Shield,
  Heart,
  ArrowRight,
  ArrowDown,
  ExternalLink,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useCountUp } from "@/hooks/useCountUp";
import {
  COUNTIES_COVERED,
} from "@/config/platformConstants";

const DetectionGapFunnel = lazy(
  () => import("@/components/shared/DetectionGapFunnel"),
);
const FrontDoorTriage = lazy(() => import("@/components/home/FrontDoorTriage"));

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-20px" },
  transition: { duration: 0.5 },
};

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay: i * 0.15 },
});

function AnimStat({
  value,
  label,
  source,
  className = "",
}: {
  value: number;
  label: string;
  source: string;
  className?: string;
}) {
  const { value: display, ref } = useCountUp<HTMLParagraphElement>(value, 1500);
  return (
    <div className={`text-center ${className}`}>
      <p ref={ref} className="text-4xl lg:text-5xl font-bold tabular-nums">
        {display.toLocaleString()}
      </p>
      <p className="text-sm mt-1 opacity-80">{label}</p>
      <p className="text-[9px] opacity-50 mt-0.5">{source}</p>
    </div>
  );
}

export default function StoryPage() {
  const [triageOpen, setTriageOpen] = useState(false);

  usePageMeta({
    title: "About Access Michigan | Independent Michigan Civic Intelligence",
    description:
      "An independent citizen initiative. Built by and for fellow citizens.",
    path: "/story",
  });

  return (
    <Layout>
      {/* Triage overlay */}
      <AnimatePresence>
        {triageOpen && (
          <Suspense fallback={null}>
            <FrontDoorTriage onClose={() => setTriageOpen(false)} />
          </Suspense>
        )}
      </AnimatePresence>

      {/* ═══ SECTION 1: Michigan by the Numbers ═══ */}
      <section className="min-h-screen flex items-center justify-center bg-michigan-blue text-white px-4 relative">
        <div className="max-w-3xl text-center">
          <motion.h1
            {...fadeIn}
            className="text-4xl lg:text-6xl font-bold leading-tight mb-8"
          >
            10 million residents. 83 counties.
            <br />
            <span className="text-michigan-teal-deep">
              Who falls through the gaps?
            </span>
          </motion.h1>
          <motion.div
            {...fadeIn}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12"
          >
            {/* Source: Feeding America 2024 */}
            <AnimStat
              value={1544250}
              label="food insecure residents"
              source="Feeding America 2024"
            />
            {/* Source: United For ALICE 2023 */}
            <div className="text-center">
              <p className="text-4xl lg:text-5xl font-bold tabular-nums">41%</p>
              <p className="text-sm mt-1 opacity-80">
                of households below ALICE threshold
              </p>
              <p className="text-[9px] opacity-50 mt-0.5">
                United For ALICE 2023
              </p>
            </div>
            {/* Source: HMA March 2025 */}
            <AnimStat
              value={1772000}
              label="on Medicaid managed care"
              source="HMA March 2025"
            />
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
        >
          <ArrowDown className="h-6 w-6 text-white/60" />
        </motion.div>
      </section>

      {/* ═══ SECTION 2: The Detection Gap ═══ */}
      <section className="bg-background px-4 py-20">
        <div className="container max-w-3xl">
          <motion.div {...fadeIn}>
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed mb-8">
              Of <strong className="text-foreground">1.77 million</strong>{" "}
              Medicaid beneficiaries, only{" "}
              <strong className="text-foreground">27%</strong> are screened for
              social needs. Of those screened, just{" "}
              <strong className="text-red-600">11%</strong> get connected to
              help.
            </p>
            <p className="text-[10px] text-muted-foreground/60 -mt-6 mb-8">
              Source: HMA March 2025 (enrollment), Trinity Health reference
              rate (27.4% screened), HealthAffairs national avg (~11%
              resolution) - see funnel below for full breakdown
            </p>
          </motion.div>
          <motion.div {...fadeIn} transition={{ duration: 0.6, delay: 0.2 }}>
            <Suspense
              fallback={
                <div className="h-64 animate-pulse bg-muted rounded-xl" />
              }
            >
              <DetectionGapFunnel variant="full" />
            </Suspense>
          </motion.div>
          <motion.p
            {...fadeIn}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-base text-muted-foreground mt-8 border-l-4 border-red-500 pl-4"
          >
            89% of identified needs never reach resolution. That's not a
            knowledge problem. It's an infrastructure problem.
          </motion.p>
        </div>
      </section>

      {/* ═══ SECTION 3: The Behavioral Health Desert ═══ */}
      <section className="bg-muted/30 px-4 py-20">
        <div className="container max-w-4xl">
          <motion.h2
            {...fadeIn}
            className="text-3xl lg:text-4xl font-bold text-foreground mb-10 text-center"
          >
            The Behavioral Health Desert
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              /* Source: Treatment Advocacy Center */
              {
                num: "47th",
                label:
                  "Michigan's national ranking in psychiatric bed availability",
                source: "Treatment Advocacy Center",
              },
              /* Source: MDHHS */
              {
                num: "13 of 15",
                label:
                  "Upper Peninsula counties with zero inpatient psych beds",
                source: "MDHHS CON 2024",
              },
              /* Source: MHA */
              {
                num: "155+",
                label: "Patients boarding in Michigan ERs on any given day",
                source: "Michigan Hospital Association (survey est.)",
              },
              /* Source: MHA / MDHHS */
              {
                num: "17",
                label:
                  "Children waiting in ERs for behavioral health placement, daily",
                source: "MHA / MDHHS",
              },
            ].map((s, i) => (
              <motion.div key={s.num} {...stagger(i)}>
                <Card>
                  <CardContent className="py-6 text-center">
                    <p className="text-3xl lg:text-4xl font-bold text-foreground">
                      {s.num}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {s.label}
                    </p>
                    <p className="text-[9px] text-muted-foreground/60 mt-1">
                      Source: {s.source}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <motion.div
            {...fadeIn}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center"
          >
            {/* Source: SAMHSA/MDHHS 988 Performance */}
            <p className="text-base text-foreground">
              But Michigan answers 988 crisis calls in{" "}
              <strong className="text-michigan-teal-deep">13 seconds</strong> - best
              among high-volume states.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              261,000 calls answered since July 2022. Source: SAMHSA/MDHHS
            </p>
            <Link
              to="/behavioral-health"
              className="text-sm text-primary hover:underline mt-3 inline-flex items-center gap-1"
            >
              Explore the full Behavioral Health Dashboard{" "}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══ SECTION 4: The Rural Hospital Crisis ═══ */}
      <section className="bg-background px-4 py-20">
        <div className="container max-w-3xl">
          <motion.h2
            {...fadeIn}
            className="text-3xl lg:text-4xl font-bold text-foreground mb-10 text-center"
          >
            The Rural Hospital Crisis
          </motion.h2>
          <div className="space-y-6">
            {[
              /* Source: Flex Monitoring Team CAH State Reports */
              {
                text: "35 Critical Access Hospitals serve rural Michigan",
                source: "Flex Monitoring Team",
                url: "https://flexmonitoring.org/michigan/",
              },
              /* Source: CHQPR Dec 2025 */
              {
                text: "13 are at risk of closure. 5 face immediate threat.",
                source: "CHQPR December 2025",
                url: "https://chqpr.org",
              },
              /* Source: Bridge Michigan / MHA */
              {
                text: "17+ OB units have closed since 2008",
                source: "Bridge Michigan / MHA",
              },
              /* Source: March of Dimes 2024 Maternity Care Deserts Report */
              {
                text: "18 counties are now maternity care deserts",
                source: "March of Dimes 2024",
                url: "https://www.marchofdimes.org/sites/default/files/2024-10/2024_Maternity_Care_Report.pdf",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                {...stagger(i)}
                className="flex items-start gap-4"
              >
                <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-red-600 font-bold text-sm">
                    {i + 1}
                  </span>
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    {item.text}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Source:{" "}
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 underline hover:text-foreground"
                      >
                        {item.source}
                        <ExternalLink className="h-2.5 w-2.5 ml-0.5 opacity-70" />
                      </a>
                    ) : (
                      item.source
                    )}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          {/* Source: Sturgis Hospital */}
          <motion.div {...fadeIn} transition={{ delay: 0.6 }}>
            <Card className="mt-8 border-teal-200/50 dark:border-teal-900/30 bg-teal-50/30 dark:bg-teal-950/10">
              <CardContent className="py-5">
                <p className="text-sm text-foreground leading-relaxed">
                  <strong>Sturgis Hospital</strong> converted to Michigan's
                  first Rural Emergency Hospital in July 2023 - trading
                  inpatient beds for guaranteed $291K/month federal payments and
                  105% outpatient rates.
                </p>
                <p className="text-[9px] text-muted-foreground/60 mt-1">
                  Source: Sturgis Hospital / CMS REH Program
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ═══ SECTION 5: The Trust Deficit ═══ */}
      <section className="bg-amber-50/50 dark:bg-amber-950/10 px-4 py-20">
        <div className="container max-w-4xl">
          <motion.div {...fadeIn} className="text-center mb-10">
            {/* Source: CLOSUP MPPS Spring 2025 – measures LOCAL LEADERS' trust in residents, not citizens' trust in government */}
            <p className="text-2xl lg:text-3xl font-bold text-foreground leading-tight">
              Local leaders' trust in Michigan residents fell from{" "}
              <span className="text-amber-600">65%</span> to below{" "}
              <span className="text-red-600">40%</span> between 2020 and 2025.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Source:{" "}
              <a
                href="https://closup.umich.edu/sites/closup/files/2025-11/MPPS-Spring-2025-Trust-and-Democracy.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 underline hover:text-foreground"
              >
                CLOSUP Michigan Public Policy Survey, Spring 2025
                <ExternalLink className="h-2.5 w-2.5 ml-0.5 opacity-70" />
              </a>{" "}
              (1,328 local jurisdictions, 72% response rate)
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div {...stagger(0)}>
              <Card className="h-full border-red-200/50 dark:border-red-900/30">
                <CardContent className="py-5">
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2">
                    The Crisis
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">
                    In Flint, 70% of residents didn't trust government
                    assurances about water safety after the 2014 crisis. Lead
                    testing rates failed to increase despite known exposure.
                  </p>
                  <p className="text-[9px] text-muted-foreground/60 mt-2">
                    Source: Wayne State / American Scientist
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div {...stagger(1)}>
              <Card className="h-full border-teal-200/50 dark:border-teal-900/30">
                <CardContent className="py-5">
                  <p className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-2">
                    The Response
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">
                    Rx Kids - Flint's universal perinatal cash transfer -
                    achieved 98% enrollment and raised trust in healthcare
                    institutions by 10 percentage points.
                  </p>
                  <p className="text-[9px] text-muted-foreground/60 mt-2">
                    Source: rxkids.org / U-M Poverty Solutions
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 6: What Access Michigan Does ═══ */}
      <section className="bg-gradient-to-br from-michigan-blue to-michigan-teal text-white px-4 py-20">
        <div className="container max-w-4xl text-center">
          <motion.h2
            {...fadeIn}
            className="text-3xl lg:text-4xl font-bold mb-10"
          >
            What Access Michigan Does
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            {[
              {
                icon: Search,
                title: "Connects",
                desc: `Community resources across all ${COUNTIES_COVERED} counties, searchable by ZIP`,
              },
              {
                icon: Shield,
                title: "Verifies",
                desc: "Every data point traced to a public source. 26+ verified anchors.",
              },
              {
                icon: Heart,
                title: "Navigates",
                desc: "3-question triage routes residents to help in 60 seconds",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                {...stagger(i)}
                className="text-center"
              >
                <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="text-sm opacity-80 mt-1">{item.desc}</p>
              </motion.div>
            ))}
          </div>
          <motion.div {...fadeIn} transition={{ delay: 0.4 }}>
            <button
              type="button"
              onClick={() => setTriageOpen(true)}
              aria-label="Open help finder - get connected to Michigan resources"
              className="inline-flex items-center gap-2 rounded-xl bg-white text-michigan-blue py-3 px-8 text-sm font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              <Heart className="h-4 w-4" fill="currentColor" /> Get Help Now
            </button>
          </motion.div>
        </div>
      </section>

      {/* ═══ SECTION 7: Explore the Data ═══ */}
      <section className="py-20 px-4 bg-background">
        <div className="container max-w-4xl">
          <motion.h2
            {...fadeIn}
            className="text-2xl font-bold text-foreground text-center mb-8"
          >
            Explore the Data
          </motion.h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { label: "Health Equity Atlas", href: "/health-equity-atlas" },
              { label: "Behavioral Health", href: "/behavioral-health" },
              { label: "Tribal Nations", href: "/tribal-nations" },
              { label: "Find Care", href: "/find-care" },
              { label: "Financial Help", href: "/financial-help" },
              { label: "All 83 Counties", href: "/county/wayne" },
            ].map((link, i) => (
              <motion.div key={link.label} {...stagger(i)}>
                <Link to={link.href} className="block group">
                  <Card className="hover:shadow-md hover:border-primary/30 transition-all">
                    <CardContent className="py-4 text-center">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {link.label}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
          <motion.p
            {...fadeIn}
            className="text-center text-sm text-muted-foreground mt-8"
          >
            accessmi.org - Independent Michigan civic intelligence. Built by and
            for fellow Michiganders.
          </motion.p>
        </div>
      </section>
    </Layout>
  );
}
