import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building, FileText, Calendar, ExternalLink, Copy, Check,
  Shield, TrendingUp, TrendingDown, Minus, MapPin
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { useMunicipalities, type Municipality } from "@/hooks/useMunicipalities";
import { toast } from "@/hooks/use-toast";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.3 } }),
};

const FOIA_TEMPLATE = (municipalityName: string) =>
  `Dear FOIA Coordinator,

Pursuant to the Michigan Freedom of Information Act (MCL 15.231 et seq.), I am requesting access to and copies of the following public records:

[DESCRIBE THE RECORDS YOU ARE REQUESTING]

I am requesting these records in electronic format, if available.

If you deny any part of this request, please cite the specific exemption(s) that justify your refusal and notify me of the appeal procedures available under the Act.

Under Section 4(2) of the FOIA, I am requesting a fee waiver as this information is being sought in the public interest and will contribute significantly to public understanding of ${municipalityName}'s operations.

Thank you for your prompt attention to this request. I look forward to receiving your response within the 5 business days required by law.

Sincerely,
[YOUR NAME]
[YOUR ADDRESS]
[YOUR EMAIL]
[DATE]`;

function generateICS(municipality: Municipality): string {
  const schedule = municipality.meeting_schedule || "";
  const now = new Date();
  // Default: next occurrence, repeating monthly
  const nextMeeting = new Date(now);
  nextMeeting.setDate(nextMeeting.getDate() + ((7 - nextMeeting.getDay()) % 7 || 7));
  nextMeeting.setHours(19, 0, 0);

  const pad = (n: number) => String(n).padStart(2, "0");
  const formatDate = (d: Date) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Access Michigan//Municipal Meetings//EN
BEGIN:VEVENT
DTSTART:${formatDate(nextMeeting)}
DURATION:PT2H
RRULE:FREQ=MONTHLY;BYDAY=1MO
SUMMARY:${municipality.name} City Council Meeting
LOCATION:${municipality.meeting_location || "City Hall"}
DESCRIPTION:${schedule}\\nMore info: ${municipality.website || ""}
END:VEVENT
END:VCALENDAR`;
}

function TaxSparkline({ rate, stateAvg }: { rate: number; stateAvg: number }) {
  const pct = Math.min((rate / (stateAvg * 1.5)) * 100, 100);
  const statePct = Math.min((stateAvg / (stateAvg * 1.5)) * 100, 100);
  const isBetter = rate < stateAvg;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-muted-foreground">Property Tax (mills)</span>
        <span className={`font-semibold ${isBetter ? "text-michigan-forest-deep" : "text-michigan-coral-deep"}`}>
          {rate.toFixed(1)}
        </span>
      </div>
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${isBetter ? "bg-michigan-forest/60" : "bg-michigan-coral/60"}`}
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-0 h-full w-0.5 bg-foreground/40"
          style={{ left: `${statePct}%` }}
          title={`State avg: ${stateAvg}`}
        />
      </div>
      <p className="text-[9px] text-muted-foreground flex items-center gap-1">
        {isBetter ? <TrendingDown className="h-2.5 w-2.5" /> : <TrendingUp className="h-2.5 w-2.5" />}
        {isBetter ? "Below" : "Above"} state avg ({stateAvg} mills)
      </p>
    </div>
  );
}

function ResponseSparkline({ avg, stateAvg }: { avg: number; stateAvg: number }) {
  const pct = Math.min((avg / 15) * 100, 100);
  const statePct = Math.min((stateAvg / 15) * 100, 100);
  const isBetter = avg <= stateAvg;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-muted-foreground">Safety Response (min)</span>
        <span className={`font-semibold ${isBetter ? "text-michigan-forest-deep" : "text-michigan-coral-deep"}`}>
          {avg.toFixed(1)}
        </span>
      </div>
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${isBetter ? "bg-michigan-forest/60" : "bg-michigan-coral/60"}`}
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-0 h-full w-0.5 bg-foreground/40"
          style={{ left: `${statePct}%` }}
          title={`State avg: ${stateAvg}`}
        />
      </div>
      <p className="text-[9px] text-muted-foreground flex items-center gap-1">
        {isBetter ? <TrendingDown className="h-2.5 w-2.5" /> : <TrendingUp className="h-2.5 w-2.5" />}
        {isBetter ? "At or below" : "Above"} state avg ({stateAvg} min)
      </p>
    </div>
  );
}

function FOIADialog({ municipality }: { municipality: Municipality }) {
  const [copied, setCopied] = useState(false);
  const template = FOIA_TEMPLATE(municipality.name);

  const handleCopy = () => {
    navigator.clipboard.writeText(template);
    setCopied(true);
    toast({ title: "FOIA template copied", description: "Paste into your email client to send." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
          <FileText className="h-3 w-3" />
          Request Public Records
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-primary" />
            FOIA Request - {municipality.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Michigan's Freedom of Information Act gives you the right to request public records.
            Copy this template and send it to the municipality's FOIA coordinator.
          </p>
          {municipality.foia_contact_email && (
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="secondary" className="text-[10px]">Send to</Badge>
              <a href={`mailto:${municipality.foia_contact_email}`} className="text-primary hover:underline">
                {municipality.foia_contact_email}
              </a>
            </div>
          )}
          <pre className="text-[11px] bg-muted p-3 rounded-lg whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
            {template}
          </pre>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCopy} className="gap-1.5 flex-1">
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied!" : "Copy Template"}
            </Button>
            {municipality.foia_portal_url && (
              <a href={municipality.foia_portal_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button variant="outline" size="sm" className="w-full gap-1.5">
                  <ExternalLink className="h-3 w-3" />
                  Online Portal
                </Button>
              </a>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MunicipalityCard({ municipality, index }: { municipality: Municipality; index: number }) {
  const handleCalendar = () => {
    const ics = generateICS(municipality);
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${municipality.name.replace(/\s/g, "_")}_meetings.ics`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Calendar file downloaded", description: "Import into your calendar app." });
  };

  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={index}>
      <Card className="h-full hover-lift">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5">
              <Building className="h-4 w-4 text-primary" />
              {municipality.name}
            </span>
            <Badge variant="outline" className="text-[10px] capitalize">{municipality.municipality_type}</Badge>
          </CardTitle>
          {municipality.population && (
            <p className="text-[10px] text-muted-foreground">Pop. {municipality.population.toLocaleString()}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Meeting Info */}
          {municipality.meeting_schedule && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-medium text-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3 text-michigan-teal-deep" />
                Public Meetings
              </p>
              <p className="text-[10px] text-muted-foreground">{municipality.meeting_schedule}</p>
              {municipality.meeting_location && (
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-2.5 w-2.5" />{municipality.meeting_location}
                </p>
              )}
              <div className="flex gap-1.5">
                {municipality.council_agenda_url && (
                  <a href={municipality.council_agenda_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-[10px] h-7 gap-1">
                      <FileText className="h-2.5 w-2.5" />Agendas
                    </Button>
                  </a>
                )}
                <Button variant="outline" size="sm" onClick={handleCalendar} className="text-[10px] h-7 gap-1">
                  <Calendar className="h-2.5 w-2.5" />Add to Cal
                </Button>
              </div>
            </div>
          )}

          {/* FOIA */}
          <FOIADialog municipality={municipality} />

          {/* Local Metrics Sparklines */}
          {municipality.property_tax_rate && municipality.state_avg_tax_rate && (
            <TaxSparkline rate={municipality.property_tax_rate} stateAvg={municipality.state_avg_tax_rate} />
          )}
          {municipality.safety_response_avg && municipality.state_avg_safety_response && (
            <ResponseSparkline avg={municipality.safety_response_avg} stateAvg={municipality.state_avg_safety_response} />
          )}

          {/* Website */}
          {municipality.website && (
            <a href={municipality.website} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="w-full text-[10px] h-7 gap-1">
                <ExternalLink className="h-2.5 w-2.5" />{municipality.name} Official Site
              </Button>
            </a>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface MunicipalToolkitProps {
  county: string;
}

export default function MunicipalToolkit({ county }: MunicipalToolkitProps) {
  const { data: municipalities, isLoading } = useMunicipalities(county);

  if (isLoading) {
    return (
      <section>
        <h2 className="mb-4 text-xl font-bold text-foreground flex items-center gap-2">
          <Building className="h-5 w-5 text-primary" />
          Municipalities & Governance
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i}><CardContent className="py-4"><Skeleton className="h-32 w-full" /></CardContent></Card>
          ))}
        </div>
      </section>
    );
  }

  if (!municipalities || municipalities.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Building className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Municipalities & Governance</h2>
        <Badge variant="outline" className="text-[10px]">{municipalities.length} cities/villages</Badge>
      </div>
      <p className="text-xs text-muted-foreground mb-4 max-w-2xl">
        Access public meeting agendas, submit FOIA requests, and compare local metrics for cities and villages in {county} County.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {municipalities.map((m, i) => (
          <MunicipalityCard key={m.id} municipality={m} index={i} />
        ))}
      </div>
    </section>
  );
}
