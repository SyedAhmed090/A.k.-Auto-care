import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPosts, getPostBySlug, extractProductSkus, type ProductEmbedMap } from "@/lib/blog";
import { getProducts } from "@/lib/products";
import Markdown from "@/components/ui/Markdown";
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from "@/lib/constants";

const BASE_URL = "https://www.akautocare.pk";

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post Not Found", robots: { index: false, follow: false } };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      images: [{ url: post.cover, width: 1200, height: 630, alt: post.title }],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt, images: [post.cover] },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  // Resolve any [[product:SKU]] embeds server-side so the offer is in the prerendered HTML.
  const skus = extractProductSkus(post.content);
  const embeds: ProductEmbedMap = {};
  if (skus.length) {
    const all = await getProducts();
    for (const sku of skus) {
      const product = all.find((p) => p.variants.some((v) => v.sku === sku));
      const variant = product?.variants.find((v) => v.sku === sku);
      if (product && variant) embeds[sku] = { product, variant };
    }
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.cover,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Organization", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "A.K. Auto Care",
      logo: { "@type": "ImageObject", url: `${BASE_URL}/logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE_URL}/blog/${post.slug}` },
  };

  const related = getPosts().filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <article style={{ background: "var(--bg)", minHeight: "100vh" }}>
        <header className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm mb-8 transition-colors hover:text-[var(--accent)]" style={{ color: "var(--muted)" }}>
            <ArrowLeft className="w-4 h-4" /> All Articles
          </Link>

          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--accent)", fontFamily: "var(--font-space-mono)" }}>
            {post.category}
          </p>
          <h1 className="text-3xl sm:text-4xl font-black leading-tight mb-4" style={{ color: "var(--text)", fontFamily: "var(--font-anton)" }}>
            {post.title}
          </h1>
          <p className="text-[.78rem] mb-8" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
            By {post.author} · <time dateTime={post.date}>{new Date(post.date + "T00:00:00").toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" })}</time> · {post.readingMinutes} min read
          </p>

          <div className="relative w-full rounded-[18px] overflow-hidden mb-10" style={{ aspectRatio: "16/9", background: "var(--surface-2)" }}>
            <Image src={post.cover} alt={post.title} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" priority />
          </div>
        </header>

        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <Markdown content={post.content} embeds={embeds} />
        </section>

        {/* CTA */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="rounded-[18px] p-7 text-center" style={{ background: "var(--surface)", border: "1px solid var(--line-2)" }}>
            <h2 className="text-xl font-black mb-2 uppercase" style={{ fontFamily: "var(--font-anton)", color: "var(--text)" }}>
              Need the right products?
            </h2>
            <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
              Browse our range or ask us for a personal recommendation.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/shop" className="px-6 py-3 rounded-[13px] font-semibold" style={{ background: "var(--accent)", color: "var(--on-accent)" }}>
                Shop Products
              </Link>
              <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`} target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-[13px] font-semibold" style={{ background: "#25D366", color: "#fff" }}>
                Ask on WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16" style={{ borderTop: "1px solid var(--line)", paddingTop: "48px" }}>
            <h2 className="uppercase mb-6" style={{ fontFamily: "var(--font-anton)", fontSize: "1.5rem", color: "var(--text)" }}>
              Keep Reading
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="group block rounded-[var(--r)] overflow-hidden product-card">
                  <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/10", background: "var(--surface-2)" }}>
                    <Image src={p.cover} alt={p.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-[var(--accent)] transition-colors" style={{ color: "var(--text)" }}>
                      {p.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </>
  );
}
