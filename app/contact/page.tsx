"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Phone, MapPin, CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});
type FormData = z.infer<typeof schema>;

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 1000));
    setSent(true);
  };

  const inputCls = (err?: string) =>
    `w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors ${
      err ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-[#e8320a]/30 focus:border-[#e8320a]"
    }`;

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-[#0a0a0a] pt-10 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#e8320a] mb-2">Get in Touch</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white">Contact Us</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Info */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-black text-[#0f0f0f] mb-6">We&apos;re here to help</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              Have a question about our products, an order, or just want detailing advice? Send us a message and we&apos;ll get back to you within 24 hours.
            </p>
            <div className="space-y-4">
              {[
                { icon: Mail, label: "Email", value: "hello@akautocare.co.uk", href: "mailto:hello@akautocare.co.uk" },
                { icon: Phone, label: "Phone", value: "+44 (0) 1234 567 890", href: "tel:+441234567890" },
                { icon: MapPin, label: "Location", value: "Birmingham, UK", href: "#" },
              ].map(({ icon: Icon, label, value, href }) => (
                <a key={label} href={href} className="flex items-start gap-4 group">
                  <div className="w-10 h-10 bg-[#e8320a]/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#e8320a] transition-colors">
                    <Icon className="w-4.5 h-4.5 text-[#e8320a] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</p>
                    <p className="text-sm font-semibold text-[#0f0f0f] group-hover:text-[#e8320a] transition-colors">{value}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {sent ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-emerald-50 rounded-2xl border border-emerald-100">
                <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
                <h3 className="text-2xl font-black text-[#0f0f0f] mb-2">Message Sent!</h3>
                <p className="text-gray-500 max-w-sm">Thanks for reaching out. We&apos;ll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-50 rounded-2xl p-8 border border-gray-100 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Name</label>
                    <input {...register("name")} placeholder="Your name" className={inputCls(errors.name?.message)} />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Email</label>
                    <input {...register("email")} type="email" placeholder="you@example.com" className={inputCls(errors.email?.message)} />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Subject</label>
                  <input {...register("subject")} placeholder="How can we help?" className={inputCls(errors.subject?.message)} />
                  {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5">Message</label>
                  <textarea {...register("message")} rows={5} placeholder="Tell us more…" className={inputCls(errors.message?.message)} />
                  {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>}
                </div>
                <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
                  {isSubmitting ? "Sending…" : "Send Message"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
