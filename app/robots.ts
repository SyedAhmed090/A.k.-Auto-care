import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/order-confirmation", "/api/"] },
    sitemap: "https://akautocareuk.com/sitemap.xml",
  };
}
