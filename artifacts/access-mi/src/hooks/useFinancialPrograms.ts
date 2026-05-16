import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type FinancialProgram = Tables<"financial_programs">;

export function useFinancialPrograms(programType?: string) {
  return useQuery({
    queryKey: ["financial_programs", programType],
    queryFn: async () => {
      let query = supabase.from("financial_programs").select("*").eq("is_active", true);
      if (programType) {
        query = query.eq("program_type", programType);
      }
      const { data, error } = await query.order("program_name");
      if (error) throw error;
      return data as FinancialProgram[];
    },
    staleTime: 60 * 60 * 1000, // 1h
  });
}
