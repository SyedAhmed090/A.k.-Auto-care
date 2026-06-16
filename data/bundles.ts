// Curated "Complete the System" kits — the multi-step detailing workflows that pair
// products into a frequently-bought-together cross-sell on the product page.
//
// Modelled by ROLE rather than fixed slugs so that alternative products which fill the
// same step (e.g. Pro-Cut and Hyper-Cut are both "cut" compounds) all surface the system
// with themselves slotted into their step. The first slug in each role is the default
// shown when the current product fills a different role.
//
// NOTE: there is intentionally no bundle discount here. Order totals are recomputed
// server-side from DB prices (app/api/orders/route.ts), so a client-side discount would
// not be honoured at checkout. True discounted bundle SKUs would need server support.

export interface SystemRole {
  /** Display label, e.g. "Step 1 · Cut" */
  step: string;
  /** One-line reason this step exists */
  note: string;
  /** Products that can fill this role; first is the default/primary. */
  slugs: string[];
}

export interface DetailingSystem {
  id: string;
  name: string;
  description: string;
  roles: SystemRole[];
}

const systems: DetailingSystem[] = [
  {
    id: "paint-correction-3step",
    name: "The 3-Step Paint Correction System",
    description:
      "Cut, refine, then protect — the full professional workflow for a swirl-free, mirror finish.",
    roles: [
      {
        step: "Step 1 · Cut",
        note: "Level deep scratches, oxidation & defects",
        slugs: [
          "ak-pro-cut-heavy-rubbing-compound-1kg",
          "ak-hyper-cut-fast-compound-1kg",
        ],
      },
      {
        step: "Step 2 · Refine",
        note: "Erase compounding haze, swirls & holograms",
        slugs: [
          "ak-fine-grade-polishing-compound-1kg",
          "ak-apex-2in1-finish-compound-1kg",
        ],
      },
      {
        step: "Step 3 · Protect",
        note: "Lock in gloss with a hydrophobic seal",
        slugs: ["ak-ultimate-car-polish-1kg"],
      },
    ],
  },
];

export interface ResolvedStep {
  step: string;
  note: string;
  slug: string;
  isCurrent: boolean;
}

/**
 * Given a product slug, find the system it belongs to (as a step in any role) and return
 * the ordered list of steps with the slug to display for each — the current product slots
 * into its own role, every other role shows its primary product. Returns null if the
 * product is not part of any system.
 */
export function getSystemForProduct(
  slug: string
): { system: DetailingSystem; steps: ResolvedStep[] } | null {
  const system = systems.find((s) => s.roles.some((r) => r.slugs.includes(slug)));
  if (!system) return null;
  const steps: ResolvedStep[] = system.roles.map((role) => {
    const isCurrent = role.slugs.includes(slug);
    return {
      step: role.step,
      note: role.note,
      slug: isCurrent ? slug : role.slugs[0],
      isCurrent,
    };
  });
  return { system, steps };
}

export default systems;
