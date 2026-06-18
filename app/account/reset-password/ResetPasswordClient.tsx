"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [done, setDone] = useState(false);

  // The @supabase/ssr browser client auto-detects the recovery token from the
  // URL on load and emits a PASSWORD_RECOVERY event. We treat either that event
  // or an existing session as a valid recovery context.
  useEffect(() => {
    const supabase = createClient();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setReady(true);
      } else {
        // Give the URL-detection a brief moment before declaring the link invalid.
        setTimeout(() => {
          setReady((r) => {
            if (!r) setInvalid(true);
            return r;
          });
        }, 1500);
      }
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setDone(true);
      setLoading(false);
    } catch {
      setError("Could not update your password. Please try again.");
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16" style={{ background: "var(--bg)" }}>
        <div className="w-full max-w-md text-center">
          <div className="w-14 h-14 rounded-full grid place-items-center mx-auto mb-4" style={{ background: "rgba(79, 168, 230,.12)" }}>
            <CheckCircle className="w-7 h-7" style={{ color: "var(--accent)" }} />
          </div>
          <h1 className="text-2xl font-black uppercase mb-2" style={{ fontFamily: "var(--font-anton)", color: "var(--text)" }}>
            Password updated
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Your password has been changed. You can now sign in with your new password.
          </p>
          <button onClick={() => { router.push("/account/login"); router.refresh(); }}
            className="inline-block mt-6 px-6 py-3 rounded-[13px] font-semibold cursor-pointer"
            style={{ background: "var(--accent)", color: "var(--on-accent)" }}>
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  if (invalid) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16" style={{ background: "var(--bg)" }}>
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl font-black uppercase mb-2" style={{ fontFamily: "var(--font-anton)", color: "var(--text)" }}>
            Link expired
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            This reset link is invalid or has expired. Request a new one to continue.
          </p>
          <Link href="/account/forgot-password" className="inline-block mt-6 px-6 py-3 rounded-[13px] font-semibold" style={{ background: "var(--accent)", color: "var(--on-accent)" }}>
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-black uppercase mb-2 text-center" style={{ fontFamily: "var(--font-anton)", color: "var(--text)" }}>
          Reset Password
        </h1>
        <p className="text-sm text-center mb-8" style={{ color: "var(--muted)" }}>
          Choose a new password for your account.
        </p>

        <form onSubmit={submit} className="rounded-[20px] p-7 space-y-4" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
          <div>
            <label className="block text-[.82rem] tracking-[.01em] font-medium mb-2" style={{ fontFamily: "var(--font-hanken)", color: "var(--muted)" }}>
              New Password <span style={{ color: "var(--accent)" }}>*</span>
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
          <div>
            <label className="block text-[.82rem] tracking-[.01em] font-medium mb-2" style={{ fontFamily: "var(--font-hanken)", color: "var(--muted)" }}>
              Confirm Password <span style={{ color: "var(--accent)" }}>*</span>
            </label>
            <input type={show ? "text" : "password"} required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-4 py-3 rounded-[11px] text-sm outline-none"
              style={{ background: "var(--bg)", border: "1px solid var(--line-2)", color: "var(--text)", fontFamily: "var(--font-hanken)" }} />
          </div>
          {error && <p className="text-sm px-4 py-2 rounded-[11px]" style={{ color: "#ef4444", background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)" }}>{error}</p>}
          <button type="submit" disabled={loading || !ready}
            className="w-full py-3.5 rounded-[13px] font-semibold cursor-pointer disabled:opacity-60"
            style={{ background: "var(--accent)", color: "var(--on-accent)" }}>
            {loading ? "Updating…" : !ready ? "Verifying link…" : "Update Password"}
          </button>
        </form>

        <p className="text-sm text-center mt-6" style={{ color: "var(--muted)" }}>
          <Link href="/account/login" className="font-semibold hover:text-[var(--accent)]" style={{ color: "var(--text)" }}>
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
