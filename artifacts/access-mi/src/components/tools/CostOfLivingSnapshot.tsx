import { motion } from "framer-motion";
import { DollarSign, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Census ACS 1-year 2024, Michigan and United States:
//   Median gross rent: table B25064.
//   Median monthly owner costs, housing units with a mortgage: table B25088.
// Gas, electricity, grocery and premium rows were removed 2026-11-20: their
// values had no recorded period and could not be traced to a primary release
// (BLS CPI also publishes no state price levels, so a "grocery index" cannot
// come from it). Re-add only with a primary source and period.
const COST_DATA = [
  { label: "Median Rent", icon: Home, mi: 1168, nat: 1487, unit: "/mo" },
  { label: "Median Mortgage", icon: Home, mi: 1573, nat: 2035, unit: "/mo" },
];

export default function CostOfLivingSnapshot() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-5 w-5 text-michigan-gold-deep" />
            Michigan vs. National Housing Costs
          </CardTitle>
          <CardDescription>Statewide medians. Your county may vary.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Comparison bars */}
          <div className="space-y-3">
            {COST_DATA.map((item) => {
              const cheaper = item.mi < item.nat;
              const maxVal = Math.max(item.mi, item.nat);
              const miPct = (item.mi / maxVal) * 100;
              const natPct = (item.nat / maxVal) * 100;
              const diff = ((item.mi - item.nat) / item.nat * 100).toFixed(0);

              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <item.icon className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-foreground">{item.label}</span>
                    </div>
                    <Badge variant="outline" className={`text-[8px] ${cheaper ? "text-michigan-forest-deep border-michigan-forest/30" : "text-michigan-coral-deep border-michigan-coral/30"}`}>
                      {cheaper ? `${Math.abs(+diff)}% lower` : `${diff}% higher`}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-muted-foreground w-8">MI</span>
                      <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${miPct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6 }}
                          className={`h-full rounded-full flex items-center px-1.5 ${cheaper ? "bg-michigan-forest" : "bg-michigan-coral"}`}
                        >
                          <span className="text-[8px] font-bold text-white whitespace-nowrap">
                            ${typeof item.mi === "number" && item.mi >= 100 ? item.mi.toLocaleString() : item.mi}{item.unit}
                          </span>
                        </motion.div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-muted-foreground w-8">US</span>
                      <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${natPct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6, delay: 0.1 }}
                          className="h-full rounded-full bg-muted-foreground/40 flex items-center px-1.5"
                        >
                          <span className="text-[8px] font-bold text-white whitespace-nowrap">
                            ${typeof item.nat === "number" && item.nat >= 100 ? item.nat.toLocaleString() : item.nat}{item.unit}
                          </span>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[10px] text-muted-foreground">
            Source: Census ACS 1-year 2024, tables B25064 (median gross rent) and B25088 (median monthly owner costs with a mortgage).
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
