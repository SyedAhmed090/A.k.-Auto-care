import type { Metadata } from "next";
import { Anton, Hanken_Grotesk, Space_Mono } from "next/font/google";
import { Truck } from "lucide-react";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MiniCart from "@/components/layout/MiniCart";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import CookieConsent from "@/components/ui/DeferredCookieConsent";
// import FirstPurchasePopup from "@/components/ui/FirstPurchasePopup"; // disabled for now
import MetaPixel from "@/components/analytics/MetaPixel";
import { SettingsProvider } from "@/components/providers/SettingsProvider";
import { getSettings, socialLinks } from "@/lib/settings";

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

function buildOrgSchema(store: { whatsapp: string; email: string; address: string; city: string }, social: { href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": "https://www.akautocare.pk/#store",
    name: "A.K. Auto Care",
    description:
      "Pakistan's specialist in pre- and post-paint car care — primers, ceramic coatings, polishes, compounds, and paint protection.",
    url: "https://www.akautocare.pk",
    logo: "https://www.akautocare.pk/logo.png",
    image: "https://www.akautocare.pk/logo.png",
    telephone: `+${store.whatsapp}`,
    email: store.email,
    priceRange: "₨₨",
    currenciesAccepted: "PKR",
    paymentAccepted: "Cash on Delivery, JazzCash, EasyPaisa, Bank Transfer",
    areaServed: { "@type": "Country", name: "Pakistan" },
    address: {
      "@type": "PostalAddress",
      streetAddress: store.address,
      addressLocality: store.city,
      addressCountry: "PK",
    },
    openingHours: "Mo-Sa 10:00-20:00",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: `+${store.whatsapp}`,
      contactType: "customer service",
      areaServed: "PK",
      availableLanguage: ["English", "Urdu"],
    },
    ...(social.length > 0 ? { sameAs: social.map((s) => s.href) } : {}),
  };
}

export const metadata: Metadata = {
  metadataBase: new URL("https://www.akautocare.pk"),
  title: {
    default: "A.K. Auto Care — Precision Car Care",
    template: "%s | A.K. Auto Care",
  },
  description:
    "Pro-grade surface science. Prep, correct, coat, protect. Engineered car care products trusted by Pakistani detailers who refuse to settle.",
  keywords: ["car detailing Pakistan", "ceramic coating Karachi", "car wax Pakistan", "paint correction", "auto care"],
  alternates: { canonical: "/" },
  openGraph: {
    title: "A.K. Auto Care — Precision Car Care",
    description: "Pro-grade surface science. Prep, correct, coat, protect.",
    type: "website",
    locale: "en_PK",
    siteName: "A.K. Auto Care",
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const orgSchema = buildOrgSchema(settings.store, socialLinks(settings.social));
  const freeShipLabel = settings.shipping.freeThreshold.toLocaleString("en-PK");
  return (
    <html lang="en" className={`${anton.variable} ${hanken.variable} ${spaceMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <noscript><style>{`.reveal { opacity: 1 !important; transform: none !important; }`}</style></noscript>
      </head>
      <body className="min-h-screen flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-md focus:font-semibold focus:bg-[var(--accent)] focus:text-black"
        >
          Skip to main content
        </a>
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}
        {META_PIXEL_ID && <MetaPixel />}
        {/* Announcement bar */}
        <div
          className="no-print fixed top-0 left-0 right-0 z-[60] w-full text-center py-2 px-4 text-[.7rem] font-semibold tracking-[.08em] h-9 flex items-center justify-center"
          style={{ background: "var(--accent)", color: "#000", fontFamily: "var(--font-space-mono)" }}
        >
          <Truck className="inline w-3.5 h-3.5 -mt-0.5 mr-1" /> Free delivery on orders over Rs {freeShipLabel} · Ships via TCS &amp; Leopards · Cash on Delivery available
        </div>
        <SettingsProvider value={settings}>
          <Header />
          <MiniCart />
          <main id="main-content" className="flex-1 pt-[var(--header-offset)]">{children}</main>
          <Footer />
          <WhatsAppButton />
          <CookieConsent />
        </SettingsProvider>
        {/* First-purchase popup disabled for now — re-enable by uncommenting. */}
        {/* <FirstPurchasePopup /> */}
      </body>
    </html>
  );
}
