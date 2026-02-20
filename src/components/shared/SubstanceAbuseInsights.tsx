import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Phone, ExternalLink, Share2, AlertTriangle, TrendingDown,
  Download, BarChart3, Activity, Shield, MapPin, Pill
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell
} from "recharts";
import { toast } from "sonner";

/* ── Modeled overdose trend data (Michigan MODA / CDC WONDER) ── */
const OVERDOSE_TRENDS = [
  { year: "2017", total: 2729, opioid: 2033, stimulant: 384, alcohol: 312 },
  { year: "2018", total: 2599, opioid: 1941, stimulant: 423, alcohol: 235 },
  { year: "2019", total: 2753, opioid: 2016, stimulant: 512, alcohol: 225 },
  { year: "2020", total: 3097, opioid: 2280, stimulant: 673, alcohol: 144 },
  { year: "2021", total: 3340, opioid: 2524, stimulant: 839, alcohol: 0 },
  { year: "2022", total: 3204, opioid: 2410, stimulant: 912, alcohol: 0 },
  { year: "2023", total: 3040, opioid: 2215, stimulant: 870, alcohol: 0 },
];

const COUNTY_OVERDOSE = [
  { county: "Wayne", deaths: 842, rate: 48.3 },
  { county: "Oakland", deaths: 298, rate: 23.7 },
  { county: "Macomb", deaths: 274, rate: 31.2 },
  { county: "Kent", deaths: 156, rate: 23.8 },
  { county: "Genesee", deaths: 148, rate: 36.5 },
  { county: "Washtenaw", deaths: 82, rate: 22.1 },
  { county: "Saginaw", deaths: 68, rate: 35.8 },
  { county: "Kalamazoo", deaths: 65, rate: 24.6 },
  { county: "Ingham", deaths: 58, rate: 19.8 },
  { county: "Muskegon", deaths: 52, rate: 29.9 },
];

const YOUTH_USE = [
  { substance: "Alcohol", grade8: 15.2, grade10: 29.1, grade12: 46.4 },
  { substance: "Marijuana", grade8: 6.6, grade10: 17.3, grade12: 29.0 },
  { substance: "Vaping (nicotine)", grade8: 10.1, grade10: 18.5, grade12: 23.2 },
  { substance: "Rx Misuse", grade8: 2.1, grade10: 3.8, grade12: 4.4 },
];

const TREATMENT_PIE = [
  { name: "Opioids", value: 38, color: "hsl(var(--michigan-coral))" },
  { name: "Alcohol", value: 28, color: "hsl(var(--primary))" },
  { name: "Stimulants", value: 14, color: "hsl(var(--michigan-gold))" },
  { name: "Cannabis", value: 12, color: "hsl(var(--michigan-forest))" },
  { name: "Other", value: 8, color: "hsl(var(--muted-foreground))" },
];

const SUD_PROGRAMS = [
  {
    title: "SAMHSA National Helpline",
    description: "Free 24/7 treatment referral service for substance use and mental health. Confidential, multilingual.",
    tags: ["24/7", "free", "crisis"],
    url: "https://www.samhsa.gov/find-help/national-helpline",
    phone: "1-800-662-4357",
  },
  {
    title: "MDHHS Get Help Now",
    description: "Michigan's official directory connecting residents to local SUD treatment by county.",
    tags: ["statewide", "free", "directory"],
    url: "https://www.michigan.gov/mdhhs/get-help-now",
    phone: "844-799-9876",
  },
  {
    title: "Henry Ford Maplegrove Center",
    description: "Comprehensive addiction treatment: inpatient detox, residential, IOP, and adolescent programs.",
    tags: ["detox", "residential", "adolescent"],
    url: "https://www.henryford.com/locations/maplegrove",
    phone: "248-661-6100",
  },
  {
    title: "Harbor Hall Recovery",
    description: "Drug & alcohol recovery: residential treatment, outpatient counseling, sober living in Northern MI.",
    tags: ["residential", "sober living", "recovery"],
    url: "https://www.harborhall.com",
    phone: "231-347-4593",
  },
  {
    title: "Oakland CHN – SUD Services",
    description: "Assessment, treatment coordination, and recovery support for Oakland County residents.",
    tags: ["free", "assessment", "county"],
    url: "https://www.oaklandchn.org/substance-use-disorder-services",
    phone: "248-464-6363",
  },
  {
    title: "Ingham County Overdose Prevention",
    description: "Naloxone distribution, overdose prevention, and harm reduction services.",
    tags: ["naloxone", "harm reduction", "free"],
    url: "https://hd.ingham.org/DepartmentalDirectory/CommunityHealth/SubstanceUse.aspx",
    phone: "517-887-4311",
  },
];

const CHART_COLORS = ["#E85D4A", "#003B5C", "#D4A843", "#2D5F3F", "#00A3A1"];

function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const meta = [`# Source: Michigan MODA, CDC WONDER, Monitoring the Future`, `# Generated: ${new Date().toLocaleDateString()}`];
  const csv = [...meta, headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
  toast.success(`${filename} downloaded`);
}

const handleShare = async (title: string, url: string) => {
  if (navigator.share) {
    await navigator.share({ title, url });
  } else {
    await navigator.clipboard.writeText(url);
    toast.success("Link copied");
  }
};

export default function SubstanceAbuseInsights() {
  const [countyFilter, setCountyFilter] = useState("All");

  const filteredCounty = useMemo(() => {
    if (countyFilter === "All") return COUNTY_OVERDOSE;
    return COUNTY_OVERDOSE.filter(c => c.county === countyFilter);
  }, [countyFilter]);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-michigan-coral/10">
          <AlertTriangle className="h-5 w-5 text-michigan-coral" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Substance Abuse Support Hub</h2>
          <p className="text-xs text-muted-foreground">Helplines, treatment centers, data insights & recovery resources</p>
        </div>
      </div>

      {/* Crisis strip */}
      <div className="rounded-lg border border-michigan-coral/20 bg-michigan-coral/5 p-3 flex flex-wrap items-center gap-3 text-sm">
        <Phone className="h-4 w-4 text-michigan-coral" />
        <span className="font-semibold">Need help now?</span>
        <a href="tel:988" className="font-bold text-michigan-coral hover:underline">988 Lifeline</a>
        <span className="text-muted-foreground">·</span>
        <a href="tel:18006624357" className="font-bold text-michigan-coral hover:underline">SAMHSA: 1-800-662-4357</a>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">Text HOME to <strong>741741</strong></span>
      </div>

      {/* Program spotlight carousel */}
      <Carousel opts={{ align: "start" }} className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {SUD_PROGRAMS.map((p) => (
            <CarouselItem key={p.title} className="pl-2 md:pl-4 basis-[85%] sm:basis-1/2 lg:basis-1/3">
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex flex-col gap-3 h-full">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0">
                      <Pill className="h-5 w-5 text-michigan-coral" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-foreground leading-tight">{p.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{p.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {p.tags.map((t) => <Badge key={t} variant="outline" className="text-[10px] capitalize">{t}</Badge>)}
                  </div>
                  <div className="mt-auto flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1" asChild>
                      <a href={p.url} target="_blank" rel="noopener"><ExternalLink className="h-3 w-3" />Visit</a>
                    </Button>
                    {p.phone && (
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" asChild>
                        <a href={`tel:${p.phone}`}><Phone className="h-3 w-3" />{p.phone}</a>
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 ml-auto" onClick={() => handleShare(p.title, p.url)}>
                      <Share2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      {/* Data Insights Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="trends" className="text-xs gap-1"><TrendingDown className="h-3.5 w-3.5" />Overdose Trends</TabsTrigger>
          <TabsTrigger value="county" className="text-xs gap-1"><MapPin className="h-3.5 w-3.5" />By County</TabsTrigger>
          <TabsTrigger value="youth" className="text-xs gap-1"><Activity className="h-3.5 w-3.5" />Youth Use</TabsTrigger>
          <TabsTrigger value="treatment" className="text-xs gap-1"><BarChart3 className="h-3.5 w-3.5" />Treatment</TabsTrigger>
        </TabsList>

        {/* Overdose Trends */}
        <TabsContent value="trends" className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-sm">Michigan Drug Overdose Deaths (2017–2023)</CardTitle>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() =>
                  downloadCSV("mi-overdose-trends.csv", ["Year","Total","Opioid","Stimulant","Alcohol"], OVERDOSE_TRENDS.map(r => [r.year, r.total, r.opioid, r.stimulant, r.alcohol]))
                }><Download className="h-3 w-3" />CSV</Button>
              </div>
              <p className="text-xs text-muted-foreground">Michigan opioid deaths decreased ~5% in 2023 — the first sustained decline since 2018.</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={OVERDOSE_TRENDS}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="opioid" stackId="1" fill="#E85D4A" fillOpacity={0.6} stroke="#E85D4A" name="Opioid" />
                  <Area type="monotone" dataKey="stimulant" stackId="1" fill="#D4A843" fillOpacity={0.6} stroke="#D4A843" name="Stimulant" />
                  <Area type="monotone" dataKey="alcohol" stackId="1" fill="#003B5C" fillOpacity={0.6} stroke="#003B5C" name="Alcohol-related" />
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">
                Sources: <a href="https://michigan.gov/opioids/category-data" target="_blank" rel="noopener" className="text-primary hover:underline">MI MODA Dashboard</a> · <a href="https://mi-suddr.com/resources-2" target="_blank" rel="noopener" className="text-primary hover:underline">MI-SUDDR</a> · CDC WONDER
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* County breakdown */}
        <TabsContent value="county" className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-sm">Overdose Deaths by County (Top 10, 2023)</CardTitle>
                <div className="flex gap-2">
                  <Select value={countyFilter} onValueChange={setCountyFilter}>
                    <SelectTrigger className="h-7 w-36 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Counties</SelectItem>
                      {COUNTY_OVERDOSE.map(c => <SelectItem key={c.county} value={c.county}>{c.county}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() =>
                    downloadCSV("mi-county-overdose.csv", ["County","Deaths","Rate_per_100k"], COUNTY_OVERDOSE.map(r => [r.county, r.deaths, r.rate]))
                  }><Download className="h-3 w-3" />CSV</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={filteredCounty} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="county" tick={{ fontSize: 11 }} width={85} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="deaths" fill="#E85D4A" radius={[0, 4, 4, 0]} name="Deaths" />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-3">
                <strong>Wayne County</strong> accounts for ~28% of Michigan overdose deaths. The <a href="https://michigan.gov/opioids/category-data" target="_blank" rel="noopener" className="text-primary hover:underline">MODA Vulnerability Index</a> highlights zip codes with the highest need.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Youth substance use */}
        <TabsContent value="youth" className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-sm">Adolescent Substance Use (Monitoring the Future, 2024)</CardTitle>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() =>
                  downloadCSV("mi-youth-substance-use.csv", ["Substance","8th_Grade_%","10th_Grade_%","12th_Grade_%"], YOUTH_USE.map(r => [r.substance, r.grade8, r.grade10, r.grade12]))
                }><Download className="h-3 w-3" />CSV</Button>
              </div>
              <p className="text-xs text-muted-foreground">Past-year use prevalence among U.S. students — a key indicator for Michigan prevention programs.</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={YOUTH_USE}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="substance" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="grade8" fill="#00A3A1" name="8th Grade" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="grade10" fill="#003B5C" name="10th Grade" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="grade12" fill="#E85D4A" name="12th Grade" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">
                Source: <a href="https://monitoringthefuture.org" target="_blank" rel="noopener" className="text-primary hover:underline">Monitoring the Future 2024</a>
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Treatment admissions */}
        <TabsContent value="treatment" className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Michigan SUD Treatment Admissions by Substance (2023)</CardTitle>
              <p className="text-xs text-muted-foreground">Distribution of treatment admissions by primary substance.</p>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center gap-6">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie data={TREATMENT_PIE} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name} ${value}%`}>
                    {TREATMENT_PIE.map((entry, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2 text-sm text-muted-foreground">
                <p><strong className="text-foreground">38%</strong> of treatment admissions are opioid-related, reflecting Michigan's ongoing opioid crisis.</p>
                <p><strong className="text-foreground">Naloxone access</strong> expanded in 2023 with standing orders in all 83 counties.</p>
                <p className="text-xs">Data: <a href="https://mi-suddr.com/resources-2" target="_blank" rel="noopener" className="text-primary hover:underline">MI-SUDDR</a> · <a href="https://injurycenter.umich.edu/opioid-surveillance" target="_blank" rel="noopener" className="text-primary hover:underline">U-M Opioid Surveillance</a></p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* External dashboard links */}
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { title: "MODA Dashboard", desc: "Interactive overdose heatmaps by county/ZIP with vulnerability index.", url: "https://michigan.gov/opioids/category-data", source: "michigan.gov" },
          { title: "MI-SUDDR Resources", desc: "Drug trends, treatment data, harm reduction dashboards, and reports.", url: "https://mi-suddr.com/resources-2", source: "mi-suddr.com" },
          { title: "Monitoring the Future", desc: "National adolescent substance use survey — charts and annual reports.", url: "https://monitoringthefuture.org", source: "monitoringthefuture.org" },
          { title: "U-M Opioid Surveillance", desc: "Michigan opioid data, injury center analytics, and SOS county summaries.", url: "https://injurycenter.umich.edu/opioid-surveillance", source: "umich.edu" },
        ].map(d => (
          <Card key={d.title} className="hover:shadow-md transition-shadow">
            <CardContent className="py-4">
              <h3 className="font-semibold text-sm text-foreground">{d.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{d.desc}</p>
              <a href={d.url} target="_blank" rel="noopener" className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                <ExternalLink className="h-3 w-3" />{d.source}
              </a>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50 bg-muted/30">
        <CardContent className="py-3">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <Shield className="inline h-3.5 w-3.5 mr-1 text-primary" />
            <strong>Sources:</strong> Michigan MODA Dashboard, MI-SUDDR, CDC WONDER, Monitoring the Future 2024, U-M Injury Prevention Center. <strong>All data shown is modeled or estimated from published reports and may differ from final official figures.</strong> Visualizations are for informational and advocacy support, not individualized risk prediction. For crisis help, call <strong>988</strong> or <strong>1-800-662-4357</strong> (SAMHSA).
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
