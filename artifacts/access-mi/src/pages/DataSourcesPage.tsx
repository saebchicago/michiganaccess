import { motion } from "framer-motion";
import { Database, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import {
  DATA_SOURCE_DISPLAY,
  DATA_SOURCE_BREAKDOWN,
} from "@/config/platformConstants";

interface Source {
  name: string;
  org: string;
  url: string;
  powers: string;
  frequency: string;
}

const SOURCES: Record<string, Source[]> = {
  "Federal Agencies": [
    {
      name: "CDC PLACES / BRFSS",
      org: "CDC",
      url: "https://www.cdc.gov/places/",
      powers: "County/tract health metrics",
      frequency: "Annual",
    },
    {
      name: "CMS Hospital Compare",
      org: "CMS",
      url: "https://data.cms.gov/",
      powers: "Hospital quality, safety grades",
      frequency: "Quarterly",
    },
    {
      name: "CMS Physician Compare",
      org: "CMS",
      url: "https://data.cms.gov/provider-data/",
      powers: "Doctor search, Medicare data",
      frequency: "Quarterly",
    },
    {
      name: "HRSA Data Warehouse",
      org: "HRSA",
      url: "https://data.hrsa.gov/",
      powers: "HPSA designations, FQHCs",
      frequency: "Quarterly",
    },
    {
      name: "NPPES NPI Registry",
      org: "CMS",
      url: "https://npiregistry.cms.hhs.gov/",
      powers: "Provider search",
      frequency: "Real-time",
    },
    {
      name: "NWS Weather API",
      org: "NOAA",
      url: "https://api.weather.gov/",
      powers: "Weather alerts, forecasts",
      frequency: "Live",
    },
    {
      name: "AirNow API",
      org: "EPA",
      url: "https://www.airnow.gov/",
      powers: "ZIP-level air quality",
      frequency: "Hourly",
    },
    {
      name: "EIA v2 API",
      org: "DOE",
      url: "https://api.eia.gov/",
      powers: "Electricity prices",
      frequency: "Monthly",
    },
    {
      name: "USGS Water Services",
      org: "USGS",
      url: "https://waterservices.usgs.gov/",
      powers: "Stream/river monitoring",
      frequency: "15-min",
    },
    {
      name: "FDA openFDA",
      org: "FDA",
      url: "https://api.fda.gov/",
      powers: "Drug & food recalls",
      frequency: "Live",
    },
    {
      name: "Census ACS API",
      org: "Census",
      url: "https://api.census.gov/",
      powers: "Economic, demographic data",
      frequency: "Annual",
    },
    {
      name: "FEMA NRI",
      org: "FEMA",
      url: "https://hazards.fema.gov/nri/",
      powers: "Hazard risk by county",
      frequency: "Annual",
    },
    {
      name: "ClinicalTrials.gov",
      org: "NIH",
      url: "https://clinicaltrials.gov/",
      powers: "Clinical trial search",
      frequency: "Live",
    },
    {
      name: "FRED / BLS",
      org: "Federal Reserve",
      url: "https://fred.stlouisfed.org/",
      powers: "Unemployment, CPI",
      frequency: "Monthly",
    },
    {
      name: "FCC BDC",
      org: "FCC",
      url: "https://broadbandmap.fcc.gov/",
      powers: "Broadband availability",
      frequency: "Semiannual",
    },
    {
      name: "HUD PIT Count",
      org: "HUD",
      url: "https://www.hudexchange.info/",
      powers: "Homelessness data",
      frequency: "Annual",
    },
    {
      name: "FEMA OpenFEMA API",
      org: "FEMA",
      url: "https://www.fema.gov/about/openfema/api",
      powers: "70 years of Michigan disaster declarations",
      frequency: "Daily",
    },
    {
      name: "SBA FOIA Data",
      org: "SBA",
      url: "https://data.sba.gov/",
      powers: "Small business lending, disaster loan approvals",
      frequency: "Quarterly",
    },
    {
      name: "IRS Statistics of Income",
      org: "IRS",
      url: "https://www.irs.gov/statistics/soi-tax-stats",
      powers: "ZIP-level income, EITC claims, charitable giving",
      frequency: "Annual (Tax Year 2021)",
    },
    {
      name: "EPA Toxic Release Inventory",
      org: "EPA",
      url: "https://enviro.epa.gov/triexplorer",
      powers: "Facility-level toxic chemical releases",
      frequency: "Annual (2022 reporting year)",
    },
    {
      name: "USDA Rural-Urban Commuting Area Codes",
      org: "USDA",
      url: "https://www.ers.usda.gov/data-products/rural-urban-commuting-area-codes",
      powers: "ZIP-level urban/rural classification",
      frequency: "Decennial",
    },
    {
      name: "HUD Fair Market Rents",
      org: "HUD",
      url: "https://www.huduser.gov/portal/datasets/fmr.html",
      powers: "Rental affordability benchmarks by ZIP",
      frequency: "Annual (FY2025)",
    },
    {
      name: "FEMA National Flood Insurance Program",
      org: "FEMA",
      url: "https://www.fema.gov/openfema",
      powers: "Flood claims and policy data by county",
      frequency: "Monthly",
    },
  ],
  "Michigan State Agencies": [
    {
      name: "MDHHS Health Data",
      org: "MDHHS",
      url: "https://www.michigan.gov/mdhhs",
      powers: "Vital records, Medicaid, SDOH",
      frequency: "Varies",
    },
    {
      name: "EGLE MPART PFAS",
      org: "EGLE",
      url: "https://www.michigan.gov/egle/maps-data/mpart-pfas-gis",
      powers: "PFAS contamination map",
      frequency: "Ongoing",
    },
    {
      name: "EGLE MiLeadSafe",
      org: "EGLE",
      url: "https://www.michigan.gov/egle/about/featured/mi-lead-safe",
      powers: "Lead service line tracking",
      frequency: "Ongoing",
    },
    {
      name: "MDOC Statistics",
      org: "MDOC",
      url: "https://www.michigan.gov/corrections",
      powers: "Incarceration, recidivism",
      frequency: "Annual",
    },
    {
      name: "Michigan Dept of Education",
      org: "MDE",
      url: "https://www.mischooldata.org/",
      powers: "School data, absenteeism",
      frequency: "Annual",
    },
    {
      name: "MPSC E-Dockets",
      org: "MPSC",
      url: "https://mi-psc.my.site.com/s/",
      powers: "Utility rate cases",
      frequency: "Ongoing",
    },
    {
      name: "MDOT GIS",
      org: "MDOT",
      url: "https://www.michigan.gov/mdot/business/gis-open-data",
      powers: "Traffic, crash data",
      frequency: "Annual",
    },
    {
      name: "data.michigan.gov",
      org: "State of MI",
      url: "https://data.michigan.gov/",
      powers: "500+ public datasets",
      frequency: "Varies",
    },
    {
      name: "LARA Provider Search",
      org: "LARA",
      url: "https://childcaresearch.apps.lara.state.mi.us/",
      powers: "Licensed childcare",
      frequency: "Ongoing",
    },
  ],
  "Nonprofits & Research": [
    {
      name: "United For ALICE",
      org: "MI United Ways",
      url: "https://unitedforalice.org/michigan",
      powers: "ALICE Threshold data",
      frequency: "Annual",
    },
    {
      name: "Michigan 211",
      org: "United Way",
      url: "https://mi211.org",
      powers: "40K+ service records",
      frequency: "Daily",
    },
    {
      name: "County Health Rankings",
      org: "UW Pop Health",
      url: "https://www.countyhealthrankings.org/",
      powers: "County rankings",
      frequency: "Annual",
    },
    {
      name: "March of Dimes PeriStats",
      org: "March of Dimes",
      url: "https://www.marchofdimes.org/peristats/",
      powers: "Maternal/infant health",
      frequency: "Annual",
    },
    {
      name: "Feeding America",
      org: "Feeding America",
      url: "https://www.feedingamerica.org/",
      powers: "Food insecurity data",
      frequency: "Annual",
    },
    {
      name: "Leapfrog Group",
      org: "Leapfrog",
      url: "https://www.hospitalsafetygrade.org/",
      powers: "Hospital safety grades",
      frequency: "Biannual",
    },
    {
      name: "SEMCOG FeatureServer",
      org: "SEMCOG",
      url: "https://gis.semcog.org/",
      powers: "Sidewalk/bike data",
      frequency: "Quarterly",
    },
    {
      name: "Nation Outside",
      org: "Nation Outside",
      url: "https://nationoutside.org",
      powers: "Reentry resources",
      frequency: "Ongoing",
    },
    {
      name: "SCHA-MI",
      org: "School-Community Health Alliance",
      url: "https://www.scha-mi.org/",
      powers: "School-based health centers",
      frequency: "Annual",
    },
  ],
};

export default function DataSourcesPage() {
  usePageMeta({
    title: "Data Sources - Access Michigan",
    description: `${DATA_SOURCE_DISPLAY} verified public source organizations (${DATA_SOURCE_BREAKDOWN.federal} federal, ${DATA_SOURCE_BREAKDOWN.state} state, ${DATA_SOURCE_BREAKDOWN.nonprofit} nonprofit) powering Michigan's civic intelligence platform. Every organization credited.`,
    path: "/data-sources",
  });

  const totalSources = Object.values(SOURCES).flat().length;

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Data Sources" }]} />
      <section className="bg-gradient-to-b from-primary/5 to-background py-14">
        <div className="container max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge
              variant="outline"
              className="mb-3 text-xs uppercase tracking-wider border-primary/30 text-primary"
            >
              Transparency
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              <AnimatedCounter
                value={totalSources}
                suffix="+"
                className="text-primary"
              />{" "}
              Verified Data Sources
            </h1>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Every data point on this platform comes from a public source. No
              contribution influences rankings, visibility, or content.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-4xl py-10 space-y-10">
        {Object.entries(SOURCES).map(([category, sources]) => (
          <section key={category}>
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" /> {category}
              <Badge variant="secondary" className="text-[10px]">
                {sources.length}
              </Badge>
            </h2>
            <div className="space-y-1">
              {sources.map((src) => (
                <details
                  key={src.name}
                  className="group rounded-lg border border-border"
                >
                  <summary className="flex items-center justify-between gap-3 px-4 py-2.5 cursor-pointer hover:bg-muted/50 transition-colors list-none">
                    <span className="text-sm font-medium text-foreground">
                      {src.name}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-[8px]">
                        {src.org}
                      </Badge>
                      <span className="text-[9px] text-muted-foreground">
                        {src.frequency}
                      </span>
                      <svg
                        className="h-3 w-3 text-muted-foreground transition-transform group-open:rotate-180"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </summary>
                  <div className="px-4 pb-2.5 border-t border-border/50">
                    <p className="text-xs text-muted-foreground mt-2">
                      Powers: {src.powers}
                    </p>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-primary hover:underline flex items-center gap-0.5 mt-1"
                    >
                      {src.url} <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Layout>
  );
}
