import type { Metadata } from "next";
import { DM_Serif_Display, Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PocketPilot — Your Multi-Currency Finance Tracker",
  description: "Track spending across currencies, set your monthly income, and always know where you stand.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${dmSerifDisplay.variable} antialiased flex min-h-screen`}
      >
        <ThemeProvider>
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <div className="mx-auto max-w-6xl px-4 py-6 pb-20 md:px-8 md:pb-6">
              {children}
            </div>
          </main>
          <MobileNav />
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
