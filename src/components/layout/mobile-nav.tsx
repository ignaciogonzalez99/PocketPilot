"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  Repeat,
  Tag,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Home", shortLabel: "Home", icon: LayoutDashboard },
  { href: "/accounts", label: "Accounts", shortLabel: "Accts", icon: Wallet },
  { href: "/expenses", label: "Expenses", shortLabel: "Spend", icon: Receipt },
  { href: "/recurring", label: "Recurring", shortLabel: "Recur", icon: Repeat },
  { href: "/categories", label: "Categories", shortLabel: "Cats", icon: Tag },
  { href: "/settings", label: "Settings", shortLabel: "Setup", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-border bg-card/95 backdrop-blur-sm safe-area-bottom">
      {navItems.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] text-[10px] min-[400px]:text-[11px] font-medium transition-colors active:scale-95 min-w-0",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <span
              className={cn(
                "flex items-center justify-center rounded-full w-8 h-7 transition-colors",
                isActive ? "bg-primary/12" : "bg-transparent"
              )}
            >
              <item.icon className="h-5 w-5" />
            </span>
            <span className="truncate max-w-full">
              <span className="hidden min-[400px]:inline">{item.label}</span>
              <span className="inline min-[400px]:hidden">{item.shortLabel}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
