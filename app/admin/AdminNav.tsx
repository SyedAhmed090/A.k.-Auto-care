"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { LayoutDashboard, ShoppingBag, Tag, Package, Star, Boxes, Users, Mail, MailCheck, MessageSquare, FlaskConical, ShoppingCart, FileText, Settings, ShieldCheck, History, LogOut, Menu, X } from "lucide-react";

const NAV = [
  { href: "/admin",                 label: "Dashboard",       icon: LayoutDashboard, exact: true  },
  { href: "/admin/orders",          label: "Orders",          icon: ShoppingBag,     exact: false },
  { href: "/admin/products",        label: "Products",        icon: Package,         exact: false },
  { href: "/admin/inventory",       label: "Inventory",       icon: Boxes,           exact: false },
  { href: "/admin/promos",          label: "Promos",          icon: Tag,             exact: false },
  { href: "/admin/reviews",         label: "Reviews",         icon: Star,            exact: false },
  { href: "/admin/customers",       label: "Customers",       icon: Users,           exact: false },
  { href: "/admin/messages",        label: "Messages",        icon: MessageSquare,   exact: false, badge: "messages" },
  { href: "/admin/sample-requests",  label: "Sample Requests", icon: FlaskConical,    exact: false, badge: "samples" },
  { href: "/admin/abandoned-carts", label: "Abandoned Carts", icon: ShoppingCart,    exact: false },
  { href: "/admin/newsletter",      label: "Newsletter",      icon: Mail,            exact: false },
  { href: "/admin/reports",         label: "Reports",         icon: FileText,        exact: false },
  { href: "/admin/email-templates", label: "Email Templates", icon: MailCheck,       exact: false },
  { href: "/admin/settings",        label: "Settings",        icon: Settings,        exact: false },
  { href: "/admin/staff",           label: "Staff",           icon: ShieldCheck,     exact: false },
  { href: "/admin/activity",        label: "Activity",        icon: History,         exact: false },
];

export default function AdminNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [newSamples, setNewSamples] = useState(0);

  // Poll the new-count for the Messages and Sample Requests badges.
  useEffect(() => {
    let active = true;
    const fetchCounts = async () => {
      try {
        const [msgRes, sampleRes] = await Promise.all([
          fetch("/api/admin/contact-messages?status=new"),
          fetch("/api/admin/sample-requests?status=new"),
        ]);
        if (active && msgRes.ok) setUnread((await msgRes.json()).newCount ?? 0);
        if (active && sampleRes.ok) setNewSamples((await sampleRes.json()).newCount ?? 0);
      } catch { /* ignore — badges are best-effort */ }
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 60_000);
    return () => { active = false; clearInterval(interval); };
  }, [pathname]);

  // Close the drawer whenever the route changes (mobile navigation).
  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.assign("/admin/login");
  };

  const sidebar = (
    <>
      <div className="px-5 py-6 border-b flex items-center justify-between" style={{ borderColor: "var(--line)" }}>
        <div>
          <p className="text-[.65rem] tracking-[.18em] uppercase" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>A.K. Auto Care</p>
          <p className="text-[1.1rem] font-bold uppercase mt-0.5" style={{ fontFamily: "var(--font-anton)" }}>Admin</p>
        </div>
        <button
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="lg:hidden p-2 -mr-2 rounded-[8px] cursor-pointer transition-all hover:bg-white/10"
          style={{ color: "var(--muted)" }}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon, exact, badge }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          const badgeCount = badge === "messages" ? unread : badge === "samples" ? newSamples : 0;
          const showBadge = badgeCount > 0;
          return (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-semibold transition-all"
              style={{ background: active ? "rgba(79, 168, 230,.1)" : "transparent", color: active ? "var(--accent)" : "var(--muted)" }}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {showBadge && (
                <span
                  className="text-[.62rem] font-bold rounded-full px-1.5 min-w-[18px] text-center"
                  style={{ background: "var(--accent)", color: "#000", fontFamily: "var(--font-space-mono)" }}
                >
                  {badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4">
        <button onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-semibold w-full transition-all cursor-pointer hover:bg-red-500/10 hover:text-red-400"
          style={{ color: "var(--muted)" }}>
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Log Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar (< lg) */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center gap-3 px-4 py-3 border-b"
        style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          className="p-2 -ml-2 rounded-[8px] cursor-pointer transition-all hover:bg-white/10"
          style={{ color: "var(--text)" }}
        >
          <Menu className="w-5 h-5" />
        </button>
        <p className="text-[1rem] font-bold uppercase" style={{ fontFamily: "var(--font-anton)" }}>Admin</p>
      </div>

      {/* Desktop fixed sidebar (>= lg) */}
      <aside className="hidden lg:flex w-56 flex-shrink-0 flex-col border-r" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
        {sidebar}
      </aside>

      {/* Mobile off-canvas drawer (< lg) */}
      <div className={`lg:hidden fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{ background: "rgba(0,0,0,.6)", opacity: open ? 1 : 0 }}
          onClick={() => setOpen(false)}
        />
        <aside
          className="absolute inset-y-0 left-0 w-64 max-w-[80%] flex flex-col border-r transition-transform duration-300"
          style={{
            background: "var(--surface)",
            borderColor: "var(--line)",
            transform: open ? "translateX(0)" : "translateX(-100%)",
          }}
        >
          {sidebar}
        </aside>
      </div>
    </>
  );
}
