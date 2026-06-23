import { motion } from "framer-motion";
import { Home, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

export default function HousingCrisisCard() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Card className="border-michigan-coral/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Home className="h-5 w-5 text-michigan-coral-deep" /> Housing Crisis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border p-3 text-center">
              <AnimatedCounter value={31211} className="text-2xl font-bold text-michigan-coral-deep" />
              <p className="text-[10px] text-muted-foreground">Experienced homelessness (2024)</p>
            </div>
            <div className="rounded-lg border border-border p-3 text-center">
              <span className="text-2xl font-bold text-foreground">3.6×</span>
              <p className="text-[10px] text-muted-foreground">Black households more likely</p>
            </div>
            <div className="rounded-lg border border-border p-3 text-center">
              <AnimatedCounter value={127895} suffix="+" className="text-2xl font-bold text-michigan-gold-deep" />
              <p className="text-[10px] text-muted-foreground">Affordable rental units short</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Emergency shelter: 6,897 beds statewide. In Wayne County, some courts have eviction filing rates above 49% of renting households.</p>
          <p className="text-[10px] text-muted-foreground">Source: HUD PIT Count 2024, MSHDA, Michigan SCAO, NLIHC</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
