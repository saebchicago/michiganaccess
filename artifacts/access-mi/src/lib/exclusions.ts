import { useQuery } from "@tanstack/react-query";

export interface ExclusionRecord {
  uei: string;
  name: string;
  exclusionType: string;
  classification: string;
  activationDate: string;
  samUrl: string;
}

export interface ExclusionsData {
  generatedAt: string;
  source: string;
  count: number;
  records: ExclusionRecord[];
}

export type ExclusionMap = Map<string, ExclusionRecord>;

async function fetchExclusionsData(): Promise<ExclusionsData> {
  const res = await fetch("/data/sam-exclusions.json");
  if (!res.ok) return { generatedAt: "", source: "", count: 0, records: [] };
  return res.json();
}

export function useExclusions(): { map: ExclusionMap; generatedAt: string } {
  const { data } = useQuery({
    queryKey: ["sam-exclusions"],
    queryFn: fetchExclusionsData,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const map: ExclusionMap = new Map(
    (data?.records ?? []).map((r) => [r.uei, r]),
  );
  return { map, generatedAt: data?.generatedAt ?? "" };
}

export function getExclusion(
  map: ExclusionMap,
  uei: string | undefined,
): ExclusionRecord | undefined {
  if (!uei) return undefined;
  return map.get(uei);
}
