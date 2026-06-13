"use client";
import { useEffect } from "react";
import { trackPurchase } from "./MetaPixel";

export default function PurchasePixel({ orderId, value }: { orderId: string; value: number }) {
  useEffect(() => {
    trackPurchase(orderId, value);
  }, [orderId, value]);
  return null;
}
