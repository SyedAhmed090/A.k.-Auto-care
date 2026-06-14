import type { Metadata } from "next";
import { getProducts } from "@/lib/products";
import ShopClient from "./ShopClient";

export const metadata: Metadata = {
  title: "Shop Car Care Products",
  description:
    "Browse our full range of professional detailing products — polishes, coatings, waxes, and more. Delivered across Pakistan.",
};

export const revalidate = 60;

export default async function ShopPage() {
  const allProducts = await getProducts();
  return <ShopClient allProducts={allProducts} />;
}
