/**
 * CDC PLACES historical comparison - 2023 vs 2024 release at ZCTA level.
 * Dataset IDs: 2024 = qnzd-25i4, 2023 = swc5-untb (county) / cwsq-ngmh (tract)
 * Note: swc5-untb is county-level only and returns [] for ZCTA queries.
 *       Fallback: try kee5-23sr (ZCTA-level 2023 release). If both fail, return empty.
 */

const ZCTA_2023_DATASETS = ["swc5-untb", "kee5-23sr"];

export async function fetchZCTAHistorical(zcta: string): Promise<{
  year2024: Record<string, number>;
  year2023: Record<string, number>;
}> {
  const [data2024, data2023] = await Promise.all([
    fetchFromDataset("qnzd-25i4", zcta),
    fetchWithFallback(ZCTA_2023_DATASETS, zcta),
  ]);
  return { year2024: toMap(data2024), year2023: toMap(data2023) };
}

async function fetchFromDataset(datasetId: string, zcta: string): Promise<any[]> {
  try {
    const res = await fetch(`https://data.cdc.gov/resource/${datasetId}.json?locationid=${encodeURIComponent(zcta)}&$limit=1000`, { mode: "cors" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

/** Try multiple dataset IDs in order, returning the first non-empty result. */
async function fetchWithFallback(datasetIds: string[], zcta: string): Promise<any[]> {
  for (const id of datasetIds) {
    const data = await fetchFromDataset(id, zcta);
    if (data.length > 0) return data;
  }
  return [];
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
