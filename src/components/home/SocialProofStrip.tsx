import { Globe } from "lucide-react";

export default function SocialProofStrip() {
  return (
    <section className="border-y border-border bg-muted/20 py-4">
      <div className="container flex flex-wrap items-center justify-center gap-2 text-center">
        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] text-muted-foreground">
          Designed to be useful for{" "}
          <span className="font-medium text-foreground">health systems</span> ·{" "}
          <span className="font-medium text-foreground">journalists</span> ·{" "}
          <span className="font-medium text-foreground">local governments</span> ·{" "}
          <span className="font-medium text-foreground">residents</span>
        </span>
      </div>
    </section>
  );
}
