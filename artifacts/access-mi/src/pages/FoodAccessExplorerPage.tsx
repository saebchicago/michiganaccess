import Layout from "@/components/layout/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";
import { FoodAccessExplorer } from "@/components/charts/multivar/FoodAccessExplorer";

export default function FoodAccessExplorerPage() {
  usePageMeta({
    title: "Food Access Explorer",
    description:
      "Multi-variable view of USDA SNAP enrollment and retailer access across all 83 Michigan counties, with primary-source provenance and transparent benchmark math.",
    path: "/food-access",
  });
  return (
    <Layout>
      <div className="container max-w-6xl py-10 sm:py-14">
        <div className="mb-7 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Data Explorer / Vertical Slice
          </p>
          <h1 className="font-display text-3xl sm:text-4xl tracking-tight text-foreground">
            Where food access breaks.
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            USDA SNAP enrollment and retailer access. Statewide. Every figure
            VERIFIED to a primary federal source. Missing values show as
            distinct coverage states, not gaps.
          </p>
        </div>
        <FoodAccessExplorer />
      </div>
    </Layout>
  );
}
