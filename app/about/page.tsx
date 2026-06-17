import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About A.K. Auto Care",
  description: "Learn the story behind A.K. Auto Care — professional-grade detailing products developed and tested in real-world conditions, trusted by detailers across Pakistan and beyond.",
  alternates: { canonical: "/about" },
  twitter: {
    card: "summary_large_image",
    title: "About A.K. Auto Care",
    description: "Learn the story behind A.K. Auto Care — professional-grade detailing products developed and tested in real-world conditions, trusted by detailers across Pakistan and beyond.",
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
