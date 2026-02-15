import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Users, Heart, MapPin, Phone, Globe, Languages,
  ArrowRight, AlertCircle, CheckCircle2, Smile, Frown,
  Meh, ThumbsUp, Search, Eye, HelpCircle, Printer
} from "lucide-react";

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const personas = [
  {
    name: "Maria, 34",
    role: "Uninsured Essential Worker",
    location: "Detroit",
    context: "Two part-time service jobs, no benefits, gestational diabetes diagnosis.",
    barriers: ["Limited transportation", "Childcare constraints", "Fear of medical debt", "Doesn't know Medicaid eligibility"],
    quote: "I need to know which places won't turn me away before I waste a trip.",
    implications: [
      'FQHC "No one turned away" + hours + bus routes shown upfront',
      "Financial eligibility screener <5 clicks from homepage",
      "Mobile-first (smartphone is only internet access)",
    ],
    color: "border-michigan-coral/30 bg-michigan-coral/5",
    accent: "text-michigan-coral",
  },
  {
    name: "Dorothy, 72",
    role: "Rural Senior With Chronic Conditions",
    location: "Alpena County",
    context: "45 miles from hospital, weekly dialysis needs, spouse has health issues.",
    barriers: ["Digital literacy (uses flip phone)", "Transportation coordination", "6 specialists across 3 cities"],
    quote: "Can I see multiple doctors on the same day to reduce trips?",
    implications: [
      "Phone numbers prominently displayed (not hidden in dropdowns)",
      "Print-optimized appointment planning worksheets",
      "Simple language with medical term definitions",
    ],
    color: "border-michigan-sky/30 bg-michigan-sky/5",
    accent: "text-michigan-sky",
  },
  {
    name: "Amina, 41",
    role: "Refugee Community Health Worker",
    location: "Grand Rapids",
    context: "Helps Somali families navigate care, encounters language barriers and institutional distrust.",
    barriers: ["Translation gaps", "Cultural mistrust from trauma", "Unfamiliar insurance systems"],
    quote: "Families need to see themselves represented before they'll trust the information.",
    implications: [
      "Multilingual toggle (English/Spanish/Arabic — expandable)",
      "Cultural competency indicators on provider listings",
      "Trust signals: community partnership acknowledgments",
    ],
    color: "border-michigan-teal/30 bg-michigan-teal/5",
    accent: "text-michigan-teal",
  },
];

const journeys = [
  {
    title: "Finding Affordable Diabetes Care",
    persona: "Maria",
    steps: [
      { emoji: "😰", label: "Symptom Recognition", desc: '"I feel sick but have no insurance"' },
      { emoji: "😕", label: "Google Search", desc: '"49 results — which are affordable?"' },
      { emoji: "🤔", label: "Discover Michigan Access", desc: "Via 2-1-1 referral" },
      { emoji: "😊", label: 'Filter by "Sliding Scale"', desc: '"3 clinics within 5 miles"' },
      { emoji: "✅", label: "Validate Legitimacy", desc: "Sees .gov data sources, 988 resources" },
      { emoji: "✅", label: "Take Action", desc: "Calls clinic, confirms $20 fee, books appointment" },
      { emoji: "📈", label: "Ongoing Support", desc: "Returns for diabetes education classes" },
    ],
    insight: 'Trust signals crucial at step 5 — users verify site legitimacy before acting. Financial clarity needed upfront: not "affordable" but "$20–50 sliding scale based on income."',
    color: "border-michigan-coral/20",
  },
  {
    title: "Rural Senior Coordinating Complex Care",
    persona: "Dorothy",
    steps: [
      { emoji: "😤", label: "Overwhelmed", desc: '"6 appointments at 3 hospitals"' },
      { emoji: "👨‍👩‍👧", label: "Family Help", desc: "Daughter coordinates remotely" },
      { emoji: "💡", label: "Transportation Hub", desc: "Finds senior transit + ride coordination" },
      { emoji: "🤔", label: "Facility Comparison", desc: "Realizes 2 specialists at same hospital" },
      { emoji: "💡", label: "Optimization Insight", desc: "Can schedule same-day to reduce trips" },
      { emoji: "📞", label: "Coordinates", desc: "Uses phone numbers to arrange" },
      { emoji: "✅", label: "Reduced Burden", desc: "6 trips reduced to 3 coordinated days" },
    ],
    insight: "Information architecture must reveal optimization opportunities. Print/download features critical. Phone-first actions (not web forms).",
    color: "border-michigan-sky/20",
  },
  {
    title: "Community Health Worker Crisis Navigation",
    persona: "Amina",
    steps: [
      { emoji: "😰", label: "Family Crisis", desc: "Child's asthma attack, doesn't know where to go" },
      { emoji: "🏥", label: "CHW Quick Search", desc: "Needs pediatric urgent care with interpreters" },
      { emoji: "💚", label: "Language Indicator", desc: "Finds clinic with Somali interpretation" },
      { emoji: "✅", label: "Cultural Validation", desc: '"Refugee Health Program" listed' },
      { emoji: "📍", label: "Navigation Support", desc: "Uses map to guide family via rideshare" },
      { emoji: "📚", label: "Follow-Up Resources", desc: "Asthma management, Medicaid application" },
      { emoji: "👥", label: "Trust Built", desc: "Family seeks care proactively, refers others" },
    ],
    insight: "Language/cultural indicators must be first-class features. Real-time mobile usability in high-stress situations. Trust built through representation.",
    color: "border-michigan-teal/20",
  },
];

const usabilityFindings = [
  { finding: "Users didn't trust data without .gov badges", impact: "Critical", impactColor: "text-destructive", response: "Added source citations with .gov/.edu links on every page" },
  { finding: '"Affordable" was too vague', impact: "High", impactColor: "text-michigan-gold", response: 'Replaced with "$20–50 sliding scale based on income"' },
  { finding: "Maps hard to navigate one-handed on mobile", impact: "Medium", impactColor: "text-michigan-gold", response: "Increased tap targets to 44px, added list view toggle" },
  { finding: "Crisis resources overlooked in footer", impact: "Critical", impactColor: "text-destructive", response: "Moved 988/2-1-1 to persistent top banner" },
  { finding: "Print feature hidden", impact: "Low", impactColor: "text-michigan-forest", response: 'Added "Print this page" button to resource pages' },
];

export default function ResearchPage() {
  usePageMeta({ title: "User Research", description: "Research-driven insights centering the most vulnerable populations through human-centered design.", path: "/research" });
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-michigan-coral/5 to-background py-16 lg:py-24">
        <div className="container max-w-4xl text-center">
          <Breadcrumbs items={[{ label: "Research" }]} />
          <motion.span initial="hidden" animate="visible" variants={fade} custom={0} className="mb-4 inline-block rounded-full bg-michigan-coral/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-michigan-coral">
            User Research
          </motion.span>
          <motion.h1 variants={fade} custom={1} initial="hidden" animate="visible" className="mb-4 text-3xl font-bold text-foreground lg:text-5xl">
            Human-Centered Design for Health Equity
          </motion.h1>
          <motion.p variants={fade} custom={2} initial="hidden" animate="visible" className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Research-driven insights centering the most vulnerable populations.
          </motion.p>
        </div>
      </section>

      <div className="container max-w-5xl py-12 space-y-16">
        {/* Personas */}
        <section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}>
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">User Personas</h2>
                <p className="text-sm text-muted-foreground">Representative profiles from Michigan's most underserved populations</p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-6">
            {personas.map((p, i) => (
              <motion.div key={p.name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i}>
                <Card className={`${p.color} border-2`}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row lg:gap-8">
                      <div className="mb-4 lg:mb-0 lg:w-1/3">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className={`h-5 w-5 ${p.accent}`} />
                          <h3 className="text-lg font-bold text-foreground">{p.name}</h3>
                        </div>
                        <p className={`text-sm font-semibold ${p.accent}`}>{p.role}</p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {p.location}
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">{p.context}</p>
                        <blockquote className="mt-4 border-l-2 border-current pl-3 text-sm italic text-foreground">
                          "{p.quote}"
                        </blockquote>
                      </div>
                      <div className="lg:w-2/3 grid gap-4 sm:grid-cols-2">
                        <div>
                          <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Barriers</h4>
                          <ul className="space-y-1.5">
                            {p.barriers.map((b) => (
                              <li key={b} className="flex items-start gap-2 text-xs text-muted-foreground">
                                <AlertCircle className="mt-0.5 h-3 w-3 shrink-0 text-destructive" /> {b}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Design Implications</h4>
                          <ul className="space-y-1.5">
                            {p.implications.map((impl) => (
                              <li key={impl} className="flex items-start gap-2 text-xs text-muted-foreground">
                                <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-michigan-forest" /> {impl}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Journey Maps */}
        <section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}>
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-michigan-teal/10">
                <ArrowRight className="h-5 w-5 text-michigan-teal" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Journey Maps</h2>
                <p className="text-sm text-muted-foreground">Emotional arcs of real user scenarios</p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-8">
            {journeys.map((j, ji) => (
              <motion.div key={j.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={ji}>
                <Card className={`${j.color} border-2`}>
                  <CardContent className="pt-6">
                    <h3 className="mb-1 text-base font-bold text-foreground">{j.title}</h3>
                    <p className="mb-4 text-xs text-muted-foreground">Persona: {j.persona}</p>
                    <div className="overflow-x-auto">
                      <div className="flex gap-2 min-w-max pb-2">
                        {j.steps.map((s, si) => (
                          <div key={si} className="flex flex-col items-center w-28 shrink-0">
                            <span className="text-2xl mb-1" role="img" aria-label={s.label}>{s.emoji}</span>
                            <span className="text-[10px] font-bold text-foreground text-center leading-tight">{s.label}</span>
                            <span className="text-[10px] text-muted-foreground text-center mt-0.5 leading-tight">{s.desc}</span>
                            {si < j.steps.length - 1 && (
                              <ArrowRight className="mt-1 h-3 w-3 text-muted-foreground/40 rotate-0 hidden sm:block absolute" style={{ display: 'none' }} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 rounded-lg bg-muted/50 border border-border p-3">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-bold text-foreground">Key Insight:</span> {j.insight}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Usability Testing */}
        <section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}>
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-michigan-forest/10">
                <Search className="h-5 w-5 text-michigan-forest" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Usability Testing Insights</h2>
                <p className="text-sm text-muted-foreground">Findings from moderated testing sessions</p>
              </div>
            </div>
          </motion.div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Finding</th>
                  <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Impact</th>
                  <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Design Response</th>
                </tr>
              </thead>
              <tbody>
                {usabilityFindings.map((f, i) => (
                  <motion.tr key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i} className="border-b border-border last:border-0">
                    <td className="py-3 px-4 text-xs text-foreground">{f.finding}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${f.impactColor} bg-current/10`}>
                        <span className={f.impactColor}>{f.impact}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{f.response}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">
              Testing conducted with 12 participants: 4 uninsured individuals, 4 seniors, 4 community health workers. Remote moderated sessions using think-aloud protocol.
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
}
