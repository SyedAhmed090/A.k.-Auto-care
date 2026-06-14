export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;        // ISO yyyy-mm-dd
  author: string;
  category: string;
  cover: string;       // image URL
  readingMinutes: number;
  content: string;     // markdown (rendered by components/ui/Markdown)
}

// Starter posts. Add new entries here — the listing, post pages, sitemap,
// and static params all read from this array.
export const POSTS: BlogPost[] = [
  {
    slug: "ceramic-coating-vs-wax",
    title: "Ceramic Coating vs Wax: Which Is Right for Your Car?",
    excerpt:
      "Wax is cheap and easy; ceramic coating lasts for years. Here's how to choose the right paint protection for your car and budget in Pakistan's climate.",
    date: "2026-05-20",
    author: "A.K. Auto Care",
    category: "Paint Protection",
    cover: "https://images.unsplash.com/photo-1605164599901-db7f68c4b1a2?w=1200&q=80",
    readingMinutes: 5,
    content: `
Choosing between wax and ceramic coating comes down to three things: how long you want the protection to last, how much you want to spend, and how much effort you're willing to put in.

## What car wax actually does

Wax lays down a thin sacrificial layer on top of your paint. It gives a warm, glossy shine and helps water bead off the surface.

- **Cost:** Low — a bottle covers many applications.
- **Durability:** 4–8 weeks, less in Pakistan's summer heat and dust.
- **Effort:** Quick to apply, but needs reapplying every month or two.

Wax is perfect if you enjoy regular detailing and like switching products often.

## What ceramic coating does

A ceramic coating chemically bonds to your clear coat, forming a hard, semi-permanent layer.

- **Cost:** Higher upfront.
- **Durability:** 1–3 years from a single application.
- **Effort:** Demanding prep, but almost no maintenance afterwards.

> A coating doesn't make your car scratch-proof — it makes it far easier to keep clean and dramatically improves water and dirt resistance.

## Which should you choose?

1. **Daily driver in a dusty city** — a ceramic coating saves you washing time and protects against contaminants.
2. **Weekend or show car** — wax gives that deep, wet look and lets you enjoy the process.
3. **On a budget** — start with a quality wax, then step up to a coating once you've mastered prep.

Whichever you pick, **preparation is everything**. A coating applied over swirls and contamination just locks the damage in.

Need help deciding? Message us on WhatsApp and we'll recommend the right product for your car and budget.
    `,
  },
  {
    slug: "remove-swirl-marks-beginners-guide",
    title: "How to Remove Swirl Marks: A Beginner's Guide to Paint Correction",
    excerpt:
      "Those spider-web scratches under the sun are swirl marks. Here's what causes them and how to safely correct your paint at home — step by step.",
    date: "2026-05-04",
    author: "A.K. Auto Care",
    category: "Paint Correction",
    cover: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=1200&q=80",
    readingMinutes: 6,
    content: `
If you've ever seen fine, circular scratches in your paint under direct sunlight, those are **swirl marks** — and they're almost always self-inflicted during washing.

## What causes swirl marks

- Washing with a dirty sponge or a single bucket.
- Using circular motions with too much pressure.
- Automatic car washes with harsh brushes.
- Wiping a dusty car with a dry cloth.

## What you'll need

1. A dual-action polisher (safer for beginners than a rotary).
2. A cutting or polishing compound.
3. Clean microfibre applicator and buffing towels.
4. Good lighting — ideally a detailing light or direct sun.

## The correction process

1. **Wash and decontaminate** the panel so no grit is left to drag across the paint.
2. **Apply a small amount of compound** to the pad — a few pea-sized dots.
3. **Work one small section at a time** (about 50cm x 50cm) at moderate speed, keeping the pad flat.
4. **Wipe off the residue** and inspect under light.
5. **Refine with a finishing polish** if the compound left light haze.

> Less is more. Removing too much clear coat to chase one deep scratch can do permanent damage. Correct what's safe, then protect the rest.

## Lock in your results

Once the paint is corrected, it's bare and vulnerable. Immediately follow up with a **sealant or ceramic coating** to protect your hard work — otherwise the swirls will return with the next wash.

Take your time, keep your towels clean, and your paint will reward you with a mirror finish.
    `,
  },
  {
    slug: "5-detailing-mistakes-that-damage-paint",
    title: "5 Car Detailing Mistakes That Damage Your Paint",
    excerpt:
      "Even careful owners damage their own paint without realising it. Avoid these five common detailing mistakes to keep your finish flawless.",
    date: "2026-04-18",
    author: "A.K. Auto Care",
    category: "Detailing Tips",
    cover: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=1200&q=80",
    readingMinutes: 4,
    content: `
Detailing is supposed to protect your car — but a few common habits do the opposite. Here are five mistakes to stop making today.

## 1. Washing in direct sunlight

Heat dries soap and water too fast, leaving water spots and streaks. **Always wash in the shade** and on a cool panel.

## 2. Using one bucket

Dunking a dirty mitt back into your only bucket means you're rubbing grit across the paint. Use the **two-bucket method** — one for soap, one to rinse the mitt.

## 3. Dish soap instead of car shampoo

Dish soap strips wax and protection and dries out trim. Use a **pH-balanced car shampoo** made for automotive paint.

## 4. Wiping a dry, dusty car

"Just a quick wipe" with a dry cloth grinds dust into the clear coat and creates swirls. If it's dusty, **rinse first** or use a quick detailer as lubrication.

## 5. Skipping paint protection

Bare clear coat oxidises, fades, and picks up contamination. A simple **wax or sealant every few months** — or a one-time ceramic coating — keeps your paint protected and easier to clean.

> The golden rule of detailing: anything that touches your paint should be clean and lubricated.

Fix these five habits and you'll prevent the vast majority of avoidable paint damage.
    `,
  },
  {
    slug: "paint-prep-before-coating-guide",
    title: "Preparing Your Car's Paint Before Coating: The Complete Prep Guide",
    excerpt:
      "A ceramic coating is only as good as the prep underneath it. Follow this complete decontamination and prep routine for a flawless, long-lasting finish.",
    date: "2026-04-02",
    author: "A.K. Auto Care",
    category: "Paint Protection",
    cover: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
    readingMinutes: 7,
    content: `
The single biggest factor in how good — and how long-lasting — a coating looks is the **prep work** that happens before you apply a single drop.

## Step 1: A proper wash

Start with a thorough two-bucket wash using a dedicated shampoo to remove loose dirt and old wax. The surface needs to be completely clean before you can assess it.

## Step 2: Decontaminate

Even a clean-looking car has bonded contaminants you can feel as roughness.

- **Iron remover** dissolves brake-dust and industrial fallout.
- **Clay bar or clay mitt** pulls out embedded grit, leaving glass-smooth paint.

Run your hand (inside a plastic bag) over the panel — it should feel perfectly smooth before you continue.

## Step 3: Correct the paint

This is where you remove swirls and light scratches with a compound and polish. Coatings are transparent and slightly amplify what's underneath, so **any defects you leave will be sealed in for years**.

## Step 4: Panel wipe

Before coating, wipe every panel with an **isopropyl-based prep spray** to strip away polishing oils. This is critical — leftover oils stop the coating from bonding properly.

> Skipping the panel wipe is the number-one reason DIY coatings fail early.

## Step 5: Apply in the right conditions

1. Work indoors or in shade, out of direct sun and dust.
2. Coat one panel at a time in a cross-hatch pattern.
3. Let it flash, then buff off the high spots before they cure hard.
4. Allow the full cure time before exposing the car to water.

## The payoff

Done right, this routine gives you a deep, glassy finish and a coating that can last years. Rush the prep, and even the best product will disappoint.

Want a prep kit tailored to your car? Reach out on WhatsApp and we'll put one together.
    `,
  },
];

export function getPosts(): BlogPost[] {
  return [...POSTS].sort((a, b) => b.date.localeCompare(a.date));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}
