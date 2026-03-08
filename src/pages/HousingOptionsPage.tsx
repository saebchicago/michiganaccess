/**
 * HousingOptionsPage — step-by-step housing help flow.
 * Uses existing community_resources + static findhelp links.
 * No PHI. External links labeled clearly.
 */
import { useState } from "react";
import PageFeedback from "@/components/shared/PageFeedback";
import { motion, AnimatePresence } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useTranslation } from "react-i18next";
import { useCounty, MICHIGAN_COUNTIES, type MichiganCounty } from "@/contexts/CountyContext";
import { usePersonalProfile } from "@/hooks/usePersonalProfile";
import { useCommunityResources } from "@/hooks/useCommunityResources";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import AskCopilotButton from "@/components/shared/AskCopilotButton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Home, AlertTriangle, Shield, DollarSign, Search, Phone,
  ExternalLink, ArrowLeft, ArrowRight, MapPin, Building2, Info,
  ChevronRight, Heart, Scale, FileText
} from "lucide-react";
import { zipToCounty } from "@/data/michigan-county-seats";

/* ── Types ─── */
type Situation = "emergency" | "at_risk" | "affordable";
type IncomeBand = "low" | "moderate" | "higher" | "unknown";

const situationButtons: { value: Situation; label: string; desc: string; icon: typeof AlertTriangle }[] = [
  { value: "emergency", label: "I need emergency shelter or I'm unsafe tonight", desc: "Immediate crisis housing, shelters, and safety resources", icon: AlertTriangle },
  { value: "at_risk", label: "I'm at risk of losing housing soon", desc: "Eviction prevention, emergency rental assistance, legal help", icon: Shield },
  { value: "affordable", label: "I'm looking for affordable rentals or subsidized housing", desc: "Waitlists, vouchers, housing authorities, and listings", icon: Building2 },
];

const incomeBands: { value: IncomeBand; label: string }[] = [
  { value: "low", label: "Low income (under ~$30k/year for a household)" },
  { value: "moderate", label: "Moderate income ($30k–$60k/year)" },
  { value: "higher", label: "Higher income (above $60k/year)" },
  { value: "unknown", label: "I'd rather not say" },
];

const fadeSlide = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -30, transition: { duration: 0.2 } },
};

/* ── External link helper ─── */
function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-primary underline decoration-primary/30 hover:decoration-primary transition-colors"
    >
      {children}
      <ExternalLink className="h-3 w-3 shrink-0" />
      <span className="sr-only">(opens external site — you are leaving Access Michigan)</span>
    </a>
  );
}

export default function HousingOptionsPage() {
  const { t } = useTranslation();
  usePageMeta({
    title: "Find Housing Options — Access Michigan",
    description: "Step-by-step help finding emergency shelter, affordable rentals, and subsidized housing in Michigan.",
    path: "/housing-options",
  });

  const { county, setCounty, setZip, granularLocation } = useCounty();
  const { profile } = usePersonalProfile();

  const [step, setStep] = useState(1);
  const [zipInput, setZipInput] = useState(profile.primaryZip ?? granularLocation.zip ?? "");
  const [selectedCounty, setSelectedCounty] = useState<MichiganCounty | null>(county);
  const [situation, setSituation] = useState<Situation | null>(
    profile.housingStatus === "homeless" ? "emergency" : profile.housingStatus === "at_risk" ? "at_risk" : null
  );
  const [income, setIncome] = useState<IncomeBand>(profile.incomeBand ?? "unknown");

  // Resolve county from ZIP if typed
  const resolveZip = () => {
    if (zipInput.length === 5) {
      const resolved = zipToCounty(zipInput) as MichiganCounty | null;
      if (resolved) {
        setSelectedCounty(resolved);
        setZip(zipInput);
      }
    }
  };

  // Fetch housing-related community resources for the county
  const { data: housingResources } = useCommunityResources("housing", selectedCounty);
  const { data: shelterResources } = useCommunityResources("shelter", selectedCounty);

  const effectiveCounty = selectedCounty ?? county;
  const countyLabel = effectiveCounty ? `${effectiveCounty} County` : "your area";

  const goToResults = () => setStep(4);

  return (
    <Layout>
      <div className="container max-w-3xl py-6 space-y-6">
        <Breadcrumbs items={[
          { label: "Home", href: "/" },
          { label: "Find Help", href: "/find-care" },
          { label: "Housing Options" },
        ]} />

        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Find Housing Options</h1>
          <p className="text-sm text-muted-foreground">Answer a few questions and we'll connect you with the right resources. No data is stored or sent anywhere.</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1 — Location */}
          {step === 1 && (
            <motion.div key="s1" {...fadeSlide} className="space-y-4">
              <Card>
                <CardContent className="pt-5 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium"><MapPin className="h-4 w-4 text-primary" /> Step 1: Where are you located?</div>

                  <div className="space-y-1.5">
                    <Label htmlFor="hz" className="text-xs">ZIP code</Label>
                    <div className="flex gap-2">
                      <Input id="hz" placeholder="e.g. 48226" maxLength={5} value={zipInput} onChange={(e) => setZipInput(e.target.value.replace(/\D/g, "").slice(0, 5))} />
                      <Button size="sm" variant="secondary" onClick={resolveZip} disabled={zipInput.length < 5}>Look up</Button>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">or select a county:</div>
                  <Select value={selectedCounty ?? ""} onValueChange={(v) => setSelectedCounty(v as MichiganCounty)}>
                    <SelectTrigger><SelectValue placeholder="Choose county" /></SelectTrigger>
                    <SelectContent>
                      {MICHIGAN_COUNTIES.map((c) => <SelectItem key={c} value={c}>{c} County</SelectItem>)}
                    </SelectContent>
                  </Select>

                  <Button className="w-full gap-1.5" disabled={!selectedCounty && zipInput.length < 5} onClick={() => { resolveZip(); setStep(2); }}>
                    Next <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2 — Situation */}
          {step === 2 && (
            <motion.div key="s2" {...fadeSlide} className="space-y-4">
              <Card>
                <CardContent className="pt-5 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium"><Home className="h-4 w-4 text-primary" /> Step 2: What best describes your situation?</div>

                  <div className="space-y-2">
                    {situationButtons.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => { setSituation(s.value); setStep(3); }}
                        className={`w-full text-left rounded-lg border p-3 transition-all hover:border-primary/50 hover:bg-accent/30 ${situation === s.value ? "border-primary bg-primary/5" : "border-border"}`}
                      >
                        <div className="flex items-start gap-2.5">
                          <s.icon className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                          <div>
                            <div className="text-sm font-medium text-foreground">{s.label}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{s.desc}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="gap-1"><ArrowLeft className="h-3.5 w-3.5" /> Back</Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3 — Income */}
          {step === 3 && (
            <motion.div key="s3" {...fadeSlide} className="space-y-4">
              <Card>
                <CardContent className="pt-5 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium"><DollarSign className="h-4 w-4 text-primary" /> Step 3: Roughly where is your income?</div>
                  <p className="text-xs text-muted-foreground">This helps us suggest the right programs. We don't store this.</p>

                  <div className="space-y-2">
                    {incomeBands.map((b) => (
                      <button
                        key={b.value}
                        onClick={() => { setIncome(b.value); goToResults(); }}
                        className={`w-full text-left rounded-lg border p-3 transition-all hover:border-primary/50 hover:bg-accent/30 text-sm ${income === b.value ? "border-primary bg-primary/5" : "border-border"}`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>

                  <Button variant="ghost" size="sm" onClick={() => setStep(2)} className="gap-1"><ArrowLeft className="h-3.5 w-3.5" /> Back</Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4 — Results */}
          {step === 4 && (
            <motion.div key="s4" {...fadeSlide} className="space-y-5">
              {/* Crisis alert for emergency */}
              {situation === "emergency" && (
                <Card className="border-destructive/50 bg-destructive/5">
                  <CardContent className="pt-4 space-y-2">
                    <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
                      <Phone className="h-4 w-4" /> If you are in immediate danger, call 911
                    </div>
                    <div className="text-xs space-y-1 text-foreground/80">
                      <p><strong>Michigan 211:</strong> <a href="tel:211" className="text-primary underline">Call 211</a> — shelter, food, and crisis services 24/7</p>
                      <p><strong>National DV Hotline:</strong> <a href="tel:1-800-799-7233" className="text-primary underline">1-800-799-7233</a> — safety planning, shelter referrals</p>
                      <p><strong>988 Suicide & Crisis Lifeline:</strong> <a href="tel:988" className="text-primary underline">Call or text 988</a></p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Section 1 — Emergency / short-term */}
              <Card>
                <CardContent className="pt-5 space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-sm"><AlertTriangle className="h-4 w-4 text-amber-600" /> Emergency & Short-Term Help</div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2"><ChevronRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" /><span><ExtLink href="https://mi211.org">Michigan 211 — Housing & Shelter</ExtLink> — search for emergency shelters and crisis housing in {countyLabel}.</span></li>
                    <li className="flex items-start gap-2"><ChevronRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" /><span><ExtLink href="https://www.michigan.gov/mdhhs/assistance-programs/emergency-relief">MDHHS Emergency Relief</ExtLink> — state emergency assistance for rent, utilities, and home repairs.</span></li>
                    {(shelterResources ?? []).slice(0, 3).map((r) => (
                      <li key={r.id} className="flex items-start gap-2">
                        <ChevronRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                        <span>
                          {r.website ? <ExtLink href={r.website}>{r.resource_name}</ExtLink> : <strong>{r.resource_name}</strong>}
                          {r.phone && <> — <a href={`tel:${r.phone}`} className="text-primary underline">{r.phone}</a></>}
                          {r.description && <span className="text-muted-foreground"> — {r.description}</span>}
                        </span>
                      </li>
                    ))}
                    <li className="flex items-start gap-2"><ChevronRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" /><span><ExtLink href="https://www.salvationarmyusa.org/usn/provide-shelter/">Salvation Army Shelters</ExtLink> — emergency lodging and meals.</span></li>
                  </ul>
                </CardContent>
              </Card>

              {/* Section 2 — Subsidized & affordable */}
              <Card>
                <CardContent className="pt-5 space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-sm"><Building2 className="h-4 w-4 text-primary" /> Subsidized & Affordable Housing</div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2"><ChevronRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" /><span><ExtLink href="https://resources.hud.gov/">HUD Resource Locator</ExtLink> — search for subsidized apartments, public housing, and voucher programs.</span></li>
                    <li className="flex items-start gap-2"><ChevronRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" /><span><ExtLink href="https://www.michigan.gov/mshda">Michigan State Housing Development Authority (MSHDA)</ExtLink> — rental assistance, homeownership programs, and affordable housing locator.</span></li>
                    <li className="flex items-start gap-2"><ChevronRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" /><span><ExtLink href="https://affordablehousingonline.com/housing-search/Michigan">Affordable Housing Online — Michigan</ExtLink> — search waitlists and income-restricted listings.</span></li>
                    {(housingResources ?? []).slice(0, 3).map((r) => (
                      <li key={r.id} className="flex items-start gap-2">
                        <ChevronRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                        <span>
                          {r.website ? <ExtLink href={r.website}>{r.resource_name}</ExtLink> : <strong>{r.resource_name}</strong>}
                          {r.description && <span className="text-muted-foreground"> — {r.description}</span>}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground space-y-1 mt-2">
                    <p><strong>Waitlists:</strong> Many subsidized programs have waitlists. Apply to multiple programs at once to improve your chances.</p>
                    <p><strong>Documentation:</strong> You'll typically need proof of identity, income, and household size. Call ahead to confirm.</p>
                  </div>
                </CardContent>
              </Card>

              {/* Section 3 — Market rentals */}
              <Card>
                <CardContent className="pt-5 space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-sm"><Search className="h-4 w-4 text-primary" /> Market Rentals & Safer Searching</div>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>When searching for market-rate rentals, keep these tips in mind:</p>
                    <ul className="space-y-1 list-disc pl-4">
                      <li>Use multiple listing sites to compare prices and availability.</li>
                      <li>Avoid cash-only arrangements and unofficial leases — always get things in writing.</li>
                      <li>Michigan fair housing law protects against discrimination based on race, religion, sex, disability, familial status, and more. If you suspect discrimination, contact the <ExtLink href="https://www.michigan.gov/mdcr">Michigan Department of Civil Rights</ExtLink>.</li>
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      <ExtLink href="https://www.apartments.com">Apartments.com</ExtLink>
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <ExtLink href="https://www.zillow.com/homes/for_rent/">Zillow Rentals</ExtLink>
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <ExtLink href="https://www.realtor.com/apartments/">Realtor.com Rentals</ExtLink>
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">These are common search sites, not endorsements by Access Michigan.</p>
                </CardContent>
              </Card>

              {/* Legal help */}
              {(situation === "at_risk" || situation === "emergency") && (
                <Card>
                  <CardContent className="pt-5 space-y-3">
                    <div className="flex items-center gap-2 font-semibold text-sm"><Scale className="h-4 w-4 text-primary" /> Legal Help</div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2"><ChevronRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" /><span><ExtLink href="https://michiganlegalhelp.org/self-help-tools/housing">Michigan Legal Help — Housing</ExtLink> — free legal information about eviction, landlord disputes, and housing rights.</span></li>
                      <li className="flex items-start gap-2"><ChevronRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" /><span><ExtLink href="https://www.hud.gov/findacounselor">HUD Housing Counseling</ExtLink> — free, HUD-approved housing counselors for foreclosure prevention and rental help.</span></li>
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Copilot */}
              <AskCopilotButton
                context={`housing | ZIP: ${zipInput || "unknown"} | county: ${effectiveCounty || "unknown"} | situation: ${situation} | income: ${income} | Ask Copilot about housing resources, programs, and next steps for this area. Structure response with: 1) immediate actions, 2) programs they may qualify for, 3) official links. Always note that Access Michigan does not determine eligibility.`}
                label="Ask Copilot about housing in my area"
              />

              <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="gap-1"><ArrowLeft className="h-3.5 w-3.5" /> Start over</Button>

              {/* Print */}
              <div className="flex items-center justify-end print:hidden">
                <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5">
                  <FileText className="h-4 w-4" /> Print / Save as PDF
                </Button>
              </div>
              <PageFeedback />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Disclaimer */}
        <div className="rounded-md bg-muted/30 border border-border p-3 flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Access Michigan connects you with public resources and does not determine eligibility for any program.
            We do not store any information you enter on this page. External links are clearly marked — when you
            click them, you leave Access Michigan.
          </p>
        </div>
      </div>
    </Layout>
  );
}
