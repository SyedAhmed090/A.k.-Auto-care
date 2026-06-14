"use client";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Render the confirm button in red for destructive actions. */
  destructive?: boolean;
  /** Disables the confirm button + shows a "working" label while an async action runs. */
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  const accentColor = destructive ? "#ef4444" : "var(--accent)";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,.6)", backdropFilter: "blur(2px)" }}
        onClick={() => { if (!loading) onCancel(); }}
      />
      <div
        className="relative w-full max-w-sm rounded-[16px] p-6"
        style={{ background: "var(--surface)", border: "1px solid var(--line)", boxShadow: "0 24px 60px rgba(0,0,0,.45)" }}
      >
        <div className="flex items-start gap-3.5">
          <div
            className="flex-shrink-0 grid place-items-center w-10 h-10 rounded-full"
            style={{ background: destructive ? "rgba(239,68,68,.12)" : "rgba(79, 168, 230,.12)" }}
          >
            <AlertTriangle className="w-5 h-5" style={{ color: accentColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[1rem] font-bold uppercase" style={{ fontFamily: "var(--font-anton)", letterSpacing: ".02em" }}>
              {title}
            </h3>
            <p className="text-sm mt-1.5 leading-relaxed" style={{ color: "var(--muted)", fontFamily: "var(--font-hanken)" }}>
              {message}
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6 justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2.5 rounded-[10px] text-sm font-semibold cursor-pointer transition-all disabled:opacity-50"
            style={{ border: "1px solid var(--line-2)", color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2.5 rounded-[10px] text-sm font-semibold cursor-pointer transition-all hover:opacity-90 disabled:opacity-50"
            style={{
              background: accentColor,
              color: destructive ? "#fff" : "#000",
              fontFamily: "var(--font-space-mono)",
            }}
          >
            {loading ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
