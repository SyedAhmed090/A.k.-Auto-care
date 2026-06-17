import type { NextConfig } from "next";

// Content-Security-Policy. 'unsafe-inline' is required for scripts (Next's bootstrap +
// the inline GA4 init in app/layout.tsx) and styles (next/font + inline style={{}} used
// throughout). External origins: GA/GTM, Meta Pixel, Supabase, and the image hosts in
// `images.remotePatterns` below.
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
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Additive hardening (no functional impact): tells Adobe Flash/PDF clients not to
  // load cross-domain policy files. Defense-in-depth; safe for an all-HTML/JSON app.
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
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
