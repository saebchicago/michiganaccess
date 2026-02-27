import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "am-watchlist";

export interface WatchlistItem {
  id: string;
  type: "resource" | "county" | "provider";
  label: string;
  href: string;
  addedAt: number;
}

function load(): WatchlistItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function save(items: WatchlistItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/** Privacy-first localStorage watchlist for starring resources/counties */
export function useWatchlist() {
  const [items, setItems] = useState<WatchlistItem[]>(load);

  // Sync across tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setItems(load());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const toggle = useCallback((item: Omit<WatchlistItem, "addedAt">) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      const next = exists
        ? prev.filter(i => i.id !== item.id)
        : [...prev, { ...item, addedAt: Date.now() }];
      save(next);
      return next;
    });
  }, []);

  const isStarred = useCallback((id: string) => items.some(i => i.id === id), [items]);

  const clear = useCallback(() => {
    setItems([]);
    save([]);
  }, []);

  return { items, toggle, isStarred, clear, count: items.length };
}
