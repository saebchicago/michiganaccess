import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, ArrowRight, Shield, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HealthEquitySection() {
  return (
    <section className="py-16 bg-muted/20">
      <div className="container max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <Badge variant="outline" className="mb-3 text-xs uppercase tracking-wider border-primary/30 text-primary">
            Health Equity in Action
          </Badge>
          <h2 className="text-2xl font-bold text-foreground lg:text-3xl mb-2">
            Closing Michigan's Access Gaps Through Better Information
          </h2>
        </motion.div>

        {/* Qualitative mission — no numeric projections */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="mb-8 border-primary/15 bg-primary/[0.03]">
            <CardContent className="py-6 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Access Michigan exists to make it easier for people and organizations to see where systems are working—and where they're failing—at the ZIP and county level.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our goals are simple but ambitious: help more residents understand and use their benefits, reduce preventable harm from outages and housing instability, and give communities better leverage in conversations with hospitals, plans, utilities, and government.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                As partners use this tool in CHNAs, community benefit plans, value-based care programs, and regulatory work, we will publish measured impact (not guesses) and explain exactly how we calculated it.
              </p>
              <p className="text-xs text-muted-foreground italic">
                If your organization is using Access Michigan in your work and you're open to sharing results, we'd love to <Link to="/contact" className="text-primary hover:underline">document that impact together</Link>.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Before / After comparison — illustrative but factual about our algorithm */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="rounded-xl border border-border bg-card p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-semibold text-foreground">Safety-Net Clinic Visibility: Before → After Platform</h3>
            <Badge variant="outline" className="text-[9px] uppercase tracking-wider border-michigan-gold/40 text-michigan-gold">Illustrative</Badge>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Before (Traditional Search)</p>
              {["Hospital A", "Specialist B", "Urgent Care C", "Pharmacy D", "Lab E", "Imaging F", "Sliding-Scale Clinic"].map((item, i) => (
                <div key={item} className={`flex items-center gap-2 rounded px-3 py-1.5 text-xs ${i === 6 ? "bg-destructive/10 text-destructive font-semibold" : "bg-muted/50 text-muted-foreground"}`}>
                  <span className="w-4 text-right font-mono text-[10px]">#{i + 1}</span>
                  {item}
                  {i === 6 && <Badge variant="destructive" className="ml-auto text-[9px]">Buried at #7</Badge>}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">After (Equity-Adjusted Algorithm)</p>
              {["FQHCs & Sliding-Scale Clinics", "Sliding-Scale Clinic", "Hospital A", "Urgent Care C", "Specialist B", "Pharmacy D", "Lab E"].map((item, i) => (
                <div key={item} className={`flex items-center gap-2 rounded px-3 py-1.5 text-xs ${i <= 1 ? "bg-primary/10 text-primary font-semibold" : "bg-muted/50 text-muted-foreground"}`}>
                  <span className="w-4 text-right font-mono text-[10px]">#{i + 1}</span>
                  {item}
                  {i === 1 && <Badge className="ml-auto text-[9px] bg-primary">Elevated to #2</Badge>}
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-3 italic">
            Illustrative example of the platform's SVI-weighted ranking algorithm. Modeled from CDC/ATSDR Social Vulnerability Index methodology. Not a measured platform outcome.
          </p>
        </motion.div>

        <div className="text-center">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/equity">
              See Our Equity Framework <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
