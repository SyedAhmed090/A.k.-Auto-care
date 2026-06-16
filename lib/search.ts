import type { Product } from "@/data/products";

// Maps common shopper intent to the vocabulary actually used in our catalog copy, so a
// search like "scratch remover" surfaces compounds and "wax" surfaces polishes/sealants.
// Each key expands to extra strings that also count as a match for that term.
const SYNONYMS: Record<string, string[]> = {
  scratch: ["compound", "cut", "correction", "rubbing"],
  scratches: ["compound", "cut", "correction"],
  remover: ["compound", "cut", "polish"],
  swirl: ["polish", "refine", "fine"],
  swirls: ["polish", "refine", "fine"],
  hologram: ["polish", "refine"],
  holograms: ["polish", "refine"],
  oxidation: ["compound", "cut", "heavy"],
  buff: ["compound", "polish"],
  buffing: ["compound", "polish"],
  wax: ["polish", "protect", "seal", "glaze"],
  coating: ["polish", "protect", "seal"],
  ceramic: ["polish", "protect", "seal"],
  shine: ["polish", "gloss", "glaze"],
  gloss: ["polish", "glaze"],
  glossy: ["polish", "glaze"],
  protect: ["polish", "seal", "hydrophobic"],
  protection: ["polish", "seal", "hydrophobic"],
  mirror: ["polish", "gloss"],
  cut: ["compound", "heavy"],
  seal: ["sealant", "utility", "rubber"],
  sealing: ["sealant", "utility", "rubber"],
  leak: ["sealant", "rubber", "utility"],
  rust: ["sealant", "utility"],
  waterproof: ["sealant", "rubber", "utility"],
};

const FIELD_WEIGHTS = { name: 8, tagline: 5, category: 4, description: 2 } as const;
const STARTS_WITH_BONUS = 4; // applied on top of the name weight for a prefix match

function fieldScore(field: string, term: string, weight: number, isName: boolean): number {
  if (!field) return 0;
  if (field.includes(term)) {
    return weight + (isName && field.startsWith(term) ? STARTS_WITH_BONUS : 0);
  }
  return 0;
}

/**
 * Rank products against a free-text query. Every whitespace-separated term must match at
 * least one field (directly or via a synonym) for a product to be included; results are
 * then sorted by total weighted score (name > tagline > category > description). An empty
 * query returns the full list unchanged.
 */
export function searchAndRank(all: Product[], query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return all;
  const terms = q.split(/\s+/).filter(Boolean);

  const scored = all.map((p, index) => {
    const fields = {
      name: p.name.toLowerCase(),
      tagline: p.tagline.toLowerCase(),
      category: p.categorySlug.toLowerCase().replace(/-/g, " "),
      description: (p.description ?? "").toLowerCase(),
    };

    let score = 0;
    let matchedAllTerms = true;

    for (const term of terms) {
      const variants = [term, ...(SYNONYMS[term] ?? [])];
      let termScore = 0;
      for (const v of variants) {
        // direct term scores at full weight; synonym variants at a slight discount
        const isSynonym = v !== term;
        const factor = isSynonym ? 0.6 : 1;
        termScore += fieldScore(fields.name, v, FIELD_WEIGHTS.name * factor, true);
        termScore += fieldScore(fields.tagline, v, FIELD_WEIGHTS.tagline * factor, false);
        termScore += fieldScore(fields.category, v, FIELD_WEIGHTS.category * factor, false);
        termScore += fieldScore(fields.description, v, FIELD_WEIGHTS.description * factor, false);
      }
      if (termScore === 0) matchedAllTerms = false;
      score += termScore;
    }

    return { p, score, matchedAllTerms, index };
  });

  return scored
    .filter((s) => s.matchedAllTerms && s.score > 0)
    // higher score first; stable tiebreak on original order
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((s) => s.p);
}
