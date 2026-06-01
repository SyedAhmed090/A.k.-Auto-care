import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--line)" }} className="pt-20 pb-9">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <div
              className="text-[1.8rem] tracking-[.06em] mb-4"
              style={{ fontFamily: "var(--font-anton)" }}
            >
              A<span style={{ color: "var(--accent)" }}>.</span>K AUTO CARE
            </div>
            <p className="text-[.92rem] max-w-[280px]" style={{ color: "var(--muted)" }}>
              Engineered car care for people who notice the details. Prep. Correct. Coat. Protect.
            </p>
          </div>

          {/* Shop */}
          <div className="flex flex-col">
            <h5
              className="text-[.72rem] tracking-[.14em] uppercase mb-5"
              style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}
            >
              Shop
            </h5>
            <ul className="flex flex-col gap-3">
              {[
                { label: "All Products", href: "/shop" },
                { label: "New Arrivals", href: "/shop?sort=newest" },
                { label: "Best Sellers", href: "/shop?sort=featured" },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-[.92rem] opacity-80 hover:opacity-100 transition-opacity hover:text-[var(--accent)]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="flex flex-col">
            <h5
              className="text-[.72rem] tracking-[.14em] uppercase mb-5"
              style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}
            >
              Company
            </h5>
            <ul className="flex flex-col gap-3">
              {[
                { label: "About", href: "/about" },
                { label: "The Process", href: "/about#system" },
                { label: "Contact", href: "/contact" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[.92rem] opacity-80 hover:opacity-100 transition-opacity hover:text-[var(--accent)]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="flex flex-col">
            <h5
              className="text-[.72rem] tracking-[.14em] uppercase mb-5"
              style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}
            >
              Support
            </h5>
            <ul className="flex flex-col gap-3">
              {[
                { label: "Shipping & Returns", href: "/policies/shipping-returns" },
                { label: "Privacy Policy", href: "/policies/privacy" },
                { label: "Terms of Service", href: "/policies/terms" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[.92rem] opacity-80 hover:opacity-100 transition-opacity hover:text-[var(--accent)]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between pt-7 gap-3 text-[.72rem] tracking-[.14em] uppercase text-center sm:text-left"
          style={{ borderTop: "1px solid var(--line)", fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}
        >
          <span>© {new Date().getFullYear()} A.K. Auto Care — All rights reserved</span>
          <span className="sm:text-right">Privacy · Terms · Made with precision</span>
        </div>
      </div>
    </footer>
  );
}
