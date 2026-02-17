import { motion } from "framer-motion";
import { Check, X, Minus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type CellValue = "yes" | "no" | "partial";

interface Feature {
  label: string;
  michigan: CellValue;
  twoOneOne: CellValue;
  healthPlan: CellValue;
}

const features: Feature[] = [
  { label: "Quality-ranked results (not pay-to-play)", michigan: "yes", twoOneOne: "no", healthPlan: "no" },
  { label: "All 83 Michigan counties", michigan: "yes", twoOneOne: "partial", healthPlan: "partial" },
  { label: "Provider ratings & credentials", michigan: "yes", twoOneOne: "no", healthPlan: "partial" },
  { label: "Insurance appeal tools", michigan: "yes", twoOneOne: "no", healthPlan: "no" },
  { label: "Social services (food, housing, transit)", michigan: "yes", twoOneOne: "yes", healthPlan: "no" },
  { label: "Real-time transit & air quality", michigan: "yes", twoOneOne: "no", healthPlan: "no" },
  { label: "Equity-adjusted scoring", michigan: "yes", twoOneOne: "no", healthPlan: "no" },
  { label: "Free & no account required", michigan: "yes", twoOneOne: "yes", healthPlan: "no" },
];

const CellIcon = ({ value }: { value: CellValue }) => {
  switch (value) {
    case "yes":
      return <Check className="h-4 w-4 text-michigan-forest mx-auto" />;
    case "no":
      return <X className="h-4 w-4 text-destructive/60 mx-auto" />;
    case "partial":
      return <Minus className="h-4 w-4 text-michigan-gold mx-auto" />;
  }
};

export default function ComparisonTable() {
  return (
    <section className="container py-12" aria-label="Platform comparison">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-3xl"
      >
        <h2 className="text-xl font-bold text-foreground text-center mb-1">
          How We Compare
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Michigan Access vs. other resource directories
        </p>

        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[45%] text-xs font-semibold">Feature</TableHead>
                <TableHead className="text-center text-xs font-semibold text-primary">Michigan Access</TableHead>
                <TableHead className="text-center text-xs font-semibold">211</TableHead>
                <TableHead className="text-center text-xs font-semibold">Health Plan Dirs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {features.map((f) => (
                <TableRow key={f.label}>
                  <TableCell className="text-xs font-medium py-2.5">{f.label}</TableCell>
                  <TableCell className="text-center py-2.5"><CellIcon value={f.michigan} /></TableCell>
                  <TableCell className="text-center py-2.5"><CellIcon value={f.twoOneOne} /></TableCell>
                  <TableCell className="text-center py-2.5"><CellIcon value={f.healthPlan} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <p className="text-[10px] text-muted-foreground text-center mt-3">
          Comparison based on publicly available features as of 2026. "Partial" = limited coverage or functionality.
        </p>
      </motion.div>
    </section>
  );
}
