import { useState } from "react";
import { motion } from "framer-motion";
import {
  Heart, BarChart3, Map, TrendingUp, ArrowRight, CheckCircle2,
  Loader2, Building2, Users, FileText, Shield, Activity,
  Database, RefreshCw, Layers
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

/* ── Case Studies ── */
const CASE_STUDIES = [
  {
    title: "Regional Health System — CHNA Enhancement",
    challenge: "A mid-Michigan health system needed granular, county-level social determinant data to supplement their triennial Community Health Needs Assessment but lacked the internal analytics capacity to aggregate and visualize it.",
    solution: "Integrated Access Michigan referral and resource-usage data into their existing CHNA workflow, providing real-time views of transportation barriers, food insecurity hotspots, and uninsured populations across their 12-county service area.",
    outcomes: [
      "42% reduction in CHNA data-gathering time",
      "Identified 3 previously unknown service deserts",
      "IRS Schedule H documentation streamlined",
    ],
    icon: BarChart3,
  },
  {
    title: "Academic Medical Center — Referral Intelligence",
    challenge: "An academic medical center's community benefit office struggled to track whether patients referred to social services actually connected with those resources, creating a blind spot in their continuum of care.",
    solution: "Deployed Access Michigan referral pathway analytics to map post-discharge resource utilization across community health workers, FQHC navigators, and social service organizations.",
    outcomes: [
      "68% visibility into post-referral engagement",
      "Reduced 30-day readmissions by 11% in pilot counties",
      "Enabled closed-loop referral reporting for payers",
    ],
    icon: Activity,
  },
  {
    title: "Rural Hospital Network — Access Gap Mapping",
    challenge: "A 4-hospital rural network knew patients traveled long distances for care but lacked data to quantify access gaps or advocate for mobile health investments.",
    solution: "Used Access Michigan geo-mapped provider shortage data, transit overlay, and community resource density to build an evidence-based case for mobile clinic deployment.",
    outcomes: [
      "Secured $1.2M in grant funding for mobile units",
      "Documented 15-county primary care desert footprint",
      "30% increase in preventive screenings in year one",
    ],
    icon: Map,
  },
];

/* ── CHNA Workflow Steps ── */
const WORKFLOW_STEPS = [
  { step: 1, title: "Data Ingestion", description: "Aggregate anonymized platform usage, referral patterns, and resource-access data across all 83 Michigan counties.", icon: Database },
  { step: 2, title: "Needs Mapping", description: "Overlay health indicators, social determinants, and provider shortage ratios to identify community-level gaps.", icon: Layers },
  { step: 3, title: "Gap Analysis", description: "Compare your service area against state and national benchmarks for uninsured rates, food insecurity, and primary care access.", icon: BarChart3 },
  { step: 4, title: "Report Generation", description: "Auto-generate CHNA-ready reports aligned with IRS Schedule H requirements and USCDI v3 standards.", icon: FileText },
  { step: 5, title: "Continuous Monitoring", description: "Track community health trends in real-time with automatic alerts when indicators cross critical thresholds.", icon: RefreshCw },
];

/* ── Contact Form ── */
function HealthSystemContactForm() {
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    organization_name: "",
    contact_name: "",
    contact_email: "",
    organization_type: "healthcare",
    description: "",
    website: "",
    phone: "",
    city: "",
    county: "",
  });

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.organization_name || !form.contact_name || !form.contact_email || !form.description) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.from("partnership_submissions" as any).insert([form] as any);
      if (error) throw error;
      setSubmitted(true);
      toast.success("Thank you — we'll be in touch within 2 business days.");
    } catch {
      toast.error("Submission failed. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <Card className="border-michigan-teal/20 bg-michigan-teal/5">
        <CardContent className="py-12 text-center space-y-3">
          <CheckCircle2 className="mx-auto h-12 w-12 text-michigan-teal" />
          <h3 className="text-xl font-bold text-foreground">Inquiry Received</h3>
          <p className="text-muted-foreground max-w-md mx-auto">Our partnerships team will review your submission and respond within 2 business days.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-michigan-teal" />
          Schedule a Partnership Discussion
        </CardTitle>
        <p className="text-sm text-muted-foreground">Tell us about your organization and how Access Michigan can support your community health strategy.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Organization Name *</label>
              <Input value={form.organization_name} onChange={(e) => update("organization_name", e.target.value)} required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Organization Type</label>
              <Select value={form.organization_type} onValueChange={(v) => update("organization_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthcare">Health System</SelectItem>
                  <SelectItem value="hospital">Community Hospital</SelectItem>
                  <SelectItem value="academic">Academic Medical Center</SelectItem>
                  <SelectItem value="fqhc">FQHC / CHC</SelectItem>
                  <SelectItem value="payer">Health Plan / Payer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Contact Name *</label>
              <Input value={form.contact_name} onChange={(e) => update("contact_name", e.target.value)} required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Email *</label>
              <Input type="email" value={form.contact_email} onChange={(e) => update("contact_email", e.target.value)} required />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">How can Access Michigan support your organization? *</label>
            <Textarea rows={4} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="e.g., CHNA data integration, referral analytics, community benefit reporting..." required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Website</label>
              <Input value={form.website} onChange={(e) => update("website", e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Phone</label>
              <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>
          </div>
          <Button type="submit" disabled={sending} className="w-full bg-michigan-teal hover:bg-michigan-teal/90 text-white">
            {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Partnership Inquiry
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

/* ── Page ── */
export default function HealthSystemsPage() {
  usePageMeta({
    title: "Health System Partnerships",
    description: "CHNA data integration, referral analytics, and community benefit ROI for Michigan health systems. Partner with Access Michigan.",
    path: "/partnerships/health-systems",
  });

  return (
    <Layout>
      <div className="container py-8 space-y-14">
        <Breadcrumbs items={[
          { label: "Home", href: "/" },
          { label: "Partners", href: "/partners" },
          { label: "Health Systems" },
        ]} />

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge className="bg-michigan-teal/10 text-michigan-teal border-michigan-teal/20">
            <Heart className="h-3 w-3 mr-1" />
            For Healthcare Organizations
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Amplify Community Health Impact
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Access Michigan provides health systems with actionable community-level data to strengthen CHNA reporting, optimize referral pathways, and quantify community benefit ROI.
          </p>
          <Button variant="outline" size="sm" className="mt-2" asChild>
            <Link to="/partnerships/health-systems/one-pager">
              <FileText className="h-4 w-4 mr-1" /> Download One-Pager (PDF)
            </Link>
          </Button>
        </motion.div>

        {/* Value Props */}
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: BarChart3, title: "Referral Analytics", desc: "Map resource utilization, referral pathways, and community navigation trends across your service area." },
            { icon: Map, title: "Gap Analysis", desc: "Identify unmet needs with real usage data. Pinpoint service deserts and social determinant hotspots." },
            { icon: TrendingUp, title: "Community Benefit ROI", desc: "Quantify charity care and SDOH intervention impact with aggregated, non-identifiable platform data." },
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="h-full hover-lift border-michigan-teal/10">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-michigan-teal/10 text-michigan-teal">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CHNA Integration Workflow */}
        <section aria-labelledby="workflow-heading">
          <div className="text-center mb-10">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-3">
              <Shield className="h-3 w-3 mr-1" />
              CHNA Integration
            </Badge>
            <h2 id="workflow-heading" className="text-2xl font-bold text-foreground">
              Community Health Needs Assessment Workflow
            </h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
              A structured pipeline from data ingestion to continuous monitoring, aligned with IRS Schedule H and USCDI v3 standards.
            </p>
          </div>

          {/* Workflow diagram */}
          <div className="relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-michigan-teal/20 via-michigan-teal/40 to-michigan-teal/20 -translate-y-1/2 z-0" />

            <div className="grid gap-6 md:grid-cols-5 relative z-10">
              {WORKFLOW_STEPS.map((ws, i) => (
                <motion.div
                  key={ws.step}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                >
                  <Card className="h-full text-center border-michigan-teal/10 bg-background">
                    <CardContent className="pt-6 space-y-3">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-michigan-teal/10 text-michigan-teal font-bold text-lg">
                        {ws.step}
                      </div>
                      <ws.icon className="mx-auto h-5 w-5 text-michigan-teal/70" />
                      <h3 className="font-semibold text-sm text-foreground">{ws.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{ws.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Standards badges */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {["FHIR R4", "HL7 v2", "USCDI v3", "IRS Schedule H", "HIPAA Compliant", "No PHI Stored"].map((std) => (
              <Badge key={std} variant="outline" className="text-xs">
                <Shield className="h-3 w-3 mr-1 text-michigan-teal" />
                {std}
              </Badge>
            ))}
          </div>
        </section>

        {/* Case Studies */}
        <section aria-labelledby="cases-heading">
          <div className="text-center mb-10">
            <Badge className="bg-michigan-forest/10 text-michigan-forest border-michigan-forest/20 mb-3">
              <Users className="h-3 w-3 mr-1" />
              Impact Case Studies
            </Badge>
            <h2 id="cases-heading" className="text-2xl font-bold text-foreground">
              How Health Systems Use Access Michigan
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl mx-auto">
              Representative scenarios illustrating integration approaches. These are anonymized composite examples, not endorsements of specific organizations.
            </p>
          </div>

          <div className="space-y-6">
            {CASE_STUDIES.map((cs, i) => (
              <motion.div
                key={cs.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <Card className="overflow-hidden">
                  <div className="md:flex">
                    <div className="md:w-2/3 p-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <cs.icon className="h-5 w-5 text-michigan-teal" />
                        <h3 className="font-bold text-foreground">{cs.title}</h3>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Challenge</span>
                          <p className="text-sm text-muted-foreground mt-1">{cs.challenge}</p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Solution</span>
                          <p className="text-sm text-muted-foreground mt-1">{cs.solution}</p>
                        </div>
                      </div>
                    </div>
                    <div className="md:w-1/3 bg-michigan-teal/5 p-6 flex flex-col justify-center border-t md:border-t-0 md:border-l border-michigan-teal/10">
                      <span className="text-xs font-semibold uppercase text-michigan-teal tracking-wide mb-3">Outcomes</span>
                      <ul className="space-y-2">
                        {cs.outcomes.map((o) => (
                          <li key={o} className="flex items-start gap-2 text-sm text-foreground">
                            <CheckCircle2 className="h-4 w-4 text-michigan-teal mt-0.5 flex-shrink-0" />
                            {o}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Contact Form */}
        <section aria-labelledby="contact-heading" className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 id="contact-heading" className="text-2xl font-bold text-foreground">
              Start the Conversation
            </h2>
            <p className="mt-2 text-muted-foreground">
              Our partnerships team responds within 2 business days.
            </p>
          </div>
          <HealthSystemContactForm />
        </section>
      </div>
    </Layout>
  );
}
