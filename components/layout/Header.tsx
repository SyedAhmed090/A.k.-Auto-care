"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  ChevronDown,
  Zap,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import categories from "@/data/categories";
import { cn } from "@/lib/utils";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { openCart, itemCount } = useCartStore();
  const count = useCartStore((s) => s.itemCount());
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-[#0a0a0a]/95 backdrop-blur-md shadow-xl shadow-black/20"
            : "bg-[#0a0a0a]"
        )}
      >
        {/* Top bar */}
        <div className="border-b border-white/5 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 py-1.5 flex justify-between items-center">
            <p className="text-xs text-gray-400">
              Free shipping on orders over £75 · Use code{" "}
              <span className="text-[#e8320a] font-semibold">AKCARE10</span> for
              10% off
            </p>
            <div className="flex gap-4 text-xs text-gray-400">
              <Link href="/policies/shipping-returns" className="hover:text-white transition-colors">
                Shipping
              </Link>
              <Link href="/policies/returns" className="hover:text-white transition-colors">
                Returns
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>

        {/* Main nav */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-[#e8320a] rounded-lg flex items-center justify-center shadow-lg shadow-[#e8320a]/30">
                <Zap className="w-4 h-4 text-white fill-white" />
              </div>
              <div>
                <span className="font-black text-white text-lg leading-none tracking-tight">
                  A.K.
                </span>
                <span className="font-light text-gray-400 text-lg leading-none ml-1">
                  AUTO CARE
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    pathname === link.href
                      ? "text-white bg-white/10"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  )}
                >
                  {link.label}
                </Link>
              ))}

              {/* Categories dropdown */}
              <div className="relative">
                <button
                  onMouseEnter={() => setCatOpen(true)}
                  onMouseLeave={() => setCatOpen(false)}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  Categories <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", catOpen && "rotate-180")} />
                </button>
                {catOpen && (
                  <div
                    onMouseEnter={() => setCatOpen(true)}
                    onMouseLeave={() => setCatOpen(false)}
                    className="absolute top-full left-0 mt-1 w-64 bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                  >
                    {categories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/categories/${cat.slug}`}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cat.accent }}
                        />
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="w-9 h-9 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Search"
              >
                <Search className="w-4.5 h-4.5" />
              </button>

              {/* Cart */}
              <button
                onClick={openCart}
                className="relative w-9 h-9 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label={`Cart (${count} items)`}
              >
                <ShoppingCart className="w-4.5 h-4.5" />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-[#e8320a] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </button>

              {/* Mobile menu */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-9 h-9 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#0a0a0a]">
            <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                    pathname === link.href
                      ? "text-white bg-white/10"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-white/10 pt-3 mt-2">
                <p className="px-4 text-xs text-gray-500 uppercase tracking-widest mb-2">
                  Categories
                </p>
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/categories/${cat.slug}`}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: cat.accent }}
                    />
                    {cat.name}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
          onClick={() => setSearchOpen(false)}
        >
          <form
            onSubmit={handleSearch}
            className="w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, categories…"
                className="w-full bg-white rounded-2xl pl-14 pr-14 py-5 text-lg text-[#0f0f0f] placeholder-gray-400 outline-none shadow-2xl"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
