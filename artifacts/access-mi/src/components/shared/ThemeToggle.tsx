import { useState, useEffect } from "react";
import { Sun, Moon, Contrast } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ThemeMode = "light" | "dark" | "high-contrast";

function getStoredTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem("mi-theme");
    if (stored === "dark" || stored === "high-contrast") return stored;
    // Migrate old high-contrast key
    if (localStorage.getItem("high-contrast") === "true") {
      localStorage.setItem("mi-theme", "high-contrast");
      localStorage.removeItem("high-contrast");
      return "high-contrast";
    }
  } catch {}
  return "light";
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  root.classList.remove("dark", "high-contrast");
  if (mode === "dark") root.classList.add("dark");
  else if (mode === "high-contrast") root.classList.add("high-contrast");
}

const ThemeToggle = () => {
  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("mi-theme", theme);
  }, [theme]);

  const icon =
    theme === "dark" ? <Moon className="h-4 w-4" /> :
    theme === "high-contrast" ? <Contrast className="h-4 w-4" /> :
    <Sun className="h-4 w-4" />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Change theme">
          {icon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-50 bg-card border border-border">
        <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2 text-sm cursor-pointer">
          <Sun className="h-4 w-4" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2 text-sm cursor-pointer">
          <Moon className="h-4 w-4" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("high-contrast")} className="gap-2 text-sm cursor-pointer">
          <Contrast className="h-4 w-4" /> High Contrast
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggle;
