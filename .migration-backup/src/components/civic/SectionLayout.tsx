import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SectionLayoutProps {
  title: string;
  description?: string;
  /** Renders at the top-right, e.g. a ModeToggle */
  headerRight?: ReactNode;
  children: ReactNode;
  id?: string;
  className?: string;
  /** Heading level: defaults to h2 */
  as?: "h2" | "h3";
}

export default function SectionLayout({
  title,
  description,
  headerRight,
  children,
  id,
  className,
  as: Heading = "h2",
}: SectionLayoutProps) {
  const headingId = id ? `${id}-heading` : undefined;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("space-y-4", className)}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <Heading
            id={headingId}
            className={cn(
              "font-bold text-foreground",
              Heading === "h2" ? "text-xl" : "text-lg",
            )}
          >
            {title}
          </Heading>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        {headerRight && <div className="shrink-0">{headerRight}</div>}
      </div>
      {children}
    </section>
  );
}
