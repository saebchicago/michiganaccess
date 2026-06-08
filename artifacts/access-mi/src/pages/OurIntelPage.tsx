import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { COUNTIES_COVERED } from "@/config/platformConstants";
import { Globe, ArrowRight, Check } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks/usePageMeta";
import { supabase, supabaseConfigured } from "@/integrations/supabase/client";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

export default function OurIntelPage() {
  usePageMeta({
    title: "ourintel.org - National Civic Intelligence Vision",
    description:
      "Civic intelligence infrastructure, built for every community, starting with Michigan.",
    path: "/about/ourintel",
  });

  const [form, setForm] = useState({
    email: "",
    name: "",
    state: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.email.trim() || !form.state.trim()) return;
    setLoading(true);
    try {
      if (supabaseConfigured) {
        await supabase.from("collaborator_interest" as any).insert({
          email: form.email.trim(),
          name: form.name.trim() || null,
          state: form.state.trim(),
          message: form.message.trim() || null,
          source: "ourintel-page",
        });
      }
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Breadcrumbs
        items={[{ label: "About", href: "/about" }, { label: "ourintel.org" }]}
      />

      {/* Hero - navy */}
      <section className="bg-slate-900 py-20 md:py-28">
        <div className="container max-w-3xl text-center">
          <motion.div initial="hidden" animate="visible">
            <motion.div
              variants={fadeUp}
              custom={0}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5"
            >
              <Globe className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">
                ourintel.org
              </span>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl font-bold text-white md:text-5xl mb-6"
            >
              Civic intelligence infrastructure.
              <br />
              Built for every community.
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg text-slate-300"
            >
              Starting with Michigan.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-3xl py-16 space-y-16">
        {/* The Problem */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">
            The Problem
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Millions of Americans make life decisions - where to live, whether
            to trust their water, who represents them, where public money goes -
            without access to the data that describes their own communities.
            That data exists. It's just not organized for them.
          </p>
        </section>

        {/* What We Built */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">
            What We Built in Michigan
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
            {[
              { value: String(COUNTIES_COVERED), label: "counties covered" },
              { value: "15+", label: "data sources" },
              { value: "19", label: "feature phases" },
              { value: "1", label: "person + AI tools" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-foreground tabular-nums">
                  {s.value}
                </p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          <Button asChild variant="outline">
            <Link to="/">
              See the reference implementation: accessmi.org{" "}
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </section>

        {/* National Vision */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">
            The National Vision
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mb-6">
            ourintel.org is the collaboration framework for building this in
            every US state - not a national platform built top-down, but a
            network of state-level implementations built by people who know
            their communities.
          </p>
          <div className="space-y-3">
            {[
              {
                phase: "Phase 1",
                desc: "Michigan reference implementation",
                status: "complete",
              },
              {
                phase: "Phase 2",
                desc: "Framework documentation + open source",
                status: "in-progress",
              },
              {
                phase: "Phase 3",
                desc: "3\u20135 collaborators in other states",
                status: "next",
              },
              {
                phase: "Phase 4",
                desc: "Shared data infrastructure layer",
                status: "planned",
              },
              {
                phase: "Phase 5",
                desc: "National comparison features",
                status: "planned",
              },
            ].map((p) => (
              <div key={p.phase} className="flex items-center gap-3">
                <div
                  className={`h-2 w-2 rounded-full shrink-0 ${p.status === "complete" ? "bg-green-500" : p.status === "in-progress" ? "bg-amber-500 animate-pulse" : "bg-muted"}`}
                />
                <span className="text-sm">
                  <span className="font-semibold text-foreground">
                    {p.phase}:
                  </span>{" "}
                  <span className="text-muted-foreground">{p.desc}</span>
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Who We're Looking For */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">
            Who We're Looking For
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Policy data nerds who want to build this for their state. Not
            investors. Not partners yet. Builders who care.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: "\u{1F4BB}",
                title: "Developers",
                desc: "Can you clone a React repo and adapt it for your state?",
              },
              {
                icon: "\u{1F4CA}",
                title: "Policy Researchers",
                desc: "Do you know your state's public data landscape?",
              },
              {
                icon: "\u{1F3DB}\uFE0F",
                title: "Government Technologists",
                desc: "Work at a 211, health department, or civic agency?",
              },
              {
                icon: "\u{1F91D}",
                title: "Community Organizers",
                desc: "Know what data is missing from your community?",
              },
            ].map((p) => (
              <Card key={p.title}>
                <CardContent className="py-4">
                  <span className="text-2xl">{p.icon}</span>
                  <h3 className="text-sm font-bold text-foreground mt-2">
                    {p.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">{p.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Email Capture */}
        <section className="rounded-2xl border border-primary/20 bg-primary/[0.03] p-8">
          <h2 className="text-xl font-bold text-foreground mb-2">
            Tell us your state
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            We'll reach out when your state is ready to build.
          </p>
          {submitted ? (
            <div className="rounded-xl bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/40 p-6 text-center">
              <Check className="h-6 w-6 text-teal-600 mx-auto mb-2" />
              <p className="text-teal-700 dark:text-teal-400 font-semibold mb-1">
                We'll be in touch.
              </p>
              <p className="text-teal-600 dark:text-teal-400 text-sm">
                When {form.state} is ready to build, you'll be the first to
                know.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 max-w-md">
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Your name"
                className="border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <input
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="Email address"
                type="email"
                className="border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <input
                value={form.state}
                onChange={(e) =>
                  setForm((f) => ({ ...f, state: e.target.value }))
                }
                placeholder="Which state would you build for?"
                className="border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <textarea
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: e.target.value }))
                }
                placeholder="One sentence about what you'd build (optional)"
                className="border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none h-20"
              />
              <Button
                onClick={handleSubmit}
                disabled={loading || !form.email.trim() || !form.state.trim()}
              >
                {loading
                  ? "Submitting..."
                  : `I want to build ${form.state || "[STATE]"} Access`}
              </Button>
            </div>
          )}
        </section>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground">
            ourintel.org is a project of accessmi.org. Michigan is the proof of
            concept. Everything else is the mission.
          </p>
        </div>
      </div>
    </Layout>
  );
}
