// Michigan Registered Political Parties
// Source: Michigan Secretary of State Bureau of Elections
// Presented with strict neutrality — identical format for all parties

export interface MichiganPoliticalParty {
  id: string;
  officialName: string;
  shortName: string;
  ballotStatus: "Major" | "Minor" | "Seeking Access";
  founded?: number;
  website?: string;
  currentStateOfficeholders: number;
  candidateFilingProcess: string;
  petitionRequirementDifferent: boolean;
  petitionNote?: string;
  keyPolicyFocus: string[];
  lastGovernorCandidate?: string;
  lastGovernorVotePct?: number;
  lastGovernorVoteYear?: number;
  color: string;
  source: string;
}

export const MICHIGAN_PARTIES: MichiganPoliticalParty[] = [
  {
    id: "democratic", officialName: "Michigan Democratic Party", shortName: "Democratic",
    ballotStatus: "Major", founded: 1848, website: "michigandems.com",
    currentStateOfficeholders: 71,
    candidateFilingProcess: "Nominating petition; primary election for most offices",
    petitionRequirementDifferent: false,
    keyPolicyFocus: ["Labor and union rights", "Healthcare access expansion", "Environmental regulation", "Public education investment"],
    lastGovernorCandidate: "Gretchen Whitmer", lastGovernorVotePct: 59.0, lastGovernorVoteYear: 2022,
    color: "#1a4f9b", source: "Michigan SOS Bureau of Elections 2025",
  },
  {
    id: "republican", officialName: "Michigan Republican Party", shortName: "Republican",
    ballotStatus: "Major", founded: 1854, website: "migop.org",
    currentStateOfficeholders: 74,
    candidateFilingProcess: "Nominating petition; primary election for most offices",
    petitionRequirementDifferent: false,
    keyPolicyFocus: ["Tax reduction and fiscal restraint", "School choice and education freedom", "Second Amendment rights", "Energy independence"],
    lastGovernorCandidate: "Tudor Dixon", lastGovernorVotePct: 38.9, lastGovernorVoteYear: 2022,
    color: "#c41e3a", source: "Michigan SOS Bureau of Elections 2025",
  },
  {
    id: "libertarian", officialName: "Libertarian Party of Michigan", shortName: "Libertarian",
    ballotStatus: "Minor", founded: 1972, website: "michiganlp.org",
    currentStateOfficeholders: 0,
    candidateFilingProcess: "Requires nominating petition; no primary — convention nomination",
    petitionRequirementDifferent: true,
    petitionNote: "Requires signatures equal to 1% of total votes cast for Secretary of State in last election — often more burdensome than major party filing.",
    keyPolicyFocus: ["Individual liberty", "Free market economics", "Non-interventionist foreign policy", "Criminal justice reform"],
    lastGovernorCandidate: "Mary Buzuma", lastGovernorVotePct: 1.5, lastGovernorVoteYear: 2022,
    color: "#f5a623", source: "Michigan SOS Bureau of Elections 2025",
  },
  {
    id: "green", officialName: "Green Party of Michigan", shortName: "Green",
    ballotStatus: "Minor", founded: 1987, website: "gp.org/michigan",
    currentStateOfficeholders: 0,
    candidateFilingProcess: "Petition signatures required; convention nomination",
    petitionRequirementDifferent: true,
    petitionNote: "Same 1% petition requirement as other minor parties — typically 30,000+ signatures statewide.",
    keyPolicyFocus: ["Environmental protection", "Single-payer healthcare", "Campaign finance reform", "Ranked choice voting"],
    lastGovernorCandidate: "Garland Favorito (2018)", lastGovernorVotePct: 1.1, lastGovernorVoteYear: 2018,
    color: "#2d6a4f", source: "Michigan SOS Bureau of Elections 2025",
  },
  {
    id: "working-class", officialName: "Working Class Party", shortName: "Working Class",
    ballotStatus: "Minor", founded: 2016, website: "workingclassparty.org",
    currentStateOfficeholders: 0,
    candidateFilingProcess: "Petition signatures required; convention nomination",
    petitionRequirementDifferent: true,
    keyPolicyFocus: ["Workers' rights and union support", "Free public higher education", "Medicare for All", "Public banking"],
    color: "#8b0000", source: "Michigan SOS Bureau of Elections 2025",
  },
  {
    id: "us-taxpayers", officialName: "U.S. Taxpayers Party of Michigan", shortName: "U.S. Taxpayers",
    ballotStatus: "Minor", founded: 1992, website: "ustpm.org",
    currentStateOfficeholders: 0,
    candidateFilingProcess: "Petition signatures required; convention nomination",
    petitionRequirementDifferent: true,
    keyPolicyFocus: ["Constitutional originalism", "Pro-life policy positions", "Religious liberty", "Reduced federal government"],
    color: "#2c4a2e", source: "Michigan SOS Bureau of Elections 2025",
  },
  {
    id: "natural-law", officialName: "Natural Law Party of Michigan", shortName: "Natural Law",
    ballotStatus: "Seeking Access",
    currentStateOfficeholders: 0,
    candidateFilingProcess: "Petition signatures required",
    petitionRequirementDifferent: true,
    keyPolicyFocus: ["Consciousness-based education", "Preventive healthcare", "Sustainable agriculture", "Renewable energy"],
    color: "#7b68ee", source: "Michigan SOS Bureau of Elections 2025",
  },
];

export const MICHIGAN_FILING_COMPARISON = {
  majorPartyStatewidePetitions: "~15,000 signatures (varies by office)",
  minorPartyStatewidePetitions: "~30,000\u201360,000 signatures (1% of SOS votes)",
  majorPartyLocalPetitions: "Varies; typically 50\u2013500 signatures",
  minorPartyLocalPetitions: "Proportionally higher bar in most cases",
  primaryElection: "Major parties only; minor parties use conventions",
  source: "Michigan Election Law, MCL 168.544c; Michigan SOS",
};

export const BALLOT_ACCESS_COMPARISON = [
  { state: "Colorado", difficulty: "Easy", note: "1,000 signatures statewide" },
  { state: "Ohio", difficulty: "Moderate", note: "1% of gubernatorial votes" },
  { state: "Michigan", difficulty: "Moderate-Hard", note: "1% of SOS votes" },
  { state: "California", difficulty: "Hard", note: "Top-two primary limits access" },
  { state: "Texas", difficulty: "Very Hard", note: "1% of governor votes, non-primary voters only" },
];
