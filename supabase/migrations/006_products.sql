-- Products + Variants tables, RLS, and seed data

create table if not exists products (
  id            text primary key,
  slug          text not null unique,
  name          text not null,
  category_slug text not null,
  tagline       text not null,
  description   text not null,
  how_to_use    text not null,
  specs         jsonb not null default '[]',
  price         integer not null,
  images        jsonb not null default '[]',
  stock         integer,
  in_stock      boolean not null default true,
  featured      boolean not null default false,
  rating        numeric(3,1) not null default 0,
  reviews       integer not null default 0,
  badge         text,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists product_variants (
  id          uuid default gen_random_uuid() primary key,
  product_id  text not null references products(id) on delete cascade,
  label       text not null,
  price       integer not null,
  sku         text not null unique,
  sort_order  integer not null default 0
);

create index if not exists products_category_idx  on products(category_slug);
create index if not exists products_featured_idx  on products(featured);
create index if not exists products_sort_idx      on products(sort_order);
create index if not exists variants_product_idx   on product_variants(product_id);

alter table products         enable row level security;
alter table product_variants enable row level security;

create policy "products_public_read"  on products         for select using (true);
create policy "variants_public_read"  on product_variants for select using (true);

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger products_updated_at
  before update on products
  for each row execute function set_updated_at();

-- ── Seed: 14 products ────────────────────────────────────────────────────────

insert into products
  (id, slug, name, category_slug, tagline, description, how_to_use, specs, price, images, stock, in_stock, featured, rating, reviews, badge, sort_order, created_at)
values

('p1','alpha-foam-cannon-soap','Alpha Foam Cannon Soap','cleaners-degreasers',
 'Thick, clinging foam that lifts dirt without touching the paint.',
 'Alpha Foam Cannon Soap is a high-sudsing, pH-neutral shampoo engineered for foam cannons and foam guns. Its thick foam sheet clings to vertical surfaces, dwelling on contaminants long enough to safely emulsify road grime, brake dust, and organic material before you ever touch the car. Especially effective in Karachi''s dusty coastal environment — thick foam lifts road dust and sea-salt deposits safely before you ever touch the paint.',
 'Dilute 30–60 ml per litre of water in your foam cannon reservoir. Apply top-down, let dwell 2–3 min, then rinse. Follow with a contact wash if needed.',
 '[{"label":"pH","value":"6.5–7.5 (neutral)"},{"label":"Dilution ratio","value":"1:30 – 1:60"},{"label":"Finish","value":"Spot-free rinse aid included"},{"label":"Scent","value":"Fresh citrus"}]',
 6999,'["https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"]',
 47,true,true,4.8,214,'Best Seller',1,'2024-01-10'),

('p2','ironbuster-fallout-remover','IronBuster Fallout Remover','cleaners-degreasers',
 'Bleeds purple on contact — turns iron particles into liquid.',
 'IronBuster is a pH-balanced, colour-changing fallout remover that reacts on contact with iron contamination. As the purple reaction spreads across the panel you can see exactly how contaminated your paint really is. Safe on painted surfaces, alloys, chrome, and glass. In Pakistan''s industrial and construction-heavy cities, iron fallout accumulates rapidly on exposed paintwork — IronBuster''s colour-change reaction shows exactly how contaminated your car really is.',
 'Spray onto cool, dry or damp paintwork. Allow 3–5 min dwell. Agitate with a soft brush where needed. Rinse thoroughly. Do not let dry on the surface.',
 '[{"label":"pH","value":"5.5 – 6.5"},{"label":"Safe on","value":"Paint, alloy, chrome, glass"},{"label":"Reaction time","value":"2–5 min"},{"label":"Scent","value":"Mild chemical"}]',
 8499,'["https://images.unsplash.com/photo-1558618047-f4e50b806c73?w=800&q=80","https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80"]',
 3,true,false,4.7,88,null,2,'2024-02-14'),

('p3','panel-wipe-ipa-prep','Panel Wipe IPA Prep','cleaners-degreasers',
 'Streak-free IPA solution for flawless pre-coating prep.',
 'Panel Wipe is a ready-to-use isopropyl alcohol solution that strips oils, polish residue, and silicone from paint surfaces. A mandatory final step before applying any ceramic coating, wax, or sealant to ensure maximum bonding. Pakistan''s humid monsoon season means waxes and coatings struggle to bond if prep is skipped — Panel Wipe guarantees a completely clean, oil-free surface every time.',
 'Spray liberally onto a clean microfiber cloth. Wipe panel in straight lines. Buff immediately with a second dry cloth before it evaporates. Work one panel at a time.',
 '[{"label":"IPA concentration","value":"30%"},{"label":"Safe on","value":"Clear coat, glass, plastic trim"},{"label":"Residue","value":"Zero"}]',
 5499,'["https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=800&q=80","https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80"]',
 28,true,false,4.6,55,null,3,'2024-03-01'),

('p4','cut-king-compound','Cut King Heavy Compound','polishes-compounds',
 'Aggressive cut, minimal dust — removes deep scratches fast.',
 'Cut King is a fast-cut, low-dust machine compound that aggressively removes P1500 and finer sanding marks, heavy swirls, and oxidation. Its diminishing abrasive technology means it refines as it cuts so you spend less time on correction. Pakistan''s extreme UV and sand-based micro-scratching leave deep defects in clear coat — Cut King''s aggressive diminishing abrasive handles these conditions faster than any local alternative.',
 'Apply a small amount to a foam or wool cutting pad. Work panel at speed 4–5 on a dual-action polisher. Wipe residue with a clean MF towel. Follow with a finishing polish.',
 '[{"label":"Abrasive type","value":"Diminishing abrasive"},{"label":"Cut level","value":"Heavy (7/10)"},{"label":"Recommended pad","value":"Foam cutting / wool"},{"label":"Dust level","value":"Low"}]',
 12999,'["https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80","https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?w=800&q=80"]',
 24,true,true,4.9,176,'Pro Pick',4,'2024-01-20'),

('p5','gloss-finish-polish','Gloss Finish One-Step Polish','polishes-compounds',
 'Light correction and jaw-dropping gloss in a single step.',
 'Gloss Finish is a light-cut, high-gloss one-step polish perfect for lightly swirled or single-stage paint. It removes minor defects and leaves behind a deep, reflective finish without a separate finishing polish step. For the light swirls that accumulate from daily dust wiping — a near-universal issue on Pakistani roads — Gloss Finish restores a deep, reflective finish in a single step.',
 'Apply to a foam finishing pad. Work on speed 3–4 on a dual-action polisher. Buff off residue with a plush MF towel. Can be applied by hand for maintenance.',
 '[{"label":"Abrasive type","value":"Ultra-fine diminishing"},{"label":"Cut level","value":"Light (3/10)"},{"label":"Recommended pad","value":"Foam finishing"},{"label":"PTFE additive","value":"Yes"}]',
 10999,'["https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?w=800&q=80","https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80"]',
 2,true,true,4.7,102,null,5,'2024-02-05'),

('p6','sovereign-carnauba-wax','Sovereign Carnauba Wax','waxes-sealants',
 'Brazilian carnauba warmth with 3-month durability.',
 'Sovereign is a premium Grade-1 carnauba paste wax blended with synthetic polymers for extended durability without sacrificing the warm, liquid-depth look only carnauba can deliver. Suitable for all paint types. Pakistan''s summer heat of up to 45°C demands a wax with real durability — Sovereign''s Grade-1 carnauba blend holds through the hottest months without whitening or streaking.',
 'Apply a thin, even coat with a foam applicator pad. Allow to haze (5–10 min in shade). Buff off with a plush microfiber towel using circular motions.',
 '[{"label":"Carnauba grade","value":"Grade 1"},{"label":"Durability","value":"3–4 months"},{"label":"Application temp","value":"10–30 °C"},{"label":"Finish","value":"Warm amber gloss"}]',
 14999,'["/placeholder.svg","https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80"]',
 18,true,true,4.8,241,'Customer Fave',6,'2024-01-05'),

('p7','shield-paint-sealant','Shield Polymer Paint Sealant','waxes-sealants',
 'Synthetic polymer protection — 6 months of hydrophobic shine.',
 'Shield is a pure synthetic polymer sealant that bonds to clear coat to deliver 6 months of water-beading, UV-blocking, and anti-contamination protection. Its slick finish is noticeably easier to maintain than untreated paint. Pakistan''s monsoon rains and intense UV exposure test any paint protection layer — Shield''s synthetic polymer bonds deeply and outlasts standard waxes through multiple seasons.',
 'Apply a thin layer with a microfiber or foam applicator. Cure 20–30 min in the shade. Buff off with a clean MF cloth. Can be layered after 1 hour for added thickness.',
 '[{"label":"Durability","value":"5–6 months"},{"label":"UV protection","value":"SPF equivalent 50"},{"label":"Water contact angle","value":">100°"},{"label":"Flash time","value":"20–30 min"}]',
 12499,'["https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80","/placeholder.svg"]',
 22,true,false,4.6,73,null,7,'2024-03-10'),

('p8','armour-ceramic-9h','Armour Ceramic 9H Coating','ceramic-coatings',
 'Professional-grade 9H nano-ceramic in a DIY bottle.',
 'Armour Ceramic 9H is a professional-grade SiO2 ceramic coating brought to the DIYer. Its nano-ceramic formula achieves a pencil hardness of 9H, providing extreme scratch resistance, chemical resistance, and a hydrophobic effect that lasts 3+ years. Engineered to survive Pakistan''s extreme temperature swings — 45°C summer highs to cool winters — and resist the industrial pollution and dust that shortens paint life across Karachi and Lahore.',
 'Apply to fully corrected, panel-wiped paint only. Wrap suede applicator, apply 5–6 drops per panel, spread in a cross-hatch pattern. Allow flash time (~2 min), level with a clean MF towel. Cure 12 hours before water contact.',
 '[{"label":"SiO2 content","value":"82%"},{"label":"Hardness","value":"9H"},{"label":"Durability","value":"3–5 years"},{"label":"Thickness per coat","value":"~1 micron"},{"label":"Temperature resistance","value":"Up to 800°C"}]',
 32999,'["https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80","https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?w=800&q=80"]',
 15,true,true,4.9,319,'Premium',8,'2024-01-15'),

('p9','graphene-boost-spray','Graphene Boost Spray Coating','ceramic-coatings',
 'Spray-on graphene topcoat — 12 months with zero effort.',
 'Graphene Boost is a spray-on graphene-infused Si coating that adds 12 months of water-repelling, anti-static, and anti-water-spot protection. Works over bare paint, existing waxes, sealants, or ceramic coatings as a maintenance layer. Karachi''s coastal salt air and fine construction dust are particularly damaging to bare paint — Graphene Boost''s anti-static graphene layer actively repels dust particles between washes.',
 'Mist 2–3 sprays per panel onto a damp or dry, clean surface. Spread with a damp MF cloth, flip and buff dry. Works as a detailing spray topcoat.',
 '[{"label":"Technology","value":"Graphene-infused Si"},{"label":"Durability","value":"12 months"},{"label":"Anti-static","value":"Yes"},{"label":"Water spot resistance","value":"High"}]',
 16999,'["https://images.unsplash.com/photo-1546614042-7df3c24c9e5d?w=800&q=80","https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80"]',
 30,true,false,4.7,94,null,9,'2024-04-01'),

('p10','ultra-plush-detailing-towels','Ultra Plush Microfiber Towels','towels-applicators',
 '1200 GSM plush pile — the gentlest wipe for your paint.',
 'Ultra Plush towels use a 70/30 polyester/polyamide blend at 1200 GSM to deliver maximum absorption and zero marring on the most delicate paint finishes. Silk-banded edges prevent scratching during buffing. In Pakistan''s dusty conditions, towel quality is everything — these 1200 GSM silk-banded microfibers lift residue without dragging particles across the paint surface.',
 'Use for final wipe-down, wax/polish removal, or spray detailer maintenance. Wash before first use. Machine wash cold, no fabric softener, tumble dry low.',
 '[{"label":"GSM","value":"1200"},{"label":"Blend","value":"70/30 polyester/polyamide"},{"label":"Edge type","value":"Silk-banded (no stitching)"},{"label":"Size","value":"40 × 40 cm"}]',
 9249,'["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80","https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80"]',
 50,true,true,4.8,387,'Top Rated',10,'2024-01-08'),

('p11','foam-applicator-pads','Dual-Foam Applicator Pads','towels-applicators',
 'Open-cell & closed-cell foam in one pad for total control.',
 'These dual-sided foam applicator pads feature an open-cell face for spreading creams, waxes, and light polishes, with a closed-cell backing for even pressure on curves and tight areas. Finger pocket for precise control. Dual-density foam that holds up in Pakistan''s heat — the closed-cell backing resists compression even in high-temperature storage conditions common across the country.',
 'Dampen pad slightly before use. Apply product to the open-cell face. Spread product in circular overlapping motions. Rinse thoroughly after use and air-dry.',
 '[{"label":"Size","value":"10 cm diameter"},{"label":"Thickness","value":"3 cm"},{"label":"Material","value":"Dual-density foam"},{"label":"Finger pocket","value":"Yes"}]',
 4799,'["https://images.unsplash.com/photo-1593941798580-e0c5bd98b1a9?w=800&q=80","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"]',
 40,true,false,4.5,129,null,11,'2024-02-20'),

('p12','full-detail-starter-kit','Full Detail Starter Kit','kits-bundles',
 'Everything to take your car from grimy to gleaming.',
 'The Full Detail Starter Kit packs our most popular products into one discounted bundle — perfect for first-time detailers or anyone streamlining their setup. Includes foam soap, fallout remover, one-step polish, carnauba wax, and 3 ultra-plush towels. Everything you need for a complete Pakistani car care session — from dusty pre-wash to wax-sealed finish — at a bundled price that beats buying individually.',
 'Follow the sequence: foam wash → fallout remover → one-step polish → carnauba wax → final wipe. Full step-by-step guide included in the box.',
 '[{"label":"Includes","value":"5 full-size products + 3 MF towels"},{"label":"Value","value":"Rs 50,000+ worth of product"},{"label":"Guide included","value":"Yes — printed + digital QR"}]',
 36999,'["https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&q=80","https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80"]',
 12,true,true,4.9,203,'Bundle & Save',12,'2024-01-12'),

('p13','ceramic-pro-kit','Ceramic Pro Detailing Kit','kits-bundles',
 'Full paint decon, correction, and ceramic coating system.',
 'The Ceramic Pro Kit is the complete professional workflow: IPA panel wipe, heavy compound, finishing polish, Armour 9H ceramic coating, and 6 ultra-plush towels — everything needed from bare paint to ceramic-sealed perfection. The complete professional workflow tuned for Pakistan: strip monsoon grime, correct heat-induced swirls, panel wipe, then seal with Armour 9H ceramic for years of protection in our conditions.',
 'Follow the 5-stage system included: strip → compound → polish → panel wipe → coat. Step-by-step digital guide in the box.',
 '[{"label":"Includes","value":"6 products + 6 MF towels"},{"label":"Value","value":"Rs 80,000+ worth of product"},{"label":"Guide included","value":"Yes — digital QR code"}]',
 62999,'["https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80","https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&q=80"]',
 8,true,true,4.9,148,'Best Value',13,'2024-02-01'),

('p14','maintenance-spray-detailer','Quick Detailer Maintenance Spray','waxes-sealants',
 'Between-wash gloss booster with light protection.',
 'Quick Detailer is a spray-and-wipe maintenance product that removes light dust, fingerprints, and water spots between washes while adding a slick, high-gloss finish. Compatible with all paint protection layers. Between washes in Karachi''s dusty streets, Quick Detailer removes light dust without water — protecting your coating daily and keeping paint looking freshly detailed all week.',
 'Mist 2–3 sprays per panel. Spread with a clean MF towel on one side, flip and buff to a streak-free finish. Use on a cool, shaded surface.',
 '[{"label":"Safe on","value":"Paint, glass, trim, chrome"},{"label":"Protection","value":"Light Si polymer"},{"label":"Safe over","value":"Wax, sealant, ceramic coating"}]',
 6299,'["https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=800&q=80","/placeholder.svg"]',
 35,true,false,4.6,67,null,14,'2024-03-22')

ON CONFLICT (id) DO NOTHING;

-- ── Seed variants ─────────────────────────────────────────────────────────────

insert into product_variants (product_id, label, price, sku, sort_order) values
('p1','500 ml',6999,'ALPHA-FOAM-500',0),
('p1','1 L',10999,'ALPHA-FOAM-1L',1),
('p1','5 L',36999,'ALPHA-FOAM-5L',2),
('p2','500 ml',8499,'IRONBUST-500',0),
('p2','1 L',14499,'IRONBUST-1L',1),
('p3','500 ml',5499,'PANELWIPE-500',0),
('p3','1 L',9249,'PANELWIPE-1L',1),
('p4','250 ml',12999,'CUTKING-250',0),
('p4','500 ml',20499,'CUTKING-500',1),
('p5','250 ml',10999,'GLOSSFIN-250',0),
('p5','500 ml',16999,'GLOSSFIN-500',1),
('p6','150 g',14999,'SOVWAX-150',0),
('p6','400 g',29999,'SOVWAX-400',1),
('p7','500 ml',12499,'SHIELD-500',0),
('p7','1 L',20499,'SHIELD-1L',1),
('p8','30 ml kit',32999,'ARMOUR-30',0),
('p8','50 ml kit',47999,'ARMOUR-50',1),
('p9','500 ml',16999,'GRAPHEN-500',0),
('p9','1 L',27999,'GRAPHEN-1L',1),
('p10','3-pack',9249,'UPLUSH-3',0),
('p10','6-pack',16999,'UPLUSH-6',1),
('p10','12-pack',29999,'UPLUSH-12',2),
('p11','3-pack',4799,'FOAMPAD-3',0),
('p11','6-pack',8499,'FOAMPAD-6',1),
('p12','Full Kit',36999,'STARTKIT-01',0),
('p13','Pro Kit',62999,'CERAMKIT-01',0),
('p14','500 ml',6299,'QKDET-500',0),
('p14','1 L',10499,'QKDET-1L',1)
ON CONFLICT (sku) DO NOTHING;
