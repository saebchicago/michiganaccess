import { motion } from "framer-motion";

const legendItems = [
  { color: "#F4A460", label: "Top Quality (90–100)" },
  { color: "#00A3A1", label: "High Quality (75–89)" },
  { color: "#4A90E2", label: "Good Quality (60–74)" },
  { color: "#94a3b8", label: "Adequate / No Data" },
];

export default function MapLegend() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-border bg-card p-3 shadow-md"
    >
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Quality Score
      </h4>
      <div className="flex flex-col gap-1.5">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full border border-border"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-foreground">{item.label}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">
        Scores are demo data. Real data from CMS, Leapfrog, ANCC.
      </p>
    </motion.div>
  );
}
