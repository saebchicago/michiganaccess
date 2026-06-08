import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Link } from "react-router-dom";
import {
  RESOURCE_COUNT_DISPLAY,
  DATA_SOURCE_DISPLAY,
} from "@/config/platformConstants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  Heart,
  Database,
  MapPin,
  DollarSign,
  AlertTriangle,
  Building,
} from "lucide-react";

/* ── Funnel rates ────────────────────────────────────────────────────── */
const SCREEN_POSITIVE_RATE = 0.274;
const REFERRAL_RATE = 0.68;
const ACTUAL_REFERRAL = 0.42;
const CONNECTION_RATE = 0.31;
const PREVENTION_RATE = 0.16;
const AVG_COST = 14500;

/* ── Health system regions ───────────────────────────────────────────── */
interface HealthRegion {
  label: string;
  defaultPop: number;
  description: string;
}
const REGIONS: Record<string, HealthRegion> = {
  statewide: {
    label: "Statewide",
    defaultPop: 1_000_000,
    description: "All Michigan health systems combined",
  },
  metro_detroit: {
    label: "Metro Detroit",
    defaultPop: 1_800_000,
    description: "Wayne, Oakland, Macomb tri-county",
  },
  west_michigan: {
    label: "West Michigan",
    defaultPop: 650_000,
    description: "Kent, Ottawa, Muskegon, Allegan",
  },
  upper_peninsula: {
    label: "Upper Peninsula",
    defaultPop: 120_000,
    description: "15 UP counties",
  },
};

/* ── Source labels ────────────────────────────────────────────────────── */
const SOURCES = {
  screened: "Trinity Health 2023 SDOH Screening Report (verified)",
  positive: "NACHC 2023 (illustrative)",
  referral: "Journal of AHIMA 2023 (illustrative)",
  connection: "RWJF 2022 (illustrative)",
};

/* ── Formatting helpers ──────────────────────────────────────────────── */
const fmt = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `${(n / 1_000).toFixed(0)}K`
      : String(Math.round(n));
const fmtDollar = (n: number) =>
  n >= 1_000_000_000
    ? `$${(n / 1_000_000_000).toFixed(1)}B`
    : n >= 1_000_000
      ? `$${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
        ? `$${(n / 1_000).toFixed(0)}K`
        : `$${Math.round(n)}`;

interface Stage {
  label: string;
  value: number;
  pct: number;
  color: string;
  bgColor: string;
  desc: string;
  source: string;
}

function FunnelBar({
  stage,
  maxValue,
  index,
}: {
  stage: Stage;
  maxValue: number;
  index: number;
}) {
  const widthPct = Math.max((stage.value / maxValue) * 100, 4);
  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      className="space-y-1"
    >
      <div className="flex items-end justify-between">
        <span className="text-sm font-semibold text-gray-200">
          {stage.label}
        </span>
        <span className="text-xs text-gray-400 tabular-nums">
          {fmt(stage.value)} people
        </span>
      </div>
      <div className="w-full bg-white/5 rounded-lg h-10 overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${widthPct}%` }}
          viewport={{ once: true }}
          transition={{
            delay: index * 0.15 + 0.2,
            duration: 0.8,
            ease: "easeOut",
          }}
          className={`h-full rounded-lg ${stage.color} flex items-center px-3`}
        >
          <span className="text-xs font-bold text-white whitespace-nowrap">
            {stage.pct}%
          </span>
        </motion.div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-gray-500 leading-snug flex-1">
          {stage.desc}
        </p>
        <span className="text-[9px] text-gray-600 ml-2 shrink-0 italic">
          {stage.source}
        </span>
      </div>
    </motion.div>
  );
}

function GapCallout({
  label,
  value,
  delay,
}: {
  label: string;
  value: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      className="ml-8 my-1 flex items-center gap-2"
    >
      <div className="w-1 h-8 bg-michigan-coral/60 rounded-full" />
      <div className="bg-michigan-coral/10 border border-michigan-coral/20 rounded-lg px-3 py-1.5">
        <p className="text-xs text-michigan-coral font-semibold">{label}</p>
        <p className="text-[10px] text-michigan-coral/70">{value}</p>
      </div>
    </motion.div>
  );
}

export default function DetectionGapPage() {
  const [region, setRegion] = useState("statewide");
  const regionData = REGIONS[region];
  const [volume, setVolume] = useState([regionData.defaultPop]);

  usePageMeta({
    title: "The Detection Gap - Access Michigan",
    description:
      "Health systems screen millions for social needs but lack the infrastructure to act. See the data behind Michigan's detection-to-action gap.",
    path: "/detection-gap",
  });

  const handleRegionChange = (val: string) => {
    setRegion(val);
    setVolume([REGIONS[val].defaultPop]);
  };

  const calc = useMemo(() => {
    const screened = volume[0];
    const positive = Math.round(screened * SCREEN_POSITIVE_RATE);
    const referred = Math.round(positive * REFERRAL_RATE);
    const actuallyReferred = Math.round(positive * ACTUAL_REFERRAL);
    const connected = Math.round(actuallyReferred * CONNECTION_RATE);
    const unconnected = positive - connected;
    const prevented = Math.round(connected * PREVENTION_RATE);
    const savings = prevented * AVG_COST;
    const gapCost = Math.round(unconnected * PREVENTION_RATE * AVG_COST);
    const preventableHospitalizations = Math.round(unconnected * 0.08);
    const unmetNeedsCost = Math.round(unconnected * 3200);
    return {
      screened,
      positive,
      referred,
      actuallyReferred,
      connected,
      unconnected,
      prevented,
      savings,
      gapCost,
      preventableHospitalizations,
      unmetNeedsCost,
    };
  }, [volume]);

  const stages: Stage[] = [
    {
      label: "Patients Screened for Social Needs",
      value: calc.screened,
      pct: 100,
      color: "bg-primary",
      bgColor: "bg-primary/20",
      desc: "Major Michigan health systems routinely screen patients for SDOH.",
      source: SOURCES.screened,
    },
    {
      label: "Screen Positive - Unmet Need (27.4%)",
      value: calc.positive,
      pct: 27.4,
      color: "bg-michigan-teal",
      bgColor: "bg-michigan-teal/20",
      desc: "Reported at least one unmet social need: food, housing, transportation, or utilities.",
      source: SOURCES.positive,
    },
    {
      label: "Referred to Community Resources (42%)",
      value: calc.actuallyReferred,
      pct: 42,
      color: "bg-michigan-gold",
      bgColor: "bg-michigan-gold/20",
      desc: "Of those screening positive, only 42% receive an actual referral to a community resource.",
      source: SOURCES.referral,
    },
    {
      label: "Successfully Connected to Services (31%)",
      value: calc.connected,
      pct: 31,
      color: "bg-michigan-forest",
      bgColor: "bg-michigan-forest/20",
      desc: "Of those referred, only 31% successfully connect - the rest fall through gaps.",
      source: SOURCES.connection,
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-[hsl(210,50%,6%)] text-white">
        {/* Hero */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
          <div className="max-w-5xl mx-auto px-6 py-12 relative">
            <Breadcrumbs
              items={[
                { label: "Partners", href: "/partners" },
                { label: "Detection Gap" },
              ]}
            />
            <div className="flex items-center gap-2 mb-4 mt-4">
              <div className="w-10 h-1 bg-primary rounded-full" />
              <Badge
                variant="outline"
                className="uppercase tracking-wider text-xs border-primary/30 text-primary"
              >
                Research Insight
              </Badge>
            </div>
            {/* Render "The Detection Gap" as one continuous string
                so crawlers and screen readers see the full headline.
                The visual line break is driven by CSS (md:block on
                the second span) rather than a literal <br/>, which
                previously left the h1 truncated to "The Detection"
                in static previews and on some text-only renders. */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-extrabold leading-tight mb-4"
            >
              The Detection{" "}
              <span className="md:block text-transparent bg-clip-text bg-gradient-to-r from-destructive to-[hsl(var(--michigan-gold))]">
                Gap
              </span>
            </motion.h1>
            <p className="text-base text-gray-400 max-w-xl">
              Michigan health systems screen millions for social needs but lack
              the infrastructure to connect patients to services. Select a
              region and adjust the slider to model impact at any scale.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 pb-16">
          {/* Controls: Region + Slider */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12 bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
          >
            {/* Region selector */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">
                  Health System Region
                </label>
                <Select value={region} onValueChange={handleRegionChange}>
                  <SelectTrigger className="w-52 bg-white/5 border-white/10 text-white h-9">
                    <Building className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(REGIONS).map(([key, r]) => (
                      <SelectItem key={key} value={key}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-gray-500 mt-1 sm:mt-4">
                {regionData.description}
              </p>
            </div>

            {/* Volume slider */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-200">
                  Adjust Screening Volume
                </label>
                <span className="text-lg font-bold text-primary tabular-nums">
                  {fmt(volume[0])} patients
                </span>
              </div>
              <Slider
                value={volume}
                onValueChange={setVolume}
                min={50_000}
                max={5_000_000}
                step={50_000}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-[10px] text-gray-600">
                <span>50K</span>
                <span>1M (Trinity actual)</span>
                <span>5M</span>
              </div>
            </div>
          </motion.div>

          {/* Main content: funnel + cost panel */}
          <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
            {/* Left: Funnel */}
            <div className="space-y-2">
              <FunnelBar stage={stages[0]} maxValue={calc.screened} index={0} />

              <GapCallout
                label={`${fmt(calc.screened - calc.positive)} patients screened negative`}
                value="No social needs detected - they exit the funnel"
                delay={0.3}
              />

              <FunnelBar stage={stages[1]} maxValue={calc.screened} index={1} />

              <GapCallout
                label={`${fmt(calc.positive - calc.actuallyReferred)} never referred`}
                value="Screened positive but no referral - 58% of positive screens"
                delay={0.45}
              />

              <FunnelBar stage={stages[2]} maxValue={calc.screened} index={2} />

              <GapCallout
                label={`${fmt(calc.actuallyReferred - calc.connected)} referred but not connected`}
                value="Referral made but connection failed - 69% referral drop-off"
                delay={0.6}
              />

              <FunnelBar stage={stages[3]} maxValue={calc.screened} index={3} />
            </div>

            {/* Right: Cost Stats Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="space-y-4 lg:sticky lg:top-20 lg:self-start"
            >
              <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
                <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-michigan-gold" />
                  Cost of Inaction
                  <Badge
                    variant="outline"
                    className="text-[8px] border-michigan-gold/30 text-michigan-gold"
                  >
                    Illustrative
                  </Badge>
                </h3>

                <div className="space-y-3">
                  <div className="rounded-lg bg-michigan-coral/10 border border-michigan-coral/20 p-3">
                    <p className="text-xl font-bold text-michigan-coral">
                      {fmtDollar(calc.unmetNeedsCost)}
                    </p>
                    <p className="text-[10px] text-michigan-coral/70">
                      est. annual cost of unmet needs
                    </p>
                    <p className="text-[9px] text-gray-600 italic mt-1">
                      Illustrative: $3,200/person/yr avg
                    </p>
                  </div>

                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                    <p className="text-xl font-bold text-red-400">
                      {fmt(calc.preventableHospitalizations)}
                    </p>
                    <p className="text-[10px] text-red-400/70">
                      preventable hospitalizations
                    </p>
                    <p className="text-[9px] text-gray-600 italic mt-1">
                      Illustrative: 8% of unconnected
                    </p>
                  </div>

                  <div className="rounded-lg bg-michigan-gold/10 border border-michigan-gold/20 p-3">
                    <p className="text-xl font-bold text-michigan-gold">
                      {fmtDollar(calc.gapCost)}
                    </p>
                    <p className="text-[10px] text-michigan-gold/70">
                      preventable hospitalization cost
                    </p>
                    <p className="text-[9px] text-gray-600 italic mt-1">
                      Illustrative: AHRQ $14,500 avg
                    </p>
                  </div>

                  <div className="rounded-lg bg-michigan-forest/10 border border-michigan-forest/20 p-3">
                    <p className="text-xl font-bold text-michigan-forest">
                      {fmtDollar(calc.savings)}
                    </p>
                    <p className="text-[10px] text-michigan-forest/70">
                      savings from connections made
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-[10px] text-gray-500">
                <AlertTriangle className="h-3 w-3 inline mr-1 text-michigan-gold" />
                All dollar calculations are{" "}
                <strong className="text-gray-400">
                  illustrative estimates
                </strong>{" "}
                based on published research averages. Actual costs vary by
                region, payer mix, and patient acuity.
              </div>
            </motion.div>
          </div>

          {/* Impact summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-10 grid gap-4 sm:grid-cols-3"
          >
            <Card className="bg-michigan-forest/10 border-michigan-forest/20">
              <CardContent className="py-5 text-center">
                <p className="text-3xl font-bold text-michigan-forest">
                  {fmt(calc.prevented)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  hospitalizations prevented
                </p>
              </CardContent>
            </Card>
            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="py-5 text-center">
                <p className="text-3xl font-bold text-primary">
                  {fmtDollar(calc.savings)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  estimated cost savings
                </p>
              </CardContent>
            </Card>
            <Card className="bg-michigan-coral/10 border-michigan-coral/20">
              <CardContent className="py-5 text-center">
                <p className="text-3xl font-bold text-michigan-coral">
                  {fmtDollar(calc.gapCost)}
                </p>
                <p className="text-xs text-gray-400 mt-1">lost to the gap</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* CTA: Is your system ready? */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 rounded-2xl border border-michigan-gold/20 bg-michigan-gold/5 p-8 text-center"
          >
            <h3 className="text-xl font-bold text-white mb-2">
              Is your system ready to close this gap?
            </h3>
            <p className="text-sm text-gray-400 mb-6 max-w-lg mx-auto">
              Access Michigan provides the infrastructure layer between
              screening and services - structured referral pathways,
              equity-weighted routing, and real-time resource data across all 83
              counties.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/for-health-systems"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
              >
                For Health System Leaders <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/for-payers"
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-2.5 text-sm font-semibold text-gray-200 hover:bg-white/5 transition-colors"
              >
                For Payers & Plans <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/for-government"
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-2.5 text-sm font-semibold text-gray-200 hover:bg-white/5 transition-colors"
              >
                For Government <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>

          {/* Access Michigan bridges this gap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-8"
          >
            <h3 className="text-lg font-bold text-white mb-2">
              Access Michigan Bridges This Gap
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              The missing infrastructure between screening and services -
              structured, equity-weighted, covering every county.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: MapPin, stat: "83", label: "counties covered" },
                {
                  icon: Database,
                  stat: RESOURCE_COUNT_DISPLAY,
                  label: "resources indexed",
                },
                {
                  icon: Heart,
                  stat: DATA_SOURCE_DISPLAY,
                  label: "data sources integrated",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{item.stat}</p>
                    <p className="text-xs text-gray-500">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/for-health-systems"
              className="inline-flex items-center gap-1 mt-6 text-sm text-primary hover:underline"
            >
              For Health System Leaders <ArrowRight className="h-3 w-3" />
            </Link>
          </motion.div>

          {/* Sources */}
          <div className="mt-12 rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-gray-500">
              <strong className="text-gray-400">Data Sources:</strong> Trinity
              Health Community Impact Report (FY2025, published Jan 2026) -
              27.4% unmet need rate; ~16% hospitalization reduction is
              system-reported and not independently verified or peer-reviewed.{" "}
              NACHC 2023 Social Determinants Screening Report - 68% screen
              positive illustrative benchmark. Journal of AHIMA 2023 - 42%
              referral rate illustrative. RWJF 2022 Evidence Hub - 31%
              connection rate illustrative. CDC Social Determinants of Health
              evidence base. Cost per preventable hospitalization ($14,500) from
              AHRQ HCUP. All dollar figures are illustrative. See{" "}
              <a href="/methodology" className="text-primary hover:underline">
                Methodology
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
