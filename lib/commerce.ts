export const GST_RATE = 0.17; // 17% Pakistan GST, inclusive in displayed prices
export const FREE_SHIPPING_THRESHOLD = 5000; // PKR — standard domestic free-shipping floor

/** Extract GST amount from a GST-inclusive price */
export function gstAmount(inclusiveTotal: number): number {
  return parseFloat((inclusiveTotal * (GST_RATE / (1 + GST_RATE))).toFixed(2));
}

export type ShippingOption = {
  id: string;
  label: string;
  price: number;
  description: string;
};

/** Returns available shipping options based on destination country and subtotal (PKR) */
export function getShippingOptions(country: string, subtotal: number): ShippingOption[] {
  const isPK = country === "PK" || country === "";
  if (isPK) {
    return [
      {
        id: "pk-standard",
        label: "Standard Delivery",
        price: subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 199,
        description:
          subtotal >= FREE_SHIPPING_THRESHOLD
            ? "Free · Karachi 1–2 days, other cities 3–5 days · TCS / Leopards"
            : "Karachi 1–2 days, other cities 3–5 days · TCS / Leopards · Rs 199",
      },
      {
        id: "pk-express",
        label: "Express Delivery",
        price: 499,
        description: "Karachi same/next day · other cities 2–3 days · order before 2pm",
      },
    ];
  }
  return [
    {
      id: "intl-standard",
      label: "International Standard",
      price: 2499,
      description: "10–20 business days",
    },
    {
      id: "intl-express",
      label: "International Express",
      price: 4999,
      description: "5–7 business days",
    },
  ];
}
