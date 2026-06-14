"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsConfirm, setNeedsConfirm] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      // If email confirmation is required, there's no active session yet.
      if (data.session) {
        router.push("/account");
        router.refresh();
      } else {
        setNeedsConfirm(true);
        setLoading(false);
      }
    } catch {
      setError("Could not create your account. Please try again.");
      setLoading(false);
    }
  };

  if (needsConfirm) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16" style={{ background: "var(--bg)" }}>
        <div className="w-full max-w-md text-center">
          <div className="w-14 h-14 rounded-full grid place-items-center mx-auto mb-4" style={{ background: "rgba(79, 168, 230,.12)" }}>
            <CheckCircle className="w-7 h-7" style={{ color: "var(--accent)" }} />
          </div>
          <h1 className="text-2xl font-black uppercase mb-2" style={{ fontFamily: "var(--font-anton)", color: "var(--text)" }}>
            Almost there
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            We&apos;ve sent a confirmation link to <strong style={{ color: "var(--text)" }}>{email}</strong>. Click it to activate your account, then sign in.
          </p>
          <Link href="/account/login" className="inline-block mt-6 px-6 py-3 rounded-[13px] font-semibold" style={{ background: "var(--accent)", color: "#000" }}>
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-black uppercase mb-2 text-center" style={{ fontFamily: "var(--font-anton)", color: "var(--text)" }}>
          Create Account
        </h1>
        <p className="text-sm text-center mb-8" style={{ color: "var(--muted)" }}>
          Track orders, save addresses, and reorder faster.
        </p>

        <form onSubmit={submit} className="rounded-[20px] p-7 space-y-4" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
          <div>
            <label className="block text-[.72rem] tracking-[.14em] uppercase mb-2" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>Full Name</label>
            <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Smith"
              className="w-full px-4 py-3 rounded-[11px] text-sm outline-none"
              style={{ background: "var(--bg)", border: "1px solid var(--line-2)", color: "var(--text)", fontFamily: "var(--font-hanken)" }} />
          </div>
          <div>
            <label className="block text-[.72rem] tracking-[.14em] uppercase mb-2" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-[11px] text-sm outline-none"
              style={{ background: "var(--bg)", border: "1px solid var(--line-2)", color: "var(--text)", fontFamily: "var(--font-hanken)" }} />
          </div>
          <div>
            <label className="block text-[.72rem] tracking-[.14em] uppercase mb-2" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters"
              className="w-full px-4 py-3 rounded-[11px] text-sm outline-none"
              style={{ background: "var(--bg)", border: "1px solid var(--line-2)", color: "var(--text)", fontFamily: "var(--font-hanken)" }} />
          </div>
          {error && <p className="text-sm px-4 py-2 rounded-[11px]" style={{ color: "#ef4444", background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)" }}>{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-[13px] font-semibold cursor-pointer disabled:opacity-60"
            style={{ background: "var(--accent)", color: "#000" }}>
            {loading ? "Creating…" : "Create Account"}
          </button>
        </form>

        <p className="text-sm text-center mt-6" style={{ color: "var(--muted)" }}>
          Already have an account?{" "}
          <Link href="/account/login" className="font-semibold hover:text-[var(--accent)]" style={{ color: "var(--text)" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
