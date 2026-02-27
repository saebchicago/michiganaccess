import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Copy, Check, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

const CARRIERS = [
  { value: "bcbs", label: "Blue Cross Blue Shield of Michigan" },
  { value: "hap", label: "Health Alliance Plan (HAP)" },
  { value: "priority", label: "Priority Health" },
  { value: "molina", label: "Molina Healthcare (Medicaid)" },
  { value: "medicare-advantage", label: "Medicare Advantage" },
  { value: "employer-erisa", label: "Employer Plan (ERISA)" },
  { value: "other", label: "Other Carrier" },
];

const DENIAL_TYPES = [
  { value: "medical-necessity", label: "Medical Necessity" },
  { value: "prior-auth", label: "Prior Authorization" },
  { value: "out-of-network", label: "Out-of-Network" },
  { value: "timely-filing", label: "Timely Filing" },
  { value: "experimental", label: "Experimental/Investigational" },
  { value: "not-covered", label: "Not a Covered Benefit" },
];

const APPEAL_TYPES = [
  { value: "internal", label: "Internal Appeal (Level 1)" },
  { value: "external", label: "DIFS External Review" },
  { value: "fair-hearing", label: "Medicaid Fair Hearing" },
];

const AIAppealGenerator = () => {
  const { toast } = useToast();
  const [carrier, setCarrier] = useState("");
  const [denialType, setDenialType] = useState("");
  const [appealType, setAppealType] = useState("internal");
  const [serviceDescription, setServiceDescription] = useState("");
  const [denialReason, setDenialReason] = useState("");
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const handleGenerate = async () => {
    if (!serviceDescription.trim()) {
      toast({ title: "Please describe the denied service", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setGeneratedLetter("");
    abortRef.current = new AbortController();

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Service configuration missing. Please contact support.");
      }
      const resp = await fetch(
        `${supabaseUrl}/functions/v1/appeal-generator`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            carrier: CARRIERS.find((c) => c.value === carrier)?.label || carrier,
            denialType: DENIAL_TYPES.find((d) => d.value === denialType)?.label || denialType,
            appealType: appealType || "internal",
            serviceDescription,
            denialReason,
          }),
          signal: abortRef.current.signal,
        }
      );

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || `Error ${resp.status}`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let letter = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              letter += content;
              setGeneratedLetter(letter);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "AbortError") return;
      console.error("Appeal generation error:", e);
      toast({
        title: "Generation failed",
        description: e instanceof Error ? e.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    toast({ title: "Appeal letter copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="space-y-6" aria-labelledby="ai-generator-heading">
      <div className="text-center">
        <h2 id="ai-generator-heading" className="text-2xl font-bold text-foreground">
          AI Appeal Letter Generator
        </h2>
        <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
          Describe your denial and we'll generate a professional appeal letter tailored to your Michigan carrier. No personal health information is stored.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              Denial Details
            </CardTitle>
            <CardDescription>
              Use general terms—do not enter any personal identifiers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Insurance Carrier</label>
                <Select value={carrier} onValueChange={setCarrier}>
                  <SelectTrigger><SelectValue placeholder="Select carrier" /></SelectTrigger>
                  <SelectContent>
                    {CARRIERS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Denial Reason</label>
                <Select value={denialType} onValueChange={setDenialType}>
                  <SelectTrigger><SelectValue placeholder="Why was it denied?" /></SelectTrigger>
                  <SelectContent>
                    {DENIAL_TYPES.map((d) => (
                      <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Appeal Type</label>
              <Select value={appealType} onValueChange={setAppealType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {APPEAL_TYPES.map((a) => (
                    <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Describe the denied service
              </label>
              <Textarea
                placeholder="Example: MRI of the lumbar spine was denied for lack of medical necessity. Patient has chronic lower back pain unresponsive to 6 weeks of physical therapy."
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                rows={3}
                maxLength={1000}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Additional context (optional)
              </label>
              <Textarea
                placeholder="Any other details: prior treatments tried, urgency, etc."
                value={denialReason}
                onChange={(e) => setDenialReason(e.target.value)}
                rows={2}
                maxLength={500}
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !serviceDescription.trim()}
              className="w-full bg-gradient-michigan hover:opacity-90"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Appeal Letter…
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Generate Appeal Letter
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              <Badge variant="outline" className="text-xs">Privacy First</Badge>{" "}
              No personal health information is stored or transmitted. Analysis happens in real-time and is not saved.
            </p>
          </CardContent>
        </Card>

        {/* Output */}
        <Card className="flex flex-col">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">Generated Appeal Letter</CardTitle>
            {generatedLetter && (
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            {generatedLetter ? (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{generatedLetter}</ReactMarkdown>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center text-muted-foreground">
                <FileText className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">Your appeal letter will appear here</p>
                <p className="text-xs mt-1">Fill in the denial details and click Generate</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AIAppealGenerator;
