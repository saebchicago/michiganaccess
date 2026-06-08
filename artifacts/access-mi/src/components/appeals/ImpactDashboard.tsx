import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { BarChart3, TrendingUp, Users, DollarSign, Send, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// No baseline stats - all metrics come from live anonymous self-reports only

const ImpactDashboard = () => {
  const { toast } = useToast();
  const [showReport, setShowReport] = useState(false);
  const [reportOutcome, setReportOutcome] = useState("");
  const [reportSavings, setReportSavings] = useState("");
  const [reportCarrier, setReportCarrier] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch live anonymous outcomes from DB
  const { data: outcomes = [] } = useQuery({
    queryKey: ["appeal-outcomes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appeal_outcomes")
        .select("outcome, estimated_savings, carrier, created_at")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data || [];
    },
  });

  const liveWins = outcomes.filter((o) => o.outcome === "won").length;
  const liveSaved = outcomes
    .filter((o) => o.outcome === "won" && o.estimated_savings)
    .reduce((sum, o) => sum + Number(o.estimated_savings), 0);

  const totalAppeals = outcomes.length;
  const totalSaved = liveSaved;
  const successRate = totalAppeals > 0 ? Math.round((liveWins / totalAppeals) * 100) : 0;

  const handleSubmitOutcome = async () => {
    if (!reportOutcome) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("appeal_outcomes").insert({
        outcome: reportOutcome,
        estimated_savings: reportSavings ? Number(reportSavings) : null,
        carrier: reportCarrier || null,
      });
      if (error) throw error;
      toast({ title: "Thank you! Your anonymous outcome has been recorded." });
      setShowReport(false);
      setReportOutcome("");
      setReportSavings("");
      setReportCarrier("");
    } catch {
      toast({ title: "Failed to submit. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-6" aria-labelledby="impact-heading">
      <div className="text-center">
        <h2 id="impact-heading" className="text-2xl font-bold text-foreground">
          Community Impact Dashboard
        </h2>
        <p className="mt-2 text-muted-foreground">
          Tracking how Michigan families are fighting back against insurance denials
        </p>
      </div>

      {/* Stats grid - live self-reported data only */}
      {totalAppeals > 0 ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="relative overflow-hidden">
            <CardContent className="pt-6">
              <Users className="h-5 w-5 text-primary mb-2" />
              <p className="text-3xl font-bold text-foreground">{totalAppeals.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Self-reported outcomes</p>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden">
            <CardContent className="pt-6">
              <TrendingUp className="h-5 w-5 text-primary mb-2" />
              <p className="text-3xl font-bold text-foreground">{successRate}%</p>
              <p className="text-sm text-muted-foreground">Reported success rate</p>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden">
            <CardContent className="pt-6">
              <DollarSign className="h-5 w-5 text-accent mb-2" />
              <p className="text-3xl font-bold text-foreground">${totalSaved.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Self-reported savings</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="bg-muted/30">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              No community outcomes reported yet. Be the first to share your anonymous result below.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Report your outcome */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-lg">Report Your Appeal Outcome</CardTitle>
            <Badge variant="outline" className="text-xs">100% Anonymous</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {!showReport ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-3">
                Did you file an insurance appeal? Help other Michigan families by sharing your anonymous outcome.
              </p>
              <Button variant="outline" onClick={() => setShowReport(true)}>
                <Send className="h-4 w-4" />
                Report My Outcome
              </Button>
            </div>
          ) : (
            <div className="space-y-4 max-w-md mx-auto">
              <div>
                <label className="text-sm font-medium mb-1.5 block">What happened?</label>
                <Select value={reportOutcome} onValueChange={setReportOutcome}>
                  <SelectTrigger><SelectValue placeholder="Select outcome" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="won">I won my appeal</SelectItem>
                    <SelectItem value="lost">My appeal was denied</SelectItem>
                    <SelectItem value="partial">Partially approved</SelectItem>
                    <SelectItem value="pending">Still pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Estimated savings (optional)</label>
                <Input
                  type="number"
                  placeholder="$0"
                  value={reportSavings}
                  onChange={(e) => setReportSavings(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Carrier (optional)</label>
                <Input
                  placeholder="e.g., BCBS, HAP, Priority Health"
                  value={reportCarrier}
                  onChange={(e) => setReportCarrier(e.target.value)}
                  maxLength={100}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSubmitOutcome} disabled={submitting || !reportOutcome} className="bg-gradient-michigan">
                  {submitting ? "Submitting…" : "Submit Anonymously"}
                  <CheckCircle className="h-4 w-4" />
                </Button>
                <Button variant="ghost" onClick={() => setShowReport(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enterprise teaser */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-6 text-center">
          <p className="text-sm font-medium text-foreground">
            Health System Partners: Track CHNA community impact metrics
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Contact us to integrate Michigan Access appeal data into your community benefit reporting
          </p>
          <Button variant="outline" size="sm" className="mt-3" asChild>
            <a href="/partnerships">Learn About Partnership</a>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
};

export default ImpactDashboard;
