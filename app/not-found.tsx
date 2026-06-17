import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-[70vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center"
      style={{ background: "var(--bg)" }}
    >
      <div className="w-full max-w-md flex flex-col items-center">
      <div
        className="text-[7rem] leading-none mb-2"
        style={{
          fontFamily: "var(--font-anton)",
          background: "linear-gradient(170deg,#fff 0%,#e7eaef 18%,#9aa0ab 46%,#fff 60%,#aeb4be 78%,#5b606b 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        404
      </div>
      <h1
        className="text-[2rem] uppercase tracking-[.01em] mb-2"
        style={{ fontFamily: "var(--font-anton)" }}
      >
        Page Not Found
      </h1>
      <p className="mb-8 text-sm" style={{ color: "var(--muted)" }}>
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2.5 px-7 py-4 rounded-[13px] font-semibold transition-all hover:-translate-y-0.5"
        style={{ background: "var(--accent)", color: "var(--on-accent)" }}
      >
        Go Home
      </Link>
      </div>
    </div>
  );
}
