import type { Metadata } from "next";
import { DM_Serif_Display, Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MobileHeader } from "@/components/layout/mobile-header";
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
  title: "PocketPilot — Manage Money Across Currencies",
  description: "Track spending, convert currencies, and stay on budget wherever you are. PocketPilot keeps your finances clear in any currency.",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "PocketPilot — Manage Money Across Currencies",
    description: "Track spending, convert currencies, and stay on budget wherever you are. PocketPilot keeps your finances clear in any currency.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "PocketPilot app — a compass icon on a dark teal background",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PocketPilot — Manage Money Across Currencies",
    description: "Track spending, convert currencies, and stay on budget wherever you are. PocketPilot keeps your finances clear in any currency.",
    images: ["/opengraph-image.png"],
  },
  manifest: "/manifest.json",
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
          <MobileHeader />
          <main className="flex-1 overflow-auto">
            {/*
             * pt uses an inline style rather than a Tailwind arbitrary value
             * because env(safe-area-inset-top) must be resolved at runtime.
             * 96px  = MobileHeader visual height
             * 1.5rem = breathing room below the header
             * env()  = notch / dynamic island height (0 on non-notched devices)
             * md: overrides both values back to normal desktop padding.
             */}
            <div
              className="mx-auto max-w-6xl px-4 pb-20 md:px-8 md:pt-6 md:pb-6"
              style={{
                paddingTop: "calc(96px + 1.5rem + env(safe-area-inset-top))",
              }}
            >
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
