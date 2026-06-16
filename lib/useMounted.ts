"use client";
import { useEffect, useState } from "react";

/**
 * Returns false on the server and the first client render, then true after mount.
 * The canonical hydration guard for components that read client-only state (e.g.
 * a persisted zustand store) so server and client markup match on first paint.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-shot hydration flip
  useEffect(() => setMounted(true), []);
  return mounted;
}
