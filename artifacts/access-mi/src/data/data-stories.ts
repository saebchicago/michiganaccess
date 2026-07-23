export interface DataStory {
  id: string;
  title: string;
  hook: string;
  narrative: string;
  stat: { value: number; label: string; suffix: string };
  source: string;
  href: string;
  color: string;
  /** Counties this story names directly (by county name, e.g. "Wayne").
   *  Omitted = statewide story. Used for county-page cross-links. */
  counties?: string[];
}

export const DATA_STORIES: DataStory[] = [
  {
    id: "alice-gap",
    title: "The Invisible 41%",
    hook: "They work full-time but can't afford the basics.",
    narrative:
      "41% of Michigan households fall below the ALICE Threshold - earning too much for most assistance programs but not enough to cover housing, childcare, food, and healthcare.",
    stat: {
      value: 41,
      label: "of households below ALICE Threshold",
      suffix: "%",
    },
    source: "United For ALICE 2023",
    href: "/equity",
    color: "hsl(var(--coral-deep))",
  },
  {
    id: "pfas-water",
    title: "Forever Chemicals in Michigan's Water",
    hook: "102 water bodies. One word: PFAS.",
    narrative:
      "Michigan has investigated 250+ PFAS sites. State MCLs adopted in 2020: PFOA 8 ppt, PFOS 16 ppt. The April 2024 federal EPA rule sets 4.0 ppt for PFOA/PFOS. Michigan is the only state with a PFAS deer advisory.",
    stat: { value: 102, label: "'Do Not Eat' water bodies", suffix: "" },
    source: "EGLE MPART, MDHHS",
    href: "/environment#water-safety",
    color: "hsl(var(--warm-gold-deep))",
  },
  {
    id: "reentry-success",
    title: "Michigan's Quiet Revolution",
    hook: "Prison population down 36%. Recidivism at historic lows.",
    narrative:
      "Michigan's incarcerated population dropped from 51,554 (2007 peak) to 32,778 - the lowest since 1991. Three-year recidivism hit 21.0%, a historic low.",
    stat: { value: 21, label: "recidivism rate (historic low)", suffix: "%" },
    source: "MDOC 2025",
    href: "/reentry",
    color: "hsl(var(--forest-green-deep))",
  },
  {
    id: "childcare-crisis",
    title: "The Childcare Cliff",
    hook: "125,000 Michigan children have nowhere to go.",
    narrative:
      "There are ~125,000 more children under 5 with working parents than licensed childcare slots. Rural counties are hardest hit. Average cost exceeds $10K/year per child.",
    stat: {
      value: 125000,
      label: "children without a childcare slot",
      suffix: "",
    },
    source: "BPC, LARA, Census ACS",
    href: "/equity",
    color: "hsl(var(--michigan-blue))",
  },
  {
    id: "disaster-acceleration",
    title: "Michigan's Rising Disaster Risk",
    hook: "Federal disaster declarations have doubled in two decades.",
    narrative:
      "Michigan has seen a dramatic increase in federal disaster declarations since the 2000s. Flooding, severe storms, and the 2020 Midland Dam failure highlight accelerating climate and infrastructure risks.",
    stat: { value: 70, label: "years of FEMA disaster data", suffix: "+" },
    source: "FEMA OpenFEMA API",
    href: "/disaster-history",
    counties: ["Midland"],
    color: "hsl(var(--coral))",
  },
  {
    id: "dental-desert",
    title: "The Smile Gap",
    hook: "59 of 83 counties can't find a dentist.",
    narrative:
      "Nearly three-quarters of Michigan counties have dental health professional shortage areas. 12 counties have fewer than 5 dentists total.",
    stat: { value: 59, label: "of 83 counties with dental HPSAs", suffix: "" },
    source: "MDHHS, HRSA",
    href: "/equity",
    color: "hsl(var(--teal-deep))",
  },
  {
    id: "rx-kids-outcomes",
    title: "Cash Before Birth",
    hook: "Flint babies are being born healthier since unconditional cash payments began.",
    narrative:
      "A quasi-experimental study of Rx Kids, Flint's unconditional cash-prescription program for pregnant residents and new parents, found significantly fewer preterm and low-birthweight births among enrolled families compared to similar cities.",
    stat: { value: 18, label: "fewer preterm births in Flint", suffix: "%" },
    source: "Lancet Public Health, 2026",
    href: "/early-childhood",
    counties: ["Genesee"],
    color: "hsl(var(--forest-green-deep))",
  },
  {
    id: "prek-for-all-coverage",
    title: "Half a Class Behind",
    hook: "Record preschool enrollment, still only half the eligible kids.",
    narrative:
      "Michigan's Great Start Readiness Program hit a record ~55,000 four-year-olds enrolled - more than double since 2021. But that's roughly 59,000 funded seats against about 118,000 Michigan four-year-olds, so PreK for All still covers only about half the eligible children.",
    stat: { value: 50, label: "of eligible four-year-olds have a funded seat", suffix: "%" },
    source: "MiLEAP, Mar 2026",
    href: "/early-childhood",
    color: "hsl(var(--michigan-blue))",
  },
];
