import { useState } from "react";
import { Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast({ title: "Please enter a valid email", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await (supabase as unknown as any).from("contact_messages").insert({
        name: "Newsletter Signup",
        email: trimmed,
        subject: "Weekly Insight Digest Signup",
        message: "User subscribed to weekly insight digest from homepage.",
      });
      setSubmitted(true);
    } catch {
      toast({ title: "Something went wrong. Try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-6 border-b border-border/30">
      <div className="container max-w-3xl">
        <div className="rounded-xl border border-border bg-card p-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Weekly Insight Digest</h2>
          </div>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Get one data-backed Michigan insight per week. No spam - just facts.
          </p>

          {submitted ? (
            <div className="flex items-center justify-center gap-2 text-sm text-primary font-medium py-2">
              <CheckCircle className="h-4 w-4" />
              You're signed up! Watch your inbox.
            </div>
          ) : (
            <div className="flex items-center gap-2 justify-center max-w-sm mx-auto">
              <Input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="h-9 text-sm"
                disabled={loading}
              />
              <Button size="sm" className="h-9 px-4 text-xs shrink-0" onClick={handleSubmit} disabled={loading}>
                {loading ? "…" : "Subscribe"}
              </Button>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground/60">
            No tracking. Unsubscribe anytime. We never share your email.
          </p>
        </div>
      </div>
    </section>
  );
}
