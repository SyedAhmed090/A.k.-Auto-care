import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Car Care Tips & Guides — Blog",
  description:
    "Expert car detailing tips, paint correction guides, and ceramic coating advice from A.K. Auto Care — Pakistan's car care specialists.",
  alternates: { canonical: "/blog" },
  twitter: {
    card: "summary_large_image",
    title: "Car Care Tips & Guides — Blog | A.K. Auto Care",
    description: "Expert car detailing tips, paint correction guides, and ceramic coating advice from A.K. Auto Care — Pakistan's car care specialists.",
  },
};

export default function BlogPage() {
  const posts = getPosts();

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="pt-12 pb-12" style={{ borderBottom: "1px solid var(--line)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--accent)", fontFamily: "var(--font-space-mono)" }}>
            Tips &amp; Guides
          </p>
          <h1 className="text-4xl sm:text-5xl font-black" style={{ color: "var(--text)", fontFamily: "var(--font-anton)" }}>
            The Detailing Journal
          </h1>
          <p className="mt-3 text-sm max-w-2xl" style={{ color: "var(--muted)" }}>
            Practical advice on washing, paint correction, coatings, and protecting your car&apos;s finish — written for Pakistani roads and weather.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {posts.length === 0 && (
          <p className="text-center py-24 text-sm" style={{ color: "var(--muted)" }}>
            No articles yet — check back soon.
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block rounded-[var(--r)] overflow-hidden product-card h-full">
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/10", background: "var(--surface-2)" }}>
                <Image src={post.cover} alt={post.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute top-3.5 left-3.5 text-[.6rem] font-bold px-2.5 py-1 rounded-full tracking-[.12em] uppercase" style={{ background: "var(--accent)", color: "var(--on-accent)", fontFamily: "var(--font-space-mono)" }}>
                  {post.category}
                </span>
              </div>
              <div className="p-5 flex flex-col gap-2">
                <h2 className="font-semibold text-[1.1rem] leading-snug line-clamp-2 group-hover:text-[var(--accent)] transition-colors" style={{ color: "var(--text)" }}>
                  {post.title}
                </h2>
                <p className="text-sm line-clamp-2" style={{ color: "var(--muted)" }}>{post.excerpt}</p>
                <p className="text-[.72rem] mt-1" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
                  {new Date(post.date + "T00:00:00").toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" })} · {post.readingMinutes} min read
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
