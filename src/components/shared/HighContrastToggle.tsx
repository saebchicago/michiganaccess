import { useState, useEffect } from "react";
import { Contrast } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const HighContrastToggle = () => {
  const { t } = useTranslation();
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem("high-contrast") === "true";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", highContrast);
    localStorage.setItem("high-contrast", String(highContrast));
  }, [highContrast]);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9"
      onClick={() => setHighContrast(!highContrast)}
      aria-label={t("accessibility.highContrast")}
      title={t("accessibility.highContrast")}
    >
      <Contrast className="h-4 w-4" />
    </Button>
  );
};

export default HighContrastToggle;
