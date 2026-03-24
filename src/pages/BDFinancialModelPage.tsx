import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useSearchParams, Link } from "react-router-dom";
import {
  BarChart, Bar, ComposedChart, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Line,
} from "recharts";
import {
  BarChart3, Map, GitBranch, Heart, Calculator,
  Info, Share2, Copy, Printer, Building2, X, CheckCircle2,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ServiceLineState {
  vol: number;
  rpe: number;
  grw: number;
  commercial: number;
  medicare: number;
  medicaid: number;
  selfPay: number;
  stup: number;
  opc: number;
  mktv: number;
}

interface SdohState {
  pop: number;
  scr: number;
  pos: number;
  nav: number;
  cst: number;
  rr: number;
}

type County = {
  name: string;
  opp: number;
  shortage: number;
  svi: number;
  pop: number;
};

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.45 },
  }),
};

// ─── County opportunity data ──────────────────────────────────────────────────
const COUNTIES: County[] = [
  { name: "Missaukee",    opp: 91, shortage: 4.2, svi: 0.88, pop: 15000  },
  { name: "Oscoda",       opp: 89, shortage: 4.5, svi: 0.85, pop: 8400   },
  { name: "Clare",        opp: 87, shortage: 3.9, svi: 0.83, pop: 30600  },
  { name: "Montmorency",  opp: 85, shortage: 4.1, svi: 0.81, pop: 9400   },
  { name: "Roscommon",    opp: 83, shortage: 3.7, svi: 0.79, pop: 24000  },
  { name: "Lake",         opp: 82, shortage: 3.8, svi: 0.82, pop: 11800  },
  { name: "Crawford",     opp: 80, shortage: 3.5, svi: 0.77, pop: 13600  },
  { name: "Ogemaw",       opp: 78, shortage: 3.3, svi: 0.76, pop: 20700  },
  { name: "Alcona",       opp: 76, shortage: 3.2, svi: 0.74, pop: 10500  },
  { name: "Presque Isle", opp: 74, shortage: 3.0, svi: 0.72, pop: 12900  },
  { name: "Arenac",       opp: 72, shortage: 2.9, svi: 0.71, pop: 15200  },
  { name: "Iosco",        opp: 70, shortage: 2.8, svi: 0.70, pop: 24800  },
  { name: "Mecosta",      opp: 68, shortage: 2.7, svi: 0.66, pop: 43200  },
  { name: "Huron",        opp: 66, shortage: 2.6, svi: 0.64, pop: 30700  },
  { name: "Sanilac",      opp: 64, shortage: 2.4, svi: 0.63, pop: 40600  },
  { name: "Tuscola",      opp: 62, shortage: 2.3, svi: 0.61, pop: 52500  },
  { name: "Isabella",     opp: 60, shortage: 2.2, svi: 0.59, pop: 64500  },
  { name: "Gratiot",      opp: 58, shortage: 2.1, svi: 0.57, pop: 40100  },
  { name: "Montcalm",     opp: 56, shortage: 2.0, svi: 0.55, pop: 63000  },
  { name: "Shiawassee",   opp: 54, shortage: 1.9, svi: 0.52, pop: 68000  },
  { name: "Bay",          opp: 52, shortage: 1.8, svi: 0.50, pop: 103000 },
  { name: "Genesee",      opp: 50, shortage: 1.7, svi: 0.62, pop: 406000 },
  { name: "Saginaw",      opp: 48, shortage: 1.6, svi: 0.65, pop: 190000 },
];

// ─── Build · Partner · Acquire static data ────────────────────────────────────
const BPA_CHART = [
  { scenario: "Build",      optimistic: 32, base: 22, downside: 8  },
  { scenario: "Partner/JV", optimistic: 26, base: 16, downside: 6  },
  { scenario: "Acquire",    optimistic: 42, base: 28, downside: -4 },
];

const BPA_TABLE = [
  { dim: "Capital required",   build: "$3–8M",    partner: "$1.5–4M",          acquire: "$12–40M"   },
  { dim: "Time to revenue",    build: "18–30 mo", partner: "9–15 mo",           acquire: "Day 1"     },
  { dim: "5-yr NPV (base)",    build: "$22M",     partner: "$16M (50% stake)",  acquire: "$28M",     highlight: true },
  { dim: "Integration risk",   build: "Low",      partner: "Medium",            acquire: "High"      },
  { dim: "Market share gain",  build: "Gradual",  partner: "Moderate",          acquire: "Immediate" },
  { dim: "Mission alignment",  build: "High",     partner: "High",              acquire: "Variable"  },
  { dim: "Best for",           build: "New service lines with differentiation potential",
                               partner: "Geography / payer access constraints",
                               acquire: "Established competitors with retained revenue", highlight: true },
];

// ─── Default values & storage keys ───────────────────────────────────────────
const SL_DEFAULTS: ServiceLineState = {
  vol: 5000, rpe: 420, grw: 12,
  commercial: 38, medicare: 32, medicaid: 20, selfPay: 10,
  stup: 3.5, opc: 65, mktv: 280,
};
const SDOH_DEFAULTS: SdohState = {
  pop: 12000, scr: 65, pos: 17, nav: 34, cst: 14500, rr: 16,
};
const SL_KEY   = "bd-model-service-line";
const SDOH_KEY = "bd-model-sdoh";

// ─── SDOH preset configurations ───────────────────────────────────────────────
const SDOH_PRESETS: { label: string; values: SdohState }[] = [
  { label: "Henry Ford Health (Detroit)",   values: { pop: 180000, scr: 72, pos: 17, nav: 34, cst: 14500, rr: 16 } },
  { label: "Trinity Health (Statewide)",    values: { pop: 120000, scr: 70, pos: 27, nav: 35, cst: 14500, rr: 16 } },
  { label: "Corewell West Michigan",        values: { pop: 95000,  scr: 58, pos: 14, nav: 28, cst: 13200, rr: 14 } },
];

// ─── VBC-framed health system presets ─────────────────────────────────────────
const PRESETS = {
  hfhs:     { pop: 180000, scr: 72, pos: 17, nav: 34, cst: 14500, rr: 16 },
  trinity:  { pop: 120000, scr: 70, pos: 27, nav: 35, cst: 14500, rr: 16 },
  corewell: { pop: 140000, scr: 65, pos: 15, nav: 30, cst: 13800, rr: 14 },
};

// ─── localStorage helpers ─────────────────────────────────────────────────────
function readStorage<T>(key: string, defaults: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return { ...defaults, ...(JSON.parse(raw) as Partial<T>) };
  } catch { /* ignore */ }
  return defaults;
}

function writeStorage<T>(key: string, value: T): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

function hasSavedDiff<T extends Record<string, unknown>>(key: string, defaults: T): boolean {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return Object.keys(defaults).some(k => parsed[k] !== undefined && parsed[k] !== (defaults as Record<string, unknown>)[k]);
  } catch { return false; }
}

// ─── Financial constants ──────────────────────────────────────────────────────
const DISCOUNT_RATE = 0.08;
const PAYER_MULTIPLIERS = { commercial: 1.0, medicare: 0.85, medicaid: 0.65, selfPay: 0.45 } as const;

// ─── Financial helpers ────────────────────────────────────────────────────────
function fmtM(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${sign}$${Math.round(abs / 1e3)}K`;
  return `${sign}$${Math.round(abs)}`;
}

function calcNPV(s: ServiceLineState): number {
  const pm = s.commercial / 100 * PAYER_MULTIPLIERS.commercial
           + s.medicare   / 100 * PAYER_MULTIPLIERS.medicare
           + s.medicaid   / 100 * PAYER_MULTIPLIERS.medicaid
           + s.selfPay    / 100 * PAYER_MULTIPLIERS.selfPay;
  const startup = s.stup * 1e6;
  let npv = -startup;
  for (let y = 1; y <= 5; y++) {
    const rev = s.vol * Math.pow(1 + s.grw / 100, y - 1) * s.rpe * pm;
    const cf  = rev * (1 - s.opc / 100) - (y === 1 ? startup * 0.1 : 0);
    npv += cf / Math.pow(1 + DISCOUNT_RATE, y);
  }
  return npv;
}

// ─── Sub-component: KPI card ──────────────────────────────────────────────────
function KPI({ label, value, sub, good }: {
  label: string; value: string; sub: string; good?: boolean;
}) {
  return (
    <div className="rounded-lg bg-muted/50 p-4">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${good ? "text-michigan-teal" : "text-foreground"}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
    </div>
  );
}

// ─── Sub-component: Slider row ────────────────────────────────────────────────
function SliderRow({ label, value, display, min, max, step, onChange }: {
  label: string; value: number; display: string;
  min: number; max: number; step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-medium text-foreground">{display}</span>
      </div>
      <Slider
        min={min} max={max} step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        className="w-full"
      />
    </div>
  );
}

// ─── Tab 1: Service Line Model ────────────────────────────────────────────────
interface ServiceLineTabProps {
  sl: ServiceLineState;
  onSl: (patch: Partial<ServiceLineState>) => void;
}

function ServiceLineTab({ sl, onSl }: ServiceLineTabProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [aiInsight, setAiInsight]   = useState<string | null>(null);
  const [aiLoading, setAiLoading]   = useState(false);

  const payerTotal = sl.commercial + sl.medicare + sl.medicaid + sl.selfPay;

  // ── Core 5-year projection ────────────────────────────────────────────────
  const result = useMemo(() => {
    const pm = sl.commercial / 100 * PAYER_MULTIPLIERS.commercial
             + sl.medicare   / 100 * PAYER_MULTIPLIERS.medicare
             + sl.medicaid   / 100 * PAYER_MULTIPLIERS.medicaid
             + sl.selfPay    / 100 * PAYER_MULTIPLIERS.selfPay;
    const startup = sl.stup * 1e6;
    let npv = -startup, cum = -startup;
    let be: number | null = null;
    const chartData: { year: string; revenue: number; cumCF: number }[] = [];

    for (let y = 1; y <= 5; y++) {
      const rev = sl.vol * Math.pow(1 + sl.grw / 100, y - 1) * sl.rpe * pm;
      const cf  = rev * (1 - sl.opc / 100) - (y === 1 ? startup * 0.1 : 0);
      cum += cf;
      npv += cf / Math.pow(1 + DISCOUNT_RATE, y);
      if (!be && cum > 0) be = y;
      chartData.push({
        year: `Yr ${y}`,
        revenue: parseFloat((rev / 1e6).toFixed(2)),
        cumCF:   parseFloat((cum / 1e6).toFixed(2)),
      });
    }

    const y1net = chartData[0].revenue * 1e6 * (1 - sl.opc / 100) - startup * 0.1;
    const ms    = (chartData[0].revenue * 1e6 / (sl.mktv * 1e6)) * 100;

    let staticInsight = "";
    if (npv > 20e6)
      staticInsight = `Strong opportunity — NPV exceeds $20M at ${sl.grw}% annual growth. Commercial mix at ${sl.commercial}% is ${sl.commercial > 40 ? "above" : "near"} break-even threshold. Recommend organic build scenario.`;
    else if (npv > 5e6)
      staticInsight = `Moderate returns — NPV of ${fmtM(npv)} is positive but sensitive to cost ratio. Consider JV structure to reduce startup exposure and accelerate time to revenue.`;
    else
      staticInsight = `Thin margins at current inputs. Revisit volume ramp or payer mix — or consider acquiring an existing player to capture immediate cash flow.`;

    return { npv, y1net, be, ms, chartData, staticInsight };
  }, [sl]);

  // ── Sensitivity / tornado data ────────────────────────────────────────────
  const tornadoData = useMemo(() => {
    const base = calcNPV(sl);
    const items: { variable: string; hiDelta: number; loDelta: number }[] = [
      {
        variable: "Revenue / Encounter",
        hiDelta: (calcNPV({ ...sl, rpe: sl.rpe * 1.1 }) - base) / 1e6,
        loDelta: (calcNPV({ ...sl, rpe: sl.rpe * 0.9 }) - base) / 1e6,
      },
      {
        variable: "Volume Growth",
        hiDelta: (calcNPV({ ...sl, grw: sl.grw * 1.1 }) - base) / 1e6,
        loDelta: (calcNPV({ ...sl, grw: sl.grw * 0.9 }) - base) / 1e6,
      },
      {
        variable: "Payer Mix",
        // Shift commercial ±10pp (clamped), offset with self-pay to maintain sum
        hiDelta: (calcNPV({ ...sl, commercial: Math.min(100, sl.commercial + 10), selfPay: Math.max(0, sl.selfPay - 10) }) - base) / 1e6,
        loDelta: (calcNPV({ ...sl, commercial: Math.max(0,   sl.commercial - 10), selfPay: Math.min(100, sl.selfPay + 10) }) - base) / 1e6,
      },
      {
        // Higher startup cost → lower NPV (unfavorable); lower → higher (favorable)
        variable: "Startup Cost",
        hiDelta: (calcNPV({ ...sl, stup: sl.stup * 1.1 }) - base) / 1e6,
        loDelta: (calcNPV({ ...sl, stup: sl.stup * 0.9 }) - base) / 1e6,
      },
    ];
    return items
      .sort((a, b) => Math.abs(b.hiDelta - b.loDelta) - Math.abs(a.hiDelta - a.loDelta))
      .map(({ variable, hiDelta, loDelta }) => ({
        variable,
        favorable:   Math.max(hiDelta, loDelta, 0),
        unfavorable: Math.min(hiDelta, loDelta, 0),
      }));
  }, [sl]);

  // ── AI Scenario Narrator (debounced 500ms) ────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setAiLoading(true);
      try {
        const npv5yr = fmtM(calcNPV(sl));
        const inputs = {
          annualVolume: sl.vol,
          revenuePerEncounter: `$${sl.rpe}`,
          volumeGrowthRate: `${sl.grw}%`,
          payerMix: `${sl.commercial}% commercial / ${sl.medicare}% Medicare / ${sl.medicaid}% Medicaid / ${sl.selfPay}% self-pay`,
          startupInvestment: `$${sl.stup}M`,
          operatingCostRatio: `${sl.opc}%`,
          addressableMarket: `$${sl.mktv}M`,
          npv5yr,
        };
        const promptText = `Given these financial scenario inputs: ${JSON.stringify(inputs)}, write a 2-sentence strategic recommendation for a health system executive. Be specific, quantitative, and direct.`;
        const res = await fetch("/.netlify/functions/chat-mistral", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              { role: "system", content: "You are a healthcare BD analyst." },
              { role: "user",   content: promptText },
            ],
          }),
        });
        if (!res.ok) throw new Error("AI call failed");
        const data = (await res.json()) as { reply: string };
        setAiInsight(data.reply);
      } catch {
        setAiInsight(null); // fall back to static insight
      } finally {
        setAiLoading(false);
      }
    }, 500);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [sl]);

  const displayInsight = aiLoading
    ? "Generating strategic insight…"
    : (aiInsight ?? result.staticInsight);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KPI label="5-year NPV"          value={fmtM(result.npv)}                              sub="at 8% discount rate"      good={result.npv > 0} />
        <KPI label="Year 1 net"          value={fmtM(result.y1net)}                            sub="after startup costs"      good={result.y1net > 0} />
        <KPI label="Breakeven"           value={result.be ? `Year ${result.be}` : ">5 yrs"}   sub="cumulative cash flow" />
        <KPI label="Market capture Yr 1" value={`${result.ms.toFixed(1)}%`}                    sub="of addressable market" />
      </div>

      {/* Inputs + Chart */}
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Revenue assumptions</p>
          <SliderRow label="Annual patient volume (Yr 1)" value={sl.vol}  display={sl.vol.toLocaleString()}      min={500}  max={20000} step={100}  onChange={v => onSl({ vol: v })} />
          <SliderRow label="Revenue per encounter"        value={sl.rpe}  display={`$${sl.rpe}`}                min={150}  max={1200}  step={10}   onChange={v => onSl({ rpe: v })} />
          <SliderRow label="Annual volume growth"         value={sl.grw}  display={`${sl.grw}%`}                min={2}    max={25}    step={1}    onChange={v => onSl({ grw: v })} />

          {/* ── Payer mix 4-slider breakdown ─────────────────────────────── */}
          <div className="mb-2 mt-1">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payer mix breakdown</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                payerTotal === 100
                  ? "bg-michigan-teal/10 text-michigan-teal"
                  : "bg-destructive/10 text-destructive"
              }`}>
                Total: {payerTotal}%
              </span>
            </div>
            <SliderRow label="Commercial (%)" value={sl.commercial} display={`${sl.commercial}%`} min={0} max={100} step={1} onChange={v => onSl({ commercial: v })} />
            <SliderRow label="Medicare (%)"   value={sl.medicare}   display={`${sl.medicare}%`}   min={0} max={100} step={1} onChange={v => onSl({ medicare:   v })} />
            <SliderRow label="Medicaid (%)"   value={sl.medicaid}   display={`${sl.medicaid}%`}   min={0} max={100} step={1} onChange={v => onSl({ medicaid:   v })} />
            <SliderRow label="Self-pay (%)"   value={sl.selfPay}    display={`${sl.selfPay}%`}    min={0} max={100} step={1} onChange={v => onSl({ selfPay:    v })} />
          </div>

          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 mt-4">Cost structure</p>
          <SliderRow label="Startup investment"   value={sl.stup} display={`$${sl.stup}M`}               min={0.5}  max={15}    step={0.5}  onChange={v => onSl({ stup: v })} />
          <SliderRow label="Operating cost ratio" value={sl.opc}  display={`${sl.opc}%`}                min={40}   max={85}    step={1}    onChange={v => onSl({ opc:  v })} />
          <SliderRow label="Addressable market"   value={sl.mktv} display={`$${sl.mktv}M`}              min={10}   max={500}   step={5}    onChange={v => onSl({ mktv: v })} />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">5-year projection</p>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={result.chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#88878820" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${v}M`} />
              <Tooltip formatter={(value) => {
                const v = typeof value === "number" ? value : Number(value);
                return [`$${v.toFixed(1)}M`];
              }} />
              <Bar  dataKey="revenue" name="Revenue"        fill="#378ADD33" stroke="#378ADD" strokeWidth={1} />
              <Line dataKey="cumCF"   name="Cumulative CF"  stroke="#1D9E75" strokeWidth={2} dot={{ r: 4, fill: "#1D9E75" }} />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#378ADD33] border border-[#378ADD] inline-block" />Revenue</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#1D9E75] inline-block" />Cumulative cash flow</span>
          </div>

          {/* Market insight card */}
          <div className={`mt-4 rounded-lg border-l-2 px-4 py-3 transition-colors ${aiLoading ? "border-muted bg-muted/20" : "border-michigan-teal bg-muted/40"}`}>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">
                {aiLoading ? "⟳ " : "Strategic read: "}
              </span>
              {displayInsight}
            </p>
          </div>
        </div>
      </div>

      {/* ── Sensitivity Tornado Chart ─────────────────────────────────────── */}
      <div className="rounded-lg border border-border p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          NPV sensitivity — which inputs matter most (±10% swing, $M)
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            layout="vertical"
            data={tornadoData}
            margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#88878820" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(v: number) => `$${v.toFixed(1)}M`}
              tick={{ fontSize: 10 }}
              domain={["dataMin", "dataMax"]}
            />
            <YAxis type="category" dataKey="variable" width={145} tick={{ fontSize: 10 }} />
            <Tooltip formatter={(value) => {
              const v = typeof value === "number" ? value : Number(value);
              return [`$${v.toFixed(2)}M`];
            }} />
            <ReferenceLine x={0} stroke="#88878880" />
            <Bar dataKey="favorable"   name="Favorable impact"   fill="#1D9E75" radius={[0, 3, 3, 0]} />
            <Bar dataKey="unfavorable" name="Unfavorable impact" fill="#D85A30" radius={[3, 0, 0, 3]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#1D9E75] inline-block" />Favorable (+10%)</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#D85A30] inline-block" />Unfavorable (−10%)</span>
        </div>
      </div>
    </div>
  );
}

// ─── Tab 2: Build · Partner · Acquire ────────────────────────────────────────
function BuildPartnerAcquireTab() {
  const [selected, setSelected] = useState<"build" | "partner" | "acquire">("build");

  const cards = [
    { id: "build"   as const, badge: "Build",        color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300", desc: "Full ownership · highest control · longest runway" },
    { id: "partner" as const, badge: "Partner / JV",  color: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",             desc: "Shared capital · faster launch · aligned incentives" },
    { id: "acquire" as const, badge: "Acquire",       color: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",         desc: "Immediate volume · highest upfront cost · integration risk" },
  ];

  return (
    <div className="space-y-6">
      {/* Selector cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map(c => (
          <button
            key={c.id}
            onClick={() => setSelected(c.id)}
            className={`rounded-lg border p-4 text-left transition-all ${selected === c.id ? "border-michigan-teal ring-1 ring-michigan-teal" : "border-border hover:border-muted-foreground/40"}`}
          >
            <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold mb-2 ${c.color}`}>{c.badge}</span>
            <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
          </button>
        ))}
      </div>

      {/* Comparison table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground w-40">Dimension</th>
              <th className="text-left p-3 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Build</th>
              <th className="text-left p-3 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Partner / JV</th>
              <th className="text-left p-3 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Acquire</th>
            </tr>
          </thead>
          <tbody>
            {BPA_TABLE.map(row => (
              <tr key={row.dim} className={`border-b border-border/60 ${row.highlight ? "bg-muted/30" : ""}`}>
                <td className="p-3 text-xs font-medium text-foreground">{row.dim}</td>
                <td className="p-3 text-xs text-muted-foreground">{row.build}</td>
                <td className="p-3 text-xs text-muted-foreground">{row.partner}</td>
                <td className="p-3 text-xs text-muted-foreground">{row.acquire}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Chart */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Risk-adjusted NPV by scenario ($M)</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={BPA_CHART} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#88878820" />
            <XAxis dataKey="scenario" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${v}M`} />
            <Tooltip formatter={(value) => {
              const v = typeof value === "number" ? value : Number(value);
              return [`$${v}M`];
            }} />
            <Bar dataKey="optimistic" name="Optimistic" fill="#1D9E7566" stroke="#1D9E75" strokeWidth={1} />
            <Bar dataKey="base"       name="Base case"  fill="#378ADD66" stroke="#378ADD" strokeWidth={1} />
            <Bar dataKey="downside"   name="Downside"   fill="#D85A3066" stroke="#D85A30" strokeWidth={1} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#1D9E75] inline-block" />Optimistic</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#378ADD] inline-block" />Base case</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#D85A30] inline-block" />Downside</span>
        </div>
      </div>
    </div>
  );
}

// ─── Tab 3: Market Opportunity ────────────────────────────────────────────────
function MarketOpportunityTab() {
  const [sortBy,    setSortBy]    = useState("opp");
  const [minScore,  setMinScore]  = useState(50);
  const [selected,  setSelected]  = useState<County | null>(null);
  const [countyAI,  setCountyAI]  = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const filtered = useMemo(() => {
    const data = COUNTIES.filter(c => c.opp >= minScore);
    if (sortBy === "shortage") return [...data].sort((a, b) => b.shortage - a.shortage);
    if (sortBy === "svi")      return [...data].sort((a, b) => b.svi - a.svi);
    return [...data].sort((a, b) => b.opp - a.opp);
  }, [sortBy, minScore]);

  const maxOpp = Math.max(...filtered.map(c => c.opp), 1);

  // ── County click → AI explainer ───────────────────────────────────────────
  const handleCountyClick = useCallback(async (county: County) => {
    setSelected(county);
    setCountyAI(null);
    setAiLoading(true);
    try {
      const prompt = `Why does ${county.name} county rank ${county.opp}/100 in healthcare market opportunity? What service lines are most needed (shortage ratio: ${county.shortage}x, SVI: ${county.svi}, population: ${county.pop.toLocaleString()})? What partnership structure fits best?`;
      const res = await fetch("/.netlify/functions/chat-mistral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "You are a healthcare BD analyst specializing in Michigan market analysis." },
            { role: "user",   content: prompt },
          ],
        }),
      });
      if (!res.ok) throw new Error("AI call failed");
      const data = (await res.json()) as { reply: string };
      setCountyAI(data.reply);
    } catch {
      setCountyAI("AI analysis unavailable. Please check your connection and try again.");
    } finally {
      setAiLoading(false);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KPI label="High-opp counties"  value="23"   sub="score ≥ 70 / 100"     good />
        <KPI label="Addressable pop."   value="1.4M" sub="in top-tier counties"        />
        <KPI label="Avg shortage ratio" value="3.2×" sub="need vs. supply index"       />
        <KPI label="Avg SVI (top tier)" value="0.74" sub="CDC vulnerability index"     />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">Sort by</p>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="opp">Opportunity score</SelectItem>
              <SelectItem value="shortage">Provider shortage</SelectItem>
              <SelectItem value="svi">SVI (vulnerability)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-48">
          <p className="text-xs text-muted-foreground mb-1.5">Min score: <span className="font-medium text-foreground">{minScore}</span></p>
          <Slider min={0} max={85} step={5} value={[minScore]} onValueChange={([v]) => setMinScore(v)} className="w-full" />
        </div>
      </div>

      {/* County list */}
      <div className="space-y-1">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">No counties meet the minimum score threshold.</p>
        )}
        {filtered.map(c => {
          const barW  = Math.round((c.opp / maxOpp) * 100);
          const color = c.opp >= 80 ? "#1D9E75" : c.opp >= 65 ? "#378ADD" : "#BA7517";
          const isSelected = selected?.name === c.name;
          return (
            <button
              key={c.name}
              onClick={() => handleCountyClick(c)}
              aria-label={`View ${c.name} County analysis — opportunity score ${c.opp}/100, SVI ${c.svi.toFixed(2)}`}
              aria-pressed={isSelected}
              className={`w-full flex items-center gap-3 py-2 px-2 rounded border-b border-border/40 text-left transition-all hover:bg-muted/30 ${
                isSelected ? "ring-1 ring-michigan-teal bg-michigan-teal/5" : ""
              }`}
            >
              <span className="text-xs font-medium text-foreground w-28 shrink-0">{c.name}</span>
              <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                <div className="h-1.5 rounded-full transition-all" style={{ width: `${barW}%`, background: color }} />
              </div>
              <span className="text-xs font-semibold w-8 text-right shrink-0" style={{ color }}>{c.opp}</span>
              <span className="text-xs text-muted-foreground w-14 text-right shrink-0">SVI {c.svi.toFixed(2)}</span>
              <span className="text-xs text-muted-foreground w-12 text-right shrink-0">{(c.pop / 1000).toFixed(0)}K</span>
            </button>
          );
        })}
      </div>

      {/* ── AI County Explainer ───────────────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-muted/20 p-4 min-h-[80px]">
        {!selected && (
          <p className="text-xs text-muted-foreground italic text-center py-3">
            ↑ Click any county above to get an market opportunity analysis.
          </p>
        )}
        {selected && (
          <>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-xs font-semibold text-foreground">{selected.name} County — AI Analysis</p>
              <Badge variant="outline" className="text-xs">{selected.opp}/100 opportunity</Badge>
            </div>
            {aiLoading && (
              <p className="text-xs text-muted-foreground animate-pulse">Generating AI analysis for {selected.name} County…</p>
            )}
            {!aiLoading && countyAI && (
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{countyAI}</p>
            )}
          </>
        )}
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-4">
        Opportunity scores derived from CDC Social Vulnerability Index 2022, HRSA Health Professional Shortage Area data,
        and County Health Rankings 2025. Scores are composite indices for strategic planning — not actuarial projections.
      </p>
    </div>
  );
}

// ─── Tab 4: SDOH Financial Impact ────────────────────────────────────────────
interface SdohImpactTabProps {
  sdoh: SdohState;
  onSdoh: (patch: Partial<SdohState>) => void;
}

function SdohImpactTab({ sdoh, onSdoh }: SdohImpactTabProps) {
  // Program designer state
  const [progPop,      setProgPop]      = useState("All ages");
  const [progNeed,     setProgNeed]     = useState("Multiple needs");
  const [progDelivery, setProgDelivery] = useState("Community health workers (CHW)");
  const [programAI,    setProgramAI]    = useState<string | null>(null);
  const [progLoading,  setProgLoading]  = useState(false);

  const result = useMemo(() => {
    const intervened   = sdoh.pop * (sdoh.scr / 100) * (sdoh.pos / 100) * (sdoh.nav / 100);
    const readmitSave  = intervened * (sdoh.rr / 100) * sdoh.cst;
    const edSave       = intervened * 0.22 * 850;
    const vbcBonus     = (readmitSave + edSave) * 0.25;
    const progCost     = sdoh.pop * (sdoh.scr / 100) * 45;
    const roi3         = ((readmitSave + edSave + vbcBonus) * 3) / (progCost * 3);

    const chartData = [1, 2, 3].map(y => ({
      year:    `Yr ${y}`,
      readmit: parseFloat(((readmitSave * y) / 1e6).toFixed(2)),
      ed:      parseFloat(((edSave * y) / 1e6).toFixed(2)),
      vbc:     parseFloat(((vbcBonus * y) / 1e6).toFixed(2)),
    }));

    const insight = intervened < 100
      ? `Low intervention volume — only ${Math.round(intervened)} patients reached per year. Increase screening rate or navigation capacity.`
      : `${Math.round(intervened).toLocaleString()} patients reached annually through SDOH navigation. Projected ${sdoh.rr}% readmission reduction generates ${fmtM(readmitSave)} in Year 1 savings — a ${roi3.toFixed(1)}× 3-year ROI on program cost.`;

    return { readmitSave, edSave, vbcBonus, roi3, chartData, insight };
  }, [sdoh]);

  // ── AI Program Designer ────────────────────────────────────────────────────
  const handleDesignProgram = useCallback(async () => {
    setProgLoading(true);
    setProgramAI(null);
    try {
      const prompt = `Design an SDOH program for: target population: ${progPop}, primary need: ${progNeed}, delivery model: ${progDelivery}. Provide: 1) staffing model (number/type of staff), 2) estimated cost per participant, 3) projected outcomes based on published literature. Be concise and quantitative.`;
      const res = await fetch("/.netlify/functions/chat-mistral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "You are a healthcare program designer with expertise in SDOH interventions." },
            { role: "user",   content: prompt },
          ],
        }),
      });
      if (!res.ok) throw new Error("AI call failed");
      const data = (await res.json()) as { reply: string };
      setProgramAI(data.reply);
    } catch {
      setProgramAI("AI service unavailable. Please try again later.");
    } finally {
      setProgLoading(false);
    }
  }, [progPop, progNeed, progDelivery]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground max-w-2xl">
        Model the downstream financial impact of SDOH interventions
        on readmissions, ED utilization, and value-based care contract
        performance. In VBC arrangements — MSSP ACOs, BCBSM Blueprint,
        Medicare Advantage risk — SDOH navigation directly drives shared
        savings, Stars scores, and total cost of care reduction.
        Anchored to Trinity Health (27.4% unmet need from 1M+ screened;
        16% readmission reduction, FY2025) and Henry Ford Health ACO data.
      </p>

      {/* ── Preset buttons ────────────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Load preset scenario</p>
        <div className="flex flex-wrap gap-2">
          {SDOH_PRESETS.map(preset => (
            <Button
              key={preset.label}
              size="sm"
              variant="outline"
              className="text-xs h-8"
              onClick={() => onSdoh(preset.values)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      {/* VBC impact strip */}
      {result.roi3 >= 2 && (
        <div className="rounded-lg bg-michigan-teal/10 border border-michigan-teal/20 px-5 py-3 flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-michigan-teal shrink-0" />
            <span className="text-sm font-medium text-foreground">
              VBC contract positive
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {result.roi3.toFixed(1)}× 3-year ROI exceeds typical shared savings threshold for MSSP ACO and BCBSM Blueprint arrangements
          </span>
          <span className="ml-auto text-xs font-medium text-michigan-teal">
            Qualifies for shared savings ✓
          </span>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KPI label="Avoided readmissions" value={fmtM(result.readmitSave)} sub="annual savings"       good={result.readmitSave > 0} />
        <KPI label="ED diversion"         value={fmtM(result.edSave)}      sub="avoided ED costs"    good={result.edSave > 0}      />
        <KPI label="VBC bonus potential"  value={fmtM(result.vbcBonus)}    sub="quality metric uplift"                              />
        <KPI label="3-year ROI"           value={`${result.roi3.toFixed(1)}×`} sub="on program cost" good={result.roi3 > 2}        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="mb-6">
            <p className="text-xs text-muted-foreground mb-2">
              Load a health system baseline:
            </p>
            <div className="flex flex-wrap gap-2">
              {([
                ["hfhs",     "Henry Ford Health"],
                ["trinity",  "Trinity Health"],
                ["corewell", "Corewell Health"],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    const p = PRESETS[key];
                    onSdoh({ pop: p.pop, scr: p.scr, pos: p.pos, nav: p.nav, cst: p.cst, rr: p.rr });
                  }}
                  className="text-xs px-3 py-1.5 rounded-md border border-michigan-teal text-michigan-teal hover:bg-michigan-teal/10 transition-colors font-medium"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Program parameters</p>
          <SliderRow label="Attributed population (patients/yr)" value={sdoh.pop} display={sdoh.pop.toLocaleString()} min={1000}  max={100000} step={1000} onChange={v => onSdoh({ pop: v })} />
          <SliderRow label="SDOH screening rate"                  value={sdoh.scr} display={`${sdoh.scr}%`}            min={10}    max={95}     step={5}    onChange={v => onSdoh({ scr: v })} />
          <SliderRow label="Positive screen rate (unmet need)"    value={sdoh.pos} display={`${sdoh.pos}%`}            min={5}     max={40}     step={1}    onChange={v => onSdoh({ pos: v })} />
          <SliderRow label="Navigation intervention rate"         value={sdoh.nav} display={`${sdoh.nav}%`}            min={10}    max={85}     step={1}    onChange={v => onSdoh({ nav: v })} />
          <SliderRow label="Avg cost per readmission"             value={sdoh.cst} display={`$${sdoh.cst.toLocaleString()}`} min={8000} max={30000} step={500} onChange={v => onSdoh({ cst: v })} />
          <SliderRow label="Readmission reduction from nav."      value={sdoh.rr}  display={`${sdoh.rr}%`}             min={5}     max={30}     step={1}    onChange={v => onSdoh({ rr:  v })} />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">3-year cumulative impact ($M)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={result.chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#88878820" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${v}M`} />
              <Tooltip formatter={(value) => {
                const v = typeof value === "number" ? value : Number(value);
                return [`$${v.toFixed(2)}M`];
              }} />
              <Bar dataKey="readmit" name="Readmission savings" stackId="a" fill="#1D9E75" stroke="#1D9E75"   strokeWidth={0} />
              <Bar dataKey="ed"      name="ED diversion"        stackId="a" fill="#378ADD" stroke="#378ADD"   strokeWidth={0} />
              <Bar dataKey="vbc"     name="VBC bonus"           stackId="a" fill="#9FE1CB" stroke="#0F6E56"   strokeWidth={1} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#1D9E75] inline-block" />Readmission savings</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#378ADD] inline-block" />ED diversion</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#9FE1CB] border border-[#0F6E56] inline-block" />VBC bonus</span>
          </div>

          {/* Sensitivity labels based on SDOH literature (general guidelines, not calculated) */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: "Screening rate",    impact: "highest lever",  color: "text-michigan-teal" },
              { label: "Navigation rate",   impact: "2nd highest",    color: "text-michigan-teal" },
              { label: "Readmit reduction", impact: "outcome driver", color: "text-muted-foreground" },
            ].map(item => (
              <div key={item.label} className="rounded-md bg-muted/30 p-2 text-center">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className={`text-xs font-semibold mt-0.5 ${item.color}`}>{item.impact}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg border-l-2 border-michigan-teal bg-muted/40 px-4 py-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Model output: </span>
              {result.insight}
            </p>
          </div>
        </div>
      </div>

      {/* ── AI Program Designer ───────────────────────────────────────────── */}
      <div className="rounded-lg border border-border p-5 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Design your program</p>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Target population</p>
            <Select value={progPop} onValueChange={setProgPop}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Seniors 65+">Seniors 65+</SelectItem>
                <SelectItem value="Adults 18-64">Adults 18–64</SelectItem>
                <SelectItem value="Children & Youth">Children & Youth</SelectItem>
                <SelectItem value="All ages">All ages</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Primary SDOH need</p>
            <Select value={progNeed} onValueChange={setProgNeed}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Food insecurity">Food insecurity</SelectItem>
                <SelectItem value="Housing instability">Housing instability</SelectItem>
                <SelectItem value="Transportation barriers">Transportation barriers</SelectItem>
                <SelectItem value="Behavioral health">Behavioral health</SelectItem>
                <SelectItem value="Multiple needs">Multiple needs</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Delivery model</p>
            <Select value={progDelivery} onValueChange={setProgDelivery}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Community health workers (CHW)">Community health workers (CHW)</SelectItem>
                <SelectItem value="Telehealth">Telehealth</SelectItem>
                <SelectItem value="In-person clinic">In-person clinic</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          size="sm"
          className="gap-2"
          onClick={handleDesignProgram}
          disabled={progLoading}
        >
          {progLoading ? "Designing…" : "Design Program →"}
        </Button>

        {(progLoading || programAI) && (
          <div className="rounded-lg bg-muted/30 border border-border px-4 py-3 mt-2">
            {progLoading && <p className="text-xs text-muted-foreground animate-pulse">Generating program design…</p>}
            {!progLoading && programAI && (
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{programAI}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab 5: Export & Share ────────────────────────────────────────────────────
interface ExportShareTabProps {
  slState:   ServiceLineState;
  sdohState: SdohState;
}

function ExportShareTab({ slState, sdohState }: ExportShareTabProps) {
  const [copied, setCopied] = useState<"link" | "summary" | null>(null);

  const buildShareUrl = useCallback((): string => {
    const params = new URLSearchParams({
      vol:   String(slState.vol),
      rpe:   String(slState.rpe),
      grw:   String(slState.grw),
      comm:  String(slState.commercial),
      medc:  String(slState.medicare),
      mcaid: String(slState.medicaid),
      sp:    String(slState.selfPay),
      stup:  String(slState.stup),
      opc:   String(slState.opc),
      mktv:  String(slState.mktv),
      pop:   String(sdohState.pop),
      scr:   String(sdohState.scr),
      pos:   String(sdohState.pos),
      nav:   String(sdohState.nav),
      cst:   String(sdohState.cst),
      rr:    String(sdohState.rr),
    });
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }, [slState, sdohState]);

  const buildScenarioSummary = useCallback((): string => {
    const npv = fmtM(calcNPV(slState));
    const intervened = sdohState.pop * (sdohState.scr / 100) * (sdohState.pos / 100) * (sdohState.nav / 100);
    const readmitSave = fmtM(intervened * (sdohState.rr / 100) * sdohState.cst);

    return [
      "BD Financial Scenario Summary",
      "=====================================",
      "",
      "Service Line Model",
      `  Annual Volume (Yr 1):    ${slState.vol.toLocaleString()} encounters`,
      `  Revenue per Encounter:   $${slState.rpe}`,
      `  Annual Growth Rate:      ${slState.grw}%`,
      `  Payer Mix:               ${slState.commercial}% Commercial / ${slState.medicare}% Medicare / ${slState.medicaid}% Medicaid / ${slState.selfPay}% Self-pay`,
      `  Startup Investment:      $${slState.stup}M`,
      `  Operating Cost Ratio:    ${slState.opc}%`,
      `  5-year NPV (8% disc.):   ${npv}`,
      "",
      "SDOH Financial Impact",
      `  Attributed Population:   ${sdohState.pop.toLocaleString()}`,
      `  Screening Rate:          ${sdohState.scr}%`,
      `  Patients Intervened/yr:  ${Math.round(intervened).toLocaleString()}`,
      `  Readmission Savings/yr:  ${readmitSave}`,
      "",
      "Generated by Michigan Access BD Financial Model",
      buildShareUrl(),
    ].join("\n");
  }, [slState, sdohState, buildShareUrl]);

  const handleCopyLink = useCallback(async () => {
    await navigator.clipboard.writeText(buildShareUrl());
    setCopied("link");
    setTimeout(() => setCopied(null), 2500);
  }, [buildShareUrl]);

  const handleCopySummary = useCallback(async () => {
    await navigator.clipboard.writeText(buildScenarioSummary());
    setCopied("summary");
    setTimeout(() => setCopied(null), 2500);
  }, [buildScenarioSummary]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground max-w-2xl">
        Share your current scenario with colleagues, export a summary for presentations, or print this page as a PDF.
        All slider values are encoded in the shareable link.
      </p>

      {/* Action cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {([
          {
            id:    "link" as const,
            icon:  <Share2 className="h-6 w-6 text-michigan-teal" />,
            title: "Copy Shareable Link",
            desc:  "URL-encodes all current slider values",
            action: handleCopyLink,
          },
          {
            id:    "summary" as const,
            icon:  <Copy className="h-6 w-6 text-michigan-teal" />,
            title: "Copy Scenario Summary",
            desc:  "Plain-text executive brief",
            action: handleCopySummary,
          },
          {
            id:    null,
            icon:  <Printer className="h-6 w-6 text-michigan-teal" />,
            title: "Print / Export PDF",
            desc:  "Uses browser print dialog",
            action: () => window.print(),
          },
        ] as const).map(card => (
          <button
            key={card.title}
            onClick={card.action}
            className="flex flex-col items-center gap-3 rounded-lg border border-border p-6 text-center hover:border-michigan-teal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-michigan-teal"
          >
            {card.icon}
            <div>
              <p className="text-sm font-semibold text-foreground">{card.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
            </div>
            {card.id !== null && copied === card.id && (
              <span className="text-xs text-michigan-teal font-medium">✓ Copied!</span>
            )}
          </button>
        ))}
      </div>

      {/* Scenario snapshot */}
      <div className="rounded-lg border border-border bg-muted/20 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Current scenario snapshot</p>
        <div className="grid gap-4 sm:grid-cols-2 text-xs">
          <div className="space-y-1.5">
            <p className="font-semibold text-foreground mb-2">Service Line</p>
            <p className="text-muted-foreground">Volume: <span className="text-foreground">{slState.vol.toLocaleString()}/yr</span></p>
            <p className="text-muted-foreground">RPE: <span className="text-foreground">${slState.rpe}</span></p>
            <p className="text-muted-foreground">Growth: <span className="text-foreground">{slState.grw}%</span></p>
            <p className="text-muted-foreground">Payer mix: <span className="text-foreground">{slState.commercial}% Comm / {slState.medicare}% MCR / {slState.medicaid}% MCD / {slState.selfPay}% SP</span></p>
            <p className="text-muted-foreground">Startup: <span className="text-foreground">${slState.stup}M</span></p>
            <p className="text-muted-foreground">Op. cost: <span className="text-foreground">{slState.opc}%</span></p>
            <p className="text-muted-foreground font-medium mt-1">5-yr NPV: <span className="text-michigan-teal">{fmtM(calcNPV(slState))}</span></p>
          </div>
          <div className="space-y-1.5">
            <p className="font-semibold text-foreground mb-2">SDOH Program</p>
            <p className="text-muted-foreground">Population: <span className="text-foreground">{sdohState.pop.toLocaleString()}</span></p>
            <p className="text-muted-foreground">Screening: <span className="text-foreground">{sdohState.scr}%</span></p>
            <p className="text-muted-foreground">Pos. screen: <span className="text-foreground">{sdohState.pos}%</span></p>
            <p className="text-muted-foreground">Navigation: <span className="text-foreground">{sdohState.nav}%</span></p>
            <p className="text-muted-foreground">Cost/readmit: <span className="text-foreground">${sdohState.cst.toLocaleString()}</span></p>
            <p className="text-muted-foreground">Readmit reduction: <span className="text-foreground">{sdohState.rr}%</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BDFinancialModelPage() {
  usePageMeta({
    title: "BD Financial Model — Access Michigan",
    description: "Interactive partnership and market development scenario modeler. Service line NPV, build vs. partner vs. acquire comparisons, market opportunity scoring, and SDOH ROI — built on Michigan public health data.",
    path: "/bd-financial-model",
  });

  const [searchParams] = useSearchParams();

  // ── Initialise service-line state: URL params → localStorage → defaults ───
  const [sl, setSl] = useState<ServiceLineState>(() => {
    const stored = readStorage<ServiceLineState>(SL_KEY, SL_DEFAULTS);
    // Merge URL params on top of stored/default values (URL params take precedence)
    const hasAnyUrlParam = ["vol","rpe","grw","comm","medc","mcaid","sp","stup","opc","mktv"].some(k => searchParams.get(k) !== null);
    if (!hasAnyUrlParam) return stored;
    return {
      vol:        searchParams.get("vol")   !== null ? Number(searchParams.get("vol"))   : stored.vol,
      rpe:        searchParams.get("rpe")   !== null ? Number(searchParams.get("rpe"))   : stored.rpe,
      grw:        searchParams.get("grw")   !== null ? Number(searchParams.get("grw"))   : stored.grw,
      commercial: searchParams.get("comm")  !== null ? Number(searchParams.get("comm"))  : stored.commercial,
      medicare:   searchParams.get("medc")  !== null ? Number(searchParams.get("medc"))  : stored.medicare,
      medicaid:   searchParams.get("mcaid") !== null ? Number(searchParams.get("mcaid")) : stored.medicaid,
      selfPay:    searchParams.get("sp")    !== null ? Number(searchParams.get("sp"))    : stored.selfPay,
      stup:       searchParams.get("stup")  !== null ? Number(searchParams.get("stup"))  : stored.stup,
      opc:        searchParams.get("opc")   !== null ? Number(searchParams.get("opc"))   : stored.opc,
      mktv:       searchParams.get("mktv")  !== null ? Number(searchParams.get("mktv"))  : stored.mktv,
    };
  });

  // ── Initialise SDOH state: URL params → localStorage → defaults ───────────
  const [sdoh, setSdoh] = useState<SdohState>(() => {
    const stored = readStorage<SdohState>(SDOH_KEY, SDOH_DEFAULTS);
    const hasAnyUrlParam = ["pop","scr","pos","nav","cst","rr"].some(k => searchParams.get(k) !== null);
    if (!hasAnyUrlParam) return stored;
    return {
      pop: searchParams.get("pop") !== null ? Number(searchParams.get("pop")) : stored.pop,
      scr: searchParams.get("scr") !== null ? Number(searchParams.get("scr")) : stored.scr,
      pos: searchParams.get("pos") !== null ? Number(searchParams.get("pos")) : stored.pos,
      nav: searchParams.get("nav") !== null ? Number(searchParams.get("nav")) : stored.nav,
      cst: searchParams.get("cst") !== null ? Number(searchParams.get("cst")) : stored.cst,
      rr:  searchParams.get("rr")  !== null ? Number(searchParams.get("rr"))  : stored.rr,
    };
  });

  // ── Resume banner — visible when localStorage differs from defaults ────────
  const [showBanner, setShowBanner] = useState<boolean>(() => {
    // Don't show if URL params are present (user came from a shared link)
    const hasUrlParams = ["vol","rpe","pop","scr"].some(k => searchParams.get(k) !== null);
    if (hasUrlParams) return false;
    return (
      hasSavedDiff(SL_KEY,   SL_DEFAULTS as unknown as Record<string, unknown>) ||
      hasSavedDiff(SDOH_KEY, SDOH_DEFAULTS as unknown as Record<string, unknown>)
    );
  });

  // Persist to localStorage on every change
  useEffect(() => { writeStorage(SL_KEY, sl); }, [sl]);
  useEffect(() => { writeStorage(SDOH_KEY, sdoh); }, [sdoh]);

  const updateSl   = useCallback((patch: Partial<ServiceLineState>) =>
    setSl(prev => ({ ...prev, ...patch })), []);
  const updateSdoh = useCallback((patch: Partial<SdohState>) =>
    setSdoh(prev => ({ ...prev, ...patch })), []);

  const resetAll = useCallback(() => {
    setSl(SL_DEFAULTS);
    setSdoh(SDOH_DEFAULTS);
    setShowBanner(false);
  }, []);

  return (
    <Layout>
      {/* ── Resume scenario banner ─────────────────────────────────────────── */}
      {showBanner && (
        <div className="bg-michigan-teal/10 border-b border-michigan-teal/20 px-4 py-2.5 flex items-center justify-between gap-4">
          <p className="text-sm text-foreground">
            💾 <strong>Restored your last scenario</strong> from this browser.{" "}
            <button
              onClick={resetAll}
              className="underline text-michigan-teal hover:text-michigan-teal/80 text-sm"
            >
              Reset to defaults
            </button>
          </p>
          <button
            onClick={() => setShowBanner(false)}
            aria-label="Dismiss"
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-12 lg:py-16">
        <div className="container max-w-5xl">
          <Breadcrumbs items={[
            { label: "For Health Systems", href: "/for-health-systems" },
            { label: "BD Financial Model" },
          ]} />
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <Badge variant="outline" className="mb-4 uppercase tracking-wider text-xs border-primary/30 text-primary">
              Business Development Tools
            </Badge>
          </motion.div>
          <motion.h1
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="text-3xl font-bold text-foreground lg:text-4xl mb-3"
          >
            Partnership & Market Development Scenario Modeler
          </motion.h1>
          <motion.p
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-muted-foreground max-w-2xl text-lg mb-6"
          >
            Quantify partnership value, compare growth strategies, and identify market opportunity across Michigan's 83 counties — built on CDC SVI, HRSA shortage area, and County Health Rankings data.
          </motion.p>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="flex flex-wrap gap-3">
            <Button asChild size="sm" variant="outline">
              <Link to="/for-health-systems" className="gap-2">
                <Building2 className="h-4 w-4" /> For Health Systems
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/impact" className="gap-2">
                <BarChart3 className="h-4 w-4" /> Case Studies
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <section className="container max-w-5xl py-10">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}>
          <Tabs defaultValue="service-line">
            <TabsList className="flex-wrap h-auto gap-1 mb-8">
              <TabsTrigger value="service-line" className="gap-1.5"><Calculator className="h-3.5 w-3.5" />Service line model</TabsTrigger>
              <TabsTrigger value="bpa"          className="gap-1.5"><GitBranch  className="h-3.5 w-3.5" />Build · Partner · Acquire</TabsTrigger>
              <TabsTrigger value="market-opp"   className="gap-1.5"><Map        className="h-3.5 w-3.5" />Market opportunity</TabsTrigger>
              <TabsTrigger value="sdoh-impact"  className="gap-1.5"><Heart      className="h-3.5 w-3.5" />SDOH financial impact</TabsTrigger>
              <TabsTrigger value="export"       className="gap-1.5"><Share2     className="h-3.5 w-3.5" />Export &amp; Share</TabsTrigger>
            </TabsList>

            <TabsContent value="service-line"><ServiceLineTab sl={sl} onSl={updateSl} /></TabsContent>
            <TabsContent value="bpa"><BuildPartnerAcquireTab /></TabsContent>
            <TabsContent value="market-opp"><MarketOpportunityTab /></TabsContent>
            <TabsContent value="sdoh-impact"><SdohImpactTab sdoh={sdoh} onSdoh={updateSdoh} /></TabsContent>
            <TabsContent value="export"><ExportShareTab slState={sl} sdohState={sdoh} /></TabsContent>
          </Tabs>
        </motion.div>

        {/* Data attribution */}
        <motion.div
          initial="hidden" animate="visible" variants={fadeUp} custom={5}
          className="mt-12 rounded-lg border border-border bg-muted/30 p-5"
        >
          <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
            <Info className="h-3.5 w-3.5 text-muted-foreground" /> Data sources &amp; methodology
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Financial projections are illustrative scenario models for strategic planning purposes. Market opportunity scores
            derived from <strong className="text-foreground">CDC Social Vulnerability Index 2022</strong>, <strong className="text-foreground">HRSA Health Professional Shortage Area</strong> data,
            and <strong className="text-foreground">County Health Rankings 2025</strong>. SDOH impact parameters anchored to published outcomes
            from <strong className="text-foreground">Trinity Health</strong> (27.4% unmet social need rate from 1M+ screened; 16% readmission reduction, FY2025) and
            <strong className="text-foreground">Henry Ford Health</strong> ACO shared savings data (PY2024 $19.97M). Not actuarial projections.
            AI-generated narratives are for strategic planning illustration only.
          </p>
        </motion.div>
      </section>
    </Layout>
  );
}
