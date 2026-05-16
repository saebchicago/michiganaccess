/**
 * Generic data.michigan.gov SODA API wrapper.
 * No API key needed for public datasets.
 *
 * Usage:
 *   const data = await fetchSocrata("abc1-2345", { $where: "county='Wayne'", $limit: "100" });
 */

const BASE_URL = "https://data.michigan.gov/resource";

export interface SoqlParams {
  $where?: string;
  $select?: string;
  $group?: string;
  $order?: string;
  $limit?: string;
  $offset?: string;
  [key: string]: string | undefined;
}

export async function fetchSocrata<T = Record<string, unknown>>(
  datasetId: string,
  params?: SoqlParams
): Promise<T[]> {
  const url = new URL(`${BASE_URL}/${datasetId}.json`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, value);
    });
  }

  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

/**
 * Common Michigan datasets on data.michigan.gov:
 *
 * COVID Testing:        "d5j2-ask7"
 * Vital Records:        check MDHHS portal
 * LARA Licensing:       "ngam-ygsp" (childcare)
 * MI School Data:       "y53y-7a7y" (student counts)
 */
