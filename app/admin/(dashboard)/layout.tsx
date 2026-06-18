import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/adminAuth";
import AdminNav from "../AdminNav";

// S-07: Server-side auth guard — defense-in-depth beyond the edge proxy.
// If the proxy is bypassed or mis-configured, this stops the admin UI from
// rendering to unauthenticated requests before any data fetch happens.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <AdminNav />
      <main className="flex-1 min-w-0 overflow-auto p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
