import { DEFAULT_SETTINGS, type ShippingSettings } from "@/lib/settings";

/** @deprecated Read `shipping.freeThreshold` from settings instead. */
export const FREE_SHIPPING_THRESHOLD = DEFAULT_SETTINGS.shipping.freeThreshold;

/** Extract GST amount from a GST-inclusive price. */
export function gstAmount(inclusiveTotal: number, gstRate: number = DEFAULT_SETTINGS.tax.gstRate): number {
  return parseFloat((inclusiveTotal * (gstRate / (1 + gstRate))).toFixed(2));
}

/** Minimum fields required for filter-and-sort */
interface Filterable {
  price: number;
  createdAt: string;
  featured: boolean;
  inStock: boolean;
}

/**
 * Filter and sort products by stock and sort key.
 */
export function filterAndSort<T extends Filterable>(
  list: T[],
  opts: { inStockOnly: boolean; sort: string }
): T[] {
  const result = opts.inStockOnly ? list.filter((p) => p.inStock) : list;
  if (opts.sort === "price-asc") result.sort((a, b) => a.price - b.price);
  else if (opts.sort === "price-desc") result.sort((a, b) => b.price - a.price);
  else if (opts.sort === "newest") result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  else result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  return result;
}

export type ShippingOption = {
  id: string;
  label: string;
  price: number;
  description: string;
};

/** Returns available shipping options based on destination country and subtotal (PKR).
 *  Rates and ETAs come from settings; defaults preserve the previous hardcoded values. */
export function getShippingOptions(
  country: string,
  subtotal: number,
  shipping: ShippingSettings = DEFAULT_SETTINGS.shipping
): ShippingOption[] {
  const isPK = country === "PK" || country === "";
  if (isPK) {
    const standardFree = subtotal >= shipping.freeThreshold;
    return [
      {
        id: "pk-standard",
        label: "Standard Delivery",
        price: standardFree ? 0 : shipping.domestic.standard,
        description: standardFree
          ? `Free · ${shipping.etas.domesticStandard}`
          : `${shipping.etas.domesticStandard} · Rs ${shipping.domestic.standard}`,
      },
      {
        id: "pk-express",
        label: "Express Delivery",
        price: shipping.domestic.express,
        description: shipping.etas.domesticExpress,
      },
    ];
  }
  return [
    {
      id: "intl-standard",
      label: "International Standard",
      price: shipping.international.standard,
      description: shipping.etas.intlStandard,
    },
    {
      id: "intl-express",
      label: "International Express",
      price: shipping.international.express,
      description: shipping.etas.intlExpress,
    },
  ];
}
