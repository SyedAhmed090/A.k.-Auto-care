import type { Metadata } from "next";
import { Anton, Hanken_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MiniCart from "@/components/layout/MiniCart";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

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

export const metadata: Metadata = {
  title: {
    default: "A.K. Auto Care — Precision Car Care",
    template: "%s | A.K. Auto Care",
  },
  description:
    "Pro-grade surface science. Prep, correct, coat, protect. Engineered car care products trusted by Pakistani detailers who refuse to settle.",
  keywords: ["car detailing Pakistan", "ceramic coating Karachi", "car wax Pakistan", "paint correction", "auto care"],
  openGraph: {
    title: "A.K. Auto Care — Precision Car Care",
    description: "Pro-grade surface science. Prep, correct, coat, protect.",
    type: "website",
    locale: "en_PK",
    siteName: "A.K. Auto Care",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${anton.variable} ${hanken.variable} ${spaceMono.variable}`}>
      <body className="min-h-screen flex flex-col">
        {/* Announcement bar */}
        <div
          className="w-full text-center py-2 px-4 text-[.7rem] font-semibold tracking-[.08em]"
          style={{ background: "var(--accent)", color: "#000", fontFamily: "var(--font-space-mono)" }}
        >
          🚚 Free delivery on orders over Rs 5,000 · Ships via TCS &amp; Leopards · Cash on Delivery available
        </div>
        <Header />
        <MiniCart />
        <main className="flex-1 pt-[78px]">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
