import type { NextConfig } from "next";

// Content-Security-Policy. 'unsafe-inline' is kept for style-src (next/font + inline
// style={{}} attributes used throughout the UI — cannot be nonce-covered) and for
// script-src only as a legacy-browser fallback.
//
// S-12: 'strict-dynamic' is added to script-src. CSP Level 3 browsers treat
// 'strict-dynamic' as overriding 'unsafe-inline' — the 'unsafe-inline' fallback is
// silently ignored in those browsers, removing the practical XSS-via-inline-script risk.
// Older browsers that don't support 'strict-dynamic' fall back to 'unsafe-inline'.
// This is the maximum tightening achievable without nonces (which would force every page
// into dynamic rendering, breaking the SSG/ISR this storefront depends on).
//
// We deliberately do NOT migrate to a nonce-based CSP: per the Next.js 16 docs, nonces
// force every page into dynamic rendering, disabling the SSG/ISR this storefront relies
// on (product/category/shop/home all use generateStaticParams + revalidate). It also
// would not remove style-src 'unsafe-inline' — nonces only cover <style> elements, not
// the inline style={{}} attributes used across the UI. Keeping the static CSP here is the
// right trade-off; revisit only if inline styles are eliminated and dynamic rendering is
// acceptable (or via the experimental hash-based SRI approach).
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  // S-12: 'strict-dynamic' makes 'unsafe-inline' a no-op in CSP3+ browsers.
  "script-src 'self' 'unsafe-inline' 'strict-dynamic' https://www.googletagmanager.com https://connect.facebook.net",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com https://upload.wikimedia.org https://www.google-analytics.com https://www.googletagmanager.com https://www.facebook.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com https://connect.facebook.net https://www.facebook.com",
  "media-src 'self'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Additive hardening (no functional impact): tells Adobe Flash/PDF clients not to
  // load cross-domain policy files. Defense-in-depth; safe for an all-HTML/JSON app.
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  // S-13: Cross-origin isolation headers. COOP same-origin prevents cross-origin
  // window references (opener attacks). COEP is intentionally omitted: it would
  // require every cross-origin resource (GA/Supabase/Pixel) to send CORP/COEP
  // headers, which they don't. CORP same-origin is set to tighten resource loading.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      // S-08: Prevent proxy/CDN caching of user-specific or sensitive API responses.
      // All /api/admin/* routes are covered here. Per-user public API routes are
      // also included: cart operations, order placement, order tracking.
      {
        source: "/api/admin/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
      {
        source: "/api/cart/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
      {
        source: "/api/orders",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
      {
        source: "/api/order-tracking",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 750, 828, 1080, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
