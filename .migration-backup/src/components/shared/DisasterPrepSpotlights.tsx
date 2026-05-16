import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { ExternalLink, ShieldAlert, Radio, Siren, CloudRain, Flame, Share2 } from "lucide-react";
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
    title: "American Red Cross – Michigan",
    description: "Disaster relief, emergency shelters, preparedness training, and home fire safety programs across all Michigan counties.",
    eligibility: ["all residents"],
    url: "https://www.redcross.org/local/michigan.html",
    icon: <ShieldAlert className="h-5 w-5" />,
  },
  {
    title: "Michigan State Police – Emergency Management",
    description: "Statewide emergency preparedness plans, hazard mitigation, and county-level emergency management coordination.",
    eligibility: ["all residents"],
    url: "https://www.michigan.gov/msp/divisions/emhsd",
    icon: <Siren className="h-5 w-5" />,
  },
  {
    title: "BE PREPARED Michigan",
    description: "Build your family emergency kit, create communication plans, and sign up for county-level alert systems.",
    eligibility: ["families", "individuals"],
    url: "https://www.michigan.gov/msp/divisions/emhsd/be-prepared",
    icon: <Radio className="h-5 w-5" />,
  },
  {
    title: "FEMA Disaster Assistance",
    description: "Federal disaster declarations, individual assistance, and hazard mitigation grants for Michigan communities.",
    eligibility: ["disaster-affected residents"],
    url: "https://www.fema.gov/disaster/declarations?field_state_tid=23",
    icon: <CloudRain className="h-5 w-5" />,
  },
  {
    title: "Wayne County Emergency Management",
    description: "Local emergency plans, severe weather alerts, and community preparedness resources for Wayne County residents.",
    eligibility: ["Wayne County residents"],
    url: "https://www.waynecounty.com/departments/hsem/",
    icon: <Siren className="h-5 w-5" />,
    counties: ["Wayne"],
  },
  {
    title: "Kent County Emergency Management",
    description: "Local hazard mitigation, severe weather preparedness, and emergency shelter information for Kent County.",
    eligibility: ["Kent County residents"],
    url: "https://www.accesskent.com/departments/emergency-management/",
    icon: <Siren className="h-5 w-5" />,
    counties: ["Kent"],
  },
  {
    title: "Michigan Community Action – Disaster Recovery",
    description: "Low-income disaster recovery assistance, temporary housing, and emergency supplies through local Community Action Agencies.",
    eligibility: ["low-income households"],
    url: "https://www.mcaaa.org",
    icon: <Flame className="h-5 w-5" />,
  },
];

const handleShare = async (program: Program) => {
  const shareData = { title: program.title, text: program.description, url: program.url };
  if (navigator.share) {
    try { await navigator.share(shareData); } catch { /* cancelled */ }
  } else {
    await navigator.clipboard.writeText(program.url);
    toast.success("Link copied to clipboard");
  }
};

const DisasterPrepSpotlights = () => {
  const { county } = useCounty();
  const visiblePrograms = county
    ? PROGRAMS.filter((p) => !p.counties || p.counties.includes(county))
    : PROGRAMS;

  return (
    <section className="py-12" aria-labelledby="disaster-prep-heading">
      <div className="container">
        <div className="text-center mb-8">
          <h2 id="disaster-prep-heading" className="text-2xl font-bold text-foreground">
            Disaster Preparedness & Emergency Resources
          </h2>
          <p className="mt-2 text-muted-foreground">
            Emergency planning and disaster relief{county ? ` for ${county} County residents` : " across Michigan"}
          </p>
        </div>
        <Carousel opts={{ align: "start", loop: true }} className="w-full max-w-5xl mx-auto">
          <CarouselContent>
            {visiblePrograms.map((program) => (
              <CarouselItem key={program.title} className="md:basis-1/2 lg:basis-1/3">
                <Card className="h-full hover-lift">
                  <CardContent className="p-5 space-y-3 flex flex-col h-full">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive shrink-0">
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

export default DisasterPrepSpotlights;
