import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, Search, MapPin, Heart, ArrowLeft } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

const SUGGESTED_LINKS = [
  { label: "Find Care Near You", href: "/find-care", icon: Heart },
  { label: "Community Resources", href: "/resources", icon: MapPin },
  { label: "Health Data Dashboard", href: "/data", icon: Search },
  { label: "Return Home", href: "/", icon: Home },
];

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <div className="container max-w-2xl py-16 md:py-24 text-center space-y-6">
        <div className="text-6xl font-bold text-primary/20 tabular-nums">404</div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Page Not Found
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          We couldn't find <code className="text-sm bg-muted px-1.5 py-0.5 rounded font-mono">{location.pathname}</code>.
          It may have been moved or doesn't exist.
        </p>

        <div className="grid gap-3 sm:grid-cols-2 max-w-lg mx-auto pt-4">
          {SUGGESTED_LINKS.map((link) => (
            <Button key={link.href} variant="outline" className="gap-2 justify-start" asChild>
              <Link to={link.href}>
                <link.icon className="h-4 w-4 text-primary" />
                {link.label}
              </Link>
            </Button>
          ))}
        </div>

        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => window.history.back()}>
          <ArrowLeft className="h-3.5 w-3.5" />
          Go back
        </Button>
      </div>
    </Layout>
  );
};

export default NotFound;
