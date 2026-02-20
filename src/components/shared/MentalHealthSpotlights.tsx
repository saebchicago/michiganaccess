import { Phone, Heart, ExternalLink, Share2, Brain, MessageCircle, Shield, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { toast } from "sonner";

interface Program {
  title: string;
  description: string;
  tags: string[];
  url: string;
  icon: React.ReactNode;
  phone?: string;
}

const PROGRAMS: Program[] = [
  {
    title: "988 Suicide & Crisis Lifeline",
    description: "Free 24/7 crisis support by phone, text, or chat. Call or text 988 for immediate help.",
    tags: ["crisis", "free", "24/7"],
    url: "https://988lifeline.org",
    icon: <Phone className="h-5 w-5 text-michigan-coral" />,
    phone: "988",
  },
  {
    title: "MDHHS Community Mental Health",
    description: "Free or low-cost therapy, crisis intervention, and psychiatric services through Michigan's CMHSPs.",
    tags: ["free/low-cost", "therapy", "statewide"],
    url: "https://www.michigan.gov/mdhhs/doing-business/providers/providers/mental-health",
    icon: <Shield className="h-5 w-5 text-michigan-blue" />,
    phone: "844-799-9876",
  },
  {
    title: "NAMI Michigan",
    description: "Free peer-led support groups, Family-to-Family education, and mental health advocacy statewide.",
    tags: ["support groups", "free", "advocacy"],
    url: "https://namimi.org",
    icon: <Users className="h-5 w-5 text-michigan-forest" />,
    phone: "517-485-4049",
  },
  {
    title: "Hope Network Behavioral Health",
    description: "Outpatient and residential therapy, substance use treatment, and rehabilitation across West Michigan.",
    tags: ["therapy", "substance use", "residential"],
    url: "https://hopenetwork.org/behavioral-health",
    icon: <Heart className="h-5 w-5 text-michigan-coral" />,
    phone: "800-695-7273",
  },
  {
    title: "U-M Behavioral & Mental Health",
    description: "Comprehensive psychiatric care including mood disorders, PTSD, and child & adolescent programs.",
    tags: ["specialized", "academic", "telehealth"],
    url: "https://www.uofmhealth.org/conditions-treatments/mental-health",
    icon: <Brain className="h-5 w-5 text-michigan-teal" />,
  },
  {
    title: "Mental Health Association in MI",
    description: "Statewide advocacy, crisis hotline referrals, and mental health education to reduce stigma.",
    tags: ["advocacy", "hotline", "education"],
    url: "https://www.mha-mi.com",
    icon: <MessageCircle className="h-5 w-5 text-michigan-gold" />,
    phone: "248-647-1711",
  },
  {
    title: "Trinity Health Virtual Mental Health",
    description: "Outpatient therapy, psychiatric evaluations, and virtual appointments across Michigan locations.",
    tags: ["telehealth", "therapy", "statewide"],
    url: "https://www.trinityhealthmichigan.org/medical-services/behavioral-health",
    icon: <Heart className="h-5 w-5 text-primary" />,
    phone: "844-237-3627",
  },
];

const handleShare = async (program: Program) => {
  if (navigator.share) {
    await navigator.share({ title: program.title, url: program.url });
  } else {
    await navigator.clipboard.writeText(program.url);
    toast.success("Link copied to clipboard");
  }
};

const MentalHealthSpotlights = () => (
  <section className="space-y-4">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-michigan-teal/10">
        <Brain className="h-5 w-5 text-michigan-teal" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-foreground">Mental Health Resources</h2>
        <p className="text-xs text-muted-foreground">Crisis support, therapy, advocacy & specialized care across Michigan</p>
      </div>
    </div>

    {/* Quick crisis strip */}
    <div className="rounded-lg border border-michigan-coral/20 bg-michigan-coral/5 p-3 flex flex-wrap items-center gap-3 text-sm">
      <Phone className="h-4 w-4 text-michigan-coral" />
      <span className="font-semibold">In crisis?</span>
      <a href="tel:988" className="font-bold text-michigan-coral hover:underline">Call/Text 988</a>
      <span className="text-muted-foreground">·</span>
      <span className="text-muted-foreground">Text HOME to 741741</span>
      <span className="text-muted-foreground">·</span>
      <a href="tel:211" className="font-bold text-michigan-coral hover:underline">2-1-1</a>
      <span className="text-muted-foreground">(resources)</span>
    </div>

    <Carousel opts={{ align: "start" }} className="w-full">
      <CarouselContent className="-ml-2 md:-ml-4">
        {PROGRAMS.map((program) => (
          <CarouselItem key={program.title} className="pl-2 md:pl-4 basis-[85%] sm:basis-1/2 lg:basis-1/3">
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col gap-3 h-full">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0">
                    {program.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground leading-tight">{program.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{program.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {program.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px] capitalize">{tag}</Badge>
                  ))}
                </div>
                <div className="mt-auto flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1" asChild>
                    <a href={program.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3" /> Visit
                    </a>
                  </Button>
                  {program.phone && (
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1" asChild>
                      <a href={`tel:${program.phone}`}>
                        <Phone className="h-3 w-3" /> {program.phone}
                      </a>
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 ml-auto" onClick={() => handleShare(program)}>
                    <Share2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  </section>
);

export default MentalHealthSpotlights;
