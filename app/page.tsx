import { getFeaturedProducts, getNewArrivals } from "@/lib/products";
import HomeClient from "./HomeClient";

export const revalidate = 60;

export default async function Page() {
  const [featured, newArrivals] = await Promise.all([
    getFeaturedProducts(),
    getNewArrivals(8),
  ]);
  return <HomeClient featured={featured} newArrivals={newArrivals} />;
}
