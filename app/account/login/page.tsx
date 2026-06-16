"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      router.push("/account");
      router.refresh();
    } catch {
      setError("Could not sign in. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-black uppercase mb-2 text-center" style={{ fontFamily: "var(--font-anton)", color: "var(--text)" }}>
          Sign In
        </h1>
        <p className="text-sm text-center mb-8" style={{ color: "var(--muted)" }}>
          Welcome back. Access your orders and saved details.
        </p>

        <form onSubmit={submit} className="rounded-[20px] p-7 space-y-4" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
          <div>
            <label className="block text-[.82rem] tracking-[.01em] font-medium mb-2" style={{ fontFamily: "var(--font-hanken)", color: "var(--muted)" }}>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-[11px] text-sm outline-none"
              style={{ background: "var(--bg)", border: "1px solid var(--line-2)", color: "var(--text)", fontFamily: "var(--font-hanken)" }} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[.82rem] tracking-[.01em] font-medium" style={{ fontFamily: "var(--font-hanken)", color: "var(--muted)" }}>Password</label>
              <Link href="/account/forgot-password" className="text-[.72rem] tracking-[.04em] hover:text-[var(--accent)]" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input type={show ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-11 rounded-[11px] text-sm outline-none"
                style={{ background: "var(--bg)", border: "1px solid var(--line-2)", color: "var(--text)", fontFamily: "var(--font-hanken)" }} />
              <button type="button" onClick={() => setShow(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded cursor-pointer"
                style={{ color: "var(--muted)" }} tabIndex={-1}>
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {error && <p className="text-sm px-4 py-2 rounded-[11px]" style={{ color: "#ef4444", background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)" }}>{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-[13px] font-semibold cursor-pointer disabled:opacity-60"
            style={{ background: "var(--accent)", color: "#000" }}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="text-sm text-center mt-6" style={{ color: "var(--muted)" }}>
          New here?{" "}
          <Link href="/account/register" className="font-semibold hover:text-[var(--accent)]" style={{ color: "var(--text)" }}>
            Create an account
          </Link>
        </p>
        <p className="text-xs text-center mt-3" style={{ color: "var(--muted)" }}>
          You can always check out as a guest — an account just makes it faster.
        </p>
      </div>
    </div>
  );
}
