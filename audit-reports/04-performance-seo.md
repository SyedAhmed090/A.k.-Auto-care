# Performance & SEO Audit — A.K. Auto Care
Date: 2026-06-17 · Scope: rendering, metadata, assets, bundle, crawlability

## Summary
The site has a solid foundation: `metadataBase`, Organisation JSON-LD, Product/BreadcrumbList/FAQPage/BlogPosting structured data, ISR revalidation on product/category/shop/home pages, `next/image` throughout (no raw `<img>` in public pages), and `next/script` with `afterInteractive` for GA4 and Meta Pixel. The most significant gaps are missing `robots: noindex` on crawlable transactional pages (checkout, cart, search), absent canonical URLs on the majority of static pages, missing Twitter card metadata outside product/blog/category routes, several `<Image fill>` calls with no `sizes` attribute causing over-fetched images, and a 214 KB unoptimised hero PNG (`logo-shield.png`) that bypasses Next's image pipeline because it is statically imported via `next/image` with only a `w-[…]` CSS class rather than explicit `width`/`height` props. The 1.9 MB video in `public/` appears orphaned. Account sub-pages (`/account/login`, `/account/register`, `/account/forgot-password`, `/account/reset-password`) are `"use client"` page files with no metadata and no wrapping layout — they are indexed and have no title beyond the root template.

## Asset weight table
| Asset | Size | Issue |
|---|---|---|
| `public/mixkit-…-hd-ready.mp4` | 1.91 MB | Orphaned — no `<video>` tag found anywhere in app/ or components/; waste in Vercel deployment bundle |
| `app/opengraph-image.png` | 289 KB | OG image served as raw PNG; Next auto-serves it but 289 KB is heavy for social crawlers |
| `app/icon.png` | 225 KB | Favicon source too large; Next resizes to 32×32 but the source inflates build output |
| `public/logo-shield.png` | 214 KB | Hero emblem PNG; statically imported via next/image but lacks `width`/`height` — Next cannot pick the optimal format at build time without them |
| `public/logo.png` | 17.2 KB | Footer logo — acceptable |
| `public/logo-mark.png` | 6.8 KB | Header mark — acceptable |
| `app/apple-icon.png` | 37.7 KB | Fine |

## Severity tally
| Critical | High | Medium | Low |
|---|---|---|---|
| 0 | 5 | 7 | 4 |

## Files modified (auto-fixes applied)
- `app/layout.tsx` — added root-level `twitter` card metadata
- `app/checkout/layout.tsx` — added `robots: { index: false, follow: false }`
- `app/cart/layout.tsx` — added `robots: { index: false, follow: false }`
- `app/search/layout.tsx` — added `robots: { index: false, follow: true }`
- `app/shop/page.tsx` — added `alternates.canonical` and `twitter` card
- `app/contact/page.tsx` — added `alternates.canonical` and `twitter` card
- `app/about/page.tsx` — added `alternates.canonical` and `twitter` card
- `app/order-tracking/page.tsx` — added `alternates.canonical` and `twitter` card
- `app/faq/page.tsx` — added `twitter` card
- `app/blog/page.tsx` — added `twitter` card
- `app/robots.ts` — added `/admin/` (trailing-slash variant), `/account`, `/wishlist` to disallow list
- `app/sitemap.ts` — removed duplicate `/policies/shipping` and `/policies/returns` (subsets of `/policies/shipping-returns`) to avoid duplicate-content dilution

## Findings

### [P-01] Checkout and Cart indexed by search engines — High
- **Location:** `app/checkout/layout.tsx:1`, `app/cart/layout.tsx:1`
- **Category:** Crawl
- **Issue:** Neither page exported `robots: noindex` despite being transactional pages with no SEO value. The root layout sets `robots: { index: true, follow: true }` which is inherited.
- **Impact:** Googlebot will crawl and attempt to index `/checkout` and `/cart`. Blocked in `robots.txt` but `robots.txt` disallow does not remove an already-indexed URL; meta robots is the authoritative signal.
- **Fix:** Added `robots: { index: false, follow: false }` to both layout files.
- **Status:** ✅ Auto-fixed

### [P-02] Search results page indexed — High
- **Location:** `app/search/layout.tsx:1`
- **Category:** Crawl
- **Issue:** `/search` with arbitrary `?q=` parameters is missing `robots: noindex`. Each unique query string creates a potential duplicate-content URL that could be crawled.
- **Impact:** Thin/duplicate content in the index, potential crawl budget waste.
- **Fix:** Added `robots: { index: false, follow: true }`.
- **Status:** ✅ Auto-fixed

### [P-03] Account sub-pages are `"use client"` page.tsx files with no metadata — High
- **Location:** `app/account/login/page.tsx:1`, `app/account/register/page.tsx:1`, `app/account/forgot-password/page.tsx:1`, `app/account/reset-password/page.tsx:1`
- **Category:** Metadata | Crawl
- **Issue:** All four files begin with `"use client"` which means Next.js cannot extract static `export const metadata` from them. There is no `app/account/layout.tsx` or per-directory layout to supply metadata. As a result these pages inherit only the root title template (`%s | A.K. Auto Care`) with no `%s` substitution, producing a blank tab title, and no `robots: noindex` to prevent indexation.
- **Impact:** Pages appear in search results with generic or missing titles; duplicate/thin content signals.
- **Fix (recommended):** Split each page into a thin server wrapper (page.tsx) that exports metadata and renders the existing client component, following the Next.js "server/client split" pattern. Example:
  ```tsx
  // app/account/login/page.tsx (server component)
  import type { Metadata } from "next";
  export const metadata: Metadata = {
    title: "Sign In",
    robots: { index: false, follow: false },
  };
  import LoginClient from "./LoginClient";
  export default function LoginPage() { return <LoginClient />; }
  ```
  Then rename `login/page.tsx` → `login/LoginClient.tsx`.
- **Status:** 🔧 Recommended (requires file rename + split — outside auto-fix scope)

### [P-04] Duplicate policy content in sitemap — High
- **Location:** `app/sitemap.ts:11`
- **Category:** Crawl | Metadata
- **Issue:** Sitemap included `/policies/shipping` AND `/policies/returns` as separate entries alongside `/policies/shipping-returns`. The shipping-returns page (`policies/[slug]/page.tsx`) contains the same content as the individual shipping and returns slugs. All three lack canonical tags in their `generateMetadata`, so Googlebot has no signal about the preferred URL.
- **Impact:** Duplicate content signals; PageRank dilution across three equivalent pages.
- **Fix:** Removed `/policies/shipping` and `/policies/returns` from the sitemap (they are subsets of the combined page). Also recommend adding `alternates: { canonical: "/policies/shipping-returns" }` inside `generateMetadata` for the `shipping` and `returns` slugs in `app/policies/[slug]/page.tsx`.
- **Status:** ✅ Auto-fixed (sitemap) · 🔧 Recommended (per-slug canonicals in generateMetadata)

### [P-05] `<Image fill>` without `sizes` — causes over-fetched images — High
- **Location:** `app/about/AboutClient.tsx:11`, `app/about/AboutClient.tsx:53`, `app/categories/[slug]/CategoryPageClient.tsx:35`, `app/products/[slug]/ProductPageClient.tsx:190`
- **Category:** Images/Video | CWV
- **Issue:** Four `next/image` usages with `fill` but no `sizes` prop. When `sizes` is absent Next defaults to `100vw`, meaning it requests the largest source set image (up to 1920px) on every viewport. On a mobile device this can serve a 1200–1920px image for what renders at 400px.
- **Impact:** Wasted bandwidth (2–5× larger download), slower LCP on mobile, potential CLS if image intrinsic dimensions are unknown.
- **Fix (recommended — client files, outside auto-fix scope):**
  - `AboutClient.tsx:11` hero: `sizes="100vw"` (already full-width, this makes intent explicit and can be refined)
  - `AboutClient.tsx:53` story card: `sizes="(max-width: 1024px) 100vw, 50vw"`
  - `CategoryPageClient.tsx:35` hero: `sizes="100vw"`
  - `ProductPageClient.tsx:190` thumbnails: `sizes="(max-width: 640px) 80px, 96px"`
- **Status:** 🔧 Recommended

### [P-06] Hero `logo-shield.png` (214 KB PNG) statically imported without width/height — Medium
- **Location:** `app/HomeClient.tsx:14,59`
- **Category:** Images/Video | CWV
- **Issue:** `logo-shield.png` is 214 KB, 420×407 px, imported statically. While Next.js *will* serve AVIF/WebP variants at request time, the static import means the original PNG is inlined as build output. The rendered size is `clamp(280px,30vw,440px)` via CSS class — no `width`/`height` props are passed to `<Image>`, so the browser must load the image before knowing its layout dimensions, risking CLS.
- **Impact:** 214 KB PNG download on slow connections before AVIF kicks in; possible CLS on hero section.
- **Fix (recommended):** Convert `logo-shield.png` to an optimised SVG or AVIF source, or pass explicit `width={440} height={407}` to the `<Image>` tag so Next can emit correct `width`/`height` in the `<img>` element for aspect-ratio reservation.
- **Status:** 🔧 Recommended

### [P-07] Orphaned 1.91 MB video asset in `public/` — Medium
- **Location:** `public/mixkit-close-up-of-a-man-polishing-a-newly-polished-car-47833-hd-ready.mp4`
- **Category:** Bundle | Images/Video
- **Issue:** A 1.91 MB HD video file is present in `public/` but no `<video>` tag, `src`, or reference to it was found anywhere in `app/` or `components/`. It is included in every Vercel deployment and counts toward the function/static-asset size.
- **Impact:** Unnecessary 1.91 MB in the deployment bundle; increases cold-start asset scanning.
- **Fix (recommended):** Remove the file if unused, or move it to an external CDN/Supabase storage and reference it via URL when needed.
- **Status:** 🔧 Recommended

### [P-08] Missing canonical URLs on majority of static pages — Medium
- **Location:** `app/shop/page.tsx:5`, `app/contact/page.tsx:4`, `app/about/page.tsx:4`, `app/order-tracking/page.tsx:4`, `app/faq/page.tsx:7` (pre-fix)
- **Category:** Metadata | Crawl
- **Issue:** Only `/`, `/blog`, `/blog/[slug]`, `/faq`, `/products/[slug]` had explicit canonical `alternates`. Shop, Contact, About, Order Tracking, and Policies pages had none. Canonicals prevent `?sort=` and other query-string variants from being treated as separate URLs.
- **Impact:** Query-string variants (e.g. `/shop?sort=featured`) may be indexed as separate pages without a canonical signal.
- **Fix:** Added `alternates: { canonical: "/<route>" }` to all missing static page files.
- **Status:** ✅ Auto-fixed

### [P-09] Twitter card metadata absent on most pages — Medium
- **Location:** `app/layout.tsx:78`, `app/shop/page.tsx`, `app/about/page.tsx`, `app/contact/page.tsx`, `app/faq/page.tsx`, `app/blog/page.tsx`, `app/order-tracking/page.tsx`
- **Category:** Metadata
- **Issue:** Twitter/X card metadata was only present on `products/[slug]`, `categories/[slug]`, and `blog/[slug]`. All other pages fell back to no Twitter card, meaning shared links on X/Twitter show only a generic link preview without an image.
- **Impact:** Reduced click-through on social shares; no large-image preview on Twitter/X.
- **Fix:** Added `twitter` object to root layout (inherited by all pages) and to individual static pages.
- **Status:** ✅ Auto-fixed

### [P-10] `app/icon.png` is 225 KB — overly large favicon source — Medium
- **Location:** `app/icon.png`
- **Category:** Images/Video | Bundle
- **Issue:** The favicon source file is 225 KB. Next.js 16 auto-generates the browser favicon from this file, but the large source inflates build output and means the initial icon generation pipeline processes a large PNG.
- **Impact:** Unnecessary build-time overhead; source file served as-is if the Next icon pipeline is bypassed.
- **Fix (recommended):** Replace `app/icon.png` with an optimised 512×512 or 256×256 PNG under 20 KB (use a tool such as pngquant or squoosh), or use an SVG (`app/icon.svg`).
- **Status:** 🔧 Recommended

### [P-11] `app/opengraph-image.png` is 289 KB — Medium
- **Location:** `app/opengraph-image.png`
- **Category:** Images/Video
- **Issue:** The default Open Graph image is 289 KB. Social crawlers (Facebook, Twitter/X, LinkedIn) download this image on every link unfurl. At 289 KB it is 3–5× larger than the recommended maximum of 50–80 KB for a static OG image.
- **Impact:** Slower OG link previews; some crawlers may time out or skip the image.
- **Fix (recommended):** Re-export at 1200×630 px, compress to JPEG at 80% quality (~60–90 KB), or generate it programmatically via `app/opengraph-image.tsx` using the `ImageResponse` API (Next 16 built-in).
- **Status:** 🔧 Recommended

### [P-12] Raw `<img>` tag in admin product form — Low
- **Location:** `app/admin/(dashboard)/products/ProductForm.tsx:358`
- **Category:** Images/Video
- **Issue:** A raw `<img>` tag is used for image URL previews in the admin product form. This bypasses Next.js image optimisation (lazy loading, AVIF/WebP).
- **Impact:** Minor — admin-only route, not customer-facing. No LCP impact.
- **Fix (recommended):** Use `next/image` with `width`/`height` for the preview, or keep the raw `<img>` with `loading="lazy"`.
- **Status:** 🔧 Recommended (admin only — low priority)

### [P-13] `about/AboutClient.tsx` hero image missing `priority` — Low
- **Location:** `app/about/AboutClient.tsx:11`
- **Category:** CWV
- **Issue:** The About page hero image (`fill`, Unsplash URL) is likely above the fold on all viewports and is the Largest Contentful Paint candidate, but it lacks `priority`.
- **Impact:** LCP delayed by lazy-loading the most visible image on the page.
- **Fix (recommended — client file, outside auto-fix scope):** Add `priority` prop to the hero `<Image>`.
- **Status:** 🔧 Recommended

### [P-14] Lucide icons imported individually throughout — Low
- **Location:** Multiple files (see grep output; ~45 files import from `lucide-react`)
- **Category:** Bundle
- **Issue:** All imports use named exports from `lucide-react` (e.g. `import { Truck } from "lucide-react"`), which is the correct tree-shakeable pattern. lucide-react v1.17 uses ESM and ships individual SVG components; bundlers eliminate unused icons. No action needed for correctness, but lucide-react `^1.17.0` is a pre-stable version — confirm it includes all the icons used (`Sparkles`, `Layers`, etc.) and that the package resolves correctly.
- **Impact:** Negligible if tree-shaking works; verify that `Sparkles` and `Layers` exist in this version.
- **Fix (recommended):** Run `npm ls lucide-react` and confirm no missing icons in the pre-stable release. Pin to a stable major once available.
- **Status:** 🔧 Recommended

## Broken internal links
| From file:line | Target href | Exists? |
|---|---|---|
| `app/HomeClient.tsx:204` | `/products/bpo-hardener-paste` | Depends on Supabase seed — hardcoded slug must match DB product |
| `components/layout/Footer.tsx:127` | `/about#system` | Fragment `#system` — no element with `id="system"` found in `AboutClient.tsx`; may 404-scroll silently |

## Cross-domain recommendations

1. **`next.config.ts` — add `compress: true`** (not set; Next 16 enables gzip by default on Vercel but explicit config documents intent).

2. **`next.config.ts` — consider `output: "standalone"`** for faster Vercel cold starts if not using edge functions.

3. **`public/logo-shield.png` → SVG or AVIF**: The hero brand emblem is a high-contrast shield graphic that would compress 10–20× as an SVG without quality loss. This alone saves ~190 KB per homepage load on the first visit before CDN caching.

4. **Add `generateStaticParams` for `/policies/[slug]`**: The policies page already has a static `policies` record; adding `export async function generateStaticParams()` (already present — good) means these pages are pre-rendered at build time. Verify `export const revalidate` is not accidentally missing (no `revalidate` export found — these will default to static in Next 16).

5. **Implement `app/opengraph-image.tsx`** using Next's built-in `ImageResponse` to auto-generate per-route OG images with product/category names, avoiding the need to maintain a static 289 KB PNG.

6. **CSP `script-src 'unsafe-inline'`**: Current CSP allows inline scripts (needed for the GA4 init snippet and JSON-LD). Consider migrating the GA4 init to a separate file loaded via `next/script` with `strategy="afterInteractive"` — the JSON-LD `<script type="application/ld+json">` is **not** executable JavaScript and does not require `'unsafe-inline'` in `script-src`. Separating these would allow a stricter CSP with a nonce (acknowledging the trade-off noted in `next.config.ts` comments about forcing dynamic rendering).

7. **`search/page.tsx` has no `metadata` export**: Metadata is entirely in `search/layout.tsx`. While this works (layouts propagate metadata), consider moving metadata to page.tsx for consistency and to support per-query dynamic metadata in the future.
