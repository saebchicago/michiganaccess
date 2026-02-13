import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs = ({ items }: BreadcrumbsProps) => (
  <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
    <Link to="/" className="flex items-center gap-1 hover:text-primary transition-colors">
      <Home className="h-3 w-3" />
      <span>Home</span>
    </Link>
    {items.map((item, i) => (
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

export default Breadcrumbs;
