import { useQuery } from "@tanstack/react-query";

export interface DrugRecall {
  recallNumber: string;
  reason: string;
  status: string;
  classification: string;
  productDescription: string;
  recallingFirm: string;
  reportDate: string;
  city: string;
  state: string;
}

export function useDrugRecalls() {
  return useQuery<DrugRecall[]>({
    queryKey: ["fda-drug-recalls"],
    queryFn: async () => {
      try {
        const url =
          'https://api.fda.gov/drug/enforcement.json?search=status:"Ongoing"+AND+classification:"Class+I"&limit=10&sort=report_date:desc';
        const res = await fetch(url);
        if (!res.ok) return [];
        const data = await res.json();
        return (data.results || []).map((r: any) => ({
          recallNumber: r.recall_number || "",
          reason: r.reason_for_recall || "",
          status: r.status || "",
          classification: r.classification || "",
          productDescription: (r.product_description || "").substring(0, 200),
          recallingFirm: r.recalling_firm || "",
          reportDate: r.report_date || "",
          city: r.city || "",
          state: r.state || "",
        }));
      } catch {
        return [];
      }
    },
    staleTime: 6 * 60 * 60 * 1000,
    retry: 1,
  });
}
