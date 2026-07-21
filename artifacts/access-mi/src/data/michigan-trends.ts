export interface TrendPoint {
  year: number;
  value: number;
}

export const MICHIGAN_TRENDS: Record<string, { data: TrendPoint[]; label: string; unit: string; insight: string; source: string; color: string; improving: "down" | "up" }> = {
  uninsuredRate: {
    data: [
      { year: 2013, value: 11.0 }, { year: 2014, value: 8.5 }, { year: 2015, value: 6.4 },
      { year: 2016, value: 5.4 }, { year: 2017, value: 5.2 }, { year: 2018, value: 5.6 },
      { year: 2019, value: 5.4 }, { year: 2020, value: 5.2 }, { year: 2021, value: 5.5 },
      { year: 2022, value: 5.6 }, { year: 2023, value: 5.8 },
    ],
    label: "Uninsured Rate",
    unit: "%",
    insight: "Michigan's uninsured rate dropped from 11% to 5.8% after the Healthy Michigan Plan - but gains are at risk from federal Medicaid changes.",
    source: "ACS / MDHHS",
    color: "hsl(var(--chart-1))",
    improving: "down",
  },
  opioidDeaths: {
    data: [
      { year: 2015, value: 1689 }, { year: 2016, value: 2335 }, { year: 2017, value: 2686 },
      { year: 2018, value: 2036 }, { year: 2019, value: 2154 }, { year: 2020, value: 2738 },
      { year: 2021, value: 3040 }, { year: 2022, value: 3074 }, { year: 2023, value: 2844 },
    ],
    label: "Opioid Overdose Deaths",
    unit: "",
    insight: "Opioid deaths peaked at 3,074 in 2022 and declined 7.5% in 2023 - the first drop in 4 years - but remain 68% above 2015 levels.",
    source: "MDHHS / CDC WONDER",
    color: "hsl(var(--coral))",
    improving: "down",
  },
  renewableEnergy: {
    data: [
      { year: 2015, value: 5.8 }, { year: 2016, value: 6.2 }, { year: 2017, value: 7.1 },
      { year: 2018, value: 9.0 }, { year: 2019, value: 10.2 }, { year: 2020, value: 12.1 },
      { year: 2021, value: 13.0 }, { year: 2022, value: 13.7 }, { year: 2023, value: 15.2 },
    ],
    label: "Renewable Energy Share",
    unit: "%",
    insight: "Michigan's renewable energy share grew from 5.8% to 15.2% - on track toward the 100% clean energy standard by 2040, but data center demand may challenge the timeline.",
    source: "U.S. EIA",
    color: "hsl(var(--forest-green))",
    improving: "up",
  },
  childPoverty: {
    data: [
      { year: 2015, value: 22.7 }, { year: 2016, value: 21.5 }, { year: 2017, value: 20.4 },
      { year: 2018, value: 18.9 }, { year: 2019, value: 18.0 }, { year: 2020, value: 17.1 },
      { year: 2021, value: 18.2 }, { year: 2022, value: 16.8 }, { year: 2023, value: 17.5 },
    ],
    label: "Child Poverty Rate",
    unit: "%",
    insight: "Child poverty fell from 22.7% to 16.8% but ticked up to 17.5% in 2023 after the expiration of the expanded Child Tax Credit.",
    source: "ACS / Census",
    color: "hsl(var(--color-amber))",
    improving: "down",
  },
};
