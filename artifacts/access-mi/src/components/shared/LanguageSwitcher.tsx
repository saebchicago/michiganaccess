import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// `partial: true` renders an honest "(partial translation)" note: the
// locale files exist but most of the interface is not yet extracted for
// translation, so non-English visitors should know what to expect.
const languages = [
  { code: "en", label: "English" },
  { code: "es", label: "Español", partial: true },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    const dir = code === "ar" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = code;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs font-medium" aria-label="Change language">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{languages.find(l => l.code === i18n.language)?.label || "English"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={i18n.language === lang.code ? "font-semibold text-primary" : ""}
          >
            {lang.label}
            {lang.partial && (
              <span className="ml-1.5 text-[10px] text-muted-foreground">
                (partial translation)
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
