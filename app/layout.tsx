import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Cormorant_Garamond, Hind_Siliguri, Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/lib/providers";
import { Analytics } from "@/components/site/analytics";
import { MetaPixelPageViews } from "@/components/site/meta-pixel-pageviews";
import { SITE } from "@/lib/constants";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const hind = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-hind",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Bengalot — Premium Fashion from Bengal",
    template: "%s · Bengalot",
  },
  description: SITE.description,
  keywords: [
    "Bengalot",
    "premium fashion Bangladesh",
    "jamdani saree",
    "panjabi",
    "kurti",
    "jute bag",
    "leather sneaker",
    "cash on delivery",
  ],
  authors: [{ name: "Bengalot" }],
  creator: "Bengalot",
  publisher: "Bengalot",
  applicationName: "Bengalot",
  category: "shopping",
  openGraph: {
    type: "website",
    locale: "en_BD",
    url: SITE.url,
    siteName: "Bengalot",
    title: "Bengalot — Premium Fashion from Bengal",
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Bengalot — Premium Fashion from Bengal",
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "var(--color-ivory)",
};

const bootScript = `(function(){try{document.documentElement.classList.remove('dark');localStorage.removeItem('bengalot-theme');var l=localStorage.getItem('bengalot-locale');if(l==='bn'){document.documentElement.lang='bn'}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${jakarta.variable} ${hind.variable}`}
    >
      <head>
        <Script
          id="bengalot-boot"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: bootScript }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <Analytics />
        <MetaPixelPageViews />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
