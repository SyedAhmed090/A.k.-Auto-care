import { getProducts } from "@/lib/products";
import ShopClient from "./ShopClient";

export default async function ShopPage() {
  const allProducts = await getProducts();
  return <ShopClient allProducts={allProducts} />;
}
