import { notFound } from "next/navigation";
import type { Metadata } from "next";

const policies: Record<string, { title: string; content: string }> = {
  "shipping-returns": {
    title: "Shipping & Returns",
    content: `
## Shipping Policy

**Standard UK Delivery** — £4.99, delivered within 3–5 business days.

**Free Delivery** — On all orders over £75. Applied automatically at checkout.

**Express Delivery** — £9.99, delivered next working day when ordered before 2 PM Monday–Friday.

**International Shipping** — Available to EU and worldwide destinations. Rates calculated at checkout. Delivery times vary by destination (typically 7–14 business days).

Orders placed Monday–Friday before 2 PM are dispatched the same day. Orders placed after 2 PM or on weekends are dispatched the next working day.

You'll receive a dispatch confirmation email with tracking information as soon as your order leaves our warehouse.

---

## Returns Policy

We want you to be 100% satisfied with your A.K. Auto Care products. If you're not happy for any reason, we offer a **30-day hassle-free returns policy**.

**To start a return:**
1. Email us at hello@akautocare.co.uk with your order number and reason for return.
2. We'll send you a prepaid returns label within 24 hours.
3. Pack the item(s) securely and drop off at any Post Office.
4. Once received and inspected, we'll process your refund within 3–5 business days.

**Conditions:**
- Items must be returned in their original packaging.
- Opened or partially used products are eligible for return if you're dissatisfied with performance — just let us know.
- Refunds are issued to the original payment method.
    `,
  },
  privacy: {
    title: "Privacy Policy",
    content: `
## Privacy Policy

Last updated: January 2024

A.K. Auto Care ("we", "us", "our") is committed to protecting your personal data.

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
We use essential cookies for cart functionality and session management, and optional analytics cookies (Google Analytics). You may opt out of analytics cookies at any time.

### Your rights
Under UK GDPR you have the right to: access your data, correct inaccuracies, request deletion, and object to processing. Email us at hello@akautocare.co.uk to exercise these rights.
    `,
  },
  terms: {
    title: "Terms of Service",
    content: `
## Terms of Service

Last updated: January 2024

Please read these terms carefully before using akautocare.co.uk.

### Acceptance
By using our website and placing orders, you agree to these terms.

### Products
All products are subject to availability. We reserve the right to discontinue any product at any time. Product images are for illustration; actual packaging may vary slightly.

### Pricing
All prices are in GBP and include VAT where applicable. Prices may change without notice, but you'll always pay the price shown at the time of your order.

### Orders
An order confirmation email doesn't constitute acceptance. We reserve the right to cancel orders for reasons including stock unavailability or pricing errors, in which case a full refund will be issued.

### Liability
A.K. Auto Care products are formulated for use as directed. We are not liable for damage resulting from misuse. Our liability is limited to the value of the products purchased.

### Governing Law
These terms are governed by the laws of England and Wales.

### Contact
Questions about these terms? Email hello@akautocare.co.uk.
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
      elements.push(<h2 key={i} className="text-2xl font-black text-[#0f0f0f] mt-8 mb-3">{line.slice(3)}</h2>);
    } else if (line.startsWith("### ")) {
      elements.push(<h3 key={i} className="text-lg font-bold text-[#0f0f0f] mt-5 mb-2">{line.slice(4)}</h3>);
    } else if (line.startsWith("**") && line.endsWith("**")) {
      elements.push(<p key={i} className="font-bold text-[#0f0f0f] mb-2">{line.slice(2, -2)}</p>);
    } else if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      elements.push(
        <ul key={i} className="list-disc list-inside space-y-1 text-gray-600 text-sm mb-4 ml-4">
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
        <ol key={i} className="list-decimal list-inside space-y-1 text-gray-600 text-sm mb-4 ml-4">
          {items.map((it, j) => <li key={j}>{it}</li>)}
        </ol>
      );
      continue;
    } else if (line === "---") {
      elements.push(<hr key={i} className="border-gray-100 my-6" />);
    } else if (line) {
      elements.push(<p key={i} className="text-gray-600 text-sm leading-relaxed mb-3">{line}</p>);
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
    <div className="bg-white min-h-screen">
      <div className="bg-[#0a0a0a] pt-10 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#e8320a] mb-2">Legal</p>
          <h1 className="text-4xl sm:text-5xl font-black text-white">{policy.title}</h1>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-12">
        {renderMarkdown(policy.content)}
      </div>
    </div>
  );
}
