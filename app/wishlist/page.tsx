import type { Metadata } from "next";
import WishlistClient from "./WishlistClient";

export const metadata: Metadata = {
  title: "My Wishlist",
  description: "Products you've saved at A.K. Auto Care.",
  robots: "noindex",
};

export default function WishlistPage() {
  return <WishlistClient />;
}
