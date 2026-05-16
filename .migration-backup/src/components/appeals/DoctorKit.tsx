import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Stethoscope, Copy, FileText, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MEDICAL_NECESSITY_TEMPLATE = `LETTER OF MEDICAL NECESSITY

Date: [DATE]
Patient: [PATIENT NAME]
DOB: [DATE OF BIRTH]
Insurance: [CARRIER NAME]
Member ID: [MEMBER ID]
Claim/Auth #: [REFERENCE NUMBER]

Dear Medical Director,

I am writing to establish the medical necessity of [PROCEDURE/SERVICE] for my patient, [PATIENT NAME].

CLINICAL HISTORY:
[Patient has been under my care since DATE for DIAGNOSIS (ICD-10: CODE). Previous treatments have included TREATMENT 1, TREATMENT 2, and TREATMENT 3, which have been insufficient/unsuccessful as evidenced by CLINICAL FINDINGS.]

MEDICAL NECESSITY JUSTIFICATION:
The requested [SERVICE] is medically necessary because:
1. [CLINICAL REASON 1 - cite specific clinical guidelines]
2. [CLINICAL REASON 2 - reference peer-reviewed evidence]
3. [CLINICAL REASON 3 - note functional limitations]

Without this service, the patient faces [SPECIFIC RISK/CONSEQUENCE].

SUPPORTING EVIDENCE:
- [GUIDELINE 1: e.g., AMA CPT guidelines, specialty society recommendations]
- [GUIDELINE 2: e.g., peer-reviewed study citation]
- [GUIDELINE 3: e.g., FDA approval, CMS NCD/LCD reference]

This service meets the plan's definition of medical necessity as it is:
□ Required to diagnose or treat a medical condition
□ The most appropriate level of care
□ Not primarily for convenience
□ Consistent with accepted standards of medical practice

I am available for a peer-to-peer review at your earliest convenience.

Sincerely,
[PHYSICIAN NAME], [CREDENTIALS]
NPI: [NPI NUMBER]
Practice: [PRACTICE NAME]
Phone: [PHONE] | Fax: [FAX]`;

const PEER_TO_PEER_TIPS = [
  "Schedule within 5 business days of denial notification",
  "Have the patient's complete chart available during the call",
  "Lead with clinical evidence, not administrative arguments",
  "Reference specific clinical guidelines (AMA, specialty societies)",
  "Document the call: date, time, reviewer name, and outcome",
  "If denied verbally, request the decision in writing within 24 hours",
  "Ask the reviewer to cite the specific clinical criteria used for denial",
];

const DoctorKit = () => {
  const { toast } = useToast();

  const copyTemplate = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied to clipboard` });
  };

  return (
    <section className="space-y-6" aria-labelledby="doctor-kit-heading">
      <div className="text-center">
        <h2 id="doctor-kit-heading" className="text-2xl font-bold text-foreground">
          Physician Enablement Kit
        </h2>
        <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
          Tools for healthcare providers to support patient appeals with strong clinical documentation
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Medical Necessity Letter */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              Medical Necessity Letter Template
            </CardTitle>
            <CardDescription>
              Pre-structured template with Michigan-specific citations and EHR-compatible language
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <pre className="whitespace-pre-wrap text-xs bg-muted p-4 rounded-lg font-mono leading-relaxed max-h-64 overflow-y-auto">
              {MEDICAL_NECESSITY_TEMPLATE}
            </pre>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyTemplate(MEDICAL_NECESSITY_TEMPLATE, "Medical Necessity Letter")}
              >
                <Copy className="h-3.5 w-3.5" />
                Copy Template
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`data:text/plain;charset=utf-8,${encodeURIComponent(MEDICAL_NECESSITY_TEMPLATE)}`}
                  download="medical-necessity-letter-template.txt"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Download
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Peer-to-Peer Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Peer-to-Peer Review Guide</CardTitle>
            <CardDescription>
              Maximize your success rate when speaking with the carrier's medical director
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {PEER_TO_PEER_TIPS.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Badge variant="outline" className="shrink-0 mt-0.5 h-5 w-5 items-center justify-center p-0 text-xs">
                    {i + 1}
                  </Badge>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Quick reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Michigan Carrier Appeal Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            {[
              { carrier: "Blue Cross Blue Shield of Michigan", phone: "800-832-2583", portal: "https://www.bcbsm.com/providers" },
              { carrier: "Health Alliance Plan (HAP)", phone: "313-872-8100", portal: "https://www.hap.org/providers" },
              { carrier: "Priority Health", phone: "800-942-0954", portal: "https://www.priorityhealth.com/provider" },
              { carrier: "Molina Healthcare of Michigan", phone: "888-898-7969", portal: "https://www.molinahealthcare.com/providers" },
              { carrier: "Medicare (CMS)", phone: "800-633-4227", portal: "https://www.cms.gov/Medicare/Appeals-and-Grievances" },
            ].map((c) => (
              <AccordionItem key={c.carrier} value={c.carrier}>
                <AccordionTrigger className="text-sm">{c.carrier}</AccordionTrigger>
                <AccordionContent className="space-y-2">
                  <p className="text-sm">
                    Provider Appeals Line:{" "}
                    <a href={`tel:${c.phone.replace(/\D/g, "")}`} className="text-primary font-medium hover:underline">
                      {c.phone}
                    </a>
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a href={c.portal} target="_blank" rel="noopener noreferrer">
                      Provider Portal <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </section>
  );
};

export default DoctorKit;
