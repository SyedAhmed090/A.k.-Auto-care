-- Replace the demo seed catalog with the real A.K. Auto Care product line.
-- Removes the 14 placeholder products (cascades their variants + demo reviews)
-- and seeds the 6 launch products across 3 new collections.
--
-- NOTE: prices are placeholders (0) and every product is marked out of stock
-- with a "Coming Soon" badge until real pricing and product photography are
-- supplied (update via the admin portal or a follow-up migration).

delete from products;

insert into products
  (id, slug, name, category_slug, tagline, description, how_to_use, specs, price, images, stock, in_stock, featured, rating, reviews, badge, sort_order)
values

('p1','ak-pro-cut-heavy-rubbing-compound-1kg','Pro-Cut Heavy Rubbing Compound (1 KG)','surface-correction',
 'Industrial paste compound that erases deep oxidation, scratches, and severe weathering.',
 'A premium, professional-grade, pre-softened paste compound engineered specifically to eliminate severe oxidation, deep surface scratches, and heavy industrial fallout from weathered clear coats. Designed to safely restore life back to dead, faded paintwork, creating a perfectly smooth, workable canvas. Key features — Pre-Softened Paste: advanced formula engineered for smooth, controlled product distribution without making a mess; Heavy Oxidation Leveling: specifically aggressive against dead, faded paint layers suffering from severe environmental weathering; Rotary Optimized: developed to perform exceptionally with rotary buffers and heavy cutting wool or foam pads.',
 'Apply a small amount to a heavy cutting wool or foam pad on a rotary buffer. Work the panel in slow, overlapping passes at moderate speed until the defects are leveled, then wipe the residue with a clean microfiber towel and refine with a finishing polish.',
 '[{"label":"Product Form","value":"Pre-softened Heavy Paste"},{"label":"Defect Rating","value":"Heavy Paint Oxidation & Deep Scratch Removal"},{"label":"Recommended Tooling","value":"Rotary Buffer"},{"label":"Cut Intensity","value":"9 / 10"},{"label":"Gloss Output","value":"4 / 10"},{"label":"Net Weight","value":"1 KG (1000g)"}]',
 0,'["/placeholder.svg"]',0,false,false,0,0,'Coming Soon',1),

('p2','ak-hyper-cut-fast-compound-1kg','Hyper-Cut Fast Compound (1 KG)','surface-correction',
 'Fast-acting liquid heavy-cut that levels deep P1500 sand scratches with minimal dust.',
 'An advanced, fast-acting liquid heavy-cut compound designed to rapidly level deep sand scratches and severe paint defects. Engineered with micro-abrasives tailored for modern hard clear coats, it delivers an extremely clean, high-efficiency, low-dust cycle. Key features — Rapid Scratch Leveling: quickly eliminates aggressive P1500+ grit sanding marks and deep scratches; Low-Dusting Cycle: high-viscosity formula ensures a clean working environment with minimal compound sling; Dual-Action & Rotary Safe: versatile formula that works beautifully across multiple machine polishing platforms.',
 'Shake well. Apply a few drops to a cutting pad on a dual-action or rotary machine. Spread at low speed, then work the panel at medium speed in overlapping passes. Wipe the residue with a clean microfiber towel and follow with a finishing polish.',
 '[{"label":"Product Form","value":"High-Viscosity Liquid"},{"label":"Defect Rating","value":"Deep Paint Correction & Heavy Scratch Removal"},{"label":"Recommended Tooling","value":"Dual-Action (DA) or Rotary Buffer"},{"label":"Cut Intensity","value":"10 / 10"},{"label":"Gloss Output","value":"5 / 10"},{"label":"Net Weight","value":"1 KG (1000g)"}]',
 0,'["/placeholder.svg"]',0,false,false,0,0,'Coming Soon',2),

('p3','ak-fine-grade-polishing-compound-1kg','Fine-Grade Polishing Compound (1 KG)','refinement-polish',
 'Secondary refinement paste that erases swirls, holograms, and compounding haze.',
 'A professional secondary refinement paste optimized to permanently eliminate compounding haze, micro-swirls, and light holograms left behind by aggressive cutting steps. Delivers an ultra-smooth, high optical clarity canvas perfectly prepped for protective waxes, sealants, or ceramic coatings. Key features — Hologram & Swirl Eraser: targets and refines away fine compounding tracks and micro-holograms; Optical Clarity Engine: polishes clear coats to a mirror-like definition and smoothness; Zero Dusting: buttery, fine abrasive consistency ensures clean cycles and easy wipe-offs.',
 'Apply a small amount to a medium polishing pad on a dual-action polisher. Work the panel at medium speed in slow, overlapping passes until the finish clears, then buff the residue with a clean microfiber towel.',
 '[{"label":"Product Form","value":"Zero-Dusting Precision Paste"},{"label":"Defect Rating","value":"Light Swirls, Compounding Haze, & Hologram Removal"},{"label":"Recommended Tooling","value":"Dual-Action Polisher with a medium polishing pad"},{"label":"Cut Intensity","value":"4 / 10"},{"label":"Gloss Output","value":"8 / 10"},{"label":"Net Weight","value":"1 KG (1000g)"}]',
 0,'["/placeholder.svg"]',0,false,false,0,0,'Coming Soon',3),

('p4','ak-apex-2in1-finish-compound-1kg','Apex 2-in-1 Finish Compound (1 KG)','refinement-polish',
 'One-step diminishing compound that cuts like a polish and finishes to a mirror shine.',
 'The ultimate time-saving detailing product. Formulated with intelligent diminishing micro-abrasive technology, this smart one-step compound executes an initial medium cut to level surface defects, then breaks down into an ultra-fine polish to finish to a glossy, swirl-free shine in a single pass. Key features — One-Step Efficiency: consolidates cutting and finishing into one step to drastically reduce project times; Diminishing Smart Abrasives: micro-crystals morph under working friction, starting tough to cut and finishing soft to polish; Rich Color Depth: infuses paint layers with excellent color richness, brilliance, and clarity.',
 'Apply to a polishing pad on a high-stroke dual-action polisher. Spread at low speed, then work the panel at medium speed until the abrasives break down and the finish glosses up. Wipe the residue with a clean microfiber towel.',
 '[{"label":"Product Form","value":"Medium-to-Fine Diminishing Paste"},{"label":"Defect Rating","value":"Medium Defect Correction + High-Gloss Finishing Simultaneously"},{"label":"Recommended Tooling","value":"High-Stroke Dual-Action (DA) Polisher"},{"label":"Cut Intensity","value":"6 / 10"},{"label":"Gloss Output","value":"8.5 / 10"},{"label":"Net Weight","value":"1 KG (1000g)"}]',
 0,'["/placeholder.svg"]',0,false,false,0,0,'Coming Soon',4),

('p5','ak-ultimate-car-polish-1kg','Ultimate Car Polish (1 KG)','refinement-polish',
 'Final-stage glaze that unleashes wet-look depth and lays down a hydrophobic shield.',
 'A premium liquid final-stage polish engineered to unleash maximum paint brilliance and build an ultra-reflective wet-look mirror depth. As it polishes, it lays down a highly durable synthetic hydrophobic barrier that shields the paintwork from harsh road grime and moisture. Key features — Deep Mirror Reflection: intensifies paint color depth for an elite, high-gloss showroom finish; Hydrophobic Shielding: leaves behind a built-in protective layer that repels water and prevents debris bonding; Effortless Application: forgiving, easy-on easy-off formula built for machine or hand application.',
 'Apply a thin, even layer with a finishing orbital polisher or a foam hand applicator. Work it into the paint, allow it to haze, then buff off with a clean microfiber towel for a deep, protected gloss.',
 '[{"label":"Product Form","value":"Ultra-Reflective Liquid Glaze & Polish"},{"label":"Defect Rating","value":"Final Stage Paint Refinement & Protection"},{"label":"Recommended Tooling","value":"Finishing Orbital Polisher or Manual Hand Applicator"},{"label":"Cut Intensity","value":"1 / 10"},{"label":"Gloss Output","value":"10 / 10"},{"label":"Net Weight","value":"1 KG (1000g)"}]',
 0,'["/placeholder.svg"]',0,false,false,0,0,'Coming Soon',5),

('p6','ak-flex-dori-thick-rubber-sealant-1kg','Flex-Dori Thick Rubber Adhesive Sealant (1 KG)','automotive-utility',
 'Heavy-duty rubberized sealant for waterproof bonding, seam sealing, and vibration damping.',
 'A heavy-duty, high-viscosity rubberized sealant engineered specifically for automotive panel bonding, seam sealing, weatherproofing, and vibration-dampening insulation. Formulated to remain fully flexible over time, it expands and contracts naturally with vehicle movement to prevent cracking. Key features — High-Density Elastic Seal: thicker-bodied compound that easily fills substantial gaps without sagging; Vibration Dampening: absorbs mechanical hums and joint stress as an exceptional structural noise insulator; Industrial Weatherproofing: superior waterproof barrier built to stand up to harsh chemicals, heat, and moisture.',
 'Ensure surfaces are clean and dry. Apply with a putty knife, caulking tool, or spatula, working the paste into gaps and seams. Smooth the bead and allow it to cure fully before exposure to water or movement.',
 '[{"label":"Product Form","value":"High-Density Industrial Black Rubber Paste"},{"label":"Primary Application","value":"Panel Sealing, Seam Waterproofing, & Vibration Reduction"},{"label":"Recommended Tooling","value":"Putty Knife, Caulking Tool, or Heavy Applicator Spatula"},{"label":"Elasticity","value":"High Permanent Flexibility"},{"label":"Net Weight","value":"1 KG (1000g)"}]',
 0,'["/placeholder.svg"]',0,false,false,0,0,'Coming Soon',6);

-- ── Variants: a single 1 KG pack per product ─────────────────────────────────

insert into product_variants (product_id, label, price, sku, sort_order) values
('p1','1 KG',0,'PROCUT-1KG',0),
('p2','1 KG',0,'HYPERCUT-1KG',0),
('p3','1 KG',0,'FINEGRADE-1KG',0),
('p4','1 KG',0,'APEX-1KG',0),
('p5','1 KG',0,'ULTPOLISH-1KG',0),
('p6','1 KG',0,'FLEXDORI-1KG',0);
