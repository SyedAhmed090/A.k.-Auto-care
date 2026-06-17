import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with A.K. Auto Care for product questions, order support, or detailing advice.",
  alternates: { canonical: "/contact" },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | A.K. Auto Care",
    description: "Get in touch with A.K. Auto Care for product questions, order support, or detailing advice.",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
