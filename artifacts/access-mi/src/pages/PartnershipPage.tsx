import { useState } from "react";
import { motion } from "framer-motion";
import { Handshake, CheckCircle2, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function PartnershipPage() {
  const { t } = useTranslation();
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    organization_name: "",
    contact_name: "",
    contact_email: "",
    organization_type: "nonprofit",
    description: "",
    website: "",
    phone: "",
    city: "",
    county: "",
  });

  const updateField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

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
      toast.success(t("partnership.success"));
    } catch (err: any) {
      toast.error("Submission failed. Please try again.");
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <Layout>
        <Breadcrumbs items={[{ label: t("partnership.title") }]} />
        <section className="py-20">
          <div className="container max-w-lg text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 text-michigan-forest-deep mb-4" />
            <h1 className="text-2xl font-bold mb-2">{t("partnership.success")}</h1>
            <p className="text-muted-foreground">We'll review your submission and reach out if we have questions.</p>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <Breadcrumbs items={[{ label: t("partnership.title") }]} />

      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-michigan-navy/5 to-background py-16">
        <div className="container max-w-3xl text-center">
          <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
              <Handshake className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">{t("partnership.title")}</span>
            </div>
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">{t("partnership.title")}</h1>
            <p className="text-muted-foreground text-lg">{t("partnership.subtitle")}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="container max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Organization</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">{t("partnership.orgName")} *</label>
                    <Input value={form.organization_name} onChange={(e) => updateField("organization_name", e.target.value)} required />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">{t("partnership.orgType")}</label>
                    <Select value={form.organization_type} onValueChange={(v) => updateField("organization_type", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nonprofit">{t("partnership.nonprofit")}</SelectItem>
                        <SelectItem value="government">{t("partnership.government")}</SelectItem>
                        <SelectItem value="healthcare">{t("partnership.healthcare")}</SelectItem>
                        <SelectItem value="community">{t("partnership.community")}</SelectItem>
                        <SelectItem value="other">{t("partnership.other")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">{t("partnership.contactName")} *</label>
                    <Input value={form.contact_name} onChange={(e) => updateField("contact_name", e.target.value)} required />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">{t("partnership.contactEmail")} *</label>
                    <Input type="email" value={form.contact_email} onChange={(e) => updateField("contact_email", e.target.value)} required />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">{t("partnership.description")} *</label>
                  <Textarea rows={4} value={form.description} onChange={(e) => updateField("description", e.target.value)} required />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">{t("partnership.website")}</label>
                    <Input value={form.website} onChange={(e) => updateField("website", e.target.value)} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">{t("partnership.phone")}</label>
                    <Input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">{t("partnership.city")}</label>
                    <Input value={form.city} onChange={(e) => updateField("city", e.target.value)} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">{t("partnership.county")}</label>
                    <Input value={form.county} onChange={(e) => updateField("county", e.target.value)} />
                  </div>
                </div>

                <Button type="submit" disabled={sending} className="w-full bg-gradient-michigan">
                  {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("partnership.submit")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
