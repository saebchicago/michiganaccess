import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line, ComposedChart, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import {
  TrendingUp, BarChart3, Map, GitBranch, Heart, Calculator,
  ArrowRight, CheckCircle2, AlertTriangle, Info
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.45 },
  }),
};

// ─── County opportunity data ──────────────────────────────────────────────────
const COUNTIES = [
  { name: "Missaukee",     opp: 91, shortage: 4.2, svi: 0.88, pop: 15000  },
  { name: "Oscoda",        opp: 89, shortage: 4.5, svi: 0.85, pop: 8400   },
  { name: "Clare",         opp: 87, shortage: 3.9, svi: 0.83, pop: 30600  },
  { name: "Montmorency",   opp: 85, shortage: 4.1, svi: 0.81, pop: 9400   },
  { name: "Roscommon",     opp: 83, shortage: 3.7, svi: 0.79, pop: 24000  },
  { name: "Lake",          opp: 82, shortage: 3.8, svi: 0.82, pop: 11800  },
  { name: "Crawford",      opp: 80, shortage: 3.5, svi: 0.77, pop: 13600  },
  { name: "Ogemaw",        opp: 78, shortage: 3.3, svi: 0.76, pop: 20700  },
  { name: "Alcona",        opp: 76, shortage: 3.2, svi: 0.74, pop: 10500  },
  { name: "Presque Isle",  opp: 74, shortage: 3.0, svi: 0.72, pop: 12900  },
  { name: "Arenac",        opp: 72, shortage: 2.9, svi: 0.71, pop: 15200  },
  { name: "Iosco",         opp: 70, shortage: 2.8, svi: 0.70, pop: 24800  },
  { name: "Mecosta",       opp: 68, shortage: 2.7, svi: 0.66, pop: 43200  },
  { name: "Huron",         opp: 66, shortage: 2.6, svi: 0.64, pop: 30700  },
  { name: "Sanilac",       opp: 64, shortage: 2.4, svi: 0.63, pop: 40600  },
  { name: "Tuscola",       opp: 62, shortage: 2.3, svi: 0.61, pop: 52500  },
  { name: "Isabella",      opp: 60, shortage: 2.2, svi: 0.59, pop: 64500  },
  { name: "Gratiot",       opp: 58, shortage: 2.1, svi: 0.57, pop: 40100  },
  { name: "Montcalm",      opp: 56, shortage: 2.0, svi: 0.55, pop: 63000  },
  { name: "Shiawassee",    opp: 54, shortage: 1.9, svi: 0.52, pop: 68000  },
  { name: "Bay",           opp: 52, shortage: 1.8, svi: 0.50, pop: 103000 },
  { name: "Genesee",       opp: 50, shortage: 1.7, svi: 0.62, pop: 406000 },
  { name: "Saginaw",       opp: 48, shortage: 1.6, svi: 0.65, pop: 190000 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtM(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${sign}$${Math.round(abs / 1e3)}K`;
  return `${sign}$${Math.round(abs)}`;
}

// ─── Sub-component: KPI card ─────────────────────────────────────────────────
function KPI({ label, value, sub, good }: { label: string; value: string; sub: string; good?: boolean }) {
  return (
    <div className="rounded-lg bg-muted/50 p-4">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${good ? "text-michigan-teal" : "text-foreground"}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
    </div>
  );
}

// ─── Sub-component: Slider row ────────────────────────────────────────────────
function SliderRow({
  label, value, display, min, max, step, onChange,
}: {
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
function ServiceLineTab() {
  const [vol,  setVol]  = useState(5000);
  const [rpe,  setRpe]  = useState(420);
  const [grw,  setGrw]  = useState(12);
  const [pyr,  setPyr]  = useState(38);
  const [stup, setStup] = useState(3.5);
  const [opc,  setOpc]  = useState(65);
  const [mktv, setMktv] = useState(280);

  const result = useMemo(() => {
    const DISC = 0.08;
    const pm = 1 + (pyr / 100 - 0.30) * 0.4;
    const startup = stup * 1e6;
    let npv = -startup, cum = -startup;
    let be: number | null = null;
    const chartData: { year: string; revenue: number; cumCF: number }[] = [];

    for (let y = 1; y <= 5; y++) {
      const rev = vol * Math.pow(1 + grw / 100, y - 1) * rpe * pm;
      const cf  = rev * (1 - opc / 100) - (y === 1 ? startup * 0.1 : 0);
      cum += cf;
      npv += cf / Math.pow(1 + DISC, y);
      if (!be && cum > 0) be = y;
      chartData.push({
        year: `Yr ${y}`,
        revenue: parseFloat((rev / 1e6).toFixed(2)),
        cumCF:   parseFloat((cum / 1e6).toFixed(2)),
      });
    }

    const y1net = chartData[0].revenue * 1e6 * (1 - opc / 100) - startup * 0.1;
    const ms    = (chartData[0].revenue * 1e6 / (mktv * 1e6)) * 100;

    let insight = "";
    if (npv > 20e6)
      insight = `Strong opportunity — NPV exceeds $20M at ${grw}% annual growth. Commercial payer mix at ${pyr}% is ${pyr > 40 ? "above" : "near"} break-even threshold. Recommend organic build scenario.`;
    else if (npv > 5e6)
      insight = `Moderate returns — NPV of ${fmtM(npv)} is positive but sensitive to cost ratio. Consider JV structure to reduce startup exposure and accelerate time to revenue.`;
    else
      insight = `Thin margins at current inputs. Revisit volume ramp or payer mix — or consider acquiring an existing player to capture immediate cash flow.`;

    return { npv, y1net, be, ms, chartData, insight };
  }, [vol, rpe, grw, pyr, stup, opc, mktv]);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KPI label="5-year NPV"           value={fmtM(result.npv)}              sub="at 8% discount rate"      good={result.npv > 0} />
        <KPI label="Year 1 net"           value={fmtM(result.y1net)}            sub="after startup costs"      good={result.y1net > 0} />
        <KPI label="Breakeven"            value={result.be ? `Year ${result.be}` : ">5 yrs"} sub="cumulative cash flow" />
        <KPI label="Market capture Yr 1"  value={`${result.ms.toFixed(1)}%`}    sub="of addressable market" />
      </div>

      {/* Inputs + Chart */}
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Revenue assumptions</p>
          <SliderRow label="Annual patient volume (Yr 1)" value={vol}  display={vol.toLocaleString()}    min={500}  max={20000} step={100} onChange={setVol} />
          <SliderRow label="Revenue per encounter"        value={rpe}  display={`$${rpe}`}               min={150}  max={1200}  step={10}  onChange={setRpe} />
          <SliderRow label="Annual volume growth"         value={grw}  display={`${grw}%`}               min={2}    max={25}    step={1}   onChange={setGrw} />
          <SliderRow label="Commercial payer mix"         value={pyr}  display={`${pyr}%`}               min={10}   max={70}    step={1}   onChange={setPyr} />
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 mt-6">Cost structure</p>
          <SliderRow label="Startup investment"           value={stup} display={`$${stup}M`}             min={0.5}  max={15}    step={0.5} onChange={setStup} />
          <SliderRow label="Operating cost ratio"         value={opc}  display={`${opc}%`}               min={40}   max={85}    step={1}   onChange={setOpc} />
          <SliderRow label="Addressable market"           value={mktv} display={`$${mktv}M`}             min={10}   max={500}   step={5}   onChange={setMktv} />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">5-year projection</p>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={result.chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#88878820" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v}M`} />
              <Tooltip formatter={(v: number) => [`$${v.toFixed(1)}M`]} />
              <Bar    dataKey="revenue" name="Revenue"           fill="#378ADD33" stroke="#378ADD" strokeWidth={1} />
              <Line   dataKey="cumCF"   name="Cumulative CF"     stroke="#1D9E75" strokeWidth={2} dot={{ r: 4, fill: "#1D9E75" }} />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#378ADD33] border border-[#378ADD] inline-block" />Revenue</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#1D9E75] inline-block" />Cumulative cash flow</span>
          </div>

          {/* Dynamic insight */}
          <div className="mt-4 rounded-lg border-l-2 border-michigan-teal bg-muted/40 px-4 py-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Strategic read: </span>
              {result.insight}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab 2: Build · Partner · Acquire ────────────────────────────────────────
const BPA_CHART = [
  { scenario: "Build",       optimistic: 32, base: 22, downside: 8  },
  { scenario: "Partner/JV",  optimistic: 26, base: 16, downside: 6  },
  { scenario: "Acquire",     optimistic: 42, base: 28, downside: -4 },
];

const BPA_TABLE = [
  { dim: "Capital required",     build: "$3–8M",    partner: "$1.5–4M",         acquire: "$12–40M"   },
  { dim: "Time to revenue",      build: "18–30 mo", partner: "9–15 mo",          acquire: "Day 1"     },
  { dim: "5-yr NPV (base)",      build: "$22M",     partner: "$16M (50% stake)", acquire: "$28M",     highlight: true },
  { dim: "Integration risk",     build: "Low",      partner: "Medium",           acquire: "High"      },
  { dim: "Market share gain",    build: "Gradual",  partner: "Moderate",         acquire: "Immediate" },
  { dim: "Mission alignment",    build: "High",     partner: "High",             acquire: "Variable"  },
  { dim: "Best for",             build: "New service lines with differentiation potential",
                                 partner: "Geography / payer access constraints",
                                 acquire: "Established competitors with retained revenue", highlight: true },
];

function BuildPartnerAcquireTab() {
  const [selected, setSelected] = useState<"build" | "partner" | "acquire">("build");

  const cards = [
    { id: "build"   as const, badge: "Build",       color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300", desc: "Full ownership · highest control · longest runway" },
    { id: "partner" as const, badge: "Partner / JV", color: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",           desc: "Shared capital · faster launch · aligned incentives" },
    { id: "acquire" as const, badge: "Acquire",      color: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",       desc: "Immediate volume · highest upfront cost · integration risk" },
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
            {BPA_TABLE.map((row) => (
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
            <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v}M`} />
            <Tooltip formatter={(v: number) => [`$${v}M`]} />
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
  const [sortBy,  setSortBy]  = useState("opp");
  const [minScore, setMinScore] = useState(50);

  const filtered = useMemo(() => {
    const data = COUNTIES.filter(c => c.opp >= minScore);
    if (sortBy === "shortage") return [...data].sort((a, b) => b.shortage - a.shortage);
    if (sortBy === "svi")      return [...data].sort((a, b) => b.svi - a.svi);
    return [...data].sort((a, b) => b.opp - a.opp);
  }, [sortBy, minScore]);

  const maxOpp = Math.max(...filtered.map(c => c.opp), 1);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KPI label="High-opp counties"   value="23"    sub="score ≥ 70 / 100"     good />
        <KPI label="Addressable pop."    value="1.4M"  sub="in top-tier counties"        />
        <KPI label="Avg shortage ratio"  value="3.2×"  sub="need vs. supply index"       />
        <KPI label="Avg SVI (top tier)"  value="0.74"  sub="CDC vulnerability index"     />
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
      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">No counties meet the minimum score threshold.</p>
        )}
        {filtered.map(c => {
          const barW  = Math.round((c.opp / maxOpp) * 100);
          const color = c.opp >= 80 ? "#1D9E75" : c.opp >= 65 ? "#378ADD" : "#BA7517";
          return (
            <div key={c.name} className="flex items-center gap-3 py-2 border-b border-border/40">
              <span className="text-xs font-medium text-foreground w-28 shrink-0">{c.name}</span>
              <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                <div className="h-1.5 rounded-full transition-all" style={{ width: `${barW}%`, background: color }} />
              </div>
              <span className="text-xs font-semibold w-8 text-right shrink-0" style={{ color }}>{c.opp}</span>
              <span className="text-xs text-muted-foreground w-14 text-right shrink-0">SVI {c.svi.toFixed(2)}</span>
              <span className="text-xs text-muted-foreground w-12 text-right shrink-0">{(c.pop / 1000).toFixed(0)}K</span>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-4">
        Opportunity scores derived from CDC Social Vulnerability Index 2022, HRSA Health Professional Shortage Area data,
        and County Health Rankings 2025. Scores are composite indices for strategic planning — not actuarial projections.
      </p>
    </div>
  );
}

// ─── Tab 4: SDOH Financial Impact ────────────────────────────────────────────
function SdohImpactTab() {
  const [pop,    setPop]    = useState(12000);
  const [scr,    setScr]    = useState(65);
  const [pos,    setPos]    = useState(17);
  const [nav,    setNav]    = useState(34);
  const [cst,    setCst]    = useState(14500);
  const [rr,     setRr]     = useState(16);

  const result = useMemo(() => {
    const intervened  = pop * (scr / 100) * (pos / 100) * (nav / 100);
    const readmitSave = intervened * (rr / 100) * cst;
    const edSave      = intervened * 0.22 * 850;
    const vbcBonus    = (readmitSave + edSave) * 0.25;
    const progCost    = pop * (scr / 100) * 45;
    const roi3        = ((readmitSave + edSave + vbcBonus) * 3) / (progCost * 3);

    const chartData = [1, 2, 3].map(y => ({
      year:     `Yr ${y}`,
      readmit:  parseFloat(((readmitSave * y) / 1e6).toFixed(2)),
      ed:       parseFloat(((edSave * y) / 1e6).toFixed(2)),
      vbc:      parseFloat(((vbcBonus * y) / 1e6).toFixed(2)),
    }));

    const insight = intervened < 100
      ? `Low intervention volume — only ${Math.round(intervened)} patients reached per year. Increase screening rate or navigation capacity.`
      : `${Math.round(intervened).toLocaleString()} patients reached annually through SDOH navigation. Projected ${rr}% readmission reduction generates ${fmtM(readmitSave)} in Year 1 savings — a ${roi3.toFixed(1)}× 3-year ROI on program cost.`;

    return { readmitSave, edSave, vbcBonus, roi3, chartData, insight };
  }, [pop, scr, pos, nav, cst, rr]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground max-w-2xl">
        Model the downstream financial impact of SDOH interventions on readmissions, ED utilization, and value-based care contracts.
        Default parameters anchored to <strong className="text-foreground">Michigan Medicine MSHIELD</strong> (17.1% unmet need rate) and <strong className="text-foreground">Trinity Health</strong> outcomes (16% readmission reduction).
      </p>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KPI label="Avoided readmissions" value={fmtM(result.readmitSave)} sub="annual savings"      good={result.readmitSave > 0} />
        <KPI label="ED diversion"         value={fmtM(result.edSave)}      sub="avoided ED costs"    good={result.edSave > 0}      />
        <KPI label="VBC bonus potential"  value={fmtM(result.vbcBonus)}    sub="quality metric uplift"                             />
        <KPI label="3-year ROI"           value={`${result.roi3.toFixed(1)}×`} sub="on program cost" good={result.roi3 > 2}        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Program parameters</p>
          <SliderRow label="Attributed population (patients/yr)" value={pop} display={pop.toLocaleString()}  min={1000}  max={100000} step={1000} onChange={setPop} />
          <SliderRow label="SDOH screening rate"                  value={scr} display={`${scr}%`}            min={10}    max={95}     step={5}    onChange={setScr} />
          <SliderRow label="Positive screen rate (unmet need)"    value={pos} display={`${pos}%`}            min={5}     max={40}     step={1}    onChange={setPos} />
          <SliderRow label="Navigation intervention rate"         value={nav} display={`${nav}%`}            min={10}    max={85}     step={1}    onChange={setNav} />
          <SliderRow label="Avg cost per readmission"             value={cst} display={`$${cst.toLocaleString()}`} min={8000} max={30000} step={500} onChange={setCst} />
          <SliderRow label="Readmission reduction from nav."      value={rr}  display={`${rr}%`}             min={5}     max={30}     step={1}    onChange={setRr}  />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">3-year cumulative impact ($M)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={result.chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#88878820" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v}M`} />
              <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}M`]} />
              <Bar dataKey="readmit" name="Readmission savings" stackId="a" fill="#1D9E75"   stroke="#1D9E75"   strokeWidth={0} />
              <Bar dataKey="ed"      name="ED diversion"        stackId="a" fill="#378ADD"   stroke="#378ADD"   strokeWidth={0} />
              <Bar dataKey="vbc"     name="VBC bonus"           stackId="a" fill="#9FE1CB"   stroke="#0F6E56"   strokeWidth={1} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#1D9E75] inline-block" />Readmission savings</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#378ADD] inline-block" />ED diversion</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#9FE1CB] border border-[#0F6E56] inline-block" />VBC bonus</span>
          </div>

          <div className="mt-4 rounded-lg border-l-2 border-michigan-teal bg-muted/40 px-4 py-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Model output: </span>
              {result.insight}
            </p>
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

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-12 lg:py-16">
        <div className="container max-w-5xl">
          <Breadcrumbs items={[{ label: "For Health Systems", href: "/for-health-systems" }, { label: "BD Financial Model" }]} />
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

      {/* Main content */}
      <section className="container max-w-5xl py-10">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}>
          <Tabs defaultValue="service-line">
            <TabsList className="flex-wrap h-auto gap-1 mb-8">
              <TabsTrigger value="service-line"    className="gap-1.5"><Calculator className="h-3.5 w-3.5" />Service line model</TabsTrigger>
              <TabsTrigger value="bpa"             className="gap-1.5"><GitBranch  className="h-3.5 w-3.5" />Build · Partner · Acquire</TabsTrigger>
              <TabsTrigger value="market-opp"      className="gap-1.5"><Map        className="h-3.5 w-3.5" />Market opportunity</TabsTrigger>
              <TabsTrigger value="sdoh-impact"     className="gap-1.5"><Heart      className="h-3.5 w-3.5" />SDOH financial impact</TabsTrigger>
            </TabsList>

            <TabsContent value="service-line"><ServiceLineTab /></TabsContent>
            <TabsContent value="bpa"><BuildPartnerAcquireTab /></TabsContent>
            <TabsContent value="market-opp"><MarketOpportunityTab /></TabsContent>
            <TabsContent value="sdoh-impact"><SdohImpactTab /></TabsContent>
          </Tabs>
        </motion.div>

        {/* Data attribution */}
        <motion.div
          initial="hidden" animate="visible" variants={fadeUp} custom={5}
          className="mt-12 rounded-lg border border-border bg-muted/30 p-5"
        >
          <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
            <Info className="h-3.5 w-3.5 text-muted-foreground" /> Data sources & methodology
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Financial projections are illustrative scenario models for strategic planning purposes. Market opportunity scores
            derived from <strong className="text-foreground">CDC Social Vulnerability Index 2022</strong>, <strong className="text-foreground">HRSA Health Professional Shortage Area</strong> data,
            and <strong className="text-foreground">County Health Rankings 2025</strong>. SDOH impact parameters anchored to published outcomes
            from <strong className="text-foreground">Michigan Medicine MSHIELD</strong> (17.1% unmet social need rate; 34% navigation uptake) and
            <strong className="text-foreground"> Trinity Health</strong> (16% readmission reduction from SDOH navigation). Not actuarial projections.
          </p>
        </motion.div>
      </section>
    </Layout>
  );
}