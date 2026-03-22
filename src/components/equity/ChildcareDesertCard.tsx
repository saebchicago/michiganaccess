import { motion } from "framer-motion";
import { Baby, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

export default function ChildcareDesertCard() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Baby className="h-5 w-5 text-michigan-coral" /> Childcare Deserts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border p-3 text-center">
              <AnimatedCounter value={125000} suffix="+" className="text-2xl font-bold text-michigan-coral" />
              <p className="text-[10px] text-muted-foreground">Children lacking a formal childcare slot</p>
            </div>
            <div className="rounded-lg border border-border p-3 text-center">
              <span className="text-2xl font-bold text-foreground">$10K+</span>
              <p className="text-[10px] text-muted-foreground">Average annual childcare cost per child</p>
            </div>
          </div>
          <div className="rounded-lg border border-michigan-coral/20 bg-michigan-coral/5 p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-michigan-coral shrink-0 mt-0.5" />
            <p className="text-xs text-foreground">Childcare deserts force ALICE families out of the workforce. Rural counties — Lake, Oscoda, Montmorency, Crawford, Missaukee — have the worst gaps.</p>
          </div>
          <p className="text-[10px] text-muted-foreground">Source: Bipartisan Policy Center childcaregap.org, LARA Licensed Providers, Census ACS</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
