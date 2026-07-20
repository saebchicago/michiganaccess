import { useMemo } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useFacilities } from "@/hooks/useFacilities";
import { useProviders } from "@/hooks/useProviders";
import { useCommunityResources } from "@/hooks/useCommunityResources";
import { useFinancialPrograms } from "@/hooks/useFinancialPrograms";
import { useQualityMetrics } from "@/hooks/useQualityMetrics";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  Printable site report - designed for browser "Print → Save as PDF" */
/* ------------------------------------------------------------------ */

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-4 border-primary/40 bg-primary/5 px-3 py-2 text-xs text-muted-foreground my-2 print:break-inside-avoid">
      <span className="font-semibold text-primary mr-1">
        ℹ Interactive element note:
      </span>
      {children}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8 print:break-inside-avoid-page">
      <h2 className="text-lg font-bold border-b border-border pb-1 mb-3">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function SiteReportPage() {
  usePageMeta({
    title: "Site Report",
    description:
      "Printable Access Michigan site report summarizing facilities, providers, community resources, and financial programs data.",
    path: "/site-report",
    noindex: true,
  });
  const { data: facilities = [], isLoading: fl } = useFacilities();
  const { data: providers = [], isLoading: pl } = useProviders();
  const { data: resources = [], isLoading: rl } = useCommunityResources();
  const { data: programs = [], isLoading: prl } = useFinancialPrograms();
  const facilityIds = useMemo(() => facilities.map((f) => f.id), [facilities]);
  const { data: metrics = [], isLoading: ml } = useQualityMetrics(
    facilityIds.length > 0 ? facilityIds : undefined,
  );

  const loading = fl || pl || rl || prl || ml;

  const facilityMap = useMemo(() => {
    const m: Record<string, (typeof facilities)[0]> = {};
    facilities.forEach((f) => (m[f.id] = f));
    return m;
  }, [facilities]);

  const specialties = useMemo(() => {
    const s = new Set(providers.map((p) => p.specialty));
    return Array.from(s).sort();
  }, [providers]);

  const resourceTypes = useMemo(() => {
    const s = new Set(resources.map((r) => r.resource_type));
    return Array.from(s).sort();
  }, [resources]);

  const programTypes = useMemo(() => {
    const s = new Set(programs.map((p) => p.program_type));
    return Array.from(s).sort();
  }, [programs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <h1 className="text-base font-semibold text-foreground">
            Access Michigan - Full Site Report
          </h1>
          <p className="text-sm text-muted-foreground">
            Loading all site data for report…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 text-sm leading-relaxed print:px-0 print:py-0 print:max-w-none">
      {/* Print button - hidden in print */}
      <div className="print:hidden mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Access Michigan - Full Site Report
          </h1>
          <p className="text-muted-foreground text-xs mt-1">
            Use your browser's <strong>Print → Save as PDF</strong> (Ctrl/Cmd+P)
            to export this page.
          </p>
        </div>
        <Button onClick={() => window.print()} size="sm" className="gap-2">
          <Printer className="h-4 w-4" /> Print / Save PDF
        </Button>
      </div>

      {/* Header for PDF */}
      <div className="hidden print:block mb-6">
        <h1 className="text-xl font-bold">
          Access Michigan - Comprehensive Site Report
        </h1>
        <p className="text-xs text-muted-foreground">
          Generated {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* ── TABLE OF CONTENTS ── */}
      <Section title="Table of Contents">
        <ol className="list-decimal list-inside space-y-1 text-xs">
          <li>Site Overview & Architecture</li>
          <li>Home Page</li>
          <li>Find Care - Facilities ({facilities.length})</li>
          <li>Find Care - Provider Directory ({providers.length})</li>
          <li>Health Map</li>
          <li>Financial Help - Programs ({programs.length})</li>
          <li>Quality Ratings - Metrics ({metrics.length})</li>
          <li>Community Resources ({resources.length})</li>
          <li>Health Conditions</li>
          <li>Interactive Elements Summary</li>
          <li>Data Schema Summary</li>
        </ol>
      </Section>

      {/* ── 1. SITE OVERVIEW ── */}
      <Section title="1. Site Overview & Architecture">
        <p>
          Access Michigan is a public civic-infrastructure platform providing
          free, transparent access to healthcare facility data, provider
          directories, community resources, transportation tools, financial
          assistance programs, and quality metrics across the state of Michigan.
        </p>
        <ul className="list-disc list-inside mt-2 space-y-0.5 text-xs">
          <li>
            <strong>Tech stack:</strong> React 18 + Vite + TypeScript + Tailwind
            CSS + shadcn/ui
          </li>
          <li>
            <strong>Backend:</strong> Lovable Cloud (Supabase) - 5 public
            tables, all read-only via RLS
          </li>
          <li>
            <strong>Maps:</strong> Leaflet for geographic facility visualization
          </li>
          <li>
            <strong>Rate limiting:</strong> Edge function proxy (30 req/min per
            IP, max 100 rows)
          </li>
          <li>
            <strong>Privacy:</strong> Google Analytics 4 for aggregate page-view
            measurement; see Privacy Policy
          </li>
        </ul>
        <h3 className="font-semibold mt-3 mb-1">Route Map</h3>
        <table className="w-full text-xs border border-border">
          <thead>
            <tr className="bg-muted">
              <th className="p-1 text-left border-b">Path</th>
              <th className="p-1 text-left border-b">Page</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["/", "Home"],
              ["/find-care", "Find Care (Facilities + Providers)"],
              ["/health-map", "Interactive Health Map"],
              ["/financial-help", "Financial Assistance Programs"],
              ["/quality", "Quality Ratings & Metrics"],
              ["/resources", "Community Resources"],
              ["/conditions", "Health Conditions Information"],
              ["/about", "About"],
            ].map(([path, name]) => (
              <tr key={path} className="border-b border-border/50">
                <td className="p-1 font-mono">{path}</td>
                <td className="p-1">{name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* ── 2. HOME PAGE ── */}
      <Section title="2. Home Page">
        <p>
          The home page features a hero section with a Michigan landscape image,
          statistics bar, featured health topics, quick-action cards,
          how-it-helps explainer, and trust indicators.
        </p>
        <Note>
          Hero section contains a search input that filters topics. Quick-action
          cards are clickable links to internal pages. Stats bar shows aggregate
          counts from the database.
        </Note>
      </Section>

      {/* ── 3. FACILITIES ── */}
      <Section title={`3. Find Care - Facilities (${facilities.length} total)`}>
        <Note>
          The live site has filter controls: facility type dropdown, county
          dropdown, search input, and toggle switches for
          telehealth/walk-in/accepting patients. A Leaflet map shows facility
          pins. Clicking a facility card scrolls to details.
        </Note>
        <p className="mb-2">All facilities in the database:</p>
        <table className="w-full text-[10px] border border-border">
          <thead>
            <tr className="bg-muted">
              <th className="p-1 text-left border-b">Name</th>
              <th className="p-1 text-left border-b">Type</th>
              <th className="p-1 text-left border-b">City</th>
              <th className="p-1 text-left border-b">County</th>
              <th className="p-1 text-left border-b">Quality</th>
              <th className="p-1 text-left border-b">Phone</th>
              <th className="p-1 text-left border-b">Services</th>
            </tr>
          </thead>
          <tbody>
            {facilities.map((f) => (
              <tr key={f.id} className="border-b border-border/30">
                <td className="p-1 font-medium">{f.name}</td>
                <td className="p-1">{f.facility_type}</td>
                <td className="p-1">{f.city}</td>
                <td className="p-1">{f.county}</td>
                <td className="p-1">{f.quality_score ?? "–"}</td>
                <td className="p-1">{f.phone ?? "–"}</td>
                <td className="p-1">
                  {f.services?.slice(0, 3).join(", ")}
                  {f.services && f.services.length > 3 ? "…" : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* ── 4. PROVIDERS ── */}
      <Section
        title={`4. Find Care - Provider Directory (${providers.length} total)`}
      >
        <Note>
          The live site has filters: search by name/specialty, specialty
          dropdown ({specialties.length} specialties available), language
          dropdown. Cards show ratings, board certification badges, telehealth
          availability, and linked facility info.
        </Note>
        <p className="mb-1">
          <strong>Specialties:</strong> {specialties.join(", ") || "None"}
        </p>
        <table className="w-full text-[10px] border border-border">
          <thead>
            <tr className="bg-muted">
              <th className="p-1 text-left border-b">Name</th>
              <th className="p-1 text-left border-b">Specialty</th>
              <th className="p-1 text-left border-b">Rating</th>
              <th className="p-1 text-left border-b">Board Cert</th>
              <th className="p-1 text-left border-b">Telehealth</th>
              <th className="p-1 text-left border-b">Languages</th>
              <th className="p-1 text-left border-b">Facility</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((p) => (
              <tr key={p.id} className="border-b border-border/30">
                <td className="p-1 font-medium">
                  {p.first_name} {p.last_name}, {p.title || "MD"}
                </td>
                <td className="p-1">
                  {p.specialty}
                  {p.subspecialty ? ` (${p.subspecialty})` : ""}
                </td>
                <td className="p-1">
                  {p.patient_rating ? Number(p.patient_rating).toFixed(1) : "–"}
                </td>
                <td className="p-1">{p.board_certified ? "Yes" : "No"}</td>
                <td className="p-1">{p.telehealth_available ? "Yes" : "No"}</td>
                <td className="p-1">{p.languages?.join(", ") ?? "English"}</td>
                <td className="p-1">
                  {p.facility_id
                    ? (facilityMap[p.facility_id]?.name ?? "–")
                    : "–"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* ── 5. HEALTH MAP ── */}
      <Section title="5. Health Map">
        <p>
          Interactive Leaflet map centered on Michigan showing all facilities as
          pins, color-coded by facility type. Users can toggle map layers and
          view a legend.
        </p>
        <Note>
          Interactive map with: layer toggle controls (facility types),
          zoom/pan, clickable pins showing facility details in popups, and a
          color-coded legend. The map cannot be rendered in PDF - see facilities
          table above for the full dataset.
        </Note>
      </Section>

      {/* ── 6. FINANCIAL HELP ── */}
      <Section
        title={`6. Financial Help - Programs (${programs.length} total)`}
      >
        <Note>
          The live site has filter tabs by program type (
          {programTypes.join(", ") || "various types"}), and expandable cards
          showing eligibility criteria, how to apply, and covered services.
        </Note>
        <table className="w-full text-[10px] border border-border">
          <thead>
            <tr className="bg-muted">
              <th className="p-1 text-left border-b">Program</th>
              <th className="p-1 text-left border-b">Type</th>
              <th className="p-1 text-left border-b">Organization</th>
              <th className="p-1 text-left border-b">Coverage</th>
              <th className="p-1 text-left border-b">FPL</th>
              <th className="p-1 text-left border-b">Phone</th>
            </tr>
          </thead>
          <tbody>
            {programs.map((p) => (
              <tr key={p.id} className="border-b border-border/30">
                <td className="p-1 font-medium">{p.program_name}</td>
                <td className="p-1">{p.program_type}</td>
                <td className="p-1">{p.organization ?? "–"}</td>
                <td className="p-1">{p.coverage_area ?? "–"}</td>
                <td className="p-1">
                  {p.fpl_threshold ? `${p.fpl_threshold}%` : "–"}
                </td>
                <td className="p-1">{p.phone ?? "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {programs.map((p) => (
          <div key={p.id} className="mt-2 text-[10px] print:break-inside-avoid">
            <p className="font-semibold">{p.program_name}</p>
            {p.description && (
              <p className="text-muted-foreground">{p.description}</p>
            )}
            {p.how_to_apply && (
              <p>
                <strong>How to apply:</strong> {p.how_to_apply}
              </p>
            )}
            {p.services_covered && p.services_covered.length > 0 && (
              <p>
                <strong>Services:</strong> {p.services_covered.join(", ")}
              </p>
            )}
          </div>
        ))}
      </Section>

      {/* ── 7. QUALITY METRICS ── */}
      <Section title={`7. Quality Ratings - Metrics (${metrics.length} total)`}>
        <Note>
          The live site shows Recharts bar/line charts comparing facility
          metrics to state and national averages. Users can filter by metric
          type and facility. Charts are interactive with tooltips on hover.
        </Note>
        <table className="w-full text-[10px] border border-border">
          <thead>
            <tr className="bg-muted">
              <th className="p-1 text-left border-b">Facility</th>
              <th className="p-1 text-left border-b">Metric</th>
              <th className="p-1 text-left border-b">Type</th>
              <th className="p-1 text-left border-b">Value</th>
              <th className="p-1 text-left border-b">State Avg</th>
              <th className="p-1 text-left border-b">Nat'l Avg</th>
              <th className="p-1 text-left border-b">Source</th>
            </tr>
          </thead>
          <tbody>
            {metrics.slice(0, 200).map((m) => (
              <tr key={m.id} className="border-b border-border/30">
                <td className="p-1">
                  {facilityMap[m.facility_id]?.name ??
                    m.facility_id.slice(0, 8)}
                </td>
                <td className="p-1">{m.metric_name}</td>
                <td className="p-1">{m.metric_type}</td>
                <td className="p-1">
                  {m.value ?? "–"}
                  {m.unit ? ` ${m.unit}` : ""}
                </td>
                <td className="p-1">{m.state_average ?? "–"}</td>
                <td className="p-1">{m.national_average ?? "–"}</td>
                <td className="p-1">{m.data_source ?? "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {metrics.length > 200 && (
          <p className="text-[10px] text-muted-foreground mt-1">
            Showing first 200 of {metrics.length} metrics.
          </p>
        )}
      </Section>

      {/* ── 8. COMMUNITY RESOURCES ── */}
      <Section title={`8. Community Resources (${resources.length} total)`}>
        <Note>
          The live site has filter tabs by resource type (
          {resourceTypes.join(", ") || "various types"}), search input, and
          expandable cards with contact info, hours, eligibility, and services
          offered.
        </Note>
        <table className="w-full text-[10px] border border-border">
          <thead>
            <tr className="bg-muted">
              <th className="p-1 text-left border-b">Resource</th>
              <th className="p-1 text-left border-b">Type</th>
              <th className="p-1 text-left border-b">Organization</th>
              <th className="p-1 text-left border-b">City</th>
              <th className="p-1 text-left border-b">County</th>
              <th className="p-1 text-left border-b">Free</th>
              <th className="p-1 text-left border-b">Phone</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((r) => (
              <tr key={r.id} className="border-b border-border/30">
                <td className="p-1 font-medium">{r.resource_name}</td>
                <td className="p-1">{r.resource_type}</td>
                <td className="p-1">{r.organization ?? "–"}</td>
                <td className="p-1">{r.city}</td>
                <td className="p-1">{r.county}</td>
                <td className="p-1">{r.is_free ? "Yes" : "No"}</td>
                <td className="p-1">{r.phone ?? "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* ── 9. HEALTH CONDITIONS ── */}
      <Section title="9. Health Conditions">
        <p>
          Static informational page providing health condition overviews,
          symptoms, and links to relevant care options within the platform.
          Content is curated editorial material, not database-driven.
        </p>
        <Note>
          The live page has expandable accordion sections for each condition,
          with internal links to Find Care filtered by relevant specialty.
        </Note>
      </Section>

      {/* ── 10. INTERACTIVE ELEMENTS SUMMARY ── */}
      <Section title="10. Interactive Elements Summary">
        <p className="mb-2">
          Comprehensive list of all interactive UI elements across the site:
        </p>
        <table className="w-full text-[10px] border border-border">
          <thead>
            <tr className="bg-muted">
              <th className="p-1 text-left border-b">Page</th>
              <th className="p-1 text-left border-b">Element</th>
              <th className="p-1 text-left border-b">Type</th>
              <th className="p-1 text-left border-b">Behavior</th>
            </tr>
          </thead>
          <tbody>
            {[
              [
                "Home",
                "Search input",
                "Text input",
                "Filters featured topics in real-time",
              ],
              [
                "Home",
                "Quick action cards",
                "Link cards",
                "Navigate to internal pages",
              ],
              ["Home", "Stats bar", "Display", "Shows aggregate DB counts"],
              [
                "Find Care",
                "Facility type filter",
                "Dropdown (Select)",
                "Filters facilities by type",
              ],
              [
                "Find Care",
                "County filter",
                "Dropdown (Select)",
                "Filters facilities by county",
              ],
              [
                "Find Care",
                "Search input",
                "Text input",
                "Searches facility names",
              ],
              [
                "Find Care",
                "Telehealth toggle",
                "Switch",
                "Filters telehealth-enabled facilities",
              ],
              [
                "Find Care",
                "Walk-in toggle",
                "Switch",
                "Filters walk-in facilities",
              ],
              [
                "Find Care",
                "Accepting patients toggle",
                "Switch",
                "Filters accepting-new-patients",
              ],
              [
                "Find Care",
                "Facility cards",
                "Clickable cards",
                "Shows facility details",
              ],
              [
                "Find Care",
                "Provider search",
                "Text input",
                "Searches providers by name/specialty",
              ],
              [
                "Find Care",
                "Specialty filter",
                "Dropdown (Select)",
                "Filters providers by specialty",
              ],
              [
                "Find Care",
                "Language filter",
                "Dropdown (Select)",
                "Filters providers by language",
              ],
              [
                "Health Map",
                "Map canvas",
                "Leaflet map",
                "Pan/zoom, click pins for popups",
              ],
              [
                "Health Map",
                "Layer toggles",
                "Checkboxes",
                "Show/hide facility type layers",
              ],
              [
                "Health Map",
                "Legend",
                "Display panel",
                "Color key for facility types",
              ],
              [
                "Financial Help",
                "Program type tabs",
                "Tab buttons",
                "Filter programs by type",
              ],
              [
                "Financial Help",
                "Program cards",
                "Expandable cards",
                "Show/hide full details",
              ],
              [
                "Quality",
                "Metric type filter",
                "Dropdown/tabs",
                "Filter metrics by type",
              ],
              [
                "Quality",
                "Facility selector",
                "Dropdown (Select)",
                "Filter metrics by facility",
              ],
              [
                "Quality",
                "Charts",
                "Recharts",
                "Hover for tooltips, compare to averages",
              ],
              [
                "Resources",
                "Resource type tabs",
                "Tab buttons",
                "Filter resources by type",
              ],
              [
                "Resources",
                "Search input",
                "Text input",
                "Search resource names",
              ],
              [
                "Resources",
                "Resource cards",
                "Expandable cards",
                "Show contact/eligibility details",
              ],
              [
                "Conditions",
                "Condition accordions",
                "Accordion",
                "Expand/collapse condition info",
              ],
              [
                "All pages",
                "Header navigation",
                "Nav links",
                "Route to all pages",
              ],
              [
                "All pages",
                "Footer links",
                "Link list",
                "Route to pages + external links",
              ],
              [
                "All pages",
                "Mobile menu",
                "Sheet/drawer",
                "Hamburger menu on mobile",
              ],
            ].map(([page, element, type, behavior], i) => (
              <tr key={i} className="border-b border-border/30">
                <td className="p-1">{page}</td>
                <td className="p-1 font-medium">{element}</td>
                <td className="p-1">{type}</td>
                <td className="p-1">{behavior}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* ── 11. DATA SCHEMA ── */}
      <Section title="11. Data Schema Summary">
        <p className="mb-2">
          All database tables are public read-only (RLS: SELECT only, no
          writes). No user authentication or personal data collection.
        </p>
        {[
          {
            name: "facilities",
            cols: "id, name, facility_type, address, city, county, state, zip, phone, website, hours, latitude, longitude, quality_score, services[], specialties[], insurance_accepted[], languages[], telehealth_available, walk_in, accepting_new_patients, wheelchair_accessible, public_transit, system_affiliation, leapfrog_grade, is_magnet, is_blue_distinction, joint_commission, digital_capabilities",
          },
          {
            name: "providers",
            cols: "id, first_name, last_name, title, specialty, subspecialty, facility_id→facilities, patient_rating, board_certified, accepting_new_patients, telehealth_available, years_experience, languages[], medical_school, gender, photo_url",
          },
          {
            name: "quality_metrics",
            cols: "id, facility_id→facilities, metric_name, metric_type, value, unit, state_average, national_average, period, data_source",
          },
          {
            name: "financial_programs",
            cols: "id, program_name, program_type, organization, description, eligibility_criteria (JSON), fpl_threshold, how_to_apply, phone, application_url, services_covered[], coverage_area, is_active",
          },
          {
            name: "community_resources",
            cols: "id, resource_name, resource_type, organization, description, address, city, county, state, zip, phone, website, hours, eligibility_notes, languages[], is_free, accepts_insurance, walk_in_available, services_offered[], is_active",
          },
        ].map((t) => (
          <div
            key={t.name}
            className="mb-2 text-[10px] print:break-inside-avoid"
          >
            <p className="font-semibold font-mono">{t.name}</p>
            <p className="text-muted-foreground">{t.cols}</p>
          </div>
        ))}
      </Section>

      {/* Footer */}
      <div className="text-center text-[10px] text-muted-foreground border-t border-border pt-4 mt-8">
        <p>
          Access Michigan - Site Report - Generated{" "}
          {new Date().toLocaleString()}
        </p>
        <p>
          This document is for review purposes. All data is publicly available
          civic infrastructure.
        </p>
      </div>
    </div>
  );
}
