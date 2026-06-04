import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Learn the story behind A.K. Auto Care — Karachi's precision car care brand. Engineered for detailers who refuse to settle.",
  openGraph: {
    title: "About | A.K. Auto Care",
    description: "Learn the story behind A.K. Auto Care — Karachi's precision car care brand.",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
