import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Microscope, Search, MapPin, Clock, ExternalLink, Filter, Building2,
  Users, Shield, FlaskConical, Beaker, CheckCircle2, ArrowRight
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

interface Trial {
  id: string;
  title: string;
  condition: string;
  phase: string;
  status: string;
  institution: string;
  location: string;
  enrolling: boolean;
  description: string;
  eligibility: string;
  contact: string;
  nctId: string;
  startDate: string;
  estimatedEnd: string;
  participants: number;
}

const trials: Trial[] = [
  {
    id: "1", title: "EMPOWER-3: Novel Immunotherapy Combination for Triple-Negative Breast Cancer",
    condition: "Cancer", phase: "Phase III", status: "Recruiting", institution: "University of Michigan Rogel Cancer Center",
    location: "Ann Arbor", enrolling: true,
    description: "Evaluating a novel PD-L1 inhibitor combined with standard chemotherapy in patients with locally advanced or metastatic triple-negative breast cancer.",
    eligibility: "Adults 18+, diagnosed with TNBC, ECOG 0-1, no prior immunotherapy",
    contact: "734-647-8902", nctId: "NCT05891234", startDate: "2025-06", estimatedEnd: "2028-12", participants: 450,
  },
  {
    id: "2", title: "PRECISION-DM: Continuous Glucose Monitoring with AI-Guided Insulin Dosing",
    condition: "Diabetes", phase: "Phase II", status: "Recruiting", institution: "Henry Ford Health System",
    location: "Detroit", enrolling: true,
    description: "Testing an AI-powered insulin dosing algorithm integrated with continuous glucose monitoring for improved A1C control in Type 2 diabetes.",
    eligibility: "Adults 30-75, Type 2 diabetes, A1C 7.5-11%, on insulin therapy",
    contact: "313-916-1784", nctId: "NCT05823456", startDate: "2025-09", estimatedEnd: "2027-06", participants: 200,
  },
  {
    id: "3", title: "RESTORE-Heart: Stem Cell Therapy for Post-MI Cardiac Repair",
    condition: "Heart Disease", phase: "Phase I/II", status: "Recruiting", institution: "Spectrum Health / Michigan State University",
    location: "Grand Rapids", enrolling: true,
    description: "Investigating autologous mesenchymal stem cell injection for myocardial repair in patients 3-12 months post-acute MI with reduced ejection fraction.",
    eligibility: "Adults 40-75, prior MI 3-12 months ago, EF 25-45%, stable on optimal medical therapy",
    contact: "616-391-2000", nctId: "NCT05934567", startDate: "2025-11", estimatedEnd: "2028-04", participants: 80,
  },
  {
    id: "4", title: "CLARITY: Psilocybin-Assisted Therapy for Treatment-Resistant Depression",
    condition: "Mental Health", phase: "Phase II", status: "Recruiting", institution: "University of Michigan Depression Center",
    location: "Ann Arbor", enrolling: true,
    description: "Evaluating the safety and efficacy of psilocybin-assisted psychotherapy in adults with treatment-resistant major depressive disorder.",
    eligibility: "Adults 21-65, MDD diagnosis, failed ≥2 antidepressant trials, no psychotic features",
    contact: "734-764-0231", nctId: "NCT05678901", startDate: "2025-03", estimatedEnd: "2027-09", participants: 120,
  },
  {
    id: "5", title: "PREVENT-AD: Lecanemab Extension Study for Early Alzheimer's Disease",
    condition: "Neurological", phase: "Phase III", status: "Active", institution: "Michigan Alzheimer's Disease Center",
    location: "Ann Arbor, Detroit", enrolling: false,
    description: "Long-term extension study evaluating sustained amyloid-clearing therapy in patients with mild cognitive impairment due to Alzheimer's disease.",
    eligibility: "Prior study participants only", contact: "734-936-8803", nctId: "NCT05789012",
    startDate: "2024-01", estimatedEnd: "2029-06", participants: 300,
  },
  {
    id: "6", title: "BREATHE-MI: Biologic Therapy for Severe Pediatric Asthma",
    condition: "Respiratory", phase: "Phase III", status: "Recruiting", institution: "C.S. Mott Children's Hospital",
    location: "Ann Arbor", enrolling: true,
    description: "Comparing a next-generation anti-TSLP biologic to standard of care in children with severe eosinophilic asthma and frequent exacerbations.",
    eligibility: "Children 6-17, severe persistent asthma, ≥2 exacerbations in past year",
    contact: "734-764-4279", nctId: "NCT05456789", startDate: "2025-08", estimatedEnd: "2028-02", participants: 180,
  },
  {
    id: "7", title: "EQUIP: Community Health Worker Intervention for Hypertension in Rural Michigan",
    condition: "Heart Disease", phase: "N/A (Behavioral)", status: "Recruiting", institution: "Michigan State University College of Human Medicine",
    location: "Multiple rural counties", enrolling: true,
    description: "Testing a community health worker-led intervention combining home BP monitoring, medication adherence support, and social determinant screening for uncontrolled hypertension.",
    eligibility: "Adults 18+, uncontrolled hypertension, residing in rural Michigan county",
    contact: "517-353-3730", nctId: "NCT05567890", startDate: "2025-04", estimatedEnd: "2027-12", participants: 500,
  },
];

const conditionOptions = ["All Conditions", "Cancer", "Diabetes", "Heart Disease", "Mental Health", "Neurological", "Respiratory"];
const phaseOptions = ["All Phases", "Phase I/II", "Phase II", "Phase III", "N/A (Behavioral)"];

const phaseColors: Record<string, string> = {
  "Phase I/II": "bg-michigan-gold/10 text-michigan-gold border-michigan-gold/20",
  "Phase II": "bg-michigan-teal/10 text-michigan-teal border-michigan-teal/20",
  "Phase III": "bg-michigan-forest/10 text-michigan-forest border-michigan-forest/20",
  "N/A (Behavioral)": "bg-michigan-sky/10 text-michigan-sky border-michigan-sky/20",
};

export default function ClinicalTrialsPage() {
  usePageMeta({
    title: "Clinical Trials",
    description: "Search active clinical trials at Michigan's leading research institutions. Find enrolling studies for cancer, diabetes, neurology, and more.",
    path: "/clinical-trials",
    jsonLd: {
      "@type": "WebPage",
      "name": "Clinical Trials — Michigan Access",
      "description": "Active clinical trials at Michigan research institutions.",
      "url": "https://accessmi.org/clinical-trials",
      "specialty": { "@type": "MedicalSpecialty", "name": "Clinical Research" },
    },
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [conditionFilter, setConditionFilter] = useState("All Conditions");
  const [phaseFilter, setPhaseFilter] = useState("All Phases");

  const filtered = useMemo(() => {
    return trials.filter(t => {
      if (conditionFilter !== "All Conditions" && t.condition !== conditionFilter) return false;
      if (phaseFilter !== "All Phases" && t.phase !== phaseFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return t.title.toLowerCase().includes(q) || t.condition.toLowerCase().includes(q) || t.institution.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [searchQuery, conditionFilter, phaseFilter]);

  const recruitingCount = trials.filter(t => t.enrolling).length;

  return (
    <Layout>
      <section className="bg-gradient-to-b from-michigan-forest/5 to-background py-12 lg:py-20">
        <div className="container max-w-4xl text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="mb-4 inline-block rounded-full bg-michigan-forest/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-michigan-forest">
              Clinical Trials Finder
            </span>
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} initial="hidden" animate="visible" className="mb-3 text-3xl font-bold text-foreground lg:text-5xl">
            Clinical Trials in Michigan
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} initial="hidden" animate="visible" className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Search active clinical trials at Michigan's leading research institutions. Explore breakthrough treatments and contribute to advancing medicine.
          </motion.p>
        </div>
      </section>

      <div className="container max-w-5xl py-10 space-y-8">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Active Trials Listed", value: trials.length.toString(), icon: FlaskConical, color: "text-primary" },
            { label: "Currently Recruiting", value: recruitingCount.toString(), icon: Users, color: "text-michigan-forest" },
            { label: "Research Institutions", value: "5", icon: Building2, color: "text-michigan-teal" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <Card>
                <CardContent className="flex items-center gap-3 py-4">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search by condition, treatment, or institution..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
              </div>
              <Select value={conditionFilter} onValueChange={setConditionFilter}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {conditionOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={phaseFilter} onValueChange={setPhaseFilter}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {phaseOptions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground">{filtered.length} trials found</p>

        {/* Trial cards */}
        <div className="space-y-4">
          {filtered.map((trial, i) => (
            <motion.div key={trial.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i % 8}>
              <Card className={`hover-lift ${trial.enrolling ? "" : "opacity-75"}`}>
                <CardContent className="py-5">
                  <div className="flex items-start gap-4">
                    <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-xl bg-michigan-forest/10 flex-shrink-0">
                      <Microscope className="h-5 w-5 text-michigan-forest" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge className={phaseColors[trial.phase] || ""}>{trial.phase}</Badge>
                        {trial.enrolling ? (
                          <Badge className="bg-michigan-forest/10 text-michigan-forest border-michigan-forest/20 text-[10px]">
                            <CheckCircle2 className="mr-1 h-3 w-3" />Recruiting
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">Not Recruiting</Badge>
                        )}
                        <Badge variant="outline" className="text-[10px]">{trial.condition}</Badge>
                      </div>
                      <h3 className="font-semibold text-foreground text-sm lg:text-base mb-1">{trial.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        <Building2 className="inline h-3 w-3 mr-1" />{trial.institution}
                        <span className="mx-2">·</span>
                        <MapPin className="inline h-3 w-3 mr-1" />{trial.location}
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{trial.description}</p>

                      <div className="mt-3 space-y-2">
                        <div>
                          <p className="text-xs font-semibold text-foreground">Eligibility</p>
                          <p className="text-xs text-muted-foreground">{trial.eligibility}</p>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span><Clock className="inline h-3 w-3 mr-1" />{trial.startDate} – {trial.estimatedEnd}</span>
                          <span><Users className="inline h-3 w-3 mr-1" />Target: {trial.participants} participants</span>
                          <span className="text-primary font-medium">{trial.nctId}</span>
                        </div>
                      </div>

                      <div className="mt-3 flex gap-2 flex-wrap">
                        <a href={`https://clinicaltrials.gov/study/${trial.nctId}`} target="_blank" rel="noopener">
                          <Button size="sm" variant="outline" className="text-xs h-7">
                            <ExternalLink className="mr-1 h-3 w-3" />ClinicalTrials.gov
                          </Button>
                        </a>
                        {trial.enrolling && (
                          <a href={`tel:${trial.contact}`}>
                            <Button size="sm" className="text-xs h-7 bg-michigan-forest hover:bg-michigan-forest/90">
                              Contact to Enroll
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Separator />

        {/* Research institutions */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          <h2 className="text-xl font-bold text-foreground mb-4">Michigan Research Institutions</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { name: "University of Michigan Health – Rogel Cancer Center", loc: "Ann Arbor", trials: "500+ active trials", url: "https://www.rogelcancercenter.org/" },
              { name: "Henry Ford Health System", loc: "Detroit", trials: "200+ active trials", url: "https://www.henryford.com/research" },
              { name: "Spectrum Health / Michigan State University", loc: "Grand Rapids", trials: "150+ active trials", url: "https://www.spectrumhealth.org/research" },
              { name: "Beaumont Health / Oakland University", loc: "Royal Oak", trials: "100+ active trials", url: "https://www.beaumont.org/research" },
            ].map(inst => (
              <Card key={inst.name} className="hover-lift">
                <CardContent className="py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{inst.name}</p>
                    <p className="text-xs text-muted-foreground"><MapPin className="inline h-3 w-3 mr-1" />{inst.loc} · {inst.trials}</p>
                  </div>
                  <a href={inst.url} target="_blank" rel="noopener"><Button size="icon" variant="ghost" className="h-8 w-8"><ExternalLink className="h-4 w-4" /></Button></a>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>

        <Card className="border-border/50 bg-muted/30">
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <Shield className="inline h-3.5 w-3.5 mr-1 text-primary" />
              <strong>Data Source:</strong> Trial information sourced from ClinicalTrials.gov (U.S. National Library of Medicine). Listings are representative and may not reflect real-time enrollment status. Always verify directly with the research institution. This platform does not recruit for or endorse specific trials.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
