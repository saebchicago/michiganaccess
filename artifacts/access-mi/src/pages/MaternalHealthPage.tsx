import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Baby,
  Heart,
  AlertTriangle,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import Layout from "@/components/layout/Layout";
import DisparityBars from "@/components/equity/DisparityBars";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

// Verified data anchors. Each value is paired with a primary-source label
// and vintage rendered on the tile. Updated to the most recent MDHHS Vital
// Statistics release (Summary of 2024 Infant Death Statistics, Nov 2025).
const STATE_METRICS = {
  maternalMortality: 19.1, // per 100K, NCHS 2018-2023
  infantMortality: 6.3, // per 1K, MDHHS 2024 (Vital Records, Nov 2025 release)
  pretermBirth: 10.7, // %, 2024 March of Dimes
  severeMorbidity: 88.9, // per 10K delivery hospitalizations
};

// MDHHS 2024 Black:White infant mortality ratio. The source page is the
// Summary of 2024 Infant Death Statistics (https://www.mdch.state.mi.us/osr/InDxMain/Infsum05.asp):
// Black IMR 14.0/1K, White IMR 4.3/1K, ratio approximately 3.3:1.
// Used in the cross-page disparity copy so the same number appears
// everywhere on the platform.
const STATE_DISPARITY_RATIO = 3.3;

// County-level IMR from MDHHS (where published, NULL where suppressed)
const COUNTY_IMR = [
  { county: "Wayne", imr: 9.2, imrBlack: 14.1, imrWhite: 4.8 },
  { county: "Genesee", imr: 8.8, imrBlack: 13.5, imrWhite: 5.2 },
  { county: "Saginaw", imr: 8.1, imrBlack: 12.8, imrWhite: 4.6 },
  { county: "Muskegon", imr: 7.6, imrBlack: 11.4, imrWhite: 5.1 },
  { county: "Berrien", imr: 7.4, imrBlack: 12.2, imrWhite: 4.9 },
  { county: "Kalamazoo", imr: 6.8, imrBlack: 10.6, imrWhite: 4.2 },
  { county: "Ingham", imr: 6.5, imrBlack: 11.2, imrWhite: 3.8 },
  { county: "Kent", imr: 5.8, imrBlack: 9.4, imrWhite: 3.6 },
  { county: "Macomb", imr: 5.4, imrBlack: null, imrWhite: 5.1 },
  { county: "Oakland", imr: 5.1, imrBlack: 10.2, imrWhite: 3.2 },
  { county: "Washtenaw", imr: 4.6, imrBlack: 8.8, imrWhite: 2.8 },
  { county: "Ottawa", imr: 4.2, imrBlack: null, imrWhite: 3.8 },
];

const DISPARITY_DATA = COUNTY_IMR.filter(
  (d) => d.imrBlack !== null && d.imrWhite !== null,
).map((d) => ({
  county: d.county,
  Black: d.imrBlack!,
  White: d.imrWhite!,
  ratio: Math.round((d.imrBlack! / d.imrWhite!) * 10) / 10,
}));

export default function MaternalHealthPage() {
  usePageMeta({
    title: "Maternal & Infant Health - Access Michigan",
    description:
      "Michigan maternal mortality: 19.1/100K. Infant mortality: 6.3/1K (MDHHS 2024). County-level data with racial disparity breakdowns from MDHHS and March of Dimes.",
    path: "/maternal-health",
  });

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Maternal & Infant Health" }]} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-michigan-coral/10 via-michigan-coral/5 to-background py-14 md:py-18">
        <div className="container max-w-4xl text-center">
          <motion.div initial="hidden" animate="visible">
            <motion.div
              variants={fadeUp}
              custom={0}
              className="mb-4 inline-flex items-center gap-2 rounded-full bg-michigan-coral/10 px-4 py-1.5"
            >
              <Baby className="h-4 w-4 text-michigan-coral-deep" />
              <span className="text-sm font-medium text-michigan-coral-deep">
                Maternal & Infant Health
              </span>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="mb-3 text-3xl font-bold text-foreground md:text-4xl"
            >
              Care from prenatal to postpartum.
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-muted-foreground max-w-2xl mx-auto"
            >
              Maternal mortality: <strong>19.1</strong> per 100K live births.
              Infant mortality: <strong>{STATE_METRICS.infantMortality}</strong>{" "}
              per 1,000 (MDHHS 2024). Statewide, Black infants die at{" "}
              <strong>{STATE_DISPARITY_RATIO}×</strong> the rate of white
              infants (MDHHS 2024).
            </motion.p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-5xl py-10 space-y-10">
        {/* State metrics */}
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            {
              label: "Maternal Mortality",
              value: `${STATE_METRICS.maternalMortality}/100K`,
              source: "NCHS 2018-2023",
              warn: true,
            },
            {
              label: "Infant Mortality",
              value: `${STATE_METRICS.infantMortality}/1K`,
              source: "MDHHS 2024",
              warn: true,
            },
            {
              label: "Preterm Birth Rate",
              value: `${STATE_METRICS.pretermBirth}%`,
              source: "March of Dimes 2024",
              warn: false,
            },
            {
              label: "Severe Morbidity",
              value: `${STATE_METRICS.severeMorbidity}/10K`,
              source: "MHA 2023",
              warn: true,
            },
          ].map((m) => (
            <Card key={m.label}>
              <CardContent className="py-4 text-center">
                <p
                  className={`text-2xl font-bold ${m.warn ? "text-michigan-coral-deep" : "text-foreground"}`}
                >
                  {m.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
                <Badge variant="outline" className="text-[8px] mt-1">
                  {m.source}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Racial disparity chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5 text-michigan-coral-deep" />
              Infant Mortality: Racial Disparity by County
            </CardTitle>
            <CardDescription>
              Black infant mortality rate vs. white rate (per 1,000 live
              births). NULL where data is suppressed for small populations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={DISPARITY_DATA} margin={{ left: 5 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(214, 20%, 90%)"
                />
                <XAxis dataKey="county" tick={{ fontSize: 10 }} />
                <YAxis
                  tick={{ fontSize: 10 }}
                  label={{
                    value: "IMR per 1,000",
                    angle: -90,
                    position: "insideLeft",
                    offset: 10,
                    fontSize: 10,
                  }}
                />
                <Tooltip formatter={(v: number) => [`${v}/1,000`, ""]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  dataKey="Black"
                  fill="hsl(0, 80%, 55%)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="White"
                  fill="hsl(209, 86%, 60%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="rounded-lg border border-michigan-coral/20 bg-michigan-coral/5 p-3 mt-3">
              <p className="text-xs text-foreground">
                <strong>Statewide:</strong> Black infant mortality (14.0/1K) is{" "}
                <strong>{STATE_DISPARITY_RATIO}×</strong> the white rate
                (4.3/1K) in MDHHS 2024 data. The disparity is consistent across
                urban counties where racial breakdowns are published.
              </p>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Source: MDHHS Vital Records, 2019-2023 aggregated. Suppressed
              where &lt;20 events. Macomb and Ottawa Black IMR suppressed.
            </p>
          </CardContent>
        </Card>

        {/* Statewide Disparity Bars */}
        <Card>
          <CardContent className="p-6">
            <DisparityBars
              title="Michigan Infant Mortality by Race/Ethnicity"
              unit="/1K"
              groups={[
                { label: "Black", value: 14.1, color: "#DC2626" },
                { label: "Hispanic", value: 5.8, color: "#F59E0B" },
                { label: "White", value: 4.5, color: "#3B82F6" },
                { label: "Asian", value: 3.6, color: "#10B981" },
              ]}
              source="MDHHS Vital Records 2019-2023"
            />
          </CardContent>
        </Card>

        {/* County IMR ranking */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              County Infant Mortality Rate Ranking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={COUNTY_IMR}
                layout="vertical"
                margin={{ left: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(214, 20%, 90%)"
                />
                <XAxis type="number" tick={{ fontSize: 10 }} domain={[0, 10]} />
                <YAxis
                  dataKey="county"
                  type="category"
                  width={85}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip formatter={(v: number) => [`${v}/1,000`, "IMR"]} />
                <Bar dataKey="imr" radius={[0, 4, 4, 0]}>
                  {COUNTY_IMR.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        entry.imr > 7
                          ? "hsl(0, 80%, 55%)"
                          : entry.imr > 5.5
                            ? "hsl(27, 87%, 55%)"
                            : "hsl(145, 45%, 42%)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button variant="outline" asChild>
            <Link to="/find-care">
              Find OB/GYN Providers <ArrowRight className="ml-2 h-3 w-3" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/health-equity-atlas">
              View on Health Equity Atlas{" "}
              <ArrowRight className="ml-2 h-3 w-3" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <a
              href="https://www.marchofdimes.org/peristats/data?reg=99&top=11&lev=1&slev=4&obj=1"
              target="_blank"
              rel="noopener noreferrer"
            >
              March of Dimes PeriStats <ExternalLink className="ml-2 h-3 w-3" />
            </a>
          </Button>
        </div>

        <p className="text-center text-[10px] text-muted-foreground">
          Sources: NCHS (maternal mortality), MDHHS Vital Records (county IMR),
          March of Dimes PeriStats (preterm birth), MHA (severe morbidity). Data
          years: 2020-2024 aggregated except where noted. NULL = data suppressed
          for small populations.
        </p>
      </div>
    </Layout>
  );
}
