import { Badge } from "@/components/ui/badge";

type ResultHeaderProps = {
  label: string;
  count: number;
};

export default function ResultHeader({ label, count }: ResultHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="text-xl font-bold text-foreground">{label}</h2>
      <Badge variant="secondary" className="text-sm tabular-nums">
        {count}
      </Badge>
    </div>
  );
}
