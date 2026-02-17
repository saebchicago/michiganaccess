import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, CheckCircle2, Circle, ExternalLink } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useResourceChecklist } from "@/hooks/useResourceChecklist";

interface Props {
  pathwayId: string;
  pathwayTitle: string;
  color: string;
}

export default function ResourceChecklist({ pathwayId, pathwayTitle, color }: Props) {
  const [open, setOpen] = useState(false);
  const { items, toggle, completed, total, percent } = useResourceChecklist(pathwayId);

  if (total === 0) return null;

  return (
    <div className="w-full">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 text-left text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        aria-expanded={open}
      >
        <Progress value={percent} className="h-1.5 flex-1" />
        <span className="whitespace-nowrap tabular-nums">
          {completed}/{total}
        </span>
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <ul className="mt-2 space-y-1" role="list" aria-label={`${pathwayTitle} checklist`}>
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-2">
                  <button
                    onClick={() => toggle(item.id)}
                    className="flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
                    aria-label={item.checked ? `Uncheck: ${item.label}` : `Check: ${item.label}`}
                  >
                    {item.checked ? (
                      <CheckCircle2 className={`h-3.5 w-3.5 ${color}`} />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-muted-foreground/50" />
                    )}
                  </button>
                  <Link
                    to={item.href}
                    className={`text-[11px] transition-colors hover:underline flex items-center gap-1 ${
                      item.checked ? "text-muted-foreground line-through" : "text-foreground"
                    }`}
                  >
                    {item.label}
                    <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover:opacity-50" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
