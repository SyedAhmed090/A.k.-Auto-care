import { MetadataRoute } from "next";
import { getProducts } from "@/lib/products";
import categories from "@/data/categories";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://www.akautocare.pk";
  const staticRoutes = ["/", "/shop", "/about", "/contact", "/faq", "/order-tracking", "/policies/shipping", "/policies/returns", "/policies/shipping-returns", "/policies/privacy", "/policies/terms"].map(
    (route) => ({ url: `${base}${route}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: route === "/" ? 1 : 0.8 })
  );
  const products = await getProducts();
  const productRoutes = products.map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));
  const categoryRoutes = categories.map((c) => ({
    url: `${base}/categories/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
