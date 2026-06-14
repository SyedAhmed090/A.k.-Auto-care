import { getFeaturedProducts } from "@/lib/products";
import HomeClient from "./HomeClient";

export const revalidate = 60;

export default async function Page() {
  const featured = await getFeaturedProducts();
  return <HomeClient featured={featured} />;
}
