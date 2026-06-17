import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  description: "Find the perfect car care product for your needs.",
  robots: { index: false, follow: true },
  openGraph: {
    title: "Search | A.K. Auto Care",
    description: "Find the perfect car care product for your needs.",
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
