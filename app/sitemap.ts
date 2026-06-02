import { MetadataRoute } from "next";
import products from "@/data/products";
import categories from "@/data/categories";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://akautocare.pk";
  const staticRoutes = ["/", "/shop", "/about", "/contact", "/cart", "/policies/shipping-returns", "/policies/privacy", "/policies/terms"].map(
    (route) => ({ url: `${base}${route}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: route === "/" ? 1 : 0.8 })
  );
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
