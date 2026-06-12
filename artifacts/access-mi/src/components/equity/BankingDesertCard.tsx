import { motion } from "framer-motion";
import { Landmark, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BankingDesertCard() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Landmark className="h-5 w-5 text-primary" /> Banking Deserts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">Many rural Michigan communities have lost their last bank branch. The Federal Reserve classifies census tracts as "banking deserts" when the nearest branch is more than 2 miles (urban), 5 miles (suburban), or 10 miles (rural).</p>
          <p className="text-xs text-muted-foreground">Credit unions and CDFIs help fill gaps, but access to check cashing, small business loans, and mortgage services remains limited.</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="text-xs" asChild>
              <a href="https://www.fedcommunities.org/data/banking-deserts-dashboard/" target="_blank" rel="noopener noreferrer">Fed Banking Deserts Dashboard <ExternalLink className="ml-1 h-3 w-3" /></a>
            </Button>
            <Button variant="outline" size="sm" className="text-xs" asChild>
              <a href="https://banks.data.fdic.gov/bankfind-suite/bankfind" target="_blank" rel="noopener noreferrer">FDIC BankFind <ExternalLink className="ml-1 h-3 w-3" /></a>
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">Source: Federal Reserve Banking Deserts Dashboard 2025, FDIC BankFind Suite</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
