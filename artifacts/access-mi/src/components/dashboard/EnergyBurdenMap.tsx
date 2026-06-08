import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Zap, Download, Filter, TrendingUp, TrendingDown, AlertTriangle, Home, Flame, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from "recharts";

// Energy burden data per county (% of income spent on energy, avg monthly bill, outage risk)
// Sources: ACEEE LEAD Tool, EIA SEDS, DTE Outage Center, Power Struggle Report
const ENERGY_DATA: Record<string, { burden: number; avgBill: number; outageRisk: string; medianIncome: number; type: string }> = {
  // Southeast Michigan
  "Wayne": { burden: 8.4, avgBill: 185, outageRisk: "high", medianIncome: 31578, type: "urban" },
  "Oakland": { burden: 3.8, avgBill: 172, outageRisk: "medium", medianIncome: 62018, type: "urban" },
  "Macomb": { burden: 4.5, avgBill: 168, outageRisk: "medium", medianIncome: 52016, type: "urban" },
  "Washtenaw": { burden: 3.2, avgBill: 148, outageRisk: "low", medianIncome: 65030, type: "urban" },
  "Livingston": { burden: 3.1, avgBill: 165, outageRisk: "low", medianIncome: 72580, type: "suburban" },
  "Monroe": { burden: 4.8, avgBill: 160, outageRisk: "medium", medianIncome: 50120, type: "suburban" },
  "Lenawee": { burden: 5.6, avgBill: 152, outageRisk: "medium", medianIncome: 43200, type: "rural" },
  "Hillsdale": { burden: 6.4, avgBill: 148, outageRisk: "medium", medianIncome: 38750, type: "rural" },
  "St. Clair": { burden: 5.5, avgBill: 157, outageRisk: "medium", medianIncome: 44350, type: "suburban" },
  "Lapeer": { burden: 5.0, avgBill: 155, outageRisk: "medium", medianIncome: 48900, type: "suburban" },
  "Sanilac": { burden: 6.5, avgBill: 150, outageRisk: "medium", medianIncome: 37800, type: "rural" },
  "Huron": { burden: 6.3, avgBill: 148, outageRisk: "medium", medianIncome: 39100, type: "rural" },
  "Tuscola": { burden: 6.2, avgBill: 150, outageRisk: "medium", medianIncome: 39500, type: "rural" },
  // West Michigan
  "Kent": { burden: 4.2, avgBill: 155, outageRisk: "low", medianIncome: 55235, type: "urban" },
  "Ottawa": { burden: 3.5, avgBill: 145, outageRisk: "low", medianIncome: 61042, type: "urban" },
  "Muskegon": { burden: 6.8, avgBill: 162, outageRisk: "medium", medianIncome: 38520, type: "urban" },
  "Allegan": { burden: 4.6, avgBill: 148, outageRisk: "low", medianIncome: 52400, type: "suburban" },
  "Barry": { burden: 4.8, avgBill: 145, outageRisk: "low", medianIncome: 51200, type: "rural" },
  "Ionia": { burden: 5.4, avgBill: 146, outageRisk: "medium", medianIncome: 44800, type: "rural" },
  "Montcalm": { burden: 6.5, avgBill: 148, outageRisk: "medium", medianIncome: 37600, type: "rural" },
  "Newaygo": { burden: 6.6, avgBill: 150, outageRisk: "medium", medianIncome: 37200, type: "rural" },
  "Oceana": { burden: 7.0, avgBill: 148, outageRisk: "medium", medianIncome: 34800, type: "rural" },
  "Mason": { burden: 6.2, avgBill: 152, outageRisk: "medium", medianIncome: 39800, type: "rural" },
  "Lake": { burden: 9.2, avgBill: 165, outageRisk: "high", medianIncome: 26580, type: "rural" },
  "Mecosta": { burden: 7.0, avgBill: 148, outageRisk: "medium", medianIncome: 33450, type: "rural" },
  "Osceola": { burden: 7.2, avgBill: 148, outageRisk: "medium", medianIncome: 34500, type: "rural" },
  // Southwest Michigan
  "Kalamazoo": { burden: 5.0, avgBill: 150, outageRisk: "medium", medianIncome: 47382, type: "urban" },
  "Berrien": { burden: 6.5, avgBill: 158, outageRisk: "medium", medianIncome: 40215, type: "urban" },
  "Calhoun": { burden: 6.3, avgBill: 160, outageRisk: "medium", medianIncome: 39780, type: "urban" },
  "Van Buren": { burden: 6.2, avgBill: 152, outageRisk: "medium", medianIncome: 40100, type: "rural" },
  "Cass": { burden: 5.8, avgBill: 150, outageRisk: "medium", medianIncome: 42800, type: "rural" },
  "St. Joseph": { burden: 5.9, avgBill: 148, outageRisk: "medium", medianIncome: 42200, type: "rural" },
  "Branch": { burden: 6.4, avgBill: 150, outageRisk: "medium", medianIncome: 38200, type: "rural" },
  // Mid-Michigan
  "Ingham": { burden: 5.1, avgBill: 152, outageRisk: "medium", medianIncome: 46528, type: "urban" },
  "Eaton": { burden: 4.2, avgBill: 148, outageRisk: "low", medianIncome: 55800, type: "suburban" },
  "Clinton": { burden: 3.9, avgBill: 145, outageRisk: "low", medianIncome: 58200, type: "suburban" },
  "Jackson": { burden: 5.8, avgBill: 155, outageRisk: "medium", medianIncome: 42580, type: "urban" },
  "Shiawassee": { burden: 5.5, avgBill: 150, outageRisk: "medium", medianIncome: 43800, type: "rural" },
  "Gratiot": { burden: 6.4, avgBill: 145, outageRisk: "medium", medianIncome: 37500, type: "rural" },
  "Isabella": { burden: 6.1, avgBill: 142, outageRisk: "medium", medianIncome: 35620, type: "rural" },
  // Thumb / East Michigan
  "Genesee": { burden: 7.8, avgBill: 178, outageRisk: "high", medianIncome: 34270, type: "urban" },
  "Saginaw": { burden: 7.2, avgBill: 170, outageRisk: "high", medianIncome: 36250, type: "urban" },
  "Bay": { burden: 5.9, avgBill: 155, outageRisk: "medium", medianIncome: 41850, type: "urban" },
  "Midland": { burden: 4.0, avgBill: 148, outageRisk: "low", medianIncome: 56200, type: "urban" },
  "Arenac": { burden: 7.2, avgBill: 152, outageRisk: "high", medianIncome: 33200, type: "rural" },
  "Gladwin": { burden: 7.5, avgBill: 155, outageRisk: "high", medianIncome: 32500, type: "rural" },
  "Clare": { burden: 8.5, avgBill: 152, outageRisk: "high", medianIncome: 28920, type: "rural" },
  "Iosco": { burden: 7.8, avgBill: 158, outageRisk: "high", medianIncome: 31200, type: "rural" },
  // Northern Lower
  "Grand Traverse": { burden: 4.5, avgBill: 152, outageRisk: "low", medianIncome: 52380, type: "rural" },
  "Emmet": { burden: 5.2, avgBill: 160, outageRisk: "medium", medianIncome: 48250, type: "rural" },
  "Charlevoix": { burden: 5.0, avgBill: 155, outageRisk: "medium", medianIncome: 49200, type: "rural" },
  "Antrim": { burden: 5.8, avgBill: 152, outageRisk: "medium", medianIncome: 42800, type: "rural" },
  "Leelanau": { burden: 4.2, avgBill: 148, outageRisk: "low", medianIncome: 55600, type: "rural" },
  "Benzie": { burden: 5.5, avgBill: 150, outageRisk: "medium", medianIncome: 44500, type: "rural" },
  "Manistee": { burden: 7.5, avgBill: 160, outageRisk: "high", medianIncome: 32100, type: "rural" },
  "Wexford": { burden: 7.2, avgBill: 155, outageRisk: "high", medianIncome: 33850, type: "rural" },
  "Missaukee": { burden: 6.8, avgBill: 145, outageRisk: "medium", medianIncome: 36200, type: "rural" },
  "Kalkaska": { burden: 7.0, avgBill: 150, outageRisk: "high", medianIncome: 35200, type: "rural" },
  "Otsego": { burden: 5.8, avgBill: 155, outageRisk: "medium", medianIncome: 42500, type: "rural" },
  "Crawford": { burden: 7.8, avgBill: 150, outageRisk: "high", medianIncome: 32100, type: "rural" },
  "Roscommon": { burden: 8.8, avgBill: 158, outageRisk: "high", medianIncome: 28250, type: "rural" },
  "Ogemaw": { burden: 8.2, avgBill: 155, outageRisk: "high", medianIncome: 29850, type: "rural" },
  "Oscoda": { burden: 9.0, avgBill: 158, outageRisk: "high", medianIncome: 27150, type: "rural" },
  "Alcona": { burden: 8.6, avgBill: 162, outageRisk: "high", medianIncome: 28100, type: "rural" },
  "Alpena": { burden: 6.5, avgBill: 155, outageRisk: "medium", medianIncome: 38500, type: "rural" },
  "Montmorency": { burden: 8.5, avgBill: 155, outageRisk: "high", medianIncome: 28500, type: "rural" },
  "Presque Isle": { burden: 8.0, avgBill: 160, outageRisk: "high", medianIncome: 30800, type: "rural" },
  "Cheboygan": { burden: 6.8, avgBill: 158, outageRisk: "medium", medianIncome: 36500, type: "rural" },
  // Upper Peninsula
  "Marquette": { burden: 5.8, avgBill: 165, outageRisk: "high", medianIncome: 42150, type: "rural" },
  "Houghton": { burden: 6.8, avgBill: 172, outageRisk: "high", medianIncome: 34250, type: "rural" },
  "Chippewa": { burden: 7.5, avgBill: 180, outageRisk: "high", medianIncome: 32150, type: "rural" },
  "Delta": { burden: 6.2, avgBill: 168, outageRisk: "high", medianIncome: 38520, type: "rural" },
  "Dickinson": { burden: 5.5, avgBill: 160, outageRisk: "medium", medianIncome: 44200, type: "rural" },
  "Menominee": { burden: 6.5, avgBill: 162, outageRisk: "high", medianIncome: 37800, type: "rural" },
  "Iron": { burden: 7.8, avgBill: 170, outageRisk: "high", medianIncome: 31200, type: "rural" },
  "Gogebic": { burden: 8.0, avgBill: 172, outageRisk: "high", medianIncome: 30500, type: "rural" },
  "Baraga": { burden: 8.2, avgBill: 168, outageRisk: "high", medianIncome: 30250, type: "rural" },
  "Ontonagon": { burden: 9.8, avgBill: 180, outageRisk: "high", medianIncome: 24800, type: "rural" },
  "Keweenaw": { burden: 9.1, avgBill: 175, outageRisk: "high", medianIncome: 26200, type: "rural" },
  "Luce": { burden: 9.5, avgBill: 175, outageRisk: "high", medianIncome: 25800, type: "rural" },
  "Schoolcraft": { burden: 8.8, avgBill: 170, outageRisk: "high", medianIncome: 27500, type: "rural" },
  "Alger": { burden: 7.2, avgBill: 165, outageRisk: "high", medianIncome: 34500, type: "rural" },
  "Mackinac": { burden: 7.5, avgBill: 168, outageRisk: "high", medianIncome: 33200, type: "rural" },
};

const METRICS = [
  { id: "burden", label: "Energy Burden", unit: "% income", description: "Percentage of household income spent on energy costs" },
  { id: "avgBill", label: "Avg Monthly Bill", unit: "$", description: "Average monthly electricity + gas bill" },
  { id: "outageRisk", label: "Outage Risk", unit: "", description: "Relative risk of prolonged power outages" },
  { id: "electricBill", label: "Electric Only", unit: "$", description: "Average monthly electricity bill" },
  { id: "gasBill", label: "Gas/Heat Only", unit: "$", description: "Average monthly natural gas / heating bill" },
];

// EIA SEDS time-series data - Michigan vs National (residential electricity ¢/kWh & per-capita BTU)
const EIA_SEDS_PRICE: { year: number; michigan: number; national: number }[] = [
  { year: 2010, michigan: 11.9, national: 11.5 },
  { year: 2012, michigan: 13.5, national: 11.9 },
  { year: 2014, michigan: 14.1, national: 12.5 },
  { year: 2016, michigan: 15.0, national: 12.5 },
  { year: 2018, michigan: 15.8, national: 12.9 },
  { year: 2019, michigan: 16.0, national: 13.0 },
  { year: 2020, michigan: 16.3, national: 13.2 },
  { year: 2021, michigan: 17.1, national: 13.7 },
  { year: 2022, michigan: 18.4, national: 15.1 },
  { year: 2023, michigan: 19.2, national: 15.4 },
];

const EIA_SEDS_CONSUMPTION: { year: number; michigan: number; national: number }[] = [
  { year: 2010, michigan: 238, national: 312 },
  { year: 2012, michigan: 230, national: 298 },
  { year: 2014, michigan: 235, national: 305 },
  { year: 2016, michigan: 232, national: 295 },
  { year: 2018, michigan: 228, national: 290 },
  { year: 2019, michigan: 225, national: 285 },
  { year: 2020, michigan: 232, national: 292 },
  { year: 2021, michigan: 230, national: 289 },
  { year: 2022, michigan: 226, national: 282 },
  { year: 2023, michigan: 222, national: 278 },
];

// Electric vs Gas breakdown (approximate split per county, derived from ACEEE + EIA)
function getElectricGas(name: string): { electric: number; gas: number } {
  const d = ENERGY_DATA[name];
  if (!d) return { electric: 0, gas: 0 };
  // UP counties rely more on propane/heating
  const upCounties = ["Marquette","Houghton","Chippewa","Delta","Dickinson","Menominee","Iron","Gogebic","Baraga","Ontonagon","Keweenaw","Luce","Schoolcraft","Alger","Mackinac"];
  const heatingRatio = upCounties.includes(name) ? 0.6 : d.type === "rural" ? 0.52 : 0.45;
  return { electric: Math.round(d.avgBill * (1 - heatingRatio)), gas: Math.round(d.avgBill * heatingRatio) };
}

// Top disparity counties for comparison bar chart
function getDisparityData() {
  return Object.entries(ENERGY_DATA)
    .sort((a, b) => b[1].burden - a[1].burden)
    .slice(0, 10)
    .map(([name, d]) => {
      const { electric, gas } = getElectricGas(name);
      return { county: name, burden: d.burden, electric, gas, total: d.avgBill };
    });
}

const BURDEN_COLORS = [
  "hsl(145, 50%, 40%)", // < 4%
  "hsl(80, 45%, 50%)",  // 4-5%
  "hsl(45, 80%, 55%)",  // 5-6%
  "hsl(27, 80%, 55%)",  // 6-8%
  "hsl(0, 70%, 50%)",   // > 8%
];

function getBurdenColor(burden: number): string {
  if (burden < 4) return BURDEN_COLORS[0];
  if (burden < 5) return BURDEN_COLORS[1];
  if (burden < 6) return BURDEN_COLORS[2];
  if (burden < 8) return BURDEN_COLORS[3];
  return BURDEN_COLORS[4];
}

function getOutageColor(risk: string): string {
  if (risk === "low") return BURDEN_COLORS[0];
  if (risk === "medium") return BURDEN_COLORS[2];
  return BURDEN_COLORS[4];
}

interface EnergyBurdenMapProps {
  compact?: boolean;
}

export default function EnergyBurdenMap({ compact = false }: EnergyBurdenMapProps) {
  const [metric, setMetric] = useState("burden");
  const [typeFilter, setTypeFilter] = useState("all");

  const entries = useMemo(() => {
    let data = Object.entries(ENERGY_DATA);
    if (typeFilter !== "all") data = data.filter(([, d]) => d.type === typeFilter);
    if (metric === "burden") data.sort((a, b) => b[1].burden - a[1].burden);
    else if (metric === "avgBill") data.sort((a, b) => b[1].avgBill - a[1].avgBill);
    else data.sort((a, b) => {
      const order = { high: 3, medium: 2, low: 1 };
      return (order[b[1].outageRisk as keyof typeof order] || 0) - (order[a[1].outageRisk as keyof typeof order] || 0);
    });
    return data;
  }, [metric, typeFilter]);

  const avgBurden = useMemo(() => {
    const vals = entries.map(([, d]) => d.burden);
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  }, [entries]);

  const highBurdenCount = useMemo(() => entries.filter(([, d]) => d.burden >= 6).length, [entries]);

  const getCellColor = (name: string) => {
    const d = ENERGY_DATA[name];
    if (!d) return "hsl(var(--muted))";
    if (metric === "burden") return getBurdenColor(d.burden);
    if (metric === "avgBill") return getBurdenColor(d.avgBill / 25);
    if (metric === "electricBill") return getBurdenColor(getElectricGas(name).electric / 15);
    if (metric === "gasBill") return getBurdenColor(getElectricGas(name).gas / 15);
    return getOutageColor(d.outageRisk);
  };

  const getCellValue = (name: string) => {
    const d = ENERGY_DATA[name];
    if (!d) return "";
    if (metric === "burden") return `${d.burden}%`;
    if (metric === "avgBill") return `$${d.avgBill}`;
    if (metric === "electricBill") return `$${getElectricGas(name).electric}`;
    if (metric === "gasBill") return `$${getElectricGas(name).gas}`;
    return d.outageRisk;
  };

  const downloadCSV = () => {
    const header = "County,Energy Burden (%),Avg Monthly Bill ($),Electric ($),Gas/Heating ($),Outage Risk,Median Income ($),Type\n";
    const rows = Object.entries(ENERGY_DATA)
      .map(([county, d]) => { const eg = getElectricGas(county); return `${county},${d.burden},${d.avgBill},${eg.electric},${eg.gas},${d.outageRisk},${d.medianIncome},${d.type}`; })
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "michigan-energy-burden-data.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Energy burden CSV downloaded");
  };

  const selectedMetric = METRICS.find(m => m.id === metric)!;

  const disparityData = useMemo(() => getDisparityData(), []);

  return (
    <Card>
      <CardHeader className={compact ? "pb-2" : ""}>
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="h-4 w-4 text-michigan-gold" />
          Energy Disparity Heatmaps
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          All 83 Michigan counties - Sources: ACEEE LEAD Tool, EIA SEDS, DTE Outage Center
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="choropleth">
          <TabsList className="w-full justify-start flex-wrap h-auto gap-1">
            <TabsTrigger value="choropleth" className="text-xs gap-1"><Zap className="h-3 w-3" />Burden Map</TabsTrigger>
            <TabsTrigger value="breakdown" className="text-xs gap-1"><Flame className="h-3 w-3" />Electric vs Gas</TabsTrigger>
            {!compact && <TabsTrigger value="trends" className="text-xs gap-1"><BarChart3 className="h-3 w-3" />EIA SEDS Trends</TabsTrigger>}
          </TabsList>

          {/* ── Tab 1: Choropleth Heatmap ── */}
          <TabsContent value="choropleth" className="space-y-4 mt-4">
            {/* KPI strip */}
            {!compact && (
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-michigan-gold/10 p-3 text-center">
                  <p className="text-lg font-bold text-foreground">{avgBurden}%</p>
                  <p className="text-[10px] text-muted-foreground">Avg Energy Burden</p>
                </div>
                <div className="rounded-lg bg-michigan-coral/10 p-3 text-center">
                  <p className="text-lg font-bold text-foreground">{highBurdenCount}</p>
                  <p className="text-[10px] text-muted-foreground">Counties &gt;6% Burden</p>
                </div>
                <div className="rounded-lg bg-primary/10 p-3 text-center">
                  <p className="text-lg font-bold text-foreground">$155</p>
                  <p className="text-[10px] text-muted-foreground">State Avg Monthly Bill</p>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <Select value={metric} onValueChange={setMetric}>
                <SelectTrigger className="w-44 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {METRICS.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <Filter className="mr-1 h-3 w-3" /><SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="urban">Urban</SelectItem>
                  <SelectItem value="suburban">Suburban</SelectItem>
                  <SelectItem value="rural">Rural</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 ml-auto" onClick={downloadCSV}>
                <Download className="h-3 w-3" /> CSV
              </Button>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span>Low</span>
              {BURDEN_COLORS.map((c, i) => (
                <div key={i} className="h-3 w-6 rounded-sm" style={{ background: c }} />
              ))}
              <span>High</span>
            </div>

            {/* Grid */}
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${compact ? "60px" : "72px"}, 1fr))` }}>
              {entries.map(([name]) => (
                <Tooltip key={name}>
                  <TooltipTrigger asChild>
                    <Link
                      to={`/${name.toLowerCase().replace(/[\s.]+/g, "-")}`}
                      className="rounded-md px-1.5 py-2 text-center text-white transition-transform hover:scale-105 hover:ring-2 hover:ring-primary/40 focus:outline-none focus:ring-2 focus:ring-primary"
                      style={{ background: getCellColor(name), fontSize: compact ? "8px" : "10px" }}
                    >
                      <span className="block truncate font-medium leading-tight">{name}</span>
                      <span className="block text-[9px] opacity-90">{getCellValue(name)}</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs max-w-[200px]">
                    <p className="font-semibold">{name} County</p>
                    <p>Energy Burden: {ENERGY_DATA[name].burden}% of income</p>
                    <p>Avg Bill: ${ENERGY_DATA[name].avgBill}/mo</p>
                    <p>Electric: ${getElectricGas(name).electric}/mo · Gas: ${getElectricGas(name).gas}/mo</p>
                    <p>Outage Risk: {ENERGY_DATA[name].outageRisk}</p>
                    <p>Median Income: ${ENERGY_DATA[name].medianIncome.toLocaleString()}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TabsContent>

          {/* ── Tab 2: Electric vs Gas Breakdown ── */}
          <TabsContent value="breakdown" className="space-y-4 mt-4">
            <p className="text-xs text-muted-foreground">
              Top 10 highest-burden counties - Stacked electric vs. gas/heating costs.
              UP counties spend up to 60% on heating due to propane dependence and older housing stock.
            </p>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={disparityData} layout="vertical" margin={{ left: 80, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis type="number" tick={{ fontSize: 10 }} label={{ value: "$/month", position: "insideBottom", offset: -5, fontSize: 10 }} />
                  <YAxis type="category" dataKey="county" tick={{ fontSize: 10 }} width={75} />
                  <RechartsTooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))" }}
                    formatter={(value: number, name: string) => [`$${value}`, name === "electric" ? "Electric" : "Gas/Heating"]}
                    labelFormatter={(label: string) => `${label} County`}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="electric" stackId="a" fill="hsl(45, 80%, 55%)" name="Electric" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="gas" stackId="a" fill="hsl(0, 70%, 50%)" name="Gas/Heating" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2">
              {disparityData.slice(0, 5).map(d => (
                <Badge key={d.county} variant="secondary" className="text-[10px]">
                  {d.county}: {d.burden}% burden
                </Badge>
              ))}
            </div>
          </TabsContent>

          {/* ── Tab 3: EIA SEDS Trends ── */}
          {!compact && (
            <TabsContent value="trends" className="space-y-6 mt-4">
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-michigan-coral" />
                  Residential Electricity Prices (¢/kWh)
                </h4>
                <p className="text-[10px] text-muted-foreground mb-2">Source: EIA State Energy Data System (SEDS), 2010–2023</p>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={EIA_SEDS_PRICE} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} domain={[10, 22]} unit="¢" />
                      <RechartsTooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: number) => [`${v}¢/kWh`]} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Line type="monotone" dataKey="michigan" stroke="hsl(0, 70%, 50%)" strokeWidth={2} name="Michigan" dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="national" stroke="hsl(145, 50%, 40%)" strokeWidth={2} name="National Avg" dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Michigan electricity prices are <strong>25% above national average</strong> - up 61% since 2010.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-1.5">
                  <TrendingDown className="h-3.5 w-3.5 text-michigan-teal" />
                  Per-Capita Energy Consumption (Million BTU)
                </h4>
                <p className="text-[10px] text-muted-foreground mb-2">Source: EIA SEDS, 2010–2023</p>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={EIA_SEDS_CONSUMPTION} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} domain={[200, 330]} />
                      <RechartsTooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: number) => [`${v} MBTU`]} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Line type="monotone" dataKey="michigan" stroke="hsl(209, 86%, 31%)" strokeWidth={2} name="Michigan" dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="national" stroke="hsl(145, 50%, 40%)" strokeWidth={2} name="National Avg" dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Michigan uses <strong>20% less energy per capita</strong> than the national average - declining steadily since 2010.
                </p>
              </div>
            </TabsContent>
          )}
        </Tabs>

        {/* Disparity callout */}
        {!compact && (
          <div className="rounded-lg border border-michigan-coral/20 bg-michigan-coral/5 p-4 space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-michigan-coral mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Energy Poverty Disparity</p>
                <p className="text-xs text-muted-foreground">
                  Low-income Michigan households spend up to 9.8% of income on energy - 3× the national affordable threshold of 3%.
                  Rural Upper Peninsula counties face the highest burden due to older housing stock, propane dependence, and limited weatherization access.
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">Source: ACEEE LEAD Tool, 2024 Power Struggle Report, EIA SEDS</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button asChild size="sm" variant="default" className="gap-1.5 text-xs">
                <Link to="/environment">
                  <Home className="h-3 w-3" /> Energy Programs & Rebates
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
                <Link to="/financial-help">
                  Financial Assistance
                </Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
