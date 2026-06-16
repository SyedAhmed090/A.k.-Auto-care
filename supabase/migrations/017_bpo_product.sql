-- Add Benzoyl Peroxide (BPO) Hardener Paste product (homepage hero).
-- Price is a Rs 1,000 placeholder to be updated later. Image is a placeholder.

insert into products
  (id, slug, name, category_slug, tagline, description, how_to_use, specs, price, images, stock, in_stock, featured, rating, reviews, badge, sort_order, created_at)
values
('p15','bpo-hardener-paste','Benzoyl Peroxide (BPO) Hardener Paste','polishes-compounds',
 'Industrial Curing Agent & Catalyst',
 'Our Benzoyl Peroxide (BPO) Hardener Paste is a premium-grade, highly stable catalyst specifically formulated to initiate the rapid curing of unsaturated polyester resins. Primarily utilized in the automotive refinish, marine, and composite industries, this paste ensures an even, controlled reaction that transforms liquid gels and putties into a durable, sandable, and highly stable solid structure.',
 'Mix approximately 2–3% hardener paste by weight into the polyester resin, filler, or putty. Blend thoroughly until the colour is fully uniform with no streaks — even colour confirms a complete mix. Apply within the working time, then allow to cure before sanding. Store sealed in a cool, dry place away from direct sunlight.',
 '[{"label":"Reactivity","value":"Optimized — predictable, controllable cure with minimal shrinkage"},{"label":"Dispersion","value":"Excellent — smooth, homogeneous paste blends without streaking"},{"label":"Mix indicator","value":"High-visibility colour-coded pigment for uniform-mix confirmation"},{"label":"Heat stability","value":"Enhanced — resists separation during transport and long-term storage"}]',
 1000,'["https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80"]',
 100,true,false,0,0,'New',15,'2026-06-16')
on conflict (id) do nothing;
