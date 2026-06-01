# A.K. Auto Care — E-Commerce Website

A production-ready e-commerce site for professional car care and detailing products. Built with Next.js 14 (App Router), Tailwind CSS, Zustand cart state, and Stripe-ready checkout.

## Features

- 11 fully built pages: Home, Shop, Category, Product Detail, Cart, Checkout, Order Confirmation, Search, About, Contact, Policies
- 14 realistic sample products across 6 categories
- Persistent cart state (localStorage via Zustand)
- Slide-out mini-cart from any page
- Filters, sort, and load-more pagination on Shop page
- Product variant selectors, quantity stepper, tabbed product info
- Promo code system (`AKCARE10`, `DETAIL20`, `LAUNCH15`)
- Checkout form with full validation (React Hook Form + Zod)
- Mobile-first responsive design (375 / 768 / 1280px)
- SEO: per-page titles, meta descriptions, Open Graph tags

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS v4 |
| Cart state | Zustand + persist middleware |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Images | Next.js Image (Unsplash CDN) |
| Payments | Stripe (ready for integration) |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your Stripe test keys from [https://dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys).

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
- `price`, `variants[]` (label, price, sku)
- `images[]`, `description`, `howToUse`, `specs[]`
- `featured`, `badge`, `inStock`

### Add / edit categories
Edit `data/categories.ts`. Each category has:
- `slug`, `name`, `description`, `image`, `accent` (colour)

No component changes needed — categories are fully data-driven.

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (prefix `pk_`) |
| `STRIPE_SECRET_KEY` | Stripe secret key (prefix `sk_`) — server-side only |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret for production |

## Deploying to Vercel

1. Push the repo to GitHub.
2. Import into [vercel.com](https://vercel.com).
3. Add environment variables in the Vercel dashboard.
4. Deploy — done.

## Promo Codes (demo)

| Code | Discount |
|---|---|
| `AKCARE10` | 10% off |
| `DETAIL20` | 20% off |
| `LAUNCH15` | 15% off |
