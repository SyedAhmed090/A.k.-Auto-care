import AdminNav from "../AdminNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <AdminNav />
      <main className="flex-1 min-w-0 overflow-auto p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
