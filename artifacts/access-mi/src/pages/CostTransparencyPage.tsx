import DataProvenance from "@/components/shared/DataProvenance";
import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  DollarSign,
  TrendingDown,
  Info,
  Calculator,
  Pill,
  Shield,
  ExternalLink,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import Breadcrumbs from "@/components/layout/Breadcrumbs";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

// Per-procedure / per-facility cost and quality numbers previously rendered
// here were hand-typed without an upstream primary source - both the cost
// values and the quality scores. They are removed rather than re-labeled, in
// keeping with the platform's no-fabricated-values rule. Real Michigan
// procedure pricing data lives in the CMS Hospital Price Transparency
// machine-readable files each hospital is required to publish; the page now
// directs visitors to the official CMS search instead.

const prescriptions = [
  {
    name: "Metformin 500mg (30-day)",
    brand: "Generic",
    retailPrice: 28,
    goodRxPrice: 4,
    costcoPrice: 6,
    markCuban: 3.5,
  },
  {
    name: "Lisinopril 10mg (30-day)",
    brand: "Generic",
    retailPrice: 32,
    goodRxPrice: 4,
    costcoPrice: 5,
    markCuban: 3.0,
  },
  {
    name: "Atorvastatin 20mg (30-day)",
    brand: "Generic (Lipitor)",
    retailPrice: 45,
    goodRxPrice: 6,
    costcoPrice: 8,
    markCuban: 4.8,
  },
  {
    name: "Albuterol Inhaler",
    brand: "ProAir/Ventolin",
    retailPrice: 85,
    goodRxPrice: 22,
    costcoPrice: 35,
    markCuban: 18.0,
  },
  {
    name: "Amoxicillin 500mg (20-day)",
    brand: "Generic",
    retailPrice: 22,
    goodRxPrice: 4,
    costcoPrice: 6,
    markCuban: 3.9,
  },
  {
    name: "Omeprazole 20mg (30-day)",
    brand: "Generic (Prilosec)",
    retailPrice: 35,
    goodRxPrice: 5,
    costcoPrice: 8,
    markCuban: 4.2,
  },
];

export default function CostTransparencyPage() {
  usePageMeta({
    title: "Cost Transparency",
    description:
      "Prescription savings programs, billing tips, and pointers to the official CMS Hospital Price Transparency search.",
    path: "/costs",
    jsonLd: {
      "@type": "WebPage",
      name: "Healthcare Cost Transparency - Access Michigan",
      description:
        "Prescription savings programs and pointers to official hospital price transparency data.",
    },
  });

  return (
    <Layout>
      <div className="container pt-6">
        <Breadcrumbs
          items={[
            { label: "Services", href: "/find-care" },
            { label: "Cost Transparency" },
          ]}
        />
      </div>
      <section className="bg-gradient-to-b from-michigan-gold/5 to-background py-12 lg:py-20">
        <div className="container max-w-4xl text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
          >
            <span className="mb-4 inline-block rounded-full bg-michigan-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-michigan-gold-deep">
              Cost Transparency
            </span>
          </motion.div>
          <motion.h1
            variants={fadeUp}
            custom={1}
            initial="hidden"
            animate="visible"
            className="mb-3 text-3xl font-bold text-foreground lg:text-5xl"
          >
            Know Before You Go
          </motion.h1>
          <motion.p
            variants={fadeUp}
            custom={2}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-2xl text-lg text-muted-foreground"
          >
            Prescription savings programs, billing tips, and pointers to the
            official federal price-transparency search.
          </motion.p>
        </div>
      </section>

      <div className="container max-w-6xl py-10 space-y-10">
        <Tabs defaultValue="procedures">
          <TabsList>
            <TabsTrigger value="procedures">Procedure Costs</TabsTrigger>
            <TabsTrigger value="prescriptions">
              Prescription Savings
            </TabsTrigger>
            <TabsTrigger value="tips">Billing Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="procedures" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Info className="h-4 w-4 text-primary" />
                  Procedure pricing - data pending
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  AccessMI no longer renders facility-by-facility procedure
                  prices on this page. The previous values were hand-typed
                  without an upstream primary source, which conflicts with the
                  platform's no-fabricated-values rule. Restoring this view
                  requires wiring it to the CMS Hospital Price Transparency
                  machine-readable files each Michigan hospital is required to
                  publish.
                </p>
                <p>
                  In the meantime, the official federal price-transparency
                  search returns hospital-published rates for procedures and
                  shoppable services:
                </p>
                <p>
                  <a
                    href="https://data.cms.gov/provider-data/topics/hospitals/hospital-price-transparency"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                  >
                    CMS Hospital Price Transparency
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                </p>
                <p>
                  For the methodology that defines how AccessMI labels and
                  sources every figure, see{" "}
                  <Link
                    to="/methodology"
                    className="font-medium text-primary hover:underline"
                  >
                    /methodology
                  </Link>
                  .
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prescriptions" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-michigan-teal-deep" />
                  Prescription Drug Price Comparison
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Indicative prices across publicly listed discount programs for
                  common medications. Actual prices vary by pharmacy and region;
                  confirm at point of purchase.
                </p>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm min-w-[500px]">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left text-xs text-muted-foreground">
                        Medication
                      </th>
                      <th className="py-2 text-right text-xs text-muted-foreground">
                        Retail Price
                      </th>
                      <th className="py-2 text-right text-xs text-muted-foreground">
                        GoodRx
                      </th>
                      <th className="py-2 text-right text-xs text-muted-foreground">
                        Costco
                      </th>
                      <th className="py-2 text-right text-xs text-muted-foreground">
                        Cost Plus Drugs
                      </th>
                      <th className="py-2 text-right text-xs text-muted-foreground">
                        Savings
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.map((rx) => {
                      const lowest = Math.min(
                        rx.goodRxPrice,
                        rx.costcoPrice,
                        rx.markCuban,
                      );
                      const savings = Math.round(
                        ((rx.retailPrice - lowest) / rx.retailPrice) * 100,
                      );
                      return (
                        <tr key={rx.name} className="border-b border-border/50">
                          <td className="py-2">
                            <p className="font-medium text-foreground text-sm">
                              {rx.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {rx.brand}
                            </p>
                          </td>
                          <td className="py-2 text-right text-sm text-muted-foreground line-through">
                            ${rx.retailPrice.toFixed(2)}
                          </td>
                          <td className="py-2 text-right text-sm text-foreground">
                            ${rx.goodRxPrice.toFixed(2)}
                          </td>
                          <td className="py-2 text-right text-sm text-foreground">
                            ${rx.costcoPrice.toFixed(2)}
                          </td>
                          <td className="py-2 text-right text-sm font-semibold text-michigan-forest-deep">
                            ${rx.markCuban.toFixed(2)}
                          </td>
                          <td className="py-2 text-right">
                            <Badge className="bg-michigan-forest/10 text-michigan-forest-deep border-michigan-forest/20 text-[10px]">
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
              {
                title: "Always Ask for an Itemized Bill",
                desc: "Hospitals are required to provide itemized bills. Review every charge - billing errors occur frequently. Dispute charges you don't recognize.",
                icon: Calculator,
              },
              {
                title: "Request Cash-Pay / Self-Pay Discounts",
                desc: "Most hospitals offer discounts for uninsured patients who pay upfront. Ask the billing department before your procedure.",
                icon: DollarSign,
              },
              {
                title: "Apply for Charity Care Before Collections",
                desc: "Michigan hospitals with charity care programs must inform patients. Apply within 240 days of your first bill. Many programs cover patients up to 400% FPL.",
                icon: Shield,
              },
              {
                title: "Use the No Surprises Act",
                desc: "Federal law protects you from surprise out-of-network bills for emergency services and certain non-emergency services at in-network facilities.",
                icon: Shield,
              },
              {
                title: "Negotiate Payment Plans",
                desc: "Hospitals must offer interest-free payment plans. You can negotiate monthly amounts based on ability to pay - don't accept the first offer.",
                icon: TrendingDown,
              },
            ].map((tip, i) => (
              <motion.div
                key={tip.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <Card className="hover-lift">
                  <CardContent className="py-4 flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-michigan-gold/10 flex-shrink-0">
                      <tip.icon className="h-5 w-5 text-michigan-gold-deep" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">
                        {tip.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {tip.desc}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            <Card className="border-primary/20">
              <CardContent className="py-4">
                <p className="text-sm text-foreground font-medium mb-2">
                  Need help with a medical bill?
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Link to="/financial-help">
                    <Button size="sm" variant="outline" className="text-xs">
                      Financial Assistance Programs
                    </Button>
                  </Link>
                  <a href="tel:211">
                    <Button size="sm" variant="outline" className="text-xs">
                      Call 2-1-1
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DataProvenance
          source="CMS Hospital Price Transparency, GoodRx, Cost Plus Drugs"
          updated="Prescription comparisons are publicly listed discount-program prices, indicative only."
        />
      </div>
    </Layout>
  );
}
