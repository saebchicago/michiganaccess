import { motion } from "framer-motion";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

export default function PFASAlertCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <Card className="border-michigan-coral/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-5 w-5 text-michigan-coral-deep" /> PFAS
            Contamination
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border p-3 text-center">
              <AnimatedCounter
                value={250}
                suffix="+"
                className="text-2xl font-bold text-michigan-coral-deep"
              />
              <p className="text-[10px] text-muted-foreground">
                Active investigation sites
              </p>
            </div>
            <div className="rounded-lg border border-border p-3 text-center">
              <AnimatedCounter
                value={102}
                className="text-2xl font-bold text-foreground"
              />
              <p className="text-[10px] text-muted-foreground">
                "Do Not Eat" water bodies
              </p>
            </div>
            <div className="rounded-lg border border-border p-3 text-center">
              <Badge className="bg-michigan-coral text-white text-[10px]">
                Only in US
              </Badge>
              <p className="text-[10px] text-muted-foreground mt-1">
                PFAS deer advisory (Iosco Co.)
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Michigan adopted state PFAS MCLs in 2020: PFOA 8 ppt, PFOS 16 ppt.
            The April 2024 federal EPA rule set 4.0 ppt for both PFOA and PFOS.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="text-xs" asChild>
              <a
                href="https://www.michigan.gov/egle/maps-data/mpart-pfas-gis"
                target="_blank"
                rel="noopener noreferrer"
              >
                EGLE PFAS Map <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
            <Button variant="outline" size="sm" className="text-xs" asChild>
              <a href="https://glpan.org" target="_blank" rel="noopener noreferrer">
                GLPAN Interactive Map <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Source: EGLE MPART, MDHHS Eat Safe Fish Guides, GLPAN
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
