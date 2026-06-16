"use client";
import { useState } from "react";

/**
 * Newsletter subscribe form for the homepage CTA band — the interactive island that
 * holds the only state on the homepage. The surrounding heading/copy stay server-rendered.
 */
export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "ok" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async () => {
    if (!email.trim() || state === "submitting") return;
    setState("submitting");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.ok) {
        setState("ok");
      } else {
        setError(data.error ?? "Something went wrong.");
        setState("error");
      }
    } catch {
      setError("Network error. Please try again.");
      setState("error");
    }
  };

  if (state === "ok") {
    return (
      <p className="text-[1rem] font-semibold" style={{ color: "var(--accent)", fontFamily: "var(--font-space-mono)" }}>
        You&apos;re on the list. Welcome to the garage.
      </p>
    );
  }

  return (
    <div className="w-full max-w-[480px] mx-auto">
      <div className="flex gap-3 flex-wrap justify-center">
        <input
          type="email"
          aria-label="Email address"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (state === "error") setState("idle"); }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="flex-1 min-w-[220px] px-5 py-4 rounded-[13px] text-[1rem] outline-none transition-all"
          style={{ background: "rgba(10, 11, 13,.6)", border: `1px solid ${state === "error" ? "#ef4444" : "var(--line-2)"}`, color: "var(--text)", fontFamily: "var(--font-hanken)" }}
        />
        <button
          onClick={submit}
          disabled={state === "submitting"}
          className="btn-accent px-7 py-4 rounded-[13px] font-semibold transition-all hover:-translate-y-0.5 cursor-pointer disabled:opacity-60"
        >
          {state === "submitting" ? "…" : "Subscribe"}
        </button>
      </div>
      {state === "error" && (
        <p className="mt-2 text-sm text-center" style={{ color: "#ef4444" }}>{error}</p>
      )}
    </div>
  );
}
