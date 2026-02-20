import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Copy, Mail, ExternalLink, CheckCircle2, Building2, Landmark, Globe, ChevronRight, Shield, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { useCounty } from "@/contexts/CountyContext";

const FOIA_LEVELS = [
  { id: "municipal", label: "Municipal", icon: Building2, description: "City, township, or village records", law: "Michigan FOIA (MCL 15.231–15.246)" },
  { id: "county", label: "County", icon: Landmark, description: "County government records", law: "Michigan FOIA (MCL 15.231–15.246)" },
  { id: "federal", label: "Federal", icon: Globe, description: "Federal agency records", law: "Federal FOIA (5 U.S.C. § 552)" },
] as const;

type FoiaLevel = typeof FOIA_LEVELS[number]["id"];

const COMMON_REQUESTS = [
  { label: "Public meeting minutes", category: "Governance" },
  { label: "Budget and expenditure reports", category: "Financial" },
  { label: "Police incident reports", category: "Public Safety" },
  { label: "Building permits and inspections", category: "Development" },
  { label: "Water quality test results", category: "Environment" },
  { label: "Employee salary information", category: "Employment" },
  { label: "Contracts and vendor agreements", category: "Procurement" },
  { label: "Road maintenance records", category: "Infrastructure" },
];

function generateMichiganFOIA(fields: { name: string; address: string; email: string; agency: string; records: string; dateRange: string }) {
  return `${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}

${fields.agency}
FOIA Coordinator

Re: Freedom of Information Act Request

Dear FOIA Coordinator,

Pursuant to the Michigan Freedom of Information Act, MCL 15.231 et seq., I am requesting copies of the following public records:

${fields.records}

${fields.dateRange ? `Time period: ${fields.dateRange}\n` : ""}
Please provide these records in electronic format if available. If any portion of this request is denied, please cite the specific exemption under MCL 15.243 and provide a written explanation as required by MCL 15.235(4).

Under MCL 15.234, you are required to respond to this request within five (5) business days of receipt.

If the cost exceeds $20.00, please contact me with an estimate before proceeding. I am willing to pay reasonable fees as outlined in MCL 15.234.

If you deny any or all of this request, please provide a written explanation of the basis for the denial, including the specific exemptions under MCL 15.243 that apply.

Thank you for your prompt attention to this request.

Sincerely,

${fields.name}
${fields.address}
${fields.email}`;
}

function generateFederalFOIA(fields: { name: string; address: string; email: string; agency: string; records: string; dateRange: string }) {
  return `${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}

${fields.agency}
FOIA Office

Re: Freedom of Information Act Request

Dear FOIA Officer,

Under the Freedom of Information Act, 5 U.S.C. § 552, I am requesting access to and copies of the following records:

${fields.records}

${fields.dateRange ? `Time period: ${fields.dateRange}\n` : ""}
I request a waiver of all fees, as the disclosure of the requested information is in the public interest and is not primarily in the commercial interest of the requester. If my fee waiver request is denied, I am willing to pay fees up to $25.00.

If you regard this request as unreasonably broad or you require clarification, please contact me at ${fields.email} so I may clarify my request.

I look forward to receiving your response within 20 business days, as required by statute.

Sincerely,

${fields.name}
${fields.address}
${fields.email}`;
}

export default function FOIARequestBuilder() {
  const { county } = useCounty();
  const [level, setLevel] = useState<FoiaLevel>("municipal");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [agency, setAgency] = useState(county ? `${county} County Clerk` : "");
  const [records, setRecords] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [generated, setGenerated] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    if (!name.trim() || !records.trim()) {
      toast.error("Please fill in your name and the records you're requesting.");
      return;
    }

    const fields = { name, address, email, agency, records, dateRange };
    const letter = level === "federal" ? generateFederalFOIA(fields) : generateMichiganFOIA(fields);
    setGenerated(letter);
    toast.success("FOIA request letter generated!");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generated);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickFill = (label: string) => {
    setRecords((prev) => prev ? `${prev}\n- ${label}` : `- ${label}`);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-michigan-blue/5">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          FOIA Request Builder
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Generate professional public records requests for Michigan municipal, county, or federal agencies.
          Based on the{" "}
          <a href="https://www.michigan.gov/ag/about/foia" target="_blank" rel="noopener noreferrer" className="underline text-primary hover:text-primary/80">
            Michigan Attorney General's FOIA Handbook
          </a>.
        </p>
      </CardHeader>
      <CardContent className="pt-4 space-y-5">
        {/* Level selector */}
        <Tabs value={level} onValueChange={(v) => setLevel(v as FoiaLevel)}>
          <TabsList className="grid grid-cols-3 w-full">
            {FOIA_LEVELS.map((l) => (
              <TabsTrigger key={l.id} value={l.id} className="gap-1.5 text-xs">
                <l.icon className="h-3.5 w-3.5" />
                {l.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {FOIA_LEVELS.map((l) => (
            <TabsContent key={l.id} value={l.id}>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-[10px]">{l.law}</Badge>
                <span className="text-xs text-muted-foreground">{l.description}</span>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Quick fill */}
        <div>
          <Label className="text-xs font-medium text-muted-foreground mb-2 block">Quick-fill common requests:</Label>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_REQUESTS.map((cr) => (
              <Button
                key={cr.label}
                variant="outline"
                size="sm"
                className="text-[11px] h-7 gap-1 hover:bg-primary/10 hover:text-primary transition-colors"
                onClick={() => handleQuickFill(cr.label)}
              >
                <ChevronRight className="h-3 w-3" />
                {cr.label}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="foia-name" className="text-xs">Your Full Name *</Label>
            <Input id="foia-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="foia-email" className="text-xs">Email Address</Label>
            <Input id="foia-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="foia-address" className="text-xs">Mailing Address</Label>
            <Input id="foia-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, City, MI 48XXX" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="foia-agency" className="text-xs">Agency / Department *</Label>
            <Input id="foia-agency" value={agency} onChange={(e) => setAgency(e.target.value)} placeholder={level === "federal" ? "e.g., EPA Region 5" : `e.g., ${county || "Washtenaw"} County Clerk`} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="foia-records" className="text-xs">Records Requested *</Label>
          <Textarea
            id="foia-records"
            value={records}
            onChange={(e) => setRecords(e.target.value)}
            placeholder="Describe the records you are seeking. Be as specific as possible (dates, document types, departments)."
            rows={4}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="foia-dates" className="text-xs">Date Range (optional)</Label>
          <Input id="foia-dates" value={dateRange} onChange={(e) => setDateRange(e.target.value)} placeholder="e.g., January 2024 – December 2024" />
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5 flex-shrink-0" />
          <span>100% browser-only · No data stored or transmitted · Privacy-first</span>
        </div>

        <Button onClick={handleGenerate} className="w-full bg-gradient-michigan hover:opacity-90 gap-1.5">
          <FileText className="h-4 w-4" />
          Generate FOIA Request Letter
        </Button>

        {/* Generated letter */}
        {generated && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <Separator />
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <pre className="whitespace-pre-wrap text-xs text-foreground font-mono leading-relaxed">{generated}</pre>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleCopy} variant="outline" size="sm" className="gap-1.5 text-xs">
                {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Copy to Clipboard"}
              </Button>
              {email && (
                <Button variant="outline" size="sm" className="gap-1.5 text-xs" asChild>
                  <a href={`mailto:${agency}?subject=FOIA Request&body=${encodeURIComponent(generated)}`}>
                    <Mail className="h-3.5 w-3.5" />
                    Open in Email
                  </a>
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {/* Reference accordion */}
        <Accordion type="single" collapsible className="mt-4">
          <AccordionItem value="tips">
            <AccordionTrigger className="text-sm">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-michigan-gold" />
                FOIA Tips & Your Rights
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground space-y-2">
              <p><strong>Michigan FOIA response deadline:</strong> 5 business days (MCL 15.235). Agencies may extend by 10 days with written notice.</p>
              <p><strong>Fee limits:</strong> Labor costs capped at the lowest-paid employee capable of retrieving records. First $20 for indigent requesters is free.</p>
              <p><strong>Exemptions:</strong> 13 categories (MCL 15.243) including law enforcement investigations, trade secrets, and personal privacy.</p>
              <p><strong>Appeals:</strong> You may appeal a denial to the agency head within 180 days, or file in Circuit Court.</p>
              <p><strong>Federal FOIA:</strong> 20 business-day response deadline. Fee waivers available for public interest requests.</p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button variant="outline" size="sm" className="text-[10px] h-6 gap-1" asChild>
                  <a href="https://www.michigan.gov/ag/about/foia" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" /> MI AG FOIA Guide
                  </a>
                </Button>
                <Button variant="outline" size="sm" className="text-[10px] h-6 gap-1" asChild>
                  <a href="https://www.foia.gov/how-to.html" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" /> FOIA.gov Guide
                  </a>
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
