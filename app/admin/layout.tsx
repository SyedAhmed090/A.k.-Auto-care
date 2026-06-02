import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin | A.K. Auto Care", robots: "noindex" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {children}
    </div>
  );
}
