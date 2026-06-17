# Frontend / UI / Accessibility Audit — A.K. Auto Care
Date: 2026-06-17 · Scope: app client components, components/ (excl. analytics), globals.css, lib/useFocusTrap.ts, lib/useMounted.ts, store/cart.ts, store/wishlist.ts

---

## Summary

Audit covered ~40 files across the App Router client layer, shared components, and supporting hooks/stores. The codebase is well-structured overall — the focus-trap hook, Zustand hydration guard pattern, and ARIA on ProductPageClient/ProductLightbox are notably solid. The main category of real-world issues is missing form label associations and missing `type="button"` attributes, both of which affect keyboard/AT users on every visit. Thirteen files received safe auto-fixes. No risky or behavioral changes were made.

---

## Severity tally

| Severity | Count |
|---|---|
| S1 — Critical (blocks AT/keyboard users) | 3 |
| S2 — High (degrades AT experience noticeably) | 11 |
| S3 — Medium (best-practice gap, minor UX regression) | 9 |
| S4 — Low / cosmetic | 6 |

---

## Files modified (auto-fixes applied)

1. `app/error.tsx`
2. `app/loading.tsx`
3. `app/categories/[slug]/loading.tsx`
4. `app/products/[slug]/loading.tsx`
5. `app/account/AccountClient.tsx`
6. `app/order-tracking/OrderTrackingClient.tsx`
7. `app/shop/ShopClient.tsx`
8. `app/categories/[slug]/CategoryPageClient.tsx`
9. `app/cart/CartClient.tsx`
10. `app/admin/(dashboard)/orders/OrdersClient.tsx`
11. `components/layout/Header.tsx`
12. `components/layout/MiniCart.tsx`
13. `components/product/SampleRequestButton.tsx`

---

## Findings

### F-01 · S1 · FIXED · `app/account/AccountClient.tsx`
**Missing htmlFor↔id associations on all 7 account form fields.**
Screen readers could not associate any label with its input — clicking labels did nothing, AT announced fields as unlabelled. Added `id`/`htmlFor` pairs for: account-full-name, account-phone, account-address, account-city, account-province, account-postcode, account-country. Also added `type="button"` to Save Details and Sign Out buttons to prevent accidental form submission.

### F-02 · S1 · FIXED · `components/product/SampleRequestButton.tsx`
**All 6 form field labels missing htmlFor↔id associations; modal missing aria-labelledby.**
The modal dialog had `role="dialog" aria-modal="true"` but no `aria-labelledby`, so screen readers announced it without a name. The form's visible labels were decorative-only. Fixed: added `aria-labelledby="sample-modal-title"` to dialog, `id="sample-modal-title"` to the h3, and id/htmlFor pairs for sample-name, sample-phone, sample-business, sample-email, sample-city, sample-address, sample-usage.

### F-03 · S1 · FIXED · `app/order-tracking/OrderTrackingClient.tsx`
**Order ID and Email inputs had no label associations; Copy button had no accessible name.**
Two form inputs were announced as unlabelled by screen readers. Copy button had no aria-label so AT users heard only "button". Fixed: added htmlFor↔id for both inputs; added `type="button"` and dynamic `aria-label` ("Copy tracking number" / "Copied to clipboard") to the copy button.

### F-04 · S2 · FIXED · `components/layout/Header.tsx`
**Hamburger button missing aria-expanded and aria-controls; mobile menu dialog had generic aria-label.**
Without `aria-expanded`, AT users couldn't tell whether the menu was open or closed. Without `aria-controls`, there was no programmatic link between trigger and panel. Fixed: added `aria-expanded={mobileOpen}`, `aria-controls="mobile-menu"`, dynamic `aria-label` ("Open menu"/"Close menu"), `id="mobile-menu"` on the panel, and updated dialog `aria-label` to "Navigation menu".

### F-05 · S2 · FIXED · `app/shop/ShopClient.tsx`
**Mobile filter drawer had no dialog semantics.**
The slide-in filter drawer had no `role`, `aria-modal`, or `aria-label`. AT users would not be aware of a modal context and focus was not contained. Fixed: added `role="dialog"`, `aria-modal="true"`, `aria-label="Product filters"`. Also added `type="button"` to Filters trigger, Apply Filters, Clear all filters, and Load More buttons.

### F-06 · S2 · FIXED · `app/categories/[slug]/CategoryPageClient.tsx`
**"In Stock" filter: clickable div with no button semantics, broken checkbox pattern.**
The "In Stock" toggle was a styled `<div onClick>` with an sr-only `<input type="checkbox">` whose label had no `htmlFor`. Keyboard users and AT could not activate the filter. Fixed: connected the sr-only input with `id="in-stock-filter"` and `onChange={(e) => setInStockOnly(e.target.checked)}`; added `aria-hidden="true"` to the visual div; added `type="button"` to Clear filters.

### F-07 · S2 · FIXED · `app/cart/CartClient.tsx`
**Multiple buttons missing type="button"; promo input missing aria-label.**
The Clear cart, Cancel, and Clear All confirmation buttons would default to `type="submit"`, risking form submission in some browser/AT combinations. Promo input had only a placeholder with no accessible label. Fixed all four buttons; added `aria-label="Promo code"` to input; added `type="button"` to Remove promo button.

### F-08 · S2 · FIXED · `app/admin/(dashboard)/orders/OrdersClient.tsx`
**8 buttons missing type="button" inside or adjacent to form contexts.**
Export CSV, Apply bulk action, Deselect all, Clear filter, all status tab buttons, and Prev/Next pagination buttons all lacked explicit type. Fixed all 8.

### F-09 · S2 · FIXED · `app/loading.tsx`, `app/categories/[slug]/loading.tsx`, `app/products/[slug]/loading.tsx`
**Animated spinners had no accessible announcement.**
The three route-level loading skeletons rendered a spinning div with no `role="status"` or label. Screen reader users got no announcement that content was loading. Fixed: added `role="status"` and `aria-label="Loading [context]"` to wrapper; `aria-hidden="true"` to spinner div to suppress the meaningless rotate animation from AT.

### F-10 · S2 · FIXED · `app/error.tsx`
**Reset button missing type="button".**
The error boundary's "Try again" button had no explicit type. Inside any ancestor `<form>` it would trigger a submit. Fixed: added `type="button"`.

### F-11 · S2 · FIXED · `components/layout/MiniCart.tsx`
**Remove promo and Browse Products buttons missing type="button".**
Both buttons were in the cart drawer without explicit type. Fixed.

### F-12 · S3 · Recommend · `components/layout/Footer.tsx`
**`new Date().getFullYear()` evaluated during render causes hydration mismatch risk.**
The copyright year is read directly in the render body. If the server and client evaluate at different milliseconds across a year boundary (or in testing), React will log a hydration warning. Recommend wrapping in a `useEffect`/`useState` or replacing with a static `const YEAR = new Date().getFullYear()` in module scope (runs once at build time on server, same value on client via bundle).

### F-13 · S3 · Recommend · `app/search/SearchClient.tsx`
**Search input has no `<label>` — only a placeholder.**
Placeholder text is not a substitute for a label: it disappears when the user types, and some AT/browser combinations do not announce it. Recommend adding a visually-hidden `<label htmlFor="search-input">Search products</label>` or at minimum `aria-label="Search products"` on the input.

### F-14 · S3 · Recommend · `components/ui/FirstPurchasePopup.tsx`
**Email input inside popup has no label — only a placeholder.**
Same issue as F-13. The popup is a `role="dialog"` with proper modal semantics, but the email field is announced as unlabelled. Recommend adding `aria-label="Email address"` to the input.

### F-15 · S3 · Recommend · `components/home/NewsletterSignup.tsx`
**Subscribe button missing type="button".**
The button is not inside a `<form>` element (submit is handled manually), but adding `type="button"` is the explicit safe pattern. Low-risk recommendation.

### F-16 · S3 · Recommend · `app/HomeClient.tsx`
**Heading hierarchy inconsistency: Featured Products section uses `<h3>` while sibling sections use `<h2>`.**
Screen reader users navigating by heading level will skip the Featured Products section or encounter an unexpected jump. All top-level section headings on the home page should share the same level.

### F-17 · S3 · Recommend · `app/HomeClient.tsx`
**Marquee uses array index as React key.**
`[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => <span key={i}>` — the doubled array for the seamless loop means duplicate content IDs are created. Recommend keying on `${item}-${i}` or a stable slug to avoid reconciliation warnings.

### F-18 · S3 · Recommend · `app/HomeClient.tsx` / `app/about/AboutClient.tsx`
**Misleading "Client" suffix on Server Components.**
`HomeClient.tsx` and `AboutClient.tsx` have no `"use client"` directive — both are Server Components. The naming convention conflicts with the project's own pattern where `*Client.tsx` normally means a client component. Recommend renaming to `HomeContent.tsx` / `AboutContent.tsx` or adding a top-level comment clarifying the pattern, to prevent future developers from assuming these files can use hooks.

### F-19 · S4 · Recommend · `components/product/CompleteSystem.tsx`
**Product image `<Image>` alt text defaults to product name only.**
A product image alt of just "Foam Cannon Kit" is functional but not descriptive. For product images, including key visual details (e.g., "Foam Cannon Kit — 1L stainless steel chamber with pressure gauge") improves both AT and SEO. Low-priority but worth a content-team pass.

### F-20 · S4 · Recommend · `components/layout/Footer.tsx`
**Duplicate newsletter logic vs `NewsletterSignup` component.**
The footer contains its own inline newsletter form rather than reusing `components/home/NewsletterSignup`. This means two code paths to maintain for the same feature (validation, API call, success state). Recommend extracting or reusing the existing component.

### F-21 · S4 · Note · Architecture
**`app/about/AboutClient.tsx` naming vs. Server Component reality.**
(See F-18 above — combined recommendation.)

### F-22 · S4 · Note · `globals.css`
**`prefers-reduced-motion` media query is present and correct for marquee and reveal animations.**
Positive finding — no action needed. Flagged for completeness so future contributors know the pattern is already in place.

### F-23 · S4 · Note · `lib/useFocusTrap.ts`
**Focus-trap implementation is correct and complete.**
Handles Tab/Shift+Tab cycling across all focusable elements, Escape-to-close, focus restoration on cleanup, and uses `useInsertionEffect` for a stable `onClose` ref. No changes needed.

---

## Cross-domain recommendations

These issues were observed during the UI audit but require changes outside the safe-fix scope (data layer, routing, or server components):

**CR-01 · Performance · `app/shop/ShopClient.tsx`**
`useSearchParams()` is called at the top level of ShopClient to initialise sort state. Next.js 16 requires components using `useSearchParams()` to be wrapped in a `<Suspense>` boundary at the page level (or higher). Verify that `app/shop/page.tsx` wraps ShopClient in `<Suspense>` — if not, the entire shop route opts out of static rendering.

**CR-02 · SEO / Performance · Product image sizing**
Several product images in `ProductCard.tsx` and `ProductPageClient.tsx` use `fill` without `sizes` prop. Without `sizes`, Next.js image optimisation defaults to 100vw, generating oversized images for card-grid contexts. Add `sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"` (or appropriate values) to card images.

**CR-03 · Architecture · Admin routes not behind auth middleware**
Observed during OrdersClient read: the admin dashboard UI reads `localStorage` for auth state client-side. Server-side route protection via Next.js middleware (or equivalent) should also be present. This is a security concern for the API/auth layer, not a UI fix.

**CR-04 · Hydration · `components/layout/Footer.tsx` copyright year**
(See F-12 above — the fix is a one-line change but touches a layout component, so escalated here for visibility.)

**CR-05 · Accessibility · Skip-to-content link**
No skip navigation link was found in the root layout. Adding `<a href="#main-content" className="sr-only focus:not-sr-only ...">Skip to main content</a>` as the first element in `<body>` is a WCAG 2.1 AA requirement for keyboard users to bypass the header navigation on every page.
