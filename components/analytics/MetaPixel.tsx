"use client";

import { useEffect } from "react";
import Script from "next/script";
import { captureUTM } from "@/lib/utm";
import { gaEvent } from "@/lib/ga";

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export default function MetaPixel() {
  useEffect(() => {
    if (!pixelId) return;

    captureUTM();

    if (typeof window.fbq === "undefined") {
      interface FbqStub {
        (...args: unknown[]): void;
        callMethod?: (...a: unknown[]) => void;
        push: FbqStub;
        loaded: boolean;
        version: string;
        queue: unknown[][];
      }
      const stub = function (...args: unknown[]) {
        stub.callMethod ? stub.callMethod(...args) : stub.queue.push(args);
      } as unknown as FbqStub;
      stub.push = stub;
      stub.loaded = true;
      stub.version = "2.0";
      stub.queue = [];
      window.fbq = stub;
    }

    window.fbq("init", pixelId);
    window.fbq("track", "PageView");
  }, []);

  if (!pixelId) return null;

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
  gaEvent("view_item", {
    currency: "PKR",
    value: product.price,
    items: [{ item_id: product.id, item_name: product.name, item_category: product.categorySlug, price: product.price }],
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
  gaEvent("add_to_cart", {
    currency: "PKR",
    value: variant.price * qty,
    items: [{ item_id: variant.sku, item_name: `${product.name} — ${variant.label}`, price: variant.price, quantity: qty }],
  });
}

export function trackInitiateCheckout(subtotal: number, itemCount: number) {
  if (typeof window === "undefined" || typeof window.fbq === "undefined") return;
  window.fbq("track", "InitiateCheckout", {
    value: subtotal,
    currency: "PKR",
    num_items: itemCount,
  });
  gaEvent("begin_checkout", { currency: "PKR", value: subtotal, num_items: itemCount });
}

export function trackPurchase(orderId: string, value: number, currency = "PKR") {
  if (typeof window === "undefined" || typeof window.fbq === "undefined") return;
  window.fbq("track", "Purchase", {
    order_id: orderId,
    value,
    currency,
  });
  gaEvent("purchase", { transaction_id: orderId, value, currency });
}
