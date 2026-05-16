import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "@/hooks/use-toast";

export interface ChecklistItem {
  id: string;
  label: string;
  href: string;
  checked: boolean;
}

export interface PathwayChecklist {
  id: string;
  title: string;
  items: ChecklistItem[];
}

const PATHWAY_ITEMS: Record<string, { label: string; href: string }[]> = {
  uninsured: [
    { label: "Check Medicaid eligibility", href: "/financial-help" },
    { label: "Find a sliding-scale clinic", href: "/find-care" },
    { label: "Explore prescription assistance", href: "/financial-help" },
    { label: "Review Marketplace options", href: "/financial-help" },
    { label: "Locate community health centers", href: "/find-care" },
    { label: "Learn about charity care programs", href: "/financial-help" },
    { label: "Find dental & vision aid", href: "/resources" },
    { label: "Understand your appeal rights", href: "/health/insurance-appeals" },
    { label: "Connect with a navigator", href: "/resources" },
    { label: "Save your county resources", href: "/resources" },
  ],
  caregiver: [
    { label: "Find a support group", href: "/support" },
    { label: "Explore respite care options", href: "/resources" },
    { label: "Check quality ratings for facilities", href: "/quality" },
    { label: "Review home health services", href: "/find-care" },
    { label: "Learn about caregiver tax credits", href: "/financial-help" },
    { label: "Find adult day programs", href: "/resources" },
    { label: "Explore telehealth options", href: "/find-care" },
    { label: "Review Meals on Wheels", href: "/resources" },
    { label: "Understand Medicare benefits", href: "/financial-help" },
    { label: "Connect with Area Agency on Aging", href: "/resources" },
  ],
  "new-resident": [
    { label: "Find a primary care doctor", href: "/find-care" },
    { label: "Explore the Health Map", href: "/health-map" },
    { label: "Check insurance options", href: "/financial-help" },
    { label: "Register to vote", href: "/civic-data" },
    { label: "Find your county services", href: "/resources" },
    { label: "Locate nearby pharmacies", href: "/health-map" },
    { label: "Review school district info", href: "/resources" },
    { label: "Set up utility services", href: "/resources" },
    { label: "Find transportation options", href: "/transportation" },
    { label: "Explore community events", href: "/events" },
  ],
};

const STORAGE_KEY = "mi-access-checklist";
const COMMUNITY_STATS_KEY = "mi-access-community-stats";

// Simulated community stats (seeded + local contributions)
const BASE_COMMUNITY = { uninsured: 2340, caregiver: 1870, "new-resident": 1560 };

function loadChecked(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveChecked(data: Record<string, string[]>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getCommunityCount(pathwayId: string): number {
  try {
    const raw = localStorage.getItem(COMMUNITY_STATS_KEY);
    const stats = raw ? JSON.parse(raw) : {};
    return (BASE_COMMUNITY[pathwayId as keyof typeof BASE_COMMUNITY] || 1000) + (stats[pathwayId] || 0);
  } catch {
    return BASE_COMMUNITY[pathwayId as keyof typeof BASE_COMMUNITY] || 1000;
  }
}

function incrementCommunityCount(pathwayId: string) {
  try {
    const raw = localStorage.getItem(COMMUNITY_STATS_KEY);
    const stats = raw ? JSON.parse(raw) : {};
    stats[pathwayId] = (stats[pathwayId] || 0) + 1;
    localStorage.setItem(COMMUNITY_STATS_KEY, JSON.stringify(stats));
  } catch { /* noop */ }
}

const MILESTONES = [3, 5, 7, 10];
const MILESTONE_MESSAGES: Record<number, { title: string; description: string }> = {
  3: { title: "🎯 Getting Started!", description: "3 steps done — you're building momentum." },
  5: { title: "⭐ Halfway There!", description: "5 steps complete — great progress!" },
  7: { title: "🏅 Almost Done!", description: "7 steps checked — the finish line is close." },
  10: { title: "🏆 Pathway Complete!", description: "All 10 steps done! You're helping build a healthier Michigan." },
};

export function useResourceChecklist(pathwayId: string) {
  const [checkedIds, setCheckedIds] = useState<string[]>(() => {
    return loadChecked()[pathwayId] || [];
  });
  const prevCount = useRef(checkedIds.length);

  useEffect(() => {
    const all = loadChecked();
    all[pathwayId] = checkedIds;
    saveChecked(all);

    // Fire achievement toast on milestone crossing (only when adding)
    const count = checkedIds.length;
    if (count > prevCount.current && MILESTONES.includes(count)) {
      const msg = MILESTONE_MESSAGES[count];
      if (msg) {
        toast({ title: msg.title, description: msg.description });
        if (count === 10) incrementCommunityCount(pathwayId);
      }
    }
    prevCount.current = count;
  }, [checkedIds, pathwayId]);

  const items: ChecklistItem[] = (PATHWAY_ITEMS[pathwayId] || []).map((item, i) => ({
    id: `${pathwayId}-${i}`,
    label: item.label,
    href: item.href,
    checked: checkedIds.includes(`${pathwayId}-${i}`),
  }));

  const toggle = useCallback((itemId: string) => {
    setCheckedIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  }, []);

  const completed = checkedIds.length;
  const total = items.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const communityCount = getCommunityCount(pathwayId);

  return { items, toggle, completed, total, percent, communityCount };
}
