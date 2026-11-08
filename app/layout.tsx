import type { Metadata } from "next";
import { Anek_Bangla, Fraunces, Manrope } from "next/font/google";

import { CartProvider } from "@/components/cart/cart-provider";
import { MotionProvider } from "@/components/motion/motion-provider";

import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const anekBangla = Anek_Bangla({
  subsets: ["bengali"],
  variable: "--font-anek-bangla",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bengalot.com"),
  title: {
    default: "Bengalot — Bring a lot to learning.",
    template: "%s · Bengalot",
  },
  description:
    "Notion templates, printed study cards, printable planners and quiet focus tools for students and independent learners in Bangladesh.",
  applicationName: "Bengalot",
  keywords: [
    "Bengalot",
    "study cards",
    "Notion templates",
    "study planner",
    "flashcards Bangladesh",
    "student productivity",
  ],
  openGraph: {
    title: "Bengalot — Bring a lot to learning.",
    description:
      "Thoughtful tools for study, focus and the long game. Made in Bangladesh.",
    siteName: "Bengalot",
    locale: "en_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bengalot — Bring a lot to learning.",
    description:
      "Thoughtful tools for study, focus and the long game. Made in Bangladesh.",
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: "#ffffff",
  colorScheme: "light" as const,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${manrope.variable} ${anekBangla.variable}`}
    >
      <body>
        <MotionProvider>
          <CartProvider>{children}</CartProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
