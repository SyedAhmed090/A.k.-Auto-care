import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with A.K. Auto Care — WhatsApp, email, or our contact form. We're based in Karachi and ready to help.",
  openGraph: {
    title: "Contact | A.K. Auto Care",
    description: "Get in touch with A.K. Auto Care.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
