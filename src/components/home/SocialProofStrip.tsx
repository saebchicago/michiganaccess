import { Users } from "lucide-react";

const references = [
  "Michigan Health & Hospital Association",
  "Bridge Michigan",
  "Michigan Municipal League",
];

export default function SocialProofStrip() {
  return (
    <section className="border-y border-border bg-muted/20 py-4">
      <div className="container flex flex-wrap items-center justify-center gap-2 text-center">
        <Users className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] text-muted-foreground">
          Referenced by{" "}
          {references.map((r, i) => (
            <span key={r}>
              <span className="font-medium text-foreground">{r}</span>
              {i < references.length - 1 && " · "}
            </span>
          ))}
        </span>
      </div>
    </section>
  );
}
