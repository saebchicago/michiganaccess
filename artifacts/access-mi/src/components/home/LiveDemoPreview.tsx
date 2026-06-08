import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MOMENTS = [
  {
    title: "ZIP 48126 (Dearborn) scored 58/100",
    body: (
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border-[3px] border-amber-500 flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-foreground">58</span>
          </div>
          <div>
            <Badge className="bg-amber-700 text-white text-[9px]">Tier 3 - Limited Access</Badge>
            <p className="text-[10px] text-muted-foreground mt-0.5">Concerns: Diabetes (14.2%), Obesity (38.1%)</p>
            <p className="text-[10px] text-michigan-forest">Strength: Smoking below state avg</p>
          </div>
        </div>
      </div>
    ),
    cta: "Get your ZIP's score",
    href: "/zip-intelligence",
  },
  {
    title: "48126 vs 48075: Dearborn vs Southfield",
    body: (
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground w-14">Diabetes</span>
          <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden flex">
            <div className="h-full bg-primary rounded-full" style={{ width: "47%" }} />
          </div>
          <span className="text-[9px] font-semibold w-10">14.2%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground w-14" />
          <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden flex">
            <div className="h-full bg-michigan-teal rounded-full" style={{ width: "39%" }} />
          </div>
          <span className="text-[9px] text-muted-foreground w-10">11.8%</span>
        </div>
        <p className="text-[10px] text-michigan-coral">2.4-point gap between neighboring ZIPs</p>
      </div>
    ),
    cta: "Compare any 2 ZIPs",
    href: "/zip-intelligence",
  },
  {
    title: "You may qualify for 6 programs",
    body: (
      <div className="flex flex-wrap gap-1.5">
        {["Healthy Michigan Plan ✓", "SNAP ✓", "LIHEAP ✓", "MiHER ✓", "CHIP ✓", "Property Tax Credit ✓"].map((p) => (
          <Badge key={p} variant="outline" className="text-[9px] border-michigan-forest/30 text-michigan-forest">{p}</Badge>
        ))}
        <p className="w-full text-[10px] text-muted-foreground mt-1">3 questions, zero data stored</p>
      </div>
    ),
    cta: "Check your eligibility",
    href: "/financial-help#screener",
  },
];

export default function LiveDemoPreview() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIdx((prev) => (prev + 1) % MOMENTS.length), 4000);
    return () => clearInterval(timer);
  }, []);

  const moment = MOMENTS[idx];

  return (
    <section className="py-6">
      <div className="container max-w-lg">
        <Card className="border-primary/10 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-3 w-3 text-primary" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Live Preview</span>
              <div className="flex gap-1 ml-auto">
                {MOMENTS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIdx(i)}
                    aria-label={`Show preview ${i + 1} of ${MOMENTS.length}`}
                    aria-current={i === idx ? "true" : undefined}
                    className={`h-1 rounded-full transition-all ${i === idx ? "w-4 bg-primary" : "w-1 bg-muted-foreground/30"}`}
                  />
                ))}
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <p className="text-sm font-semibold text-foreground mb-2">{moment.title}</p>
                {moment.body}
                <Link to={moment.href} className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                  Try it yourself → <ArrowRight className="h-3 w-3" />
                </Link>
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
