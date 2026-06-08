/**
 * FRED data client - fetches CSV time series without API key.
 * Uses the direct graph download endpoint.
 */

export const FRED_SERIES = {
  miUnemployment: "MIUR",
  detroitCPI: "CUURA207SA0",
} as const;

export interface FredDataPoint {
  date: string;
  value: number;
}

export async function fetchFredSeries(seriesId: string): Promise<FredDataPoint[]> {
  try {
    const res = await fetch(
      `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${seriesId}&cosd=2023-01-01`
    );
    if (!res.ok) return [];
    const text = await res.text();
    return text
      .split("\n")
      .slice(1)
      .filter(Boolean)
      .map((line) => {
        const [date, val] = line.split(",");
        const value = parseFloat(val);
        return { date: date?.trim(), value };
      })
      .filter((d) => !isNaN(d.value) && d.value > 0);
  } catch {
    return [];
  }
}
