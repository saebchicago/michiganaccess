import { motion } from "framer-motion";
import { Syringe, HeartPulse, Brain, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";

const FeaturedTopics = () => {
  const { t } = useTranslation();

  const topics = [
    {
      icon: Syringe,
      tag: t("featuredTopics.seasonalHealth"),
      title: t("featuredTopics.fluTitle"),
      description: t("featuredTopics.fluDesc"),
      color: "text-michigan-teal",
      bg: "bg-accent/10",
    },
    {
      icon: HeartPulse,
      tag: t("featuredTopics.heartHealth"),
      title: t("featuredTopics.heartTitle"),
      description: t("featuredTopics.heartDesc"),
      color: "text-michigan-coral",
      bg: "bg-michigan-coral/10",
    },
    {
      icon: Brain,
      tag: t("featuredTopics.mentalHealth"),
      title: t("featuredTopics.mentalTitle"),
      description: t("featuredTopics.mentalDesc"),
      color: "text-michigan-sky",
      bg: "bg-michigan-sky/10",
    },
    {
      icon: TrendingUp,
      tag: t("featuredTopics.communityWin"),
      title: t("featuredTopics.maternalTitle"),
      description: t("featuredTopics.maternalDesc"),
      color: "text-michigan-forest",
      bg: "bg-michigan-forest/10",
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">{t("featuredTopics.title")}</h2>
          <p className="mt-2 text-muted-foreground">{t("featuredTopics.subtitle")}</p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {topics.map((topic, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Card className="group h-full cursor-pointer border-border/50 transition-all duration-300 hover:border-primary/20 hover:shadow-michigan hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${topic.bg}`}>
                    <topic.icon className={`h-5 w-5 ${topic.color}`} />
                  </div>
                  <span className={`text-xs font-semibold uppercase tracking-wider ${topic.color}`}>{topic.tag}</span>
                  <h3 className="mt-2 text-base font-semibold text-foreground">{topic.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{topic.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedTopics;
