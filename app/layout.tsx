import type { Metadata } from "next";
import { Anton, Hanken_Grotesk, Space_Mono } from "next/font/google";
import { Truck } from "lucide-react";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MiniCart from "@/components/layout/MiniCart";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import CookieConsent from "@/components/ui/CookieConsent";
import MetaPixel from "@/components/analytics/MetaPixel";

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

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "A.K. Auto Care",
  url: "https://www.akautocare.pk",
  logo: "https://www.akautocare.pk/logo.png",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+92-300-0000000",
    contactType: "customer service",
    areaServed: "PK",
    availableLanguage: ["English", "Urdu"],
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Karachi",
    addressCountry: "PK",
  },
};

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${anton.variable} ${hanken.variable} ${spaceMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
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
          className="fixed top-0 left-0 right-0 z-[60] w-full text-center py-2 px-4 text-[.7rem] font-semibold tracking-[.08em] h-9 flex items-center justify-center"
          style={{ background: "var(--accent)", color: "#000", fontFamily: "var(--font-space-mono)" }}
        >
          <Truck className="inline w-3.5 h-3.5 -mt-0.5 mr-1" /> Free delivery on orders over Rs 5,000 · Ships via TCS &amp; Leopards · Cash on Delivery available
        </div>
        <Header />
        <MiniCart />
        <main className="flex-1 pt-[114px]">{children}</main>
        <Footer />
        <WhatsAppButton />
        <CookieConsent />
      </body>
    </html>
  );
}
