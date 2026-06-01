import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, Beaker, Users, Truck } from "lucide-react";
import Button from "@/components/ui/Button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about A.K. Auto Care — our story, our standards, and our commitment to professional detailing chemistry.",
};

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="relative h-72 sm:h-96 overflow-hidden bg-[#0a0a0a]">
        <Image
          src="https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?w=1600&q=80"
          alt="About A.K. Auto Care"
          fill
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[#e8320a] mb-3">Our Story</p>
            <h1 className="text-4xl sm:text-6xl font-black text-white">About A.K. Auto Care</h1>
          </div>
        </div>
      </div>

      {/* Story */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#e8320a] mb-3">Who We Are</p>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0f0f0f] mb-5 leading-tight">
              Born from a passion for<br />paint perfection.
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                A.K. Auto Care was founded by a group of detailing obsessives who were tired of choosing between professional-grade results and products accessible to the everyday enthusiast. We believed there was a better way.
              </p>
              <p>
                Every formula in our range is developed and tested in real-world conditions — on show cars, daily drivers, and everything in between. We don&apos;t launch a product until it outperforms what&apos;s already on the market.
              </p>
              <p>
                Today, A.K. Auto Care products are used by independent detailers, car clubs, and passionate owners across the UK and beyond. Our mission is simple: give you the tools to make your car look its absolute best.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden">
              <Image src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80" alt="Detailing in action" fill className="object-cover" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-[#e8320a] text-white rounded-xl p-4 shadow-xl">
              <p className="text-3xl font-black">4.9★</p>
              <p className="text-xs font-semibold opacity-80">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#e8320a] mb-2 text-center">Our Principles</p>
          <h2 className="text-3xl font-black text-[#0f0f0f] text-center mb-10">What We Stand For</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Beaker, title: "Proper Formulation", desc: "Every product is chemically engineered for a specific job, not a jack-of-all-trades solution." },
              { icon: Award, title: "Proven Performance", desc: "We test on real paint in real conditions before anything reaches the shop." },
              { icon: Users, title: "Community First", desc: "Built with feedback from detailers of every experience level — beginner to pro." },
              { icon: Truck, title: "Fast UK Delivery", desc: "Orders dispatched same day when placed before 2 PM. Free shipping over £75." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="w-12 h-12 bg-[#e8320a]/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-[#e8320a]" />
                </div>
                <h3 className="font-black text-[#0f0f0f] mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#0a0a0a] text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-black text-white mb-4">Ready to experience the difference?</h2>
          <p className="text-gray-400 mb-6">Explore our full range of professional detailing products.</p>
          <Link href="/shop">
            <Button size="lg">Shop Now <ArrowRight className="w-5 h-5" /></Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
