import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface DownloadCountyGuideProps {
  county: string;
}

export default function DownloadCountyGuide({ county }: DownloadCountyGuideProps) {
  const handlePrint = () => {
    // Use the browser's native print dialog which supports Save as PDF
    window.print();
  };

  return (
    <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
      <Download className="h-4 w-4" />
      Download County Guide (PDF)
    </Button>
  );
}
