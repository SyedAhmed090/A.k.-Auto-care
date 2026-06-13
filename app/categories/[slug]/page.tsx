import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/data/categories";
import categories from "@/data/categories";
import { getProductsByCategory } from "@/lib/products";
import CategoryPageClient from "./CategoryPageClient";

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
    title: `${category.name} | A.K. Auto Care`,
    description: category.description,
    openGraph: {
      title: `${category.name} | A.K. Auto Care`,
      description: category.description,
      images: category.image ? [{ url: category.image }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.name} | A.K. Auto Care`,
      description: category.description,
      images: category.image ? [category.image] : [],
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
