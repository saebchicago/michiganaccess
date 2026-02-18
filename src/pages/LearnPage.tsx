import { useState } from "react";
import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  BookOpen, Search, Baby, GraduationCap, Heart, Users, Brain,
  Stethoscope, Activity, Bone, Eye, Ear, Wind, Droplets,
  ChevronRight, MessageCircle, Shield, Lightbulb, ArrowRight,
  Calculator
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import HealthCalculators from "@/components/learn/HealthCalculators";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

/* ───── Body-map symptom regions ───── */
const bodyRegions = [
  { id: "head", label: "Head & Brain", icon: Brain, symptoms: ["Headache", "Dizziness", "Memory changes", "Confusion"], conditions: ["Migraine", "Concussion", "Stroke warning signs"] },
  { id: "eyes", label: "Eyes & Vision", icon: Eye, symptoms: ["Blurry vision", "Eye pain", "Floaters", "Dry eyes"], conditions: ["Glaucoma", "Cataracts", "Diabetic eye disease"] },
  { id: "ears", label: "Ears & Hearing", icon: Ear, symptoms: ["Ear pain", "Ringing", "Hearing loss", "Vertigo"], conditions: ["Ear infection", "Tinnitus", "Hearing loss"] },
  { id: "chest", label: "Heart & Chest", icon: Heart, symptoms: ["Chest pain", "Shortness of breath", "Palpitations", "Cough"], conditions: ["Heart disease", "Asthma", "COPD", "Pneumonia"] },
  { id: "abdomen", label: "Stomach & Digestion", icon: Activity, symptoms: ["Stomach pain", "Nausea", "Bloating", "Diarrhea"], conditions: ["GERD", "IBS", "Ulcers", "Gallstones"] },
  { id: "lungs", label: "Lungs & Breathing", icon: Wind, symptoms: ["Wheezing", "Chronic cough", "Chest tightness"], conditions: ["Asthma", "COPD", "Bronchitis", "Lung cancer screening"] },
  { id: "bones", label: "Bones & Joints", icon: Bone, symptoms: ["Joint pain", "Swelling", "Stiffness", "Back pain"], conditions: ["Arthritis", "Osteoporosis", "Fibromyalgia"] },
  { id: "skin", label: "Skin", icon: Droplets, symptoms: ["Rash", "Itching", "Moles changing", "Dry skin"], conditions: ["Eczema", "Psoriasis", "Skin cancer signs"] },
];

/* ───── Life-stage education ───── */
const lifeStages = [
  {
    id: "children", label: "Children (0–12)", icon: Baby,
    topics: [
      { title: "Childhood Vaccinations", desc: "CDC-recommended schedule for immunizations from birth through age 12.", source: "CDC" },
      { title: "Growth & Development Milestones", desc: "What to expect at each age — motor skills, speech, social development.", source: "AAP" },
      { title: "Common Childhood Illnesses", desc: "Ear infections, strep throat, RSV, croup — when to call the doctor.", source: "Michigan DHHS" },
      { title: "Nutrition & Healthy Eating", desc: "Building healthy habits early — portion sizes, picky eating, food allergies.", source: "USDA" },
      { title: "Lead Exposure Prevention", desc: "Michigan-specific guidance on testing, risk factors, and safe homes.", source: "Michigan DHHS" },
    ]
  },
  {
    id: "teens", label: "Teens (13–17)", icon: GraduationCap,
    topics: [
      { title: "Mental Health & Stress", desc: "Recognizing anxiety, depression, and building coping skills during adolescence.", source: "NIMH" },
      { title: "Substance Use Prevention", desc: "Vaping, alcohol, cannabis — facts teens need. Michigan-specific resources.", source: "SAMHSA" },
      { title: "Sports Physicals & Injury Prevention", desc: "Pre-participation exams, concussion awareness, and safe training.", source: "AAP" },
      { title: "Sexual Health Education", desc: "Age-appropriate, medically accurate information on puberty and reproductive health.", source: "CDC" },
    ]
  },
  {
    id: "adults", label: "Adults (18–64)", icon: Users,
    topics: [
      { title: "Preventive Screenings by Age", desc: "Blood pressure, cholesterol, cancer screenings — what's recommended and when.", source: "USPSTF" },
      { title: "Managing Chronic Conditions", desc: "Diabetes, hypertension, heart disease — self-management and when to get help.", source: "CDC" },
      { title: "Workplace Health & Ergonomics", desc: "Preventing repetitive strain, managing stress, and staying active at work.", source: "OSHA" },
      { title: "Reproductive & Maternal Health", desc: "Preconception care, prenatal resources, and postpartum support in Michigan.", source: "ACOG" },
      { title: "Understanding Health Insurance", desc: "Navigating plans, deductibles, copays, and Michigan marketplace options.", source: "CMS" },
    ]
  },
  {
    id: "seniors", label: "Seniors (65+)", icon: Heart,
    topics: [
      { title: "Fall Prevention", desc: "Home safety, balance exercises, medication review — Michigan falls are a leading cause of injury.", source: "CDC" },
      { title: "Medicare & Medicaid Basics", desc: "Parts A, B, C, D explained in plain language. Michigan-specific enrollment help.", source: "CMS" },
      { title: "Alzheimer's & Dementia", desc: "Warning signs, caregiver resources, Michigan Area Agency on Aging support.", source: "Alzheimer's Assoc." },
      { title: "Medication Management", desc: "Avoiding dangerous interactions, organizing prescriptions, pharmacist consultations.", source: "FDA" },
      { title: "Advance Care Planning", desc: "Living wills, health care proxies, and having the conversation with family.", source: "Michigan DHHS" },
    ]
  },
];

/* ───── Clinical jargon decoder ───── */
const jargonTerms = [
  { term: "Benign", plain: "Not cancer. The growth or condition is not harmful or spreading.", example: "\"The biopsy showed a benign cyst\" means it's not cancerous." },
  { term: "Prognosis", plain: "The expected outcome of your condition — how it's likely to progress.", example: "\"Your prognosis is good\" means your doctor expects a positive outcome." },
  { term: "Comorbidity", plain: "Having two or more health conditions at the same time.", example: "Diabetes and high blood pressure together are comorbidities." },
  { term: "Contraindicated", plain: "A treatment or medication that should NOT be used because it could be harmful.", example: "\"This drug is contraindicated with your current medication\" means don't take both." },
  { term: "Palliative", plain: "Care focused on comfort and quality of life, not curing the disease.", example: "Palliative care can be given alongside curative treatment." },
  { term: "Acute vs. Chronic", plain: "Acute = sudden and short-term. Chronic = long-lasting (3+ months).", example: "A cold is acute; diabetes is chronic." },
  { term: "CBC (Complete Blood Count)", plain: "A common blood test that measures red cells, white cells, and platelets.", example: "Your doctor orders a CBC to check for infection or anemia." },
  { term: "NPO", plain: "Nothing by mouth — you should not eat or drink, usually before a procedure.", example: "\"NPO after midnight\" means stop eating and drinking at midnight before surgery." },
  { term: "PRN", plain: "As needed — take the medication only when you need it, not on a set schedule.", example: "\"Take ibuprofen PRN for pain\" means only when you're hurting." },
  { term: "Referral", plain: "When your doctor sends you to see a specialist for more focused care.", example: "A referral to a cardiologist means you'll see a heart doctor." },
  { term: "Formulary", plain: "The list of medications your insurance plan covers.", example: "Check if your drug is on the formulary to know your copay." },
  { term: "Prior Authorization", plain: "Insurance company approval required before certain treatments or medications.", example: "Your MRI needs prior authorization — your doctor's office handles this." },
];

/* ───── Doctor visit prep ───── */
const visitPrepTips = [
  { title: "Write Down Your Symptoms", desc: "Note when they started, how often, what makes them better or worse. Bring this list." },
  { title: "List All Medications", desc: "Include prescriptions, over-the-counter drugs, vitamins, and supplements with doses." },
  { title: "Prepare Your Questions", desc: "Write 3–5 questions. Start with the most important one in case time runs short." },
  { title: "Bring a Support Person", desc: "A friend or family member can help you remember information and ask questions." },
  { title: "Know Your Family History", desc: "List conditions that run in your family — heart disease, cancer, diabetes, etc." },
  { title: "Ask About Next Steps", desc: "Before leaving, confirm: What should I do next? When should I follow up? What symptoms to watch for?" },
];

const questionStarters = [
  "What is the most likely cause of my symptoms?",
  "Are there other possible explanations?",
  "What tests do I need, and what will they show?",
  "What are my treatment options?",
  "What are the risks and benefits of this treatment?",
  "Is there a less expensive alternative?",
  "When should I expect to feel better?",
  "What should I do if symptoms get worse?",
];

export default function LearnPage() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [jargonSearch, setJargonSearch] = useState("");

  usePageMeta({
    title: "Health Education Library",
    description: "Plain-language health education, symptom body map, clinical jargon decoder, health calculators, and doctor visit prep tools.",
    path: "/learn",
    jsonLd: {
      "@type": "MedicalWebPage",
      name: "Health Education Library — Access Michigan",
      about: { "@type": "MedicalCondition", name: "General health education" },
    },
  });

  const filteredJargon = jargonTerms.filter(j =>
    !jargonSearch || j.term.toLowerCase().includes(jargonSearch.toLowerCase()) || j.plain.toLowerCase().includes(jargonSearch.toLowerCase())
  );

  const selectedBody = bodyRegions.find(r => r.id === selectedRegion);

  return (
    <Layout>
      <section className="bg-gradient-to-b from-michigan-teal/5 to-background py-12 lg:py-20">
        <div className="container max-w-4xl text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="mb-4 inline-block rounded-full bg-michigan-teal/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-michigan-teal">
              Health Education Library
            </span>
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} initial="hidden" animate="visible" className="mb-3 text-3xl font-bold text-foreground lg:text-5xl">
            Understand Your Health
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} initial="hidden" animate="visible" className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Plain-language health education, a symptom body map, clinical jargon decoder, and tools to prepare for your next doctor visit — all sourced from trusted agencies.
          </motion.p>
        </div>
      </section>

      <div className="container max-w-5xl py-10 space-y-10">
        <Tabs defaultValue="body-map" className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="body-map" className="gap-1.5"><Stethoscope className="h-3.5 w-3.5" />Symptom Body Map</TabsTrigger>
            <TabsTrigger value="calculators" className="gap-1.5"><Calculator className="h-3.5 w-3.5" />Health Calculators</TabsTrigger>
            <TabsTrigger value="life-stage" className="gap-1.5"><Users className="h-3.5 w-3.5" />Learn by Life Stage</TabsTrigger>
            <TabsTrigger value="jargon" className="gap-1.5"><BookOpen className="h-3.5 w-3.5" />Jargon Decoder</TabsTrigger>
            <TabsTrigger value="visit-prep" className="gap-1.5"><MessageCircle className="h-3.5 w-3.5" />Doctor Visit Prep</TabsTrigger>
          </TabsList>

          {/* ───── BODY MAP TAB ───── */}
          <TabsContent value="body-map" className="space-y-6 mt-6">
            <p className="text-sm text-muted-foreground">Select a body region to explore common symptoms and related conditions. <strong>This is not a diagnosis tool</strong> — always consult a healthcare provider.</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {bodyRegions.map((region, i) => {
                const Icon = region.icon;
                const isSelected = selectedRegion === region.id;
                return (
                  <motion.div key={region.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i % 8}>
                    <Card
                      className={`cursor-pointer transition-all duration-200 ${isSelected ? "ring-2 ring-primary shadow-michigan" : "hover-lift"}`}
                      onClick={() => setSelectedRegion(isSelected ? null : region.id)}
                    >
                      <CardContent className="py-4 text-center">
                        <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${isSelected ? "bg-primary text-primary-foreground" : "bg-michigan-teal/10"}`}>
                          <Icon className={`h-5 w-5 ${isSelected ? "" : "text-michigan-teal"}`} />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">{region.label}</h3>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {selectedBody && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card className="border-primary/20">
                  <CardContent className="py-6">
                    <div className="flex items-center gap-2 mb-4">
                      <selectedBody.icon className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-bold text-foreground">{selectedBody.label}</h3>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-2">Common Symptoms</h4>
                        <ul className="space-y-1.5">
                          {selectedBody.symptoms.map(s => (
                            <li key={s} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <ChevronRight className="h-3 w-3 text-michigan-teal flex-shrink-0" />{s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-2">Related Conditions to Explore</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedBody.conditions.map(c => (
                            <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 text-xs text-muted-foreground border-t border-border pt-3">
                      <Shield className="inline h-3 w-3 mr-1 text-primary" />
                      If symptoms are severe, sudden, or worsening, seek emergency care or call 911.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          {/* ───── HEALTH CALCULATORS TAB ───── */}
          <TabsContent value="calculators" className="space-y-6 mt-6">
            <HealthCalculators />
          </TabsContent>

          {/* ───── LIFE STAGE TAB ───── */}
          <TabsContent value="life-stage" className="space-y-6 mt-6">
            <p className="text-sm text-muted-foreground">Health topics organized by age group — written at an 8th-grade reading level with Michigan-specific resources when available.</p>
            <Accordion type="single" collapsible className="space-y-2">
              {lifeStages.map((stage) => {
                const StageIcon = stage.icon;
                return (
                  <AccordionItem key={stage.id} value={stage.id} className="border rounded-lg px-1">
                    <AccordionTrigger className="hover:no-underline py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-michigan-teal/10 flex-shrink-0">
                          <StageIcon className="h-4 w-4 text-michigan-teal" />
                        </div>
                        <div className="text-left">
                          <span className="font-semibold text-foreground text-sm">{stage.label}</span>
                          <span className="block text-xs text-muted-foreground">{stage.topics.length} topics</span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-4">
                      <div className="space-y-3 mt-2">
                        {stage.topics.map((topic, ti) => (
                          <motion.div key={topic.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={ti}>
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
                              <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <div>
                                <h4 className="text-sm font-semibold text-foreground">{topic.title}</h4>
                                <p className="text-sm text-muted-foreground mt-0.5">{topic.desc}</p>
                                <Badge variant="outline" className="mt-1.5 text-[10px]">Source: {topic.source}</Badge>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </TabsContent>

          {/* ───── JARGON DECODER TAB ───── */}
          <TabsContent value="jargon" className="space-y-6 mt-6">
            <div>
              <p className="text-sm text-muted-foreground mb-4">Medical terms can be confusing. Search or browse common clinical words translated into plain language.</p>
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search a medical term..." value={jargonSearch} onChange={e => setJargonSearch(e.target.value)} className="pl-9" />
              </div>
            </div>
            <div className="space-y-3">
              {filteredJargon.map((item, i) => (
                <motion.div key={item.term} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i % 6}>
                  <Card className="hover-lift">
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-sm">{item.term}</h3>
                          <p className="text-sm text-muted-foreground mt-0.5">{item.plain}</p>
                          <p className="text-xs text-muted-foreground/80 mt-1 italic">💡 {item.example}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              {filteredJargon.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">No terms match your search. Try a different word.</p>
              )}
            </div>
          </TabsContent>

          {/* ───── DOCTOR VISIT PREP TAB ───── */}
          <TabsContent value="visit-prep" className="space-y-8 mt-6">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-michigan-gold" />Prepare for Your Visit
              </h2>
              <p className="text-sm text-muted-foreground">Getting ready before your appointment helps you and your doctor make the most of your time together.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {visitPrepTips.map((tip, i) => (
                <motion.div key={tip.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                  <Card className="hover-lift h-full">
                    <CardContent className="py-4">
                      <div className="flex items-start gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-michigan-teal/10 text-xs font-bold text-michigan-teal flex-shrink-0">{i + 1}</span>
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">{tip.title}</h3>
                          <p className="text-sm text-muted-foreground mt-0.5">{tip.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Separator />

            <div>
              <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />Questions to Ask Your Doctor
              </h2>
              <p className="text-sm text-muted-foreground mb-4">Copy or screenshot these to bring to your appointment:</p>
              <Card>
                <CardContent className="py-4">
                  <ol className="space-y-2">
                    {questionStarters.map((q, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="text-primary font-semibold flex-shrink-0">{i + 1}.</span>
                        {q}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <Card className="border-border/50 bg-muted/30">
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <Shield className="inline h-3.5 w-3.5 mr-1 text-primary" />
              <strong>Disclaimer:</strong> This health education content is for informational purposes only and does not replace professional medical advice. Content sourced from CDC, USPSTF, AAP, CMS, and Michigan DHHS. Always consult your healthcare provider for diagnosis and treatment.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
