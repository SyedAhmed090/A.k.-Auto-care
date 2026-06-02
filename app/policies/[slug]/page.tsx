import { notFound } from "next/navigation";
import type { Metadata } from "next";

const policies: Record<string, { title: string; content: string }> = {
  "shipping-returns": {
    title: "Shipping & Returns",
    content: `
## Shipping Policy

**Standard Delivery (Pakistan)** — Rs 199, delivered within 1–2 business days in Karachi, 3–5 days for other cities.

**Free Delivery** — On all orders over Rs 5,000. Applied automatically at checkout.

**Express Delivery** — Rs 499. Same/next day in Karachi, 2–3 days for other cities. Order before 2 PM Monday–Saturday.

**International Shipping** — Available worldwide. Rates calculated at checkout. Delivery 5–20 business days.

All orders are dispatched from Karachi via **TCS** or **Leopards Courier**. You will receive a tracking number via WhatsApp or SMS once your order is dispatched.

Orders placed Monday–Saturday before 2 PM are dispatched the same day. Orders after 2 PM or on Sundays are dispatched the next working day.

---

## Returns Policy

We want you to be 100% satisfied with your A.K. Auto Care products. If you're not happy for any reason, we offer a **30-day hassle-free returns policy**.

**To start a return:**
1. WhatsApp us at +92 300 0000000 or email hello@akautocare.pk with your order number and reason for return.
2. We'll arrange a TCS or Leopards Courier pickup from your address within 24 hours.
3. Once received and inspected at our Karachi warehouse (Block 7, PECHS, Karachi — 75400), we'll process your refund within 3–5 business days.

**Conditions:**
- Items must be returned in their original packaging.
- Opened or partially used products are eligible for return if you're dissatisfied with performance — just let us know.
- Refunds are issued to your original payment method (JazzCash, EasyPaisa, bank account, or cash on return for COD orders).
    `,
  },
  privacy: {
    title: "Privacy Policy",
    content: `
## Privacy Policy

Last updated: January 2024

A.K. Auto Care ("we", "us", "our") is committed to protecting your personal data in accordance with applicable Pakistani data protection laws.

### What we collect
- **Contact information**: name, email, phone number
- **Shipping address**: for order fulfilment
- **Payment information**: processed securely by Stripe — we never store card details
- **Order history**: to manage your purchases
- **Usage data**: cookies and analytics to improve your experience

### How we use your data
- To process and fulfil your orders
- To send order confirmation and shipping updates
- To respond to customer service enquiries
- To improve our website and product range (anonymised analytics only)

### Third parties
We use Stripe for payment processing. Stripe's privacy policy governs their use of your payment data. We do not sell your personal data to any third party.

### Cookies
We use essential cookies for cart functionality and session management, and optional analytics cookies. You may opt out of analytics cookies at any time.

### Your rights
You have the right to access your data, correct inaccuracies, request deletion, and object to processing. Email us at hello@akautocare.pk to exercise these rights.
    `,
  },
  terms: {
    title: "Terms of Service",
    content: `
## Terms of Service

Last updated: January 2024

Please read these terms carefully before using akautocare.pk.

### Acceptance
By using our website and placing orders, you agree to these terms.

### Products
All products are subject to availability. We reserve the right to discontinue any product at any time. Product images are for illustration; actual packaging may vary slightly.

### Pricing
All prices are in Pakistani Rupees (PKR) and include GST where applicable. Prices may change without notice, but you'll always pay the price shown at the time of your order.

### Orders
An order confirmation does not constitute acceptance. We reserve the right to cancel orders for reasons including stock unavailability or pricing errors, in which case a full refund will be issued.

### Liability
A.K. Auto Care products are formulated for use as directed. We are not liable for damage resulting from misuse. Our liability is limited to the value of the products purchased.

### Governing Law
These terms are governed by the laws of Pakistan.

### Contact
Questions about these terms? Email hello@akautocare.pk.
    `,
  },
};

export async function generateStaticParams() {
  return Object.keys(policies).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const policy = policies[slug];
  return { title: policy?.title ?? "Policy" };
}

function renderMarkdown(content: string) {
  const lines = content.trim().split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (line.startsWith("## ")) {
      elements.push(<h2 key={i} className="text-2xl font-black mt-8 mb-3" style={{ color: "var(--text)", fontFamily: "var(--font-anton)" }}>{line.slice(3)}</h2>);
    } else if (line.startsWith("### ")) {
      elements.push(<h3 key={i} className="text-lg font-bold mt-5 mb-2" style={{ color: "var(--text)" }}>{line.slice(4)}</h3>);
    } else if (line.startsWith("**") && line.endsWith("**")) {
      elements.push(<p key={i} className="font-bold mb-2" style={{ color: "var(--text)" }}>{line.slice(2, -2)}</p>);
    } else if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      elements.push(
        <ul key={i} className="list-disc list-inside space-y-1 text-sm mb-4 ml-4" style={{ color: "var(--muted)" }}>
          {items.map((it, j) => <li key={j}>{it}</li>)}
        </ul>
      );
      continue;
    } else if (line.match(/^\d+\. /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().match(/^\d+\. /)) {
        items.push(lines[i].trim().replace(/^\d+\. /, ""));
        i++;
      }
      elements.push(
        <ol key={i} className="list-decimal list-inside space-y-1 text-sm mb-4 ml-4" style={{ color: "var(--muted)" }}>
          {items.map((it, j) => <li key={j}>{it}</li>)}
        </ol>
      );
      continue;
    } else if (line === "---") {
      elements.push(<hr key={i} className="my-6" style={{ borderColor: "var(--line)" }} />);
    } else if (line) {
      elements.push(<p key={i} className="text-sm leading-relaxed mb-3" style={{ color: "var(--muted)" }}>{line}</p>);
    }
    i++;
  }
  return elements;
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const policy = policies[slug];
  if (!policy) notFound();

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="pt-10 pb-16" style={{ borderBottom: "1px solid var(--line)" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--accent)", fontFamily: "var(--font-space-mono)" }}>Legal</p>
          <h1 className="text-4xl sm:text-5xl font-black" style={{ color: "var(--text)", fontFamily: "var(--font-anton)" }}>{policy.title}</h1>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {renderMarkdown(policy.content)}
      </div>
    </div>
  );
}
