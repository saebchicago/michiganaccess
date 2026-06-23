import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { ExternalLink, Users, Heart, Apple, Home, GraduationCap, Share2, CheckCircle2 } from "lucide-react";
import { useCounty } from "@/contexts/CountyContext";
import { toast } from "sonner";

interface Program {
  title: string;
  highlights: string[];
  eligibility: string[];
  url: string;
  icon: React.ReactNode;
  counties?: string[];
  lastVerified: string; // ISO date
}

const PROGRAMS: Program[] = [
  {
    title: "WIC Nutrition Program",
    highlights: [
      "Free nutrition support and healthy food",
      "Breastfeeding help for new moms",
      "Children under 5 eligible",
    ],
    eligibility: ["Families", "Children"],
    url: "https://www.michigan.gov/mdhhs/assistance-programs/wic",
    icon: <Apple className="h-5 w-5" />,
    lastVerified: "2026-02-10",
  },
  {
    title: "School-Based Health Centers",
    highlights: [
      "On-site medical, dental, and mental health",
      "No transportation barriers",
      "Available during school hours",
    ],
    eligibility: ["Children", "Teens"],
    url: "https://www.michigan.gov/mdhhs/doing-business/providers/sbhc",
    icon: <GraduationCap className="h-5 w-5" />,
    counties: ["Wayne", "Oakland", "Kent", "Genesee", "Washtenaw", "Ingham", "Kalamazoo", "Muskegon", "Saginaw", "Berrien"],
    lastVerified: "2026-02-12",
  },
  {
    title: "Maternal Infant Health Program",
    highlights: [
      "Home visits and care coordination",
      "Support for pregnant women",
      "Infant health resources",
    ],
    eligibility: ["Families", "Children"],
    url: "https://www.michigan.gov/mdhhs/keep-mi-healthy/maternal-and-infant-health",
    icon: <Heart className="h-5 w-5" />,
    lastVerified: "2026-01-28",
  },
  {
    title: "Emergency Shelter Assistance",
    highlights: [
      "Temporary housing for families",
      "Available across Michigan counties",
      "No prior enrollment needed",
    ],
    eligibility: ["Families", "Seniors"],
    url: "https://www.michigan.gov/mdhhs/assistance-programs/emergency-services",
    icon: <Home className="h-5 w-5" />,
    lastVerified: "2026-02-14",
  },
  {
    title: "Great Start Readiness (GSRP)",
    highlights: [
      "Free state-funded preschool for 4-year-olds",
      "Income-eligible families qualify",
      "Available in all 83 counties",
    ],
    eligibility: ["Children", "Families"],
    url: "https://www.michigan.gov/mde/services/early-learners/gsrp",
    icon: <GraduationCap className="h-5 w-5" />,
    lastVerified: "2026-02-01",
  },
  {
    title: "Meals on Wheels Michigan",
    highlights: [
      "Home-delivered nutritious meals",
      "Wellness checks included",
      "No minimum income requirement",
    ],
    eligibility: ["Age 60+", "Homebound"],
    url: "https://www.michigan.gov/osa",
    icon: <Users className="h-5 w-5" />,
    lastVerified: "2026-02-08",
  },
];

function daysAgo(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

const handleShare = async (program: Program) => {
  const shareData = { title: program.title, text: program.highlights[0], url: program.url };
  if (navigator.share) {
    try { await navigator.share(shareData); } catch { /* cancelled */ }
  } else {
    await navigator.clipboard.writeText(program.url);
    toast.success("Link copied to clipboard");
  }
};

const CommunityProgramSpotlights = () => {
  const { county } = useCounty();

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
            {visiblePrograms.map((program) => {
              const recent = daysAgo(program.lastVerified) <= 14;
              return (
                <CarouselItem key={program.title} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="h-full hover-lift relative">
                    {recent && (
                      <Badge className="absolute top-2 right-2 bg-michigan-forest/10 text-michigan-forest-deep border-michigan-forest/20 text-[10px] px-1.5 py-0">
                        <CheckCircle2 className="h-3 w-3 mr-0.5" />
                        Updated recently
                      </Badge>
                    )}
                    <CardContent className="p-5 space-y-3 flex flex-col h-full">
                      {/* Header */}
                      <div className="flex items-center gap-3 pr-20">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                          {program.icon}
                        </div>
                        <h3 className="font-semibold text-sm text-foreground leading-snug">{program.title}</h3>
                      </div>

                      {/* Bullet-point highlights */}
                      <ul className="space-y-1 flex-1">
                        {program.highlights.map((point) => (
                          <li key={point} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="mt-1.5 h-1 w-1 rounded-full bg-primary/50 flex-shrink-0" />
                            {point}
                          </li>
                        ))}
                      </ul>

                      {/* Eligibility chips */}
                      <div className="flex flex-wrap gap-1.5">
                        {program.eligibility.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                        {!program.counties && (
                          <Badge variant="outline" className="text-[10px]">📍 Statewide</Badge>
                        )}
                      </div>

                      {/* Actions */}
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
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </section>
  );
};

export default CommunityProgramSpotlights;
