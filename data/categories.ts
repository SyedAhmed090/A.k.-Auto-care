export interface Category {
  slug: string;
  name: string;
  description: string;
  image: string;
  accent: string;
}

const categories: Category[] = [
  {
    slug: "cleaners-degreasers",
    name: "Cleaners & Degreasers",
    description:
      "Powerful formulas to strip dirt, grease, and road grime before any treatment begins.",
    image:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80",
    accent: "#2563eb",
  },
  {
    slug: "polishes-compounds",
    name: "Polishes & Compounds",
    description:
      "Restore clarity and remove swirls, scratches, and oxidation with professional-grade abrasives.",
    image:
      "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&q=80",
    accent: "#7c3aed",
  },
  {
    slug: "waxes-sealants",
    name: "Waxes & Sealants",
    description:
      "Lock in that showroom shine with long-lasting carnauba waxes and synthetic polymer sealants.",
    image:
      "https://images.unsplash.com/photo-1547327132-9bcc5bb8d26b?w=600&q=80",
    accent: "#d97706",
  },
  {
    slug: "ceramic-coatings",
    name: "Ceramic Coatings",
    description:
      "Nano-ceramic protection that bonds to your paint for years of hydrophobic, scratch-resistant defense.",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80",
    accent: "#059669",
  },
  {
    slug: "towels-applicators",
    name: "Towels & Applicators",
    description:
      "Premium microfiber towels and foam applicators engineered for a scratch-free finish every time.",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    accent: "#dc2626",
  },
  {
    slug: "kits-bundles",
    name: "Kits & Bundles",
    description:
      "Curated bundles that take your car from dirty to detailed — everything you need in one box.",
    image:
      "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600&q=80",
    accent: "#0891b2",
  },
];

export default categories;
export const getCategoryBySlug = (slug: string) =>
  categories.find((c) => c.slug === slug);
