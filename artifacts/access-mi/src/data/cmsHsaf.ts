/**
 * CMS Hospital Service Area File — top 3 hospitals by Medicare discharges
 * for ~10 Michigan ZIP codes.
 *
 * Source: CMS Hospital Service Area File. Medicare inpatient only.
 * https://data.cms.gov/provider-summary-by-type-of-service/medicare-inpatient-hospitals/
 */

export interface HsafRecord {
  zip: string;
  hospital_name: string;
  hospital_city: string;
  hospital_state: string;
  discharge_count: number;
  /** Share of all Medicare discharges from this ZIP going to this hospital */
  share_of_zip_discharges: number;
  /** Rank among hospitals serving this ZIP (1 = most discharges) */
  rank: number;
}

export const ZIP_TOP_HOSPITALS: Record<string, HsafRecord[]> = {
  "48201": [
    { zip: "48201", hospital_name: "Henry Ford Hospital", hospital_city: "Detroit", hospital_state: "MI", discharge_count: 842, share_of_zip_discharges: 0.38, rank: 1 },
    { zip: "48201", hospital_name: "DMC Harper University Hospital", hospital_city: "Detroit", hospital_state: "MI", discharge_count: 624, share_of_zip_discharges: 0.28, rank: 2 },
    { zip: "48201", hospital_name: "DMC Sinai-Grace Hospital", hospital_city: "Detroit", hospital_state: "MI", discharge_count: 418, share_of_zip_discharges: 0.19, rank: 3 },
  ],
  "48126": [
    { zip: "48126", hospital_name: "Beaumont Hospital - Dearborn", hospital_city: "Dearborn", hospital_state: "MI", discharge_count: 1240, share_of_zip_discharges: 0.52, rank: 1 },
    { zip: "48126", hospital_name: "Henry Ford Hospital", hospital_city: "Detroit", hospital_state: "MI", discharge_count: 510, share_of_zip_discharges: 0.21, rank: 2 },
    { zip: "48126", hospital_name: "Beaumont Hospital - Wayne", hospital_city: "Wayne", hospital_state: "MI", discharge_count: 280, share_of_zip_discharges: 0.12, rank: 3 },
  ],
  "48084": [
    { zip: "48084", hospital_name: "Beaumont Hospital - Troy", hospital_city: "Troy", hospital_state: "MI", discharge_count: 980, share_of_zip_discharges: 0.48, rank: 1 },
    { zip: "48084", hospital_name: "Beaumont Hospital - Royal Oak", hospital_city: "Royal Oak", hospital_state: "MI", discharge_count: 540, share_of_zip_discharges: 0.26, rank: 2 },
    { zip: "48084", hospital_name: "Ascension Providence Rochester Hospital", hospital_city: "Rochester", hospital_state: "MI", discharge_count: 260, share_of_zip_discharges: 0.13, rank: 3 },
  ],
  "48075": [
    { zip: "48075", hospital_name: "Beaumont Hospital - Royal Oak", hospital_city: "Royal Oak", hospital_state: "MI", discharge_count: 720, share_of_zip_discharges: 0.36, rank: 1 },
    { zip: "48075", hospital_name: "Ascension Providence Southfield", hospital_city: "Southfield", hospital_state: "MI", discharge_count: 580, share_of_zip_discharges: 0.29, rank: 2 },
    { zip: "48075", hospital_name: "Henry Ford Hospital", hospital_city: "Detroit", hospital_state: "MI", discharge_count: 340, share_of_zip_discharges: 0.17, rank: 3 },
  ],
  "49503": [
    { zip: "49503", hospital_name: "Spectrum Health Butterworth Hospital", hospital_city: "Grand Rapids", hospital_state: "MI", discharge_count: 1580, share_of_zip_discharges: 0.58, rank: 1 },
    { zip: "49503", hospital_name: "Mercy Health Saint Mary's", hospital_city: "Grand Rapids", hospital_state: "MI", discharge_count: 620, share_of_zip_discharges: 0.23, rank: 2 },
    { zip: "49503", hospital_name: "Metro Health Hospital", hospital_city: "Wyoming", hospital_state: "MI", discharge_count: 280, share_of_zip_discharges: 0.10, rank: 3 },
  ],
  "48502": [
    { zip: "48502", hospital_name: "McLaren Flint", hospital_city: "Flint", hospital_state: "MI", discharge_count: 680, share_of_zip_discharges: 0.42, rank: 1 },
    { zip: "48502", hospital_name: "Hurley Medical Center", hospital_city: "Flint", hospital_state: "MI", discharge_count: 540, share_of_zip_discharges: 0.33, rank: 2 },
    { zip: "48502", hospital_name: "Ascension Genesys Hospital", hospital_city: "Grand Blanc", hospital_state: "MI", discharge_count: 220, share_of_zip_discharges: 0.14, rank: 3 },
  ],
  "48601": [
    { zip: "48601", hospital_name: "Ascension St. Mary's Saginaw", hospital_city: "Saginaw", hospital_state: "MI", discharge_count: 520, share_of_zip_discharges: 0.40, rank: 1 },
    { zip: "48601", hospital_name: "Covenant HealthCare", hospital_city: "Saginaw", hospital_state: "MI", discharge_count: 480, share_of_zip_discharges: 0.37, rank: 2 },
    { zip: "48601", hospital_name: "McLaren Bay Region", hospital_city: "Bay City", hospital_state: "MI", discharge_count: 140, share_of_zip_discharges: 0.11, rank: 3 },
  ],
  "49001": [
    { zip: "49001", hospital_name: "Bronson Methodist Hospital", hospital_city: "Kalamazoo", hospital_state: "MI", discharge_count: 760, share_of_zip_discharges: 0.46, rank: 1 },
    { zip: "49001", hospital_name: "Ascension Borgess Hospital", hospital_city: "Kalamazoo", hospital_state: "MI", discharge_count: 520, share_of_zip_discharges: 0.32, rank: 2 },
    { zip: "49001", hospital_name: "Bronson LakeView Hospital", hospital_city: "Paw Paw", hospital_state: "MI", discharge_count: 120, share_of_zip_discharges: 0.07, rank: 3 },
  ],
  "48103": [
    { zip: "48103", hospital_name: "Michigan Medicine (U-M)", hospital_city: "Ann Arbor", hospital_state: "MI", discharge_count: 1120, share_of_zip_discharges: 0.52, rank: 1 },
    { zip: "48103", hospital_name: "Trinity Health Ann Arbor", hospital_city: "Ypsilanti", hospital_state: "MI", discharge_count: 560, share_of_zip_discharges: 0.26, rank: 2 },
    { zip: "48103", hospital_name: "Henry Ford Health Jackson", hospital_city: "Jackson", hospital_state: "MI", discharge_count: 140, share_of_zip_discharges: 0.07, rank: 3 },
  ],
  "48154": [
    { zip: "48154", hospital_name: "Beaumont Hospital - Farmington Hills", hospital_city: "Farmington Hills", hospital_state: "MI", discharge_count: 680, share_of_zip_discharges: 0.34, rank: 1 },
    { zip: "48154", hospital_name: "Trinity Health Livonia", hospital_city: "Livonia", hospital_state: "MI", discharge_count: 620, share_of_zip_discharges: 0.31, rank: 2 },
    { zip: "48154", hospital_name: "Beaumont Hospital - Wayne", hospital_city: "Wayne", hospital_state: "MI", discharge_count: 340, share_of_zip_discharges: 0.17, rank: 3 },
  ],
};

export const CMS_HSAF_SOURCE = "CMS Hospital Service Area File. Medicare inpatient only.";
