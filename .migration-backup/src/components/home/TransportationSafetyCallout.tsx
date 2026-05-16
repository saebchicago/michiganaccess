import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Bus, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TransportationSafetyCallout() {
  return (
    <section className="py-6">
      <div className="container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card className="group overflow-hidden border-michigan-teal/20 bg-gradient-to-r from-michigan-teal/5 to-michigan-navy/5 transition-shadow hover:shadow-lg">
            <CardContent className="py-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-michigan-teal/10">
                  <ShieldCheck className="h-6 w-6 text-michigan-teal" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-foreground">Transportation Safety</h3>
                    <Bus className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    School bus safety tips from MDOT, stop-arm enforcement data, and partner integration guidance for districts and agencies.
                  </p>
                  <Button variant="outline" size="sm" className="mt-1 gap-1.5 text-xs" asChild>
                    <Link to="/transportation#safety">
                      View Safety Resources
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
