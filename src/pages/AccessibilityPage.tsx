import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  Accessibility, Eye, Keyboard, Monitor, Globe, Phone,
  CheckCircle2, Mail, Volume2, MousePointer, Contrast
} from "lucide-react";

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const standards = [
  { icon: Eye, title: "Visual Accessibility", items: [
    "Color contrast ratios meet WCAG 2.1 AA minimum (4.5:1 for text, 3:1 for large text)",
    "User-controlled High Contrast mode persisted via localStorage",
    "No information conveyed by color alone — icons and text labels supplement all color indicators",
    "Responsive text sizing that respects browser zoom up to 200%",
  ]},
  { icon: Keyboard, title: "Keyboard Navigation", items: [
    "All interactive elements reachable via Tab key in logical order",
    "Skip-to-content link as first focusable element on every page",
    "Visible focus indicators on all interactive elements",
    "Dropdown menus and modals fully keyboard-operable with Escape to close",
  ]},
  { icon: Volume2, title: "Screen Reader Support", items: [
    "Semantic HTML5 elements (header, nav, main, section, footer) for landmark navigation",
    "ARIA labels on icons, interactive widgets, and dynamic content regions",
    "Descriptive alt text on all images; decorative images marked aria-hidden",
    "Live regions for dynamic content updates (chat widget, loading states)",
  ]},
  { icon: Globe, title: "Language & Cultural Access", items: [
    "Full multilingual support: English, Spanish, Arabic, and Bengali",
    "RTL (right-to-left) layout mirroring for Arabic content",
    "All content written at 8th-grade reading level for health literacy",
    "Cultural sensitivity review for all user-facing terminology",
  ]},
  { icon: Monitor, title: "Device & Network Access", items: [
    "Mobile-first responsive design tested across screen sizes 320px–1920px",
    "Progressive loading with skeleton states for slow connections",
    "Lazy-loaded images and code-split routes for performance",
    "Print-optimized stylesheets for resource pages",
  ]},
  { icon: MousePointer, title: "Motor Accessibility", items: [
    "Touch targets minimum 44×44px for mobile interactions",
    "No time-limited interactions or auto-advancing content",
    "Generous click/tap areas on cards, buttons, and navigation links",
    "No drag-and-drop required for any core functionality",
  ]},
];

const testingMethods = [
  "Automated testing with axe-core and Lighthouse accessibility audits",
  "Manual keyboard-only navigation testing across all pages",
  "Screen reader testing with NVDA (Windows) and VoiceOver (macOS/iOS)",
  "Color contrast verification using WebAIM Contrast Checker",
  "Tested with user personas representing cognitive disabilities, low vision, and motor impairments",
  "Responsive design testing on physical devices (not just emulators)",
];

export default function AccessibilityPage() {
  usePageMeta({
    title: "Accessibility Statement",
    description: "Access Michigan is committed to WCAG 2.1 AA compliance, ensuring equitable access to public service information for all Michigan residents.",
    path: "/accessibility",
  });

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 lg:py-24">
        <div className="container max-w-4xl text-center">
          <Breadcrumbs items={[{ label: "Accessibility" }]} />
          <motion.span initial="hidden" animate="visible" variants={fade} custom={0} className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            Accessibility Commitment
          </motion.span>
          <motion.h1 variants={fade} custom={1} initial="hidden" animate="visible" className="mb-4 text-3xl font-bold text-foreground lg:text-5xl">
            Accessibility Statement
          </motion.h1>
          <motion.p variants={fade} custom={2} initial="hidden" animate="visible" className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Access Michigan is committed to ensuring equitable access to public service information for all Michigan residents, regardless of ability, device, or language.
          </motion.p>
        </div>
      </section>

      <div className="container max-w-5xl py-12 space-y-16">
        {/* Commitment */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}>
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 lg:p-12">
            <div className="flex items-center gap-3 mb-4">
              <Accessibility className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Our Commitment</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Access Michigan strives to conform to the <strong>Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</strong> standards. These guidelines are developed by the World Wide Web Consortium (W3C) and are widely regarded as the international standard for web accessibility.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              As a civic resource serving vulnerable populations — including uninsured residents, seniors with limited digital literacy, refugees navigating language barriers, and people with disabilities — accessibility is not an afterthought. It is a core design principle that informs every decision we make.
            </p>
          </div>
        </motion.section>

        {/* Standards */}
        <section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}>
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Contrast className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Accessibility Features</h2>
                <p className="text-sm text-muted-foreground">How we implement inclusive design across the platform</p>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {standards.map((s, i) => (
              <motion.div key={s.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i}>
                <Card className="h-full hover-lift">
                  <CardContent className="pt-6">
                    <s.icon className="mb-3 h-5 w-5 text-primary" />
                    <h3 className="mb-3 text-sm font-bold text-foreground">{s.title}</h3>
                    <ul className="space-y-1.5">
                      {s.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-michigan-forest" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Testing */}
        <section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}>
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-michigan-forest/10">
                <CheckCircle2 className="h-5 w-5 text-michigan-forest" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Testing Methodology</h2>
                <p className="text-sm text-muted-foreground">How we verify and maintain accessibility compliance</p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-3">
            {testingMethods.map((method, i) => (
              <motion.div key={method} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-michigan-forest" />
                <p className="text-sm text-muted-foreground">{method}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Known Limitations */}
        <section>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-michigan-coral/10">
                <Eye className="h-5 w-5 text-michigan-coral" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Known Limitations</h2>
                <p className="text-sm text-muted-foreground">Areas we are actively working to improve</p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-3">
            {[
              "Interactive map (Leaflet.js) has limited screen reader support for individual facility markers. A fully accessible list-view alternative is always available.",
              "Some data visualizations (Recharts) may not fully convey information to screen readers. Text summaries accompany all charts.",
              "PDF resources linked from external agencies may not meet accessibility standards. We link to HTML alternatives where available.",
              "AI chat widget responses are generated dynamically and may occasionally produce content that is not optimally structured for screen readers.",
            ].map((item, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={i} className="rounded-lg border border-border bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">{item}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Contact */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}>
          <div className="rounded-2xl border border-michigan-teal/20 bg-michigan-teal/5 p-8 lg:p-12 text-center">
            <Mail className="mx-auto mb-4 h-8 w-8 text-michigan-teal" />
            <h2 className="text-2xl font-bold text-foreground mb-3">Report an Accessibility Barrier</h2>
            <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto mb-6">
              If you encounter any accessibility barriers while using Access Michigan, we want to know. Your feedback helps us improve the platform for everyone.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/contact" className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
                <Mail className="h-4 w-4" />
                Contact Us
              </a>
              <a href="tel:211" className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
                <Phone className="h-4 w-4" />
                Call 2-1-1
              </a>
            </div>
          </div>
        </motion.section>
      </div>
    </Layout>
  );
}
