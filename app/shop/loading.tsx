export default function ShopLoading() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="pt-14 pb-16" style={{ borderBottom: "1px solid var(--line)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-3 w-24 rounded mb-4 animate-pulse" style={{ background: "var(--surface)" }} />
          <div className="h-14 w-48 rounded animate-pulse" style={{ background: "var(--surface)" }} />
          <div className="h-3 w-20 rounded mt-3 animate-pulse" style={{ background: "var(--surface)" }} />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex gap-10">
          <aside className="hidden lg:block w-52 flex-shrink-0">
            <div className="space-y-4">
              <div className="h-3 w-32 rounded animate-pulse" style={{ background: "var(--surface)" }} />
              <div className="h-8 w-full rounded animate-pulse" style={{ background: "var(--surface)" }} />
            </div>
          </aside>
          <div className="flex-1 min-w-0">
            <div className="flex justify-end mb-6">
              <div className="h-10 w-36 rounded-[11px] animate-pulse" style={{ background: "var(--surface)" }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="rounded-[var(--r)] overflow-hidden animate-pulse" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                  <div style={{ aspectRatio: "4/3", background: "var(--surface-2)" }} />
                  <div className="p-5 space-y-3">
                    <div className="h-4 w-3/4 rounded" style={{ background: "var(--line)" }} />
                    <div className="h-3 w-1/2 rounded" style={{ background: "var(--line)" }} />
                    <div className="h-6 w-1/3 rounded mt-4" style={{ background: "var(--line)" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
