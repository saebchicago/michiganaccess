import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Heart, ExternalLink, Phone, FileText, Scale } from "lucide-react";
import { useCounty } from "@/contexts/CountyContext";

/**
 * The previous version of this list carried per-template
 * `successRate` strings ("95%", "88%", "92%") with no public source.
 * Per the platform's labeling rule ("cite a real source or remove the
 * figure; do not invent a replacement number") the success-rate
 * strings have been removed. The intro paragraph and the standalone
 * 95% stat card below have also been replaced with qualitative copy.
 * If MDHHS Administrative Hearings publishes a citable Medicaid fair
 * hearing outcome rate, add `sourceUrl` and `successRate` back here
 * together in the same change.
 */
const APPEAL_TEMPLATES = [
  {
    id: "service-auth",
    title: "Service Authorization Denial",
    description: "Your Medicaid plan denied a service that your doctor ordered",
    template: `RE: Appeal of Service Authorization Denial

Dear Medicaid Fair Hearing Office,

I am requesting a Fair Hearing to appeal the denial of [SERVICE NAME] by [MANAGED CARE PLAN NAME], denial dated [DATE].

My physician, Dr. [DOCTOR NAME], has determined that [SERVICE NAME] is medically necessary for my condition. The denial letter states the reason as [DENIAL REASON], which I believe is incorrect because [REASON].

Under 42 CFR 438.400 and Michigan Administrative Code R 400.904, I have the right to a Fair Hearing. I request that benefits continue during the appeal process under 42 CFR 438.420.

Please contact me at [PHONE] or [ADDRESS] to schedule the hearing.

Sincerely,
[YOUR NAME]
[MEDICAID ID NUMBER]`,
  },
  {
    id: "timely-filing",
    title: "Timely Filing Dispute",
    description: "Claim denied because the provider filed too late",
    template: `RE: Timely Filing Dispute, Medicaid Claim

Dear [MANAGED CARE PLAN],

I am disputing the denial of claim [CLAIM NUMBER] for [SERVICE] on [DATE OF SERVICE], denied for timely filing.

As the member, I should not be held responsible for provider filing delays. Under Michigan Medicaid policy, providers are prohibited from billing members for covered services. I request that this claim be reprocessed or that I be held harmless per MCL 400.111a.

Medicaid ID: [YOUR MEDICAID ID]
Date of Service: [DATE]

Sincerely,
[YOUR NAME]`,
  },
  {
    id: "medical-necessity",
    title: "Medical Necessity Appeal",
    description: "Plan says the service isn't medically necessary",
    template: `RE: Medical Necessity Appeal, Fair Hearing Request

Dear Michigan DHHS Fair Hearing Office,

I request a Fair Hearing regarding the denial of [SERVICE/MEDICATION] by [PLAN NAME], effective [DATE]. The plan determined the service is not medically necessary.

My treating physician, Dr. [NAME], has documented that this service is essential for [BRIEF MEDICAL REASON]. I am attaching a letter of medical necessity from my physician.

I request continuation of benefits during this appeal under 42 CFR 438.420.

Contact: [PHONE]
Medicaid ID: [ID NUMBER]

Sincerely,
[YOUR NAME]`,
  },
];

const LEGAL_AID_BY_REGION: Record<
  string,
  { name: string; phone: string; url: string }[]
> = {
  Southeast: [
    {
      name: "Michigan Legal Services (Detroit)",
      phone: "313-964-4130",
      url: "https://michiganlegalservices.org",
    },
    {
      name: "Lakeshore Legal Aid",
      phone: "888-783-8190",
      url: "https://lakeshorelegalaid.org",
    },
  ],
  West: [
    {
      name: "Legal Aid of Western Michigan",
      phone: "616-774-0672",
      url: "https://lawestmi.org",
    },
  ],
  "North/UP": [
    {
      name: "Legal Services of Northern Michigan",
      phone: "231-947-0122",
      url: "https://lsnm.org",
    },
  ],
  Statewide: [
    {
      name: "Michigan Legal Help",
      phone: "N/A",
      url: "https://michiganlegalhelp.org",
    },
    {
      name: "State Long-Term Care Ombudsman",
      phone: "866-485-9393",
      url: "https://www.michigan.gov/osa",
    },
  ],
};

const MedicaidSpecialist = () => {
  const { county } = useCounty();

  return (
    <section className="space-y-6" aria-labelledby="medicaid-heading">
      <div className="text-center">
        <h2
          id="medicaid-heading"
          className="text-2xl font-bold text-foreground"
        >
          Medicaid & MIChild Appeal Specialist
        </h2>
        <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
          Medicaid fair hearings are a documented path to overturn a denied
          service when properly filed. Use these templates and connect with free
          legal assistance.
        </p>
      </div>

      {/* Key info cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="text-center p-4">
          <Scale className="h-6 w-6 mx-auto text-primary mb-2" />
          <p className="text-sm font-semibold">Right to a Fair Hearing</p>
          <p className="text-xs text-muted-foreground mt-1">
            Federal regulation 42 CFR 438.400 and Michigan Administrative Code R
            400.904 grant the right to appeal a Medicaid denial.
          </p>
        </Card>
        <Card className="text-center p-4">
          <Phone className="h-6 w-6 mx-auto text-accent mb-2" />
          <p className="text-sm font-semibold">Request a Fair Hearing</p>
          <a
            href="tel:5173737500"
            className="text-primary font-bold text-lg hover:underline"
          >
            517-373-7500
          </a>
          <p className="text-xs text-muted-foreground mt-1">
            MDHHS Administrative Hearings
          </p>
        </Card>
        <Card className="text-center p-4">
          <Heart className="h-6 w-6 mx-auto text-accent mb-2" />
          <p className="text-sm font-semibold">Benefits Continue</p>
          <p className="text-xs text-muted-foreground">
            If you appeal within 10 days, your benefits must continue during the
            appeal process
          </p>
        </Card>
      </div>

      {/* Appeal templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Ready-to-Use Appeal Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {APPEAL_TEMPLATES.map((template) => (
              <AccordionItem key={template.id} value={template.id}>
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{template.title}</span>
                    <Badge
                      variant="secondary"
                      className="bg-accent/10 text-accent text-xs"
                    >
                      Template
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {template.description}
                  </p>
                  <pre className="whitespace-pre-wrap text-xs bg-muted p-4 rounded-lg font-mono leading-relaxed">
                    {template.template}
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => {
                      navigator.clipboard.writeText(template.template);
                    }}
                  >
                    Copy Template
                  </Button>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Legal Aid by region */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Free Legal Assistance
            {county && (
              <Badge variant="outline" className="ml-2 text-xs">
                {county} County
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(LEGAL_AID_BY_REGION).map(([region, orgs]) => (
              <div key={region}>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                  {region} Michigan
                </h4>
                {orgs.map((org) => (
                  <div key={org.name} className="mb-3 text-sm">
                    <a
                      href={org.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline flex items-center gap-1"
                    >
                      {org.name} <ExternalLink className="h-3 w-3" />
                    </a>
                    {org.phone !== "N/A" && (
                      <a
                        href={`tel:${org.phone.replace(/\D/g, "")}`}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {org.phone}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default MedicaidSpecialist;
