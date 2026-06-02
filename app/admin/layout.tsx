import type { Metadata } from "next";
import AdminNav from "./AdminNav";

export const metadata: Metadata = { title: "Admin | A.K. Auto Care", robots: "noindex" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      <AdminNav />
      <main className="flex-1 overflow-auto p-6 lg:p-8">{children}</main>
    </div>
  );
}
