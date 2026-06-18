import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProducts, getProductBySlug, getRelatedProducts, getProductsBySlugs } from "@/lib/products";
import { getSystemForProduct } from "@/data/bundles";
import { getCategoryBySlug } from "@/data/categories";
import type { SystemStepView } from "@/components/product/CompleteSystem";
import ProductPageClient from "./ProductPageClient";

export const revalidate = 3600;

const BASE_URL = "https://www.akautocare.pk";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Product Not Found', robots: { index: false, follow: false } };
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.tagline,
      images: product.images[0]
        ? [
            {
              url: product.images[0].startsWith("http")
                ? product.images[0]
                : `${BASE_URL}${product.images[0]}`,
              width: 1200,
              height: 630,
              alt: product.name,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.tagline,
      images: product.images[0]
        ? [
            {
              url: product.images[0].startsWith("http")
                ? product.images[0]
                : `${BASE_URL}${product.images[0]}`,
              alt: product.name,
            },
          ]
        : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  // Determine companion slugs synchronously so we can fetch everything in parallel.
  const sys = getSystemForProduct(product.slug);
  const companionSlugs = sys?.steps.filter((s) => !s.isCurrent).map((s) => s.slug) ?? [];

  // getRelatedProducts and getProductsBySlugs are independent — run in parallel.
  const [related, companions] = await Promise.all([
    getRelatedProducts(product),
    getProductsBySlugs(companionSlugs), // returns [] immediately when slugs is empty
  ]);

  let systemView: { name: string; description: string; steps: SystemStepView[] } | null = null;
  if (sys) {
    const steps = sys.steps
      .map((s) => ({
        step: s.step,
        note: s.note,
        isCurrent: s.isCurrent,
        product: s.isCurrent ? product : companions.find((c) => c.slug === s.slug) ?? null,
      }))
      .filter((s): s is SystemStepView => s.product !== null);
    if (steps.length > 1) {
      systemView = { name: sys.system.name, description: sys.system.description, steps };
    }
  }

  const category = getCategoryBySlug(product.categorySlug);
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${BASE_URL}/shop` },
      ...(category
        ? [{ "@type": "ListItem", position: 3, name: category.name, item: `${BASE_URL}/categories/${product.categorySlug}` }]
        : []),
      { "@type": "ListItem", position: category ? 4 : 3, name: product.name, item: `${BASE_URL}/products/${product.slug}` },
    ],
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    brand: { "@type": "Brand", name: "A.K. Auto Care" },
    offers: {
      "@type": "Offer",
      url: `${BASE_URL}/products/${product.slug}`,
      priceCurrency: "PKR",
      price: product.price,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "A.K. Auto Care" },
    },
    ...(product.reviews > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            ratingCount: product.reviews,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  return (
    <>
      {/* S-15: Safe — productSchema and breadcrumbSchema are developer-controlled
          objects built from DB product fields and serialized via JSON.stringify,
          which escapes all HTML-special characters. No raw user HTML is injected. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProductPageClient product={product} related={related} systemView={systemView} />
    </>
  );
}
