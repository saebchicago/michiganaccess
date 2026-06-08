import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { ExternalLink, BookOpen, Landmark, Music, TreePine, Palette, Share2 } from "lucide-react";
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
    title: "Michigan Activity Pass",
    description: "Free day passes to over 100 state parks, campgrounds, and recreation areas - available at any Michigan library.",
    eligibility: ["library card holders"],
    url: "https://www.michigan.gov/dnr/places/state-parks/map",
    icon: <TreePine className="h-5 w-5" />,
  },
  {
    title: "Michigan Council for Arts & Cultural Affairs",
    description: "Grants, programs, and events supporting arts education, public art, and cultural programming statewide.",
    eligibility: ["organizations", "artists"],
    url: "https://www.michigan.gov/leo/bureaus-agencies/mcaca",
    icon: <Palette className="h-5 w-5" />,
  },
  {
    title: "Detroit Public Library",
    description: "Free digital resources, literacy programs, job readiness workshops, and community meeting spaces across 23 branches.",
    eligibility: ["Detroit residents"],
    url: "https://detroitpubliclibrary.org",
    icon: <BookOpen className="h-5 w-5" />,
    counties: ["Wayne"],
  },
  {
    title: "Grand Rapids Public Library",
    description: "Free programs including STEM labs, language learning, business development resources, and youth summer reading.",
    eligibility: ["Grand Rapids area residents"],
    url: "https://www.grpl.org",
    icon: <BookOpen className="h-5 w-5" />,
    counties: ["Kent"],
  },
  {
    title: "Michigan History Center",
    description: "Museums, archives, and historical sites preserving Michigan's heritage. Free admission days and educational programs.",
    eligibility: ["all residents"],
    url: "https://www.michigan.gov/mhc",
    icon: <Landmark className="h-5 w-5" />,
  },
  {
    title: "Pure Michigan Trails",
    description: "Over 13,000 miles of multi-use trails for hiking, biking, and skiing. Trail maps, conditions, and accessibility info.",
    eligibility: ["all residents"],
    url: "https://www.michigan.org/trails",
    icon: <TreePine className="h-5 w-5" />,
  },
  {
    title: "Michigan Philharmonic & Local Arts",
    description: "Affordable and free concerts, community theater, and cultural festivals across Michigan communities.",
    eligibility: ["all residents"],
    url: "https://www.michiganphil.org",
    icon: <Music className="h-5 w-5" />,
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

const CulturalRecSpotlights = () => {
  const { county } = useCounty();
  const visiblePrograms = county
    ? PROGRAMS.filter((p) => !p.counties || p.counties.includes(county))
    : PROGRAMS;

  return (
    <section className="py-12" aria-labelledby="cultural-rec-heading">
      <div className="container">
        <div className="text-center mb-8">
          <h2 id="cultural-rec-heading" className="text-2xl font-bold text-foreground">
            Cultural & Recreation Resources
          </h2>
          <p className="mt-2 text-muted-foreground">
            Libraries, parks, arts, and cultural programs{county ? ` for ${county} County` : " across Michigan"}
          </p>
        </div>
        <Carousel opts={{ align: "start", loop: true }} className="w-full max-w-5xl mx-auto">
          <CarouselContent>
            {visiblePrograms.map((program) => (
              <CarouselItem key={program.title} className="md:basis-1/2 lg:basis-1/3">
                <Card className="h-full hover-lift">
                  <CardContent className="p-5 space-y-3 flex flex-col h-full">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/50 text-accent-foreground shrink-0">
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

export default CulturalRecSpotlights;
