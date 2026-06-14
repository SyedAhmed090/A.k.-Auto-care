# A.K. Auto Care — Launch Guide & Audit Follow-up

This document covers everything needed to take the site live, plus the items
that were intentionally left as configuration or future work.

---

## 1. What was implemented in this audit pass

**Navigation & trust**
- Header: added Track Order, FAQ, Account, and Wishlist entry points.
- Footer: social links, phone/email, Track Order/FAQ/Shipping/Returns links, real Privacy/Terms links.
- Reusable `TrustBadges` and `SocialLinks` components.
- Contact page: embedded Google map, click-to-WhatsApp, directions link, business hours.

**SEO & infrastructure**
- `LocalBusiness`/`Store` schema with address, geo, opening hours, and `sameAs` social links.
- HSTS security header.
- Abandoned-cart cron scheduled via `vercel.json` (hourly).
- GA4 ecommerce events (`view_item`, `add_to_cart`, `begin_checkout`, `purchase`).
- `/faq` (with FAQ schema), `/blog` (with BlogPosting schema), dedicated `/policies/shipping` & `/policies/returns`, all added to the sitemap.

**Conversion**
- Wishlist (localStorage) with header count, `/wishlist` page, hearts on cards + product pages.
- First-purchase discount popup (email capture → reveals `AKCARE10`).
- Printable order receipt on the confirmation page.

**Product UX**
- Click-to-zoom image lightbox with keyboard navigation.
- "View all in [category]" internal link.

**Customer accounts (Supabase Auth)**
- Register / login / logout, `/account` dashboard with order history and a saved profile/address editor.

**Content**
- Blog engine + 4 starter articles.

---

## 2. Required before launch (owner actions — code can't supply these)

### a. Set environment variables
Copy `.env.example` and fill in real values in **Vercel → Project → Settings → Environment Variables**.
Without these the site runs but: order emails won't send, payments show placeholder numbers, and the admin panel is disabled.

Critical: `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_SECRET`, `RESEND_API_KEY`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, and the JazzCash/EasyPaisa/bank details.

### b. Run database migrations
In the Supabase SQL editor, run every file in `supabase/migrations/` in order (001 → 009).
`009_profiles.sql` is new and powers customer accounts.

### c. Enable Supabase Auth
Supabase Dashboard → Authentication → Providers → enable **Email**. Decide whether to require
email confirmation (the register flow already handles both cases). Set the Site URL to your domain.

### d. Replace placeholder product photography
`data/products.ts` and `lib/blog.ts` use Unsplash stock images (there's a `TODO` in the products file).
Upload real photos to Supabase Storage and swap the URLs. **This is the single highest-impact pre-launch task.**

### e. Connect analytics & search
- Verify the domain in **Google Search Console** and submit `https://www.akautocare.pk/sitemap.xml`.
- Confirm GA4 and Meta Pixel IDs are set (events are already wired).
- Create a **Google Business Profile** for local SEO (the `LocalBusiness` schema supports this).

---

## 3. Intentionally NOT built (documented per request)

These need third-party accounts/credentials and were scoped out. Notes for whoever implements them later:

### Distributed rate limiting (security hardening)
`lib/rateLimit.ts` is in-memory, so limits are **per serverless instance** and can be bypassed
across instances on Vercel. For real brute-force protection on `/api/admin/login`, replace it with
**Upstash Redis** (`@upstash/ratelimit` + `@upstash/redis`). The function signature can stay the same;
only the storage backend changes.

### SMS / WhatsApp order notifications
Currently customers are asked to message WhatsApp manually. To send **automated** confirmations,
integrate **Twilio** (SMS + WhatsApp Business API) inside `app/api/orders/route.ts` right after the
order insert, mirroring the existing Resend email block. Needs a Twilio account + approved WhatsApp sender.

### Courier API (TCS / Leopards)
Shipping rates and tracking are currently static/manual. TCS and Leopards both offer merchant APIs
for real-time booking, label generation, and tracking. This requires a merchant account and API keys
from the courier.

### Automated payment gateway
Payments are manual (COD + screenshot verification). For instant online payments, integrate a
Pakistani gateway such as **Safepay** or **PayFast**.

---

## 4. Local development

```bash
npm install
cp .env.example .env.local   # fill in values
npm run dev
```

`npm run build` requires the Supabase env vars to be present (dummy values are fine for a build —
product/category data simply falls back to empty when the DB is unreachable).
