import { Shield, Database, Globe, Lock } from "lucide-react";

export default function PublicTrustBar() {
  const items = [
    {
      icon: Shield,
      label: "Independent civic project",
    },
    {
      icon: Database,
      label: "Built on public data",
    },
    {
      icon: Lock,
      label: "Aggregated analytics only",
    },
    {
      icon: Globe,
      label: "All 83 Michigan counties",
    },
  ];

  return (
    <section className="border-t bg-muted/30 py-6">
      <div className="container">
        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
