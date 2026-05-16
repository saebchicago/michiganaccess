// Michigan's 12 Federally Recognized Tribal Nations
// Primary sources: GLITC AIAN Health Profile 2021, IHS Bemidji Area,
// ITCMI, MDHHS 2021 Health Equity Report, Bridge Michigan
//
// SOVEREIGNTY NOTE: Each tribal nation is a sovereign government.
// Health program information sourced from publicly available tribal and IHS resources.

export interface TribalNation {
  id: string;
  name: string;
  shortName: string;
  reservationCity: string;
  primaryCounties: string[];
  serviceAreaCounties: string[];
  healthCenterName: string;
  healthCenterType: "638 Clinic" | "FQHC" | "FQHC Look-Alike" | "PCMH";
  clinicCount: number;
  healthCenterUrl?: string;
  keyHealthChallenges: string[];
  mihinParticipant: boolean;
  sources: string[];
  sovereigntyNote: string;
}

export const MICHIGAN_TRIBAL_NATIONS: TribalNation[] = [
  { id: "bay-mills", name: "Bay Mills Indian Community", shortName: "Bay Mills", reservationCity: "Brimley, MI", primaryCounties: ["Chippewa"], serviceAreaCounties: ["Chippewa"], healthCenterName: "Bay Mills Health Center", healthCenterType: "638 Clinic", clinicCount: 1, healthCenterUrl: "https://baymills.org/tribal-services/health/", keyHealthChallenges: ["Geographic isolation in Upper Peninsula", "Limited specialist access", "High rates of diabetes and heart disease"], mihinParticipant: true, sources: ["GLITC AIAN Health Profile 2021", "IHS Bemidji Area"], sovereigntyNote: "Bay Mills Indian Community operates as a sovereign government under P.L. 93-638." },
  { id: "grand-traverse-band", name: "Grand Traverse Band of Ottawa and Chippewa Indians", shortName: "Grand Traverse Band", reservationCity: "Peshabestown, MI", primaryCounties: ["Leelanau", "Grand Traverse"], serviceAreaCounties: ["Leelanau", "Grand Traverse", "Antrim", "Charlevoix", "Benzie"], healthCenterName: "Grand Traverse Band Health Department", healthCenterType: "638 Clinic", clinicCount: 1, keyHealthChallenges: ["Rural access to specialty care", "Substance use disorder", "Mental health infrastructure gaps"], mihinParticipant: true, sources: ["GLITC AIAN Health Profile 2021", "ITCMI"], sovereigntyNote: "Grand Traverse Band operates health programs under tribal sovereignty and self-determination." },
  { id: "saginaw-chippewa", name: "Saginaw Chippewa Indian Tribe", shortName: "Saginaw Chippewa", reservationCity: "Mt. Pleasant, MI", primaryCounties: ["Isabella"], serviceAreaCounties: ["Isabella", "Arenac", "Midland", "Clare", "Missaukee"], healthCenterName: "Nimkee Memorial Wellness Center", healthCenterType: "PCMH", clinicCount: 1, healthCenterUrl: "https://www.sagchip.org/nimkee/", keyHealthChallenges: ["Diabetes prevalence above state average", "Cardiovascular disease", "Behavioral health integration"], mihinParticipant: true, sources: ["sagchip.org/nimkee", "GLITC 2021"], sovereigntyNote: "Saginaw Chippewa operates the Nimkee Memorial Wellness Center as a tribally-controlled PCMH." },
  { id: "sault-ste-marie", name: "Sault Ste. Marie Tribe of Chippewa Indians", shortName: "Sault Tribe", reservationCity: "Sault Ste. Marie, MI", primaryCounties: ["Chippewa"], serviceAreaCounties: ["Chippewa", "Luce", "Mackinac", "Alger", "Schoolcraft", "Delta", "Marquette"], healthCenterName: "Sault Tribe Health Division", healthCenterType: "FQHC", clinicCount: 7, healthCenterUrl: "https://www.saulttribe.com/membership-services/health", keyHealthChallenges: ["Geographic dispersion across 7 counties", "Substance use disorder and opioids", "Dental access gap", "Diabetes and obesity"], mihinParticipant: true, sources: ["Michigan LARA FQHC Directory", "ITCMI", "GLITC 2021"], sovereigntyNote: "Sault Tribe operates 7 health clinics across the Upper Peninsula. FQHC status at Munising expands funding access." },
  { id: "keweenaw-bay", name: "Keweenaw Bay Indian Community", shortName: "Keweenaw Bay", reservationCity: "L'Anse/Baraga, MI", primaryCounties: ["Baraga"], serviceAreaCounties: ["Baraga"], healthCenterName: "KBIC Health System", healthCenterType: "FQHC", clinicCount: 1, keyHealthChallenges: ["Extreme rural isolation (UP copper country)", "Broadband gap limiting telehealth", "Diabetes prevalence", "Limited specialist access within 100 miles"], mihinParticipant: false, sources: ["Michigan LARA FQHC Directory", "IHS Bemidji Area"], sovereigntyNote: "KBIC Health System operates as a sovereign tribal health entity with FQHC designation." },
  { id: "hannahville", name: "Hannahville Indian Community", shortName: "Hannahville", reservationCity: "Wilson, MI", primaryCounties: ["Menominee", "Delta"], serviceAreaCounties: ["Menominee", "Delta"], healthCenterName: "Hannahville Health Center", healthCenterType: "638 Clinic", clinicCount: 1, keyHealthChallenges: ["Small community (~400 enrolled members)", "Deep rural isolation", "Limited tribal health infrastructure"], mihinParticipant: false, sources: ["Census Reporter Hannahville", "ITCMI", "GLITC 2021"], sovereigntyNote: "Hannahville is one of Michigan's smallest tribal nations by enrolled membership." },
  { id: "lac-vieux-desert", name: "Lac Vieux Desert Band of Lake Superior Chippewa Indians", shortName: "Lac Vieux Desert", reservationCity: "Watersmeet, MI", primaryCounties: ["Gogebic"], serviceAreaCounties: ["Gogebic"], healthCenterName: "Lac Vieux Desert Health Center", healthCenterType: "638 Clinic", clinicCount: 1, keyHealthChallenges: ["Extreme rural isolation", "Winter accessibility", "Limited healthcare workforce"], mihinParticipant: false, sources: ["ITCMI", "IHS Bemidji Area"], sovereigntyNote: "Lac Vieux Desert Band operates health services in one of Michigan's most isolated locations." },
  { id: "little-river-band", name: "Little River Band of Ottawa Indians", shortName: "Little River Band", reservationCity: "Manistee, MI", primaryCounties: ["Manistee", "Mason"], serviceAreaCounties: ["Manistee", "Mason", "Lake", "Wexford"], healthCenterName: "Little River Band Health Department", healthCenterType: "638 Clinic", clinicCount: 1, keyHealthChallenges: ["Rural access barriers", "Substance use", "Chronic disease management"], mihinParticipant: true, sources: ["ITCMI", "GLITC 2021"], sovereigntyNote: "Little River Band operates sovereign health programs in northwestern Lower Michigan." },
  { id: "little-traverse-bay", name: "Little Traverse Bay Bands of Odawa Indians", shortName: "Little Traverse Bay Bands", reservationCity: "Harbor Springs, MI", primaryCounties: ["Emmet", "Charlevoix"], serviceAreaCounties: ["Emmet", "Charlevoix", "Cheboygan"], healthCenterName: "LTBB Health Department", healthCenterType: "638 Clinic", clinicCount: 1, keyHealthChallenges: ["Rural-resort economy health workforce challenges", "Seasonal population fluctuation", "Mental health access"], mihinParticipant: true, sources: ["ITCMI", "GLITC 2021"], sovereigntyNote: "Little Traverse Bay Bands operates as a sovereign government in northern Lower Michigan." },
  { id: "match-e-be-nash", name: "Match-E-Be-Nash-She-Wish Band of Pottawatomi Indians (Gun Lake Tribe)", shortName: "Gun Lake Tribe", reservationCity: "Dorr, MI", primaryCounties: ["Allegan", "Barry"], serviceAreaCounties: ["Allegan", "Barry", "Kalamazoo"], healthCenterName: "Gun Lake Tribe Health & Human Services", healthCenterType: "638 Clinic", clinicCount: 1, keyHealthChallenges: ["Recently restored tribe (2009)", "Building health infrastructure", "Access to culturally appropriate care"], mihinParticipant: true, sources: ["ITCMI", "Gun Lake Tribe website"], sovereigntyNote: "Gun Lake Tribe was federally re-recognized in 1999, with reservation land restored in 2009." },
  { id: "nottawaseppi", name: "Nottawaseppi Huron Band of the Potawatomi", shortName: "Nottawaseppi Huron Band", reservationCity: "Calhoun County, MI", primaryCounties: ["Calhoun"], serviceAreaCounties: ["Calhoun", "Kalamazoo"], healthCenterName: "Pine Creek Health Center", healthCenterType: "638 Clinic", clinicCount: 1, keyHealthChallenges: ["Diabetes", "Behavioral health", "Access to traditional healing"], mihinParticipant: false, sources: ["ITCMI", "GLITC 2021"], sovereigntyNote: "Nottawaseppi Huron Band operates sovereign health services in south-central Michigan." },
  { id: "pokagon", name: "Pokagon Band of Potawatomi Indians", shortName: "Pokagon Band", reservationCity: "Dowagiac, MI", primaryCounties: ["Cass", "Van Buren"], serviceAreaCounties: ["Cass", "Van Buren", "Berrien", "Allegan"], healthCenterName: "Pokagon Band Health Services", healthCenterType: "638 Clinic", clinicCount: 2, keyHealthChallenges: ["Cross-state service area (MI/IN)", "Diabetes and obesity", "Transportation barriers"], mihinParticipant: true, sources: ["ITCMI", "pokagonband-nsn.gov"], sovereigntyNote: "Pokagon Band serves members across Michigan and Indiana with sovereign health programs." },
];

export const TRIBAL_HEALTH_SUMMARY = {
  tribesCount: 12,
  cancerMortalityAboveNational: 67,
  suidRateVsWhite: 4,
  nativeRentersUnaffordableHousing: 50,
  tribesInMiHIN: 8,
  fqhcCertifiedHealthCenters: 2,
  source: "GLITC AIAN Health Profile 2021 \u00B7 Michigan LARA FQHC Directory \u00B7 Bridge Michigan 2024",
  sovereigntyStatement: "Michigan's 12 federally recognized tribal nations operate as sovereign governments. Health data is aggregated through the IHS Bemidji Area Office and Great Lakes Inter-Tribal Epidemiology Center (GLITEC). Individual tribal health data reflects self-reported information from publicly available tribal sources.",
};
