import { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, Home, Fuel, Zap, ShoppingCart, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Source: Census ACS 2023 (rent/mortgage), AAA (gas), EIA (electricity), BLS CPI (groceries), KFF (health premiums)
const COST_DATA = [
  { label: "Median Rent", icon: Home, mi: 1058, nat: 1163, unit: "/mo" },
  { label: "Median Mortgage", icon: Home, mi: 1339, nat: 1672, unit: "/mo" },
  { label: "Gas Price", icon: Fuel, mi: 3.92, nat: 3.68, unit: "/gal" },
  { label: "Electricity", icon: Zap, mi: 19.8, nat: 17.5, unit: "¢/kWh" },
  { label: "Grocery Index", icon: ShoppingCart, mi: 95.2, nat: 100, unit: " (100=avg)" },
  { label: "Health Premium", icon: Heart, mi: 7200, nat: 7739, unit: "/yr" },
];

export default function CostOfLivingSnapshot() {
  const [householdSize, setHouseholdSize] = useState(2);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-5 w-5 text-michigan-gold-deep" />
            Michigan vs. National Cost of Living
          </CardTitle>
          <CardDescription>Based on statewide averages. Your county may vary.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Household toggle */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Household:</span>
            {[1, 2, 4].map((n) => (
              <button
                key={n}
                onClick={() => setHouseholdSize(n)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors ${
                  householdSize === n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {n} {n === 1 ? "person" : "people"}
              </button>
            ))}
          </div>

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
            Sources: Census ACS 2023 (rent/mortgage), AAA (gas), EIA (electricity), BLS CPI (groceries), KFF (health premiums).
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
