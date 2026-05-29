import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

import { CartProvider } from "./context/Cartcontext";
import { ThemeProvider } from "./context/Themecontext";
import Preloader from "./context/preloader";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://autobridge.com.ng";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: "AutoBridge Commerce — Africa's Global Trade Marketplace",
    template: "%s | AutoBridge Commerce",
  },
  description:
    "Buy, sell, export and ship African agro products, packaged foods, fashion prints, and auto parts globally. AutoBridge Commerce connects African producers, exporters, and global buyers through one AI-powered marketplace and DHL-integrated fulfillment infrastructure.",

  keywords: [
    "AutoBridge",
    "African agro marketplace",
    "export agro products Nigeria",
    "African trade platform",
    "cocoa export Nigeria",
    "cashew export Africa",
    "packaged African foods",
    "Ankara fashion export",
    "auto parts Nigeria",
    "DHL fulfillment Africa",
    "African ecommerce",
    "global trade Africa",
    "agro export Nigeria",
    "African vendors marketplace",
  ],

  authors: [{ name: "AutoBridge NG Limited", url: BASE_URL }],
  creator: "AutoBridge NG Limited",
  publisher: "AutoBridge NG Limited",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_NG",
    url: BASE_URL,
    siteName: "AutoBridge Commerce",
    title: "AutoBridge Commerce — Africa's Global Trade Marketplace",
    description:
      "Buy, sell, export and ship African agro products, packaged foods, fashion prints, and auto parts globally with AI-powered commerce and DHL fulfillment.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AutoBridge Commerce — Africa's Global Trade Marketplace",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: "@autobridgehq",
    creator: "@autobridgehq",
    title: "AutoBridge Commerce — Africa's Global Trade Marketplace",
    description:
      "Buy, sell, export and ship African agro products, packaged foods, fashion prints, and auto parts globally.",
    images: ["/og-image.png"],
  },

  applicationName: "AutoBridge Commerce",
  category: "shopping",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [{ rel: "mask-icon", url: "/safari-pinned-tab.svg" }],
  },

  manifest: "/site.webmanifest",

  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)",  color: "#0B1120" },
    { media: "(prefers-color-scheme: light)", color: "#FF6B35" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AutoBridge NG Limited",
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  description:
    "Africa's AI-powered multi-vendor trade marketplace connecting producers, exporters, wholesalers, and global buyers through one intelligent commerce and DHL-integrated fulfillment infrastructure.",
  sameAs: [
    "https://twitter.com/autobridgehq",
    "https://www.instagram.com/autobridgehq",
    "https://www.linkedin.com/company/autobridge",
    "https://www.facebook.com/autobridgehq",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+2348050338021",
    email: "Operations@autobridge.com.ng",
    contactType: "customer service",
    areaServed: "NG",
    availableLanguage: ["English"],
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "1, Ogunnusi Rd, opposite excellence hotel, Ogba",
    addressLocality: "Lagos",
    postalCode: "100218",
    addressCountry: "NG",
  },
};

const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('ab-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//res.cloudinary.com" />
        <link rel="dns-prefetch" href="//cdn.jsdelivr.net" />
        <meta name="msapplication-TileColor" content="#FF6B35" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>

      <body className="font-dm-sans antialiased">
        <ThemeProvider>
          <Preloader />
          <CartProvider>{children}</CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}