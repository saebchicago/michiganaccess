import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle, Building2, MapPin, Globe, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const RESOURCE_TYPES = [
  { value: "food_nutrition", label: "Food & Nutrition" },
  { value: "housing_shelter", label: "Housing & Shelter" },
  { value: "transportation", label: "Transportation" },
  { value: "mental_health", label: "Mental Health" },
  { value: "health_services", label: "Health Services" },
  { value: "education", label: "Education & Training" },
  { value: "veterans_seniors", label: "Veterans & Seniors" },
  { value: "youth_family", label: "Youth & Family" },
  { value: "environment", label: "Environment" },
  { value: "information_referral", label: "Info & Referral" },
];

const MICHIGAN_COUNTIES = [
  "Alcona","Alger","Allegan","Alpena","Antrim","Arenac","Baraga","Barry","Bay","Benzie",
  "Berrien","Branch","Calhoun","Cass","Charlevoix","Cheboygan","Chippewa","Clare","Clinton","Crawford",
  "Delta","Dickinson","Eaton","Emmet","Genesee","Gladwin","Gogebic","Grand Traverse","Gratiot","Hillsdale",
  "Houghton","Huron","Ingham","Ionia","Iosco","Iron","Isabella","Jackson","Kalamazoo","Kalkaska",
  "Kent","Keweenaw","Lake","Lapeer","Leelanau","Lenawee","Livingston","Luce","Mackinac","Macomb",
  "Manistee","Marquette","Mason","Mecosta","Menominee","Midland","Missaukee","Monroe","Montcalm","Montmorency",
  "Muskegon","Newaygo","Oakland","Oceana","Ogemaw","Ontonagon","Osceola","Oscoda","Otsego","Ottawa",
  "Presque Isle","Roscommon","Saginaw","Sanilac","Schoolcraft","Shiawassee","St. Clair","St. Joseph","Tuscola","Van Buren",
  "Washtenaw","Wayne","Wexford"
];

interface FormData {
  organization_name: string;
  contact_name: string;
  contact_email: string;
  resource_type: string;
  description: string;
  services_offered: string;
  address: string;
  city: string;
  county: string;
  phone: string;
  website: string;
  is_free: boolean;
  walk_in_available: boolean;
}

const initialForm: FormData = {
  organization_name: "", contact_name: "", contact_email: "",
  resource_type: "health_services", description: "", services_offered: "",
  address: "", city: "", county: "", phone: "", website: "",
  is_free: false, walk_in_available: false,
};

export default function ResourceSubmissionForm() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (field: keyof FormData, value: string | boolean) =>
    setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.organization_name || !form.contact_name || !form.contact_email || !form.description) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSending(true);
    try {
      const payload = {
        ...form,
        services_offered: form.services_offered
          ? form.services_offered.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        website: form.website || undefined,
      };
      const { error } = await (supabase as any).functions.invoke("resource-submission", {
        body: payload,
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("Thank you! Your submission is under review.");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <Card className="border-michigan-forest/20 bg-michigan-forest/5">
        <CardContent className="py-8 text-center space-y-3">
          <CheckCircle className="h-12 w-12 text-michigan-forest-deep mx-auto" />
          <h3 className="text-lg font-semibold text-foreground">Submission Received</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Thank you for helping expand Michigan's resource directory. Our team will review your
            submission and follow up at <strong>{form.contact_email}</strong>.
          </p>
          <Button variant="outline" size="sm" onClick={() => { setSubmitted(false); setForm(initialForm); }}>
            Submit Another
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-primary" />
            Request to Be Listed
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Organizations can request to be added to our community resource directory. All submissions are reviewed before publishing.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="org">Organization Name *</Label>
                <Input id="org" value={form.organization_name} onChange={(e) => update("organization_name", e.target.value)} required maxLength={200} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="type">Resource Category *</Label>
                <Select value={form.resource_type} onValueChange={(v) => update("resource_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RESOURCE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cname">Contact Name *</Label>
                <Input id="cname" value={form.contact_name} onChange={(e) => update("contact_name", e.target.value)} required maxLength={100} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cemail">Contact Email *</Label>
                <Input id="cemail" type="email" value={form.contact_email} onChange={(e) => update("contact_email", e.target.value)} required maxLength={255} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="desc">Description of Services *</Label>
              <Textarea id="desc" value={form.description} onChange={(e) => update("description", e.target.value)} required maxLength={2000} rows={3} placeholder="Describe the services your organization provides..." />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="services">Services Offered (comma-separated)</Label>
              <Input id="services" value={form.services_offered} onChange={(e) => update("services_offered", e.target.value)} placeholder="e.g. Food pantry, Job training, Legal aid" maxLength={500} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="addr"><MapPin className="inline h-3 w-3 mr-1" />Address</Label>
                <Input id="addr" value={form.address} onChange={(e) => update("address", e.target.value)} maxLength={300} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={form.city} onChange={(e) => update("city", e.target.value)} maxLength={100} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="county">County</Label>
                <Select value={form.county} onValueChange={(v) => update("county", v)}>
                  <SelectTrigger><SelectValue placeholder="Select county" /></SelectTrigger>
                  <SelectContent>
                    {MICHIGAN_COUNTIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="phone"><Phone className="inline h-3 w-3 mr-1" />Phone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} maxLength={20} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="web"><Globe className="inline h-3 w-3 mr-1" />Website</Label>
                <Input id="web" type="url" value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="https://" maxLength={500} />
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_free} onCheckedChange={(v) => update("is_free", v)} />
                <Label className="text-sm">Free services</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.walk_in_available} onCheckedChange={(v) => update("walk_in_available", v)} />
                <Label className="text-sm">Walk-ins welcome</Label>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground">
              No personal data is collected beyond what you provide here. Submissions are reviewed within 5 business days.
            </p>

            <Button type="submit" disabled={sending} className="w-full sm:w-auto">
              <Send className="mr-2 h-4 w-4" />
              {sending ? "Submitting..." : "Submit for Review"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
