/**
 * DemographicBreakdown — Live ACS demographic visualizations for a place.
 * Race/ethnicity bar chart, income, housing tenure, education attainment.
 */
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCensusACS, getCensusValue, formatDollars, formatCount, formatPercent } from "@/hooks/useCensusACS";
import { getCountyFips } from "@/data/census-geographies";
import type { Place } from "@/models/Place";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--accent))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--secondary))",
];

export default function DemographicBreakdown({ place }: { place: Place }) {
  const countyName = place.parentCounty || place.name.replace(/ County$/, "");
  const fips = getCountyFips(countyName);

  const { data, isLoading, error } = useCensusACS({
    tables: ["B02001", "B19013", "B25003", "B15003", "B01001"],
    geoType: "county",
    geoFips: fips || "",
    enabled: !!fips,
  });

  // Also fetch state-level for comparison
  const { data: stateData } = useCensusACS({
    tables: ["B19013"],
    geoType: "state",
    geoFips: "26",
    enabled: !!fips,
  });

  const raceData = useMemo(() => {
    if (!data) return [];
    const total = getCensusValue(data, "B02001", "B02001_001E") || 1;
    const items = [
      { name: "White", value: getCensusValue(data, "B02001", "B02001_002E") },
      { name: "Black", value: getCensusValue(data, "B02001", "B02001_003E") },
      { name: "Asian", value: getCensusValue(data, "B02001", "B02001_005E") },
      { name: "Indigenous", value: getCensusValue(data, "B02001", "B02001_004E") },
      { name: "Two+", value: getCensusValue(data, "B02001", "B02001_008E") },
      { name: "Other", value: getCensusValue(data, "B02001", "B02001_007E") },
    ];
    return items
      .filter((i) => i.value && i.value > 0)
      .map((i) => ({ ...i, pct: ((i.value! / total) * 100).toFixed(1) }));
  }, [data]);

  const tenureData = useMemo(() => {
    if (!data) return [];
    const own = getCensusValue(data, "B25003", "B25003_002E");
    const rent = getCensusValue(data, "B25003", "B25003_003E");
    if (!own && !rent) return [];
    return [
      { name: "Owner-occupied", value: own || 0 },
      { name: "Renter-occupied", value: rent || 0 },
    ];
  }, [data]);

  const medianIncome = getCensusValue(data, "B19013", "B19013_001E");
  const stateMedianIncome = getCensusValue(stateData, "B19013", "B19013_001E");
  const totalPop = getCensusValue(data, "B01001", "B01001_001E");

  if (error) {
    return (
      <Card className="border-destructive/20">
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          Census data temporarily unavailable. Try refreshing.
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}><CardContent className="py-6"><Skeleton className="h-40 w-full" /></CardContent></Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 flex-wrap">
        <h3 className="text-lg font-bold text-foreground">Census Demographics</h3>
        <Badge variant="outline" className="text-[10px]">ACS 5-Year 2023</Badge>
        <Badge variant="secondary" className="text-[10px]">U.S. Census Bureau</Badge>
      </div>

      {/* Key Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-foreground">{formatCount(totalPop)}</p>
            <p className="text-xs text-muted-foreground">Population</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-foreground">{formatDollars(medianIncome)}</p>
            <p className="text-xs text-muted-foreground">Median Income</p>
            {stateMedianIncome && medianIncome && (
              <p className={`text-[10px] mt-1 ${medianIncome >= stateMedianIncome ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
                {medianIncome >= stateMedianIncome ? "≥" : "<"} State avg ({formatDollars(stateMedianIncome)})
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-foreground">{formatCount(getCensusValue(data, "B25003", "B25003_001E"))}</p>
            <p className="text-xs text-muted-foreground">Housing Units</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-foreground">
              {formatPercent(getCensusValue(data, "B15003", "B15003_022E"), getCensusValue(data, "B15003", "B15003_001E"))}
            </p>
            <p className="text-xs text-muted-foreground">Bachelor's Degree+</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Race/Ethnicity */}
        {raceData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Race & Ethnicity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={raceData} layout="vertical" margin={{ left: 60, right: 20 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} domain={[0, "auto"]} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={55} />
                  <Tooltip formatter={(v: number) => [`${v}%`, "Share"]} />
                  <Bar dataKey="pct" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Housing Tenure */}
        {tenureData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Housing Tenure</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={tenureData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {tenureData.map((_, idx) => (
                      <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [formatCount(v), "Units"]} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        Source: U.S. Census Bureau, American Community Survey 5-Year Estimates (2023). Margins of error apply.
      </p>
    </div>
  );
}
