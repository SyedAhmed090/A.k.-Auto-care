// Instant loading skeleton for every admin page. Because the admin layout reads
// cookies(), all admin pages are dynamically rendered — without this boundary the
// router would freeze on the previous page until the next page's server render and
// DB queries finished, making navigation feel slow. This streams in immediately.
export default function AdminLoading() {
  return (
    <div className="animate-pulse">
      {/* Page heading */}
      <div className="h-8 w-48 rounded mb-6" style={{ background: "var(--surface)" }} />

      {/* Stat-card row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-[16px] p-5" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
            <div className="h-3 w-20 rounded mb-3" style={{ background: "var(--bg-2)" }} />
            <div className="h-7 w-24 rounded mb-2" style={{ background: "var(--bg-2)" }} />
            <div className="h-3 w-16 rounded" style={{ background: "var(--bg-2)" }} />
          </div>
        ))}
      </div>

      {/* Content block */}
      <div className="rounded-[16px] overflow-hidden" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--line)" }}>
          <div className="h-4 w-32 rounded" style={{ background: "var(--bg-2)" }} />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-4 border-t" style={{ borderColor: "var(--line)" }}>
            <div className="space-y-2">
              <div className="h-4 w-40 rounded" style={{ background: "var(--bg-2)" }} />
              <div className="h-3 w-28 rounded" style={{ background: "var(--bg-2)" }} />
            </div>
            <div className="h-4 w-20 rounded" style={{ background: "var(--bg-2)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
