import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  salary: number;
  cityA: string;
  cityB: string;
  taxA: number;
  taxB: number;
  keepA: number;
  keepB: number;
}

export default function ComparisonShareCard({ salary, cityA, cityB, taxA, taxB, keepA, keepB }: Props) {
  const [copied, setCopied] = useState(false);
  const diff = Math.abs(keepA - keepB);
  const winner = keepA > keepB ? cityA : cityB;

  const text = `Michigan Tax Comparison\n$${salary.toLocaleString()} salary\n${cityA}: $${taxA.toLocaleString()} tax → keep $${keepA.toLocaleString()}\n${cityB}: $${taxB.toLocaleString()} tax → keep $${keepB.toLocaleString()}\nSave $${diff.toLocaleString()}/yr in ${winner}\naccessmi.org/tax-comparison`;

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 max-w-sm space-y-2 text-center">
      <p className="text-[10px] text-muted-foreground font-mono">accessmi.org</p>
      <p className="text-lg font-bold text-foreground">${salary.toLocaleString()} salary</p>
      <p className="text-sm text-muted-foreground">{cityA} vs {cityB}</p>
      <div className="grid grid-cols-2 gap-2 text-center">
        <div><p className="text-xs text-muted-foreground">Tax</p><p className="text-sm font-semibold">${taxA.toLocaleString()}</p></div>
        <div><p className="text-xs text-muted-foreground">Tax</p><p className="text-sm font-semibold">${taxB.toLocaleString()}</p></div>
        <div><p className="text-xs text-muted-foreground">Keep</p><p className="text-sm font-bold text-primary">${keepA.toLocaleString()}</p></div>
        <div><p className="text-xs text-muted-foreground">Keep</p><p className="text-sm font-bold text-primary">${keepB.toLocaleString()}</p></div>
      </div>
      <p className="text-xs font-semibold text-michigan-forest-deep">Save ${diff.toLocaleString()}/yr in {winner}</p>
      <Button variant="outline" size="sm" className="text-xs gap-1 w-full" onClick={handleCopy}>
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        {copied ? "Copied!" : "Copy to share"}
      </Button>
    </div>
  );
}
