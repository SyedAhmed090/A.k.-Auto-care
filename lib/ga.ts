// Thin wrapper around GA4's gtag. No-ops safely if GA isn't loaded
// (e.g. NEXT_PUBLIC_GA_MEASUREMENT_ID unset or consent not granted).
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function gaEvent(name: string, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}
