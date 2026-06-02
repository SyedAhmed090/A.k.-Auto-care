export const VAT_RATE = 0.2; // 20% UK VAT, inclusive in displayed prices

/** Extract VAT amount from a VAT-inclusive price */
export function vatAmount(inclusiveTotal: number): number {
  return parseFloat((inclusiveTotal * (VAT_RATE / (1 + VAT_RATE))).toFixed(2));
}

export type ShippingOption = {
  id: string;
  label: string;
  price: number;
  description: string;
};

/** Returns available shipping options based on destination country and subtotal */
export function getShippingOptions(country: string, subtotal: number): ShippingOption[] {
  const isUK = country === "GB" || country === "";
  if (isUK) {
    return [
      {
        id: "uk-standard",
        label: "Standard Delivery",
        price: subtotal >= 75 ? 0 : 3.99,
        description: subtotal >= 75 ? "Free · 3–5 business days" : "3–5 business days · £3.99",
      },
      {
        id: "uk-express",
        label: "Express Delivery",
        price: 9.99,
        description: "Next business day · order before 2pm",
      },
    ];
  }
  return [
    {
      id: "intl-standard",
      label: "International Standard",
      price: 14.99,
      description: "7–14 business days",
    },
    {
      id: "intl-express",
      label: "International Express",
      price: 24.99,
      description: "3–5 business days",
    },
  ];
}
