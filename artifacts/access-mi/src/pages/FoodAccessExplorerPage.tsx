import { useEffect } from "react";
import { FoodAccessExplorer } from "@/components/charts/multivar/FoodAccessExplorer";

export default function FoodAccessExplorerPage() {
  useEffect(() => {
    const previous = document.title;
    document.title = "Food Access Explorer | AccessMI";
    return () => {
      document.title = previous;
    };
  }, []);
  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-6xl py-10 sm:py-14">
        <div className="mb-7 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Data Explorer / Vertical Slice
          </p>
          <h1 className="font-display text-3xl sm:text-4xl tracking-tight text-foreground">
            Food Access Explorer
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            A polished, multi-variable view of one metric family - USDA SNAP
            enrollment and retailer access for all 83 Michigan counties. Every
            figure traces to a primary federal source. Every benchmark shows its
            math. Counties without a value show distinct coverage states rather
            than disappearing.
          </p>
        </div>
        <FoodAccessExplorer />
      </div>
    </main>
  );
}
