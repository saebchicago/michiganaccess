import { Info } from "lucide-react";

interface OfficialChannelNoticeProps {
  variant?: "full" | "compact";
  className?: string;
}

export function OfficialChannelNotice({
  variant = "full",
  className = "",
}: OfficialChannelNoticeProps) {
  const isCompact = variant === "compact";
  return (
    <aside
      role="note"
      aria-label="Official channel notice"
      className={`rounded-lg border border-border bg-muted/30 ${
        isCompact ? "p-3 text-[11px]" : "p-4 text-xs"
      } text-muted-foreground flex items-start gap-2 ${className}`}
    >
      <Info
        className={`${isCompact ? "h-3.5 w-3.5" : "h-4 w-4"} mt-0.5 shrink-0`}
        aria-hidden="true"
      />
      <p>
        AccessMI is an independent educational resource. It is not affiliated
        with the State of Michigan, any government agency, employer, or health
        system, and it cannot enroll you in any program. To apply for benefits,
        use Michigan's official portal:{" "}
        <a
          href="https://newmibridges.michigan.gov"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          newmibridges.michigan.gov
        </a>
        .
      </p>
    </aside>
  );
}
