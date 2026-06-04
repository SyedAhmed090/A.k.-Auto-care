export default function OrderConfirmationLoading() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="max-w-md w-full text-center">
        <div
          className="w-20 h-20 rounded-full grid place-items-center mx-auto mb-6 animate-pulse"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
        />
        <div className="h-8 w-48 mx-auto mb-4 rounded" style={{ background: "var(--surface)" }} />
        <div className="h-4 w-64 mx-auto mb-8 rounded" style={{ background: "var(--surface)" }} />
        <div className="rounded-[20px] p-6 mb-8 w-full" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 w-full rounded" style={{ background: "var(--bg-2)" }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
