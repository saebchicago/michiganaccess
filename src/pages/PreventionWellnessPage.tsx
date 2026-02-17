import { useState } from "react";
import { motion } from "framer-motion";
import {
  Heart, Shield, Syringe, Apple, Brain, Baby, Activity, Users,
  Calendar, CheckCircle2, Clock, MapPin, ExternalLink, Dumbbell, Sun
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import TransportationCallout from "@/components/shared/TransportationCallout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

interface Screening {
  name: string;
  ageRange: string;
  frequency: string;
  description: string;
  priority: "essential" | "recommended" | "discuss";
}

const screeningsByAge: Record<string, Screening[]> = {
  "18-39": [
    { name: "Blood Pressure", ageRange: "18+", frequency: "Every 1-2 years", description: "Hypertension screening — the silent killer. No symptoms until damage is done.", priority: "essential" },
    { name: "Cholesterol (Lipid Panel)", ageRange: "20+", frequency: "Every 4-6 years", description: "Total cholesterol, LDL, HDL, triglycerides. More frequent if risk factors present.", priority: "essential" },
    { name: "Depression Screening", ageRange: "18+", frequency: "Annual", description: "PHQ-9 screening for major depressive disorder. Covered under preventive care.", priority: "recommended" },
    { name: "Cervical Cancer (Pap Smear)", ageRange: "21-65", frequency: "Every 3 years", description: "Pap test or HPV co-testing every 5 years starting at age 30.", priority: "essential" },
    { name: "STI Screening", ageRange: "Sexually active", frequency: "Annual if risk factors", description: "Chlamydia, gonorrhea, HIV, syphilis. All sexually active women under 25.", priority: "recommended" },
    { name: "Skin Cancer Check", ageRange: "18+", frequency: "Annual self-exam; see derm if concerns", description: "Monitor moles using ABCDE rule. Michigan's UV exposure increases risk during summer.", priority: "discuss" },
  ],
  "40-64": [
    { name: "Mammogram", ageRange: "40+ (women)", frequency: "Every 1-2 years", description: "Breast cancer screening. USPSTF recommends biennial at 50; many start at 40.", priority: "essential" },
    { name: "Colonoscopy", ageRange: "45+", frequency: "Every 10 years", description: "Colorectal cancer screening. Alternatives: FIT test annually, Cologuard every 3 years.", priority: "essential" },
    { name: "Diabetes (A1C / Fasting Glucose)", ageRange: "35+ or risk factors", frequency: "Every 3 years", description: "Type 2 diabetes screening. Earlier and more frequent if BMI ≥25 or family history.", priority: "essential" },
    { name: "Blood Pressure", ageRange: "18+", frequency: "Annual", description: "Increased risk with age. Target <130/80 for most adults.", priority: "essential" },
    { name: "Lung Cancer (Low-dose CT)", ageRange: "50-80, 20+ pack-year", frequency: "Annual", description: "For current or former smokers (quit within 15 years) with significant smoking history.", priority: "recommended" },
    { name: "Hepatitis C", ageRange: "All adults 18-79", frequency: "Once", description: "One-time screening. Curative treatments available. Many don't know they're infected.", priority: "recommended" },
  ],
  "65+": [
    { name: "Bone Density (DEXA)", ageRange: "65+ (women); 70+ (men)", frequency: "Every 2 years", description: "Osteoporosis screening. Earlier if fracture risk factors.", priority: "essential" },
    { name: "Abdominal Aortic Aneurysm", ageRange: "65-75, ever smoked (men)", frequency: "Once", description: "One-time ultrasound screening for men who have ever smoked.", priority: "recommended" },
    { name: "Cognitive Assessment", ageRange: "65+", frequency: "Annual wellness visit", description: "Brief cognitive screening as part of Medicare Annual Wellness Visit.", priority: "recommended" },
    { name: "Fall Risk Assessment", ageRange: "65+", frequency: "Annual", description: "Balance, gait, medication review. Falls are the #1 cause of injury death in 65+.", priority: "essential" },
    { name: "Vision & Hearing", ageRange: "65+", frequency: "Every 1-2 years", description: "Glaucoma screening, hearing evaluation. Both affect cognitive decline risk.", priority: "essential" },
    { name: "Colorectal Cancer", ageRange: "Up to 75", frequency: "Continue if not previously screened", description: "Decision to screen after 75 should be individualized based on health and life expectancy.", priority: "discuss" },
  ],
};

const vaccineSchedule = [
  { name: "Influenza (Flu)", who: "Everyone 6mo+", when: "Annually, September–October", note: "High-dose or adjuvanted for 65+" },
  { name: "COVID-19 Updated Booster", who: "Everyone 6mo+", when: "Annual updated dose", note: "Michigan trails national average by 8%" },
  { name: "Tdap / Td", who: "Adults", when: "Tdap once, Td every 10 years", note: "Tdap during each pregnancy (27-36 weeks)" },
  { name: "Shingles (Shingrix)", who: "50+", when: "2-dose series", note: "Even if you had chickenpox or prior Zostavax" },
  { name: "Pneumococcal (PCV20)", who: "65+ or risk factors", when: "1 dose PCV20", note: "Also for adults 19-64 with certain conditions" },
  { name: "HPV (Gardasil 9)", who: "9-26 (catch-up to 45)", when: "2 or 3 dose series", note: "Prevents cervical, throat, and other cancers" },
  { name: "RSV (Abrysvo/Arexvy)", who: "60+ or 32-36 weeks pregnant", when: "Single dose", note: "New vaccine — approved 2023 for older adults" },
];

const wellnessTips = [
  { title: "Move 150 Minutes Per Week", desc: "Moderate aerobic activity reduces heart disease, diabetes, and depression risk by 30-50%. Walking counts!", icon: Dumbbell, color: "text-michigan-teal" },
  { title: "Eat 5+ Servings of Fruits & Vegetables", desc: "Michigan grows 300+ varieties of crops. Farmers markets operate in all 83 counties May–October.", icon: Apple, color: "text-michigan-forest" },
  { title: "Prioritize Sleep (7-9 Hours)", desc: "Poor sleep increases risk of obesity, diabetes, cardiovascular disease, and depression.", icon: Sun, color: "text-michigan-gold" },
  { title: "Manage Stress & Mental Health", desc: "1 in 5 Michigan adults reports frequent mental distress. Free resources: 988 Lifeline, NAMI Michigan.", icon: Brain, color: "text-michigan-sky" },
  { title: "Know Your Numbers", desc: "Blood pressure, cholesterol, A1C, BMI. These 4 numbers predict 80% of cardiovascular risk.", icon: Activity, color: "text-michigan-coral" },
  { title: "Build Social Connections", desc: "Social isolation increases mortality risk by 26%. Join community groups, volunteer, or attend support groups.", icon: Users, color: "text-primary" },
];

const priorityStyles = {
  essential: "border-l-4 border-l-michigan-forest",
  recommended: "border-l-4 border-l-michigan-gold",
  discuss: "border-l-4 border-l-michigan-sky",
};

export default function PreventionWellnessPage() {
  usePageMeta({
    title: "Prevention & Wellness",
    description: "Age-specific screening recommendations, vaccine schedules, and evidence-based wellness guidance for Michigan residents.",
    path: "/wellness",
    jsonLd: {
      "@type": "MedicalWebPage",
      name: "Prevention & Wellness — Michigan Access",
      about: { "@type": "MedicalCondition", name: "Preventive healthcare" },
    },
  });

  const [ageGroup, setAgeGroup] = useState("40-64");

  const screenings = screeningsByAge[ageGroup] || [];

  return (
    <Layout>
      <section className="bg-gradient-to-b from-michigan-forest/5 to-background py-12 lg:py-20">
        <div className="container max-w-4xl text-center">
          <Breadcrumbs items={[{ label: "Prevention & Wellness" }]} />
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="mb-4 inline-block rounded-full bg-michigan-forest/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-michigan-forest">
              Prevention & Wellness
            </span>
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} initial="hidden" animate="visible" className="mb-3 text-3xl font-bold text-foreground lg:text-5xl">
            Stay Ahead of Disease
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} initial="hidden" animate="visible" className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Age-specific screening recommendations, vaccine schedules, and evidence-based wellness guidance — all based on USPSTF, CDC, and ACS guidelines.
          </motion.p>
        </div>
      </section>

      <div className="container max-w-5xl py-10 space-y-10">
        <Tabs defaultValue="screenings">
          <TabsList>
            <TabsTrigger value="screenings">Screening Calendar</TabsTrigger>
            <TabsTrigger value="vaccines">Vaccine Schedule</TabsTrigger>
            <TabsTrigger value="wellness">Healthy Living</TabsTrigger>
          </TabsList>

          <TabsContent value="screenings" className="mt-6 space-y-6">
            <Card>
              <CardContent className="py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Select Your Age Group</label>
                    <Select value={ageGroup} onValueChange={setAgeGroup}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="18-39">Ages 18–39</SelectItem>
                        <SelectItem value="40-64">Ages 40–64</SelectItem>
                        <SelectItem value="65+">Ages 65+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <span className="flex items-center gap-1"><span className="h-3 w-1 rounded-full bg-michigan-forest" /> Essential</span>
                    <span className="flex items-center gap-1"><span className="h-3 w-1 rounded-full bg-michigan-gold" /> Recommended</span>
                    <span className="flex items-center gap-1"><span className="h-3 w-1 rounded-full bg-michigan-sky" /> Discuss w/ Doctor</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {screenings.map((s, i) => (
                <motion.div key={s.name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                  <Card className={`hover-lift ${priorityStyles[s.priority]}`}>
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-foreground text-sm">{s.name}</h3>
                            <Badge variant="outline" className="text-[10px]">{s.ageRange}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-medium text-foreground">{s.frequency}</p>
                          <Badge className={`mt-1 text-[10px] capitalize ${
                            s.priority === "essential" ? "bg-michigan-forest/10 text-michigan-forest border-michigan-forest/20" :
                            s.priority === "recommended" ? "bg-michigan-gold/10 text-michigan-gold border-michigan-gold/20" :
                            "bg-michigan-sky/10 text-michigan-sky border-michigan-sky/20"
                          }`}>{s.priority}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="py-4">
                <p className="text-sm text-foreground font-medium mb-1">💡 Most screenings are covered at 100% under the ACA</p>
                <p className="text-sm text-muted-foreground">
                  Under the Affordable Care Act, preventive screenings rated A or B by the USPSTF must be covered without copay by all marketplace and employer plans. Medicare covers an Annual Wellness Visit with no cost sharing.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vaccines" className="mt-6 space-y-4">
            <div className="space-y-3">
              {vaccineSchedule.map((v, i) => (
                <motion.div key={v.name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                  <Card className="hover-lift">
                    <CardContent className="py-4 flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-michigan-teal/10 flex-shrink-0">
                        <Syringe className="h-5 w-5 text-michigan-teal" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground text-sm">{v.name}</h3>
                          <Badge variant="outline" className="text-[10px]">{v.who}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground"><Calendar className="inline h-3 w-3 mr-1" />{v.when}</p>
                        <p className="text-xs text-muted-foreground mt-1">{v.note}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Card className="border-michigan-teal/20">
              <CardContent className="py-4">
                <h3 className="font-semibold text-foreground text-sm mb-2">Find Vaccination Sites Near You</h3>
                <p className="text-sm text-muted-foreground mb-3">Michigan has 2,400+ vaccination locations including pharmacies, health departments, FQHCs, and clinics.</p>
                <div className="flex gap-2 flex-wrap">
                  <a href="https://www.vaccines.gov/" target="_blank" rel="noopener">
                    <Button size="sm" variant="outline" className="text-xs"><ExternalLink className="mr-1 h-3 w-3" />Vaccines.gov</Button>
                  </a>
                  <a href="https://www.michigan.gov/mdhhs" target="_blank" rel="noopener">
                    <Button size="sm" variant="outline" className="text-xs"><ExternalLink className="mr-1 h-3 w-3" />MDHHS Immunization</Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wellness" className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {wellnessTips.map((tip, i) => (
                <motion.div key={tip.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                  <Card className="hover-lift h-full">
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted flex-shrink-0`}>
                          <tip.icon className={`h-5 w-5 ${tip.color}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-sm">{tip.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{tip.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <TransportationCallout />

        <Card className="border-border/50 bg-muted/30">
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <Shield className="inline h-3.5 w-3.5 mr-1 text-primary" />
              <strong>Clinical Guidelines:</strong> Screening recommendations based on U.S. Preventive Services Task Force (USPSTF) A/B ratings, CDC Advisory Committee on Immunization Practices (ACIP), and American Cancer Society guidelines. Individual needs may vary — discuss with your healthcare provider.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
