import type { NextConfig } from "next";

// Content-Security-Policy. 'unsafe-inline' is required for:
//   - script-src: Next.js bootstrap/hydration inline scripts, JSON-LD <script> tags in
//     layout.tsx and blog pages, the GA4 inline init script in layout.tsx.
//   - style-src: next/font + inline style={{}} attributes throughout the UI.
//
// 'strict-dynamic' was previously added (S-12) but is intentionally removed:
// in CSP Level 3 browsers it silently overrides 'unsafe-inline' AND disables the
// host allowlist, which breaks GTM (googletagmanager.com), Meta Pixel
// (connect.facebook.net), all JSON-LD structured-data scripts, and Next.js's own
// inline hydration scripts. A nonce-based CSP would be the proper alternative but
// forces every page out of SSG/ISR, which is unacceptable for this storefront.
// The remaining policy (host allowlist + 'self') still blocks scripts from
// unapproved origins.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net",
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
