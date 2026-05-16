import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { ExternalLink, GraduationCap, Briefcase, BookOpen, Wrench, Users, Share2 } from "lucide-react";
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
    title: "Michigan Works! Career Services",
    description: "Free job search assistance, resume workshops, skills training, and career counseling at local American Job Centers.",
    eligibility: ["job seekers", "adults"],
    url: "https://www.michiganworks.org",
    icon: <Briefcase className="h-5 w-5" />,
  },
  {
    title: "Goodwill Industries Job Training",
    description: "Workforce development programs including digital skills, retail training, and supported employment for individuals with barriers.",
    eligibility: ["job seekers", "disabilities"],
    url: "https://www.goodwill.org/jobs-training/",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Going PRO Talent Fund",
    description: "State-funded training grants for employers to train new and existing workers in high-demand industries.",
    eligibility: ["employers", "workers"],
    url: "https://www.michigan.gov/leo/bureaus-agencies/wd/programs/going-pro",
    icon: <Wrench className="h-5 w-5" />,
  },
  {
    title: "Michigan Reconnect",
    description: "Free community college tuition for adults 25+ without a degree. Covers in-district tuition and fees at any MI community college.",
    eligibility: ["adults 25+", "no degree"],
    url: "https://www.michigan.gov/reconnect",
    icon: <GraduationCap className="h-5 w-5" />,
  },
  {
    title: "Pell Grant & Financial Aid",
    description: "Federal Pell Grants provide up to $7,395/year for low-income students. Apply via FAFSA for Michigan colleges.",
    eligibility: ["students", "low-income"],
    url: "https://studentaid.gov/understand-aid/types/grants/pell",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    title: "Detroit at Work",
    description: "Career coaching, job training, and placement services for Detroit residents, with focus on high-growth sectors.",
    eligibility: ["job seekers", "adults"],
    url: "https://detroitatwork.com",
    icon: <Briefcase className="h-5 w-5" />,
    counties: ["Wayne"],
  },
  {
    title: "West Michigan Works! Training",
    description: "Sector-specific training programs in healthcare, manufacturing, and IT for West Michigan residents.",
    eligibility: ["job seekers", "career changers"],
    url: "https://www.westmiworks.org",
    icon: <Wrench className="h-5 w-5" />,
    counties: ["Kent", "Ottawa", "Muskegon", "Allegan", "Barry", "Ionia", "Montcalm"],
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

const EducationSpotlights = () => {
  const { county } = useCounty();
  const visiblePrograms = county
    ? PROGRAMS.filter((p) => !p.counties || p.counties.includes(county))
    : PROGRAMS;

  return (
    <section className="py-12" aria-labelledby="education-heading">
      <div className="container">
        <div className="text-center mb-8">
          <h2 id="education-heading" className="text-2xl font-bold text-foreground">
            Education & Workforce
          </h2>
          <p className="mt-2 text-muted-foreground">
            Job training and education programs for {county ? `${county} County` : "Michigan"} residents
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

export default EducationSpotlights;
