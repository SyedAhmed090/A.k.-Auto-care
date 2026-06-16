import type { Metadata } from "next";
import { getProducts } from "@/lib/products";
import CartClient from "./CartClient";

export const metadata: Metadata = {
  title: "Your Cart",
  robots: { index: false, follow: false },
};

export const revalidate = 60;

export default async function CartPage() {
  const allProducts = await getProducts();
  return <CartClient allProducts={allProducts} />;
}
