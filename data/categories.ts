export interface Category {
  slug: string;
  name: string;
  description: string;
  image: string;
  accent: string;
}

// TODO: replace /placeholder.svg with real collection photography.
const categories: Category[] = [
  {
    slug: "surface-correction",
    name: "Surface Correction",
    description:
      "Professional-grade heavy cutting tools to eliminate deep paint defects.",
    image: "/placeholder.svg",
    accent: "#e8a020",
  },
  {
    slug: "refinement-polish",
    name: "Refinement & Polish",
    description:
      "Paint refinement solutions built to unlock optical clarity and mirror depth.",
    image: "/placeholder.svg",
    accent: "#d08c18",
  },
  {
    slug: "automotive-utility",
    name: "Automotive Utility",
    description:
      "Durable structural sealants built for lasting weatherproofing protection.",
    image: "/placeholder.svg",
    accent: "#c9901e",
  },
];

export default categories;
export const getCategoryBySlug = (slug: string) =>
  categories.find((c) => c.slug === slug);
