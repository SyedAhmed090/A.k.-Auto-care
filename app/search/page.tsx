import { getProducts } from "@/lib/products";
import SearchClient from "./SearchClient";

export default async function SearchPage() {
  const allProducts = await getProducts();
  return <SearchClient allProducts={allProducts} />;
}
