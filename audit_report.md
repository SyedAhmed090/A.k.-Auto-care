# A.K. Auto Care — 360° Production Audit

**Site:** A.K. Auto Care — automotive paint-correction & detailing products (compounds, polishes, sealants, pads)
**Stack:** Next.js 16.2.6 (App Router) · React 19 · TypeScript · Supabase · Tailwind CSS v4 · Zustand · Upstash (rate-limit) · deployed Vercel/Netlify
**Audit date:** 2026-06-16
**Method:** Full source read across `app/`, `components/`, `lib/`, `store/`, `data/`, `supabase/`, config & deps. Four parallel deep-dive passes (UI/UX, E-commerce, Performance, Security). Every finding cites real files/lines.

> **Catalog context that shapes this audit:** This store sells **universal-fit detailing chemicals**, not vehicle-specific spare parts. That single fact changes two common "automotive" recommendations — a classic Year/Make/Model fitment filter is **not** appropriate here (see E-2.5), while **multi-step system bundles** (compound → polish → sealant) are the single biggest untapped lever (see E-1).

---

## 0. Executive Summary

The codebase is **mature and, on the backend, genuinely well-engineered.** The order pipeline is server-authoritative (prices, promos, shipping, and stock are all recomputed server-side — the major e-commerce fraud vector is closed), every admin route is auth-gated, public mutations enforce CSRF + rate-limiting + Zod, and the rendering strategy already uses ISR correctly. These are strengths to *preserve*, not rebuild.

The real risks cluster in three places:

1. **Operational security** — a weak, human-chosen admin secret that doubles as a token-signing key, and long-lived production keys sitting loose in a local env file.
2. **Front-end performance** — multi-megabyte image/video assets shipped raw, and the entire homepage hydrated as one giant client component.
3. **Conversion gaps** — no bundle/cross-sell upsell (the #1 AOV miss for detailing), unlabeled checkout form fields (a11y + usability on the money path), and missing breadcrumb/structured-data polish.

### Severity tally

| Severity | UI/UX | E-commerce | Performance | Security | Total |
|----------|:-----:|:----------:|:-----------:|:--------:|:-----:|
| Critical | 2 | 0¹ | 2 | 1 | **5** |
| High     | 4 | 3 | 4 | 2 | **13** |
| Medium   | 5 | 3 | 4 | 3 | **15** |
| Low      | 3 | 3 | 2 | 3 | **11** |

¹ *E-commerce had no Critical defects — the checkout backbone is sound. The bundle/upsell gap is rated High as a revenue opportunity, not a defect.*

### Prioritized by impact (conversion ↑ / speed ↑ / risk ↓)

| # | Finding | Layer | Severity | Lever |
|---|---------|-------|----------|-------|
| 1 | Multi-MB logo PNGs (6.7 MB / 473 KB / 281 KB) served as raw `<img>` | Perf | Critical | Speed (every page) |
| 2 | Weak `ADMIN_SECRET` = login password **and** token-signing key | Security | Critical | Risk (full compromise) |
| 3 | 1.9 MB autoplay hero video, no poster/preload control | Perf | Critical | Speed (LCP) |
| 4 | Checkout/contact/review form inputs have no label association | UI/UX | Critical | Conversion + a11y |
| 5 | Newsletter email inputs fully unlabeled | UI/UX | Critical | Capture + a11y |
| 6 | No bundle/kit cross-sell anywhere | E-com | High | AOV |
| 7 | Entire homepage is one `"use client"` component; zero `next/dynamic` | Perf | High | Speed (TBT/INP) |
| 8 | Rotate loose Supabase service-role + Resend keys; add CSP header | Security | High | Risk |

---

## 1. Visual & UI/UX Analysis — *How it looks & feels*

### What's done well
- **`StarRating`** (`components/ui/StarRating.tsx`) is exemplary: `role="img"` + descriptive `aria-label`, individual stars `aria-hidden`, half-star logic.
- **Strong focus system** in `app/globals.css:107-117` — global accent focus ring + `label:focus-within` for sr-only radio/checkbox patterns. Skip-link present (`app/layout.tsx:106-111`), `prefers-reduced-motion` honored for `.reveal`.
- **Cohesive "quiet luxury" token system** — CSS custom props (`--bg`, `--surface`, `--line`, radius scale, `--ease`) drive consistent dark styling. Sticky mobile add-to-cart bar (`ProductPageClient.tsx:457-478`, IntersectionObserver-driven) and `sticky top-28` cart/checkout summaries are good conversion patterns.
- **Storefront `alt` coverage is solid** — product images use `product.name`, gallery thumbs `"View N"`, logos labeled. No missing-alt issues in the storefront.

### CRITICAL

**UX-1. Form inputs have no programmatic label association (site-wide, incl. checkout)**
- **Location:** `app/checkout/page.tsx` (`Field` component lines 42–51; inputs 237–283); `app/contact/ContactClient.tsx:133-150`; `components/product/ReviewsSection.tsx:391-434`
- **Issue:** Labels render as plain `<label>` siblings — never tied to inputs via `htmlFor`+`id`, and the input isn't nested inside the `<label>`. Screen readers announce these as unlabeled; clicking the label text doesn't focus the field. This sits **directly on the checkout conversion path** — highest-impact a11y defect.
- **Fix:** `const id = useId()` → `<label htmlFor={id}>` + `<input id={id} {...register(...)}>`. Add `aria-describedby` pointing at the (id'd) error `<p>` so validation messages are announced.

**UX-2. Newsletter email inputs completely unlabeled**
- **Location:** `app/HomeClient.tsx:548-556` (CTA band); `components/layout/Footer.tsx:180-188`
- **Issue:** `type="email"` inputs with no `<label>`, no `aria-label`, **and no `placeholder`** — a blank box. Sighted users get no hint; SR announces "edit text, blank." Directly suppresses list capture.
- **Fix:** Add `aria-label="Email address"` + `placeholder="you@email.com"` to both.

### HIGH

**UX-3. Mobile menu stays in the DOM & focusable while closed**
- **Location:** `components/layout/Header.tsx:229-262`
- **Issue:** Hidden via `-translate-y-full` (still rendered) with `aria-hidden={!mobileOpen}`, but links lack `tabIndex={-1}`/`inert` — keyboard/SR users can Tab into the off-screen panel. `aria-hidden` over focusable content is itself an ARIA violation. `role="dialog"` is present but there's no focus trap.
- **Fix:** Add the `inert` attribute when `!mobileOpen` (React 19 supports the `inert` prop), trap focus, restore focus to the toggle on close.

**UX-4. Search overlay, MiniCart drawer & clear-cart modal lack dialog semantics / focus trap / labeled close buttons**
- **Location:** `Header.tsx:265-303` (search; close `X` at 292 unlabeled); `app/cart/CartClient.tsx:163-197` (clear-cart confirm); `components/layout/MiniCart.tsx` (drawer; close at 67 unlabeled)
- **Issue:** Bare `<div>`s with no `role="dialog"`/`aria-modal`/`aria-label`, no focus trap, icon-only close buttons with no `aria-label`.
- **Fix:** Add `role="dialog" aria-modal="true" aria-label="…"`, trap focus, focus first element on open, restore on close, label every `X`.

**UX-5. Product variant selection state not exposed to assistive tech**
- **Location:** `app/products/[slug]/ProductPageClient.tsx:250-264`
- **Issue:** Variant (size) chosen via `<button>`s where "selected" = border/background color only — no `aria-pressed`, no contrast-independent cue. Selecting a variant is required to buy, so this is conversion-adjacent. (Checkout shipping/payment radios at 297–368 correctly use `sr-only` real radios — good.)
- **Fix:** Add `aria-pressed={selected === i}` or convert to `role="radiogroup"` + `aria-checked`.

**UX-6. PDP tabs are not a real tablist**
- **Location:** `ProductPageClient.tsx:332-369`
- **Issue:** Description/How-to/Specs are plain `<button>`s — no `role="tablist"`/`tab`/`tabpanel`, no `aria-selected`, no arrow-key nav.
- **Fix:** Add `role="tablist"` + `role="tab" aria-selected aria-controls` + `role="tabpanel" aria-labelledby` and Left/Right arrow handling.

### MEDIUM

**UX-7. Heading hierarchy skips levels on the homepage**
- **Location:** `app/HomeClient.tsx` — `h1` (108), then `h3` (279, 389) appearing before section `h2`s (321, 347…), and an `h4` at 511.
- **Fix:** Lead each section with `<h2>`; make the spotlight title `<h2>`, Process steps `<h3>` not `<h4>`.

**UX-8. Announcement bar text ~11px, all-caps, heavy tracking**
- **Location:** `app/layout.tsx:125-130` (`text-[.7rem]`, `tracking-[.08em]`, mono) inside a fixed `h-9` bar.
- **Issue:** The free-shipping/COD message (a conversion driver) is below comfortable size and clips/wraps awkwardly on mobile.
- **Fix:** `text-xs` minimum, reduce mobile tracking, allow two lines on small screens.

**UX-9. Tap targets below 44px on key mobile controls**
- **Location:** `components/ui/QuantityStepper.tsx:11-31` (`w-8 h-8` = 32px); `MiniCart.tsx:124` remove (`w-6 h-6` = 24px); `CartClient.tsx:139` remove (`w-7 h-7` = 28px)
- **Issue:** Below WCAG 2.5.5 / Apple HIG 44px — these are the exact controls used to adjust an order right before purchase.
- **Fix:** ≥40–44px touch hit area (`w-10 h-10` + `min-w-[44px]` on touch, or invisible padding around small icons).

**UX-10. Shop grid stays 2-up from 640px→1280px**
- **Location:** `app/shop/ShopClient.tsx:172` (`grid-cols-1 sm:grid-cols-2 xl:grid-cols-3`) vs homepage `lg:grid-cols-4` (`HomeClient.tsx:329`)
- **Issue:** On 1024–1279px laptops the primary browse page renders large/sparse with a 208px sidebar eating width — wastes horizontal space and is inconsistent with the rest of the site.
- **Fix:** Add `lg:grid-cols-3` (sidebar is `lg:block w-52`, room for 3) and `2xl:grid-cols-4`.

**UX-11. Homepage testimonial stars unlabeled inline SVG**
- **Location:** `HomeClient.tsx:463-467` (raw `<svg>`, no `role`/`aria-hidden`); rating text `★ 4.9/5` at 479.
- **Fix:** Reuse the proper `StarRating` component or wrap the row with `aria-label="Rated 5 out of 5"` + `aria-hidden` on SVGs.

### LOW
- **UX-12.** Hero outline-only word "START" (`HomeClient.tsx:117`, `WebkitTextStroke` + transparent fill) is low-contrast over the bright video — add a subtle fill/`text-shadow`.
- **UX-13.** Autoplay hero video (`HomeClient.tsx:65-73`) has no `prefers-reduced-motion` gate or `poster`.
- **UX-14.** Shop price `range` (`ShopClient.tsx:32-37`) and sort `<select>` (161-168) lack `aria-label`/`aria-valuetext`.

---

## 2. Core E-Commerce Functionality — *What's there vs. what's missing*

### User Journey Map (as built)

**Discovery** → Catalog served from Supabase via `lib/products.ts` (`getProducts`, `getProductsByCategory`, `searchProducts`, `getRelatedProducts`); `data/products.ts` is seed/types. **Shop** (`app/shop/ShopClient.tsx`) filters by max-price slider + "In Stock Only", sorts Featured/Price/Newest, "Load More" at 12/page — no category/brand/attribute facets. **Search** (`app/search/SearchClient.tsx:9-19`) is a client-side substring filter over the preloaded array (server `searchProducts` at `lib/products.ts:173` exists but is unused). Three categories in `data/categories.ts`.

**Product detail** (`app/products/[slug]/ProductPageClient.tsx`) → gallery + keyboard lightbox, variant selector, stock-capped `QuantityStepper`, Add to Cart + Buy Now, Wishlist, Sample Request, WhatsApp inquiry, trust badges near CTA (315-326), low-stock urgency ("Only N left", 157-164), sticky mobile CTA, tabs, related grid, reviews. **`Product` JSON-LD** injected server-side (`page.tsx:71-99`).

**Cart** (`store/cart.ts` + `app/cart/CartClient.tsx` + MiniCart) → Zustand persisted to `localStorage` ("ak-cart"), qty merge with stock cap, promo apply/remove via `/api/promo`, free-shipping progress nudge, GST line, abandoned-cart recovery via `?recover=` token.

**Checkout** (`app/checkout/page.tsx` → `app/api/orders/route.ts`) → single-page with Cart/Details/Payment step indicator, react-hook-form + Zod, country-driven shipping, payment radios (COD/JazzCash/EasyPaisa/Bank Transfer), sticky summary. **Server recomputes prices + promo + shipping and never trusts the client** (`route.ts:62-138`), checks stock/reservations, sends Resend confirmation.

### What's done well
Server-authoritative orders pipeline · CSRF + rate-limiting on orders & contact · dual client/server Zod validation · Product/Store/FAQ/BlogPosting JSON-LD · sitemap/robots · low-stock urgency · abandoned-cart recovery · single-page checkout with step indicator · accessible error-focus on invalid submit (`page.tsx:206-212`).

### HIGH

**E-1. No "Frequently Bought Together" / cross-sell / bundle-kit upsell anywhere — biggest AOV miss**
- **Location:** MISSING. `getRelatedProducts` (`lib/products.ts:159-171`) only returns same-category items shown as "You May Also Like" (`ProductPageClient.tsx:372-391`). No bundle entity, no cart-page upsell. Grep `bundle|kit|frequently|cross-sell|upsell` → no real matches.
- **Issue:** Detailing is inherently a multi-step workflow, and the product copy itself references the chain (`data/products.ts:48` "refine with a finishing polish"; `:78` "follow with a finishing polish") — yet nothing converts that into an add-on or kit.
- **Fix:** Add a "Complete the System" module on the PDP and an upsell strip on the cart page. Add a `pairsWith`/`relatedSkus` field to `Product` and a `bundles` concept with bundle pricing; at minimum hand-curate compound→polish→coating step kits.

**E-2. No `BreadcrumbList` structured data**
- **Location:** MISSING. Breadcrumbs render visually (`ProductPageClient.tsx:110-121`) but no `BreadcrumbList` JSON-LD; `page.tsx` emits only `Product`.
- **Fix:** Add `BreadcrumbList` JSON-LD in `app/products/[slug]/page.tsx` and `app/categories/[slug]/page.tsx` (Home → Shop → Category → Product), reusing the path already rendered. Unlocks breadcrumb rich results.

**E-3. Server search unused; client search has no ranking / typo tolerance / autocomplete**
- **Location:** `app/search/SearchClient.tsx:9-19` (substring filter over preloaded array); `lib/products.ts:173-186` (`searchProducts` ILIKE) is dead code from the page's view.
- **Issue:** No relevance ranking (tagline match == name match), no fuzzy/synonyms (e.g. "scratch remover" won't reliably surface "compound"), no header search-as-you-type.
- **Fix:** Wire the page to server `searchProducts` or add weighted ranking (name > tagline > description) + a small synonym map; add header autocomplete.

### MEDIUM

**E-2.5. Year/Make/Model fitment — intentionally N/A; build use-case fitment instead**
- **Location:** MISSING by design. No vehicle/fitment data on `Product` (`data/products.ts:7-27`); grep `fitment|vehicle|compatib` → nothing.
- **Issue:** This catalog is **universal-fit detailing chemicals** — a classic YMM parts filter is *not* appropriate and would add friction. Flagged so it isn't mis-scoped as a defect.
- **Fix:** Do **not** build YMM. Add the right equivalent — *application/use-case fitment* facets: surface type (clearcoat / single-stage / plastic / glass), machine compatibility (rotary / DA — already in `specs`), and "works on" tags. Revisit only if paint-matched/trim-specific SKUs are added later.

**E-4. No saved address / saved vehicle / reorder**
- **Location:** MISSING. Cart persists and there's a wishlist (`store/wishlist.ts`), but checkout fields are re-entered every time (`checkout/page.tsx:17-27`, no prefill); `app/account/` isn't wired into checkout prefill.
- **Issue:** For a consumable category (people rebuy compound/polish), repeat-purchase friction directly suppresses LTV.
- **Fix:** Persist last-used shipping details to localStorage and prefill; add "Reorder" from order-confirmation/account.

**E-5. Pre-launch catalog integrity — gate `$0` Offer schema**
- **Location:** `data/products.ts` seed — all `price: 0`, `inStock: false`, badge `"Coming Soon"` (57-66, 87-96). PDP emits `Offer` with `price: product.price` (`page.tsx:82`).
- **Issue:** A `price: 0` + `OutOfStock` Offer is invalid/low-quality structured data and risks Merchant/SERP rejection if the DB mirrors the seed.
- **Fix:** Gate `Offer` emission on `product.price > 0`, add `priceValidUntil`, and verify the live Supabase `products` table has real prices before go-live. *(Aligns with the existing pre-launch pricing/env reminders.)*

### LOW
- **E-6.** Ensure `/api/promo` always returns `{ valid, discount, reason }` so the cart shows *why* a code failed (`store/cart.ts:84-100`, surfaced at `CartClient.tsx:60`).
- **E-7.** Add returns/secure-data/delivery reassurance micro-copy directly under the Place Order button (`checkout/page.tsx` — currently only a `Lock` icon at 419), matching the strong PDP trust row.
- **E-8.** Validation is solid (dual Zod); two gaps — checkout phone is `min(10)` with no PK normalization (`route.ts:23`), and contact has no honeypot/CAPTCHA (rate-limit only). Add libphonenumber/PK regex + a honeypot.

---

## 3. Performance & Code Optimization — *Speed & Core Web Vitals*

### What's done well
- **Rendering strategy is correct** — ISR throughout: home/shop `revalidate = 60`, product pages `revalidate = 3600` + `generateStaticParams`, categories prerendered. No accidental `force-dynamic` on public pages.
- **`next.config.ts:27-30`** — AVIF/WebP enabled, sensible `deviceSizes`/`imageSizes`, 1-year `minimumCacheTTL`.
- **Card-vs-detail selects** (`lib/products.ts:39,42`) deliberately omit heavy text columns. Admin orders/customers are paginated & bounded (`.range()`, `count:"exact"`, `.in()` to avoid N+1).
- **Third-party scripts** use `next/script strategy="afterInteractive"` (GA, Meta Pixel). PDP main image uses `next/image` + `priority`; `ProductCard` uses `fill` + proper `sizes`.

### CRITICAL

**P-1. 6.7 MB logo PNG (+473 KB / 281 KB siblings) served as raw `<img>` — affects every page**
- **Location:** `public/AK-LOGO.png` = **6,699,467 bytes**; `public/logo.png` = 473,017 bytes (`Footer.tsx:59-64`, `layout.tsx:46-47`, `blog/[slug]/page.tsx:52`); `logo-mark.png` = 281 KB (`Header.tsx:99`). All rendered with raw `<img>`, bypassing the optimizer — no AVIF/WebP, no resize, no `width`/`height` (CLS risk).
- **Issue:** A 473 KB PNG decoded for a 58px footer lockup is ~100× oversized; the 6.7 MB file is egregious. Header/footer are global, so this hits every route.
- **Fix:** Resize sources to ~2× display, convert to WebP/SVG, serve via `next/image` with explicit `width`/`height` (routes through the already-configured optimizer). Delete `AK-LOGO.png` if unused.
  ```tsx
  import Image from "next/image";
  <Image src="/logo.png" alt="A.K. Auto Care" width={180} height={58} className="mb-4" />
  ```

**P-2. 1.9 MB autoplay hero video, no `poster`/`preload` control — competes with LCP**
- **Location:** `app/HomeClient.tsx:65-73`; `public/mixkit-…hd-ready.mp4` = 1,961,250 bytes
- **Issue:** `<video autoPlay muted loop>` (~1.9 MB) with no `poster`, no `preload`, no dimensions. On md+ it downloads immediately, contending with the LCP hero text/CTA. `hidden md:block` hides it visually but the browser may still fetch on mobile.
- **Fix:** Add `preload="metadata"` + a ~30 KB WebP `poster`; gate playback behind IntersectionObserver/`requestIdleCallback`; use `<source media="(min-width:768px)">` instead of CSS `hidden` so mobile truly skips it; re-encode to a lower bitrate.

### HIGH

**P-3. Entire homepage is one giant `"use client"` component**
- **Location:** `app/HomeClient.tsx:1` (577 lines, all client) rendered by `app/page.tsx:11`
- **Issue:** Hero, trust bar, marquee, spotlight, best-sellers, categories, story, testimonials, process, CTA — all shipped as JS, parsed, and hydrated. Only two concerns truly need the client: the newsletter form (20-40, 546-568) and the scroll-reveal observer (43-53). Data is already fetched server-side in `page.tsx:7-10`, so the page pays hydration cost for purely presentational sections (inflates TBT/INP).
- **Fix:** Keep `page.tsx` as the server component; extract a small `<NewsletterForm/>` island and a tiny scroll-reveal wrapper (or replace with CSS `animation-timeline: view()`); let the rest render as server components.

**P-4. Zero code-splitting — `next/dynamic` used in no files**
- **Location:** Grep `next/dynamic` → 0 matches. Eagerly bundled: `RevenueChart` (`admin/(dashboard)/page.tsx:4`), PDP lightbox (`ProductPageClient.tsx:399-455`, click-only), mobile filter drawer (`ShopClient.tsx:210-236`, tap-only), `CookieConsent`/`MetaPixel` in global layout.
- **Fix:** Dynamically import conditional/below-fold UI:
  ```tsx
  const RevenueChart  = dynamic(() => import("./RevenueChart"), { ssr: false, loading: () => <ChartSkeleton/> });
  const CookieConsent = dynamic(() => import("@/components/ui/CookieConsent"), { ssr: false });
  ```
  Mount the lightbox and mobile filter drawer only when open.

**P-5. `next/font` declared without explicit `display:"swap"`; 6+ font files**
- **Location:** `app/layout.tsx:16-32` (`Anton`, `Hanken_Grotesk` ×4 weights, `Space_Mono` ×2)
- **Issue:** No explicit `display`; the giant Anton hero `<h1>` (`HomeClient.tsx:108`, up to 9rem) is almost certainly the LCP element, so font loading gates LCP.
- **Fix:** Set `display:"swap"` + `preload:true` on Anton; drop unused Hanken weights (each is a separate download).

**P-6. Admin dashboard sums revenue by pulling every order row into JS**
- **Location:** `app/admin/(dashboard)/page.tsx:15,24` — `select("total")` for all non-cancelled orders, unbounded, then `reduce` in JS.
- **Fix:** Push the sum into Postgres (RPC or a `revenue_summary` view, à la the existing `customer_summary`) and select a single scalar.

### MEDIUM
- **P-7.** `searchProducts` does a 4-column leading-wildcard `ILIKE` OR-scan incl. `description` (`lib/products.ts:178-183`) — add a `tsvector` FTS or `pg_trgm` GIN index before the catalog grows.
- **P-8.** `SELECT_CARD` selects the full `images` array though cards render only `images[0]` (`lib/products.ts:39`, `ProductCard.tsx:40`) — add a `thumbnail` column if arrays grow.
- **P-9.** Product page fetches the same product twice per request — `generateMetadata` and the page each call `getProductBySlug` (`page.tsx:21,67`). Wrap it in React `cache()` to dedupe (easy win, halves DB round-trips).
- **P-10.** No `content-visibility` on long product grids (`ShopClient.tsx:172`, `HomeClient.tsx:329/355`) — add `content-visibility:auto; contain-intrinsic-size:360px;` to off-screen grid wrappers.

### LOW
- **P-11.** Customer-facing order-tracking thumbnail uses raw `<img>` (`OrderTrackingClient.tsx:298`) — switch to `next/image` (admin/email `<img>` are acceptable).
- **P-12.** `app/account/page.tsx:12` `force-dynamic` is intentional/correct for an auth page — no action.

---

## 4. Security, Trust & Privacy — *Protection & reassurance*

### What's done well
- **No PCI scope** — payment is manual (COD/JazzCash/EasyPaisa/bank transfer); no card fields anywhere (grep stripe/card/cvv → 0). Payment account numbers are correctly `NEXT_PUBLIC_*` (display-only).
- **Server-side pricing & promo (anti-fraud)** — `app/api/orders/route.ts:62-138` recomputes every line from DB variants, ignores client prices, validates stock-vs-reserved, re-validates promos (min-spend/expiry/max-uses), computes shipping server-side, increments promo use atomically. The major fraud vector is closed.
- **Admin auth coverage** — all 31 admin API routes call `requireAdmin`/`requireRole` (77 occurrences); `proxy.ts` middleware gates `/admin/*` + `/api/admin/*`; `requireRole` re-checks `admin_users.active` live and fails closed (`adminAuth.ts:66-87`).
- **No order IDOR** (`order-tracking/route.ts` requires matching `id` AND `email`); scrypt + random salt + `timingSafeEqual` for staff passwords (`lib/password.ts`); LIKE-wildcard escaping on search input (`lib/products.ts:176`); httpOnly + secure + sameSite session cookie, 8h, `no-store` on login.
- **`.env.local` is git-ignored and NOT tracked** — verified (`git check-ignore` matches; `git ls-files` shows only `.env.example`). `.gitignore:37-38` covers `.env*` except the example. So none of the below is a public leak.

### CRITICAL

**S-1. Weak `ADMIN_SECRET` — it's both the login password and the token-signing key**
- **Location:** `.env.local` (value redacted here — a short, human-chosen string)
- **Issue:** `ADMIN_SECRET` is the legacy owner password **and** the HMAC signing key for all per-user session tokens (`lib/adminToken.ts`). Login is rate-limited 5/15min/IP (`api/admin/login/route.ts:28`), but because the same secret signs v2 tokens, anyone who learns it can **forge a valid session cookie for any role without ever hitting the login endpoint** — bypassing the rate limiter entirely. (The login compare itself is constant-time — good.)
- **Fix:** Replace with a 32+ byte random value (`openssl rand -base64 32`) set in Vercel env. Treat it as a signing key, not a typed password; prefer the per-user `admin_users` accounts (already supported via scrypt) and retire the shared-secret path once staff accounts exist.

### HIGH

**S-2. Loose, long-lived production secrets in the local working tree — rotate them**
- **Location:** `.env.local` — Supabase **service-role JWT** (`SUPABASE_SERVICE_ROLE_KEY`, full RLS bypass, expires **2036**), `SUPABASE_SECRET_KEY`, and a live `RESEND_API_KEY` (values redacted).
- **Issue:** Not committed (good), so no public leak — but these long-lived keys sit in plaintext on a workstation and (per project history) have circulated through env-file edits.
- **Fix:** Confirm git history never contained `.env.local` (`git log --all -p -- .env.local`, or scan with gitleaks). Given the loose handling + long lifetime, **rotate the Supabase service-role key and the Resend key** in their dashboards and update Vercel. Never paste these into chat/docs.

**S-3. Missing Content-Security-Policy header**
- **Location:** `next.config.ts:3-10` — HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` all present & correct, but **no CSP**.
- **Issue:** With user-generated content rendered (reviews, contact/sample data in admin) and third-party scripts (GA4, Meta Pixel), CSP is the main defense-in-depth layer against XSS/exfiltration.
- **Fix:** Add CSP (report-only first, then enforce), e.g.:
  ```
  default-src 'self'; img-src 'self' data: https://*.supabase.co https://images.unsplash.com;
  script-src 'self' https://www.googletagmanager.com; connect-src 'self' https://*.supabase.co;
  frame-ancestors 'none'; base-uri 'self'; form-action 'self'
  ```

### MEDIUM
- **S-4.** Rate-limit + IP handling fail open in edge cases: when Upstash is unconfigured the limiter falls back to a per-instance in-memory `Map` (`lib/rateLimit.ts:76,82`), so across Vercel's many instances per-IP caps aren't shared; `getIP` trusts `x-forwarded-for` (87-92). **Confirm `UPSTASH_REDIS_REST_URL`/`TOKEN` are set in production** and make Upstash mandatory there (log loudly if missing).
- **S-5.** `postcss <8.5.10` XSS advisory (GHSA-qx2v-qp2m-jg93, moderate) pulled in transitively under Next's bundle — build-time only, not on the request path. `npm audit` reports 2 moderate, 0 high/critical; direct deps clean. Track Next patch releases; ignore npm's bogus "downgrade next to 9.3.3" fix.
- **S-6.** Public unauthenticated writes (newsletter, abandoned-cart save, reviews) are rate-limited + Zod-validated and reviews are stored `approved:false` (good) — residual risk is junk/spam, not breach. Add Turnstile/hCaptcha on newsletter + reviews and double opt-in for newsletter.

### LOW / Notes
- **S-7.** `block_public` policies (`CREATE POLICY … TO anon USING(false)`, e.g. `001_orders.sql:53`) are belt-and-suspenders over RLS — correct. `products`/`product_variants` are intentionally public-read.
- **S-8.** Service-role key read only in `utils/supabase/admin.ts` (server-only), never `NEXT_PUBLIC_`. No hardcoded secrets in source.

### E-E-A-T / Trust signals (visual)
**Present:** PDP trust row (free delivery / 30-day returns / genuine / WhatsApp — `ProductPageClient.tsx:315-326`), low-stock urgency, moderated reviews + `StarRating`, policies pages (`app/policies/`), FAQ, footer.
**Missing / thin:**
- No **trust/secure-checkout badges or reassurance copy at the payment step** (see E-7) — trust matters most where money changes hands.
- No **verified-review provenance** (reviews are first-party + moderated, but there's no "verified purchase" badge or third-party integration to signal authenticity).
- **About-page authority** — ensure `app/about/AboutClient.tsx` carries real credentials/experience (years detailing, certifications, physical address/phone) to strengthen Authoritativeness; confirm a business address + phone are surfaced in the footer/contact for local-business trust.

---

## 5. Action Plan — First 5 high-impact, low-effort changes

Ordered to maximize (conversion + speed + risk reduction) per hour of effort. All are **hours, not days.**

### ✅ 1. Crush the logo/video assets *(Performance — biggest single byte win, every page)*
- Delete `public/AK-LOGO.png` (6.7 MB) if unused; resize `logo.png`/`logo-mark.png` to ~2× display size, convert to WebP/SVG.
- Swap the raw `<img>` in `Header.tsx:99` and `Footer.tsx:59-64` for `next/image` with explicit `width`/`height`.
- Add a `poster` + `preload="metadata"` to the hero `<video>` (`HomeClient.tsx:65-73`); use `<source media="(min-width:768px)">` so mobile skips the 1.9 MB download.
- **Why:** Several MB off LCP on every route; fixes CLS from unsized logos.

### ✅ 2. Rotate & harden secrets *(Security — closes full-compromise path)*
- Generate a 32-byte random `ADMIN_SECRET` (`openssl rand -base64 32`); set in Vercel.
- Rotate the Supabase **service-role** key and the **Resend** key in their dashboards; update Vercel env.
- Confirm `git log --all -p -- .env.local` is empty (it should be — file is git-ignored).
- **Why:** Eliminates token-forgery via a guessable signing key and de-risks long-lived loose keys. Pure config — no code.

### ✅ 3. Label every form field *(UI/UX — conversion path + a11y)*
- Add `useId()`-based `htmlFor`/`id` pairing in the checkout `Field` component (`checkout/page.tsx:42-51`), contact form, and reviews form.
- Add `aria-label` + `placeholder` to the two newsletter inputs (`HomeClient.tsx:548-556`, `Footer.tsx:180-188`).
- **Why:** Removes friction on the money path and fixes the highest-impact accessibility defects in one focused pass.

### ✅ 4. Add a CSP header + verify Upstash in prod *(Security — defense-in-depth, config-only)*
- Append a `Content-Security-Policy` (report-only first) to `securityHeaders` in `next.config.ts:3-10`.
- Confirm `UPSTASH_REDIS_REST_URL` / `TOKEN` are set in the production environment so rate-limiting isn't silently per-instance.
- **Why:** Closes the biggest gap in an otherwise-strong header set; ensures abuse protection actually works in prod.

### ✅ 5. Ship a "Complete the System" bundle module + BreadcrumbList JSON-LD *(E-commerce — AOV + SEO)*
- Add a curated cross-sell strip to the PDP and cart page (start hand-curated: compound → polish → sealant kits; the product copy already implies these pairings).
- Add `BreadcrumbList` JSON-LD to `app/products/[slug]/page.tsx` and `app/categories/[slug]/page.tsx` (reuse the visual breadcrumb path).
- **Why:** The bundle module is the single biggest AOV lever for a detailing catalog; breadcrumb schema is a ~20-line rich-results win.

---

### Deliberately *not* recommended
- **A Year/Make/Model fitment filter** — wrong for a universal-fit chemical catalog (adds friction). Build *use-case fitment* facets (surface type, machine type, "works on" tags) instead — see E-2.5.
- **Rebuilding the orders/checkout backend** — it's already server-authoritative and well-secured. Preserve it.

---

*Report generated from a full source read on 2026-06-16. Every finding cites a real file/line; secret values are redacted by design. Re-run after the Action Plan to confirm fixes and re-baseline Core Web Vitals.*
