import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const legendItems = (t: (key: string) => string) => [
  { color: "#F4A460", label: t("healthMap.topQuality") },
  { color: "#00A3A1", label: t("healthMap.highQuality") },
  { color: "#4A90E2", label: t("healthMap.goodQuality") },
  { color: "#94a3b8", label: t("healthMap.adequate") },
];

export default function MapLegend() {
  const { t } = useTranslation();
  const items = legendItems(t);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-border bg-card p-3 shadow-md"
    >
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {t("healthMap.qualityScore")}
      </h4>
      <div className="flex flex-col gap-1.5">
        {items.map((item) => (
          <div key={item.color} className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full border border-border"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-foreground">{item.label}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">
        {t("healthMap.demoScores")}
      </p>
    </motion.div>
  );
}
