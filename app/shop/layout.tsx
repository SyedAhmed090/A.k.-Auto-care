import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse our full lineup of pro-grade car care products — foam soaps, ceramic coatings, polishes, waxes, and detailing kits.",
  openGraph: {
    title: "Shop | A.K. Auto Care",
    description: "Browse our full lineup of pro-grade car care products.",
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
