"use client";
import dynamic from "next/dynamic";

// Loads the cookie-consent banner on the client only, after hydration, so its code isn't
// part of the initial render path. The banner appearing a moment late is fine.
const CookieConsent = dynamic(() => import("@/components/ui/CookieConsent"), { ssr: false });

export default function DeferredCookieConsent() {
  return <CookieConsent />;
}
