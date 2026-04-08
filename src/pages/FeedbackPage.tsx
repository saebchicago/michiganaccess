import { useState } from "react";
import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import { CheckCircle2, Loader2, RotateCcw, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

const CATEGORIES = [
  { value: "data_accuracy", label: "Data looks wrong or out of date" },
  { value: "broken_link", label: "A link is broken or goes somewhere unexpected" },
  { value: "accessibility", label: "Something isn't accessible (screen reader, keyboard, contrast)" },
  { value: "neutrality_concern", label: "Language or framing could be more neutral" },
  { value: "suggestion", label: "I have a suggestion or idea" },
  { value: "other", label: "Something else" },
];

type FormState = {
  page_path: string;
  category: string;
  element_reference: string;
  description: string;
  suggested_correction: string;
  source_reference: string;
  contact_opt_in: boolean;
  contact_email: string;
};

function emptyForm(pagePath: string, initialCategory: string): FormState {
  return {
    page_path: pagePath,
    category: initialCategory,
    element_reference: "",
    description: "",
    suggested_correction: "",
    source_reference: "",
    contact_opt_in: false,
    contact_email: "",
  };
}

export default function FeedbackPage() {
  usePageMeta({
    title: "Help us improve",
    description: "Flag data errors, broken links, or suggest improvements to AccessMI. Your feedback shapes what we build.",
    path: "/feedback",
  });

  const [searchParams] = useSearchParams();
  const fromPath = searchParams.get("from") ?? "";
  const initialCategory = searchParams.get("initial_category") ?? "";

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [optedIn, setOptedIn] = useState(false);
  const [form, setForm] = useState<FormState>(() => emptyForm(fromPath, initialCategory));

  const set = (field: keyof FormState, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const isValid = () => {
    if (!form.page_path.trim()) return false;
    if (!form.category) return false;
    if (form.description.trim().length < 10) return false;
    if (form.contact_opt_in && !isValidEmail(form.contact_email)) return false;
    return true;
  };

  const isValidEmail = (email: string) =>
    /^[^@]+@[^@]+\.[^@]+$/.test(email.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid()) return;
    setSubmitting(true);
    try {
      const payload = {
        page_path: form.page_path.trim().slice(0, 500),
        category: form.category,
        element_reference: form.element_reference.trim().slice(0, 500) || null,
        description: form.description.trim().slice(0, 2000),
        suggested_correction: form.suggested_correction.trim().slice(0, 2000) || null,
        source_reference: form.source_reference.trim().slice(0, 500) || null,
        contact_opt_in: form.contact_opt_in,
        contact_email: form.contact_opt_in ? form.contact_email.trim() : null,
      };
      const { error } = await (supabase as any).from("community_feedback").insert(payload);
      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      console.error("Feedback submission error:", err);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setOptedIn(false);
    setForm(emptyForm(fromPath, initialCategory));
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-12 lg:py-20">
        <div className="container max-w-4xl text-center">
          <Breadcrumbs items={[{ label: "Help us improve" }]} />
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              Community Feedback
            </span>
          </motion.div>
          <motion.h1
            variants={fadeUp}
            custom={1}
            initial="hidden"
            animate="visible"
            className="mb-3 text-3xl font-bold text-foreground lg:text-5xl"
          >
            Help us improve
          </motion.h1>
          <motion.p
            variants={fadeUp}
            custom={2}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-2xl text-lg text-muted-foreground"
          >
            AccessMI is built by and for fellow citizens. If you spot a data error, a broken link,
            an accessibility issue, or something that just feels off, tell us. Every report is
            reviewed. You don't need to give your name or email.
          </motion.p>
          <motion.p
            variants={fadeUp}
            custom={3}
            initial="hidden"
            animate="visible"
            className="mt-3 text-sm text-muted-foreground"
          >
            For urgent concerns, you can also{" "}
            <Link to="/contact" className="text-primary hover:underline">
              contact us directly
            </Link>
            .
          </motion.p>
        </div>
      </section>

      {/* Form / Success */}
      <div className="container max-w-2xl py-10">
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-michigan-forest/10">
              <CheckCircle2 className="h-8 w-8 text-michigan-forest" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Thank you for helping improve AccessMI
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your report has been recorded. We review every submission.
              {form.contact_opt_in && (
                <> If you opted in for follow-up contact, we'll reach out within 5 business days.</>
              )}
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button variant="outline" asChild>
                <Link to="/" aria-label="Return to home page">
                  <Home className="mr-2 h-4 w-4" aria-hidden="true" />
                  Return home
                </Link>
              </Button>
              <Button variant="ghost" onClick={resetForm} aria-label="Report another issue">
                <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                Report another issue
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>

                  {/* 1. Page path */}
                  <div>
                    <Label htmlFor="fb-page-path">Page you're reporting on <span aria-hidden="true">*</span></Label>
                    <Input
                      id="fb-page-path"
                      placeholder="/county/wayne"
                      value={form.page_path}
                      onChange={(e) => set("page_path", e.target.value)}
                      maxLength={500}
                      required
                      className="mt-1.5"
                      aria-describedby="fb-page-path-hint"
                    />
                    <p id="fb-page-path-hint" className="mt-1 text-xs text-muted-foreground">
                      If you came from a specific page, we've filled it in for you. Edit if needed.
                    </p>
                  </div>

                  {/* 2. Category */}
                  <div>
                    <Label htmlFor="fb-category">Type of feedback <span aria-hidden="true">*</span></Label>
                    <Select
                      value={form.category}
                      onValueChange={(v) => set("category", v)}
                    >
                      <SelectTrigger className="mt-1.5" id="fb-category" aria-required="true">
                        <SelectValue placeholder="Select the type of feedback" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 3. Element reference (optional) */}
                  <div>
                    <Label htmlFor="fb-element">Specific chart, stat, link, or section (optional)</Label>
                    <Input
                      id="fb-element"
                      placeholder="e.g. 'The unemployment rate on the Wayne County page'"
                      value={form.element_reference}
                      onChange={(e) => set("element_reference", e.target.value)}
                      maxLength={500}
                      className="mt-1.5"
                      aria-describedby="fb-element-hint"
                    />
                    <p id="fb-element-hint" className="mt-1 text-xs text-muted-foreground">
                      Example: "The unemployment rate on the Wayne County page" or "The link to Michigan FOIA law."
                    </p>
                  </div>

                  {/* 4. Description (required, min 10) */}
                  <div>
                    <Label htmlFor="fb-description">
                      What did you see, and why do you think it needs attention? <span aria-hidden="true">*</span>
                    </Label>
                    <Textarea
                      id="fb-description"
                      placeholder="Be as specific as you can. We read every report."
                      value={form.description}
                      onChange={(e) => set("description", e.target.value)}
                      maxLength={2000}
                      rows={5}
                      required
                      className="mt-1.5 resize-none"
                      aria-describedby="fb-description-hint"
                    />
                    <p id="fb-description-hint" className="mt-1 text-xs text-muted-foreground">
                      Please focus on what you observed, not who you think is responsible.
                    </p>
                  </div>

                  {/* 5. Suggested correction (optional) */}
                  <div>
                    <Label htmlFor="fb-correction">Suggested correction (optional)</Label>
                    <Textarea
                      id="fb-correction"
                      placeholder="What should it say instead?"
                      value={form.suggested_correction}
                      onChange={(e) => set("suggested_correction", e.target.value)}
                      maxLength={2000}
                      rows={3}
                      className="mt-1.5 resize-none"
                      aria-describedby="fb-correction-hint"
                    />
                    <p id="fb-correction-hint" className="mt-1 text-xs text-muted-foreground">
                      If you know what the correct information is, share it here.
                    </p>
                  </div>

                  {/* 6. Source reference (optional) */}
                  <div>
                    <Label htmlFor="fb-source">Source we can verify against (optional)</Label>
                    <Input
                      id="fb-source"
                      placeholder="https://... or 'CDC, 2024 BRFSS'"
                      value={form.source_reference}
                      onChange={(e) => set("source_reference", e.target.value)}
                      maxLength={500}
                      className="mt-1.5"
                      aria-describedby="fb-source-hint"
                    />
                    <p id="fb-source-hint" className="mt-1 text-xs text-muted-foreground">
                      Example: a CDC dataset, a state website, a published report. Paste a link or citation.
                    </p>
                  </div>

                  {/* 7. Contact opt-in */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="fb-opt-in"
                        checked={form.contact_opt_in}
                        onCheckedChange={(checked) => {
                          const val = checked === true;
                          setOptedIn(val);
                          set("contact_opt_in", val);
                          if (!val) set("contact_email", "");
                        }}
                        aria-describedby="fb-opt-in-hint"
                      />
                      <Label htmlFor="fb-opt-in" className="cursor-pointer font-normal leading-snug">
                        Yes, I'm okay with AccessMI contacting me about this report.
                      </Label>
                    </div>
                    {optedIn && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Label htmlFor="fb-email">Email address <span aria-hidden="true">*</span></Label>
                        <Input
                          id="fb-email"
                          type="email"
                          placeholder="you@example.com"
                          value={form.contact_email}
                          onChange={(e) => set("contact_email", e.target.value)}
                          maxLength={255}
                          required={optedIn}
                          className="mt-1.5"
                          aria-describedby="fb-email-hint"
                        />
                        <p id="fb-email-hint" className="mt-1 text-xs text-muted-foreground">
                          Only used for this report. Not added to any list.
                        </p>
                      </motion.div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-michigan hover:opacity-90"
                    disabled={submitting || !isValid()}
                    aria-label="Submit your report"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                        Submitting…
                      </>
                    ) : (
                      "Submit report"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              No personal data is collected unless you opt in above. No cookies, no tracking.
            </p>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
