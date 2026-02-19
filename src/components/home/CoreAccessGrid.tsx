import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Apple, HeartPulse, Shield, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const CoreAccessGrid = () => {
  const { t } = useTranslation();

  const tiles = [
    {
      icon: Home,
      title: t("access.housingTitle"),
      description: t("access.housingDesc"),
      href: "/resources",
      iconBg: "bg-primary/8",
      iconColor: "text-primary",
    },
    {
      icon: Apple,
      title: t("access.foodTitle"),
      description: t("access.foodDesc"),
      href: "/financial-help",
      iconBg: "bg-accent/8",
      iconColor: "text-accent",
    },
    {
      icon: HeartPulse,
      title: t("access.healthTitle"),
      description: t("access.healthDesc"),
      href: "/find-care",
      iconBg: "bg-michigan-forest/8",
      iconColor: "text-michigan-forest",
    },
    {
      icon: Shield,
      title: "Insurance Appeals",
      description: "Got a claim denied? Build a free appeal letter step-by-step, learn your rights, and file for an independent review.",
      href: "/health/insurance-appeals",
      iconBg: "bg-primary/8",
      iconColor: "text-primary",
    },
  ];

  return (
    <section className="py-16 md:py-24" aria-labelledby="core-access-heading">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 id="core-access-heading" className="text-2xl font-bold text-foreground sm:text-3xl">
            {t("access.sectionTitle")}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {t("access.sectionSubtitle")}
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {tiles.map((tile) => (
            <motion.div key={tile.href + tile.title} variants={item}>
              <Card className="group h-full border-border/60 transition-all duration-300 hover:border-primary/20 hover:shadow-michigan">
                <CardContent className="flex flex-col p-8">
                  <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${tile.iconBg}`}>
                    <tile.icon className={`h-6 w-6 ${tile.iconColor}`} aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{tile.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground flex-1">
                    {tile.description}
                  </p>
                  <Button
                    variant="ghost"
                    className="mt-5 w-fit px-0 text-primary hover:bg-transparent hover:text-primary/80"
                    asChild
                  >
                    <Link to={tile.href}>
                      {t("access.cta")}
                      <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CoreAccessGrid;
