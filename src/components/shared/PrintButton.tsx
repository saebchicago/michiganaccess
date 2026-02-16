import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

const PrintButton = () => (
  <Button
    variant="ghost"
    size="sm"
    className="print:hidden fixed bottom-20 right-4 z-40 rounded-full shadow-lg bg-card border border-border hover:bg-secondary"
    onClick={() => window.print()}
    aria-label="Print or save as PDF"
  >
    <Printer className="h-4 w-4 mr-1.5" />
    <span className="hidden sm:inline text-xs">Print / PDF</span>
  </Button>
);

export default PrintButton;
