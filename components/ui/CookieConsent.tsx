"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("ak_cookie_consent")) setVisible(true);
  }, []);

  const respond = (choice: "accepted" | "declined") => {
    localStorage.setItem("ak_cookie_consent", choice);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] px-4 py-4 sm:py-5"
      style={{ background: "var(--surface)", borderTop: "1px solid var(--line)" }}
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm flex-1" style={{ color: "var(--muted)", fontFamily: "var(--font-hanken)" }}>
          We use essential cookies for cart functionality and optional analytics cookies to improve your
          experience.{" "}
          <Link href="/policies/privacy" className="underline" style={{ color: "var(--accent)" }}>
            Privacy Policy
          </Link>
        </p>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={() => respond("declined")}
            className="px-4 py-2 text-sm rounded-[10px] border transition-opacity hover:opacity-70"
            style={{ borderColor: "var(--line-2)", color: "var(--muted)" }}
          >
            Decline
          </button>
          <button
            onClick={() => respond("accepted")}
            className="px-4 py-2 text-sm font-semibold rounded-[10px] btn-accent"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
