"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import logoMark from "@/public/logo-mark.png";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingCart, Heart, User, Menu, X } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { useMounted } from "@/lib/useMounted";
import { cn } from "@/lib/utils";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const mounted = useMounted();
  const count = useCartStore((s) => s.itemCount());
  const openCart = useCartStore((s) => s.openCart);
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const [logoError, setLogoError] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const searchOverlayRef = useRef<HTMLDivElement>(null);

  // Focus-trap both overlays: moves focus in on open, cycles Tab, Escape closes,
  // and restores focus to the trigger on close.
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  useFocusTrap(mobileMenuRef, mobileOpen, closeMobile);
  useFocusTrap(searchOverlayRef, searchOpen, closeSearch);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { href: "/shop", label: "Shop" },
    { href: "/about", label: "About" },
    { href: "/faq", label: "FAQ" },
    { href: "/order-tracking", label: "Track Order" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <>
      <header
        className={cn(
          "fixed top-9 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b bg-[var(--header-bg)] backdrop-blur-[18px]"
            : "border-b border-transparent"
        )}
        style={{ borderColor: scrolled ? "var(--line)" : "transparent" }}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-[78px]">
            {/* Brand */}
            <Link href="/" className="flex items-center gap-3">
              {/* Shield mark statically imported from public/logo-mark.png so Next emits a
                  content-hashed URL (/_next/static/media/…) that auto-busts browser/CDN
                  caches whenever the logo file changes — no more stale logo on mobile.
                  If it still fails to load, onError swaps in the CSS mark below. */}
              {!logoError ? (
                <Image
                  src={logoMark}
                  alt="A.K. Auto Care"
                  priority
                  onError={() => setLogoError(true)}
                  className="w-[40px] h-[40px] object-contain"
                />
              ) : (
                <div
                  className="w-[38px] h-[38px] rounded-[9px] grid place-items-center text-[.95rem] tracking-[.02em]"
                  style={{
                    background: "linear-gradient(145deg,#23272f,#0c0e12)",
                    color: "#fff",
                    boxShadow: "0 6px 18px rgba(20,23,28,.18)",
                    fontFamily: "var(--font-anton)",
                  }}
                >
                  A<span style={{ color: "var(--accent)" }}>.</span>K
                </div>
              )}
              <div style={{ fontFamily: "var(--font-anton)" }}>
                <div className="text-[1.18rem] tracking-[.08em] leading-none text-[var(--text)]">
                  AUTO CARE
                </div>
                <div
                  className="text-[.52rem] tracking-[.42em] mt-[3px]"
                  style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}
                >
                  PRECISION DETAIL CO.
                </div>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-[34px]">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-[.92rem] font-medium transition-colors relative group"
                  style={{ color: pathname === l.href ? "var(--text)" : "var(--muted)" }}
                >
                  {l.label}
                  <span
                    className="absolute left-0 -bottom-1.5 h-[2px] transition-all duration-300 group-hover:w-full"
                    style={{
                      background: "var(--accent)",
                      width: pathname === l.href ? "100%" : "0",
                    }}
                  />
                </Link>
              ))}

            </div>

            {/* Tools */}
            <div className="flex items-center gap-[18px]">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-[42px] h-[42px] rounded-[11px] grid place-items-center transition-all cursor-pointer"
                style={{ border: "1px solid var(--line)", background: "var(--hover)", color: "var(--text)" }}
                aria-label="Search"
              >
                <Search className="w-[18px] h-[18px]" />
              </button>

              <Link
                href="/account"
                className="hidden sm:grid w-[42px] h-[42px] rounded-[11px] place-items-center transition-all cursor-pointer"
                style={{ border: "1px solid var(--line)", background: "var(--hover)", color: "var(--text)" }}
                aria-label="My account"
              >
                <User className="w-[18px] h-[18px]" />
              </Link>

              <Link
                href="/wishlist"
                className="hidden sm:grid w-[42px] h-[42px] rounded-[11px] place-items-center transition-all cursor-pointer relative"
                style={{ border: "1px solid var(--line)", background: "var(--hover)", color: "var(--text)" }}
                aria-label="Wishlist"
              >
                <Heart className="w-[18px] h-[18px]" />
                <span
                  aria-hidden={!mounted || wishlistCount === 0}
                  className="absolute -top-[7px] -right-[7px] min-w-[19px] h-[19px] rounded-full grid place-items-center px-[5px] text-[.62rem] font-bold transition-opacity duration-200"
                  style={{
                    background: "var(--accent)",
                    color: "var(--on-accent)",
                    fontFamily: "var(--font-space-mono)",
                    opacity: mounted && wishlistCount > 0 ? 1 : 0,
                  }}
                >
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              </Link>

              <button
                onClick={openCart}
                className="w-[42px] h-[42px] rounded-[11px] grid place-items-center transition-all cursor-pointer relative"
                style={{ border: "1px solid var(--line)", background: "var(--hover)", color: "var(--text)" }}
                aria-label="Cart"
              >
                <ShoppingCart className="w-[18px] h-[18px]" />
                <span
                  aria-hidden={!mounted || count === 0}
                  className="absolute -top-[7px] -right-[7px] min-w-[19px] h-[19px] rounded-full grid place-items-center px-[5px] text-[.62rem] font-bold transition-opacity duration-200"
                  style={{
                    background: "var(--accent)",
                    color: "var(--on-accent)",
                    fontFamily: "var(--font-space-mono)",
                    opacity: mounted && count > 0 ? 1 : 0,
                  }}
                >
                  {count > 9 ? "9+" : count}
                </span>
              </button>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-[42px] h-[42px] rounded-[11px] grid place-items-center transition-all cursor-pointer"
                style={{ border: "1px solid var(--line)", background: "var(--hover)", color: "var(--text)" }}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        ref={mobileMenuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        aria-hidden={!mobileOpen}
        inert={!mobileOpen || undefined}
        className={cn(
          "fixed inset-0 z-[99] flex flex-col justify-center items-start gap-2 px-8 transition-transform duration-500",
          mobileOpen ? "translate-y-0" : "-translate-y-full"
        )}
        style={{ background: "var(--panel)", backdropFilter: "blur(20px)" }}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-6 right-6 w-[42px] h-[42px] rounded-[11px] grid place-items-center cursor-pointer"
          style={{ border: "1px solid var(--line)", background: "var(--hover)", color: "var(--text)" }}
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>

        {[...navLinks, { href: "/wishlist", label: "Wishlist" }, { href: "/account", label: "My Account" }].map((l) => (
          <Link
            key={l.label}
            href={l.href}
            className="w-full py-3 border-b text-[2.4rem] uppercase"
            style={{ fontFamily: "var(--font-anton)", borderColor: "var(--line)" }}
            onClick={() => setMobileOpen(false)}
          >
            {l.label}
          </Link>
        ))}

      </div>

      {/* Search overlay */}
      {searchOpen && (
        <div
          ref={searchOverlayRef}
          role="dialog"
          aria-modal="true"
          aria-label="Search products"
          className="fixed inset-0 z-[70] flex items-start justify-center pt-24 px-4"
          style={{ background: "var(--scrim)", backdropFilter: "blur(12px)" }}
          onClick={() => setSearchOpen(false)}
        >
          <form
            onSubmit={handleSearch}
            className="w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "var(--muted)" }} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products…"
                className="w-full rounded-[16px] pl-14 pr-14 py-5 text-lg outline-none"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--line-2)",
                  color: "var(--text)",
                  fontFamily: "var(--font-hanken)",
                }}
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
                className="absolute right-5 top-1/2 -translate-y-1/2"
                style={{ color: "var(--muted)" }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
