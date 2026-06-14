import { FREE_SHIPPING_THRESHOLD } from "@/lib/commerce";

export const FREE_SHIPPING_THRESHOLD_LABEL = `Rs ${FREE_SHIPPING_THRESHOLD.toLocaleString("en-PK")}`;

/** Plain-text answers (kept simple so they can also be used in FAQ JSON-LD). */
export const FAQS: { q: string; a: string }[] = [
  {
    q: "Do you offer Cash on Delivery (COD)?",
    a: "Yes. Cash on Delivery is available across Pakistan. You only pay when your order arrives at your doorstep — no advance payment or card needed.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Cash on Delivery, JazzCash, EasyPaisa, and bank transfer. For JazzCash, EasyPaisa, or bank transfer, simply place your order and send the payment screenshot to our WhatsApp — your order is confirmed once payment is verified.",
  },
  {
    q: "How much does delivery cost and how long does it take?",
    a: `Standard delivery is Rs 199 (free on orders over ${FREE_SHIPPING_THRESHOLD_LABEL}). Orders reach Karachi in 1–2 working days and other cities in 3–5 working days. Express delivery (Rs 499) is same/next-day in Karachi. We ship nationwide via TCS and Leopards Courier.`,
  },
  {
    q: "Which cities do you deliver to?",
    a: "We deliver to all major cities and most towns across Pakistan, including Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, Hyderabad, and more — anywhere TCS or Leopards Courier reaches.",
  },
  {
    q: "How do I track my order?",
    a: "Once your order ships, you'll receive a tracking number via WhatsApp or SMS. You can also check your status anytime on our Track Order page using your Order ID and email.",
  },
  {
    q: "What is your returns policy?",
    a: "We offer a 30-day hassle-free returns policy. If you're not satisfied, WhatsApp or email us with your order number and we'll arrange a courier pickup. Refunds are processed within 3–5 business days of inspection.",
  },
  {
    q: "Are your products genuine and safe for my car's paint?",
    a: "Yes. All A.K. Auto Care products are formulated for automotive use and are safe on clear coats and modern paint systems when used as directed. Each product page lists usage instructions and compatibility.",
  },
  {
    q: "Will these products work on any car colour or paint type?",
    a: "Our polishes, compounds, coatings, and protectants are designed to work on all standard factory and repainted finishes regardless of colour. If you're unsure about a specific surface (matte, vinyl wrap, PPF), message us on WhatsApp and we'll advise.",
  },
  {
    q: "Do I need an account to place an order?",
    a: "No — you can check out as a guest. Creating an account is optional and lets you track orders, save addresses, and reorder faster.",
  },
  {
    q: "Can I order or get advice over WhatsApp?",
    a: "Absolutely. Tap the WhatsApp button on any page to ask about products, place an order, or get detailing advice. We typically reply within minutes during business hours.",
  },
  {
    q: "Is my personal and payment information secure?",
    a: "Yes. Our site runs over secure HTTPS, we never store card details, and your data is protected. See our Privacy Policy for full details.",
  },
  {
    q: "What if a product is out of stock?",
    a: "Out-of-stock items are marked on the product page. Message us on WhatsApp and we'll tell you the restock date or suggest the best alternative.",
  },
];
