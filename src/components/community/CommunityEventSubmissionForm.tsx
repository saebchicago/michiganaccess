import { useState } from "react";
import { CalendarIcon, CheckCircle, Send, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EVENT_TYPES } from "@/hooks/useCommunityEvents";

const MICHIGAN_COUNTIES_SHORT = [
  "Alcona","Alger","Allegan","Alpena","Antrim","Arenac","Baraga","Barry","Bay","Benzie",
  "Berrien","Branch","Calhoun","Cass","Charlevoix","Cheboygan","Chippewa","Clare","Clinton",
  "Crawford","Delta","Dickinson","Eaton","Emmet","Genesee","Gladwin","Gogebic","Grand Traverse",
  "Gratiot","Hillsdale","Houghton","Huron","Ingham","Ionia","Iosco","Iron","Isabella","Jackson",
  "Kalamazoo","Kalkaska","Kent","Keweenaw","Lake","Lapeer","Leelanau","Lenawee","Livingston",
  "Luce","Mackinac","Macomb","Manistee","Marquette","Mason","Mecosta","Menominee","Midland",
  "Missaukee","Monroe","Montcalm","Montmorency","Muskegon","Newaygo","Oakland","Oceana",
  "Ogemaw","Ontonagon","Osceola","Oscoda","Otsego","Ottawa","Presque Isle","Roscommon",
  "Saginaw","Sanilac","Schoolcraft","Shiawassee","St. Clair","St. Joseph","Tuscola",
  "Van Buren","Washtenaw","Wayne","Wexford",
];

interface FormState {
  title: string;
  description: string;
  event_type: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location_name: string;
  address: string;
  city: string;
  county: string;
  zip: string;
  organizer: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  is_free: boolean;
  registration_required: boolean;
  registration_url: string;
}

const initial: FormState = {
  title: "", description: "", event_type: "health_fair", event_date: "",
  start_time: "", end_time: "", location_name: "", address: "", city: "",
  county: "", zip: "", organizer: "", contact_email: "", contact_phone: "",
  website: "", is_free: true, registration_required: false, registration_url: "",
};

export default function CommunityEventSubmissionForm() {
  const [form, setForm] = useState<FormState>(initial);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (k: keyof FormState, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.event_date || !form.location_name.trim() || !form.city.trim() || !form.county) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSending(true);
    try {
      const { error } = await (supabase as any).from("community_events").insert({
        title: form.title.trim(),
        description: form.description.trim() || null,
        event_type: form.event_type,
        event_date: form.event_date,
        start_time: form.start_time || null,
        end_time: form.end_time || null,
        location_name: form.location_name.trim(),
        address: form.address.trim() || null,
        city: form.city.trim(),
        county: form.county,
        zip: form.zip.trim() || null,
        organizer: form.organizer.trim() || null,
        contact_email: form.contact_email.trim() || null,
        contact_phone: form.contact_phone.trim() || null,
        website: form.website.trim() || null,
        is_free: form.is_free,
        registration_required: form.registration_required,
        registration_url: form.registration_url.trim() || null,
        is_active: false, // requires moderation
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("Event submitted for review — thank you!");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-8 text-center space-y-3">
          <CheckCircle className="h-10 w-10 text-primary mx-auto" />
          <p className="font-semibold text-foreground">Event Submitted for Review</p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Our team reviews submissions within 3–5 business days. Approved events will appear on the Community Events page.
          </p>
          <Button variant="outline" size="sm" onClick={() => { setSubmitted(false); setForm(initial); }}>
            Submit Another Event
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-primary" />
          Submit a Community Event
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Events are reviewed before publishing. No personal data is stored beyond what you provide.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Title + Type */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Event Title *</Label>
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Free Blood Pressure Screening" maxLength={200} required className="text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Event Type *</Label>
              <Select value={form.event_type} onValueChange={(v) => set("event_type", v)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Date + Time */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Date *</Label>
              <Input type="date" value={form.event_date} onChange={(e) => set("event_date", e.target.value)} min={new Date().toISOString().split("T")[0]} required className="text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Start Time</Label>
              <Input type="time" value={form.start_time} onChange={(e) => set("start_time", e.target.value)} className="text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">End Time</Label>
              <Input type="time" value={form.end_time} onChange={(e) => set("end_time", e.target.value)} className="text-sm" />
            </div>
          </div>

          {/* Row 3: Location */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Venue Name *</Label>
              <Input value={form.location_name} onChange={(e) => set("location_name", e.target.value)} placeholder="e.g. Community Center" maxLength={200} required className="text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Street Address</Label>
              <Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="123 Main St" maxLength={300} className="text-sm" />
            </div>
          </div>

          {/* Row 4: City / County / ZIP */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs">City *</Label>
              <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Detroit" maxLength={100} required className="text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">County *</Label>
              <Select value={form.county} onValueChange={(v) => set("county", v)}>
                <SelectTrigger className="h-9 text-sm"><MapPin className="h-3 w-3 mr-1" /><SelectValue placeholder="Select county" /></SelectTrigger>
                <SelectContent>
                  {MICHIGAN_COUNTIES_SHORT.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">ZIP Code</Label>
              <Input value={form.zip} onChange={(e) => set("zip", e.target.value)} placeholder="48201" maxLength={10} className="text-sm" />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What attendees can expect..." rows={3} maxLength={2000} className="text-sm" />
          </div>

          {/* Organizer + Contact */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Organizer</Label>
              <Input value={form.organizer} onChange={(e) => set("organizer", e.target.value)} placeholder="Organization name" maxLength={200} className="text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Contact Email</Label>
              <Input type="email" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} placeholder="events@org.com" maxLength={200} className="text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Contact Phone</Label>
              <Input type="tel" value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} placeholder="(313) 555-0100" maxLength={20} className="text-sm" />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={form.is_free} onCheckedChange={(v) => set("is_free", v)} />
              <Label className="text-xs">Free Event</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.registration_required} onCheckedChange={(v) => set("registration_required", v)} />
              <Label className="text-xs">Registration Required</Label>
            </div>
          </div>

          {form.registration_required && (
            <div className="space-y-1.5">
              <Label className="text-xs">Registration URL</Label>
              <Input type="url" value={form.registration_url} onChange={(e) => set("registration_url", e.target.value)} placeholder="https://..." maxLength={500} className="text-sm" />
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs">Website</Label>
            <Input type="url" value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://..." maxLength={500} className="text-sm" />
          </div>

          <Button type="submit" disabled={sending} className="w-full gap-2">
            <Send className="h-3.5 w-3.5" />
            {sending ? "Submitting..." : "Submit Event for Review"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
