"use client";

import { useEffect } from "react";
import Script from "next/script";
import { captureUTM } from "@/lib/utm";

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export default function MetaPixel() {
  if (!pixelId) return null;

  useEffect(() => {
    captureUTM();

    if (typeof window.fbq === "undefined") {
      const fbq = function (...args: unknown[]) {
        (fbq as unknown as { callMethod?: (...a: unknown[]) => void; queue: unknown[][] }).callMethod
          ? (fbq as unknown as { callMethod: (...a: unknown[]) => void }).callMethod(...args)
          : (fbq as unknown as { queue: unknown[][] }).queue.push(args);
      };
      (fbq as unknown as { push: unknown; loaded: boolean; version: string; queue: unknown[][] }).push = fbq;
      (fbq as unknown as { push: unknown; loaded: boolean; version: string; queue: unknown[][] }).loaded = true;
      (fbq as unknown as { push: unknown; loaded: boolean; version: string; queue: unknown[][] }).version = "2.0";
      (fbq as unknown as { push: unknown; loaded: boolean; version: string; queue: unknown[][] }).queue = [];
      window.fbq = fbq as unknown as (...args: unknown[]) => void;
    }

    window.fbq("init", pixelId);
    window.fbq("track", "PageView");
  }, []);

  return (
    <Script
      src="https://connect.facebook.net/en_US/fbevents.js"
      strategy="afterInteractive"
    />
  );
}

export function trackViewContent(product: {
  id: string;
  name: string;
  price: number;
  categorySlug: string;
}) {
  if (typeof window === "undefined" || typeof window.fbq === "undefined") return;
  window.fbq("track", "ViewContent", {
    content_ids: [product.id],
    content_name: product.name,
    content_category: product.categorySlug,
    value: product.price,
    currency: "PKR",
    content_type: "product",
  });
}

export function trackAddToCart(
  product: { id: string; name: string; price: number },
  variant: { label: string; price: number; sku: string },
  qty: number
) {
  if (typeof window === "undefined" || typeof window.fbq === "undefined") return;
  window.fbq("track", "AddToCart", {
    content_ids: [variant.sku],
    content_name: `${product.name} — ${variant.label}`,
    value: variant.price * qty,
    currency: "PKR",
    content_type: "product",
    num_items: qty,
  });
}

export function trackInitiateCheckout(subtotal: number, itemCount: number) {
  if (typeof window === "undefined" || typeof window.fbq === "undefined") return;
  window.fbq("track", "InitiateCheckout", {
    value: subtotal,
    currency: "PKR",
    num_items: itemCount,
  });
}

export function trackPurchase(orderId: string, value: number, currency = "PKR") {
  if (typeof window === "undefined" || typeof window.fbq === "undefined") return;
  window.fbq("track", "Purchase", {
    order_id: orderId,
    value,
    currency,
  });
}
