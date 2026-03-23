import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COUNTY_CRIME, MI_AVG_VIOLENT, MI_AVG_PROPERTY } from "@/data/crime-data";

interface CrimeSafetyCardProps {
  county: string;
}

function RateBar({ label, value, stateAvg }: { label: string; value: number; stateAvg: number }) {
  const ratio = value / stateAvg;
  const belowAvg = value <= stateAvg;
  const barColor = belowAvg ? "bg-green-500" : "bg-red-500";
  const barWidth = Math.min(ratio * 100, 200); // cap at 200%

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-semibold ${belowAvg ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
          {value.toLocaleString()} per 100K
        </span>
      </div>
      <div className="relative h-3 w-full rounded-full bg-muted overflow-hidden">
        <motion.div
          className={`absolute left-0 top-0 h-full rounded-full ${barColor}`}
          initial={{ width: 0 }}
          whileInView={{ width: `${Math.min(barWidth, 100)}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        {/* State average marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-foreground/40"
          style={{ left: `${Math.min((stateAvg / (Math.max(value, stateAvg) * 1.1)) * 100, 100)}%` }}
          title={`MI avg: ${stateAvg}`}
        />
      </div>
      <p className="text-[9px] text-muted-foreground">
        MI avg: {stateAvg.toLocaleString()} &mdash; {belowAvg ? `${Math.round((1 - ratio) * 100)}% below` : `${Math.round((ratio - 1) * 100)}% above`}
      </p>
    </div>
  );
}

export default function CrimeSafetyCard({ county }: CrimeSafetyCardProps) {
  const data = COUNTY_CRIME.find(
    (c) => c.county.toLowerCase() === county.toLowerCase()
  );

  if (!data) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          No crime data available for {county} County.
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-5 w-5 text-michigan-teal" />
            {data.county} County Crime Safety
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RateBar label="Violent Crime" value={data.violentPer100K} stateAvg={MI_AVG_VIOLENT} />
          <RateBar label="Property Crime" value={data.propertyPer100K} stateAvg={MI_AVG_PROPERTY} />

          <p className="text-[9px] text-muted-foreground pt-1">
            Based on 2022 FBI/MICR data.{" "}
            <a
              href="https://michigan.gov/msp"
              target="_blank"
              rel="noopener"
              className="text-primary hover:underline"
            >
              michigan.gov/msp
            </a>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
