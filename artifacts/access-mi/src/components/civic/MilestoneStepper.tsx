import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, ChevronRight, ExternalLink, Scale, Car, ScrollText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Step {
  title: string;
  description: string;
  link?: { label: string; url: string };
}

const NATURALIZATION_STEPS: Step[] = [
  { title: "Determine eligibility", description: "Must be 18+, a lawful permanent resident for 5 years (or 3 years if married to a U.S. citizen), and meet continuous residence requirements." },
  { title: "Complete Form N-400", description: "File the Application for Naturalization online at USCIS or by mail.", link: { label: "USCIS N-400", url: "https://www.uscis.gov/n-400" } },
  { title: "Pay filing fee", description: "Current fee is $710 (application + biometrics). Fee waivers available for low-income applicants." },
  { title: "Biometrics appointment", description: "Attend fingerprinting appointment at your local USCIS Application Support Center." },
  { title: "Complete interview", description: "Answer questions about your application and background at a USCIS field office." },
  { title: "Pass English test", description: "Demonstrate ability to read, write, and speak basic English. Exemptions available for certain ages/residency." },
  { title: "Pass civics test", description: "Answer 6 of 10 questions correctly about U.S. government and history from the official 100-question list." },
  { title: "Receive decision", description: "USCIS will grant, continue, or deny your application. If continued, provide additional evidence as requested." },
  { title: "Take Oath of Allegiance", description: "Attend a naturalization ceremony and take the oath. You become a U.S. citizen on this date." },
  { title: "Get resources & support", description: "Contact Michigan Immigrant Rights Center (MIRC) for legal aid or ACCESS for social services.", link: { label: "MIRC Legal Aid", url: "https://michiganimmigrant.org" } },
];

const GDL_STEPS: Step[] = [
  { title: "Enroll in Segment 1 (age 14y 8m)", description: "Complete a state-approved driver education Segment 1 course, which includes classroom and behind-the-wheel instruction." },
  { title: "Obtain Level 1 learner's permit", description: "Pass a vision and knowledge test at a Secretary of State office. Must be at least 14 years, 9 months old.", link: { label: "MI SOS Offices", url: "https://www.michigan.gov/sos/resources/secretary-of-state-office-locations" } },
  { title: "Practice supervised driving", description: "Complete at least 50 hours of supervised driving (10 at night) with a licensed adult 21+ in the front passenger seat." },
  { title: "Hold Level 1 for 180 days", description: "Maintain a clean driving record for at least 180 days with your Level 1 license. No violations or at-fault crashes." },
  { title: "Complete Segment 2", description: "Take a state-approved Segment 2 driver education course after holding your Level 1 license for at least 3 months." },
  { title: "Pass driving skills test", description: "Successfully complete a road skills test at a Secretary of State office or approved testing location." },
  { title: "Obtain Level 2 intermediate license", description: "Issued at age 16+. Restrictions: no driving 10 PM–5 AM (first 90 days) and limited passengers." },
  { title: "Graduate to Level 3 (age 17+)", description: "After holding Level 2 for 12 months with no violations, receive a full unrestricted license at age 17 or older." },
];

const ORDINANCE_CITIES = [
  { name: "Detroit", url: "https://library.municode.com/mi/detroit", population: "639K" },
  { name: "Grand Rapids", url: "https://library.municode.com/mi/grand_rapids", population: "198K" },
  { name: "Lansing", url: "https://library.municode.com/mi/lansing", population: "113K" },
  { name: "Ann Arbor", url: "https://library.municode.com/mi/ann_arbor", population: "124K" },
  { name: "Flint", url: "https://library.municode.com/mi/flint", population: "97K" },
  { name: "Kalamazoo", url: "https://library.municode.com/mi/kalamazoo", population: "73K" },
];

function StepList({ steps }: { steps: Step[] }) {
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const toggle = (idx: number) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const progress = Math.round((completed.size / steps.length) * 100);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <span className="text-xs font-semibold text-muted-foreground">{completed.size}/{steps.length}</span>
      </div>
      <div className="space-y-2">
        {steps.map((step, i) => {
          const done = completed.has(i);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card
                className={`cursor-pointer transition-all ${done ? "border-primary/30 bg-primary/5" : "hover:bg-muted/50"}`}
                onClick={() => toggle(i)}
              >
                <CardContent className="flex items-start gap-3 py-3">
                  {done ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                  ) : (
                    <Circle className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">Step {i + 1}</Badge>
                      <h4 className={`text-sm font-semibold ${done ? "text-primary" : "text-foreground"}`}>{step.title}</h4>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                    {step.link && (
                      <a
                        href={step.link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3 w-3" />{step.link.label}
                      </a>
                    )}
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function MilestoneStepper() {
  return (
    <Tabs defaultValue="naturalization" className="space-y-4">
      <TabsList className="flex-wrap h-auto gap-1">
        <TabsTrigger value="naturalization" className="text-xs">
          <Scale className="mr-1.5 h-3.5 w-3.5" />Naturalization Path
        </TabsTrigger>
        <TabsTrigger value="gdl" className="text-xs">
          <Car className="mr-1.5 h-3.5 w-3.5" />Student Driver (GDL)
        </TabsTrigger>
        <TabsTrigger value="ordinance" className="text-xs">
          <ScrollText className="mr-1.5 h-3.5 w-3.5" />Local Ordinances
        </TabsTrigger>
      </TabsList>

      <TabsContent value="naturalization">
        <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">U.S. Citizenship Path</strong> - Based on USCIS naturalization standards.
            For legal assistance in Michigan, contact the{" "}
            <a href="https://michiganimmigrant.org" target="_blank" rel="noopener noreferrer" className="text-primary underline">Michigan Immigrant Rights Center (MIRC)</a>{" "}
            or <a href="https://www.accesscommunity.org" target="_blank" rel="noopener noreferrer" className="text-primary underline">ACCESS</a> for social services.
          </p>
        </div>
        <StepList steps={NATURALIZATION_STEPS} />
      </TabsContent>

      <TabsContent value="gdl">
        <div className="mb-4 rounded-lg border border-michigan-teal/20 bg-michigan-teal/5 p-3">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Michigan Graduated Driver Licensing</strong> - The GDL program helps new drivers gain experience safely.
            Visit your local{" "}
            <a href="https://www.michigan.gov/sos" target="_blank" rel="noopener noreferrer" className="text-primary underline">Secretary of State</a> office to begin.
          </p>
        </div>
        <StepList steps={GDL_STEPS} />
      </TabsContent>

      <TabsContent value="ordinance">
        <div className="mb-4 rounded-lg border border-michigan-gold/20 bg-michigan-gold/5 p-3">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Know Your Local Laws</strong> - Access municipal codes for Michigan's largest cities.
            Ordinances cover zoning, noise, parking, business licensing, and more.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ORDINANCE_CITIES.map((city) => (
            <a key={city.name} href={city.url} target="_blank" rel="noopener noreferrer">
              <Card className="hover-lift h-full transition-all hover:border-primary/30">
                <CardContent className="py-4 text-center">
                  <ScrollText className="mx-auto mb-2 h-8 w-8 text-primary" />
                  <h4 className="text-sm font-bold text-foreground">{city.name}</h4>
                  <p className="text-[11px] text-muted-foreground">Pop. {city.population}</p>
                  <Badge variant="outline" className="mt-2 text-[10px]">View Municipal Code</Badge>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
