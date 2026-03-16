import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";

const STAGES = [
  { id: "screen", title: "Health Systems Screen", stat: "2.4M+", label: "patients screened annually for social needs in Michigan", desc: "Major health systems including Michigan Medicine, Henry Ford Health, Trinity Health, and Spectrum Health now routinely screen patients for social determinants of health — food insecurity, housing instability, transportation barriers, and utility needs.", visual: "funnel-top" as const, source: "Michigan DHHS SDOH screening program data" },
  { id: "detect", title: "Needs Are Detected", stat: "17.1%", label: "of screened patients have unmet social needs", desc: "Michigan Medicine's MSHIELD program found that roughly 1 in 6 patients screened positive for at least one unmet social need. Across the state, that represents hundreds of thousands of patients annually whose health is impacted by non-clinical factors.", visual: "funnel-mid" as const, source: "Michigan Medicine MSHIELD program" },
  { id: "gap", title: "The Gap Opens", stat: "Only 34%", label: "of those with needs actually requested assistance", desc: "Two-thirds of patients who screened positive for social needs did not request help. Barriers include: stigma, lack of awareness of available resources, complex enrollment processes, and the absence of a structured pathway from screening to service connection.", visual: "gap" as const, source: "Michigan Medicine MSHIELD program" },
  { id: "impact", title: "When the Gap Closes", stat: "16%", label: "reduction in preventable hospitalizations", desc: "Trinity Health's SDOH intervention program demonstrated that when patients are connected to social services, preventable hospitalizations drop significantly. This represents both better patient outcomes and measurable cost savings for health systems.", visual: "impact" as const, source: "Trinity Health published SDOH outcomes" },
  { id: "solution", title: "Bridging the Gap", stat: "83", label: "counties covered by Access Michigan", desc: "Access Michigan provides the missing infrastructure — a structured, equity-weighted resource directory covering all 83 Michigan counties. No login required, no personal data collected, no commercial bias. Community health workers, care navigators, and patients themselves can connect screenings to services.", visual: "bridge" as const, source: "Access Michigan platform data" },
];

type VisualStage = typeof STAGES[number]["visual"];

function FunnelViz({ stage }: { stage: VisualStage }) {
  const heights: Record<VisualStage, number[]> = {
    "funnel-top": [100, 0, 0], "funnel-mid": [100, 60, 0], gap: [100, 60, 20], impact: [100, 60, 55], bridge: [100, 80, 75],
  };
  const h = heights[stage];
  const bars = [
    { pct: h[0], color: "from-primary to-primary/60", label: "Screened" },
    { pct: h[1], color: "from-[hsl(var(--michigan-gold))] to-destructive", label: "Needs Found" },
    { pct: h[2], color: stage === "impact" || stage === "bridge" ? "from-[hsl(var(--michigan-forest))] to-primary" : "from-destructive to-destructive", label: stage === "gap" ? "Got Help" : stage === "impact" ? "Outcomes Improved" : "Connected" },
  ];

  return (
    <div className="relative w-full h-64 flex items-end justify-center gap-3">
      {bars.map((bar, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1 max-w-[100px]">
          <div className="w-full relative rounded-t-lg overflow-hidden" style={{ height: `${Math.max(h[i] * 2.2, 4)}px`, transition: "height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
            <div className={`absolute inset-0 bg-gradient-to-t ${bar.color} ${h[i] === 0 ? "opacity-10" : "opacity-100"}`} style={{ transition: "opacity 0.5s" }} />
            {h[i] > 0 && <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">{bar.pct}%</span>}
          </div>
          <span className="text-[10px] text-muted-foreground font-medium text-center">{bar.label}</span>
        </div>
      ))}
      {stage === "gap" && (
        <div className="absolute top-4 right-4 bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 max-w-[160px]">
          <p className="text-xs text-destructive font-bold">66% lost</p>
          <p className="text-[10px] text-destructive/80">Patients with needs who never received assistance</p>
        </div>
      )}
    </div>
  );
}

export default function DetectionGapPage() {
  const [activeStage, setActiveStage] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const stage = STAGES[activeStage];

  usePageMeta({
    title: "The Detection Gap — Access Michigan",
    description: "Health systems screen millions for social needs but lack the infrastructure to act. See the data behind Michigan's detection-to-action gap.",
    path: "/detection-gap",
  });

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setActiveStage(prev => {
        if (prev >= STAGES.length - 1) { setIsAutoPlaying(false); return prev; }
        return prev + 1;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  return (
    <Layout>
      <div className="min-h-screen bg-[hsl(210,50%,6%)] text-white">
        {/* Hero */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
          <div className="max-w-5xl mx-auto px-6 py-12 relative">
            <Breadcrumbs items={[{ label: "Partners", href: "/partners" }, { label: "Detection Gap" }]} />
            <div className="flex items-center gap-2 mb-4 mt-4">
              <div className="w-10 h-1 bg-primary rounded-full" />
              <Badge variant="outline" className="uppercase tracking-wider text-xs border-primary/30 text-primary">Research Insight</Badge>
            </div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              The Detection<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-destructive to-[hsl(var(--michigan-gold))]">Gap</span>
            </motion.h1>
            <p className="text-lg text-gray-400 max-w-xl">Health systems screen millions for social needs but lack the infrastructure to act on what they find.</p>
            <Button onClick={() => { setActiveStage(0); setIsAutoPlaying(true); }} className="mt-6" size="lg">
              <Play className="h-4 w-4 mr-2" />{isAutoPlaying ? "Playing..." : "Play the Story"}
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-5xl mx-auto px-6 pb-16">
          {/* Progress bar */}
          <div className="flex gap-1 mb-12">
            {STAGES.map((_, i) => (
              <button key={i} onClick={() => { setActiveStage(i); setIsAutoPlaying(false); }}
                className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${i <= activeStage ? "bg-primary" : "bg-gray-700"}`}
                aria-label={`Go to stage ${i + 1}`} />
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            <motion.div key={stage.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold">{activeStage + 1}</span>
                <h2 className="text-2xl font-bold">{stage.title}</h2>
              </div>
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <p className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60 mb-1">{stage.stat}</p>
                <p className="text-sm text-gray-400 font-medium">{stage.label}</p>
              </div>
              <p className="text-gray-300 leading-relaxed">{stage.desc}</p>
              <p className="text-xs text-gray-500 italic">Source: {stage.source}</p>
            </motion.div>

            <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <FunnelViz stage={stage.visual} />
              <div className="mt-6 flex gap-4 justify-center">
                {[{ color: "bg-primary", label: "Screened" }, { color: "bg-[hsl(var(--michigan-gold))]", label: "Needs Detected" }, { color: stage.visual === "impact" || stage.visual === "bridge" ? "bg-primary" : "bg-destructive", label: stage.visual === "impact" || stage.visual === "bridge" ? "Connected/Improved" : "Received Help" }].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 rounded-sm ${l.color}`} />
                    <span className="text-[10px] text-gray-500">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-12">
            <Button variant="outline" size="sm" onClick={() => { setActiveStage(Math.max(0, activeStage - 1)); setIsAutoPlaying(false); }} disabled={activeStage === 0} className="border-gray-600 text-gray-300 hover:text-white">
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <div className="flex items-center gap-2">
              {STAGES.map((_, i) => (
                <button key={i} onClick={() => { setActiveStage(i); setIsAutoPlaying(false); }}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${i === activeStage ? "bg-primary scale-125" : "bg-gray-600 hover:bg-gray-500"}`}
                  aria-label={`Stage ${i + 1}`} />
              ))}
            </div>
            <Button size="sm" onClick={() => { setActiveStage(Math.min(STAGES.length - 1, activeStage + 1)); setIsAutoPlaying(false); }} disabled={activeStage === STAGES.length - 1}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Source footer */}
          <div className="mt-12 rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-gray-500">
              <strong className="text-gray-400">Data Sources:</strong> Michigan DHHS SDOH Screening Program, Michigan Medicine MSHIELD Program, Trinity Health SDOH Outcomes Research, Access Michigan Platform. All statistics reflect published research data; see <a href="/methodology" className="text-primary hover:underline">Methodology</a>.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
