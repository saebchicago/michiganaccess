import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { ExternalLink, Bus, Train, Car, Accessibility, Share2 } from "lucide-react";
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
    title: "Michigan Medicaid Non-Emergency Transport",
    description: "Free rides to medical appointments for Medicaid enrollees. Covers buses, taxis, and mileage reimbursement statewide.",
    eligibility: ["medicaid", "families"],
    url: "https://www.michigan.gov/mdhhs/doing-business/providers/providers/transport",
    icon: <Bus className="h-5 w-5" />,
  },
  {
    title: "MDOT Rural Transit Programs",
    description: "Public transit services in rural areas through county-operated demand-response and fixed-route systems.",
    eligibility: ["rural", "seniors"],
    url: "https://www.michigan.gov/mdot/travel/public-transit",
    icon: <Train className="h-5 w-5" />,
  },
  {
    title: "MichiVan Rideshare Program",
    description: "Vanpool commuting for groups of 7–15 people sharing similar routes. Subsidized fares for qualifying riders.",
    eligibility: ["commuters"],
    url: "https://www.michigan.gov/mdot/travel/michivan",
    icon: <Car className="h-5 w-5" />,
  },
  {
    title: "ADA Paratransit Services",
    description: "Door-to-door transportation for individuals with disabilities who cannot use fixed-route transit.",
    eligibility: ["disabilities", "seniors"],
    url: "https://www.michigan.gov/mdot/travel/public-transit",
    icon: <Accessibility className="h-5 w-5" />,
  },
  {
    title: "SMART & DDOT Transit (Metro Detroit)",
    description: "Regional bus networks serving Wayne, Oakland, and Macomb counties with fixed routes and FAST express service.",
    eligibility: ["commuters", "families"],
    url: "https://www.smartbus.org",
    icon: <Bus className="h-5 w-5" />,
    counties: ["Wayne", "Oakland", "Macomb"],
  },
  {
    title: "The Rapid (Grand Rapids)",
    description: "Bus rapid transit and fixed routes serving Kent County including Silver Line and Laker Line services.",
    eligibility: ["commuters", "families"],
    url: "https://www.ridetherapid.org",
    icon: <Bus className="h-5 w-5" />,
    counties: ["Kent"],
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

const TransportationSpotlights = () => {
  const { county } = useCounty();
  const visiblePrograms = county
    ? PROGRAMS.filter((p) => !p.counties || p.counties.includes(county))
    : PROGRAMS;

  return (
    <section className="py-12" aria-labelledby="transport-heading">
      <div className="container">
        <div className="text-center mb-8">
          <h2 id="transport-heading" className="text-2xl font-bold text-foreground">
            Transportation Resources
          </h2>
          <p className="mt-2 text-muted-foreground">
            Transit options serving {county ? `${county} County` : "Michigan"} residents
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

export default TransportationSpotlights;
