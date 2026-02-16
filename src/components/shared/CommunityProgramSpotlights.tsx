import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { ExternalLink, Users, Heart, Apple, Home, GraduationCap, Share2 } from "lucide-react";
import { useCounty } from "@/contexts/CountyContext";
import { toast } from "sonner";

interface Program {
  title: string;
  description: string;
  eligibility: string[];
  url: string;
  icon: React.ReactNode;
  counties?: string[]; // empty = statewide
}

const PROGRAMS: Program[] = [
  {
    title: "WIC Nutrition Program",
    description: "Free nutrition support, healthy food, and breastfeeding help for pregnant women, new moms, and children under 5.",
    eligibility: ["families", "children"],
    url: "https://www.michigan.gov/mdhhs/assistance-programs/wic",
    icon: <Apple className="h-5 w-5" />,
  },
  {
    title: "School-Based Health Centers",
    description: "On-site medical, dental, and mental health services at schools — no transportation barriers for students.",
    eligibility: ["children", "teens"],
    url: "https://www.michigan.gov/mdhhs/doing-business/providers/sbhc",
    icon: <GraduationCap className="h-5 w-5" />,
    counties: ["Wayne", "Oakland", "Kent", "Genesee", "Washtenaw", "Ingham", "Kalamazoo", "Muskegon", "Saginaw", "Berrien"],
  },
  {
    title: "Maternal Infant Health Program",
    description: "Home visits, care coordination, and support for pregnant women and families with infants in Michigan.",
    eligibility: ["families", "children"],
    url: "https://www.michigan.gov/mdhhs/keep-mi-healthy/maternal-and-infant-health",
    icon: <Heart className="h-5 w-5" />,
  },
  {
    title: "MDHHS Emergency Shelter Assistance",
    description: "Temporary housing assistance for families and individuals facing homelessness across Michigan counties.",
    eligibility: ["families", "seniors"],
    url: "https://www.michigan.gov/mdhhs/assistance-programs/emergency-services",
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: "Great Start Readiness Program (GSRP)",
    description: "Free state-funded preschool for 4-year-olds from income-eligible families. Available in all 83 counties.",
    eligibility: ["children", "families"],
    url: "https://www.michigan.gov/mde/services/early-learners/gsrp",
    icon: <GraduationCap className="h-5 w-5" />,
  },
  {
    title: "Meals on Wheels Michigan",
    description: "Home-delivered nutritious meals for seniors and homebound adults, with wellness checks and social connection.",
    eligibility: ["seniors"],
    url: "https://www.michigan.gov/osa",
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

const CommunityProgramSpotlights = () => {
  const { county } = useCounty();

  // Filter: show statewide programs (no counties list) + programs matching selected county
  const visiblePrograms = county
    ? PROGRAMS.filter((p) => !p.counties || p.counties.includes(county))
    : PROGRAMS;

  return (
    <section className="py-12" aria-labelledby="programs-heading">
      <div className="container">
        <div className="text-center mb-8">
          <h2 id="programs-heading" className="text-2xl font-bold text-foreground">
            Community Program Spotlights
          </h2>
          <p className="mt-2 text-muted-foreground">
            Key programs serving {county ? `${county} County` : "Michigan"} families, children, and seniors
          </p>
        </div>

        <Carousel opts={{ align: "start", loop: true }} className="w-full max-w-5xl mx-auto">
          <CarouselContent>
            {visiblePrograms.map((program) => (
              <CarouselItem key={program.title} className="md:basis-1/2 lg:basis-1/3">
                <Card className="h-full hover-lift">
                  <CardContent className="p-5 space-y-3 flex flex-col h-full">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                        {program.icon}
                      </div>
                      <h3 className="font-semibold text-sm text-foreground leading-snug">{program.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                      {program.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {program.eligibility.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] capitalize">
                          {tag}
                        </Badge>
                      ))}
                      {!program.counties && (
                        <Badge variant="outline" className="text-[10px]">Statewide</Badge>
                      )}
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <a href={program.url} target="_blank" rel="noopener noreferrer">
                          Go to Program <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="px-2"
                        onClick={() => handleShare(program)}
                        aria-label={`Share ${program.title}`}
                      >
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

export default CommunityProgramSpotlights;
