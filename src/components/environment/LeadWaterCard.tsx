import { motion } from "framer-motion";
import { Droplets, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LeadWaterCard() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Droplets className="h-5 w-5 text-michigan-teal" /> Lead Service Lines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">Post-Flint, Michigan mandated lead service line replacement statewide. The Lead & Copper Rule Revisions (LCRR) require all water systems to inventory and replace lead lines.</p>
          <p className="text-xs text-muted-foreground">Flint: 98% replaced, ~500 remaining. Spring 2026 work scheduled to complete.</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="text-xs" asChild>
              <a href="https://www.michigan.gov/egle/about/featured/mi-lead-safe" target="_blank" rel="noopener">MiLeadSafe Dashboard <ExternalLink className="ml-1 h-3 w-3" /></a>
            </Button>
            <Button variant="outline" size="sm" className="text-xs" asChild>
              <a href="https://www.safewaterengineering.com/hottopics/milslrtracker" target="_blank" rel="noopener">Planet Detroit Tracker <ExternalLink className="ml-1 h-3 w-3" /></a>
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">Source: EGLE Lead & Copper Rule, MiLeadSafe, MiTracking</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
