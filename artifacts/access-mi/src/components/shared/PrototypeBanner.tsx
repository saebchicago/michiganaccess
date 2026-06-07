import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { DATA_SOURCE_DISPLAY } from "@/config/platformConstants";

const STORAGE_KEY = "michigan-access-prototype-banner-dismissed";

export default function PrototypeBanner() {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  const dismiss = () => {
    setDismissed(true);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="border-b border-michigan-sky/20 bg-michigan-sky/10"
        role="banner"
      >
        <div className="container flex items-center gap-3 py-2.5">
          <BarChart3
            className="h-4 w-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <p className="flex-1 text-xs text-foreground leading-relaxed">
            <span className="font-semibold">{t("prototype.title")}</span>{" "}
            {t("prototype.description", { sourceCount: DATA_SOURCE_DISPLAY })}{" "}
            <Link
              to="/methodology"
              className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
            >
              {t("prototype.viewMethodology")}
            </Link>{" "}
            {t("prototype.and")}{" "}
            <Link
              to="/technical"
              className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
            >
              {t("prototype.viewTechnical")}
            </Link>
            .
          </p>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 shrink-0"
            onClick={dismiss}
            aria-label="Dismiss banner"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
