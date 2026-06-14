import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/order-confirmation", "/api/", "/admin", "/checkout", "/cart"] },
    sitemap: "https://www.akautocare.pk/sitemap.xml",
  };
}
