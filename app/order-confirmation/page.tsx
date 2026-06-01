"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { Suspense } from "react";

function Confirmation() {
  const params = useSearchParams();
  const orderId = params.get("order") ?? "AK-XXXXXX";
  const total = params.get("total") ?? "0.00";

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-black text-[#0f0f0f] mb-2">Order Confirmed!</h1>
        <p className="text-gray-500 mb-6">
          Thank you for your order. We&apos;ll send a confirmation to your email shortly.
        </p>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 text-left">
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-5 h-5 text-[#e8320a]" />
            <h2 className="font-black text-[#0f0f0f]">Order Details</h2>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Order Number</span>
              <span className="font-bold text-[#0f0f0f] font-mono">{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Order Total</span>
              <span className="font-bold text-[#0f0f0f]">£{total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Estimated Delivery</span>
              <span className="font-bold text-[#0f0f0f]">3–5 business days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className="text-emerald-600 font-bold">Processing</span>
            </div>
          </div>
        </div>

        <Link href="/shop">
          <Button size="lg" className="w-full">
            Continue Shopping <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
        <Link href="/" className="block mt-3 text-sm text-gray-400 hover:text-[#0f0f0f] transition-colors">
          Return to Home
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense>
      <Confirmation />
    </Suspense>
  );
}
