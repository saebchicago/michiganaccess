import { Database, GitBranch, Globe, MessageSquare, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const trustItems = [
  {
    icon: Shield,
    label: "Independent civic project",
    href: "/about",
  },
  {
    icon: Database,
    label: "Public-source provenance",
    href: "/data-sources",
  },
  {
    icon: MessageSquare,
    label: "Corrections & feedback",
    href: "/feedback?initial_category=data_accuracy",
  },
  {
    icon: GitBranch,
    label: "Public source code",
    href: "https://github.com/saebchicago/michiganaccess",
    external: true,
  },
  {
    icon: Globe,
    label: "All 83 Michigan counties",
    href: "/regions",
  },
];

export default function PublicTrustBar() {
  return (
    <section
      className="border-t bg-muted/30 py-6"
      aria-label="AccessMI project identity and accountability"
    >
      <div className="container space-y-4">
        <p className="mx-auto max-w-4xl text-center text-xs leading-relaxed text-muted-foreground sm:text-sm">
          <strong className="font-semibold text-foreground">
            AccessMI is an independent Michigan civic-intelligence project.
          </strong>{" "}
          It is not a government agency, health system, benefits administrator,
          or 211 provider.
        </p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
          {trustItems.map((item) => {
            const content = (
              <>
                <item.icon className="h-4 w-4" aria-hidden="true" />
                <span>{item.label}</span>
              </>
            );

            return item.external ? (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {content}
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ) : (
              <Link
                key={item.label}
                to={item.href}
                className="inline-flex items-center gap-2 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
