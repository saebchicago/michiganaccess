import { ExternalLink } from "lucide-react";

interface Props {
  agency: string;
  year?: number | string;
  url?: string;
  className?: string;
}

export default function SourceAttribution({ agency, year, url, className = "" }: Props) {
  const text = year ? `Source: ${agency} (${year})` : `Source: ${agency}`;

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener"
        className={`text-[10px] text-muted-foreground hover:text-primary inline-flex items-center gap-0.5 ${className}`}
      >
        {text} <ExternalLink className="h-2 w-2" />
      </a>
    );
  }

  return <span className={`text-[10px] text-muted-foreground ${className}`}>{text}</span>;
}
