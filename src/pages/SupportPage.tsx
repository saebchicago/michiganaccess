import { Link } from "react-router-dom";
import { Share2, Handshake, Heart, Sparkles, Database, Globe, Rocket, Server, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { usePageMeta } from "@/hooks/usePageMeta";
import { toast } from "sonner";

const tiers = [
  {
    icon: Share2,
    title: "Share",
    price: "Free",
    description: "Tell a friend, share on social media, or recommend us to your local library.",
    cta: "Copy Link",
    action: "copy",
  },
  {
    icon: Handshake,
    title: "Partner",
    price: "Organizations",
    description: "Health systems, nonprofits, and government agencies can submit resources or embed our widgets.",
    cta: "Partnership Portal →",
    action: "link",
    href: "/partnerships",
  },
  {
    icon: Heart,
    title: "Donate",
    price: "Financial",
    description: "Your tax-deductible donation helps us cover hosting, data integration, and accessibility improvements.",
    cta: "Donate →",
    action: "donate",
  },
];

const impacts = [
  { icon: Database, title: "Data Accuracy", desc: "Keeping 15K+ resources current across all 83 Michigan counties." },
  { icon: Globe, title: "Accessibility", desc: "Translations, screen readers, high-contrast mode, and low-bandwidth optimization." },
  { icon: Rocket, title: "New Features", desc: "Energy programs, transit safety, civic data expansion, and community tools." },
  { icon: Server, title: "Infrastructure", desc: "Hosting, security, zero-downtime operations, and data pipeline maintenance." },
];

export default function SupportPage() {
  usePageMeta({
    title: "Support Access Michigan | Help Keep Civic Resources Free",
    description: "Access Michigan is a volunteer-built, non-commercial public resource. Your support helps maintain data accuracy, add features, and keep everything free for Michigan families.",
    path: "/support",
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText("https://accessmi.org");
      toast.success("Link copied to clipboard!", { icon: <CheckCircle2 className="h-4 w-4 text-michigan-forest" /> });
    } catch {
      toast.error("Could not copy link.");
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="border-b border-border bg-muted/30 py-16 md:py-20">
        <div className="container max-w-3xl text-center">
          <Badge variant="outline" className="mb-4 gap-1.5">
            <Sparkles className="h-3 w-3" /> Support This Project
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Help Keep Michigan's Civic Resource Free
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Access Michigan is a volunteer-built, non-commercial public resource. Your support helps us maintain data accuracy, add new features, and keep everything free for Michigan families.
          </p>
        </div>
      </section>

      {/* Three tiers */}
      <section className="container py-16 md:py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((t) => (
            <Card key={t.title} className="flex flex-col hover:shadow-md hover:border-primary/20 transition-all duration-200">
              <CardHeader className="items-center text-center">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <t.icon className="h-6 w-6 text-primary" />
                </div>
                <Badge variant="secondary" className="mb-1">{t.price}</Badge>
                <CardTitle className="text-xl">{t.title}</CardTitle>
                <CardDescription>{t.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto flex justify-center pb-6">
                {t.action === "copy" && (
                  <Button onClick={handleCopy} variant="outline" className="gap-2">
                    <Copy className="h-4 w-4" /> {t.cta}
                  </Button>
                )}
                {t.action === "link" && (
                  <Button asChild>
                    <Link to={t.href!}>{t.cta}</Link>
                  </Button>
                )}
                {t.action === "donate" && (
                  <Button variant="default" className="gap-2" disabled>
                    <Heart className="h-4 w-4" /> {t.cta}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Access Michigan is in the process of establishing 501(c)(3) nonprofit status. Donation processing will be available soon.
        </p>
      </section>

      {/* Where Your Support Goes */}
      <section className="border-t border-border bg-muted/30 py-16 md:py-20">
        <div className="container">
          <h2 className="mb-8 text-center text-2xl font-bold">Where Your Support Goes</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {impacts.map((item) => (
              <Card key={item.title} className="text-center hover:shadow-md hover:border-primary/20 transition-all duration-200">
                <CardContent className="pt-6">
                  <item.icon className="mx-auto mb-3 h-8 w-8 text-primary" />
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Transparency */}
      <section className="container py-10 md:py-14">
        <div className="mx-auto max-w-2xl rounded-lg border border-border bg-muted/20 p-6 text-center">
          <h3 className="mb-2 font-semibold">Our Transparency Commitment</h3>
          <p className="text-sm text-muted-foreground">
            Access Michigan does not sell data, display advertising, or collect personal information. 100% of donations support platform operations and community impact.
          </p>
        </div>
      </section>
    </Layout>
  );
}
