import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, Database, MapPin } from "lucide-react";

const DETECT_RATE = 0.274;
const CONNECTION_RATE = 0.35;
const PREVENTION_RATE = 0.16;
const AVG_COST = 14500;

const fmt = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : String(Math.round(n));
const fmtDollar = (n: number) => n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `$${(n / 1_000).toFixed(0)}K` : `$${Math.round(n)}`;

interface Stage {
  label: string;
  value: number;
  pct: number;
  color: string;
  bgColor: string;
  desc: string;
}

function FunnelBar({ stage, maxValue, index }: { stage: Stage; maxValue: number; index: number }) {
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
        <span className="text-sm font-semibold text-gray-200">{stage.label}</span>
        <span className="text-xs text-gray-400 tabular-nums">{fmt(stage.value)} people</span>
      </div>
      <div className="w-full bg-white/5 rounded-lg h-10 overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${widthPct}%` }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.15 + 0.2, duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-lg ${stage.color} flex items-center px-3`}
        >
          <span className="text-xs font-bold text-white whitespace-nowrap">{stage.pct}%</span>
        </motion.div>
      </div>
      <p className="text-[11px] text-gray-500 leading-snug">{stage.desc}</p>
    </motion.div>
  );
}

function GapCallout({ label, value, delay }: { label: string; value: string; delay: number }) {
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
  const [volume, setVolume] = useState([1_000_000]);

  usePageMeta({
    title: "The Detection Gap — Access Michigan",
    description: "Health systems screen millions for social needs but lack the infrastructure to act. See the data behind Michigan's detection-to-action gap.",
    path: "/detection-gap",
  });

  const calc = useMemo(() => {
    const screened = volume[0];
    const detected = Math.round(screened * DETECT_RATE);
    const connected = Math.round(detected * CONNECTION_RATE);
    const unconnected = detected - connected;
    const prevented = Math.round(connected * PREVENTION_RATE);
    const savings = prevented * AVG_COST;
    const gapCost = Math.round(unconnected * PREVENTION_RATE * AVG_COST);
    return { screened, detected, connected, unconnected, prevented, savings, gapCost };
  }, [volume]);

  const stages: Stage[] = [
    { label: "Patients Screened for Social Needs", value: calc.screened, pct: 100, color: "bg-primary", bgColor: "bg-primary/20", desc: "Major Michigan health systems routinely screen patients for SDOH — food, housing, transportation, utilities." },
    { label: "Unmet Needs Detected (27.4%)", value: calc.detected, pct: 27.4, color: "bg-michigan-teal", bgColor: "bg-michigan-teal/20", desc: "Trinity Health FY2025: 27.4% of 1M+ outpatients screened reported at least one unmet social need." },
    { label: "Actually Connected to Services (~35%)", value: calc.connected, pct: Math.round((calc.connected / calc.screened) * 1000) / 10, color: "bg-michigan-gold", bgColor: "bg-michigan-gold/20", desc: "Even with warm handoffs, only ~35% of patients with detected needs are connected to community resources." },
    { label: "Preventable Hospitalizations Avoided", value: calc.prevented, pct: Math.round((calc.prevented / calc.screened) * 1000) / 10, color: "bg-michigan-forest", bgColor: "bg-michigan-forest/20", desc: "Trinity Health: 16% decrease in preventable hospitalizations among connected patients (FY2025)." },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-[hsl(210,50%,6%)] text-white">
        {/* Hero */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
          <div className="max-w-4xl mx-auto px-6 py-12 relative">
            <Breadcrumbs items={[{ label: "Partners", href: "/partners" }, { label: "Detection Gap" }]} />
            <div className="flex items-center gap-2 mb-4 mt-4">
              <div className="w-10 h-1 bg-primary rounded-full" />
              <Badge variant="outline" className="uppercase tracking-wider text-xs border-primary/30 text-primary">Interactive Research</Badge>
            </div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
              The Detection<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-destructive to-[hsl(var(--michigan-gold))]">Gap</span>
            </motion.h1>
            <p className="text-base text-gray-400 max-w-xl">
              Michigan health systems screen millions for social needs but lack the infrastructure to connect patients to services. Drag the slider to see the impact at any scale.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 pb-16">
          {/* Slider */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12 bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-200">Adjust Screening Volume</label>
              <span className="text-lg font-bold text-primary tabular-nums">{fmt(volume[0])} patients</span>
            </div>
            <Slider
              value={volume}
              onValueChange={setVolume}
              min={100_000}
              max={5_000_000}
              step={50_000}
              className="w-full"
            />
            <div className="flex justify-between mt-2 text-[10px] text-gray-600">
              <span>100K</span>
              <span>1M (Trinity actual)</span>
              <span>5M</span>
            </div>
          </motion.div>

          {/* Funnel */}
          <div className="space-y-2">
            <FunnelBar stage={stages[0]} maxValue={calc.screened} index={0} />

            <GapCallout
              label={`${fmt(calc.screened - calc.detected)} patients screened negative`}
              value="No social needs detected — they exit the funnel"
              delay={0.3}
            />

            <FunnelBar stage={stages[1]} maxValue={calc.screened} index={1} />

            <GapCallout
              label={`Gap cost: ~${fmtDollar(calc.gapCost)} in preventable hospitalizations`}
              value={`${fmt(calc.unconnected)} patients with needs never connected to services`}
              delay={0.5}
            />

            <FunnelBar stage={stages[2]} maxValue={calc.screened} index={2} />
            <FunnelBar stage={stages[3]} maxValue={calc.screened} index={3} />
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
                <p className="text-3xl font-bold text-michigan-forest">{fmt(calc.prevented)}</p>
                <p className="text-xs text-gray-400 mt-1">hospitalizations prevented</p>
              </CardContent>
            </Card>
            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="py-5 text-center">
                <p className="text-3xl font-bold text-primary">{fmtDollar(calc.savings)}</p>
                <p className="text-xs text-gray-400 mt-1">estimated cost savings</p>
              </CardContent>
            </Card>
            <Card className="bg-michigan-coral/10 border-michigan-coral/20">
              <CardContent className="py-5 text-center">
                <p className="text-3xl font-bold text-michigan-coral">{fmtDollar(calc.gapCost)}</p>
                <p className="text-xs text-gray-400 mt-1">lost to the gap</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Access Michigan bridges this gap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-8"
          >
            <h3 className="text-lg font-bold text-white mb-2">Access Michigan Bridges This Gap</h3>
            <p className="text-sm text-gray-400 mb-6">
              The missing infrastructure between screening and services — structured, equity-weighted, covering every county.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: MapPin, stat: "83", label: "counties covered" },
                { icon: Database, stat: "15,000+", label: "resources indexed" },
                { icon: Heart, stat: "25+", label: "data sources integrated" },
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
            <Link to="/for-health-systems" className="inline-flex items-center gap-1 mt-6 text-sm text-primary hover:underline">
              For Health System Leaders <ArrowRight className="h-3 w-3" />
            </Link>
          </motion.div>

          {/* Sources */}
          <div className="mt-12 rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-gray-500">
              <strong className="text-gray-400">Data Sources:</strong> Trinity Health Community Impact Report (FY2025, published Jan 2026) — 27.4% unmet need rate, 16% hospitalization reduction. CDC Social Determinants of Health evidence base. Connection rate (~35%) estimated from CDC warm-handoff studies. Cost per preventable hospitalization ($14,500) from AHRQ HCUP. All statistics reflect published research; see <a href="/methodology" className="text-primary hover:underline">Methodology</a>.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
