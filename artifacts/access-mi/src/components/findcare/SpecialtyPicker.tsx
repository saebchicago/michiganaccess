import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Check } from "lucide-react";
import { SPECIALTY_GROUPS } from "@/data/findhelp-specialties";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function SpecialtyPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedLabel = useMemo(() => {
    for (const g of SPECIALTY_GROUPS) {
      const found = g.items.find((i) => i.value === value);
      if (found) return found.label;
    }
    return "";
  }, [value]);

  const filteredGroups = useMemo(() => {
    if (!filter) return SPECIALTY_GROUPS;
    const q = filter.toLowerCase();
    return SPECIALTY_GROUPS.map((g) => ({
      ...g,
      items: g.items.filter((i) => i.label.toLowerCase().includes(q) || i.value.toLowerCase().includes(q)),
    })).filter((g) => g.items.length > 0);
  }, [filter]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

  return (
    <div ref={containerRef} className="relative w-full">
      <label htmlFor="specialty-picker" className="sr-only">Choose a specialty</label>
      <button
        id="specialty-picker"
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-4 text-left text-sm transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          !value && "text-muted-foreground"
        )}
        aria-expanded={open}
      >
        <span className="truncate">{selectedLabel || "Choose a specialty…"}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg"
          >
            <div className="border-b border-border p-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Type to filter specialties…"
                  className="h-9 w-full rounded-md bg-muted/50 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground"
                  aria-label="Filter specialties"
                />
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto p-1">
              {filteredGroups.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">No matching specialties</p>
              ) : (
                filteredGroups.map((group) => (
                  <div key={group.label}>
                    <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{group.label}</p>
                    {group.items.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => { onChange(item.value); setOpen(false); setFilter(""); }}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted",
                          item.value === value && "bg-primary/10 text-primary font-medium"
                        )}
                      >
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.value === value && <Check className="h-3.5 w-3.5 text-primary" />}
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
