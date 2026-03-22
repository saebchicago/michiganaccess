/**
 * CDC PLACES historical comparison — 2023 vs 2024 release at ZCTA level.
 * Dataset IDs: 2024 = qnzd-25i4, 2023 = swc5-untb (county) / cwsq-ngmh (tract)
 * Note: ZCTA-level historical may use different dataset IDs — try swc5-untb first.
 */

export async function fetchZCTAHistorical(zcta: string): Promise<{
  year2024: Record<string, number>;
  year2023: Record<string, number>;
}> {
  const [data2024, data2023] = await Promise.all([
    fetchFromDataset("qnzd-25i4", zcta),
    fetchFromDataset("swc5-untb", zcta),
  ]);
  return { year2024: toMap(data2024), year2023: toMap(data2023) };
}

async function fetchFromDataset(datasetId: string, zcta: string): Promise<any[]> {
  try {
    const res = await fetch(`https://data.cdc.gov/resource/${datasetId}.json?$where=locationid='${zcta}'&$limit=50`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

function toMap(data: any[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const d of data) {
    if (d.short_question_text && d.data_value) {
      map[d.short_question_text] = parseFloat(d.data_value);
    }
  }
  return map;
}
