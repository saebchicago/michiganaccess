import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Hospital, DollarSign, Users, Bus, Leaf, Landmark } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const QuickActions = () => {
  const { t } = useTranslation();

  const actions = [
    {
      icon: Hospital,
      title: t("quickActions.findCare"),
      description: t("quickActions.findCareDesc"),
      href: "/find-care",
      bgClass: "bg-primary/10",
      iconClass: "text-primary",
    },
    {
      icon: Leaf,
      title: t("quickActions.environment"),
      description: t("quickActions.environmentDesc"),
      href: "/environment",
      bgClass: "bg-michigan-forest/10",
      iconClass: "text-michigan-forest",
    },
    {
      icon: Bus,
      title: t("quickActions.transportation"),
      description: t("quickActions.transportationDesc"),
      href: "/transportation",
      bgClass: "bg-michigan-coral/10",
      iconClass: "text-michigan-coral",
    },
    {
      icon: DollarSign,
      title: t("quickActions.financialHelp"),
      description: t("quickActions.financialHelpDesc"),
      href: "/financial-help",
      bgClass: "bg-michigan-gold/10",
      iconClass: "text-michigan-gold",
    },
    {
      icon: Users,
      title: t("quickActions.communityResources"),
      description: t("quickActions.communityResourcesDesc"),
      href: "/resources",
      bgClass: "bg-michigan-sky/10",
      iconClass: "text-michigan-sky",
    },
    {
      icon: Landmark,
      title: t("quickActions.civicData"),
      description: t("quickActions.civicDataDesc"),
      href: "/civic-data",
      bgClass: "bg-michigan-navy/10",
      iconClass: "text-michigan-navy",
    },
  ];

  return (
    <section className="py-16 md:py-20">
      <div className="container">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
        >
          {actions.map((action) => (
            <motion.div key={action.href} variants={item}>
              <Link to={action.href} className="block h-full">
                <Card className="group h-full card-accent-border border-border/50 transition-all duration-300 hover:border-primary/30 hover:shadow-michigan hover:-translate-y-1">
                  <CardContent className="flex flex-col items-start p-6">
                    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${action.bgClass} transition-transform group-hover:scale-110`}>
                      <action.icon className={`h-6 w-6 ${action.iconClass}`} />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">{action.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{action.description}</p>
                    <span className="mt-4 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      {t("quickActions.explore")}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default QuickActions;
