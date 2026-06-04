import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your items, apply promo codes, and proceed to checkout.",
  openGraph: {
    title: "Cart | A.K. Auto Care",
    description: "Review your items and proceed to checkout.",
  },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
