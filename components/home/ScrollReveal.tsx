"use client";
import { useEffect, type ReactNode } from "react";

/**
 * Runs the homepage scroll-reveal: adds the `in` class to `.reveal` elements as they
 * enter the viewport, and reveals hero content immediately. It only manipulates the
 * DOM, so the wrapped markup can stay server-rendered — this is the one small client
 * island instead of the whole homepage being `"use client"`.
 */
export default function ScrollReveal({ children }: { children: ReactNode }) {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    document.querySelectorAll("#hero .reveal").forEach((el) =>
      requestAnimationFrame(() => el.classList.add("in"))
    );
    return () => io.disconnect();
  }, []);

  return <>{children}</>;
}
