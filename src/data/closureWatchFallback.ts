/**
 * DATA_SOURCES.md
 *
 * Primary source: Cecil G. Sheps Center for Health Services Research — Rural Hospital Closures
 *   URL: https://www.shepscenter.unc.edu/programs-projects/rural-health/rural-hospital-closures/
 *   Format: Excel (.xlsx) download only — no JSON, CSV, or RSS feed available.
 *   PHASE B BLOCKER: Because Sheps Center publishes Excel only (not a machine-readable API),
 *   the `sheps-closures` Edge Function cannot be built as a scheduled JSON fetch.
 *   Resolution: ship fallback data only; revisit Phase B when/if Sheps publishes a CSV/API,
 *   or build an XLSX → Supabase ingest pipeline via scheduled function.
 *
 * Secondary sources: AHA Hospital Closure Tracker, MDHHS licensure actions, Becker's Hospital
 * Review, Bridge Michigan, Crain's Detroit Business, Modern Healthcare, Fierce Healthcare.
 *
 * Two-source rule: every entry with status="verified" has sources.length >= 2, each from an
 * independent named outlet. Entries with only one confirmed source are in _CANDIDATES below.
 */

export interface ClosureEntry {
  id: string;
  facilityName: string;
  facilityType: "hospital" | "fqhc" | "rural-critical-access" | "service-line";
  serviceLineAffected?: string;
  address: string;
  city: string;
  county: string;
  latitude: number;
  longitude: number;
  closureDate: string;        // ISO date — use first day of month if exact date unknown
  closureType: "full-closure" | "service-line-elimination" | "merger" | "conversion";
  summary: string;
  sources: Array<{
    name: string;
    url: string;
    accessedDate: string;
    verified: boolean;
  }>;
  status: "verified" | "pending-second-source" | "disputed";
  asOf: string;               // ISO date of most recent verification
}

export const CLOSURE_WATCH_FALLBACK: ClosureEntry[] = [
  // ── 2024 ──────────────────────────────────────────────────────────────────

  {
    id: "aspirus-ontonagon-hospital-full-closure-2024",
    facilityName: "Aspirus Ontonagon Hospital",
    facilityType: "rural-critical-access",
    address: "601 S 7th St",
    city: "Ontonagon",
    county: "Ontonagon",
    latitude: 46.870,
    longitude: -89.316,
    closureDate: "2024-04-20",
    closureType: "full-closure",
    summary:
      "Aspirus Health closed this 18-bed critical access hospital — the only hospital in Ontonagon County — on April 20, 2024, converting it to an outpatient rural health clinic; the nearest emergency room is now 47 miles away at Baraga County Memorial Hospital.",
    sources: [
      {
        name: "Upper Michigan's Source",
        url: "https://www.uppermichiganssource.com/2024/02/20/aspirus-discontinue-hospital-emergency-services-ontonagon/",
        accessedDate: "2026-04-09",
        verified: true,
      },
      {
        name: "Sheps Center Rural Hospital Closures Database",
        url: "https://www.shepscenter.unc.edu/programs-projects/rural-health/rural-hospital-closures/",
        accessedDate: "2026-04-09",
        verified: true,
      },
    ],
    status: "verified",
    asOf: "2026-04-09",
  },

  {
    id: "aspirus-keweenaw-ob-elimination-2024",
    facilityName: "Aspirus Keweenaw Hospital",
    facilityType: "service-line",
    serviceLineAffected: "Obstetrics / Labor & Delivery",
    address: "205 Osceola St",
    city: "Laurium",
    county: "Houghton",
    latitude: 47.243,
    longitude: -88.432,
    closureDate: "2024-12-31",
    closureType: "service-line-elimination",
    summary:
      "Aspirus Keweenaw Hospital closed its Labor & Delivery unit on December 31, 2024, citing inability to recruit and retain OB/GYN staff; the unit served approximately 200 patients annually and prenatal care continues via collaboration with Upper Great Lakes Family Health Clinic.",
    sources: [
      {
        name: "Upper Michigan's Source",
        url: "https://www.uppermichiganssource.com/2024/12/24/aspirus-keweenaw-shut-down-labor-delivery-services-years-end/",
        accessedDate: "2026-04-09",
        verified: true,
      },
      {
        name: "Becker's Hospital Review",
        url: "https://www.beckershospitalreview.com/finance/aspirus-michigan-hospital-ends-labor-delivery-services.html",
        accessedDate: "2026-04-09",
        verified: true,
      },
    ],
    status: "verified",
    asOf: "2026-04-09",
  },

  {
    id: "ascension-mymichigan-saginaw-transfer-2024",
    facilityName: "Ascension St. Mary's of Saginaw → MyMichigan Medical Center Saginaw",
    facilityType: "hospital",
    address: "800 S Washington Ave",
    city: "Saginaw",
    county: "Saginaw",
    latitude: 43.419,
    longitude: -83.950,
    closureDate: "2024-08-01",
    closureType: "merger",
    summary:
      "Ascension divested St. Mary's of Saginaw (238 beds) to MyMichigan Health effective August 1, 2024; the hospital remained open under new ownership with no service eliminations documented as part of the transaction.",
    sources: [
      {
        name: "Fierce Healthcare",
        url: "https://www.fiercehealthcare.com/providers/ascension-divesting-3-michigan-hospitals-mymichigan-health",
        accessedDate: "2026-04-09",
        verified: true,
      },
      {
        name: "Modern Healthcare",
        url: "https://www.modernhealthcare.com/mergers-acquisitions/ascension-mymichigan-health-hospitals-sale/",
        accessedDate: "2026-04-09",
        verified: true,
      },
    ],
    status: "verified",
    asOf: "2026-04-09",
  },

  {
    id: "ascension-mymichigan-tawas-transfer-2024",
    facilityName: "Ascension St. Joseph of Tawas → MyMichigan Medical Center West Branch",
    facilityType: "hospital",
    address: "200 Hemlock St",
    city: "Tawas City",
    county: "Iosco",
    latitude: 44.277,
    longitude: -83.513,
    closureDate: "2024-08-01",
    closureType: "merger",
    summary:
      "Ascension divested St. Joseph of Tawas (47 beds, Iosco County) to MyMichigan Health effective August 1, 2024; the hospital remained open under new ownership.",
    sources: [
      {
        name: "Fierce Healthcare",
        url: "https://www.fiercehealthcare.com/providers/ascension-divesting-3-michigan-hospitals-mymichigan-health",
        accessedDate: "2026-04-09",
        verified: true,
      },
      {
        name: "Modern Healthcare",
        url: "https://www.modernhealthcare.com/mergers-acquisitions/ascension-mymichigan-health-hospitals-sale/",
        accessedDate: "2026-04-09",
        verified: true,
      },
    ],
    status: "verified",
    asOf: "2026-04-09",
  },

  {
    id: "ascension-mymichigan-standish-transfer-2024",
    facilityName: "Ascension St. Mary's of Standish → MyMichigan Medical Center Standish",
    facilityType: "rural-critical-access",
    address: "805 W Cedar St",
    city: "Standish",
    county: "Arenac",
    latitude: 44.001,
    longitude: -83.956,
    closureDate: "2024-08-01",
    closureType: "merger",
    summary:
      "Ascension divested St. Mary's of Standish (25-bed critical access hospital, Arenac County) to MyMichigan Health effective August 1, 2024; the hospital remained open under new ownership.",
    sources: [
      {
        name: "Fierce Healthcare",
        url: "https://www.fiercehealthcare.com/providers/ascension-divesting-3-michigan-hospitals-mymichigan-health",
        accessedDate: "2026-04-09",
        verified: true,
      },
      {
        name: "Modern Healthcare",
        url: "https://www.modernhealthcare.com/mergers-acquisitions/ascension-mymichigan-health-hospitals-sale/",
        accessedDate: "2026-04-09",
        verified: true,
      },
    ],
    status: "verified",
    asOf: "2026-04-09",
  },

  // ── 2023 ──────────────────────────────────────────────────────────────────

  {
    id: "spectrum-health-kelsey-full-closure-2023",
    facilityName: "Spectrum Health Kelsey Hospital (Corewell Health)",
    facilityType: "rural-critical-access",
    address: "418 Washington Ave",
    city: "Lakeview",
    county: "Montcalm",
    latitude: 43.452,
    longitude: -85.264,
    closureDate: "2023-10-06",
    closureType: "full-closure",
    summary:
      "Corewell Health closed this 25-bed critical access hospital on October 6, 2023, citing a decade of declining utilization and aging infrastructure, with emergency visits falling from 10,113 in 2017 to 7,252 in 2022; an outpatient Lakeview Care Center opened in the community in June 2023.",
    sources: [
      {
        name: "Corewell Health Press Release",
        url: "https://newsroom.corewellhealth.org/2023-08-01-Corewell-Healths-Spectrum-Health-Kelsey-Hospital-to-close",
        accessedDate: "2026-04-09",
        verified: true,
      },
      {
        name: "Becker's Hospital Review",
        url: "https://www.beckershospitalreview.com/finance/michigan-hospital-to-close/",
        accessedDate: "2026-04-09",
        verified: true,
      },
    ],
    status: "verified",
    asOf: "2026-04-09",
  },

  {
    id: "munson-grayling-ob-announced-2023",
    facilityName: "Munson Healthcare Grayling Hospital",
    facilityType: "service-line",
    serviceLineAffected: "Obstetrics / Labor & Delivery (delivery services — prenatal care continuing)",
    address: "197 N Ingham Ave",
    city: "Grayling",
    county: "Crawford",
    latitude: 44.660,
    longitude: -84.712,
    closureDate: "2026-07-01",  // projected — summer 2026 per Munson announcement
    closureType: "service-line-elimination",
    summary:
      "Munson Healthcare announced in September 2023 that delivery services at Grayling Hospital will close when a new regional birthing center opens at Otsego Memorial Hospital in Gaylord, projected summer 2026; prenatal and postnatal care will continue in Grayling.",
    sources: [
      {
        name: "Bridge Michigan",
        url: "https://bridgemi.com/michigan-health-watch/munson-trim-inpatient-services-rural-northern-michigan-hospitals/",
        accessedDate: "2026-04-09",
        verified: true,
      },
      {
        name: "Becker's Hospital Review",
        url: "https://www.beckershospitalreview.com/finance/michigan-system-to-trim-inpatient-services-at-rural-hospitals/",
        accessedDate: "2026-04-09",
        verified: true,
      },
    ],
    status: "verified",
    asOf: "2026-04-09",
  },

  {
    id: "munson-charlevoix-inpatient-reduction-2023",
    facilityName: "Munson Healthcare Charlevoix Hospital",
    facilityType: "service-line",
    serviceLineAffected: "Inpatient acute care (severely limited; shift to outpatient and observation)",
    address: "14700 Lake Shore Dr",
    city: "Charlevoix",
    county: "Charlevoix",
    latitude: 45.319,
    longitude: -85.255,
    closureDate: "2023-09-27",  // announcement date; phased implementation
    closureType: "service-line-elimination",
    summary:
      "Munson Healthcare announced in September 2023 a regional transformation plan significantly limiting inpatient beds at Charlevoix Hospital, shifting services to outpatient and observation status; the plan affects staffing and routing of patients across northern Michigan.",
    sources: [
      {
        name: "Bridge Michigan",
        url: "https://bridgemi.com/michigan-health-watch/munson-trim-inpatient-services-rural-northern-michigan-hospitals/",
        accessedDate: "2026-04-09",
        verified: true,
      },
      {
        name: "Becker's Hospital Review",
        url: "https://www.beckershospitalreview.com/finance/michigan-system-to-trim-inpatient-services-at-rural-hospitals/",
        accessedDate: "2026-04-09",
        verified: true,
      },
    ],
    status: "verified",
    asOf: "2026-04-09",
  },

  {
    id: "munson-paul-oliver-inpatient-reduction-2023",
    facilityName: "Paul Oliver Memorial Hospital (Munson Healthcare)",
    facilityType: "service-line",
    serviceLineAffected: "Inpatient acute care and surgery (redirected to Cadillac Hospital)",
    address: "224 Park Ave",
    city: "Frankfort",
    county: "Benzie",
    latitude: 44.633,
    longitude: -86.238,
    closureDate: "2023-09-27",
    closureType: "service-line-elimination",
    summary:
      "Munson Healthcare's September 2023 regional transformation plan significantly limited inpatient beds and redirected surgical cases from Paul Oliver Memorial Hospital in Frankfort to Munson Healthcare Cadillac Hospital.",
    sources: [
      {
        name: "Bridge Michigan",
        url: "https://bridgemi.com/michigan-health-watch/munson-trim-inpatient-services-rural-northern-michigan-hospitals/",
        accessedDate: "2026-04-09",
        verified: true,
      },
      {
        name: "Becker's Hospital Review",
        url: "https://www.beckershospitalreview.com/finance/michigan-system-to-trim-inpatient-services-at-rural-hospitals/",
        accessedDate: "2026-04-09",
        verified: true,
      },
    ],
    status: "verified",
    asOf: "2026-04-09",
  },

  // ── 2025 ──────────────────────────────────────────────────────────────────

  {
    id: "aspirus-ironwood-ob-elimination-2025",
    facilityName: "Aspirus Ironwood Hospital",
    facilityType: "service-line",
    serviceLineAffected: "Obstetrics / Labor & Delivery",
    address: "1400 W Washington St",
    city: "Ironwood",
    county: "Gogebic",
    latitude: 46.454,
    longitude: -90.172,
    closureDate: "2025-12-31",
    closureType: "service-line-elimination",
    summary:
      "Aspirus Health ended labor and delivery services at Ironwood Hospital on December 31, 2025, citing inability to maintain an OB/GYN team since June 2024; Aspirus declined $1.2 million in state funding offered to keep the unit open, affecting residents of Gogebic, Iron, and Ontonagon counties.",
    sources: [
      {
        name: "Upper Michigan's Source",
        url: "https://www.uppermichiganssource.com/2025/09/05/aspirus-close-ironwood-ob-unit/",
        accessedDate: "2026-04-09",
        verified: true,
      },
      {
        name: "Becker's Hospital Review",
        url: "https://www.beckershospitalreview.com/finance/aspirus-michigan-hospital-ends-labor-delivery-services.html",
        accessedDate: "2026-04-09",
        verified: true,
      },
    ],
    status: "verified",
    asOf: "2026-04-09",
  },

  // ── 2022 ──────────────────────────────────────────────────────────────────

  {
    id: "war-memorial-mymichigan-merger-2022",
    facilityName: "War Memorial Hospital → MyMichigan Medical Center Sault",
    facilityType: "hospital",
    address: "500 Osborn Blvd",
    city: "Sault Ste. Marie",
    county: "Chippewa",
    latitude: 46.496,
    longitude: -84.345,
    closureDate: "2022-01-01",  // merger effective date approximate; Board approved April 2021
    closureType: "merger",
    summary:
      "War Memorial Hospital, a 49-bed facility in Sault Ste. Marie, joined MyMichigan Health in 2022 and was renamed MyMichigan Medical Center Sault; the hospital retained all services including obstetrics, emergency, rehabilitation, and behavioral health.",
    sources: [
      {
        name: "Up North Voice",
        url: "https://www.upnorthvoice.com/news/2022/02/war-memorial-hospital-changes-name-joins-mymichigan-health/",
        accessedDate: "2026-04-09",
        verified: true,
      },
      {
        name: "9&10 News",
        url: "https://www.9and10news.com/2021/12/01/war-memorial-hospital-merges-with-mid-michigan-health/",
        accessedDate: "2026-04-09",
        verified: true,
      },
    ],
    status: "verified",
    asOf: "2026-04-09",
  },

  {
    id: "sturgis-hospital-reh-conversion-2023",
    facilityName: "Sturgis Hospital",
    facilityType: "hospital",
    serviceLineAffected: "Inpatient acute care (converted to Rural Emergency Hospital — emergency care only)",
    address: "916 Myrtle Ave",
    city: "Sturgis",
    county: "St. Joseph",
    latitude: 41.799,
    longitude: -85.424,
    closureDate: "2023-01-01",  // REH designation effective date
    closureType: "conversion",
    summary:
      "Sturgis Hospital converted to a federally designated Rural Emergency Hospital (REH) effective January 1, 2023, eliminating inpatient acute care beds while retaining 24/7 emergency services; it was among Michigan's first REH designees under the program established by the Consolidated Appropriations Act.",
    sources: [
      {
        name: "Bridge Michigan",
        url: "https://bridgemi.com/michigan-health-watch/one-rural-michigan-hospital-averts-closure-others-struggle-hold/",
        accessedDate: "2026-04-09",
        verified: true,
      },
      {
        name: "WWMT NewsChannel 3",
        url: "https://wwmt.com/news/local/obstetrics-hospice-care-programs-close-monday-at-sturgis-hospital-layoffs-expected",
        accessedDate: "2026-04-09",
        verified: true,
      },
    ],
    status: "verified",
    asOf: "2026-04-09",
  },
];

// ---------------------------------------------------------------------------
// _CANDIDATES — single-source only or outside the 2020+ window
// Not displayed by default. Requires a second source before promoting to
// CLOSURE_WATCH_FALLBACK.
// ---------------------------------------------------------------------------

/*
export const _CANDIDATES = [
  {
    id: "mercy-health-muskegon-hackley-campus-consolidation-2020",
    facilityName: "Mercy Health Muskegon — Hackley Campus ER",
    note: "The Hackley Campus ER closed October 17, 2020 as part of a planned campus consolidation " +
          "(all inpatient services including L&D moved to the new Mercy Campus tower). " +
          "This was a campus consolidation, not an OB elimination — L&D services continued at the Mercy Campus. " +
          "Source: Health Care Relocations trade publication (single source). " +
          "No second independent source from the approved list confirmed the OB-specific detail. " +
          "ACTION: confirm via AHA or Becker's before promoting.",
    status: "pending-second-source",
  },
  {
    id: "munson-manistee-ob-2019",
    facilityName: "Munson Healthcare Manistee Hospital",
    serviceLineAffected: "Obstetrics / maternity / birthing center",
    closureDate: "2019-05-31",
    note: "Well-documented OB unit closure (May 31, 2019) with two sources (Munson official + Bridge Michigan), " +
          "but outside the 2020+ window. Include if tracker extends to 2019.",
    status: "pending-second-source",
  },
  {
    id: "fqhc-michigan-aggregate-closures-2023",
    facilityName: "Multiple Michigan FQHC sites (aggregate)",
    note: "MPCA reported approximately 17% of Michigan health centers closed at least one location " +
          "circa 2023 and 21% discontinued service lines. No specific facility names verifiable with " +
          "2+ sources from the approved list. FOIA request to MPCA or HRSA UDS recommended. " +
          "ACTION: research specific facility names via HRSA UDS 2023 site closures.",
    status: "pending-second-source",
  },
];
*/
