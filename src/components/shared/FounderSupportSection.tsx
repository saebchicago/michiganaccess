import { Heart, Shield, Lock, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function FounderSupportSection() {
  return (
    <section className="py-14 border-t border-border" aria-labelledby="support-heading">
      <div className="container max-w-3xl">
        {/* Founder blurb */}
        <div className="text-center mb-8">
          <h2 id="support-heading" className="text-xl font-bold text-foreground sm:text-2xl">
            About This Project
          </h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Access Michigan is built and maintained by a healthcare data professional who saw how hard
            it is for ordinary people to find the services and information they need. This is an
            independent, non-commercial civic project — no ads, no tracking, no paywalls, ever.
          </p>
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap justify-center gap-5 text-xs text-muted-foreground mb-8">
          {[
            { icon: Shield, text: "Independent — not a government agency" },
            { icon: Lock, text: "No tracking, cookies, or ads" },
            { icon: Globe, text: "Free for all Michigan residents" },
          ].map((item) => (
            <span key={item.text} className="flex items-center gap-1.5">
              <item.icon className="h-3.5 w-3.5" aria-hidden="true" />
              {item.text}
            </span>
          ))}
        </div>

        {/* Donate CTA */}
        <Card className="border-dashed border-primary/20 bg-primary/[0.02]">
          <CardContent className="flex flex-col sm:flex-row items-center gap-4 py-5 text-center sm:text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
              <Heart className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Support Access Michigan</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Your contribution helps cover hosting, data infrastructure, and development. Access is
                always free — donations never affect what you can see or use.
              </p>
            </div>
            <a
              href="https://buymeacoffee.com/accessmichigan"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" variant="outline" className="gap-1.5 whitespace-nowrap border-primary/30 text-primary hover:bg-primary/5">
                <Heart className="h-3.5 w-3.5" aria-hidden="true" />
                Buy Me a Coffee
              </Button>
            </a>
          </CardContent>
        </Card>

        <p className="text-[10px] text-muted-foreground text-center mt-3">
          Access Michigan is not a registered charity. Contributions support infrastructure costs.
        </p>
      </div>
    </section>
  );
}
