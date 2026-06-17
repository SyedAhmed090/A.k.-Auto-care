import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order with shipping details, payment method, and promo codes.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Checkout | A.K. Auto Care",
    description: "Complete your order securely.",
  },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
