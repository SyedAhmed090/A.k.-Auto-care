import Link from "next/link";
import { Zap, Share2, Globe, PlayCircle, Mail, Phone, MapPin } from "lucide-react";
import categories from "@/data/categories";

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-gray-400">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#e8320a] rounded-lg flex items-center justify-center shadow-lg shadow-[#e8320a]/30">
                <Zap className="w-4 h-4 text-white fill-white" />
              </div>
              <div>
                <span className="font-black text-white text-lg leading-none">A.K.</span>
                <span className="font-light text-gray-400 text-lg leading-none ml-1">AUTO CARE</span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed mb-5">
              Professional-grade detailing products crafted for enthusiasts who demand more from their car care routine.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Share2, href: "#", label: "Instagram" },
                { icon: Globe, href: "#", label: "Facebook" },
                { icon: PlayCircle, href: "#", label: "YouTube" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center hover:bg-[#e8320a] hover:text-white transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Shop</h3>
            <ul className="flex flex-col gap-2.5">
              <li><Link href="/shop" className="text-sm hover:text-white transition-colors">All Products</Link></li>
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/categories/${cat.slug}`} className="text-sm hover:text-white transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Help</h3>
            <ul className="flex flex-col gap-2.5">
              <li><Link href="/about" className="text-sm hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-sm hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/policies/shipping-returns" className="text-sm hover:text-white transition-colors">Shipping & Returns</Link></li>
              <li><Link href="/policies/privacy" className="text-sm hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/policies/terms" className="text-sm hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Contact</h3>
            <ul className="flex flex-col gap-3">
              <li className="flex items-start gap-2.5 text-sm">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#e8320a]" />
                <a href="mailto:hello@akautocare.co.uk" className="hover:text-white transition-colors">
                  hello@akautocare.co.uk
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#e8320a]" />
                <a href="tel:+441234567890" className="hover:text-white transition-colors">
                  +44 (0) 1234 567 890
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#e8320a]" />
                <span>Birmingham, UK</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} A.K. Auto Care. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/320px-Stripe_Logo%2C_revised_2016.svg.png" alt="Stripe" className="h-5 opacity-30" />
            <div className="flex gap-2 opacity-30">
              {["Visa", "MC", "Amex"].map((card) => (
                <div key={card} className="px-2 py-0.5 rounded bg-white/20 text-[10px] font-bold text-white">
                  {card}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
