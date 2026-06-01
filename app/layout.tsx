import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MiniCart from "@/components/layout/MiniCart";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "A.K. Auto Care — Professional Car Detailing Products",
    template: "%s | A.K. Auto Care",
  },
  description:
    "Professional-grade car care and detailing products. Ceramic coatings, polishes, waxes, and cleaning solutions for enthusiasts who demand the best.",
  keywords: [
    "car detailing",
    "ceramic coating",
    "car wax",
    "paint polish",
    "auto care",
    "car cleaning",
  ],
  openGraph: {
    title: "A.K. Auto Care — Professional Car Detailing Products",
    description:
      "Professional-grade car care and detailing products for enthusiasts.",
    type: "website",
    locale: "en_GB",
    siteName: "A.K. Auto Care",
  },
  twitter: {
    card: "summary_large_image",
    title: "A.K. Auto Care",
    description: "Professional car detailing products.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-white text-[#0f0f0f] antialiased">
        <Header />
        <MiniCart />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
