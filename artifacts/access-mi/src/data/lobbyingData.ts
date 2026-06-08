// Michigan Lobbying Registration Data
// Source: Michigan MiTN (Michigan Transparency Network)
// Available at: mitn.michigan.gov (public search, no account)
// Michigan Lobby Act: Act 472 of 1978

export interface LobbyingIndustrySummary {
  industry: string;
  totalRegisteredLobbyists: number;
  totalExpenditures: number;
  topClients: string[];
  policyFocusAreas: string[];
  source: string;
}

// Illustrative aggregate - download full data at mitn.michigan.gov
export const MICHIGAN_LOBBYING_BY_INDUSTRY: LobbyingIndustrySummary[] = [
  { industry: "Healthcare & Pharmaceuticals", totalRegisteredLobbyists: 312, totalExpenditures: 24800000, topClients: ["Michigan Health & Hospital Association", "Blue Cross Blue Shield of Michigan", "Michigan State Medical Society"], policyFocusAreas: ["Medicaid reimbursement rates", "Certificate of Need regulations", "Mental health parity"], source: "Michigan MiTN 2024 \u2014 Illustrative aggregate" },
  { industry: "Energy & Utilities", totalRegisteredLobbyists: 178, totalExpenditures: 18400000, topClients: ["Consumers Energy", "DTE Energy", "Michigan Energy Innovation Business Council"], policyFocusAreas: ["Utility rate cases (MPSC)", "Renewable energy standards", "Nuclear energy policy"], source: "Michigan MiTN 2024 \u2014 Illustrative aggregate" },
  { industry: "Automotive & Manufacturing", totalRegisteredLobbyists: 142, totalExpenditures: 16800000, topClients: ["General Motors", "Ford Motor Company", "Stellantis"], policyFocusAreas: ["EV tax incentives", "Autonomous vehicle regulation", "Environmental compliance"], source: "Michigan MiTN 2024 \u2014 Illustrative aggregate" },
  { industry: "Financial Services & Insurance", totalRegisteredLobbyists: 156, totalExpenditures: 14200000, topClients: ["Michigan Bankers Association", "Michigan Credit Union League", "Property Casualty Insurers Association"], policyFocusAreas: ["Auto insurance reform", "Banking regulations", "Credit union taxation"], source: "Michigan MiTN 2024 \u2014 Illustrative aggregate" },
  { industry: "Education", totalRegisteredLobbyists: 134, totalExpenditures: 11600000, topClients: ["Michigan Association of School Boards", "Michigan Community College Association", "ACLU of Michigan"], policyFocusAreas: ["School funding (Proposal A)", "Charter school regulation", "Higher education appropriations"], source: "Michigan MiTN 2024 \u2014 Illustrative aggregate" },
  { industry: "Labor & Unions", totalRegisteredLobbyists: 89, totalExpenditures: 9800000, topClients: ["Michigan AFL-CIO", "UAW Region 1", "Michigan Education Association"], policyFocusAreas: ["Prevailing wage laws", "Workers' compensation", "Public employee bargaining"], source: "Michigan MiTN 2024 \u2014 Illustrative aggregate" },
  { industry: "Local Government & Municipal", totalRegisteredLobbyists: 98, totalExpenditures: 7400000, topClients: ["Michigan Municipal League", "Michigan Association of Counties", "Michigan Townships Association"], policyFocusAreas: ["Revenue sharing", "Infrastructure funding", "Zoning and land use"], source: "Michigan MiTN 2024 \u2014 Illustrative aggregate" },
];

export const MICHIGAN_LOBBYING_STATS = {
  totalRegisteredLobbyists: 2000,
  lobbyActCitation: "Michigan Lobby Act, Act 472 of 1978",
  registrationDeadline: "Within 15 days of becoming a lobbyist",
  reportingFrequency: "Bi-annual reports to Secretary of State",
  searchPortal: "mitn.michigan.gov",
  source: "Michigan MiTN / Michigan SOS",
};
