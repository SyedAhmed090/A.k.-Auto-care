"use client";
import { useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : (process.env.NEXT_PUBLIC_SITE_URL ?? "");
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/account/reset-password`,
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setSent(true);
      setLoading(false);
    } catch {
      setError("Could not send the reset link. Please try again.");
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16" style={{ background: "var(--bg)" }}>
        <div className="w-full max-w-md text-center">
          <div className="w-14 h-14 rounded-full grid place-items-center mx-auto mb-4" style={{ background: "rgba(79, 168, 230,.12)" }}>
            <MailCheck className="w-7 h-7" style={{ color: "var(--accent)" }} />
          </div>
          <h1 className="text-2xl font-black uppercase mb-2" style={{ fontFamily: "var(--font-anton)", color: "var(--text)" }}>
            Check your email
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            If an account exists for <strong style={{ color: "var(--text)" }}>{email}</strong>, we&apos;ve sent a reset link. Click it to choose a new password.
          </p>
          <Link href="/account/login" className="inline-block mt-6 px-6 py-3 rounded-[13px] font-semibold" style={{ background: "var(--accent)", color: "#000" }}>
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-black uppercase mb-2 text-center" style={{ fontFamily: "var(--font-anton)", color: "var(--text)" }}>
          Forgot Password
        </h1>
        <p className="text-sm text-center mb-8" style={{ color: "var(--muted)" }}>
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>

        <form onSubmit={submit} className="rounded-[20px] p-7 space-y-4" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
          <div>
            <label className="block text-[.72rem] tracking-[.14em] uppercase mb-2" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>
              Email <span style={{ color: "var(--accent)" }}>*</span>
            </label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-[11px] text-sm outline-none"
              style={{ background: "var(--bg)", border: "1px solid var(--line-2)", color: "var(--text)", fontFamily: "var(--font-hanken)" }} />
          </div>
          {error && <p className="text-sm px-4 py-2 rounded-[11px]" style={{ color: "#ef4444", background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)" }}>{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-[13px] font-semibold cursor-pointer disabled:opacity-60"
            style={{ background: "var(--accent)", color: "#000" }}>
            {loading ? "Sending…" : "Send Reset Link"}
          </button>
        </form>

        <p className="text-sm text-center mt-6" style={{ color: "var(--muted)" }}>
          Remembered it?{" "}
          <Link href="/account/login" className="font-semibold hover:text-[var(--accent)]" style={{ color: "var(--text)" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
