import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  DollarSign, TrendingDown, Search, Building2, MapPin, Info,
  Calculator, Pill, Shield, ArrowRight, ExternalLink, BarChart3
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { Link } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

const CHART_COLORS = [
  "hsl(209, 86%, 31%)", "hsl(180, 100%, 32%)", "hsl(145, 32%, 30%)",
  "hsl(27, 87%, 67%)", "hsl(0, 100%, 71%)", "hsl(214, 74%, 59%)",
];

interface Procedure {
  name: string;
  category: string;
  avgCost: number;
  lowCost: number;
  highCost: number;
  insuredAvg: number;
  nationalAvg: number;
  facilities: { name: string; city: string; cost: number; quality: number }[];
}

const procedures: Procedure[] = [
  {
    name: "MRI (Brain, without contrast)", category: "Imaging",
    avgCost: 1850, lowCost: 450, highCost: 3200, insuredAvg: 380, nationalAvg: 2100,
    facilities: [
      { name: "Beaumont Royal Oak", city: "Royal Oak", cost: 1650, quality: 88 },
      { name: "Michigan Medicine", city: "Ann Arbor", cost: 2100, quality: 95 },
      { name: "Spectrum Health", city: "Grand Rapids", cost: 1420, quality: 85 },
      { name: "Ascension St. John", city: "Detroit", cost: 1900, quality: 78 },
      { name: "McLaren Flint", city: "Flint", cost: 1280, quality: 72 },
    ],
  },
  {
    name: "Colonoscopy (Diagnostic)", category: "Procedure",
    avgCost: 3200, lowCost: 1500, highCost: 5800, insuredAvg: 850, nationalAvg: 3500,
    facilities: [
      { name: "Henry Ford Hospital", city: "Detroit", cost: 3100, quality: 90 },
      { name: "Spectrum Health", city: "Grand Rapids", cost: 2800, quality: 85 },
      { name: "Michigan Medicine", city: "Ann Arbor", cost: 3600, quality: 95 },
      { name: "Munson Medical Center", city: "Traverse City", cost: 2650, quality: 80 },
    ],
  },
  {
    name: "Knee Replacement (Total)", category: "Surgery",
    avgCost: 38000, lowCost: 22000, highCost: 58000, insuredAvg: 6500, nationalAvg: 42000,
    facilities: [
      { name: "Michigan Medicine", city: "Ann Arbor", cost: 42000, quality: 95 },
      { name: "Beaumont Royal Oak", city: "Royal Oak", cost: 36000, quality: 88 },
      { name: "Spectrum Health", city: "Grand Rapids", cost: 33000, quality: 85 },
      { name: "Bronson Methodist", city: "Kalamazoo", cost: 30000, quality: 82 },
    ],
  },
  {
    name: "Childbirth (Vaginal, Uncomplicated)", category: "Maternity",
    avgCost: 12500, lowCost: 6000, highCost: 18000, insuredAvg: 2200, nationalAvg: 14800,
    facilities: [
      { name: "Sparrow Hospital", city: "Lansing", cost: 11000, quality: 80 },
      { name: "Beaumont Royal Oak", city: "Royal Oak", cost: 13500, quality: 88 },
      { name: "Michigan Medicine", city: "Ann Arbor", cost: 14200, quality: 95 },
      { name: "Henry Ford Hospital", city: "Detroit", cost: 12800, quality: 90 },
    ],
  },
  {
    name: "CT Scan (Chest)", category: "Imaging",
    avgCost: 1200, lowCost: 300, highCost: 2500, insuredAvg: 250, nationalAvg: 1400,
    facilities: [
      { name: "McLaren Flint", city: "Flint", cost: 850, quality: 72 },
      { name: "Spectrum Health", city: "Grand Rapids", cost: 1100, quality: 85 },
      { name: "Beaumont Royal Oak", city: "Royal Oak", cost: 1350, quality: 88 },
      { name: "Michigan Medicine", city: "Ann Arbor", cost: 1500, quality: 95 },
    ],
  },
  {
    name: "Emergency Room Visit (Moderate)", category: "Emergency",
    avgCost: 2800, lowCost: 800, highCost: 5500, insuredAvg: 500, nationalAvg: 3100,
    facilities: [
      { name: "Henry Ford Hospital", city: "Detroit", cost: 2600, quality: 90 },
      { name: "Spectrum Health", city: "Grand Rapids", cost: 2400, quality: 85 },
      { name: "Michigan Medicine", city: "Ann Arbor", cost: 3200, quality: 95 },
      { name: "Munson Medical Center", city: "Traverse City", cost: 2100, quality: 80 },
    ],
  },
];

const prescriptions = [
  { name: "Metformin 500mg (30-day)", brand: "Generic", retailPrice: 28, goodRxPrice: 4, costcoPrice: 6, markCuban: 3.50 },
  { name: "Lisinopril 10mg (30-day)", brand: "Generic", retailPrice: 32, goodRxPrice: 4, costcoPrice: 5, markCuban: 3.00 },
  { name: "Atorvastatin 20mg (30-day)", brand: "Generic (Lipitor)", retailPrice: 45, goodRxPrice: 6, costcoPrice: 8, markCuban: 4.80 },
  { name: "Albuterol Inhaler", brand: "ProAir/Ventolin", retailPrice: 85, goodRxPrice: 22, costcoPrice: 35, markCuban: 18.00 },
  { name: "Amoxicillin 500mg (20-day)", brand: "Generic", retailPrice: 22, goodRxPrice: 4, costcoPrice: 6, markCuban: 3.90 },
  { name: "Omeprazole 20mg (30-day)", brand: "Generic (Prilosec)", retailPrice: 35, goodRxPrice: 5, costcoPrice: 8, markCuban: 4.20 },
];

export default function CostTransparencyPage() {
  const [selectedProcedure, setSelectedProcedure] = useState<string>(procedures[0].name);
  const [insuranceType, setInsuranceType] = useState<string>("uninsured");

  usePageMeta({
    title: "Cost Transparency",
    description: "Compare healthcare costs across Michigan facilities. Know before you go — the same procedure can cost 3-5x more depending on where you go.",
    path: "/costs",
    jsonLd: {
      "@type": "WebPage",
      name: "Healthcare Cost Transparency — Michigan Access",
      description: "Compare procedure costs and prescription prices across Michigan healthcare facilities.",
    },
  });

  const procedure = procedures.find(p => p.name === selectedProcedure) || procedures[0];

  const chartData = useMemo(() =>
    procedure.facilities.map(f => ({
      name: f.name.split(" ").slice(0, 2).join(" "),
      cost: insuranceType === "insured" ? Math.round(f.cost * 0.25) : f.cost,
      quality: f.quality,
    })).sort((a, b) => a.cost - b.cost),
    [procedure, insuranceType]
  );

  const savingsFromLowest = procedure.highCost - procedure.lowCost;

  return (
    <Layout>
      <section className="bg-gradient-to-b from-michigan-gold/5 to-background py-12 lg:py-20">
        <div className="container max-w-4xl text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="mb-4 inline-block rounded-full bg-michigan-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-michigan-gold">
              Cost Transparency
            </span>
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} initial="hidden" animate="visible" className="mb-3 text-3xl font-bold text-foreground lg:text-5xl">
            Know Before You Go
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} initial="hidden" animate="visible" className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Compare healthcare costs across Michigan facilities. Prices vary dramatically — the same procedure can cost 3-5x more depending on where you go.
          </motion.p>
        </div>
      </section>

      <div className="container max-w-6xl py-10 space-y-10">
        {/* Key stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Avg Potential Savings", value: `$${savingsFromLowest.toLocaleString()}`, desc: "On selected procedure", icon: TrendingDown, color: "text-michigan-forest" },
            { label: "Procedures Compared", value: procedures.length.toString(), desc: "Common procedures", icon: BarChart3, color: "text-primary" },
            { label: "Rx Savings Available", value: "Up to 85%", desc: "With discount programs", icon: Pill, color: "text-michigan-teal" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <Card>
                <CardContent className="flex items-center gap-3 py-4">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="procedures">
          <TabsList>
            <TabsTrigger value="procedures">Procedure Costs</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescription Savings</TabsTrigger>
            <TabsTrigger value="tips">Billing Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="procedures" className="mt-6 space-y-6">
            {/* Procedure selector */}
            <Card>
              <CardContent className="py-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Select Procedure</label>
                    <Select value={selectedProcedure} onValueChange={setSelectedProcedure}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {procedures.map(p => (
                          <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-48">
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Insurance Status</label>
                    <Select value={insuranceType} onValueChange={setInsuranceType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="uninsured">Uninsured / Cash Pay</SelectItem>
                        <SelectItem value="insured">With Insurance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price range summary */}
            <div className="grid gap-4 sm:grid-cols-4">
              <Card className="border-michigan-forest/20">
                <CardContent className="py-3 text-center">
                  <p className="text-xs text-muted-foreground">Lowest in Michigan</p>
                  <p className="text-2xl font-bold text-michigan-forest">${(insuranceType === "insured" ? procedure.insuredAvg * 0.6 : procedure.lowCost).toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-3 text-center">
                  <p className="text-xs text-muted-foreground">Michigan Average</p>
                  <p className="text-2xl font-bold text-foreground">${(insuranceType === "insured" ? procedure.insuredAvg : procedure.avgCost).toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="border-michigan-coral/20">
                <CardContent className="py-3 text-center">
                  <p className="text-xs text-muted-foreground">Highest in Michigan</p>
                  <p className="text-2xl font-bold text-michigan-coral">${(insuranceType === "insured" ? procedure.insuredAvg * 1.8 : procedure.highCost).toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-muted/30">
                <CardContent className="py-3 text-center">
                  <p className="text-xs text-muted-foreground">National Average</p>
                  <p className="text-2xl font-bold text-muted-foreground">${(insuranceType === "insured" ? Math.round(procedure.nationalAvg * 0.25) : procedure.nationalAvg).toLocaleString()}</p>
                </CardContent>
              </Card>
            </div>

            {/* Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Facility Price Comparison — {procedure.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tickFormatter={v => `$${v.toLocaleString()}`} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Cost"]} />
                    <Bar dataKey="cost" name="Cost" radius={[0, 6, 6, 0]}>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Facility table */}
            <Card>
              <CardContent className="py-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left text-xs text-muted-foreground">Facility</th>
                      <th className="py-2 text-left text-xs text-muted-foreground">City</th>
                      <th className="py-2 text-right text-xs text-muted-foreground">Est. Cost</th>
                      <th className="py-2 text-right text-xs text-muted-foreground">Quality Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {procedure.facilities.sort((a, b) => a.cost - b.cost).map((f, i) => (
                      <tr key={f.name} className="border-b border-border/50">
                        <td className="py-2 text-sm font-medium text-foreground">{f.name}</td>
                        <td className="py-2 text-sm text-muted-foreground"><MapPin className="inline h-3 w-3 mr-1" />{f.city}</td>
                        <td className="py-2 text-right text-sm font-semibold">
                          <span className={i === 0 ? "text-michigan-forest" : "text-foreground"}>
                            ${(insuranceType === "insured" ? Math.round(f.cost * 0.25) : f.cost).toLocaleString()}
                          </span>
                        </td>
                        <td className="py-2 text-right">
                          <Badge variant="secondary" className="text-[10px]">{f.quality}/100</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prescriptions" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-michigan-teal" />
                  Prescription Drug Price Comparison
                </CardTitle>
                <p className="text-sm text-muted-foreground">Compare prices across discount programs for common medications</p>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left text-xs text-muted-foreground">Medication</th>
                      <th className="py-2 text-right text-xs text-muted-foreground">Retail Price</th>
                      <th className="py-2 text-right text-xs text-muted-foreground">GoodRx</th>
                      <th className="py-2 text-right text-xs text-muted-foreground">Costco</th>
                      <th className="py-2 text-right text-xs text-muted-foreground">Cost Plus Drugs</th>
                      <th className="py-2 text-right text-xs text-muted-foreground">Savings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.map(rx => {
                      const lowest = Math.min(rx.goodRxPrice, rx.costcoPrice, rx.markCuban);
                      const savings = Math.round(((rx.retailPrice - lowest) / rx.retailPrice) * 100);
                      return (
                        <tr key={rx.name} className="border-b border-border/50">
                          <td className="py-2">
                            <p className="font-medium text-foreground text-sm">{rx.name}</p>
                            <p className="text-[11px] text-muted-foreground">{rx.brand}</p>
                          </td>
                          <td className="py-2 text-right text-sm text-muted-foreground line-through">${rx.retailPrice.toFixed(2)}</td>
                          <td className="py-2 text-right text-sm text-foreground">${rx.goodRxPrice.toFixed(2)}</td>
                          <td className="py-2 text-right text-sm text-foreground">${rx.costcoPrice.toFixed(2)}</td>
                          <td className="py-2 text-right text-sm font-semibold text-michigan-forest">${rx.markCuban.toFixed(2)}</td>
                          <td className="py-2 text-right">
                            <Badge className="bg-michigan-forest/10 text-michigan-forest border-michigan-forest/20 text-[10px]">
                              Save {savings}%
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tips" className="mt-6 space-y-4">
            {[
              { title: "Always Ask for an Itemized Bill", desc: "Hospitals are required to provide itemized bills. Review every charge — billing errors occur in up to 80% of medical bills. Dispute charges you don't recognize.", icon: Calculator },
              { title: "Request Cash-Pay / Self-Pay Discounts", desc: "Most hospitals offer 20-60% discounts for uninsured patients who pay upfront. Ask the billing department before your procedure.", icon: DollarSign },
              { title: "Apply for Charity Care Before Collections", desc: "Michigan hospitals with charity care programs must inform patients. Apply within 240 days of your first bill. Many programs cover patients up to 400% FPL.", icon: Shield },
              { title: "Use the No Surprises Act", desc: "Federal law protects you from surprise out-of-network bills for emergency services and certain non-emergency services at in-network facilities.", icon: Shield },
              { title: "Negotiate Payment Plans", desc: "Hospitals must offer interest-free payment plans. You can negotiate monthly amounts based on ability to pay — don't accept the first offer.", icon: TrendingDown },
            ].map((tip, i) => (
              <motion.div key={tip.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Card className="hover-lift">
                  <CardContent className="py-4 flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-michigan-gold/10 flex-shrink-0">
                      <tip.icon className="h-5 w-5 text-michigan-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{tip.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{tip.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            <Card className="border-primary/20">
              <CardContent className="py-4">
                <p className="text-sm text-foreground font-medium mb-2">Need help with a medical bill?</p>
                <div className="flex gap-2 flex-wrap">
                  <Link to="/financial-help"><Button size="sm" variant="outline" className="text-xs">Financial Assistance Programs</Button></Link>
                  <a href="tel:211"><Button size="sm" variant="outline" className="text-xs">Call 2-1-1</Button></a>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Source note */}
        <Card className="border-border/50 bg-muted/30">
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <Info className="inline h-3.5 w-3.5 mr-1 text-primary" />
              <strong>Data Sources:</strong> Procedure costs based on CMS Hospital Price Transparency data, Healthcare Bluebook fair price estimates, and facility-reported chargemaster data. Prescription prices from GoodRx, Costco Pharmacy, and Mark Cuban Cost Plus Drugs. Prices are estimates and may vary based on individual circumstances, complexity, and insurance plan.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
