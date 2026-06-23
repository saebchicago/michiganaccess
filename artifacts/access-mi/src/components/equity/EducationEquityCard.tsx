import { motion } from "framer-motion";
import { GraduationCap, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

export default function EducationEquityCard() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <GraduationCap className="h-5 w-5 text-primary" /> Education Equity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-michigan-coral/20 bg-michigan-coral/5 p-3 text-center">
              <AnimatedCounter value={27.9} decimals={1} suffix="%" className="text-2xl font-bold text-michigan-coral-deep" />
              <p className="text-[10px] text-muted-foreground">Chronic absenteeism statewide</p>
              <p className="text-[9px] text-michigan-coral-deep mt-0.5">38.6% for economically disadvantaged</p>
            </div>
            <div className="rounded-lg border border-michigan-forest/20 bg-michigan-forest/5 p-3 text-center">
              <AnimatedCounter value={84} suffix="%" className="text-2xl font-bold text-michigan-forest-deep" />
              <p className="text-[10px] text-muted-foreground">Graduation rate (record high)</p>
              <Badge variant="outline" className="text-[8px] mt-1 border-michigan-forest/30 text-michigan-forest-deep">2024-25</Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">196 school-based health centers serve 37,000+ children across 52% of Michigan counties. Detroit DPSCD: 60.9% chronic absenteeism - highest in state.</p>
          <div className="flex justify-between items-center">
            <p className="text-[10px] text-muted-foreground">Source: MDE 2024-25, SCHA-MI</p>
            <a href="https://www.mischooldata.org" target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">MI School Data <ExternalLink className="h-2.5 w-2.5" /></a>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
