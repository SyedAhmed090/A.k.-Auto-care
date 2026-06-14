import type { Metadata } from "next";
import OrderTrackingClient from "./OrderTrackingClient";

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Enter your order ID and email to track the status of your A.K. Auto Care order.",
};

export default function OrderTrackingPage() {
  return <OrderTrackingClient />;
}
