import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { TrendingDown, FileCheck, Users, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const metrics = [
  {
    icon: TrendingDown,
    stat: "5.6% → 4.2%",
    label: "Uninsured rate reduction (SE MI)",
    detail: "Equity-adjusted navigation reduces coverage gaps",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: FileCheck,
    stat: "1,850+",
    label: "Insurance appeals generated (+42%)",
    detail: "$5.92M in denied charges recovered annually",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: Users,
    stat: "2,340/mo",
    label: "Connected to sliding-scale care",
    detail: "Dignified access without stigmatizing language",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-500/10",
  },
];

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
            Closing Michigan's Access Gaps Through Systems Engineering
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Measurable impact across coverage, appeals, and care navigation — driven by equity-centered algorithms and population health infrastructure.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="h-full">
                <CardContent className="py-5 space-y-2">
                  <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${m.bg}`}>
                    <m.icon className={`h-4.5 w-4.5 ${m.color}`} />
                  </div>
                  <p className={`text-2xl font-bold ${m.color}`}>{m.stat}</p>
                  <p className="text-sm font-semibold text-foreground">{m.label}</p>
                  <p className="text-xs text-muted-foreground">{m.detail}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Before / After comparison */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="rounded-xl border border-border bg-card p-6 mb-6"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">Safety-Net Clinic Visibility: Before → After Platform</h3>
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
