import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Copy, Globe, Server, Database, Clock, ArrowRight, ExternalLink, CheckCircle2, Send } from "lucide-react";
import { supabase, supabaseConfigured } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const NATIONAL_APIS = [
  { api: "CDC PLACES", provides: "County/tract health data", filter: "?stateabbr=XX", time: "2 hrs" },
  { api: "CMS Hospital Compare", provides: "Hospital quality metrics", filter: "?state=XX", time: "2 hrs" },
  { api: "NPPES NPI Registry", provides: "Provider search", filter: "?state=XX", time: "1 hr" },
  { api: "CMS Physician Compare", provides: "Doctor details + Medicare", filter: "POST body filter", time: "2 hrs" },
  { api: "NWS Weather API", provides: "Alerts + 7-day forecast", filter: "?area=XX", time: "1 hr" },
  { api: "EIA v2 API", provides: "Electricity prices", filter: "facets[stateid][]=XX", time: "2 hrs" },
  { api: "USGS Water Services", provides: "Stream/river monitoring", filter: "?stateCd=XX", time: "2 hrs" },
  { api: "AirNow API", provides: "Air quality by ZIP", filter: "?zipCode=XXXXX", time: "1 hr" },
  { api: "FDA openFDA", provides: "Drug recall alerts", filter: "National (no filter)", time: "1 hr" },
  { api: "Census ACS API", provides: "Economic/demographic data", filter: "&in=state:XX", time: "3 hrs" },
  { api: "FEMA NRI", provides: "Hazard risk ratings", filter: "County FIPS", time: "3 hrs" },
];

export default function ReplicationPage() {
  usePageMeta({
    title: "Replicate This Platform - Access Michigan",
    description: "Open blueprint for building civic intelligence infrastructure in any U.S. state. 11 national APIs, documented methodology, reusable architecture.",
    path: "/replicate",
  });

  return (
    <Layout>
      <Breadcrumbs items={[{ label: "Replicate" }]} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-michigan-teal/5 to-background py-16 md:py-20">
        <div className="container max-w-4xl text-center">
          <motion.div initial="hidden" animate="visible">
            <motion.div variants={fadeUp} custom={0} className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
              <Copy className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Open Civic Infrastructure</span>
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="mb-4 text-3xl font-bold text-foreground md:text-5xl">
              Built to Be Copied
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Access Michigan is designed as a replicable model. Here's everything you need to build the same platform for your state.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-5xl py-12 space-y-12">
        {/* 90-Day Launch */}
        <section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <div className="flex items-center gap-3 mb-6">
              <Clock className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">What You'd Need to Launch in 90 Days</h2>
            </div>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Server, label: "Stack", desc: "React + Vite + Supabase. Free tier gets you started. Deploy on Netlify or Vercel." },
              { icon: Database, label: "APIs", desc: "11 national APIs that work for any state - no paid keys required for most." },
              { icon: Globe, label: "Design", desc: "shadcn/ui + Tailwind CSS. Open component library. Dark mode included." },
              { icon: CheckCircle2, label: "Data", desc: "National APIs cover 80%. Add your state's 211, DHHS, utility, and environmental data." },
            ].map((item, i) => (
              <motion.div key={item.label} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Card className="h-full">
                  <CardContent className="p-5">
                    <item.icon className="h-6 w-6 text-primary mb-3" />
                    <h3 className="text-sm font-semibold text-foreground mb-1">{item.label}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* National APIs */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            11 National APIs That Work for Any State
          </h2>
          <Card>
            <CardContent className="py-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 text-xs font-medium text-muted-foreground">API</th>
                      <th className="pb-2 text-xs font-medium text-muted-foreground">What It Provides</th>
                      <th className="pb-2 text-xs font-medium text-muted-foreground">State Filter</th>
                      <th className="pb-2 text-xs font-medium text-muted-foreground text-right">Setup</th>
                    </tr>
                  </thead>
                  <tbody>
                    {NATIONAL_APIS.map((api) => (
                      <tr key={api.api} className="border-b border-border/50 last:border-0">
                        <td className="py-2 font-medium text-foreground">{api.api}</td>
                        <td className="py-2 text-muted-foreground text-xs">{api.provides}</td>
                        <td className="py-2"><code className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{api.filter}</code></td>
                        <td className="py-2 text-right text-xs text-muted-foreground">{api.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-muted-foreground mt-3">
                Total setup time: ~20 hours for all 11 APIs. All free, most require no authentication.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* State-specific */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">State-Specific Integrations to Add</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { title: "State 211 System", desc: "HSDS-compliant APIs exist in many states. Michigan uses MI 211 with 40,000+ service records." },
              { title: "State DHHS / Health Dept", desc: "Every state publishes health data. Look for Socrata-based open data portals." },
              { title: "State Utility Commission", desc: "Rate cases, outage data, data center filings. Michigan uses MPSC E-Dockets." },
              { title: "State Environmental Agency", desc: "PFAS sites, lead lines, water quality. Michigan uses EGLE/MPART data." },
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Fork the concept */}
        <section className="rounded-2xl border border-primary/20 bg-primary/5 p-8">
          <h2 className="text-xl font-bold text-foreground mb-3">Fork the Concept, Not the Code</h2>
          <p className="text-sm text-muted-foreground mb-4">
            The codebase is Michigan-specific, but the architecture and methodology are universal. The equity-weighted ranking system, the hook→fallback→component pattern, and the data integration framework are all documented.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/methodology">Methodology <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/technical">Technical Architecture <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/contact">Get in Touch <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </div>
        </section>

        {/* Collaboration Form */}
        <CollaborationForm />

        {/* ourintel.org link */}
        <section className="rounded-2xl bg-slate-900 p-8 text-center">
          <p className="text-2xl font-bold text-white mb-2">ourintel.org</p>
          <p className="text-sm text-slate-300 mb-4">The national framework for civic intelligence infrastructure. Michigan is the proof of concept. Everything else is the mission.</p>
          <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <Link to="/about/ourintel">Learn about the national vision <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
          </Button>
        </section>
      </div>
    </Layout>
  );
}

function CollaborationForm() {
  const [form, setForm] = useState({ name: "", email: "", state: "", organization: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.email.trim() || !form.state.trim()) return;
    setLoading(true);
    try {
      if (supabaseConfigured) {
        await supabase.from("collaborator_interest").insert({
          email: form.email.trim(), name: form.name.trim() || null,
          state: form.state.trim(), organization: form.organization.trim() || null,
          message: form.message.trim() || null, source: "replicate-page",
        });
      }
      setSubmitted(true);
    } finally { setLoading(false); }
  };

  if (submitted) {
    return (
      <section className="rounded-2xl bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/40 p-8 text-center">
        <p className="text-teal-700 dark:text-teal-400 font-semibold mb-1">We'll be in touch.</p>
        <p className="text-teal-600 dark:text-teal-400 text-sm">When {form.state} is ready to build, you'll be the first to know.</p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2"><Send className="h-5 w-5 text-primary" /> Build for Your State</h2>
      <p className="text-sm text-muted-foreground mb-4">Tell us about your state and what you'd build. We're looking for developers, policy researchers, and civic technologists.</p>
      <div className="grid gap-3 max-w-lg">
        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" className="border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
        <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email address" type="email" className="border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
        <input value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} placeholder="Which state would you build for?" className="border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
        <input value={form.organization} onChange={e => setForm(f => ({ ...f, organization: e.target.value }))} placeholder="Organization (optional)" className="border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
        <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Tell us in one sentence what you'd build (optional)" className="border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none h-20" />
        <Button onClick={handleSubmit} disabled={loading || !form.email.trim() || !form.state.trim()} className="w-full">
          {loading ? "Submitting..." : `I want to build ${form.state || "[STATE]"} Access`}
        </Button>
      </div>
    </section>
  );
}
