import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { ExternalLink, Scale, Shield, Landmark, Vote, Users, Share2 } from "lucide-react";
import { useCounty } from "@/contexts/CountyContext";
import { toast } from "sonner";

interface Program {
  title: string;
  description: string;
  eligibility: string[];
  url: string;
  icon: React.ReactNode;
  counties?: string[];
}

const PROGRAMS: Program[] = [
  {
    title: "Michigan Legal Help",
    description: "Free legal information and self-help tools for family law, housing, consumer rights, and public benefits cases.",
    eligibility: ["all residents"],
    url: "https://michiganlegalhelp.org",
    icon: <Scale className="h-5 w-5" />,
  },
  {
    title: "Legal Aid of Western Michigan",
    description: "Free civil legal services for low-income individuals covering housing, family, consumer, and government benefits.",
    eligibility: ["low-income"],
    url: "https://lawestmi.org",
    icon: <Scale className="h-5 w-5" />,
    counties: ["Kent", "Ottawa", "Muskegon", "Allegan", "Barry", "Ionia", "Montcalm", "Kalamazoo", "Calhoun"],
  },
  {
    title: "Lakeshore Legal Aid",
    description: "Free legal assistance in Southeast Michigan for housing disputes, domestic violence, immigration, and public benefits.",
    eligibility: ["low-income", "seniors"],
    url: "https://lakeshorelegalaid.org",
    icon: <Shield className="h-5 w-5" />,
    counties: ["Wayne", "Oakland", "Macomb", "St. Clair", "Monroe", "Genesee"],
  },
  {
    title: "ACLU of Michigan",
    description: "Civil rights advocacy and legal support for issues including criminal justice reform, voting rights, and immigrant rights.",
    eligibility: ["all residents"],
    url: "https://www.aclumich.org",
    icon: <Landmark className="h-5 w-5" />,
  },
  {
    title: "Michigan Voter Information Center",
    description: "Register to vote, find your polling place, view sample ballots, and track your absentee ballot status online.",
    eligibility: ["eligible voters"],
    url: "https://mvic.sos.state.mi.us",
    icon: <Vote className="h-5 w-5" />,
  },
  {
    title: "Michigan Immigrant Rights Center",
    description: "Legal services and policy advocacy for immigrants including asylum, DACA, family petitions, and naturalization.",
    eligibility: ["immigrants", "families"],
    url: "https://michiganimmigrant.org",
    icon: <Users className="h-5 w-5" />,
  },
];

const handleShare = async (program: Program) => {
  const shareData = { title: program.title, text: program.description, url: program.url };
  if (navigator.share) {
    try { await navigator.share(shareData); } catch { /* user cancelled */ }
  } else {
    await navigator.clipboard.writeText(program.url);
    toast.success("Link copied to clipboard");
  }
};

const LegalCivicSpotlights = () => {
  const { county } = useCounty();
  const visiblePrograms = county
    ? PROGRAMS.filter((p) => !p.counties || p.counties.includes(county))
    : PROGRAMS;

  return (
    <section className="py-12" aria-labelledby="legal-heading">
      <div className="container">
        <div className="text-center mb-8">
          <h2 id="legal-heading" className="text-2xl font-bold text-foreground">
            Legal & Civic Resources
          </h2>
          <p className="mt-2 text-muted-foreground">
            Legal aid and civic services for {county ? `${county} County` : "Michigan"} residents
          </p>
        </div>
        <Carousel opts={{ align: "start", loop: true }} className="w-full max-w-5xl mx-auto">
          <CarouselContent>
            {visiblePrograms.map((program) => (
              <CarouselItem key={program.title} className="md:basis-1/2 lg:basis-1/3">
                <Card className="h-full hover-lift">
                  <CardContent className="p-5 space-y-3 flex flex-col h-full">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent shrink-0">
                        {program.icon}
                      </div>
                      <h3 className="font-semibold text-sm text-foreground leading-snug">{program.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed flex-1">{program.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {program.eligibility.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] capitalize">{tag}</Badge>
                      ))}
                      {!program.counties && <Badge variant="outline" className="text-[10px]">Statewide</Badge>}
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <a href={program.url} target="_blank" rel="noopener noreferrer">
                          Go to Program <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="sm" className="px-2" onClick={() => handleShare(program)} aria-label={`Share ${program.title}`}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </section>
  );
};

export default LegalCivicSpotlights;
