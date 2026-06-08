export interface ImpactStoryStat {
  label: string;
  value: string;
  source: string;
}

export interface ImpactStory {
  id: string;
  title: string;
  subtitle: string;
  narrative: string;
  stats: ImpactStoryStat[];
  takeaway: string;
  href: string;
}

export const IMPACT_STORIES: ImpactStory[] = [
  {
    id: "seven-mile-divide",
    title: "The 7-Mile Divide",
    subtitle: "48204 vs 48236 - two ZIPs, 7 miles apart, worlds apart in health outcomes",
    narrative:
      "ZIP 48204 (west Detroit) and 48236 (Grosse Pointe) sit just 7 miles apart, but life expectancy differs by over 15 years. Diabetes prevalence in 48204 is 18.2% vs 7.1% in 48236. Average adjusted gross income in 48236 is 5.8x higher. The gap isn't geography - it's infrastructure.",
    stats: [
      { label: "Diabetes (48204)", value: "18.2%", source: "CDC PLACES 2024" },
      { label: "Diabetes (48236)", value: "7.1%", source: "CDC PLACES 2024" },
      { label: "AGI gap", value: "5.8x", source: "IRS SOI 2021" },
    ],
    takeaway:
      "Health outcomes in Michigan are shaped more by ZIP code than genetic code. Targeted investment in high-need ZIPs can close measurable gaps.",
    href: "/zip/48204?compare=48236",
  },
  {
    id: "up-gap",
    title: "The Upper Peninsula Gap",
    subtitle: "Keweenaw vs Washtenaw - PCP access at opposite extremes",
    narrative:
      "Keweenaw County in the Upper Peninsula has 1 primary care physician for every 3,400 residents. Washtenaw County (Ann Arbor) has 1 for every 380. Residents in Keweenaw travel an average of 45 minutes for routine care, compared to 8 minutes in Washtenaw. Telehealth could bridge part of this gap, but only 62% of UP households have broadband speeds sufficient for video visits.",
    stats: [
      { label: "Keweenaw PCP ratio", value: "1:3,400", source: "HRSA Area Health Resource File" },
      { label: "Washtenaw PCP ratio", value: "1:380", source: "HRSA Area Health Resource File" },
      { label: "UP broadband gap", value: "38%", source: "FCC BDC 2024" },
    ],
    takeaway:
      "Provider deserts in the UP are compounded by broadband gaps that prevent telehealth from filling in. Infrastructure investment must address both simultaneously.",
    href: "/health-equity-atlas",
  },
  {
    id: "211-calls",
    title: "Where 211 Calls Come From",
    subtitle: "Top 3 counties driving Michigan's social services demand",
    narrative:
      "Wayne, Kent, and Genesee counties account for over 40% of all 211 calls in Michigan. The top request categories are housing assistance (31%), utility help (22%), and food programs (18%). Genesee County's per-capita call rate is 2.3x the state average, reflecting the lingering effects of the Flint water crisis on community trust and resource need.",
    stats: [
      { label: "Wayne Co. share", value: "24%", source: "MI 211 / United Way" },
      { label: "Top request", value: "Housing (31%)", source: "MI 211 / United Way" },
      { label: "Genesee per-capita", value: "2.3x avg", source: "MI 211 / United Way" },
    ],
    takeaway:
      "211 call volume is a real-time barometer of unmet need. Counties with elevated per-capita rates signal structural gaps, not just larger populations.",
    href: "/resources",
  },
  {
    id: "fqhc-reach",
    title: "The FQHC Reach Problem",
    subtitle: "Federally qualified health centers serve millions - but coverage is uneven",
    narrative:
      "Michigan's 42 FQHCs operate 340+ delivery sites and serve over 750,000 patients annually. Yet HRSA GeoCare data shows that 28% of Michigan ZIPs have no FQHC within 30 minutes' drive. These underserved ZIPs are disproportionately rural and have uninsured rates averaging 9.2%, nearly double the state figure of 5.2%.",
    stats: [
      { label: "FQHC patients", value: "750K+", source: "HRSA UDS 2023" },
      { label: "ZIPs without FQHC", value: "28%", source: "HRSA GeoCare Navigator" },
      { label: "Uninsured in gaps", value: "9.2%", source: "Census ACS 2022" },
    ],
    takeaway:
      "FQHC expansion alone won't close the access gap. Mobile health units and telehealth integration are needed for the 28% of ZIPs beyond a 30-minute drive.",
    href: "/find-care",
  },
  {
    id: "energy-health",
    title: "Energy Burden + Health",
    subtitle: "Counties with high energy burden show 1.4x higher diabetes rates",
    narrative:
      "An analysis of DOE LEAD data and CDC PLACES reveals that Michigan counties where households spend more than 8% of income on energy have diabetes prevalence rates 1.4x higher than counties below that threshold. The correlation persists after controlling for income, suggesting that energy insecurity - choosing between heating and medication - has direct health consequences.",
    stats: [
      { label: "High-burden counties", value: "29 of 83", source: "DOE LEAD Tool" },
      { label: "Diabetes multiplier", value: "1.4x", source: "CDC PLACES + DOE LEAD" },
      { label: "Energy burden threshold", value: ">8% income", source: "DOE definition" },
    ],
    takeaway:
      "Energy assistance programs like LIHEAP and weatherization don't just save money - they may reduce downstream healthcare costs by alleviating the heat-or-eat dilemma.",
    href: "/energy-burden",
  },
  {
    id: "screening-gap",
    title: "The Screening Gap",
    subtitle: "Trinity Health's funnel reveals the scale of unconnected patients",
    narrative:
      "Trinity Health Michigan screens over 1 million outpatients annually. Of those, 27.4% screen positive for at least one social determinant of health need. But only 11% of positive screens result in a confirmed referral to a community resource, and follow-through to actual service connection drops below 4%. The gap between identification and resolution represents tens of thousands of unmet needs per year.",
    stats: [
      { label: "Annual screens", value: "1M+", source: "Trinity Health published data" },
      { label: "Positive rate", value: "27.4%", source: "Trinity Health published data" },
      { label: "Service connection", value: "<4%", source: "Trinity Health published data" },
    ],
    takeaway:
      "Screening without a closed-loop referral network is identification without resolution. Platforms that connect screening to community resources can dramatically improve that 4% connection rate.",
    href: "/detection-gap",
  },
];
