import { motion } from "framer-motion";
import { Shield, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

export default function VeteranResourceCard() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-5 w-5 text-primary" /> Michigan Veteran Resources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border p-3 text-center">
              <AnimatedCounter value={582000} suffix="+" className="text-2xl font-bold text-primary" />
              <p className="text-[10px] text-muted-foreground">Michigan veterans</p>
            </div>
            <div className="rounded-lg border border-border p-3 text-center">
              <AnimatedCounter value={50.9} decimals={1} suffix="%" className="text-2xl font-bold text-michigan-gold-deep" />
              <p className="text-[10px] text-muted-foreground">Aged 65+</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Every Michigan county has a Veterans Service Officer. VA healthcare, disability benefits, education (GI Bill), housing assistance, and employment programs available.</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="text-xs" asChild>
              <a href="https://www.va.gov/find-locations/" target="_blank" rel="noopener noreferrer">VA Facility Locator <ExternalLink className="ml-1 h-3 w-3" /></a>
            </Button>
            <Button variant="outline" size="sm" className="text-xs" asChild>
              <a href="https://www.michigan.gov/mvaa" target="_blank" rel="noopener noreferrer">MI Veterans Affairs <ExternalLink className="ml-1 h-3 w-3" /></a>
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">Source: VA State Summary Michigan FY2023, NCVAS</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
