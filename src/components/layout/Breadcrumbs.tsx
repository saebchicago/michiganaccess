import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { BASE_URL } from "@/config/site";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  // Filter out any "Home" item that duplicates the auto-prepended Home link
  const filteredItems = items.filter(
    (item, i) => !(i === 0 && item.label.toLowerCase() === "home" && (!item.href || item.href === "/"))
  );

  // Inject BreadcrumbList JSON-LD
  useEffect(() => {
    const id = "breadcrumb-jsonld";
    let script = document.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }

    const itemListElement = [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      ...filteredItems.map((item, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: item.label,
        ...(item.href ? { item: `${BASE_URL}${item.href}` } : { item: `${BASE_URL}${pathname}` }),
      })),
    ];

    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement,
    });

    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, [filteredItems, pathname]);

  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
      <Link to="/" className="flex items-center gap-1 hover:text-primary transition-colors">
        <Home className="h-3 w-3" />
        <span>{t('breadcrumbs.home', 'Home')}</span>
      </Link>
      {filteredItems.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3" />
          {item.href ? (
            <Link to={item.href} className="hover:text-primary transition-colors">{item.label}</Link>
          ) : (
            <span className="font-medium text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
