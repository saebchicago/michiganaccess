import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function EnvironmentalMethodology() {
  usePageMeta({
    title: "Environmental Data Methodology | accessmi.org",
    description:
      "How accessmi.org sources, validates, and surfaces environmental data for Michigan counties. Covers EJScreen, PFAS, TRI, ECHO, FEMA NRI, and energy burden datasets.",
    path: "/methodology/environmental",
    jsonLd: {
      "@type": "TechArticle",
      "headline": "Environmental Data Methodology",
      "description":
        "How accessmi.org sources, validates, and surfaces environmental data for Michigan counties. Covers EJScreen, PFAS, TRI, ECHO, FEMA NRI, and energy burden datasets.",
      "url": "https://accessmi.org/methodology/environmental",
      "datePublished": "2026-04-09",
      "dateModified": "2026-04-09",
      "author": { "@type": "Organization", "name": "accessmi.org", "url": "https://accessmi.org" },
      "about": "Environmental data provenance and methodology for Michigan county pages",
    },
  });

  return (
    <Layout>
      <div className="container max-w-3xl py-8 space-y-8">
        <Breadcrumbs
          items={[
            { label: "Environment", href: "/environment" },
            { label: "Environmental Data Methodology" },
          ]}
        />

        <header>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Environmental Data Methodology
          </h1>
          <p className="text-muted-foreground text-sm">
            How accessmi.org sources, validates, and surfaces environmental data for Michigan counties
          </p>
        </header>

        {/* Section 1: Currently surfaced */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Currently surfaced</h2>
          <p className="text-sm text-muted-foreground">
            The following datasets are loaded and rendered on county pages or environment pages as of April 2026.
          </p>
          <ul className="space-y-3 text-sm">
            <li className="border-l-2 border-border pl-4">
              <p className="font-medium">EPA EJScreen ZCTA static snapshot (15 Michigan ZCTAs, 11 counties)</p>
              <p className="text-muted-foreground">
                Source file: <code className="bg-muted px-1 rounded text-xs">src/data/ejscreen.ts</code>.
                Data year: EJScreen v2.3, 2023. Rendered on <code className="bg-muted px-1 rounded text-xs">/county/:slug</code>{" "}
                via <code className="bg-muted px-1 rounded text-xs">EnvironmentRiskCards</code> and the environmental burden
                choropleth map. The map uses real EJScreen data for 11 of 83 Michigan counties; the remaining 72 counties
                display a neutral "no data" state. For counties with multiple ZCTAs, the highest-burden ZCTA (by ej_index)
                is shown as the representative value. Percentiles are national (0 to 100, higher = more burdened).
                Counties covered: Wayne (ZCTAs 48201, 48126, 48154), Oakland (48075, 48084, 48067), Kent (49503),
                Genesee (48502), Saginaw (48601), Washtenaw (48104), Grand Traverse (49684), Marquette (49855),
                Luce (49853), Kalamazoo (49001), Macomb (48310).
                Primary source:{" "}
                <a href="https://www.epa.gov/ejscreen" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                  epa.gov/ejscreen
                </a>.
              </p>
            </li>
            <li className="border-l-2 border-border pl-4">
              <p className="font-medium">PFAS investigation sites by county (EGLE MPART 2024)</p>
              <p className="text-muted-foreground">
                Source file: <code className="bg-muted px-1 rounded text-xs">src/data/environmentalData.ts</code> (MICHIGAN_PFAS_BY_COUNTY, MICHIGAN_KEY_PFAS_SITES).
                Rendered on <code className="bg-muted px-1 rounded text-xs">/county/:slug</code> via EnvironmentRiskCards with static EGLE fallback.
                Live ArcGIS proxy also queried; static values used when API is unavailable.
                Named sites include: Romulus Fire Training Area (Wayne), Wurtsmith Air Force Base (Oscoda),
                Parchment/Cooper Township (Kalamazoo), Wyoming/Kentwood Area (Kent).
                Primary source:{" "}
                <a href="https://www.michigan.gov/pfasresponse" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                  michigan.gov/pfasresponse
                </a>.
              </p>
            </li>
            <li className="border-l-2 border-border pl-4">
              <p className="font-medium">EPA Toxics Release Inventory (TRI), 2022 reporting year</p>
              <p className="text-muted-foreground">
                Source file: <code className="bg-muted px-1 rounded text-xs">src/data/epa-tri.ts</code>.
                15 Michigan facilities across 9 counties. Rendered on <code className="bg-muted px-1 rounded text-xs">/county/:slug</code>{" "}
                as top-5 facilities by county, sorted by total pounds released.
                Fields: name, city, county, total pounds released, top chemical, industry sector, carcinogen flag.
                Primary source:{" "}
                <a href="https://www.epa.gov/toxics-release-inventory-tri-program" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                  epa.gov/toxics-release-inventory-tri-program
                </a>{" "}
                (enviro.epa.gov/triexplorer).
              </p>
            </li>
            <li className="border-l-2 border-border pl-4">
              <p className="font-medium">EPA ECHO regulated facilities (live API query)</p>
              <p className="text-muted-foreground">
                Hook: <code className="bg-muted px-1 rounded text-xs">src/hooks/useEPAEcho.ts</code>.
                Rendered on <code className="bg-muted px-1 rounded text-xs">/county/:slug</code> (EPA Compliance Overview section)
                and <code className="bg-muted px-1 rounded text-xs">/environment/air</code>.
                Live REST query to echodata.epa.gov with 12-hour stale time. Returns up to 50 facilities per county.
                Programs tracked: CAA (air), CWA (water discharge), RCRA (hazardous waste), SDWA (drinking water).
                Violations counted over trailing 12 months. Falls back to "data temporarily unavailable" message if API returns no results.
                Primary source:{" "}
                <a href="https://echo.epa.gov/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                  echo.epa.gov
                </a>.
              </p>
            </li>
            <li className="border-l-2 border-border pl-4">
              <p className="font-medium">Air quality monitors (EGLE/AirNow, live)</p>
              <p className="text-muted-foreground">
                Rendered on <code className="bg-muted px-1 rounded text-xs">/county/:slug</code> and{" "}
                <code className="bg-muted px-1 rounded text-xs">/environment</code> via AirQualityChecker component.
                Real-time AQI from EPA AirNow monitoring stations. Station count per county shown when API returns results.
                Primary source:{" "}
                <a href="https://www.airnow.gov/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                  airnow.gov
                </a>.
              </p>
            </li>
          </ul>
        </section>

        {/* Section 2: Cached, pending display */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Cached, pending display</h2>
          <p className="text-sm text-muted-foreground">
            The following datasets are loaded into the codebase but not yet wired to county page UI components.
          </p>
          <ul className="space-y-3 text-sm">
            <li className="border-l-2 border-amber-400/60 pl-4">
              <p className="font-medium">FEMA National Risk Index (NRI), 2023</p>
              <p className="text-muted-foreground">
                Source file: <code className="bg-muted px-1 rounded text-xs">src/data/environmentalData.ts</code> (MICHIGAN_FEMA_NRI).
                7 Michigan counties with composite risk score, risk category, expected annual loss, social vulnerability index,
                and top hazard type. Display on county pages not yet wired.
                Primary source:{" "}
                <a href="https://hazards.fema.gov/nri/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                  hazards.fema.gov/nri
                </a>.
              </p>
            </li>
            <li className="border-l-2 border-amber-400/60 pl-4">
              <p className="font-medium">Energy burden by county (ACEEE LEAD Tool 2023)</p>
              <p className="text-muted-foreground">
                Source file: <code className="bg-muted px-1 rounded text-xs">src/data/environmentalData.ts</code> (MICHIGAN_ENERGY_BURDEN).
                7 Michigan counties with average energy burden percent, low-income burden percent, median annual energy spend,
                and LIHEAP-eligible household count. Display on county pages not yet wired.
                Primary source:{" "}
                <a href="https://www.energy.gov/scep/slsc/state-and-local-solution-center" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                  DOE State and Local Solution Center / ACEEE LEAD Tool
                </a>.
              </p>
            </li>
            <li className="border-l-2 border-amber-400/60 pl-4">
              <p className="font-medium">FEMA disaster history, 104 Michigan declarations</p>
              <p className="text-muted-foreground">
                Source file: <code className="bg-muted px-1 rounded text-xs">src/data/environmentalData.ts</code> (MICHIGAN_DISASTER_HISTORY).
                104 total federal disaster declarations from 1953 through 2024. Breakdown by type: severe storm (42), flooding (28),
                tornado (12), ice/winter storm (8), snow (6), hurricane/tropical storm (2), other (6).
                Display on county pages not yet wired.
                Primary source:{" "}
                <a href="https://www.fema.gov/openfema-data-page/disaster-declarations-summaries-v2" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                  FEMA OpenFEMA Disaster Declarations API
                </a>.
              </p>
            </li>
          </ul>
        </section>

        {/* Section 3: Integration in progress */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Integration in progress</h2>
          <ul className="space-y-3 text-sm">
            <li className="border-l-2 border-blue-400/60 pl-4">
              <p className="font-medium">EPA EJScreen full block-group dataset (all 83 counties)</p>
              <p className="text-muted-foreground">
                Seed script exists at{" "}
                <code className="bg-muted px-1 rounded text-xs">src/utils/data-ingestion/seed-ej-screen.ts</code>.
                Supabase <code className="bg-muted px-1 rounded text-xs">ej_screen</code> table schema exists.
                CSV load pending. Once seeded, the environmental burden map will expand from the current 11-county
                ZCTA snapshot to full block-group coverage for all 83 Michigan counties.
                Primary source:{" "}
                <a href="https://www.epa.gov/ejscreen" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                  epa.gov/ejscreen
                </a>.
              </p>
            </li>
          </ul>
        </section>

        {/* Section 4: Not yet on roadmap */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Not yet on roadmap</h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>EGLE solid waste and landfill registry</li>
            <li>EPA Superfund National Priorities List (NPL) by county</li>
            <li>RCRA facility registry (beyond ECHO program flag)</li>
            <li>Sub-county neighborhood-level environmental burden breakdown</li>
          </ul>
        </section>

        {/* Section 5: Source citations */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Source citations</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="https://www.epa.gov/ejscreen" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                EPA EJScreen v2.3
              </a>{" "}
              -- Environmental justice screening tool, ZCTA and block-group level.
            </li>
            <li>
              <a href="https://www.michigan.gov/pfasresponse" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                EGLE PFAS Response Program (MPART)
              </a>{" "}
              -- Michigan PFAS investigation sites, 2024.
            </li>
            <li>
              <a href="https://enviro.epa.gov/triexplorer/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                EPA TRI Explorer
              </a>{" "}
              -- Toxics Release Inventory, 2022 reporting year.
            </li>
            <li>
              <a href="https://echo.epa.gov/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                EPA ECHO (Enforcement and Compliance History Online)
              </a>{" "}
              -- Live regulated facility and violation data.
            </li>
            <li>
              <a href="https://www.airnow.gov/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                EPA AirNow
              </a>{" "}
              -- Real-time AQI monitoring stations.
            </li>
            <li>
              <a href="https://hazards.fema.gov/nri/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                FEMA National Risk Index
              </a>{" "}
              -- County-level natural hazard risk scores, 2023.
            </li>
            <li>
              <a href="https://www.energy.gov/scep/slsc/state-and-local-solution-center" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                DOE State and Local Solution Center / ACEEE LEAD Tool 2023
              </a>{" "}
              -- County energy burden data.
            </li>
            <li>
              <a href="https://www.fema.gov/openfema-data-page/disaster-declarations-summaries-v2" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                FEMA OpenFEMA Disaster Declarations API
              </a>{" "}
              -- Historical federal disaster declaration counts.
            </li>
          </ul>
        </section>

        {/* Section 6: Quality principles */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Quality principles</h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>
              Cite the primary source URL on every stat card and data table. Every number on screen must be
              traceable to a primary source URL visible in the UI.
            </li>
            <li>
              Never display values we cannot trace to a primary source. Where data coverage is incomplete,
              the UI shows a clear "no data" state (example: the environmental burden map shows a neutral gray
              for the 72 counties not yet covered by the ZCTA snapshot).
            </li>
            <li>
              Never characterize policy outcomes, industrial operations, or environmental conditions as good or bad.
              Show the data; let the reader draw conclusions.
            </li>
          </ul>
        </section>

        <div className="pt-2 border-t border-border">
          <Link to="/environment" className="text-sm text-primary hover:underline">
            Back to Environment
          </Link>
        </div>
      </div>
    </Layout>
  );
}
