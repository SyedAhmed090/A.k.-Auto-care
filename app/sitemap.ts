import { MetadataRoute } from "next";
import { getSitemapProducts } from "@/lib/products";
import { getPosts } from "@/lib/blog";
import categories from "@/data/categories";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://www.akautocare.pk";
  const now = new Date();
  const staticRoutes = ["/", "/shop", "/about", "/contact", "/faq", "/blog", "/order-tracking", "/policies/shipping", "/policies/returns", "/policies/shipping-returns", "/policies/privacy", "/policies/terms"].map(
    (route) => ({ url: `${base}${route}`, lastModified: now, changeFrequency: "monthly" as const, priority: route === "/" ? 1 : 0.8 })
  );

  const products = await getSitemapProducts();
  const productRoutes = products.map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // Each category's <lastmod> is the most recent update among its products, so it
  // only changes when something in that category actually changes.
  const latestByCategory = new Map<string, number>();
  for (const p of products) {
    if (!p.updatedAt) continue;
    const ts = new Date(p.updatedAt).getTime();
    const prev = latestByCategory.get(p.categorySlug) ?? 0;
    if (ts > prev) latestByCategory.set(p.categorySlug, ts);
  }
  const categoryRoutes = categories.map((c) => {
    const latest = latestByCategory.get(c.slug);
    return {
      url: `${base}/categories/${c.slug}`,
      lastModified: latest ? new Date(latest) : now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    };
  });

  const blogRoutes = getPosts().map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
  return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...blogRoutes];
}
