import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ExploreQuestion {
  id: string;
  question: string;
  description: string;
  href: string;
}

const HOMEPAGE_EXPLORE_QUESTIONS: ExploreQuestion[] = [
  {
    id: "diabetes-counties",
    question: "Which counties have fastest rising diabetes?",
    description: "Scan county risk patterns to find where chronic disease burdens are climbing.",
    href: "/brief",
  },
  {
    id: "access-gaps",
    question: "Where are healthcare access gaps largest?",
    description: "See counties with the thinnest primary care capacity and strongest service gaps.",
    href: "/data-and-insights",
  },
  {
    id: "improving-counties",
    question: "Which counties are improving the most?",
    description: "Compare counties showing the strongest positive health trends.",
    href: "/compare",
  },
  {
    id: "life-expectancy",
    question: "Why is life expectancy declining?",
    description: "Explore the statewide timeline and county differences driving shorter lives.",
    href: "/environment",
  },
  {
    id: "food-insecurity",
    question: "Which counties face food insecurity?",
    description: "Identify communities with the highest rates of hunger and food access challenges.",
    href: "/food-security",
  },
  {
    id: "housing-affordability",
    question: "Where is housing least affordable?",
    description: "See where cost burden is highest and housing supply fails to meet demand.",
    href: "/housing",
  },
];

export default function ExploreQuestionsPanel() {
  const navigate = useNavigate();

  return (
    <section
      id="explore-questions"
      className="py-12 bg-background"
      aria-labelledby="explore-questions-title"
    >
      <div className="container max-w-6xl space-y-6">
        <div className="max-w-3xl space-y-3">
          <Badge variant="outline" className="text-[10px] uppercase tracking-[0.2em]">
            Explore Michigan Health
          </Badge>
          <h2
            id="explore-questions-title"
            className="text-2xl font-bold text-foreground"
          >
            Start with a question, not a menu
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            Each question opens the right data layer for your research or planning need.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {HOMEPAGE_EXPLORE_QUESTIONS.map((item, index) => (
            <motion.div
              key={item.id}
              data-testid="explore-question"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, ease: "easeOut", delay: index * 0.05 }}
              className="cursor-pointer"
              onClick={() => navigate(item.href)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(item.href); } }}
              tabIndex={0}
              role="button"
              aria-label={item.question}
            >
              <Card className="h-full border-border/60 bg-card/80 card-hover cursor-pointer hover:border-primary/40 hover:bg-primary/5">
                <CardContent className="flex h-full flex-col gap-3 p-5">
                  <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{item.question}</p>
                  <p className="text-base leading-relaxed text-foreground flex-1">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-1 text-sm font-medium text-primary">
                    Explore <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
