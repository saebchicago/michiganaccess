/**
 * Partner page template — reused for health-systems, health-plans, utilities-regulators.
 */
import { useState } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, ArrowRight, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PartnerPageConfig {
  slug: string;
  title: string;
  metaDescription: string;
  icon: typeof Heart;
  intro: string[];
  whatYouGet: string[];
  breadcrumbLabel: string;
}

function PartnerContactForm({ partnerType }: { partnerType: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.from("contact_messages").insert({
      name: `${fd.get("name")} (${fd.get("org")})`,
      email: String(fd.get("email")),
      subject: `Partner Inquiry: ${partnerType} — ${fd.get("role")}`,
      message: String(fd.get("message")),
    });
    setSubmitting(false);
    if (error) { toast.error("Something went wrong. Please try again."); return; }
    setSubmitted(true);
    toast.success("Thank you! We'll be in touch soon.");
  };

  if (submitted) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-8 text-center space-y-2">
          <CheckCircle2 className="h-8 w-8 text-primary mx-auto" />
          <p className="font-semibold text-foreground">Message received!</p>
          <p className="text-sm text-muted-foreground">We'll review your inquiry and respond within 2 business days.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="py-5">
        <h3 className="text-sm font-bold text-foreground mb-4">Get in touch</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label htmlFor="pf-name" className="text-xs">Your name</Label><Input id="pf-name" name="name" required /></div>
            <div><Label htmlFor="pf-org" className="text-xs">Organization</Label><Input id="pf-org" name="org" required /></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label htmlFor="pf-email" className="text-xs">Email</Label><Input id="pf-email" name="email" type="email" required /></div>
            <div>
              <Label htmlFor="pf-role" className="text-xs">Your role</Label>
              <Select name="role" defaultValue="other">
                <SelectTrigger id="pf-role"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="executive">Executive / Director</SelectItem>
                  <SelectItem value="chna_lead">CHNA / Community Benefit Lead</SelectItem>
                  <SelectItem value="data_analyst">Data / Analytics</SelectItem>
                  <SelectItem value="clinical">Clinical / Care Management</SelectItem>
                  <SelectItem value="regulatory">Regulatory / Compliance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div><Label htmlFor="pf-msg" className="text-xs">What are you working on?</Label><Textarea id="pf-msg" name="message" rows={3} required placeholder="Tell us about your project or how we can help…" /></div>
          <Button type="submit" disabled={submitting} className="gap-1.5">
            {submitting ? "Sending…" : "Submit Inquiry"} <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function PartnerSubPage({ config }: { config: PartnerPageConfig }) {
  usePageMeta({ title: config.title, description: config.metaDescription, path: `/partners/${config.slug}` });

  return (
    <Layout>
      <div className="container max-w-3xl py-8 space-y-8">
        <Breadcrumbs items={[{ label: "Partners", href: "/partners" }, { label: config.breadcrumbLabel }]} />

        <div className="space-y-3">
          <Badge className="bg-primary/10 text-primary border-primary/20">
            <config.icon className="h-3 w-3 mr-1" />
            {config.breadcrumbLabel}
          </Badge>
          <h1 className="text-2xl font-bold text-foreground lg:text-3xl">{config.title}</h1>
        </div>

        {config.intro.map((p, i) => (
          <p key={i} className="text-sm text-muted-foreground leading-relaxed">{p}</p>
        ))}

        <Card className="border-primary/20">
          <CardContent className="py-5">
            <h3 className="text-sm font-bold text-foreground mb-3">What you get</h3>
            <ul className="space-y-2">
              {config.whatYouGet.map((item, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <PartnerContactForm partnerType={config.breadcrumbLabel} />
      </div>
    </Layout>
  );
}

export { type PartnerPageConfig };
