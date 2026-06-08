// Dual-Eligible Exposure - county fallback data
// Computed: 2026-04-09
// Feature: V3 Feature 3 - "Two programs, shared geography"
//
// FRAMING ANCHOR:
//   "Dual-eligible residents are exempt from P.L. 119-21 work requirements.
//    This map shows where they live."
//   Dual-eligible individuals enroll through aged (65+) or disabled pathways,
//   not ACA expansion. P.L. 119-21 §71119 work requirements apply only to
//   expansion enrollees ages 19–64. Do NOT frame this as overlapping or additive risk.
//
// COUNTY ALLOCATION METHOD:
//   1. ACS B27010 5-year 2023, variables:
//        B27010_046E - ages 35–64: simultaneous Medicare + Medicaid/means-tested coverage
//        B27010_062E - ages 65+:   simultaneous Medicare + Medicaid/means-tested coverage
//      API: https://api.census.gov/data/2023/acs/acs5?get=NAME,B27010_046E,B27010_062E&for=county:*&in=state:26
//      Fetched: April 2026. All 83 Michigan counties returned clean values.
//   2. acsDualEstimate = B27010_046E + B27010_062E per county
//   3. countyShare = acsDualEstimate / sum(all county acsDualEstimates) = 216,635
//   4. allocatedLow  = Math.max(1, Math.round(335,000 × countyShare))
//   5. allocatedHigh = Math.max(1, Math.round(405,000 × countyShare))
//
// IMPORTANT CAVEATS:
//   - ACS B27010 is a survey estimate with margins of error. Small-county figures
//     (Keweenaw, Luce, Ontonagon, Schoolcraft) have high relative MoE (20–50%).
//   - ACS captures simultaneous survey-reported coverage, not the CMS administrative
//     "dual-eligible" category. ACS underestimates administrative enrollment - the
//     ACS statewide total (216,635) is roughly 53% of the MACPAC administrative
//     figure (405,000). County shares, not absolute ACS values, drive the allocation.
//   - The statewide display range (335,000–405,000) combines MACPAC 2022 and KFF
//     2024/2025 administrative figures. ACS county shares distribute this range.
//   - CMS MMCO Enrollment Snapshots would be the authoritative county-level source
//     but require quarterly ZIP file downloads. ACS is used here for proportional
//     allocation only.
//
// STATEWIDE SOURCE RANGE:
//   - MACPAC Data Book December 2025 (CY 2022): 405,000 Michigan dual-eligibles
//     (360,000 full-benefit + 45,000 partial-benefit)
//     Source: https://www.macpac.gov/wp-content/uploads/2025/12/Dec25_MedPAC_MACPAC_DualsDataBook-WEB508-FINAL.pdf
//   - KFF State Health Facts 2024 (March enrollment): 353,820 Michigan dual-eligibles
//     Source: https://www.kff.org/state-health-policy-data/state-indicator/number-of-dual-eligible-individuals/
//   - KFF State Health Facts 2025 (January enrollment): 334,716 Michigan dual-eligibles
//     Source: same KFF URL - live, verified April 2026
//
// See /methodology/dual-eligible-exposure for full methodology.

// ── Constants ──────────────────────────────────────────────────────────────────

export const MACPAC_MICHIGAN_DUAL_TOTAL_2022 = 405_000;
export const KFF_MICHIGAN_DUAL_TOTAL_2024 = 353_820;
export const KFF_MICHIGAN_DUAL_TOTAL_2025 = 334_716;
export const DISPLAY_RANGE_LOW = 335_000;
export const DISPLAY_RANGE_HIGH = 405_000;

// ── Raw ACS county data ────────────────────────────────────────────────────────
// Source: ACS 2023 5-year, B27010_046E + B27010_062E per county. All 83 counties
// returned clean (no suppressed values). Fetched April 2026.

interface DualEligibleAcsEntry {
  county: string;
  fips: string;
  acsDualEstimate: number; // B27010_046E + B27010_062E
}

const DUAL_ELIGIBLE_ACS_COUNTY: DualEligibleAcsEntry[] = [
  { county: "Alcona", fips: "26001", acsDualEstimate: 255 },   // B27010_046E=142 + B27010_062E=113
  { county: "Alger", fips: "26003", acsDualEstimate: 193 },    // 106 + 87
  { county: "Allegan", fips: "26005", acsDualEstimate: 1764 }, // 816 + 948
  { county: "Alpena", fips: "26007", acsDualEstimate: 1256 },  // 845 + 411
  { county: "Antrim", fips: "26009", acsDualEstimate: 423 },   // 153 + 270
  { county: "Arenac", fips: "26011", acsDualEstimate: 550 },   // 304 + 246
  { county: "Baraga", fips: "26013", acsDualEstimate: 227 },   // 56 + 171
  { county: "Barry", fips: "26015", acsDualEstimate: 989 },    // 478 + 511
  { county: "Bay", fips: "26017", acsDualEstimate: 2795 },     // 1191 + 1604
  { county: "Benzie", fips: "26019", acsDualEstimate: 467 },   // 178 + 289
  { county: "Berrien", fips: "26021", acsDualEstimate: 3692 }, // 1420 + 2272
  { county: "Branch", fips: "26023", acsDualEstimate: 778 },   // 397 + 381
  { county: "Calhoun", fips: "26025", acsDualEstimate: 4118 }, // 2060 + 2058
  { county: "Cass", fips: "26027", acsDualEstimate: 1218 },    // 539 + 679
  { county: "Charlevoix", fips: "26029", acsDualEstimate: 359 }, // 191 + 168
  { county: "Cheboygan", fips: "26031", acsDualEstimate: 622 }, // 336 + 286
  { county: "Chippewa", fips: "26033", acsDualEstimate: 779 }, // 313 + 466
  { county: "Clare", fips: "26035", acsDualEstimate: 1231 },   // 719 + 512
  { county: "Clinton", fips: "26037", acsDualEstimate: 571 },  // 370 + 201
  { county: "Crawford", fips: "26039", acsDualEstimate: 393 }, // 284 + 109
  { county: "Delta", fips: "26041", acsDualEstimate: 1059 },   // 533 + 526
  { county: "Dickinson", fips: "26043", acsDualEstimate: 479 }, // 160 + 319
  { county: "Eaton", fips: "26045", acsDualEstimate: 1639 },   // 751 + 888
  { county: "Emmet", fips: "26047", acsDualEstimate: 713 },    // 240 + 473
  { county: "Genesee", fips: "26049", acsDualEstimate: 11315 }, // 6436 + 4879
  { county: "Gladwin", fips: "26051", acsDualEstimate: 864 },  // 488 + 376
  { county: "Gogebic", fips: "26053", acsDualEstimate: 513 },  // 206 + 307
  { county: "Grand Traverse", fips: "26055", acsDualEstimate: 1635 }, // 710 + 925
  { county: "Gratiot", fips: "26057", acsDualEstimate: 530 },  // 265 + 265
  { county: "Hillsdale", fips: "26059", acsDualEstimate: 875 }, // 372 + 503
  { county: "Houghton", fips: "26061", acsDualEstimate: 564 }, // 251 + 313
  { county: "Huron", fips: "26063", acsDualEstimate: 780 },    // 380 + 400
  { county: "Ingham", fips: "26065", acsDualEstimate: 4893 },  // 2323 + 2570
  { county: "Ionia", fips: "26067", acsDualEstimate: 1253 },   // 519 + 734
  { county: "Iosco", fips: "26069", acsDualEstimate: 967 },    // 535 + 432
  { county: "Iron", fips: "26071", acsDualEstimate: 401 },     // 183 + 218
  { county: "Isabella", fips: "26073", acsDualEstimate: 979 }, // 578 + 401
  { county: "Jackson", fips: "26075", acsDualEstimate: 3364 }, // 1707 + 1657
  { county: "Kalamazoo", fips: "26077", acsDualEstimate: 3796 }, // 1869 + 1927
  { county: "Kalkaska", fips: "26079", acsDualEstimate: 479 }, // 241 + 238
  { county: "Kent", fips: "26081", acsDualEstimate: 10843 },   // 5155 + 5688
  { county: "Keweenaw", fips: "26083", acsDualEstimate: 50 },  // 39 + 11 - high relative MoE; treat as illustrative
  { county: "Lake", fips: "26085", acsDualEstimate: 640 },     // 223 + 417
  { county: "Lapeer", fips: "26087", acsDualEstimate: 1584 },  // 690 + 894
  { county: "Leelanau", fips: "26089", acsDualEstimate: 203 }, // 81 + 122
  { county: "Lenawee", fips: "26091", acsDualEstimate: 1756 }, // 1029 + 727
  { county: "Livingston", fips: "26093", acsDualEstimate: 1824 }, // 725 + 1099
  { county: "Luce", fips: "26095", acsDualEstimate: 186 },     // 89 + 97 - high relative MoE
  { county: "Mackinac", fips: "26097", acsDualEstimate: 324 }, // 188 + 136
  { county: "Macomb", fips: "26099", acsDualEstimate: 18598 }, // 7801 + 10797
  { county: "Manistee", fips: "26101", acsDualEstimate: 711 }, // 247 + 464
  { county: "Marquette", fips: "26103", acsDualEstimate: 909 }, // 444 + 465
  { county: "Mason", fips: "26105", acsDualEstimate: 819 },    // 382 + 437
  { county: "Mecosta", fips: "26107", acsDualEstimate: 917 },  // 548 + 369
  { county: "Menominee", fips: "26109", acsDualEstimate: 653 }, // 382 + 271
  { county: "Midland", fips: "26111", acsDualEstimate: 1672 }, // 707 + 965
  { county: "Missaukee", fips: "26113", acsDualEstimate: 425 }, // 191 + 234
  { county: "Monroe", fips: "26115", acsDualEstimate: 2436 },  // 1362 + 1074
  { county: "Montcalm", fips: "26117", acsDualEstimate: 1482 }, // 809 + 673
  { county: "Montmorency", fips: "26119", acsDualEstimate: 437 }, // 278 + 159
  { county: "Muskegon", fips: "26121", acsDualEstimate: 4968 }, // 2695 + 2273
  { county: "Newaygo", fips: "26123", acsDualEstimate: 1767 }, // 1023 + 744
  { county: "Oakland", fips: "26125", acsDualEstimate: 19110 }, // 6677 + 12433
  { county: "Oceana", fips: "26127", acsDualEstimate: 683 },   // 284 + 399
  { county: "Ogemaw", fips: "26129", acsDualEstimate: 695 },   // 360 + 335
  { county: "Ontonagon", fips: "26131", acsDualEstimate: 189 }, // 92 + 97 - high relative MoE
  { county: "Osceola", fips: "26133", acsDualEstimate: 791 },  // 436 + 355
  { county: "Oscoda", fips: "26135", acsDualEstimate: 292 },   // 127 + 165
  { county: "Otsego", fips: "26137", acsDualEstimate: 620 },   // 276 + 344
  { county: "Ottawa", fips: "26139", acsDualEstimate: 2803 },  // 1204 + 1599
  { county: "Presque Isle", fips: "26141", acsDualEstimate: 388 }, // 233 + 155
  { county: "Roscommon", fips: "26143", acsDualEstimate: 657 }, // 271 + 386
  { county: "Saginaw", fips: "26145", acsDualEstimate: 4631 }, // 2279 + 2352
  { county: "St. Clair", fips: "26147", acsDualEstimate: 3246 }, // 1656 + 1590
  { county: "St. Joseph", fips: "26149", acsDualEstimate: 1544 }, // 920 + 624
  { county: "Sanilac", fips: "26151", acsDualEstimate: 836 },  // 443 + 393
  { county: "Schoolcraft", fips: "26153", acsDualEstimate: 198 }, // 103 + 95 - high relative MoE
  { county: "Shiawassee", fips: "26155", acsDualEstimate: 1360 }, // 891 + 469
  { county: "Tuscola", fips: "26157", acsDualEstimate: 1734 }, // 1045 + 689
  { county: "Van Buren", fips: "26159", acsDualEstimate: 1775 }, // 816 + 959
  { county: "Washtenaw", fips: "26161", acsDualEstimate: 4532 }, // 1775 + 2757
  { county: "Wayne", fips: "26163", acsDualEstimate: 56727 },  // 22621 + 34106
  { county: "Wexford", fips: "26165", acsDualEstimate: 842 },  // 413 + 429
];
// ACS county total (denominator for shares): 216,635
// MACPAC administrative total (used for allocation): 405,000 (high) / 335,000 (low)
// County shares are derived from the ACS total - see methodology note above.

// ── Type ──────────────────────────────────────────────────────────────────────

export interface DualEligibleCountyEntry {
  county: string;
  slug: string;
  fips: string;
  acsDualEstimate: number;   // direct ACS B27010 simultaneous Medicare+Medicaid count
  allocatedLow: number;      // allocated from DISPLAY_RANGE_LOW (335,000)
  allocatedHigh: number;     // allocated from DISPLAY_RANGE_HIGH (405,000)
}

// ── Computed fallback ──────────────────────────────────────────────────────────

const COUNTY_ACS_DUAL_TOTAL = DUAL_ELIGIBLE_ACS_COUNTY.reduce(
  (sum, c) => sum + c.acsDualEstimate,
  0
);
// = 216,635

export const DUAL_ELIGIBLE_EXPOSURE_FALLBACK: DualEligibleCountyEntry[] =
  DUAL_ELIGIBLE_ACS_COUNTY.map((c) => {
    const countyShare = c.acsDualEstimate / COUNTY_ACS_DUAL_TOTAL;
    const low = Math.max(1, Math.round(DISPLAY_RANGE_LOW * countyShare));
    const high = Math.max(1, Math.round(DISPLAY_RANGE_HIGH * countyShare));

    // Slug: lowercase, spaces to hyphens, dots removed
    const slug = c.county
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/\./g, "");

    return {
      county: c.county,
      slug,
      fips: c.fips,
      acsDualEstimate: c.acsDualEstimate,
      allocatedLow: low,
      allocatedHigh: high,
    };
  });
