import { useState } from "react";
import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Send, CheckCircle2, Mail, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

const subjects = ["General Inquiry", "Feedback", "Partnership", "Data Question"];

export default function ContactPage() {
  usePageMeta({ title: "Contact Us", description: "Have a question, suggestion, or partnership idea? Get in touch with Michigan Access.", path: "/contact" });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.subject || !form.message.trim()) return;
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-contact-email", {
        body: form,
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      console.error("Contact form error:", err);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout>
      <section className="bg-gradient-to-b from-primary/5 to-background py-12 lg:py-20">
        <div className="container max-w-4xl text-center">
          <Breadcrumbs items={[{ label: "Contact Us" }]} />
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              Get in Touch
            </span>
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} initial="hidden" animate="visible" className="mb-3 text-3xl font-bold text-foreground lg:text-5xl">
            Contact Us
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} initial="hidden" animate="visible" className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Have a question, suggestion, or partnership idea? We'd love to hear from you.
          </motion.p>
        </div>
      </section>

      <div className="container max-w-xl py-10">
        {submitted ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-michigan-forest/10">
              <CheckCircle2 className="h-8 w-8 text-michigan-forest" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Message Sent!</h2>
            <p className="text-muted-foreground">Thank you for reaching out. We'll review your message and get back to you soon.</p>
            <Button className="mt-6" variant="outline" onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}>
              Send Another Message
            </Button>
          </motion.div>
        ) : (
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label htmlFor="contact-name">Name</Label>
                    <Input id="contact-name" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={100} className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="contact-email">Email</Label>
                    <Input id="contact-email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required maxLength={255} className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="contact-subject">Subject</Label>
                    <Select value={form.subject} onValueChange={(v) => setForm({ ...form, subject: v })}>
                      <SelectTrigger className="mt-1.5" id="contact-subject">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="contact-message">Message</Label>
                    <Textarea id="contact-message" placeholder="How can we help?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required maxLength={1000} rows={5} className="mt-1.5" />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-michigan hover:opacity-90" disabled={sending || !form.name || !form.email || !form.subject || !form.message}>
                    {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    {sending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              <Mail className="inline h-3 w-3 mr-1" />
              We do not collect or store personal data beyond this form submission. <strong>No cookies, no tracking.</strong>
            </p>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
