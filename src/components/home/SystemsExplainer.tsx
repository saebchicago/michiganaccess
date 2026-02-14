import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const SystemsExplainer = () => {
  const { t } = useTranslation();

  return (
    <section className="border-y border-border bg-muted/30 py-14 md:py-20" aria-labelledby="systems-heading">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 id="systems-heading" className="text-xl font-semibold text-foreground sm:text-2xl">
            {t("systems.title")}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {t("systems.description")}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default SystemsExplainer;
