import { getFeaturedProducts } from "@/lib/products";
import HomeClient from "./HomeClient";

export default async function Page() {
  const featured = await getFeaturedProducts();
  return <HomeClient featured={featured} />;
}
