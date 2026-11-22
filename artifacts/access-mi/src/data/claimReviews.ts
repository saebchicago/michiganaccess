import type { ClaimReview } from "@/data/claimReview";

/**
 * Review records for the hand-typed claim collections. Rules and the meaning
 * of each basis are in claimReview.ts; claimReview.test.ts enforces them.
 * Quiz and hero keys are fingerprints of the question text or link target.
 * "Read by review agent" means an automated reviewer fetched the page and
 * found the figure in its text on the checked date; a person has not re-read it.
 */
export const CLAIM_REVIEWS: Record<string, ClaimReview> = {
  "insight:0": {
    basis: "dataset",
    evidence: "hrsa-hpsa-county.generated.json: counties with designatedHpsas > 0 for the discipline",
    test: "src/data/__tests__/insights-claims.test.ts",
    checked: "2026-11-22",
    fingerprint: "pfiasv",
  },
  "insight:1": {
    basis: "dataset",
    evidence: "alice-county.generated.json statewide and county records",
    test: "src/data/__tests__/insights-claims.test.ts",
    checked: "2026-11-22",
    fingerprint: "5b3gkh",
  },
  "insight:2": {
    basis: "reported",
    evidence: "EGLE release of 2026-08-12 states 350 sites as of July 2026; MCL page (michigan.gov/pfasresponse/drinking-water/mcl) states PFOA 8 ppt and PFOS 16 ppt, Aug 2020 (pages read by review agent)",
    url: "https://www.michigan.gov/egle/newsroom/mi-environment/2026/08/12/pfas-contamination",
    checked: "2026-11-22",
    fingerprint: "1u4daiq",
  },
  "insight:5": {
    basis: "dataset",
    evidence: "hrsa-hpsa-county.generated.json: counties with designatedHpsas > 0 for the discipline",
    test: "src/data/__tests__/insights-claims.test.ts",
    checked: "2026-11-22",
    fingerprint: "54875h",
  },
  "insight:6": {
    basis: "reported",
    evidence: "MDOC release of 2025-07-02 states 32,778, lowest since 1991, 51,554 in 2007 and 21.0% recidivism (page read by review agent)",
    url: "https://www.michigan.gov/corrections/about/newsroom/press-releases/2025/07/02/michigan-department-of-corrections-reports-new-historic-low",
    checked: "2026-11-22",
    fingerprint: "1fyoipg",
  },
  "insight:12": {
    basis: "dataset",
    evidence: "rx-kids.ts: distinct counties in RX_KIDS_COMMUNITIES and RX_KIDS_PROGRAM_FACTS.launchDate",
    test: "src/data/__tests__/insights-claims.test.ts",
    checked: "2026-11-22",
    fingerprint: "a5safe",
  },
  "insight:13": {
    basis: "reported",
    evidence: "MSP releases of 2025-08-26 (29 deaths, +21%), 2026-08-06 (35 deaths, +21%) and 2026-02-10 (93.2% seat belt use) (pages read by review agent)",
    url: "https://www.michigan.gov/mspnewsroom/news-releases/2026/08/06/final-2025-crash-data-shows-roadway-deaths-decreased-but-challenges-remain",
    checked: "2026-11-22",
    fingerprint: "1vaw0yx",
  },
  "story:alice-gap": {
    basis: "dataset",
    evidence: "alice-county.generated.json statewide and county records",
    test: "src/data/__tests__/insights-claims.test.ts",
    checked: "2026-11-22",
    fingerprint: "1d7shqw",
  },
  "story:pfas-water": {
    basis: "reported",
    evidence: "EGLE release of 2026-08-12 states 350 sites as of July 2026; MCL page (michigan.gov/pfasresponse/drinking-water/mcl) states PFOA 8 ppt and PFOS 16 ppt, Aug 2020 (pages read by review agent)",
    url: "https://www.michigan.gov/egle/newsroom/mi-environment/2026/08/12/pfas-contamination",
    checked: "2026-11-22",
    fingerprint: "50ujik",
  },
  "story:reentry-success": {
    basis: "reported",
    evidence: "MDOC release of 2025-07-02 states 32,778, lowest since 1991, 51,554 in 2007 and 21.0% recidivism (page read by review agent)",
    url: "https://www.michigan.gov/corrections/about/newsroom/press-releases/2025/07/02/michigan-department-of-corrections-reports-new-historic-low",
    checked: "2026-11-22",
    fingerprint: "1pbizfm",
  },
  "story:dental-desert": {
    basis: "dataset",
    evidence: "hrsa-hpsa-county.generated.json: counties with designatedHpsas > 0 for the discipline",
    test: "src/data/__tests__/insights-claims.test.ts",
    checked: "2026-11-22",
    fingerprint: "171il1q",
  },
  "story:prek-for-all-coverage": {
    basis: "reported",
    evidence: "Governor/MiLEAP release of 2026-03-25 states nearly 55,000 children enrolled in GSRP as of January 2026, a record (page read by review agent)",
    url: "https://www.michigan.gov/whitmer/news/press-releases/2026/03/25/whitmer-and-mileap-announce-record-enrollment-in-prek-for-all",
    checked: "2026-11-22",
    fingerprint: "rgepqb",
  },
  "story:vocational-village-outcomes": {
    basis: "reported",
    evidence: "MDOC release of 2026-06-02 states roughly 12% for graduates vs approximately 22% statewide (page read by review agent)",
    url: "https://www.michigan.gov/corrections/about/newsroom/press-releases/2026/06/02/mdoc-earns-national-recognition-for-innovative-vocational-village-programming",
    checked: "2026-11-22",
    fingerprint: "1nug7rk",
  },
  "signal:s6": {
    basis: "manifest",
    evidence: "SOURCE_MANIFEST MiHER allocation entry",
    manifestValue: "$211M",
    checked: "2026-11-22",
    fingerprint: "vldclh",
  },
  "signal:s9": {
    basis: "dataset",
    evidence: "alice-county.generated.json statewide and county records",
    test: "src/data/__tests__/insights-claims.test.ts",
    checked: "2026-11-22",
    fingerprint: "16hu0cu",
  },
  "signal:s12": {
    basis: "reported",
    evidence: "MDOC release of 2025-07-02 states 32,778, lowest since 1991, 51,554 in 2007 and 21.0% recidivism (page read by review agent)",
    url: "https://www.michigan.gov/corrections/about/newsroom/press-releases/2025/07/02/michigan-department-of-corrections-reports-new-historic-low",
    checked: "2026-11-22",
    fingerprint: "47185d",
  },
  "signal:s13": {
    basis: "reported",
    evidence: "EGLE release of 2026-08-12 states 350 sites as of July 2026; MCL page (michigan.gov/pfasresponse/drinking-water/mcl) states PFOA 8 ppt and PFOS 16 ppt, Aug 2020 (pages read by review agent)",
    url: "https://www.michigan.gov/egle/newsroom/mi-environment/2026/08/12/pfas-contamination",
    checked: "2026-11-22",
    fingerprint: "2p91zw",
  },
  "signal:s15": {
    basis: "dataset",
    evidence: "hrsa-hpsa-county.generated.json: counties with designatedHpsas > 0 for the discipline",
    test: "src/data/__tests__/insights-claims.test.ts",
    checked: "2026-11-22",
    fingerprint: "f2b4zu",
  },
  // quiz question 1
  "quiz:36i20b": {
    basis: "dataset",
    evidence: "alice-county.generated.json statewide and county records",
    test: "src/data/__tests__/insights-claims.test.ts",
    checked: "2026-11-22",
    fingerprint: "1k86k5q",
  },
  // quiz question 2
  "quiz:1vpqd9h": {
    basis: "manifest",
    evidence: "SOURCE_MANIFEST infant mortality rate per 1,000 (2024)",
    manifestValue: "6.3",
    checked: "2026-11-22",
    fingerprint: "155pqm8",
  },
  // quiz question 3
  "quiz:192yzei": {
    basis: "dataset",
    evidence: "hrsa-hpsa-county.generated.json: counties with designatedHpsas > 0 for the discipline",
    test: "src/data/__tests__/insights-claims.test.ts",
    checked: "2026-11-22",
    fingerprint: "1cxozeb",
  },
  // quiz question 4
  "quiz:uublxt": {
    basis: "dataset",
    evidence: "hrsa-hpsa-county.generated.json: counties with designatedHpsas > 0 for the discipline",
    test: "src/data/__tests__/insights-claims.test.ts",
    checked: "2026-11-22",
    fingerprint: "ad1bpa",
  },
  // quiz question 5
  "quiz:oqkb7l": {
    basis: "reported",
    evidence: "MDOC release of 2025-07-02 states 32,778, lowest since 1991, 51,554 in 2007 and 21.0% recidivism (page read by review agent)",
    url: "https://www.michigan.gov/corrections/about/newsroom/press-releases/2025/07/02/michigan-department-of-corrections-reports-new-historic-low",
    checked: "2026-11-22",
    fingerprint: "dc4myu",
  },
  // quiz question 6
  "quiz:13k8qwc": {
    basis: "reported",
    evidence: "MDOC release of 2025-07-02 states 32,778, lowest since 1991, 51,554 in 2007 and 21.0% recidivism (page read by review agent)",
    url: "https://www.michigan.gov/corrections/about/newsroom/press-releases/2025/07/02/michigan-department-of-corrections-reports-new-historic-low",
    checked: "2026-11-22",
    fingerprint: "cvkm4w",
  },
  // quiz question 7
  "quiz:1yneat6": {
    basis: "reported",
    evidence: "EGLE release of 2026-08-12 states 350 sites as of July 2026; MCL page (michigan.gov/pfasresponse/drinking-water/mcl) states PFOA 8 ppt and PFOS 16 ppt, Aug 2020 (pages read by review agent)",
    url: "https://www.michigan.gov/egle/newsroom/mi-environment/2026/08/12/pfas-contamination",
    checked: "2026-11-22",
    fingerprint: "1e0pit7",
  },
  // quiz question 8
  "quiz:19mo4ul": {
    basis: "dataset",
    evidence: "rx-kids.ts: distinct counties in RX_KIDS_COMMUNITIES and RX_KIDS_PROGRAM_FACTS.launchDate",
    test: "src/data/__tests__/insights-claims.test.ts",
    checked: "2026-11-22",
    fingerprint: "qlspjm",
  },
  // quiz question 9
  "quiz:g63kbu": {
    basis: "reported",
    evidence: "MSP release of 2026-02-10 states 93.2% in 2025, highest since 2019 (page read by review agent)",
    url: "https://www.michigan.gov/mspnewsroom/news-releases/2026/02/10/michigan-seat-belt-use-rate-rose-in-2025",
    checked: "2026-11-22",
    fingerprint: "llv4ib",
  },
  // quiz question 10
  "quiz:4bo5u8": {
    basis: "dataset",
    evidence: "public/data/michigan-county-income-poverty.json provenance.statewide.povertyPct",
    test: "src/data/__tests__/insights-claims.test.ts",
    checked: "2026-11-22",
    fingerprint: "3isz72",
  },
  // homepage rotating stat 1
  "hero:1n2sjmu": {
    basis: "dataset",
    evidence: "hrsa-hpsa-county.generated.json: counties with designatedHpsas > 0 for the discipline",
    test: "src/data/__tests__/insights-claims.test.ts",
    checked: "2026-11-22",
    fingerprint: "8f2p1n",
  },
  // homepage rotating stat 2
  "hero:18ll44h": {
    basis: "dataset",
    evidence: "alice-county.generated.json statewide and county records",
    test: "src/data/__tests__/insights-claims.test.ts",
    checked: "2026-11-22",
    fingerprint: "d1xmj9",
  },
  // homepage rotating stat 3
  "hero:164fl0v": {
    basis: "manifest",
    evidence: "SOURCE_MANIFEST Michigan 211 annual requests",
    manifestValue: "625,852",
    checked: "2026-11-22",
    fingerprint: "196y0ed",
  },
  // homepage rotating stat 4
  "hero:2k7568": {
    basis: "manifest",
    evidence: "SOURCE_MANIFEST Trinity Health screening rate",
    manifestValue: "27.4%",
    checked: "2026-11-22",
    fingerprint: "k6xnmn",
  },
};
