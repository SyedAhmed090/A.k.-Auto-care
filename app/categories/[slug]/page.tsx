import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/data/categories";
import categories from "@/data/categories";
import { getProductsByCategory } from "@/lib/products";
import CategoryPageClient from "./CategoryPageClient";

const BASE_URL = "https://www.akautocare.pk";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description,
    openGraph: {
      title: category.name,
      description: category.description,
      images: category.image
        ? [
            {
              url: category.image.startsWith("http")
                ? category.image
                : `${BASE_URL}${category.image}`,
              width: 1200,
              height: 630,
              alt: category.name,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: category.name,
      description: category.description,
      images: category.image
        ? [
            {
              url: category.image.startsWith("http")
                ? category.image
                : `${BASE_URL}${category.image}`,
              alt: category.name,
            },
          ]
        : [],
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();
  const products = await getProductsByCategory(slug);
  return <CategoryPageClient category={category} products={products} />;
}
