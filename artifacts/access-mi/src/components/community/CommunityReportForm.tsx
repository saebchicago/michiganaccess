import { useState } from "react";
import { AlertTriangle, CheckCircle, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "data_error", label: "Data Error" },
  { value: "missing_resource", label: "Missing Resource" },
  { value: "outage", label: "Service Outage" },
  { value: "pollution", label: "Pollution / Environmental" },
  { value: "safety", label: "Safety Concern" },
  { value: "general", label: "General Report" },
];

interface Props {
  county?: string;
  placeSlug?: string;
  zipcode?: string;
}

export default function CommunityReportForm({ county, placeSlug, zipcode }: Props) {
  const [category, setCategory] = useState("general");
  const [description, setDescription] = useState("");
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || description.trim().length < 10) {
      toast.error("Please provide at least 10 characters of detail.");
      return;
    }
    setSending(true);
    try {
      const { error } = await (supabase as any).from("community_reports").insert({
        category,
        description: description.trim(),
        county: county || null,
        zipcode: zipcode || null,
        place_slug: placeSlug || null,
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("Report submitted - thank you for helping improve our data.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-6 text-center space-y-2">
          <CheckCircle className="h-8 w-8 text-primary mx-auto" />
          <p className="text-sm font-semibold text-foreground">Report Received</p>
          <p className="text-xs text-muted-foreground">Our team will review this within 5 business days.</p>
          <Button variant="outline" size="sm" onClick={() => { setSubmitted(false); setDescription(""); }}>
            Submit Another
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-primary" />
          Report a Community Issue
        </CardTitle>
        <p className="text-xs text-muted-foreground">Anonymous. No personal data collected.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description *</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue..."
              rows={3}
              maxLength={1000}
              className="text-xs"
              required
            />
          </div>
          <Button type="submit" size="sm" disabled={sending} className="w-full">
            <Send className="mr-1.5 h-3.5 w-3.5" />
            {sending ? "Submitting..." : "Submit Report"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
