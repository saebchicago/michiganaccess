import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Building2, TreePine, Factory, Home, Landmark, Waves, ExternalLink, FileText, GraduationCap, Users, ChevronRight } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

/* ── Static Data ── */

interface ZoningPortal {
  name: string;
  type: "city" | "county";
  url: string;
  mapUrl?: string;
}

const ZONING_PORTALS: ZoningPortal[] = [
  { name: "Detroit", type: "city", url: "https://detroitmi.gov/departments/planning-development-department", mapUrl: "https://detroit.maps.arcgis.com" },
  { name: "Ann Arbor", type: "city", url: "https://www.a2gov.org/departments/planning/Pages/ZoningMap.aspx" },
  { name: "Grand Rapids", type: "city", url: "https://www.grandrapidsmi.gov/Government/Departments/Planning-Department" },
  { name: "Lansing", type: "city", url: "https://www.lansingmi.gov/624/Planning-and-Development" },
  { name: "Flint", type: "city", url: "https://www.cityofflint.com/planning-development" },
  { name: "Warren", type: "city", url: "https://www.cityofwarren.org/departments/planning" },
  { name: "Sterling Heights", type: "city", url: "https://www.sterling-heights.net/332/Planning-Zoning" },
  { name: "Troy", type: "city", url: "https://www.troymi.gov/government/departments/community_development" },
  { name: "Pontiac", type: "city", url: "https://www.pontiac.mi.us" },
  { name: "Kalamazoo", type: "city", url: "https://www.kalamazoocity.org/government/planning" },
  { name: "Oakland County", type: "county", url: "https://www.oakgov.com/planning" },
  { name: "Macomb County", type: "county", url: "https://www.macombgov.org/planning" },
  { name: "Wayne County", type: "county", url: "https://www.waynecounty.com/government/planningenvironment" },
  { name: "Kent County", type: "county", url: "https://www.accesskent.com/PlanningAndZoning" },
  { name: "Washtenaw County", type: "county", url: "https://www.washtenaw.org/planning" },
];

const ZONING_CATEGORIES = [
  { code: "R-1", title: "Single Family Residential", icon: Home, description: "Allows one home per lot. Typical setbacks 25ft front, 6ft sides. No apartments or businesses." },
  { code: "R-2 / R-3", title: "Low-Moderate Density Residential", icon: Home, description: "Allows duplexes or small apartment buildings. May permit accessory dwelling units (ADUs)." },
  { code: "C-1 / B-1", title: "Neighborhood Commercial", icon: Building2, description: "Small retail, restaurants, offices along corridors. Usually limited hours and signage." },
  { code: "C-2 / B-2", title: "General Commercial", icon: Building2, description: "Larger retail, auto services, strip malls. More intensive uses than neighborhood commercial." },
  { code: "M-1", title: "Light Industrial", icon: Factory, description: "Light manufacturing, warehouses, flex space. Usually buffered from residential areas." },
  { code: "AG", title: "Agricultural", icon: TreePine, description: "Farming, large lot single-family, rural uses. Minimum lot sizes typically 10+ acres." },
  { code: "PUD", title: "Planned Unit Development", icon: Landmark, description: "Custom mixed-use project with negotiated standards. Requires special approval from planning commission." },
  { code: "FP / FLD", title: "Floodplain Overlay", icon: Waves, description: "FEMA flood zone - special insurance and building requirements. Development restrictions apply." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

/* ── Component ── */

export default function ZoningPage() {
  usePageMeta({
    title: "Zoning & Land Use",
    description: "Michigan zoning information, land use regulations, flood zones, property lookups, and planning resources for all 83 counties.",
    path: "/zoning",
  });

  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    if (query.trim()) setSearched(true);
  };

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero */}
        <section className="bg-gradient-to-br from-michigan-blue/10 via-background to-forest-green/5 py-16 md:py-24">
          <div className="container max-w-4xl text-center space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <Badge variant="secondary" className="mb-4">Community Resource</Badge>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold text-foreground"
            >
              Michigan Zoning & Land Use Resource Center
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
            >
              Understand property regulations, zoning districts, flood zones, and land use rules
              across Michigan's municipalities and counties.
            </motion.p>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mt-8"
            >
              <Input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSearched(false); }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Enter address, city, or ZIP code…"
                className="flex-1"
                aria-label="Search zoning by address, city, or ZIP"
              />
              <Button onClick={handleSearch} className="bg-gradient-michigan hover:opacity-90 gap-2">
                <Search className="h-4 w-4" />
                Look Up My Area
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Search Result */}
        {searched && query.trim() && (
          <section className="container max-w-4xl -mt-6 mb-8">
            <Card className="border-michigan-blue/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-michigan-blue" />
                  Results for "{query}"
                </CardTitle>
                <CardDescription>
                  Zoning is administered at the local level in Michigan. Contact your municipality's planning department for official determinations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  To find the exact zoning for your property, visit your local municipality's zoning portal below
                  or contact your county's planning department.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://mcgi.state.mi.us/myneighborhood" target="_blank" rel="noopener noreferrer">
                      MI Neighborhood Lookup <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://www.michigan.gov/lara/bureau-list/bcc/local" target="_blank" rel="noopener noreferrer">
                      Find My Municipality <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Zoning Portals */}
        <section className="container max-w-6xl py-12">
          <h2 className="text-2xl font-bold text-foreground mb-2">Zoning Portals by Municipality</h2>
          <p className="text-muted-foreground mb-8">Direct links to official planning and zoning resources across Michigan.</p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ZONING_PORTALS.map((portal, i) => (
              <motion.div key={portal.name} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">{portal.name}</h3>
                      <Badge variant="outline" className="text-[10px]">{portal.type === "city" ? "City" : "County"}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={portal.url} target="_blank" rel="noopener noreferrer" className="gap-1">
                          Planning Portal <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                      {portal.mapUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={portal.mapUrl} target="_blank" rel="noopener noreferrer" className="gap-1">
                            Zoning Map <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Zoning Basics */}
        <section className="bg-muted/30 py-12">
          <div className="container max-w-4xl">
            <h2 className="text-2xl font-bold text-foreground mb-2">Understanding Zoning Categories</h2>
            <p className="text-muted-foreground mb-8">
              Common Michigan zoning districts explained in plain language. Actual codes vary by municipality.
            </p>
            <Accordion type="multiple" className="space-y-2">
              {ZONING_CATEGORIES.map((cat) => (
                <AccordionItem key={cat.code} value={cat.code} className="bg-card rounded-xl border px-4">
                  <AccordionTrigger className="hover:no-underline gap-3">
                    <div className="flex items-center gap-3 text-left">
                      <cat.icon className="h-5 w-5 text-michigan-blue shrink-0" />
                      <div>
                        <span className="font-semibold text-foreground">{cat.code}</span>
                        <span className="text-muted-foreground ml-2">- {cat.title}</span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pl-8">
                    {cat.description}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* FEMA & Environmental */}
        <section className="container max-w-6xl py-12">
          <h2 className="text-2xl font-bold text-foreground mb-8">Environmental & Flood Zone Resources</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "FEMA Flood Map Service", description: "Official FEMA flood zone maps for insurance and building requirements.", url: "https://msc.fema.gov", icon: Waves },
              { title: "Michigan EGLE Floodplain Mapping", description: "State of Michigan floodplain data and environmental permits.", url: "https://www.michigan.gov/egle/about/organization/water-resources/floodplain-management", icon: Waves },
              { title: "Michigan DNR", description: "Natural resources, wetlands, and environmental conservation data.", url: "https://www.michigan.gov/dnr", icon: TreePine },
            ].map((item, i) => (
              <motion.div key={item.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <item.icon className="h-5 w-5 text-forest-green" />
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <Button variant="outline" size="sm" asChild>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="gap-1">
                        Visit <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Property & Demographics */}
        <section className="bg-muted/30 py-12">
          <div className="container max-w-6xl">
            <h2 className="text-2xl font-bold text-foreground mb-8">Property, Schools & Demographics</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Property Tax & Parcel Lookup", description: "Search property records and tax assessments through county GIS portals.", url: "https://bsaonline.com", icon: FileText },
                { title: "School District Finder", description: "Look up school district boundaries via the Michigan Department of Education.", url: "https://www.michigan.gov/mde/services/school-performance-reports/school-district-map", icon: GraduationCap },
                { title: "Census & Demographics", description: "Population data, housing stats, and community profiles from the U.S. Census Bureau.", url: "https://data.census.gov", icon: Users },
              ].map((item, i) => (
                <motion.div key={item.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <item.icon className="h-5 w-5 text-michigan-blue" />
                        <h3 className="font-semibold text-foreground">{item.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      <Button variant="outline" size="sm" asChild>
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="gap-1">
                          Visit <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="container max-w-4xl py-8">
          <p className="text-xs text-muted-foreground text-center">
            Zoning information is administered at the local level in Michigan. This page provides links to official resources but does not constitute legal or zoning advice.
            Always contact your local planning department for official zoning determinations. Links are provided as a public service and may change without notice.
          </p>
        </section>
      </div>
    </Layout>
  );
}
