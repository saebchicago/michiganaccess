import { motion } from "framer-motion";
import { Phone, ExternalLink, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MI_TRIBAL_NATIONS } from "@/data/tribal-health";

export default function TribalHealthSection() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-5 w-5 text-michigan-forest" /> Michigan Tribal Health Facilities
          </CardTitle>
          <CardDescription>
            12 federally recognized tribal nations operate independent health systems
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            {MI_TRIBAL_NATIONS.map((t) => (
              <div key={t.tribe} className="rounded-lg border border-border p-3 space-y-1">
                <p className="text-xs font-semibold text-foreground">{t.tribe}</p>
                <p className="text-[10px] text-muted-foreground">{t.healthCenter} · {t.county} County</p>
                <a href={`tel:${t.phone}`} className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline">
                  <Phone className="h-2.5 w-2.5" /> {t.phone}
                </a>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-[10px] text-muted-foreground">
              Tribal health centers primarily serve enrolled tribal members. Some accept other Native Americans in their service area.
              Contact the health center directly for eligibility.
            </p>
          </div>

          <Button variant="outline" size="sm" className="text-xs" asChild>
            <a href="https://www.ihs.gov/findhealthcare/" target="_blank" rel="noopener">
              Find IHS Facilities <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </Button>
          <p className="text-[9px] text-muted-foreground mt-2">Source: Michigan EADC, Indian Health Service</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
