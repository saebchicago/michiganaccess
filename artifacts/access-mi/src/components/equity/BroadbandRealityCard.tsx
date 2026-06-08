import { motion } from "framer-motion";
import { Wifi, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

export default function BroadbandRealityCard() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wifi className="h-5 w-5 text-primary" /> Broadband: Availability ≠ Adoption
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-michigan-coral/20 bg-michigan-coral/5 p-3 text-center">
              <AnimatedCounter value={492} suffix="K" className="text-2xl font-bold text-michigan-coral" />
              <p className="text-[10px] text-muted-foreground">Unserved/underserved (infrastructure)</p>
            </div>
            <div className="rounded-lg border border-michigan-gold/20 bg-michigan-gold/5 p-3 text-center">
              <AnimatedCounter value={730} suffix="K" className="text-2xl font-bold text-michigan-gold" />
              <p className="text-[10px] text-muted-foreground">Facing adoption barriers</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">FCC says broadband is "available" - but Microsoft telemetry shows actual usage is far lower. BEAD's $1.559B builds infrastructure, but affordability and digital literacy gaps persist.</p>
          <Button variant="outline" size="sm" className="text-xs" asChild>
            <a href="https://michiganbroadbandmap.com/" target="_blank" rel="noopener">Michigan Broadband Map <ExternalLink className="ml-1 h-3 w-3" /></a>
          </Button>
          <p className="text-[10px] text-muted-foreground">Source: Michigan BEAD Five-Year Action Plan, Microsoft Airband, FCC BDC, Michigan Moonshot</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
