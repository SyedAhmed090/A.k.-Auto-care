"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { X, Check, Copy } from "lucide-react";

const STORAGE_KEY = "ak_welcome_seen";
const PROMO_CODE = "AKCARE10";
const DELAY_MS = 12000;

export default function FirstPurchasePopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hidden = pathname?.startsWith("/admin") || pathname?.startsWith("/checkout");

  useEffect(() => {
    if (hidden) return;
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    const t = setTimeout(() => setOpen(true), DELAY_MS);
    return () => clearTimeout(t);
  }, [hidden]);

  const dismiss = () => {
    setOpen(false);
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* ignore */ }
  };

  // Scroll-lock, Escape-to-close, and initial focus while the popup is open.
  useEffect(() => {
    if (!open || hidden) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        dismiss();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    // Focus the email input on the offer step, else the close button.
    const focusTarget = inputRef.current ?? closeRef.current;
    focusTarget?.focus();

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, hidden, state]);

  const submit = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email.");
      setState("error");
      return;
    }
    setState("submitting");
    setError("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.ok) {
        setState("done");
        try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* ignore */ }
      } else {
        setError(data.error ?? "Something went wrong.");
        setState("error");
      }
    } catch {
      setError("Network error. Please try again.");
      setState("error");
    }
  };

  const copyCode = () => {
    navigator.clipboard?.writeText(PROMO_CODE).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  };

  if (!open || hidden) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
      style={{ background: "rgba(10, 11, 13,.7)", backdropFilter: "blur(6px)" }}
      onClick={dismiss}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome offer"
    >
      <div
        className="relative w-full max-w-md rounded-[20px] overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--line-2)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          onClick={dismiss}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full grid place-items-center cursor-pointer outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          style={{ background: "rgba(255,255,255,.04)", border: "1px solid var(--line-2)", color: "var(--text)" }}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-8 text-center">
          {state === "done" ? (
            <>
              <div className="w-14 h-14 rounded-full grid place-items-center mx-auto mb-4" style={{ background: "rgba(79, 168, 230,.12)" }}>
                <Check className="w-7 h-7" style={{ color: "var(--accent)" }} />
              </div>
              <h2 className="text-2xl font-black mb-2 uppercase" style={{ fontFamily: "var(--font-anton)", color: "var(--text)" }}>
                You&apos;re in!
              </h2>
              <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
                Use this code at checkout for <strong style={{ color: "var(--text)" }}>10% off</strong> your first order:
              </p>
              <button
                onClick={copyCode}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-[12px] font-bold tracking-[.18em] cursor-pointer outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                style={{ background: "rgba(79, 168, 230,.1)", border: "1px dashed var(--accent)", color: "var(--accent)", fontFamily: "var(--font-space-mono)" }}
              >
                {PROMO_CODE} {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
              <button onClick={dismiss} className="mt-5 text-sm cursor-pointer rounded outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" style={{ color: "var(--muted)" }}>
                Continue shopping
              </button>
            </>
          ) : (
            <>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--accent)", fontFamily: "var(--font-space-mono)" }}>
                Welcome Offer
              </p>
              <h2 className="text-3xl font-black mb-2 uppercase leading-tight" style={{ fontFamily: "var(--font-anton)", color: "var(--text)" }}>
                Get 10% off<br />your first order
              </h2>
              <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
                Join our list for detailing tips, drops &amp; deals — and an instant discount code.
              </p>
              <input
                ref={inputRef}
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (state === "error") { setState("idle"); setError(""); } }}
                onKeyDown={(e) => e.key === "Enter" && submit()}

                className="w-full px-4 py-3 rounded-[12px] text-sm outline-none mb-3 transition-all focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                style={{ background: "var(--bg)", border: "1px solid var(--line-2)", color: "var(--text)", fontFamily: "var(--font-hanken)" }}
              />
              {state === "error" && <p className="text-xs mb-3" style={{ color: "#ef4444" }}>{error}</p>}
              <button
                onClick={submit}
                disabled={state === "submitting"}
                className="w-full py-3.5 rounded-[12px] font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
                style={{ background: "var(--accent)", color: "#000" }}
              >
                {state === "submitting" ? "…" : "Reveal My Code"}
              </button>
              <button onClick={dismiss} className="mt-4 text-xs cursor-pointer rounded outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" style={{ color: "var(--muted)" }}>
                No thanks, I&apos;ll pay full price
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
