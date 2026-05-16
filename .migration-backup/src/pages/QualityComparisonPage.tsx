import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import PrintButton from "@/components/shared/PrintButton";

const fade = { hidden: { opacity: 0, y: 20 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }) };

interface Facility {
  id: number; name: string; county: string; type: string;
  safety: number; clinical: number; experience: number; digital: number; breadth: number;
  magnet: boolean; leapfrog: string; telehealth: boolean; walkIn: boolean; fqhc: boolean;
}

const FACILITIES: Facility[] = [
  { id: 1, name: "Michigan Medicine", county: "Washtenaw", type: "Academic Medical Center", safety: 28, clinical: 27, experience: 18, digital: 9, breadth: 9, magnet: true, leapfrog: "A", telehealth: true, walkIn: false, fqhc: false },
  { id: 2, name: "Henry Ford Hospital", county: "Wayne", type: "Teaching Hospital", safety: 26, clinical: 28, experience: 17, digital: 9, breadth: 10, magnet: true, leapfrog: "A", telehealth: true, walkIn: false, fqhc: false },
  { id: 3, name: "Beaumont Royal Oak", county: "Oakland", type: "Community Hospital", safety: 27, clinical: 25, experience: 19, digital: 8, breadth: 8, magnet: true, leapfrog: "A", telehealth: true, walkIn: false, fqhc: false },
  { id: 4, name: "Spectrum Butterworth", county: "Kent", type: "Regional Medical Center", safety: 25, clinical: 26, experience: 17, digital: 8, breadth: 9, magnet: false, leapfrog: "B+", telehealth: true, walkIn: false, fqhc: false },
  { id: 5, name: "Sparrow Hospital", county: "Ingham", type: "Regional Hospital", safety: 22, clinical: 23, experience: 15, digital: 7, breadth: 8, magnet: false, leapfrog: "B", telehealth: true, walkIn: false, fqhc: false },
  { id: 6, name: "Community Health Center of Branch County", county: "Branch", type: "FQHC", safety: 20, clinical: 20, experience: 16, digital: 6, breadth: 6, magnet: false, leapfrog: "N/A", telehealth: true, walkIn: true, fqhc: true },
  { id: 7, name: "Hamilton Community Health", county: "Genesee", type: "FQHC", safety: 19, clinical: 19, experience: 17, digital: 5, breadth: 5, magnet: false, leapfrog: "N/A", telehealth: false, walkIn: true, fqhc: true },
  { id: 8, name: "Ascension St. John", county: "Wayne", type: "Community Hospital", safety: 23, clinical: 22, experience: 16, digital: 7, breadth: 7, magnet: false, leapfrog: "B", telehealth: true, walkIn: false, fqhc: false },
];

const CATEGORIES = [
  { key: "safety" as const, label: "Safety", max: 30, color: "#FF6B6B", desc: "Leapfrog grade, HAIs, patient safety indicators" },
  { key: "clinical" as const, label: "Clinical", max: 30, color: "#0A4C95", desc: "CMS star rating, readmission, mortality, timely care" },
  { key: "experience" as const, label: "Experience", max: 20, color: "#00A3A1", desc: "HCAHPS patient satisfaction, communication, responsiveness" },
  { key: "digital" as const, label: "Digital", max: 10, color: "#4A90E2", desc: "Online scheduling, portal, telehealth, e-prescribe" },
  { key: "breadth" as const, label: "Breadth", max: 10, color: "#F4A460", desc: "Specialty count, integrated services, behavioral health" },
];

function ScoreBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(value / max) * 100}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-bold w-10 text-right" style={{ color }}>{value}/{max}</span>
    </div>
  );
}

function RadarChart({ facility }: { facility: Facility }) {
  const total = CATEGORIES.reduce((s, c) => s + facility[c.key], 0);
  const angles = CATEGORIES.map((_, i) => (i * 2 * Math.PI) / CATEGORIES.length - Math.PI / 2);
  const cx = 100, cy = 100, r = 70;
  const points = CATEGORIES.map((cat, i) => {
    const val = facility[cat.key] / cat.max;
    return { x: cx + r * val * Math.cos(angles[i]), y: cy + r * val * Math.sin(angles[i]) };
  });

  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-[200px]" role="img" aria-label={`${facility.name} quality radar chart, total score ${total}/100`}>
      {[0.25, 0.5, 0.75, 1].map(scale => (
        <polygon key={scale} points={angles.map(a => `${cx + r * scale * Math.cos(a)},${cy + r * scale * Math.sin(a)}`).join(" ")} fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" />
      ))}
      {angles.map((a, i) => <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke="hsl(var(--border))" strokeWidth="0.5" />)}
      <polygon points={points.map(p => `${p.x},${p.y}`).join(" ")} fill="hsla(var(--primary), 0.15)" stroke="hsl(var(--primary))" strokeWidth="2" />
      {points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill={CATEGORIES[i].color} />)}
      {CATEGORIES.map((cat, i) => {
        const lx = cx + (r + 18) * Math.cos(angles[i]);
        const ly = cy + (r + 18) * Math.sin(angles[i]);
        return <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="hsl(var(--muted-foreground))" fontWeight="600">{cat.label}</text>;
      })}
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="18" fill="hsl(var(--foreground))" fontWeight="800">{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="7" fill="hsl(var(--muted-foreground))">/100</text>
    </svg>
  );
}

export default function QualityComparisonPage() {
  const [selected, setSelected] = useState([1, 2, 3]);

  usePageMeta({
    title: "Facility Quality Comparison — Access Michigan",
    description: "Compare Michigan healthcare facilities side-by-side using composite quality scoring.",
    path: "/quality/compare",
  });

  const toggle = (id: number) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev);
  };
  const compared = FACILITIES.filter(f => selected.includes(f.id));

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Quality", href: "/quality" }, { label: "Facility Comparison" }]} />

      <section className="bg-gradient-to-b from-primary/5 to-background py-12">
        <div className="container max-w-5xl">
          <motion.div initial="hidden" animate="visible" variants={fade} custom={0}>
            <Badge variant="outline" className="mb-3 uppercase tracking-wider text-xs">Interactive</Badge>
            <h1 className="text-3xl font-extrabold text-foreground mb-2">Facility Quality Comparison</h1>
            <p className="text-muted-foreground">Compare up to 3 facilities using the Access Michigan composite quality scoring methodology.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <div key={c.key} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted border border-border text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="font-semibold text-muted-foreground">{c.label}</span>
                  <span className="text-muted-foreground/60">({c.max}pts)</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-5xl py-8 space-y-8">
        {/* Facility selector */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Select up to 3 facilities</p>
          <div className="flex flex-wrap gap-2">
            {FACILITIES.map(f => {
              const total = CATEGORIES.reduce((s, c) => s + f[c.key], 0);
              const isSelected = selected.includes(f.id);
              return (
                <Button key={f.id} variant={isSelected ? "default" : "outline"} size="sm" onClick={() => toggle(f.id)}>
                  {f.name} <span className="ml-1.5 text-xs opacity-60">{total}/100</span>
                  {f.fqhc && <Badge variant="secondary" className="ml-1.5 text-[9px] px-1">FQHC</Badge>}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Comparison cards */}
        {compared.length > 0 && (
          <div className={`grid gap-6 ${compared.length === 1 ? "grid-cols-1 max-w-md" : compared.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
            {compared.map(f => {
              const total = CATEGORIES.reduce((s, c) => s + f[c.key], 0);
              const tierLabel = total >= 85 ? "Exceptional" : total >= 70 ? "Strong" : total >= 55 ? "Adequate" : "Developing";
              return (
                <motion.div key={f.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}>
                  <Card>
                    <CardHeader className="text-center pb-2">
                      <CardTitle className="text-base">{f.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{f.type} — {f.county} County</p>
                      <div className="flex justify-center flex-wrap gap-1.5 mt-2">
                        {f.magnet && <Badge variant="secondary" className="text-[10px]">Magnet</Badge>}
                        {f.leapfrog !== "N/A" && <Badge variant="secondary" className="text-[10px]">Leapfrog {f.leapfrog}</Badge>}
                        {f.telehealth && <Badge variant="secondary" className="text-[10px]">Telehealth</Badge>}
                        {f.fqhc && <Badge variant="secondary" className="text-[10px]">No one turned away</Badge>}
                        {f.fqhc && <Badge variant="secondary" className="text-[10px]">Sliding scale fees</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-center mb-4"><RadarChart facility={f} /></div>
                      <div className="text-center mb-4">
                        <Badge variant="outline">{tierLabel}</Badge>
                      </div>
                      <div className="space-y-2.5">
                        {CATEGORIES.map(c => (
                          <div key={c.key}>
                            <div className="flex justify-between mb-0.5">
                              <span className="text-xs text-muted-foreground font-medium">{c.label}</span>
                            </div>
                            <ScoreBar value={f[c.key]} max={c.max} color={c.color} />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Methodology */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <h4 className="text-sm font-bold text-foreground mb-2">Scoring Methodology</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Composite score = Safety (30pts) + Clinical Quality (30pts) + Patient Experience (20pts) + Digital Access (10pts) + Service Breadth (10pts). Safety scores derive from Leapfrog Hospital Safety Grade, ANCC Magnet designation, and CMS Patient Safety Indicators. Clinical scores incorporate CMS Overall Star Rating, readmission rates, mortality measures, and timely care metrics. All rankings are transparent, non-commercial, and publicly documented. Safety-net providers (FQHCs, community health centers) are never filtered out.
            </p>
            <p className="text-xs text-muted-foreground mt-2 italic">Calculated from CMS Hospital Compare, Leapfrog Safety Grade, and HCAHPS data using Access Michigan composite methodology.</p>
          </CardContent>
        </Card>

        {/* Source */}
        <div className="rounded-lg border border-border bg-muted/50 p-4 flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            <strong>Sources:</strong> CMS Hospital Compare, Leapfrog Hospital Safety Grade, ANCC Magnet Recognition, Blue Distinction Centers, HCAHPS. See <a href="/methodology" className="text-primary hover:underline">Methodology</a>.
          </p>
        </div>
      </div>
      <PrintButton />
    </Layout>
  );
}
