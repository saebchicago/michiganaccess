import { useState, useCallback, useEffect } from "react";

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

export function useResourceChecklist(pathwayId: string) {
  const [checkedIds, setCheckedIds] = useState<string[]>(() => {
    return loadChecked()[pathwayId] || [];
  });

  useEffect(() => {
    const all = loadChecked();
    all[pathwayId] = checkedIds;
    saveChecked(all);
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

  return { items, toggle, completed, total, percent };
}
