import { useState } from "react";
import { motion } from "framer-motion";
import { Leaf, Droplets, Wind, Recycle, Zap, Globe, Fish, AlertTriangle, TrendingUp, MapPin, ExternalLink, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import TransportationCallout from "@/components/shared/TransportationCallout";
import HealthSafetyCallout from "@/components/shared/HealthSafetyCallout";
import CivicDataCallout from "@/components/shared/CivicDataCallout";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

// --- Demo Data ---
const aqiData = [
  { city: "Detroit", aqi: 62, status: "Moderate", color: "hsl(27, 87%, 67%)" },
  { city: "Grand Rapids", aqi: 38, status: "Good", color: "hsl(145, 32%, 30%)" },
  { city: "Lansing", aqi: 42, status: "Good", color: "hsl(145, 32%, 30%)" },
  { city: "Flint", aqi: 55, status: "Moderate", color: "hsl(27, 87%, 67%)" },
  { city: "Ann Arbor", aqi: 35, status: "Good", color: "hsl(145, 32%, 30%)" },
  { city: "Traverse City", aqi: 22, status: "Good", color: "hsl(145, 32%, 30%)" },
  { city: "Kalamazoo", aqi: 44, status: "Good", color: "hsl(145, 32%, 30%)" },
  { city: "Saginaw", aqi: 58, status: "Moderate", color: "hsl(27, 87%, 67%)" },
];

const waterQualityTrend = [
  { year: "2019", violations: 142, resolved: 98 },
  { year: "2020", violations: 128, resolved: 110 },
  { year: "2021", violations: 115, resolved: 105 },
  { year: "2022", violations: 98, resolved: 92 },
  { year: "2023", violations: 82, resolved: 78 },
  { year: "2024", violations: 71, resolved: 69 },
];

const renewableGrowth = [
  { year: "2018", solar: 2.1, wind: 5.8, hydro: 1.9 },
  { year: "2019", solar: 3.2, wind: 6.4, hydro: 1.9 },
  { year: "2020", solar: 4.8, wind: 7.1, hydro: 2.0 },
  { year: "2021", solar: 6.5, wind: 8.3, hydro: 2.0 },
  { year: "2022", solar: 8.9, wind: 9.7, hydro: 2.1 },
  { year: "2023", solar: 12.1, wind: 11.2, hydro: 2.1 },
  { year: "2024", solar: 15.8, wind: 12.9, hydro: 2.2 },
];

const recyclingBreakdown = [
  { name: "Paper/Cardboard", value: 34, color: "hsl(27, 87%, 67%)" },
  { name: "Plastics", value: 18, color: "hsl(209, 86%, 31%)" },
  { name: "Glass", value: 12, color: "hsl(180, 100%, 32%)" },
  { name: "Metals", value: 15, color: "hsl(215, 19%, 35%)" },
  { name: "Organics", value: 14, color: "hsl(145, 32%, 30%)" },
  { name: "Other", value: 7, color: "hsl(0, 100%, 71%)" },
];

const greatLakesStats = [
  { lake: "Superior", waterTemp: "42°F", clarity: "Excellent", invasiveRisk: "Low" },
  { lake: "Michigan", waterTemp: "54°F", clarity: "Good", invasiveRisk: "Moderate" },
  { lake: "Huron", waterTemp: "51°F", clarity: "Good", invasiveRisk: "Moderate" },
  { lake: "Erie", waterTemp: "58°F", clarity: "Fair", invasiveRisk: "High" },
];

const envJusticeAreas = [
  { area: "Southwest Detroit", issue: "Industrial emissions, legacy contamination", pop: "65,000", priority: "Critical" },
  { area: "Flint", issue: "Water infrastructure, lead remediation", pop: "95,000", priority: "Critical" },
  { area: "Benton Harbor", issue: "Lead service lines, water quality", pop: "9,700", priority: "High" },
  { area: "Muskegon Heights", issue: "Brownfield sites, air quality", pop: "10,500", priority: "High" },
  { area: "Saginaw", issue: "Industrial legacy, flood vulnerability", pop: "44,000", priority: "Moderate" },
];

const quickStats = [
  { icon: Wind, label: "Air Quality Monitoring Stations", value: "94", color: "text-michigan-sky" },
  { icon: Droplets, label: "Public Water Systems Monitored", value: "1,400+", color: "text-michigan-teal" },
  { icon: Recycle, label: "State Recycling Rate", value: "19%", color: "text-michigan-forest" },
  { icon: Zap, label: "Renewable Energy Share", value: "13.2%", color: "text-michigan-gold" },
];

const EnvironmentPage = () => {
  const [activeTab, setActiveTab] = useState("air-water");

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Environment & Sustainability" }]} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-michigan-forest/10 via-michigan-teal/5 to-background py-16 md:py-20">
        <div className="container">
          <motion.div initial="hidden" animate="show" variants={stagger} className="mx-auto max-w-3xl text-center">
            <motion.div variants={fadeUp} className="mb-4 inline-flex items-center gap-2 rounded-full bg-michigan-forest/10 px-4 py-1.5">
              <Leaf className="h-4 w-4 text-michigan-forest" />
              <span className="text-sm font-medium text-michigan-forest">Environment & Sustainability</span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
              Michigan's Environmental Health
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground">
              Air quality, water safety, clean energy progress, recycling programs, and environmental justice — data-driven insights for Michigan's natural resources.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="border-b border-border bg-card py-6">
        <div className="container">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {quickStats.map((stat) => (
              <motion.div key={stat.label} variants={fadeUp} className="flex items-center gap-3 rounded-lg bg-background p-4">
                <stat.icon className={`h-8 w-8 ${stat.color} shrink-0`} />
                <div>
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main Tabbed Content */}
      <section className="py-12 md:py-16">
        <div className="container">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8 grid w-full grid-cols-2 md:grid-cols-5 gap-1">
              <TabsTrigger value="air-water" className="text-xs sm:text-sm">Air & Water</TabsTrigger>
              <TabsTrigger value="energy" className="text-xs sm:text-sm">Clean Energy</TabsTrigger>
              <TabsTrigger value="recycling" className="text-xs sm:text-sm">Recycling</TabsTrigger>
              <TabsTrigger value="great-lakes" className="text-xs sm:text-sm">Great Lakes</TabsTrigger>
              <TabsTrigger value="justice" className="text-xs sm:text-sm">Env. Justice</TabsTrigger>
            </TabsList>

            {/* Air & Water Quality */}
            <TabsContent value="air-water">
              <motion.div initial="hidden" animate="show" variants={stagger} className="grid gap-8 lg:grid-cols-2">
                {/* AQI Chart */}
                <motion.div variants={fadeUp}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Wind className="h-5 w-5 text-michigan-sky" />
                        Current Air Quality Index by City
                      </CardTitle>
                      <CardDescription>Real-time AQI readings from EPA monitoring stations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={aqiData} layout="vertical" margin={{ left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                          <XAxis type="number" domain={[0, 100]} />
                          <YAxis dataKey="city" type="category" width={100} tick={{ fontSize: 12 }} />
                          <Tooltip formatter={(value: number) => [`AQI: ${value}`, "Air Quality Index"]} />
                          <Bar dataKey="aqi" radius={[0, 4, 4, 0]}>
                            {aqiData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="mt-4 flex flex-wrap gap-3 text-xs">
                        <Badge variant="outline" className="border-michigan-forest/30 text-michigan-forest">0-50: Good</Badge>
                        <Badge variant="outline" className="border-michigan-gold/30 text-michigan-gold">51-100: Moderate</Badge>
                        <Badge variant="outline" className="border-michigan-coral/30 text-michigan-coral">101+: Unhealthy</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Water Quality Trend */}
                <motion.div variants={fadeUp}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Droplets className="h-5 w-5 text-michigan-teal" />
                        Water Quality Violations Trend
                      </CardTitle>
                      <CardDescription>Public water system violations across Michigan (2019–2024)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={waterQualityTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                          <XAxis dataKey="year" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="violations" stroke="hsl(0, 100%, 71%)" strokeWidth={2} name="Violations" dot={{ r: 4 }} />
                          <Line type="monotone" dataKey="resolved" stroke="hsl(145, 32%, 30%)" strokeWidth={2} name="Resolved" dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                      <p className="mt-4 text-sm text-muted-foreground">
                        <strong>Improving trend:</strong> Violations decreased 50% since 2019 with ongoing Flint, Benton Harbor, and statewide infrastructure investments.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>

              {/* Water Safety Advisories */}
              <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mt-8">
                <Card className="border-michigan-gold/30 bg-michigan-gold/5">
                  <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center">
                    <AlertTriangle className="h-10 w-10 shrink-0 text-michigan-gold" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">Active Water Advisories</h3>
                      <p className="text-sm text-muted-foreground">3 active boil-water advisories and 1 do-not-drink advisory currently in effect across Michigan communities. Check your local utility for the latest updates.</p>
                    </div>
                    <Button variant="outline" className="shrink-0" asChild>
                      <a href="https://www.michigan.gov/egle/about/organization/drinking-water-and-environmental-health" target="_blank" rel="noopener">
                        Check Advisories <ExternalLink className="ml-2 h-3 w-3" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Clean Energy */}
            <TabsContent value="energy">
              <motion.div initial="hidden" animate="show" variants={stagger}>
                <motion.div variants={fadeUp}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-michigan-gold" />
                        Renewable Energy Growth in Michigan
                      </CardTitle>
                      <CardDescription>Percentage of total energy generation from renewable sources (2018–2024)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={renewableGrowth}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                          <XAxis dataKey="year" />
                          <YAxis unit="%" />
                          <Tooltip formatter={(v: number) => `${v}%`} />
                          <Area type="monotone" dataKey="solar" stackId="1" stroke="hsl(27, 87%, 67%)" fill="hsl(27, 87%, 67%)" fillOpacity={0.6} name="Solar" />
                          <Area type="monotone" dataKey="wind" stackId="1" stroke="hsl(209, 86%, 31%)" fill="hsl(209, 86%, 31%)" fillOpacity={0.6} name="Wind" />
                          <Area type="monotone" dataKey="hydro" stackId="1" stroke="hsl(180, 100%, 32%)" fill="hsl(180, 100%, 32%)" fillOpacity={0.6} name="Hydroelectric" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={fadeUp} className="mt-8 grid gap-6 md:grid-cols-3">
                  {[
                    { title: "MI Healthy Climate Plan", desc: "Governor's plan to achieve economy-wide carbon neutrality by 2050 through clean energy, EVs, and building efficiency.", link: "https://www.michigan.gov/egle/about/organization/climate-and-energy/mi-healthy-climate-plan" },
                    { title: "Clean Energy Incentives", desc: "Federal IRA tax credits, state rebates for solar panels, heat pumps, and EV chargers available to Michigan residents.", link: "https://www.michigan.gov/egle" },
                    { title: "Community Solar Programs", desc: "Subscribe to shared solar farms without installing panels on your roof. Multiple programs available across Michigan utilities.", link: "https://www.michigan.gov/mpsc" },
                  ].map((item) => (
                    <Card key={item.title} className="group hover:border-michigan-gold/30 transition-colors">
                      <CardContent className="p-6">
                        <Zap className="mb-3 h-8 w-8 text-michigan-gold" />
                        <h3 className="mb-2 font-semibold text-foreground">{item.title}</h3>
                        <p className="mb-4 text-sm text-muted-foreground">{item.desc}</p>
                        <a href={item.link} target="_blank" rel="noopener" className="text-sm font-medium text-primary hover:underline">
                          Learn more <ExternalLink className="ml-1 inline h-3 w-3" />
                        </a>
                      </CardContent>
                    </Card>
                  ))}
                </motion.div>
              </motion.div>
            </TabsContent>

            {/* Recycling */}
            <TabsContent value="recycling">
              <motion.div initial="hidden" animate="show" variants={stagger} className="grid gap-8 lg:grid-cols-2">
                <motion.div variants={fadeUp}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Recycle className="h-5 w-5 text-michigan-forest" />
                        Michigan Recycling Composition
                      </CardTitle>
                      <CardDescription>Breakdown of materials recovered through curbside and drop-off programs</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie data={recyclingBreakdown} cx="50%" cy="50%" outerRadius={110} innerRadius={60} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                            {recyclingBreakdown.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={fadeUp}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Michigan's 10¢ Bottle Deposit</CardTitle>
                      <CardDescription>The nation's most successful deposit-return program</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="rounded-lg bg-michigan-forest/10 p-4">
                          <p className="text-3xl font-bold text-michigan-forest">89%</p>
                          <p className="text-sm text-muted-foreground">Container return rate — highest in the nation</p>
                        </div>
                        <div className="rounded-lg bg-michigan-teal/10 p-4">
                          <p className="text-3xl font-bold text-michigan-teal">$1.2B+</p>
                          <p className="text-sm text-muted-foreground">In deposits returned to Michigan consumers since inception</p>
                        </div>
                      </div>
                      <Accordion type="single" collapsible className="mt-6">
                        <AccordionItem value="how">
                          <AccordionTrigger className="text-sm">How does the deposit program work?</AccordionTrigger>
                          <AccordionContent className="text-sm text-muted-foreground">
                            Michigan's Bottle Deposit Law requires a 10-cent deposit on carbonated beverage containers. When you return containers to a retailer or reverse vending machine, you receive your 10¢ back per container. Unclaimed deposits fund environmental programs.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="where">
                          <AccordionTrigger className="text-sm">Where can I recycle beyond bottles?</AccordionTrigger>
                          <AccordionContent className="text-sm text-muted-foreground">
                            Michigan has 600+ drop-off recycling sites and growing curbside programs. Visit <a href="https://www.recyclemichiganresources.com/" target="_blank" rel="noopener" className="text-primary underline">RecycleMichiganResources.com</a> for locations and accepted materials near you.
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>

            {/* Great Lakes */}
            <TabsContent value="great-lakes">
              <motion.div initial="hidden" animate="show" variants={stagger}>
                <motion.div variants={fadeUp} className="mb-8 rounded-xl border border-michigan-teal/20 bg-gradient-to-br from-michigan-teal/5 to-michigan-sky/5 p-8">
                  <div className="flex items-start gap-4">
                    <Fish className="h-10 w-10 shrink-0 text-michigan-teal" />
                    <div>
                      <h2 className="mb-2 text-2xl font-bold text-foreground">Great Lakes Conservation</h2>
                      <p className="text-muted-foreground">Michigan borders four of the five Great Lakes, containing 20% of the world's surface freshwater. Protecting these ecosystems is critical to our economy, health, and quality of life.</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {greatLakesStats.map((lake) => (
                    <Card key={lake.lake} className="group hover:border-michigan-teal/30 transition-colors">
                      <CardContent className="p-6">
                        <h3 className="mb-3 text-lg font-bold text-foreground">Lake {lake.lake}</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-muted-foreground">Water Temp</span><span className="font-medium">{lake.waterTemp}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Clarity</span><span className="font-medium">{lake.clarity}</span></div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Invasive Risk</span>
                            <Badge variant={lake.invasiveRisk === "Low" ? "outline" : lake.invasiveRisk === "Moderate" ? "secondary" : "destructive"} className="text-xs">
                              {lake.invasiveRisk}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </motion.div>

                <motion.div variants={fadeUp} className="mt-8">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="invasive">
                      <AccordionTrigger>Invasive Species Threats</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        Zebra and quagga mussels, sea lamprey, and Asian carp remain the top invasive threats. Michigan invests $20M+ annually in prevention barriers, monitoring, and rapid-response programs. Report sightings at Michigan DNR's <a href="https://www.michigan.gov/invasives" target="_blank" rel="noopener" className="text-primary underline">invasive species portal</a>.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="algal">
                      <AccordionTrigger>Harmful Algal Blooms (HABs)</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        Nutrient runoff from agriculture and stormwater fuels harmful algal blooms, particularly in Lake Erie and inland lakes. These blooms produce toxins dangerous to humans and pets. Michigan tracks active blooms and issues public health advisories through EGLE.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="pfas">
                      <AccordionTrigger>PFAS Contamination</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        Michigan has identified 200+ PFAS contamination sites — more than any other state. "Forever chemicals" from firefighting foam and industrial waste have contaminated groundwater and surface water. The state has adopted some of the nation's strictest PFAS standards at 8 parts per trillion for drinking water.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </motion.div>
              </motion.div>
            </TabsContent>

            {/* Environmental Justice */}
            <TabsContent value="justice">
              <motion.div initial="hidden" animate="show" variants={stagger}>
                <motion.div variants={fadeUp} className="mb-8 rounded-xl border border-michigan-coral/20 bg-michigan-coral/5 p-6">
                  <div className="flex items-start gap-4">
                    <Shield className="h-8 w-8 shrink-0 text-michigan-coral" />
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Environmental Justice in Michigan</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Low-income communities and communities of color disproportionately bear environmental burdens — from air pollution to contaminated water. Michigan's Office of the Environmental Justice Public Advocate works to address these disparities.
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={fadeUp}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Priority Environmental Justice Communities</CardTitle>
                      <CardDescription>Areas identified for enhanced monitoring, remediation, and investment</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border text-left">
                              <th className="pb-3 font-medium text-muted-foreground">Community</th>
                              <th className="pb-3 font-medium text-muted-foreground">Key Issue</th>
                              <th className="pb-3 font-medium text-muted-foreground">Population</th>
                              <th className="pb-3 font-medium text-muted-foreground">Priority</th>
                            </tr>
                          </thead>
                          <tbody>
                            {envJusticeAreas.map((area) => (
                              <tr key={area.area} className="border-b border-border/50">
                                <td className="py-3 font-medium text-foreground">{area.area}</td>
                                <td className="py-3 text-muted-foreground">{area.issue}</td>
                                <td className="py-3 text-muted-foreground">{area.pop}</td>
                                <td className="py-3">
                                  <Badge variant={area.priority === "Critical" ? "destructive" : area.priority === "High" ? "secondary" : "outline"}>
                                    {area.priority}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={fadeUp} className="mt-8 grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardContent className="p-6">
                      <Globe className="mb-3 h-8 w-8 text-michigan-teal" />
                      <h3 className="mb-2 font-semibold">Michigan EJ Screen Tool</h3>
                      <p className="mb-4 text-sm text-muted-foreground">Use the EPA's EJScreen tool to explore environmental justice indicators for any Michigan community — pollution burden, health vulnerabilities, and demographic factors.</p>
                      <Button variant="outline" asChild>
                        <a href="https://ejscreen.epa.gov/mapper/" target="_blank" rel="noopener">
                          Open EJScreen <ExternalLink className="ml-2 h-3 w-3" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <MapPin className="mb-3 h-8 w-8 text-michigan-forest" />
                      <h3 className="mb-2 font-semibold">Report an Environmental Concern</h3>
                      <p className="mb-4 text-sm text-muted-foreground">Witnessed illegal dumping, unusual odors, or water discoloration? Report concerns to Michigan EGLE's 24-hour Pollution Emergency Alerting System (PEAS).</p>
                      <Button variant="outline" asChild>
                        <a href="https://www.michigan.gov/egle/about/contact/pollution-emergency-alerting-system" target="_blank" rel="noopener">
                          Report Concern <ExternalLink className="ml-2 h-3 w-3" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Cross-references */}
      <section className="py-8">
        <div className="container space-y-4">
          <HealthSafetyCallout />
          <CivicDataCallout />
          <TransportationCallout />
        </div>
      </section>

      {/* Data Sources */}
      <section className="border-t border-border bg-muted/30 py-8">
        <div className="container text-center">
          <p className="text-xs text-muted-foreground">
            Data Sources:{" "}
            <a href="https://www.epa.gov/outdoor-air-quality-data" target="_blank" rel="noopener" className="underline hover:text-primary">EPA AirNow</a>,{" "}
            <a href="https://www.michigan.gov/egle" target="_blank" rel="noopener" className="underline hover:text-primary">Michigan EGLE</a>,{" "}
            <a href="https://www.eia.gov/state/?sid=MI" target="_blank" rel="noopener" className="underline hover:text-primary">U.S. EIA</a>,{" "}
            <a href="https://www.glerl.noaa.gov/" target="_blank" rel="noopener" className="underline hover:text-primary">NOAA GLERL</a>,{" "}
            <a href="https://ejscreen.epa.gov/" target="_blank" rel="noopener" className="underline hover:text-primary">EPA EJScreen</a>
          </p>
          <p className="mt-2 text-xs font-semibold text-michigan-gold">⚠ Some values are demo data for prototype purposes</p>
        </div>
      </section>
    </Layout>
  );
};

export default EnvironmentPage;
