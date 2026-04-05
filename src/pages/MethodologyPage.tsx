import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { usePageMeta } from "@/hooks/usePageMeta";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Database, Shield, Users, Accessibility, Languages, Globe, Eye,
  ArrowRight, BarChart3, Heart, CheckCircle2, Info, Layers,
  Monitor, Phone, Printer, FileText, Scale
} from "lucide-react";
import { DataClassification, DataClassificationLegend } from "@/components/shared/DataClassification";
import DataFreshnessDashboard from "@/components/shared/DataFreshnessDashboard";

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const flowSteps = [
  {
    icon: Database,
    titleKey: "publicDataSources",
    color: "bg-primary/10 text-primary",
    items: [
      "Federal: CMS, CDC PLACES, HRSA, Census, DOE, USGS, AirNow, BTS (GATIS)",
      "State: MI DHHS, MPSC, EGLE, Budget Office",
      "Local: Counties, transit authorities, MI 211",
    ],
  },
  {
    icon: Shield,
    titleKey: "qualityAssurance",
    color: "bg-michigan-forest/10 text-michigan-forest",
    items: [
      "Automated validation checks",
      "Cross-source verification",
      "Freshness indicators on every metric",
    ],
  },
  {
    icon: Users,
    titleKey: "userCentered",
    color: "bg-michigan-teal/10 text-michigan-teal",
    items: [
      "Plain language (8th-grade level)",
      "Mobile-first responsive design",
      "WCAG 2.1 AA accessibility",
      "Persistent crisis resources",
    ],
  },
  {
    icon: Heart,
    titleKey: "communityOutcomes",
    color: "bg-michigan-coral/10 text-michigan-coral",
    items: [
      "Reduced barriers to care",
      "Informed civic participation",
      "Better resource allocation from public data",
    ],
  },
];

const equityPrinciples = [
  {
    icon: Accessibility,
    title: "Universal Design From Lived Experience",
    desc: "Every feature tested through personas representing uninsured individuals, limited English proficiency, cognitive disabilities, low digital literacy, and rural isolation.",
    example: "Safety-net clinics surfaced first in search results, not buried beneath others.",
  },
  {
    icon: Scale,
    title: "Dignity in Information Architecture",
    desc: 'No shaming language. Financial assistance presented as a normal pathway, not an exception.',
    example: '"Sliding scale based on income" — not "free care" or "charity care."',
  },
  {
    icon: Eye,
    title: "Progressive Disclosure for Cognitive Accessibility",
    desc: "Complex data starts simple; users choose depth. No information overload.",
    example: 'Hospital quality shows "95/100" upfront; click expands to 15 detailed metrics.',
  },
  {
    icon: Layers,
    title: "Multi-Modal Access",
    desc: "Visual (maps, charts), textual (summaries), actionable (phone numbers, directions).",
    example: "Download options for screen readers, print-optimized resource pages.",
  },
];

const scoringWeights = [
  { label: "Geographic Access", pct: 40, color: "bg-primary", desc: "Drive time from user location (not straight-line distance)" },
  { label: "Clinical Quality", pct: 30, color: "bg-michigan-forest", desc: "CMS scores + Leapfrog grades + specialty accreditations" },
  { label: "Service Comprehensiveness", pct: 15, color: "bg-michigan-teal", desc: "Integrated services (behavioral health, social work, telehealth)" },
  { label: "Digital Accessibility", pct: 15, color: "bg-michigan-sky", desc: "Online scheduling, language services, patient portals" },
];

export default function MethodologyPage() {
  const { t } = useTranslation();
  usePageMeta({ title: t("methodologyPage.badge"), description: t("methodologyPage.subtitle"), path: "/methodology" });
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 lg:py-24">
        <div className="container max-w-4xl text-center">
          <Breadcrumbs items={[{ label: t("methodologyPage.badge") }]} />
          <motion.span initial="hidden" animate="visible" variants={fade} custom={0} className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            {t("methodologyPage.badge")}
          </motion.span>
          <motion.h1 variants={fade} custom={1} initial="hidden" animate="visible" className="mb-4 text-3xl font-bold text-foreground lg:text-5xl">
            {t("methodologyPage.title")}
          </motion.h1>
          <motion.p variants={fade} custom={2} initial="hidden" animate="visible" className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {t("methodologyPage.subtitle")}
          </motion.p>
        </div>
      </section>

      <div className="container max-w-5xl py-12 space-y-16">
        {/* Data Integration Framework */}
        <section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}>
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{t("methodologyPage.frameworkTitle")}</h2>
                <p className="text-sm text-muted-foreground">{t("methodologyPage.frameworkSubtitle")}</p>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-4">
            {flowSteps.map((step, i) => (
              <motion.div key={step.titleKey} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i} className="relative">
                <Card className="h-full hover-lift">
                  <CardContent className="pt-6">
                    <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${step.color.split(" ")[0]}`}>
                      <step.icon className={`h-5 w-5 ${step.color.split(" ")[1]}`} />
                    </div>
                    <h3 className="mb-2 text-sm font-bold text-foreground">{t(`methodologyPage.${step.titleKey}`)}</h3>
                    <ul className="space-y-1">
                      {step.items.map((item) => (
                        <li key={item} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-michigan-forest" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                {i < flowSteps.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-muted-foreground/40 md:block" />
                )}
              </motion.div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Equity-Centered Design Principles */}
        <section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}>
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-michigan-coral/10">
                <Heart className="h-5 w-5 text-michigan-coral" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{t("methodologyPage.equityTitle")}</h2>
                <p className="text-sm text-muted-foreground">{t("methodologyPage.equitySubtitle")}</p>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2">
            {equityPrinciples.map((p, i) => (
              <motion.div key={p.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i}>
                <Card className="h-full hover-lift">
                  <CardContent className="pt-6">
                    <p.icon className="mb-3 h-5 w-5 text-michigan-coral" />
                    <h3 className="mb-1 text-sm font-bold text-foreground">{p.title}</h3>
                    <p className="mb-3 text-xs text-muted-foreground">{p.desc}</p>
                    <div className="rounded-md bg-muted/50 p-2.5 border border-border">
                      <p className="text-[11px] text-muted-foreground">
                        <span className="font-semibold text-foreground">{t("methodologyPage.example")}:</span> {p.example}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Data Normalization */}
        <section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}>
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-michigan-teal/10">
                <Layers className="h-5 w-5 text-michigan-teal" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Data Normalization & Ingestion</h2>
                <p className="text-sm text-muted-foreground">How raw federal datasets become usable civic infrastructure</p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-4 mb-6">
            {[
              {
                source: "MDHHS Health Equity & Vital Records",
                desc: "Michigan Department of Health & Human Services racial/ethnic disparity indices, infant mortality reports, chronic disease prevalence by demographics, and Healthy Michigan Plan enrollment. County-level indicators including preventable hospitalizations and life expectancy.",
                frequency: "Annual refresh",
                url: "https://www.michigan.gov/mdhhs",
              },
              {
                source: "County Health Rankings & Roadmaps",
                desc: "University of Wisconsin Population Health Institute rankings across health outcomes and health factors for all 83 Michigan counties. Includes uninsured rates, PCP ratios, food insecurity, and premature mortality.",
                frequency: "Annual release (March)",
                url: "https://www.countyhealthrankings.org/explore-health-rankings/michigan",
              },
              {
                source: "CDC PLACES & BRFSS",
                desc: "County- and census-tract-level chronic disease prevalence estimates (asthma, diabetes, obesity, mental health). Standardized to per-100K rates with age-adjusted denominators for cross-county comparison.",
                frequency: "Annual refresh",
                url: "https://www.cdc.gov/places/",
              },
              {
                source: "CMS Hospital Compare",
                desc: "Hospital quality star ratings, patient experience (HCAHPS), timely and effective care measures, readmission rates. Mapped to internal facility IDs with Leapfrog and ANCC supplementary overlays.",
                frequency: "Monthly refresh",
                url: "https://data.cms.gov/",
              },
              {
                source: "HRSA Data Warehouse",
                desc: "Health Professional Shortage Area (HPSA) designations, Uniform Data System (UDS) reports from 45+ Michigan FQHCs, and health center service area boundaries. Ingested via REST API with county-level FIPS normalization.",
                frequency: "Quarterly refresh",
                url: "https://data.hrsa.gov/",
              },
              {
                source: "IHME Global Burden of Disease",
                desc: "Institute for Health Metrics and Evaluation disease burden estimates, risk factor analysis, and mortality trend modeling. Used for cross-state and international benchmarking in the Research Tools tab.",
                frequency: "Annual refresh",
                url: "https://www.healthdata.org/",
              },
              {
                source: "ACEEE LEAD Tool & DOE",
                desc: "American Council for an Energy-Efficient Economy Low-income Energy Affordability Data tool. County-level energy burden (% of household income on energy), using DOE thresholds: >6% high burden, >10% severe burden.",
                frequency: "Biennial refresh",
                url: "https://www.aceee.org/",
              },
              {
                source: "EIA State Energy Data System (SEDS)",
                desc: "U.S. Energy Information Administration state-level energy price, consumption, and expenditure data. Used for Michigan vs. U.S. residential electricity price and per-capita consumption time-series charts.",
                frequency: "Annual release (Oct)",
                url: "https://www.eia.gov/state/seds/",
              },
              {
                source: "DOE LEAD Tool (Energy Burden)",
                desc: "County-level energy burden (% of income spent on energy). Complements ACEEE data with direct DOE methodology for identifying high-burden communities.",
                frequency: "Biennial (2022 latest)",
                url: "https://data.openei.org/submissions/6219",
              },
              {
                source: "AirNow API (Real-time Air Quality)",
                desc: "Michigan ZIP-level Air Quality Index from 40+ monitoring stations. Hourly observations for ozone, PM2.5, and PM10 with health guidance.",
                frequency: "Hourly",
                url: "https://docs.airnowapi.org/webservices",
              },
              {
                source: "USGS Water Data (Great Lakes + Inland)",
                desc: "Real-time stream and lake data from 9,375 sites in Michigan. Flow, temperature, and water quality via the new OGC API.",
                frequency: "15-minute intervals",
                url: "https://api.waterdata.usgs.gov/ogcapi/v0/",
              },
              {
                source: "GLOS/Seagull (Great Lakes Buoy Data)",
                desc: "Great Lakes Observing System real-time buoy data: water temperature, waves, chlorophyll, turbidity. 3,154+ datasets via ERDDAP API.",
                frequency: "Real-time",
                url: "https://seagull-erddap.glos.org/erddap/",
              },
              {
                source: "Michigan 211 HSDS API",
                desc: "40,000+ service records statewide covering social services, food, housing, and utilities. HSDS-format data continuously maintained by United Way.",
                frequency: "Continuously maintained",
                url: "https://mi211.org",
              },
              {
                source: "Open States API v3 (Michigan Legislature)",
                desc: "Bill tracking, legislator lookup, vote records, and committee assignments for the Michigan Legislature.",
                frequency: "Session-based updates",
                url: "https://v3.openstates.org/",
              },
              {
                source: "MODA Dashboard (Opioid Data)",
                desc: "Fatal and non-fatal overdoses by county and ZIP code. Michigan's comprehensive opioid surveillance dashboard.",
                frequency: "Monthly refresh",
                url: "https://www.michigan.gov/opioids/category-data",
              },
              {
                source: "MI-SUDDR (Substance Use Data Repository)",
                desc: "ED visits, hospitalizations, and treatment admissions by county for substance use disorders across Michigan.",
                frequency: "Quarterly refresh",
                url: "https://mi-suddr.com/data/",
              },
              {
                source: "GATIS (General Active Transportation Infrastructure Specification)",
                desc: "Bureau of Transportation Statistics open standard (v1.0, March 2026) for sidewalk, bike lane, curb ramp, and transit stop geospatial data. Michigan data via SEMCOG FeatureServer covering 7 SE counties (Wayne, Oakland, Macomb, Washtenaw, Livingston, Monroe, St. Clair). CC0 Public Domain.",
                frequency: "Spec: annual; SEMCOG: quarterly",
                url: "https://dotbts.github.io/BPA/",
              },
              {
                source: "SEMCOG Sidewalks & Crosswalks FeatureServer",
                desc: "AI-digitized sidewalk and crosswalk inventory for 7 SE Michigan counties. Attributes include presence, geometry, and surface type. Created from 2019 aerial imagery.",
                frequency: "Quarterly refresh",
                url: "https://gis.semcog.org/server/rest/services/Hosted/Sidewalks_and_Crosswalks/FeatureServer",
              },
              {
                source: "Michigan Broadband Map (MIHI)",
                desc: "Statewide broadband coverage by provider, speed tier, and technology. 95.3% have 25/3 Mbps access but 32.5% remain unsubscribed. BEAD: $1.5B+ allocation. ROBIN: $250M state match.",
                frequency: "Semiannual",
                url: "https://michiganbroadbandmap.com/",
              },
              {
                source: "MPART PFAS GIS (Michigan PFAS Action Response Team)",
                desc: "Interactive map and ArcGIS data layer for 200+ identified PFAS contamination sites across Michigan. Includes site investigation status, contaminant levels, and affected water sources.",
                frequency: "Updated as investigations progress",
                url: "https://www.michigan.gov/egle/maps-data/mpart-pfas-gis",
              },
              {
                source: "MiLeadSafe (Lead Service Line Replacement Tracker)",
                desc: "Statewide dashboard tracking lead service line inventories and replacement progress by water system. Supports the federal Lead & Copper Rule Revisions (LCRR).",
                frequency: "Updated as replacements occur",
                url: "https://www.michigan.gov/egle/about/featured/mi-lead-safe",
              },
              {
                source: "NWS Weather API (Alerts & Forecast)",
                desc: "Real-time severe weather alerts and 7-day forecasts for Michigan. Covers all NWS offices serving the state (Detroit, Grand Rapids, Gaylord, Marquette).",
                frequency: "Continuous (alerts) / Hourly (forecast)",
                url: "https://api.weather.gov/",
              },
              {
                source: "CDC PLACES Tract-Level",
                desc: "Census tract-level disease prevalence estimates for diabetes, asthma, obesity, depression, blood pressure, COPD, and stroke. Reveals within-county neighborhood disparities.",
                frequency: "Annual",
                url: "https://data.cdc.gov/resource/cwsq-ngmh.json",
              },
              {
                source: "CMS Physician Compare",
                desc: "Medicare-participating provider data including medical school, graduation year, hospital affiliations, group practice, and Medicare assignment status.",
                frequency: "Quarterly",
                url: "https://data.cms.gov/provider-data/dataset/mj5m-pzi6",
              },
              {
                source: "FDA openFDA (Drug Recalls)",
                desc: "Drug recall enforcement actions by classification (Class I = most serious). Tracks active recalls, recalling firms, and reasons.",
                frequency: "Updated as recalls occur",
                url: "https://api.fda.gov/drug/enforcement.json",
              },
              {
                source: "FEMA National Risk Index",
                desc: "County-level natural hazard risk ratings, expected annual loss, social vulnerability, and community resilience scores for all 83 Michigan counties.",
                frequency: "Annual",
                url: "https://hazards.fema.gov/nri/",
              },
              {
                source: "Census Bureau ACS API (Economic Data)",
                desc: "County-level median income, poverty rate, unemployment, median home value, and median rent for all 83 Michigan counties via the American Community Survey 5-year estimates.",
                frequency: "Annual (Sep)",
                url: "https://api.census.gov/data/2023/acs/acs5",
              },
              {
                source: "USDA Food Access Research Atlas",
                desc: "Census tract food desert classifications (low income + low access at 1/10 miles). County-level aggregation of food desert tracts and affected population.",
                frequency: "Annual",
                url: "https://www.ers.usda.gov/data-products/food-access-research-atlas/",
              },
              {
                source: "United for ALICE (Asset Limited, Income Constrained, Employed)",
                desc: "County-level ALICE Threshold data — households above poverty but below cost of living. Survival Budget breakdowns by household type.",
                frequency: "Annual",
                url: "https://unitedforalice.org/state-overview/michigan",
              },
              {
                source: "EGLE Part 201 Contaminated Sites",
                desc: "Every location in Michigan where environmental contamination has been identified. Includes state-funded and private party cleanup sites regulated by EGLE.",
                frequency: "Updated as sites are identified or remediated",
                url: "https://gis-michigan.opendata.arcgis.com/datasets/egle::part-201-environmental-contamination-sites/about",
              },
              {
                source: "EGLE Brownfields",
                desc: "Sites where EGLE has provided redevelopment incentives — grants, loans, tax increment financing, or free environmental assessments.",
                frequency: "Updated as incentives are awarded",
                url: "https://gis-egle.hub.arcgis.com/maps/egle::brownfields",
              },
              {
                source: "MDOT GIS Open Data",
                desc: "Traffic counts, road classifications, crash data, and bridge conditions for all state-maintained roads.",
                frequency: "Annual (traffic counts), continuous (crash data)",
                url: "https://www.michigan.gov/mdot/business/gis-open-data",
              },
              {
                source: "Michigan GIS Open Data Portal",
                desc: "State-level geospatial datasets — boundaries, demographics, geology, infrastructure. Downloadable as shapefile, KML, CSV, or via ArcGIS REST API.",
                frequency: "Varies by dataset",
                url: "https://gis-michigan.opendata.arcgis.com/",
              },
              {
                source: "Michigan DNR Open Data",
                desc: "State parks, trails, boat launches, campgrounds, game areas, and forest boundaries.",
                frequency: "Varies by dataset",
                url: "https://gis-midnr.opendata.arcgis.com/",
              },
              {
                source: "NREL AFDC (EV Charging Stations)",
                desc: "Alternative fuel station locations including EV chargers, filtered for Michigan. Part of the DOE Alternative Fuels Station Locator.",
                frequency: "Continuously updated",
                url: "https://developer.nrel.gov/docs/transportation/alt-fuel-stations-v1/",
              },
              {
                source: "USDA SNAP Retailer Locator",
                desc: "Authorized SNAP retailers in Michigan — grocery stores, convenience stores, farmers markets. Geocoded with store type classification.",
                frequency: "Continuously updated",
                url: "https://usda-fns.hub.arcgis.com/datasets/USDA-FNS::snap-store-locations/",
              },
              {
                source: "FCC Broadband Data Collection",
                desc: "Location-level broadband availability aggregated to census tract. Served/underserved/unserved classification, provider counts, fiber availability.",
                frequency: "Semiannual",
                url: "https://broadbandmap.fcc.gov/data-download/",
              },
              {
                source: "GTFS Static Feeds (DDOT, SMART, AAATA)",
                desc: "Transit stop locations, routes, and schedules from Michigan's major transit agencies. Parsed from General Transit Feed Specification files.",
                frequency: "Quarterly updates",
                url: "https://www.smartbus.org/About/Developer-Center",
              },
              {
                source: "March of Dimes PeriStats",
                desc: "County-level maternal and infant health indicators — preterm birth, low birth weight, prenatal care access, teen birth rate.",
                frequency: "Annual",
                url: "https://www.marchofdimes.org/peristats/",
              },
              {
                source: "MDHHS Vital Records (Maternal/Infant Mortality)",
                desc: "County-level infant mortality rates with racial breakdowns. Data suppressed where <20 events to protect privacy.",
                frequency: "Annual",
                url: "https://www.michigan.gov/mdhhs/keep-mi-healthy/chronicdiseaseandinjury/vitalrecords",
              },
              {
                source: "EPA EJScreen v2.3 (Archived 2024)",
                desc: "Block-group-level environmental justice indicators: PM2.5, ozone, diesel PM, lead paint, Superfund proximity, demographic indices.",
                frequency: "Archived (Zenodo doi:10.5281/zenodo.14767363)",
                url: "https://www.epa.gov/ejscreen",
              },
              {
                source: "data.michigan.gov (Socrata SODA API)",
                desc: "State open data portal with 500+ datasets. SoQL-queryable JSON endpoints, no authentication required for public data.",
                frequency: "Varies by dataset",
                url: "https://data.michigan.gov/",
              },
              {
                source: "Access Michigan Compound Access Deficit Index",
                desc: "Weighted composite: food (15%) + broadband (15%) + transit (15%) + healthcare (20%) + SVI (15%) + EJ (10%) + energy (10%). Tiers: Critical ≥75, High ≥50, Moderate ≥25, Low <25.",
                frequency: "Calculated from component data sources",
                url: "/health-equity-atlas",
              },
            ].map((src) => (
              <details key={src.source} className="group rounded-lg border border-border">
                <summary className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors list-none">
                  <span className="text-sm font-medium text-foreground">{src.source}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="rounded-full bg-michigan-teal/15 px-2 py-0.5 text-[10px] font-semibold text-foreground">{src.frequency}</span>
                    <svg className="h-3.5 w-3.5 text-muted-foreground transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </summary>
                <div className="px-4 pb-3 border-t border-border/50">
                  <p className="text-xs text-muted-foreground leading-relaxed mt-2">{src.desc}</p>
                  <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline mt-1 inline-block">{src.url}</a>
                </div>
              </details>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Normalization Pipeline:</span> All datasets undergo schema mapping → FIPS code standardization → deduplication → geocoding → confidence scoring before entering the presentation layer. Records with incomplete geographic identifiers are flagged for manual review rather than dropped, ensuring rural and tribal area coverage.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              <span className="font-semibold text-foreground">Caveats:</span> Some county-level data may be suppressed for small populations (&lt;20 events) to protect privacy. Energy burden estimates are modeled from census tract-level data and may not reflect individual household circumstances. MDHHS disparity indices use age-adjusted rates; year-over-year comparisons should account for methodology changes. All data has inherent lag (typically 1–2 years from collection to publication).
            </p>
          </div>
        </section>

        <Separator />

        {/* Data Freshness Dashboard */}
        <section>
          <DataFreshnessDashboard />
        </section>

        <Separator />

        {/* Quality Ranking Methodology */}
        <section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}>
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-michigan-forest/10">
                <BarChart3 className="h-5 w-5 text-michigan-forest" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{t("methodologyPage.rankingTitle")}</h2>
                <p className="text-sm text-muted-foreground">{t("methodologyPage.rankingSubtitle")}</p>
              </div>
            </div>
          </motion.div>

          {/* Formula */}
          <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">{t("methodologyPage.formulaLabel")}</p>
            <p className="font-mono text-sm text-foreground leading-relaxed">
              COMPOSITE = <span className="text-primary font-bold">40%</span> Geographic Access + <span className="text-michigan-forest font-bold">30%</span> Clinical Quality + <span className="text-michigan-teal font-bold">15%</span> Service Comprehensiveness + <span className="text-michigan-sky font-bold">15%</span> Digital Accessibility
            </p>
          </div>

          {/* Weight bars */}
          <div className="space-y-4 mb-8">
            {scoringWeights.map((w, i) => (
              <motion.div key={w.label} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-foreground">{w.label}</span>
                  <span className="text-sm font-bold text-primary">{w.pct}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-muted">
                  <motion.div
                    className={`h-full rounded-full ${w.color}`}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${w.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{w.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Equity Override */}
          <div className="rounded-xl border-2 border-michigan-coral/30 bg-michigan-coral/5 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-michigan-coral" />
              <h3 className="text-sm font-bold text-foreground">{t("methodologyPage.equityOverrideTitle")}</h3>
            </div>
            <ul className="space-y-2">
              {[
                "Safety-net facilities (FQHCs, free clinics) receive automatic visibility boost",
                "Filters never completely hide safety-net options",
                '"Recommended for uninsured patients" callouts displayed alongside quality badges',
              ].map((rule) => (
                <li key={rule} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-michigan-coral" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>

          {/* Side-by-side comparison */}
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Card className="border-destructive/20">
              <CardContent className="pt-6">
                <h4 className="mb-3 text-sm font-bold text-destructive">{t("methodologyPage.standardRanking")}</h4>
                <ol className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex gap-2"><span className="font-bold text-foreground">1.</span> Large Health System — 2.1 mi</li>
                  <li className="flex gap-2"><span className="font-bold text-foreground">2.</span> Specialty Practice — 3.4 mi</li>
                  <li className="flex gap-2"><span className="font-bold text-foreground">3.</span> Private Clinic — 4.0 mi</li>
                  <li className="flex gap-2 opacity-50"><span className="font-bold text-foreground">7.</span> FQHC (Safety-Net) — 5.8 mi</li>
                </ol>
                <p className="mt-3 text-[11px] text-destructive/80">⚠ Safety-net clinic buried at position 7 despite being most relevant for uninsured</p>
              </CardContent>
            </Card>
            <Card className="border-michigan-forest/20">
              <CardContent className="pt-6">
                <h4 className="mb-3 text-sm font-bold text-michigan-forest">{t("methodologyPage.equityRanking")}</h4>
                <ol className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex gap-2"><span className="font-bold text-foreground">1.</span> Large Health System — 2.1 mi <span className="text-michigan-forest">· Quality: A</span></li>
                  <li className="flex gap-2"><span className="font-bold text-foreground">2.</span> <span className="font-semibold text-michigan-forest">FQHC — 5.8 mi · "No one turned away"</span></li>
                  <li className="flex gap-2"><span className="font-bold text-foreground">3.</span> Specialty Practice — 3.4 mi</li>
                  <li className="flex gap-2"><span className="font-bold text-foreground">4.</span> Private Clinic — 4.0 mi</li>
                </ol>
                <p className="mt-3 text-[11px] text-michigan-forest">✅ Safety-net clinic elevated with equity boost for vulnerable populations</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* How to Read Data */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">How to Read Data on Access Michigan</h2>
              <p className="text-sm text-muted-foreground">Every metric is labeled so you always know what you're looking at</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-start gap-3">
                <DataClassification type="verified" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">This data comes directly from an authoritative public source (CMS, CDC, HRSA, Census, MDHHS) and has been validated through our ingestion pipeline. It reflects real-world measurements.</p>
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="flex items-start gap-3">
                <DataClassification type="modeled" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">This value is computed from verified public datasets using a transparent formula. The Civic Insight Score, for example, combines uninsured rates, food insecurity, and county type into a single 0–100 index. The methodology is documented above.</p>
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="flex items-start gap-3">
                <DataClassification type="illustrative" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">This content demonstrates what the platform can do using realistic scenarios. It is not a measured outcome. Case studies, example scores, and projected analyses carry this label.</p>
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="flex items-start gap-3">
                <DataClassification type="pending" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">Data for this geography is not yet available. Access Michigan is expanding coverage — when a county or metric lacks sufficient source data, we show this label rather than displaying incomplete information.</p>
            </div>
          </div>
        </section>

        {/* SDOH Funnel methodology */}
        <section id="sdoh-funnel">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">SDOH Detection Gap Funnel</h2>
              <p className="text-sm text-muted-foreground">How the 1.77M → 7,105 funnel is constructed</p>
            </div>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              The Detection Gap funnel is a <strong className="text-foreground">modeled estimate</strong>, not measured Michigan outcomes. It applies published national benchmark rates to Michigan's Medicaid MCO enrollment to illustrate where the SDOH screening and referral pipeline loses people between eligibility and documented benefit.
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-foreground">Starting pool:</strong> 1,772,000 Michigan Medicaid MCO beneficiaries (HMA March 2025 enrollment report).</li>
              <li><strong className="text-foreground">Screening rate:</strong> 27.0% applied as reference, anchored on Trinity Health's published 27.4% rate across 1M+ outpatients (FY2025).</li>
              <li><strong className="text-foreground">Positive-screen rate:</strong> ~27% national average (NACHC 2023 SDOH Screening Report).</li>
              <li><strong className="text-foreground">Referral-to-services rate:</strong> ~50% national average (CMS Accountable Health Communities Model, final evaluation).</li>
              <li><strong className="text-foreground">Referral completion rate:</strong> ~11% national average (Health Affairs 2023 meta-analysis of closed-loop referral studies).</li>
              <li><strong className="text-foreground">Health improvement documented:</strong> Not quantified — no publicly available Michigan-specific data.</li>
            </ul>
            <p>
              The "With Access Michigan" projection is an <strong className="text-foreground">illustrative platform target</strong>, not an achieved outcome. Projected screening, referral, and completion rates assume unified intake, closed-loop tracking, and CIE integration — none of which are retrospectively measured.
            </p>
            <p className="text-xs text-muted-foreground/70">
              What this funnel is not: a count of Michigan residents whose needs were actually met, a peer-reviewed study, or a claim that the national benchmarks apply uniformly to every Michigan MCO. Use it to size the gap, not to audit a specific program.
            </p>
          </div>
        </section>

        {/* Limitations & Known Gaps */}
        <section id="limitations">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Info className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Limitations & Known Gaps</h2>
              <p className="text-sm text-muted-foreground">What we don't have yet, and what to watch for</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              "ZIP-level data: Most health and socioeconomic metrics are available only at the county level. When shown for ZIPs, they represent county-level values applied to that ZIP's county.",
              "Data lag: CMS and CDC datasets are typically 6–12 months behind current conditions. Census ACS data reflects 5-year rolling estimates.",
              "Coverage gaps: Not all facilities and providers in Michigan are listed. Coverage is expanding continuously as new data sources are integrated.",
              "Modeled indices: Composite scores (e.g., Civic Insight Score) combine verified data using documented formulas, but the resulting index is a model, not a direct measurement.",
              "Utility stress: Disconnection, arrears, and assistance participation levels are currently illustrative placeholders pending integration of MPSC quarterly data.",
              "No individual claims data: All data is population-level. We do not access or display individual health records, claims, or member information.",
            ].map((item, i) => (
              <div key={i} className="flex gap-3 rounded-lg border border-border p-3">
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                <p className="text-sm text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <Separator />

        {/* How we keep this honest */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-michigan-forest/10">
              <Shield className="h-5 w-5 text-michigan-forest" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">How we keep this honest</h2>
              <p className="text-sm text-muted-foreground">Our commitments to data integrity</p>
            </div>
          </div>
          <div className="rounded-xl border border-michigan-forest/20 bg-michigan-forest/[0.03] p-6 space-y-3">
            {[
              "No ads, no tracking, no pay-to-play listings.",
              "If we don't have data for a ZIP or topic, we say so instead of guessing.",
              "Every number is either from a named public dataset or a clearly labeled modeled index, with methods in one place.",
              "When we find mistakes or better methods, we fix them and update this page.",
            ].map((bullet) => (
              <div key={bullet} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-michigan-forest" />
                {bullet}
              </div>
            ))}
            <p className="text-xs text-muted-foreground italic pt-1">
              We invite researchers, journalists, and community partners to audit our methods and tell us what they see.{" "}
              <a href="/contact?subject=Methods%20audit" className="text-primary hover:underline font-medium">Contact us here →</a>
            </p>
          </div>
        </section>

        <Separator />

        {/* Trust & Data Fixes Log */}
        <section id="trust-log">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Trust & Data Fixes</h2>
              <p className="text-sm text-muted-foreground">Concrete corrections we've made to improve accuracy</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { fix: "Removed fabricated impact projections from About page; all impact copy now describes goals qualitatively until measured outcomes are available.", date: "March 2026" },
              { fix: "Replaced aspirational performance claims ('Sub-3-second loads on 3G', 'automated weekly pulls') with accurate present-tense descriptions.", date: "March 2026" },
              { fix: "Moved community events contact info into a safe public view to protect organizer privacy.", date: "February 2026" },
              { fix: "Restricted direct reads on ingestion logs and internal tables; added RLS policies to all public-facing tables.", date: "February 2026" },
              { fix: "Labeled all composite scores (Civic Insight Score, access gap index) as 'Modeled estimate' with methodology links.", date: "February 2026" },
              { fix: "Removed fabricated impact offsets from beta counters; all impact numbers now come from real data.", date: "February 2026" },
            ].map((entry, i) => (
              <div key={i} className="flex gap-3 rounded-lg border border-border p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-michigan-forest" />
                <div>
                  <p className="text-sm text-muted-foreground">{entry.fix}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{entry.date}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Future Integration Note */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" /> Future Data Integration Plans
          </h2>
          <Card>
            <CardContent className="p-5 space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                All data on Access Michigan is currently population-level and sourced from public agencies. We do not access individual claims, member records, or protected health information (PHI).
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Looking ahead:</strong> In the future, we may let users securely connect their own health plan — for example, through Patient Access APIs (FHIR-based) — so they can see personal coverage and claims alongside community data. This will be opt-in, heavily protected with encryption and consent management, and never shared with third parties or used for marketing.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This feature is not yet implemented. When it is, we will document its privacy architecture, data handling practices, and user consent flows on this page.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </Layout>
  );
}
