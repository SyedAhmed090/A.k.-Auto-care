"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Tag, Package, Star, Boxes, Users, LogOut } from "lucide-react";

const NAV = [
  { href: "/admin",             label: "Dashboard", icon: LayoutDashboard, exact: true  },
  { href: "/admin/orders",      label: "Orders",    icon: ShoppingBag,     exact: false },
  { href: "/admin/products",    label: "Products",  icon: Package,         exact: false },
  { href: "/admin/inventory",   label: "Inventory", icon: Boxes,           exact: false },
  { href: "/admin/promos",      label: "Promos",    icon: Tag,             exact: false },
  { href: "/admin/reviews",     label: "Reviews",   icon: Star,            exact: false },
  { href: "/admin/customers",   label: "Customers", icon: Users,           exact: false },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router   = useRouter();

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col border-r" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
      <div className="px-5 py-6 border-b" style={{ borderColor: "var(--line)" }}>
        <p className="text-[.65rem] tracking-[.18em] uppercase" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>A.K. Auto Care</p>
        <p className="text-[1.1rem] font-bold uppercase mt-0.5" style={{ fontFamily: "var(--font-anton)" }}>Admin</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-semibold transition-all"
              style={{ background: active ? "rgba(79, 168, 230,.1)" : "transparent", color: active ? "var(--accent)" : "var(--muted)" }}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4">
        <button onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-semibold w-full transition-all cursor-pointer"
          style={{ color: "var(--muted)" }}>
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
