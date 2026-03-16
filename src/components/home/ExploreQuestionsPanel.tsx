import { Link } from "react-router-dom";
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
    href: "/health",
  },
  {
    id: "access-gaps",
    question: "Where are healthcare access gaps largest?",
    description: "See counties with the thinnest primary care capacity and strongest service gaps.",
    href: "/health",
  },
  {
    id: "improving-counties",
    question: "Which counties are improving the most?",
    description: "Compare counties showing the strongest positive health trends.",
    href: "/data-and-insights",
  },
  {
    id: "life-expectancy",
    question: "Why is life expectancy declining?",
    description: "Explore the statewide timeline and county differences driving shorter lives.",
    href: "/health",
  },
];

export default function ExploreQuestionsPanel() {
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
            className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            Start with a question, not a menu
          </h2>
          <p className="text-base leading-7 text-muted-foreground">
            Each question opens the right data layer for your research or planning need.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {HOMEPAGE_EXPLORE_QUESTIONS.map((item, index) => (
            <motion.div
              key={item.id}
              data-testid="explore-question"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, ease: "easeOut", delay: index * 0.05 }}
              whileHover={{ y: -4, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
            >
              <Link to={item.href} aria-label={item.question}>
                <Card className="h-full border-border/60 bg-card/80 transition-colors hover:border-primary/40 hover:bg-primary/5">
                  <CardContent className="flex h-full flex-col gap-3 p-5">
                    <p className="font-semibold text-foreground leading-tight">{item.question}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-1 text-sm font-medium text-primary">
                      Explore <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
