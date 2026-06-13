import { createAdminClient } from "@/utils/supabase/admin";
import type { Product, Variant } from "@/data/products";

type DbVariant = {
  id: string;
  label: string;
  price: number;
  sku: string;
  sort_order: number;
};

type DbProduct = {
  id: string;
  slug: string;
  name: string;
  category_slug: string;
  tagline: string;
  description: string;
  how_to_use: string;
  specs: { label: string; value: string }[];
  price: number;
  images: string[];
  stock: number | null;
  in_stock: boolean;
  featured: boolean;
  rating: number;
  reviews: number;
  badge: string | null;
  sort_order: number;
  created_at: string;
  product_variants: DbVariant[];
};

const SELECT = `*, product_variants(id, label, price, sku, sort_order)` as const;

function mapProduct(db: DbProduct): Product {
  const variants: Variant[] = (db.product_variants ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((v) => ({ label: v.label, price: v.price, sku: v.sku }));
  return {
    id: db.id,
    slug: db.slug,
    name: db.name,
    categorySlug: db.category_slug,
    tagline: db.tagline,
    description: db.description,
    howToUse: db.how_to_use,
    specs: db.specs ?? [],
    price: db.price,
    variants,
    images: db.images ?? [],
    stock: db.stock ?? undefined,
    inStock: db.in_stock,
    featured: db.featured,
    rating: Number(db.rating),
    reviews: db.reviews,
    badge: db.badge ?? undefined,
    createdAt: db.created_at?.slice(0, 10) ?? "",
  };
}

export async function getProducts(): Promise<Product[]> {
  const sb = createAdminClient();
  const { data } = await sb
    .from("products")
    .select(SELECT)
    .order("sort_order")
    .order("sort_order", { referencedTable: "product_variants" });
  return (data ?? []).map(mapProduct);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const sb = createAdminClient();
  const { data } = await sb
    .from("products")
    .select(SELECT)
    .eq("featured", true)
    .order("sort_order")
    .order("sort_order", { referencedTable: "product_variants" });
  return (data ?? []).map(mapProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const sb = createAdminClient();
  const { data } = await sb
    .from("products")
    .select(SELECT)
    .eq("slug", slug)
    .order("sort_order", { referencedTable: "product_variants" })
    .single();
  return data ? mapProduct(data) : null;
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const sb = createAdminClient();
  const { data } = await sb
    .from("products")
    .select(SELECT)
    .eq("category_slug", categorySlug)
    .order("sort_order")
    .order("sort_order", { referencedTable: "product_variants" });
  return (data ?? []).map(mapProduct);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const sb = createAdminClient();
  const { data } = await sb
    .from("products")
    .select(SELECT)
    .eq("category_slug", product.categorySlug)
    .neq("id", product.id)
    .order("sort_order")
    .limit(limit)
    .order("sort_order", { referencedTable: "product_variants" });
  return (data ?? []).map(mapProduct);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.trim();
  if (!q) return getProducts();
  const sb = createAdminClient();
  const { data } = await sb
    .from("products")
    .select(SELECT)
    .or(`name.ilike.%${q}%,tagline.ilike.%${q}%,description.ilike.%${q}%,category_slug.ilike.%${q}%`)
    .order("sort_order")
    .order("sort_order", { referencedTable: "product_variants" });
  return (data ?? []).map(mapProduct);
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids.length) return [];
  const sb = createAdminClient();
  const { data } = await sb
    .from("products")
    .select(SELECT)
    .in("id", ids)
    .order("sort_order", { referencedTable: "product_variants" });
  return (data ?? []).map(mapProduct);
}
