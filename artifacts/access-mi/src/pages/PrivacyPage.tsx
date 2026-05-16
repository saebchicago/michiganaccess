import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Separator } from "@/components/ui/separator";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Shield, Lock, Eye, Database, Globe, FileText, Scale, AlertTriangle, Heart, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const fade = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.45 } }),
};

export default function PrivacyPage() {
  usePageMeta({
    title: "Privacy Policy | Access Michigan",
    description:
      "Access Michigan's privacy policy explains what data we collect, how we protect your information, HIPAA disclaimers, and your rights under Michigan and federal law.",
    path: "/privacy",
  });

  const effectiveDate = "February 27, 2026";

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 lg:py-24">
        <div className="container max-w-4xl text-center">
          <Breadcrumbs items={[{ label: "Privacy Policy" }]} />
          <motion.span initial="hidden" animate="visible" variants={fade} custom={0} className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            Your Privacy Matters
          </motion.span>
          <motion.h1 variants={fade} custom={1} initial="hidden" animate="visible" className="mb-4 text-3xl font-bold text-foreground lg:text-5xl">
            Privacy Policy
          </motion.h1>
          <motion.p variants={fade} custom={2} initial="hidden" animate="visible" className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Access Michigan is designed to be useful without tracking you. This policy explains what we collect, what we don't, and your rights.
          </motion.p>
          <motion.p variants={fade} custom={3} initial="hidden" animate="visible" className="mt-4 text-sm text-muted-foreground">
            <strong>Effective Date:</strong> {effectiveDate} · <strong>Last Updated:</strong> {effectiveDate}
          </motion.p>
        </div>
      </section>

      <div className="container max-w-4xl py-12 space-y-14">

        {/* 1 — Overview */}
        <Section icon={Shield} title="1. Overview" index={0}>
          <p>
            Access Michigan ("the Platform") is an independent, non-commercial civic resource that helps Michigan residents navigate healthcare, social services, and community resources. We are <strong>not a government agency, healthcare provider, or insurance company</strong>. We do not sell advertising, and we do not monetize your data in any way.
          </p>
          <p>
            Our guiding principle is <strong>privacy by design</strong>: we collect the absolute minimum information needed to operate and improve the Platform. Where possible, data processing occurs entirely in your browser and never reaches our servers.
          </p>
        </Section>

        <Separator />

        {/* 2 — What We Don't Do */}
        <Section icon={Lock} title="2. What We Do NOT Do" index={1}>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>No targeted advertising</strong> — Access Michigan displays zero ads.</li>
            <li><strong>No sale or sharing of personal data</strong> — We never sell, rent, license, or share your information with third parties for marketing.</li>
            <li><strong>No user accounts or login required</strong> — The Platform is fully accessible without creating an account or providing identifying information.</li>
            <li><strong>No tracking cookies</strong> — We do not use cookies for analytics, advertising, or behavioral profiling.</li>
            <li><strong>No attempt to identify individuals</strong> — We do not fingerprint browsers, track across sites, or build user profiles.</li>
            <li><strong>No storage of Protected Health Information (PHI)</strong> — Health-related tools (AI appeals generator, benefits wizard, symptom information) process data client-side. We do not store, transmit, or retain any health information you enter.</li>
          </ul>
        </Section>

        <Separator />

        {/* 3 — What We May Collect */}
        <Section icon={Database} title="3. Information We May Collect" index={2}>
          <h3 className="text-base font-semibold text-foreground mt-2 mb-2">3a. Operational Server Logs</h3>
          <p>
            Our hosting provider (Netlify / Vercel) automatically collects minimal operational data for security and reliability:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 mt-2">
            <li>IP addresses (not linked to any user profile)</li>
            <li>Request timestamps and HTTP methods</li>
            <li>Browser user-agent strings</li>
            <li>Referring URLs</li>
          </ul>
          <p className="mt-3">
            These logs are retained for <strong>30 days or less</strong> and are used exclusively for security monitoring, error detection, and capacity planning. They are never analyzed to identify individual users.
          </p>

          <h3 className="text-base font-semibold text-foreground mt-6 mb-2">3b. Aggregated Usage Analytics</h3>
          <p>
            If analytics are enabled, we collect <strong>aggregated, non-identifying</strong> page-view counts and search terms to understand which resources are most useful. This data cannot be traced to individual visitors.
          </p>

          <h3 className="text-base font-semibold text-foreground mt-6 mb-2">3c. Voluntarily Submitted Information</h3>
          <p>
            If you choose to use certain features, you may provide information voluntarily:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 mt-2">
            <li><strong>Contact Form:</strong> Name, email address, subject, and message. Used solely to respond to your inquiry.</li>
            <li><strong>Resource Submissions:</strong> Organization details submitted for inclusion in our directory.</li>
            <li><strong>Page Feedback:</strong> Anonymous "helpful/not helpful" ratings with optional comments (no personal data collected).</li>
            <li><strong>Partnership Inquiries:</strong> Organization and contact details for partnership evaluation.</li>
          </ul>

          <h3 className="text-base font-semibold text-foreground mt-6 mb-2">3d. Local Browser Storage</h3>
          <p>
            Some features use your browser's <code className="rounded bg-muted px-1.5 py-0.5 text-xs">localStorage</code> to remember preferences (theme, language, recently viewed counties). This data never leaves your device and can be cleared at any time through your browser settings.
          </p>
        </Section>

        <Separator />

        {/* 4 — AI Features */}
        <Section icon={Eye} title="4. Automated Features" index={3}>
          <p>
            Access Michigan includes AI-powered tools such as the chat assistant and insurance appeal letter generator. Important privacy details about these features:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li><strong>No conversation logging:</strong> AI chat messages are processed in real-time via secure backend functions and are <strong>not stored</strong> on our servers after the response is delivered.</li>
            <li><strong>No PHI storage:</strong> Any health details, insurance information, or personal circumstances you enter into the appeal generator or chat are processed transiently and discarded immediately after generating a response.</li>
            <li><strong>Third-party AI models:</strong> AI responses are generated by third-party language model providers. Your prompts are sent to these providers under their data processing terms. We select providers that do not use input data for model training.</li>
            <li><strong>Not medical advice:</strong> AI-generated content is informational only and does not constitute medical, legal, or insurance advice. See Section 7 for HIPAA disclaimers.</li>
          </ul>
        </Section>

        <Separator />

        {/* 5 — Third-Party Services */}
        <Section icon={Globe} title="5. Third-Party Services" index={4}>
          <p>
            Access Michigan integrates data from public agencies and may load resources from third-party services. Each may have its own privacy policy:
          </p>
          <div className="mt-3 space-y-3">
            {[
              { name: "Leaflet / CARTO basemaps", purpose: "Interactive maps", note: "Map tiles served via CARTO CDN, using OpenStreetMap data. See carto.com/legal and openstreetmap.org/privacy" },
              { name: "Federal & State Data APIs", purpose: "CMS, HRSA, CDC, EPA, NWS data", note: "Requests routed through our secure proxy functions; your IP is not forwarded" },
              { name: "AI Model Providers", purpose: "Chat and appeal generation", note: "Prompts processed under provider terms; no personal data included in requests by design" },
              { name: "Hosting Platform", purpose: "Serving the website", note: "Standard operational logs retained per hosting provider policy (≤30 days)" },
            ].map((svc) => (
              <div key={svc.name} className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{svc.name}</p>
                    <p className="text-xs text-muted-foreground">{svc.purpose}</p>
                  </div>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">{svc.note}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            We apply a global <code className="rounded bg-muted px-1.5 py-0.5 text-xs">no-referrer</code> policy on external links to prevent destination sites from knowing which Access Michigan page you came from.
          </p>
        </Section>

        <Separator />

        {/* 6 — Data Security */}
        <Section icon={Shield} title="6. Data Security" index={5}>
          <p>
            We employ industry-standard security measures to protect any data we handle:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li><strong>Encryption in transit:</strong> All connections use HTTPS/TLS encryption.</li>
            <li><strong>Row-Level Security (RLS):</strong> Database tables enforce strict access controls. Public submissions (contact forms, feedback) are insert-only; no public read or modification access.</li>
            <li><strong>Input validation:</strong> All backend functions validate and sanitize inputs using Zod schema validation.</li>
            <li><strong>Rate limiting:</strong> Backend functions enforce rate limits (5–10 requests per minute) to prevent abuse.</li>
            <li><strong>No authentication required:</strong> Since we don't require accounts, there are no passwords or credentials to protect — reducing attack surface by design.</li>
          </ul>
        </Section>

        <Separator />

        {/* 7 — HIPAA */}
        <Section icon={AlertTriangle} title="7. HIPAA Disclaimer" index={6}>
          <div className="rounded-xl border-2 border-michigan-coral/30 bg-michigan-coral/5 p-6">
            <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-michigan-coral" />
              Important Health Information Disclaimer
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong>Access Michigan is NOT a covered entity under the Health Insurance Portability and Accountability Act (HIPAA).</strong> We are not a healthcare provider, health plan, or healthcare clearinghouse.
              </p>
              <p>
                Because Access Michigan does not collect, store, process, or transmit Protected Health Information (PHI), HIPAA regulations do not apply to this Platform. However, we voluntarily adopt privacy-protective practices that align with the spirit of HIPAA's Privacy Rule:
              </p>
              <ul className="list-disc pl-6 space-y-1.5">
                <li>We design tools so that health-related data is processed client-side whenever possible.</li>
                <li>When server-side processing is necessary (e.g., AI features), data is processed transiently and not persisted.</li>
                <li>We do not combine health-related inputs with any identifying information.</li>
                <li>We do not share any user inputs with third parties for purposes beyond immediate response generation.</li>
              </ul>
              <p className="font-medium text-foreground">
                If you need to share sensitive health information, please communicate directly with your healthcare provider through their HIPAA-compliant patient portal or secure messaging system.
              </p>
            </div>
          </div>
        </Section>

        <Separator />

        {/* 8 — Michigan Privacy Rights */}
        <Section icon={Scale} title="8. Your Rights Under Michigan & Federal Law" index={7}>
          <p>
            Michigan residents have specific privacy protections under state and federal law:
          </p>

          <h3 className="text-base font-semibold text-foreground mt-5 mb-2">Michigan Identity Theft Protection Act (MCL 445.61–445.79c)</h3>
          <p>
            Although Access Michigan does not collect personal identifying information as defined by this Act, we comply with its requirements for any data we do handle, including prompt notification in the unlikely event of a security breach.
          </p>

          <h3 className="text-base font-semibold text-foreground mt-5 mb-2">Michigan Consumer Protection Act (MCL 445.901–445.922)</h3>
          <p>
            Access Michigan does not engage in trade or commerce and makes no commercial representations. All information is provided as a free civic resource for public benefit.
          </p>

          <h3 className="text-base font-semibold text-foreground mt-5 mb-2">Children's Online Privacy Protection Act (COPPA)</h3>
          <p>
            Access Michigan is designed for a general audience and does not knowingly collect personal information from children under 13. If you believe a child has provided personal information through our contact form, please <Link to="/contact" className="text-primary hover:underline">contact us</Link> and we will promptly delete it.
          </p>

          <h3 className="text-base font-semibold text-foreground mt-5 mb-2">Your Rights</h3>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-1.5 mt-2">
            <li><strong>Access:</strong> Request a copy of any personal information we hold about you (likely none, given our minimal collection).</li>
            <li><strong>Deletion:</strong> Request deletion of any data you've submitted through contact forms or resource submissions.</li>
            <li><strong>Correction:</strong> Request correction of any inaccurate information.</li>
            <li><strong>Opt-out:</strong> Clear browser localStorage at any time to remove all locally stored preferences.</li>
          </ul>
          <p className="mt-3">
            To exercise these rights, please use our <Link to="/contact" className="text-primary hover:underline">contact page</Link>. We will respond within 30 days.
          </p>
        </Section>

        <Separator />

        {/* 9 — Data Retention */}
        <Section icon={FileText} title="9. Data Retention" index={8}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 pr-4 text-left font-semibold text-foreground">Data Type</th>
                  <th className="py-3 pr-4 text-left font-semibold text-foreground">Retention Period</th>
                  <th className="py-3 text-left font-semibold text-foreground">Purpose</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {[
                  ["Server logs", "≤30 days", "Security & error monitoring"],
                  ["Contact form submissions", "Until resolved + 90 days", "Respond to inquiries"],
                  ["Resource submissions", "Until reviewed", "Directory inclusion decisions"],
                  ["Page feedback", "Indefinitely (anonymous)", "Improve content quality"],
                  ["Search analytics", "Aggregated, indefinitely", "Improve search relevance"],
                  ["AI chat / appeal inputs", "Not retained", "Processed transiently only"],
                  ["Browser localStorage", "Until you clear it", "Your local preferences"],
                ].map(([type, period, purpose]) => (
                  <tr key={type} className="border-b border-border/50">
                    <td className="py-2.5 pr-4 font-medium text-foreground">{type}</td>
                    <td className="py-2.5 pr-4">{period}</td>
                    <td className="py-2.5">{purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Separator />

        {/* 10 — Changes */}
        <Section icon={FileText} title="10. Changes to This Policy" index={9}>
          <p>
            We may update this Privacy Policy to reflect changes in our practices or applicable law. When we make material changes, we will update the "Last Updated" date at the top of this page. We encourage you to review this policy periodically.
          </p>
          <p className="mt-3">
            All previous versions of this policy are available through our <Link to="/changelog" className="text-primary hover:underline">changelog</Link>.
          </p>
        </Section>

        <Separator />

        {/* Contact */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={0}>
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 lg:p-12 text-center">
            <Mail className="mx-auto mb-4 h-8 w-8 text-primary" />
            <h2 className="text-2xl font-bold text-foreground mb-3">Privacy Questions?</h2>
            <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto mb-6">
              If you have questions about this Privacy Policy or want to exercise your data rights, we're here to help.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Mail className="h-4 w-4" />
              Contact Us
            </Link>
          </div>
        </motion.section>
      </div>
    </Layout>
  );
}

/* ── Reusable Section Wrapper ─────────────────────────────────── */
function Section({ icon: Icon, title, index, children }: { icon: React.ElementType; title: string; index: number; children: React.ReactNode }) {
  return (
    <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} custom={index}>
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground lg:text-2xl">{title}</h2>
      </div>
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        {children}
      </div>
    </motion.section>
  );
}
