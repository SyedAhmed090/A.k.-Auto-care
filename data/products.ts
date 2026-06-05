export interface Variant {
  label: string;
  price: number;
  sku: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  tagline: string;
  description: string;
  howToUse: string;
  specs: { label: string; value: string }[];
  price: number;
  variants: Variant[];
  images: string[];
  stock?: number;
  inStock: boolean;
  featured: boolean;
  rating: number;
  reviews: number;
  badge?: string;
  createdAt: string;
}

// TODO: replace all Unsplash placeholder images with real product photography.
// Each product should have distinct owned shots; placeholder images are reused
// across products and are for layout/sizing reference only.
const products: Product[] = [
  // ─── Cleaners & Degreasers ───────────────────────────────
  {
    id: "p1",
    slug: "alpha-foam-cannon-soap",
    name: "Alpha Foam Cannon Soap",
    categorySlug: "cleaners-degreasers",
    tagline: "Thick, clinging foam that lifts dirt without touching the paint.",
    description:
      "Alpha Foam Cannon Soap is a high-sudsing, pH-neutral shampoo engineered for foam cannons and foam guns. Its thick foam sheet clings to vertical surfaces, dwelling on contaminants long enough to safely emulsify road grime, brake dust, and organic material before you ever touch the car. Especially effective in Karachi's dusty coastal environment — thick foam lifts road dust and sea-salt deposits safely before you ever touch the paint.",
    howToUse:
      "Dilute 30–60 ml per litre of water in your foam cannon reservoir. Apply top-down, let dwell 2–3 min, then rinse. Follow with a contact wash if needed.",
    specs: [
      { label: "pH", value: "6.5–7.5 (neutral)" },
      { label: "Dilution ratio", value: "1:30 – 1:60" },
      { label: "Finish", value: "Spot-free rinse aid included" },
      { label: "Scent", value: "Fresh citrus" },
    ],
    price: 6999,
    variants: [
      { label: "500 ml", price: 6999, sku: "ALPHA-FOAM-500" },
      { label: "1 L", price: 10999, sku: "ALPHA-FOAM-1L" },
      { label: "5 L", price: 36999, sku: "ALPHA-FOAM-5L" },
    ],
    images: [
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    ],
    stock: 47,
    inStock: true,
    featured: true,
    rating: 4.8,
    reviews: 214,
    badge: "Best Seller",
    createdAt: "2024-01-10",
  },
  {
    id: "p2",
    slug: "ironbuster-fallout-remover",
    name: "IronBuster Fallout Remover",
    categorySlug: "cleaners-degreasers",
    tagline: "Bleeds purple on contact — turns iron particles into liquid.",
    description:
      "IronBuster is a pH-balanced, colour-changing fallout remover that reacts on contact with iron contamination. As the purple reaction spreads across the panel you can see exactly how contaminated your paint really is. Safe on painted surfaces, alloys, chrome, and glass. In Pakistan's industrial and construction-heavy cities, iron fallout accumulates rapidly on exposed paintwork — IronBuster's colour-change reaction shows exactly how contaminated your car really is.",
    howToUse:
      "Spray onto cool, dry or damp paintwork. Allow 3–5 min dwell. Agitate with a soft brush where needed. Rinse thoroughly. Do not let dry on the surface.",
    specs: [
      { label: "pH", value: "5.5 – 6.5" },
      { label: "Safe on", value: "Paint, alloy, chrome, glass" },
      { label: "Reaction time", value: "2–5 min" },
      { label: "Scent", value: "Mild chemical" },
    ],
    price: 8499,
    variants: [
      { label: "500 ml", price: 8499, sku: "IRONBUST-500" },
      { label: "1 L", price: 14499, sku: "IRONBUST-1L" },
    ],
    images: [
      "https://images.unsplash.com/photo-1558618047-f4e50b806c73?w=800&q=80",
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
    ],
    stock: 3,
    inStock: true,
    featured: false,
    rating: 4.7,
    reviews: 88,
    createdAt: "2024-02-14",
  },
  {
    id: "p3",
    slug: "panel-wipe-ipa-prep",
    name: "Panel Wipe IPA Prep",
    categorySlug: "cleaners-degreasers",
    tagline: "Streak-free IPA solution for flawless pre-coating prep.",
    description:
      "Panel Wipe is a ready-to-use isopropyl alcohol solution that strips oils, polish residue, and silicone from paint surfaces. A mandatory final step before applying any ceramic coating, wax, or sealant to ensure maximum bonding. Pakistan's humid monsoon season means waxes and coatings struggle to bond if prep is skipped — Panel Wipe guarantees a completely clean, oil-free surface every time.",
    howToUse:
      "Spray liberally onto a clean microfiber cloth. Wipe panel in straight lines. Buff immediately with a second dry cloth before it evaporates. Work one panel at a time.",
    specs: [
      { label: "IPA concentration", value: "30%" },
      { label: "Safe on", value: "Clear coat, glass, plastic trim" },
      { label: "Residue", value: "Zero" },
    ],
    price: 5499,
    variants: [
      { label: "500 ml", price: 5499, sku: "PANELWIPE-500" },
      { label: "1 L", price: 9249, sku: "PANELWIPE-1L" },
    ],
    images: [
      "https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=800&q=80",
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
    ],
    stock: 28,
    inStock: true,
    featured: false,
    rating: 4.6,
    reviews: 55,
    createdAt: "2024-03-01",
  },

  // ─── Polishes & Compounds ────────────────────────────────
  {
    id: "p4",
    slug: "cut-king-compound",
    name: "Cut King Heavy Compound",
    categorySlug: "polishes-compounds",
    tagline: "Aggressive cut, minimal dust — removes deep scratches fast.",
    description:
      "Cut King is a fast-cut, low-dust machine compound that aggressively removes P1500 and finer sanding marks, heavy swirls, and oxidation. Its diminishing abrasive technology means it refines as it cuts so you spend less time on correction. Pakistan's extreme UV and sand-based micro-scratching leave deep defects in clear coat — Cut King's aggressive diminishing abrasive handles these conditions faster than any local alternative.",
    howToUse:
      "Apply a small amount to a foam or wool cutting pad. Work panel at speed 4–5 on a dual-action polisher. Wipe residue with a clean MF towel. Follow with a finishing polish.",
    specs: [
      { label: "Abrasive type", value: "Diminishing abrasive" },
      { label: "Cut level", value: "Heavy (7/10)" },
      { label: "Recommended pad", value: "Foam cutting / wool" },
      { label: "Dust level", value: "Low" },
    ],
    price: 12999,
    variants: [
      { label: "250 ml", price: 12999, sku: "CUTKING-250" },
      { label: "500 ml", price: 20499, sku: "CUTKING-500" },
    ],
    images: [
      "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80",
      "https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?w=800&q=80",
    ],
    stock: 24,
    inStock: true,
    featured: true,
    rating: 4.9,
    reviews: 176,
    badge: "Pro Pick",
    createdAt: "2024-01-20",
  },
  {
    id: "p5",
    slug: "gloss-finish-polish",
    name: "Gloss Finish One-Step Polish",
    categorySlug: "polishes-compounds",
    tagline: "Light correction and jaw-dropping gloss in a single step.",
    description:
      "Gloss Finish is a light-cut, high-gloss one-step polish perfect for lightly swirled or single-stage paint. It removes minor defects and leaves behind a deep, reflective finish without a separate finishing polish step. For the light swirls that accumulate from daily dust wiping — a near-universal issue on Pakistani roads — Gloss Finish restores a deep, reflective finish in a single step.",
    howToUse:
      "Apply to a foam finishing pad. Work on speed 3–4 on a dual-action polisher. Buff off residue with a plush MF towel. Can be applied by hand for maintenance.",
    specs: [
      { label: "Abrasive type", value: "Ultra-fine diminishing" },
      { label: "Cut level", value: "Light (3/10)" },
      { label: "Recommended pad", value: "Foam finishing" },
      { label: "PTFE additive", value: "Yes" },
    ],
    price: 10999,
    variants: [
      { label: "250 ml", price: 10999, sku: "GLOSSFIN-250" },
      { label: "500 ml", price: 16999, sku: "GLOSSFIN-500" },
    ],
    images: [
      "https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?w=800&q=80",
      "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80",
    ],
    stock: 2,
    inStock: true,
    featured: true,
    rating: 4.7,
    reviews: 102,
    createdAt: "2024-02-05",
  },

  // ─── Waxes & Sealants ────────────────────────────────────
  {
    id: "p6",
    slug: "sovereign-carnauba-wax",
    name: "Sovereign Carnauba Wax",
    categorySlug: "waxes-sealants",
    tagline: "Brazilian carnauba warmth with 3-month durability.",
    description:
      "Sovereign is a premium Grade-1 carnauba paste wax blended with synthetic polymers for extended durability without sacrificing the warm, liquid-depth look only carnauba can deliver. Suitable for all paint types. Pakistan's summer heat of up to 45°C demands a wax with real durability — Sovereign's Grade-1 carnauba blend holds through the hottest months without whitening or streaking.",
    howToUse:
      "Apply a thin, even coat with a foam applicator pad. Allow to haze (5–10 min in shade). Buff off with a plush microfiber towel using circular motions.",
    specs: [
      { label: "Carnauba grade", value: "Grade 1" },
      { label: "Durability", value: "3–4 months" },
      { label: "Application temp", value: "10–30 °C" },
      { label: "Finish", value: "Warm amber gloss" },
    ],
    price: 14999,
    variants: [
      { label: "150 g", price: 14999, sku: "SOVWAX-150" },
      { label: "400 g", price: 29999, sku: "SOVWAX-400" },
    ],
    images: [
      "/placeholder.svg",
      "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80",
    ],
    stock: 18,
    inStock: true,
    featured: true,
    rating: 4.8,
    reviews: 241,
    badge: "Customer Fave",
    createdAt: "2024-01-05",
  },
  {
    id: "p7",
    slug: "shield-paint-sealant",
    name: "Shield Polymer Paint Sealant",
    categorySlug: "waxes-sealants",
    tagline: "Synthetic polymer protection — 6 months of hydrophobic shine.",
    description:
      "Shield is a pure synthetic polymer sealant that bonds to clear coat to deliver 6 months of water-beading, UV-blocking, and anti-contamination protection. Its slick finish is noticeably easier to maintain than untreated paint. Pakistan's monsoon rains and intense UV exposure test any paint protection layer — Shield's synthetic polymer bonds deeply and outlasts standard waxes through multiple seasons.",
    howToUse:
      "Apply a thin layer with a microfiber or foam applicator. Cure 20–30 min in the shade. Buff off with a clean MF cloth. Can be layered after 1 hour for added thickness.",
    specs: [
      { label: "Durability", value: "5–6 months" },
      { label: "UV protection", value: "SPF equivalent 50" },
      { label: "Water contact angle", value: ">100°" },
      { label: "Flash time", value: "20–30 min" },
    ],
    price: 12499,
    variants: [
      { label: "500 ml", price: 12499, sku: "SHIELD-500" },
      { label: "1 L", price: 20499, sku: "SHIELD-1L" },
    ],
    images: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
      "/placeholder.svg",
    ],
    stock: 22,
    inStock: true,
    featured: false,
    rating: 4.6,
    reviews: 73,
    createdAt: "2024-03-10",
  },

  // ─── Ceramic Coatings ────────────────────────────────────
  {
    id: "p8",
    slug: "armour-ceramic-9h",
    name: "Armour Ceramic 9H Coating",
    categorySlug: "ceramic-coatings",
    tagline: "Professional-grade 9H nano-ceramic in a DIY bottle.",
    description:
      "Armour Ceramic 9H is a professional-grade SiO2 ceramic coating brought to the DIYer. Its nano-ceramic formula achieves a pencil hardness of 9H, providing extreme scratch resistance, chemical resistance, and a hydrophobic effect that lasts 3+ years. Engineered to survive Pakistan's extreme temperature swings — 45°C summer highs to cool winters — and resist the industrial pollution and dust that shortens paint life across Karachi and Lahore.",
    howToUse:
      "Apply to fully corrected, panel-wiped paint only. Wrap suede applicator, apply 5–6 drops per panel, spread in a cross-hatch pattern. Allow flash time (~2 min), level with a clean MF towel. Cure 12 hours before water contact.",
    specs: [
      { label: "SiO2 content", value: "82%" },
      { label: "Hardness", value: "9H" },
      { label: "Durability", value: "3–5 years" },
      { label: "Thickness per coat", value: "~1 micron" },
      { label: "Temperature resistance", value: "Up to 800°C" },
    ],
    price: 32999,
    variants: [
      { label: "30 ml kit", price: 32999, sku: "ARMOUR-30" },
      { label: "50 ml kit", price: 47999, sku: "ARMOUR-50" },
    ],
    images: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
      "https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?w=800&q=80",
    ],
    stock: 15,
    inStock: true,
    featured: true,
    rating: 4.9,
    reviews: 319,
    badge: "Premium",
    createdAt: "2024-01-15",
  },
  {
    id: "p9",
    slug: "graphene-boost-spray",
    name: "Graphene Boost Spray Coating",
    categorySlug: "ceramic-coatings",
    tagline: "Spray-on graphene topcoat — 12 months with zero effort.",
    description:
      "Graphene Boost is a spray-on graphene-infused Si coating that adds 12 months of water-repelling, anti-static, and anti-water-spot protection. Works over bare paint, existing waxes, sealants, or ceramic coatings as a maintenance layer. Karachi's coastal salt air and fine construction dust are particularly damaging to bare paint — Graphene Boost's anti-static graphene layer actively repels dust particles between washes.",
    howToUse:
      "Mist 2–3 sprays per panel onto a damp or dry, clean surface. Spread with a damp MF cloth, flip and buff dry. Works as a detailing spray topcoat.",
    specs: [
      { label: "Technology", value: "Graphene-infused Si" },
      { label: "Durability", value: "12 months" },
      { label: "Anti-static", value: "Yes" },
      { label: "Water spot resistance", value: "High" },
    ],
    price: 16999,
    variants: [
      { label: "500 ml", price: 16999, sku: "GRAPHEN-500" },
      { label: "1 L", price: 27999, sku: "GRAPHEN-1L" },
    ],
    images: [
      "https://images.unsplash.com/photo-1546614042-7df3c24c9e5d?w=800&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
    ],
    stock: 30,
    inStock: true,
    featured: false,
    rating: 4.7,
    reviews: 94,
    createdAt: "2024-04-01",
  },

  // ─── Towels & Applicators ────────────────────────────────
  {
    id: "p10",
    slug: "ultra-plush-detailing-towels",
    name: "Ultra Plush Microfiber Towels",
    categorySlug: "towels-applicators",
    tagline: "1200 GSM plush pile — the gentlest wipe for your paint.",
    description:
      "Ultra Plush towels use a 70/30 polyester/polyamide blend at 1200 GSM to deliver maximum absorption and zero marring on the most delicate paint finishes. Silk-banded edges prevent scratching during buffing. In Pakistan's dusty conditions, towel quality is everything — these 1200 GSM silk-banded microfibers lift residue without dragging particles across the paint surface.",
    howToUse:
      "Use for final wipe-down, wax/polish removal, or spray detailer maintenance. Wash before first use. Machine wash cold, no fabric softener, tumble dry low.",
    specs: [
      { label: "GSM", value: "1200" },
      { label: "Blend", value: "70/30 polyester/polyamide" },
      { label: "Edge type", value: "Silk-banded (no stitching)" },
      { label: "Size", value: "40 × 40 cm" },
    ],
    price: 9249,
    variants: [
      { label: "3-pack", price: 9249, sku: "UPLUSH-3" },
      { label: "6-pack", price: 16999, sku: "UPLUSH-6" },
      { label: "12-pack", price: 29999, sku: "UPLUSH-12" },
    ],
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
    ],
    stock: 50,
    inStock: true,
    featured: true,
    rating: 4.8,
    reviews: 387,
    badge: "Top Rated",
    createdAt: "2024-01-08",
  },
  {
    id: "p11",
    slug: "foam-applicator-pads",
    name: "Dual-Foam Applicator Pads",
    categorySlug: "towels-applicators",
    tagline: "Open-cell & closed-cell foam in one pad for total control.",
    description:
      "These dual-sided foam applicator pads feature an open-cell face for spreading creams, waxes, and light polishes, with a closed-cell backing for even pressure on curves and tight areas. Finger pocket for precise control. Dual-density foam that holds up in Pakistan's heat — the closed-cell backing resists compression even in high-temperature storage conditions common across the country.",
    howToUse:
      "Dampen pad slightly before use. Apply product to the open-cell face. Spread product in circular overlapping motions. Rinse thoroughly after use and air-dry.",
    specs: [
      { label: "Size", value: "10 cm diameter" },
      { label: "Thickness", value: "3 cm" },
      { label: "Material", value: "Dual-density foam" },
      { label: "Finger pocket", value: "Yes" },
    ],
    price: 4799,
    variants: [
      { label: "3-pack", price: 4799, sku: "FOAMPAD-3" },
      { label: "6-pack", price: 8499, sku: "FOAMPAD-6" },
    ],
    images: [
      "https://images.unsplash.com/photo-1593941798580-e0c5bd98b1a9?w=800&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    ],
    stock: 40,
    inStock: true,
    featured: false,
    rating: 4.5,
    reviews: 129,
    createdAt: "2024-02-20",
  },

  // ─── Kits & Bundles ──────────────────────────────────────
  {
    id: "p12",
    slug: "full-detail-starter-kit",
    name: "Full Detail Starter Kit",
    categorySlug: "kits-bundles",
    tagline: "Everything to take your car from grimy to gleaming.",
    description:
      "The Full Detail Starter Kit packs our most popular products into one discounted bundle — perfect for first-time detailers or anyone streamlining their setup. Includes foam soap, fallout remover, one-step polish, carnauba wax, and 3 ultra-plush towels. Everything you need for a complete Pakistani car care session — from dusty pre-wash to wax-sealed finish — at a bundled price that beats buying individually.",
    howToUse:
      "Follow the sequence: foam wash → fallout remover → one-step polish → carnauba wax → final wipe. Full step-by-step guide included in the box.",
    specs: [
      { label: "Includes", value: "5 full-size products + 3 MF towels" },
      { label: "Value", value: "Rs 50,000+ worth of product" },
      { label: "Guide included", value: "Yes — printed + digital QR" },
    ],
    price: 36999,
    variants: [{ label: "Full Kit", price: 36999, sku: "STARTKIT-01" }],
    images: [
      "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&q=80",
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
    ],
    stock: 12,
    inStock: true,
    featured: true,
    rating: 4.9,
    reviews: 203,
    badge: "Bundle &amp; Save",
    createdAt: "2024-01-12",
  },
  {
    id: "p13",
    slug: "ceramic-pro-kit",
    name: "Ceramic Pro Detailing Kit",
    categorySlug: "kits-bundles",
    tagline: "Full paint decon, correction, and ceramic coating system.",
    description:
      "The Ceramic Pro Kit is the complete professional workflow: IPA panel wipe, heavy compound, finishing polish, Armour 9H ceramic coating, and 6 ultra-plush towels — everything needed from bare paint to ceramic-sealed perfection. The complete professional workflow tuned for Pakistan: strip monsoon grime, correct heat-induced swirls, panel wipe, then seal with Armour 9H ceramic for years of protection in our conditions.",
    howToUse:
      "Follow the 5-stage system included: strip → compound → polish → panel wipe → coat. Step-by-step digital guide in the box.",
    specs: [
      { label: "Includes", value: "6 products + 6 MF towels" },
      { label: "Value", value: "Rs 80,000+ worth of product" },
      { label: "Guide included", value: "Yes — digital QR code" },
    ],
    price: 62999,
    variants: [{ label: "Pro Kit", price: 62999, sku: "CERAMKIT-01" }],
    images: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
      "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&q=80",
    ],
    stock: 8,
    inStock: true,
    featured: true,
    rating: 4.9,
    reviews: 148,
    badge: "Best Value",
    createdAt: "2024-02-01",
  },
  {
    id: "p14",
    slug: "maintenance-spray-detailer",
    name: "Quick Detailer Maintenance Spray",
    categorySlug: "waxes-sealants",
    tagline: "Between-wash gloss booster with light protection.",
    description:
      "Quick Detailer is a spray-and-wipe maintenance product that removes light dust, fingerprints, and water spots between washes while adding a slick, high-gloss finish. Compatible with all paint protection layers. Between washes in Karachi's dusty streets, Quick Detailer removes light dust without water — protecting your coating daily and keeping paint looking freshly detailed all week.",
    howToUse:
      "Mist 2–3 sprays per panel. Spread with a clean MF towel on one side, flip and buff to a streak-free finish. Use on a cool, shaded surface.",
    specs: [
      { label: "Safe on", value: "Paint, glass, trim, chrome" },
      { label: "Protection", value: "Light Si polymer" },
      { label: "Safe over", value: "Wax, sealant, ceramic coating" },
    ],
    price: 6299,
    variants: [
      { label: "500 ml", price: 6299, sku: "QKDET-500" },
      { label: "1 L", price: 10499, sku: "QKDET-1L" },
    ],
    images: [
      "https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=800&q=80",
      "/placeholder.svg",
    ],
    stock: 35,
    inStock: true,
    featured: false,
    rating: 4.6,
    reviews: 67,
    createdAt: "2024-03-22",
  },
];

export default products;

export const getFeaturedProducts = () => products.filter((p) => p.featured);
export const getProductsByCategory = (slug: string) =>
  products.filter((p) => p.categorySlug === slug);
export const getProductBySlug = (slug: string) =>
  products.find((p) => p.slug === slug);
export const getRelatedProducts = (product: Product, limit = 4) =>
  products
    .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
    .slice(0, limit);
export const searchProducts = (query: string) => {
  const q = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.tagline.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.categorySlug.toLowerCase().includes(q)
  );
};
