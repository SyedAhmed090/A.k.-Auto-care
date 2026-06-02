# A.K. Auto Care — E-Commerce Website

A production-ready e-commerce site for professional car care and detailing products, built for the Pakistani market. Built with Next.js 16 (App Router), Tailwind CSS v4, Zustand cart state, and Supabase order persistence.

## Features

- 11 fully built pages: Home, Shop, Category, Product Detail, Cart, Checkout, Order Confirmation, Search, About, Contact, Policies
- 14 products across 6 categories — all priced in PKR
- Persistent cart state (localStorage via Zustand)
- Slide-out mini-cart from any page
- Filters, sort, and load-more pagination on Shop page
- Product variant selectors, quantity stepper, tabbed product info
- Pakistani payment methods: Cash on Delivery, JazzCash, EasyPaisa, Bank Transfer
- Server-side order validation — prices recomputed from catalogue, never trusted from client
- Promo code system (server-side validated, not in client bundle)
- GST 17% display on all order summaries
- Shipping via TCS / Leopards Courier with city-level delivery estimates
- WhatsApp floating contact button
- Checkout form with full validation (React Hook Form + Zod)
- Mobile-first responsive design (375 / 768 / 1280px)
- SEO: per-page titles, meta descriptions, Open Graph tags
- Supabase order persistence

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Cart state | Zustand + persist middleware |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Database | Supabase (orders table) |
| Images | Next.js Image |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your Supabase project URL and keys from the Supabase dashboard.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Build for production

```bash
npm run build
npm start
```

## Customising Content

### Add / edit products
Edit `data/products.ts`. Each product object has:
- `id`, `slug`, `name`, `categorySlug`
- `price`, `variants[]` (label, price in PKR, sku)
- `images[]`, `description`, `howToUse`, `specs[]`
- `featured`, `badge`, `inStock`, `stock`

### Add / edit categories
Edit `data/categories.ts`. Each category has:
- `slug`, `name`, `description`, `image`, `accent`

### Payment methods
Payment details (JazzCash/EasyPaisa account numbers, bank details) are in `app/checkout/page.tsx` — search for `PAYMENT_METHODS`.

### WhatsApp number
Search for `923000000000` to find and update the WhatsApp business number.

### Shipping rates & free-shipping threshold
Edit `lib/commerce.ts` — `FREE_SHIPPING_THRESHOLD` and `getShippingOptions()`.

### Promo codes
Edit `lib/promos.ts` — server-side only, never exposed to the browser.

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable (anon) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key — server only |
| `RESEND_API_KEY` | (optional) Resend API key for contact form emails |
| `CONTACT_EMAIL_FROM` | (optional) From address for contact form |
| `CONTACT_EMAIL_TO` | (optional) To address for contact form |
| `NEWSLETTER_API_KEY` | (optional) Newsletter list provider key |
| `NEWSLETTER_LIST_ID` | (optional) Newsletter list ID |

## Deploying to Vercel

1. Push the repo to GitHub.
2. Import into [vercel.com](https://vercel.com).
3. Add environment variables in the Vercel dashboard.
4. Deploy — done.

## Promo Codes

| Code | Discount | Min spend |
|---|---|---|
| `AKCARE10` | 10% off | None |
| `DETAIL20` | 20% off | Rs 5,000 |
| `LAUNCH15` | 15% off | None |

Codes are validated server-side in `lib/promos.ts` — they are never shipped in the client bundle.
