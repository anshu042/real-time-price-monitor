import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://shopalert.vercel.app";
const author = "Anshu Kushwaha";
const githubUrl = "https://github.com/anshu042";
const repoUrl = "https://github.com/anshu042/real-time-price-monitor";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ShopAlert - Real-Time E-Commerce Price Tracker by Anshu Kushwaha",
    template: "%s | ShopAlert",
  },
  description:
    "ShopAlert is a real-time e-commerce price tracker built by Anshu Kushwaha. Monitor product prices across online stores, view price history, and get instant email alerts when prices drop. Built with Next.js, Supabase and Firecrawl.",
  applicationName: "ShopAlert",
  authors: [{ name: author, url: githubUrl }],
  creator: author,
  publisher: author,
  category: "technology",
  keywords: [
    "Anshu Kushwaha",
    "Anshu Kushwaha projects",
    "Anshu Kushwaha portfolio",
    "Anshu Kushwaha GitHub",
    "anshu042",
    "anshu042 GitHub",
    "ShopAlert",
    "price tracker",
    "real time price monitor",
    "price drop alerts",
    "e-commerce price tracking",
    "product price history",
    "Next.js price tracker",
    "Supabase project",
    "Firecrawl scraping",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "ShopAlert",
    title: "ShopAlert - Real-Time E-Commerce Price Tracker by Anshu Kushwaha",
    description:
      "Track e-commerce product prices in real time and get instant alerts when they drop. An open-source Next.js and Supabase project by Anshu Kushwaha (@anshu042).",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShopAlert - Real-Time E-Commerce Price Tracker by Anshu Kushwaha",
    description:
      "Track e-commerce product prices in real time and get instant alerts when they drop. Built by Anshu Kushwaha (@anshu042).",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${siteUrl}/#author`,
      name: author,
      alternateName: "anshu042",
      url: githubUrl,
      sameAs: [githubUrl, repoUrl],
      jobTitle: "Software Developer",
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "ShopAlert",
      description:
        "Real-time e-commerce price tracker with price history and instant price-drop alerts.",
      inLanguage: "en",
      author: { "@id": `${siteUrl}/#author` },
      creator: { "@id": `${siteUrl}/#author` },
      publisher: { "@id": `${siteUrl}/#author` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#app`,
      name: "ShopAlert",
      url: siteUrl,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web browser",
      description:
        "ShopAlert monitors e-commerce product prices in real time, records price history, and sends email alerts when a tracked product drops in price.",
      author: { "@id": `${siteUrl}/#author` },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/*
          Rendered inside <body> on purpose: declaring a manual <head> closes
          the head early and pushes Next's streamed metadata into the body,
          which breaks meta-description detection. JSON-LD is valid anywhere
          in the document.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="bottom-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
