import { motion } from "framer-motion";
import { Smile, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

export default function DentalDesertCard() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Smile className="h-5 w-5 text-michigan-gold-deep" /> Dental Health Deserts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-michigan-coral/20 bg-michigan-coral/5 p-3 text-center">
              <span className="text-2xl font-bold text-michigan-coral-deep">59 of 83</span>
              <p className="text-[10px] text-muted-foreground">Counties with dental HPSAs</p>
            </div>
            <div className="rounded-lg border border-border p-3 text-center">
              <AnimatedCounter value={12} className="text-2xl font-bold text-foreground" />
              <p className="text-[10px] text-muted-foreground">Counties with &lt;5 dentists</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Medicaid dental coverage exists but provider participation is low in rural areas. FQHCs with dental services can fill gaps.</p>
          <p className="text-[10px] text-muted-foreground">Source: MDHHS Oral Health Epidemiology, HRSA HPSA</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
