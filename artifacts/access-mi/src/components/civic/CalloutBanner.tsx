import { cn } from "@/lib/utils";
import { AlertTriangle, Info, AlertCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

export interface CalloutBannerProps {
  variant: "info" | "warning" | "error";
  title: string;
  children: ReactNode;
  /** Optional action button */
  action?: { label: string; href?: string; onClick?: () => void };
  /** If true, cannot be dismissed (for crisis messages) */
  persistent?: boolean;
  className?: string;
}

const variantStyles = {
  info: {
    container: "border-info/30 bg-info/5",
    icon: Info,
    iconClass: "text-info",
  },
  warning: {
    container: "border-warning/30 bg-warning/5",
    icon: AlertTriangle,
    iconClass: "text-warning",
  },
  error: {
    container: "border-destructive/30 bg-destructive/5",
    icon: AlertCircle,
    iconClass: "text-destructive",
  },
};

export default function CalloutBanner({
  variant,
  title,
  children,
  action,
  persistent,
  className,
}: CalloutBannerProps) {
  const styles = variantStyles[variant];

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
      className={cn(
        "rounded-lg border p-4",
        styles.container,
        className,
      )}
    >
      <div className="flex gap-3">
        <styles.icon
          className={cn("h-5 w-5 shrink-0 mt-0.5", styles.iconClass)}
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0 space-y-1.5">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <div className="text-sm text-muted-foreground leading-relaxed">
            {children}
          </div>
          {variant === "error" && (
            <div className="flex flex-wrap gap-2 mt-2 text-xs font-semibold">
              <a href="tel:988" className="inline-flex items-center gap-1 text-destructive hover:underline">
                <Phone className="h-3 w-3" /> 988 Suicide & Crisis
              </a>
              <span className="text-muted-foreground">·</span>
              <a href="tel:211" className="inline-flex items-center gap-1 text-destructive hover:underline">
                <Phone className="h-3 w-3" /> 2-1-1 Michigan
              </a>
              <span className="text-muted-foreground">·</span>
              <a href="sms:741741?body=HOME" className="text-destructive hover:underline">
                Text HOME to 741741
              </a>
            </div>
          )}
          {action && (
            <div className="mt-2">
              {action.href ? (
                <a href={action.href} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="text-xs">
                    {action.label}
                  </Button>
                </a>
              ) : (
                <Button size="sm" variant="outline" className="text-xs" onClick={action.onClick}>
                  {action.label}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
