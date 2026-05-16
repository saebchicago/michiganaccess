import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { ExternalLink, Droplets, Wind, Recycle, TreePine, Fish, Share2 } from "lucide-react";
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
    title: "EGLE Air Quality Alerts",
    description: "Real-time air quality monitoring and health advisories from Michigan's Department of Environment, Great Lakes, and Energy.",
    eligibility: ["all residents"],
    url: "https://www.michigan.gov/egle/about/organization/air-quality",
    icon: <Wind className="h-5 w-5" />,
  },
  {
    title: "Michigan Safe Drinking Water",
    description: "Water quality testing, lead service line replacement programs, and public water system reports by county.",
    eligibility: ["homeowners", "renters"],
    url: "https://www.michigan.gov/egle/about/organization/drinking-water-and-environmental-health",
    icon: <Droplets className="h-5 w-5" />,
  },
  {
    title: "Great Lakes Restoration Initiative",
    description: "Federal programs protecting the Great Lakes — habitat restoration, invasive species management, and beach monitoring.",
    eligibility: ["communities"],
    url: "https://www.glri.us",
    icon: <Fish className="h-5 w-5" />,
  },
  {
    title: "Michigan Recycling & Composting",
    description: "County recycling guides, drop-off locations, hazardous waste events, and composting programs statewide.",
    eligibility: ["all residents"],
    url: "https://www.michigan.gov/egle/about/organization/materials-management/recycling",
    icon: <Recycle className="h-5 w-5" />,
  },
  {
    title: "Michigan State Parks & Trails",
    description: "Over 100 state parks and 13,000+ miles of trails. Recreation Passport provides vehicle entry to all state parks.",
    eligibility: ["all residents"],
    url: "https://www.michigan.gov/dnr/places/state-parks",
    icon: <TreePine className="h-5 w-5" />,
  },
  {
    title: "Environmental Justice Screening",
    description: "Identify communities disproportionately impacted by pollution using Michigan's EJ screening tool and get priority resources.",
    eligibility: ["communities"],
    url: "https://www.michigan.gov/egle/about/organization/environmental-justice",
    icon: <Wind className="h-5 w-5" />,
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

const EnvironmentSpotlights = () => {
  const { county } = useCounty();
  const visiblePrograms = county
    ? PROGRAMS.filter((p) => !p.counties || p.counties.includes(county))
    : PROGRAMS;

  return (
    <section className="py-12" aria-labelledby="environment-heading">
      <div className="container">
        <div className="text-center mb-8">
          <h2 id="environment-heading" className="text-2xl font-bold text-foreground">
            Environment & Sustainability
          </h2>
          <p className="mt-2 text-muted-foreground">
            Environmental resources for {county ? `${county} County` : "Michigan"} communities
          </p>
        </div>
        <Carousel opts={{ align: "start", loop: true }} className="w-full max-w-5xl mx-auto">
          <CarouselContent>
            {visiblePrograms.map((program) => (
              <CarouselItem key={program.title} className="md:basis-1/2 lg:basis-1/3">
                <Card className="h-full hover-lift">
                  <CardContent className="p-5 space-y-3 flex flex-col h-full">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-michigan-forest/10 text-michigan-forest shrink-0">
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

export default EnvironmentSpotlights;
