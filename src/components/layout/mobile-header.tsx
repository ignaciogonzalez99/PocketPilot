"use client";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function MobileHeader() {
  return (
    /*
     * pt-safe-header pushes the visual content down by env(safe-area-inset-top)
     * so the banner image fills behind the notch/dynamic island while text
     * and controls always land in the visible area below it.
     * The outer element is intentionally NOT "relative" — fixed elements are
     * their own containing block and the Image fill prop works correctly.
     */
    <header className="fixed top-0 left-0 right-0 z-40 h-[96px] pt-safe-header flex md:hidden overflow-hidden">
      <Image src="/banner.png" alt="PocketPilot" fill priority className="object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 flex items-end justify-between">
        <div className="flex flex-col">
          <span className="font-serif text-xl font-normal text-white leading-tight">PocketPilot</span>
          <span className="text-[10px] text-white/70 font-sans">Your money, wherever it is. Clear.</span>
        </div>
        {/* Scrim ensures the toggle is readable over any banner image */}
        <div className="bg-black/25 rounded-lg p-0.5 backdrop-blur-sm">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
