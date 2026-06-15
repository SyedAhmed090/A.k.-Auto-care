"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Email is optional: filled = individual staff login, blank = shared key.
      const body = email.trim() ? { email: email.trim(), password } : { password };
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      });
      if (res.ok) {
        window.location.assign("/admin/orders");
        return;
      }
      let msg = email.trim() ? "Invalid email or password." : "Invalid password.";
      if (res.status === 429) msg = "Too many attempts. Please wait a few minutes.";
      else if (res.status === 403) msg = "Request blocked (origin). Reload the page and try again.";
      else if (res.status === 503) msg = "Admin is not configured (ADMIN_SECRET not set).";
      setError(msg);
      setLoading(false);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-[2rem] uppercase tracking-[.02em]" style={{ fontFamily: "var(--font-anton)" }}>
            A.K. Admin
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>Sign in to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="rounded-[20px] p-8 space-y-5" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
          <div>
            <label className="block text-[.72rem] tracking-[.14em] uppercase mb-2" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>
              Email <span style={{ textTransform: "none", letterSpacing: 0 }}>(staff accounts — leave blank for shared key)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              placeholder="you@akautocare.pk"
              className="w-full px-4 py-3 rounded-[11px] outline-none text-sm"
              style={{ background: "var(--bg)", border: "1px solid var(--line-2)", color: "var(--text)", fontFamily: "var(--font-hanken)" }}
            />
          </div>
          <div>
            <label className="block text-[.72rem] tracking-[.14em] uppercase mb-2" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>
              Password
            </label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="w-full px-4 py-3 pr-11 rounded-[11px] outline-none text-sm"
                style={{ background: "var(--bg)", border: "1px solid var(--line-2)", color: "var(--text)", fontFamily: "var(--font-hanken)" }}
              />
              <button
                type="button"
                onClick={() => setShow(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded cursor-pointer"
                style={{ color: "var(--muted)" }}
                tabIndex={-1}
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {error && <p className="text-xs" style={{ color: "#ef4444" }}>{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3.5 rounded-[13px] font-semibold btn-accent transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Logging in…" : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}
