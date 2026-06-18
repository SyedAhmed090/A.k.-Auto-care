"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [resendError, setResendError] = useState("");

  const resend = async () => {
    setResendState("sending");
    setResendError("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) {
        setResendError(error.message);
        setResendState("error");
        return;
      }
      setResendState("sent");
    } catch {
      setResendError("Could not resend the email. Please try again.");
      setResendState("error");
    }
  };

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
          <p className="text-xs mt-4" style={{ color: "var(--muted)" }}>
            Didn&apos;t get it? Check your spam folder, or resend below.
          </p>
          {resendState === "error" && (
            <p className="text-xs mt-3" style={{ color: "#ef4444" }}>{resendError}</p>
          )}
          <button onClick={resend} disabled={resendState === "sending" || resendState === "sent"}
            className="inline-block mt-4 px-6 py-3 rounded-[13px] font-semibold cursor-pointer disabled:opacity-60"
            style={{ background: "transparent", border: "1px solid var(--line-2)", color: "var(--text)" }}>
            {resendState === "sending" ? "Sending…" : resendState === "sent" ? "Email sent ✓" : "Resend confirmation email"}
          </button>
          <div>
            <Link href="/account/login" className="inline-block mt-6 px-6 py-3 rounded-[13px] font-semibold" style={{ background: "var(--accent)", color: "var(--on-accent)" }}>
              Go to Sign In
            </Link>
          </div>
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
            <label className="block text-[.82rem] tracking-[.01em] font-medium mb-2" style={{ fontFamily: "var(--font-hanken)", color: "var(--muted)" }}>
              Full Name <span style={{ color: "var(--accent)" }}>*</span>
            </label>
            <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-[11px] text-sm outline-none"
              style={{ background: "var(--bg)", border: "1px solid var(--line-2)", color: "var(--text)", fontFamily: "var(--font-hanken)" }} />
          </div>
          <div>
            <label className="block text-[.82rem] tracking-[.01em] font-medium mb-2" style={{ fontFamily: "var(--font-hanken)", color: "var(--muted)" }}>
              Email <span style={{ color: "var(--accent)" }}>*</span>
            </label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-[11px] text-sm outline-none"
              style={{ background: "var(--bg)", border: "1px solid var(--line-2)", color: "var(--text)", fontFamily: "var(--font-hanken)" }} />
          </div>
          <div>
            <label className="block text-[.82rem] tracking-[.01em] font-medium mb-2" style={{ fontFamily: "var(--font-hanken)", color: "var(--muted)" }}>
              Password <span style={{ color: "var(--accent)" }}>*</span>
            </label>
            <div className="relative">
              <input type={show ? "text" : "password"} required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-11 rounded-[11px] text-sm outline-none"
                style={{ background: "var(--bg)", border: "1px solid var(--line-2)", color: "var(--text)", fontFamily: "var(--font-hanken)" }} />
              <button type="button" onClick={() => setShow(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded cursor-pointer"
                style={{ color: "var(--muted)" }} tabIndex={-1}>
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[.72rem] mt-1.5" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>
              At least 8 characters
            </p>
          </div>
          {error && <p className="text-sm px-4 py-2 rounded-[11px]" style={{ color: "#ef4444", background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)" }}>{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-[13px] font-semibold cursor-pointer disabled:opacity-60"
            style={{ background: "var(--accent)", color: "var(--on-accent)" }}>
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
