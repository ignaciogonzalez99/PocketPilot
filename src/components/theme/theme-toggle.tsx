"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

const themes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className={cn("flex items-center gap-1 rounded-full bg-muted p-1", className)}>
        {themes.map((t) => (
          <div key={t.value} className="h-7 w-7 sm:h-8 sm:w-8 rounded-full" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1 rounded-full bg-muted p-1", className)}>
      {themes.map((t) => {
        const isActive = theme === t.value;
        return (
          <button
            key={t.value}
            onClick={() => setTheme(t.value)}
            className={cn(
              "relative flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full transition-all",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={t.label}
            title={t.label}
          >
            <t.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        );
      })}
    </div>
  );
}

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {themes.map((t) => (
          <div key={t.value} className="h-20 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {themes.map((t) => {
        const isActive = theme === t.value;
        return (
          <button
            key={t.value}
            onClick={() => setTheme(t.value)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-lg border-2 p-3 sm:p-4 transition-all",
              isActive
                ? "border-primary bg-primary/5 text-foreground"
                : "border-border hover:border-muted-foreground/30 text-muted-foreground hover:text-foreground"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full transition-colors",
                isActive ? "bg-primary/10" : "bg-muted"
              )}
            >
              <t.icon className={cn("h-5 w-5 sm:h-6 sm:w-6", isActive && "text-primary")} />
            </div>
            <span className="text-xs sm:text-sm font-medium">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
