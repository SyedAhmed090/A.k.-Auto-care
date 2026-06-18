"use client";
import { useState } from "react";

export type NewsletterState = "idle" | "submitting" | "ok" | "error";

/**
 * Shared newsletter-signup logic used by both the homepage CTA (NewsletterSignup)
 * and the footer form. Owns the email value, the submit state machine, and the
 * POST to /api/newsletter so the two forms can't drift apart. Each consumer keeps
 * its own markup (and the footer layers an auto-reset effect on top via setState).
 */
export function useNewsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<NewsletterState>("idle");
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

  return { email, setEmail, state, setState, error, submit };
}
