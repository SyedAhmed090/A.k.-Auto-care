import { createAdminClient } from "@/utils/supabase/admin";
import type { Product, Variant } from "@/data/products";

type DbVariant = {
  id: string;
  label: string;
  price: number;
  sku: string;
  sort_order: number;
};

type DbProductCard = {
  id: string;
  slug: string;
  name: string;
  category_slug: string;
  tagline: string;
  price: number;
  images: string[];
  stock: number | null;
  in_stock: boolean;
  featured: boolean;
  rating: number;
  reviews: number;
  badge: string | null;
  sort_order: number;
  product_variants: DbVariant[];
};

type DbProduct = DbProductCard & {
  description: string;
  how_to_use: string;
  specs: { label: string; value: string }[];
  created_at: string;
};

// Card-level select: omits heavy text columns (description, how_to_use, specs)
const SELECT_CARD = `id, slug, name, category_slug, tagline, price, images, stock, in_stock, featured, rating, reviews, badge, sort_order, product_variants(id, label, price, sku, sort_order)` as const;

// Detail-level select: all columns including heavy text fields
const SELECT_DETAIL = `*, product_variants(id, label, price, sku, sort_order)` as const;

function mapVariants(product_variants: DbVariant[]): Variant[] {
  return (product_variants ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((v) => ({ label: v.label, price: v.price, sku: v.sku }));
}

function mapProductCard(db: DbProductCard): Product {
  return {
    id: db.id,
    slug: db.slug,
    name: db.name,
    categorySlug: db.category_slug,
    tagline: db.tagline,
    description: "",
    howToUse: "",
    specs: [],
    price: db.price,
    variants: mapVariants(db.product_variants),
    images: db.images ?? [],
    stock: db.stock ?? undefined,
    inStock: db.in_stock,
    featured: db.featured,
    rating: Number(db.rating),
    reviews: db.reviews,
    badge: db.badge ?? undefined,
    createdAt: "",
  };
}

function mapProduct(db: DbProduct): Product {
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
    variants: mapVariants(db.product_variants),
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
  const { data, error } = await sb
    .from("products")
    .select(SELECT_CARD)
    .order("sort_order")
    .order("sort_order", { referencedTable: "product_variants" });
  if (error) { console.error("[products] getProducts DB error:", error); return []; }
  return (data ?? []).map(mapProductCard);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("products")
    .select(SELECT_CARD)
    .eq("featured", true)
    .order("sort_order")
    .order("sort_order", { referencedTable: "product_variants" });
  if (error) { console.error("[products] getFeaturedProducts DB error:", error); return []; }
  return (data ?? []).map(mapProductCard);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("products")
    .select(SELECT_DETAIL)
    .eq("slug", slug)
    .order("sort_order", { referencedTable: "product_variants" })
    .single();
  if (error) { console.error("[products] getProductBySlug DB error:", error); return null; }
  return data ? mapProduct(data) : null;
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("products")
    .select(SELECT_CARD)
    .eq("category_slug", categorySlug)
    .order("sort_order")
    .order("sort_order", { referencedTable: "product_variants" });
  if (error) { console.error("[products] getProductsByCategory DB error:", error); return []; }
  return (data ?? []).map(mapProductCard);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("products")
    .select(SELECT_CARD)
    .eq("category_slug", product.categorySlug)
    .neq("id", product.id)
    .order("sort_order")
    .limit(limit)
    .order("sort_order", { referencedTable: "product_variants" });
  if (error) { console.error("[products] getRelatedProducts DB error:", error); return []; }
  return (data ?? []).map(mapProductCard);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.trim();
  if (!q) return getProducts();
  const safe = q.replace(/[%_,()]/g, '\\$&');
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("products")
    .select(SELECT_CARD)
    .or(`name.ilike.%${safe}%,tagline.ilike.%${safe}%,description.ilike.%${safe}%,category_slug.ilike.%${safe}%`)
    .order("sort_order")
    .order("sort_order", { referencedTable: "product_variants" });
  if (error) { console.error("[products] searchProducts DB error:", error); return []; }
  return (data ?? []).map(mapProductCard);
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids.length) return [];
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("products")
    .select(SELECT_CARD)
    .in("id", ids)
    .order("sort_order", { referencedTable: "product_variants" });
  if (error) { console.error("[products] getProductsByIds DB error:", error); return []; }
  return (data ?? []).map(mapProductCard);
}
