"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, ChevronDown, ChevronUp } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/ui/Button";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  firstName: z.string().min(2, "Required"),
  lastName: z.string().min(2, "Required"),
  address: z.string().min(5, "Enter your address"),
  city: z.string().min(2, "Required"),
  postcode: z.string().min(3, "Enter postcode"),
  country: z.string().min(2, "Required"),
  cardName: z.string().min(2, "Name on card required"),
  cardNumber: z.string().regex(/^\d{4} \d{4} \d{4} \d{4}$/, "Enter valid card number"),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/, "MM/YY format"),
  cvv: z.string().regex(/^\d{3,4}$/, "3 or 4 digits"),
});
type FormData = z.infer<typeof schema>;

function formatCardNumber(value: string) {
  return value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19);
}
function formatExpiry(value: string) {
  const v = value.replace(/\D/g, "");
  return v.length >= 2 ? v.slice(0, 2) + "/" + v.slice(2, 4) : v;
}

export default function CheckoutPage() {
  const { items, subtotal, promoDiscount, clearCart } = useCartStore();
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const sub = subtotal();
  const discount = sub * promoDiscount;
  const shipping = sub >= 75 ? 0 : 4.99;
  const total = sub - discount + shipping;

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    const orderId = "AK-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    clearCart();
    window.location.href = `/order-confirmation?order=${orderId}&total=${total.toFixed(2)}`;
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Your cart is empty.</p>
          <Link href="/shop"><Button>Shop Now</Button></Link>
        </div>
      </div>
    );
  }

  const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );

  const inputCls = (err?: string) =>
    `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${
      err ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-[#e8320a]/30 focus:border-[#e8320a]"
    }`;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Link href="/cart" className="text-sm text-gray-400 hover:text-[#0f0f0f] transition-colors mb-6 inline-flex items-center gap-1.5">
          ← Back to Cart
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-3 space-y-6">
            {/* Contact */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-black text-lg text-[#0f0f0f] mb-4">Contact</h2>
              <Field label="Email" error={errors.email?.message}>
                <input {...register("email")} type="email" placeholder="you@example.com" className={inputCls(errors.email?.message)} />
              </Field>
            </div>

            {/* Shipping */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-black text-lg text-[#0f0f0f] mb-4">Shipping Address</h2>
              <div className="grid grid-cols-2 gap-4">
                <Field label="First Name" error={errors.firstName?.message}>
                  <input {...register("firstName")} placeholder="John" className={inputCls(errors.firstName?.message)} />
                </Field>
                <Field label="Last Name" error={errors.lastName?.message}>
                  <input {...register("lastName")} placeholder="Smith" className={inputCls(errors.lastName?.message)} />
                </Field>
                <div className="col-span-2">
                  <Field label="Address" error={errors.address?.message}>
                    <input {...register("address")} placeholder="123 Main Street" className={inputCls(errors.address?.message)} />
                  </Field>
                </div>
                <Field label="City" error={errors.city?.message}>
                  <input {...register("city")} placeholder="Birmingham" className={inputCls(errors.city?.message)} />
                </Field>
                <Field label="Postcode" error={errors.postcode?.message}>
                  <input {...register("postcode")} placeholder="B1 1AA" className={inputCls(errors.postcode?.message)} />
                </Field>
                <div className="col-span-2">
                  <Field label="Country" error={errors.country?.message}>
                    <select {...register("country")} className={inputCls(errors.country?.message)}>
                      <option value="">Select country…</option>
                      <option value="GB">United Kingdom</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="AU">Australia</option>
                      <option value="DE">Germany</option>
                    </select>
                  </Field>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-lg text-[#0f0f0f]">Payment</h2>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Lock className="w-3.5 h-3.5" /> Secured by Stripe
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-xs text-amber-700 font-medium mb-4">
                Test mode — use card 4242 4242 4242 4242, any future date, any CVV
              </div>
              <div className="space-y-4">
                <Field label="Name on Card" error={errors.cardName?.message}>
                  <input {...register("cardName")} placeholder="John Smith" className={inputCls(errors.cardName?.message)} />
                </Field>
                <Field label="Card Number" error={errors.cardNumber?.message}>
                  <input
                    {...register("cardNumber")}
                    placeholder="4242 4242 4242 4242"
                    maxLength={19}
                    className={inputCls(errors.cardNumber?.message)}
                    onChange={(e) => setValue("cardNumber", formatCardNumber(e.target.value))}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Expiry" error={errors.expiry?.message}>
                    <input
                      {...register("expiry")}
                      placeholder="MM/YY"
                      maxLength={5}
                      className={inputCls(errors.expiry?.message)}
                      onChange={(e) => setValue("expiry", formatExpiry(e.target.value))}
                    />
                  </Field>
                  <Field label="CVV" error={errors.cvv?.message}>
                    <input {...register("cvv")} placeholder="123" maxLength={4} className={inputCls(errors.cvv?.message)} />
                  </Field>
                </div>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" />
                  </svg>
                  Processing…
                </span>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Pay {formatPrice(total)}
                </>
              )}
            </Button>
          </form>

          {/* Order Summary sidebar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <button
                onClick={() => setSummaryOpen(!summaryOpen)}
                className="flex items-center justify-between w-full lg:cursor-default"
              >
                <h3 className="font-black text-[#0f0f0f]">Order Summary</h3>
                <span className="lg:hidden">{summaryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</span>
              </button>

              <div className={`mt-4 space-y-3 ${summaryOpen || "hidden lg:block"}`}>
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.variant.sku}`} className="flex gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                      <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-gray-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#0f0f0f] line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-gray-400">{item.variant.label}</p>
                    </div>
                    <span className="text-xs font-bold text-[#0f0f0f] whitespace-nowrap">
                      {formatPrice(item.variant.price * item.quantity)}
                    </span>
                  </div>
                ))}

                <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span><span>{formatPrice(sub)}</span>
                  </div>
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount</span><span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between font-black text-[#0f0f0f] text-base pt-2 border-t border-gray-100">
                    <span>Total</span><span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
