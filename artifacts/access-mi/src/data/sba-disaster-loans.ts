/**
 * SBA Disaster Loan Data — Michigan County-Level
 * Modeled from SBA disaster loan reports, FY2020-2024.
 * Illustrative county-level estimates based on public FOIA data.
 */

export interface SBADisasterLoanCounty {
  county: string;
  totalApplications: number;
  totalApprovedAmount: number;
  totalVerifiedLoss: number;
  avgLoanAmount: number;
  approvalRate: number;
  homeLoans: number;
  businessLoans: number;
  primaryDisaster: string;
  primaryDisasterYear: number;
}

export const SBA_DISASTER_LOAN_DATA: SBADisasterLoanCounty[] = [
  { county: "Midland", totalApplications: 4200, totalApprovedAmount: 142000000, totalVerifiedLoss: 218000000, avgLoanAmount: 58000, approvalRate: 58, homeLoans: 3100, businessLoans: 340, primaryDisaster: "Midland Dam Failure", primaryDisasterYear: 2020 },
  { county: "Wayne", totalApplications: 3800, totalApprovedAmount: 98000000, totalVerifiedLoss: 165000000, avgLoanAmount: 42000, approvalRate: 61, homeLoans: 2900, businessLoans: 520, primaryDisaster: "Flooding (June 2021)", primaryDisasterYear: 2021 },
  { county: "Gladwin", totalApplications: 2100, totalApprovedAmount: 68000000, totalVerifiedLoss: 105000000, avgLoanAmount: 52000, approvalRate: 62, homeLoans: 1700, businessLoans: 180, primaryDisaster: "Midland Dam Failure", primaryDisasterYear: 2020 },
  { county: "Macomb", totalApplications: 1650, totalApprovedAmount: 45000000, totalVerifiedLoss: 78000000, avgLoanAmount: 38000, approvalRate: 58, homeLoans: 1280, businessLoans: 210, primaryDisaster: "Flooding (June 2021)", primaryDisasterYear: 2021 },
  { county: "Oakland", totalApplications: 1400, totalApprovedAmount: 42000000, totalVerifiedLoss: 68000000, avgLoanAmount: 48000, approvalRate: 63, homeLoans: 1050, businessLoans: 190, primaryDisaster: "Flooding (June 2021)", primaryDisasterYear: 2021 },
  { county: "Washtenaw", totalApplications: 820, totalApprovedAmount: 28000000, totalVerifiedLoss: 45000000, avgLoanAmount: 51000, approvalRate: 67, homeLoans: 620, businessLoans: 95, primaryDisaster: "Flooding (June 2021)", primaryDisasterYear: 2021 },
  { county: "Saginaw", totalApplications: 750, totalApprovedAmount: 22000000, totalVerifiedLoss: 38000000, avgLoanAmount: 44000, approvalRate: 60, homeLoans: 580, businessLoans: 88, primaryDisaster: "Severe Storms", primaryDisasterYear: 2022 },
  { county: "Genesee", totalApplications: 680, totalApprovedAmount: 18000000, totalVerifiedLoss: 32000000, avgLoanAmount: 39000, approvalRate: 55, homeLoans: 520, businessLoans: 65, primaryDisaster: "Severe Storms", primaryDisasterYear: 2022 },
  { county: "Arenac", totalApplications: 520, totalApprovedAmount: 15000000, totalVerifiedLoss: 24000000, avgLoanAmount: 46000, approvalRate: 56, homeLoans: 410, businessLoans: 42, primaryDisaster: "Midland Dam Failure", primaryDisasterYear: 2020 },
  { county: "Kent", totalApplications: 480, totalApprovedAmount: 14000000, totalVerifiedLoss: 22000000, avgLoanAmount: 41000, approvalRate: 64, homeLoans: 360, businessLoans: 75, primaryDisaster: "Severe Storms", primaryDisasterYear: 2022 },
];

export const MIDLAND_DAM_STATS = {
  event: "Edenville & Sanford Dam Failures",
  date: "May 19, 2020",
  evacuees: 10000,
  countiesAffected: 3,
  totalVerifiedLoss: 347000000,
  totalApproved: 225000000,
  unmetNeed: 122000000,
  femaDeclaration: "DR-4547",
};
