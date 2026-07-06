-- ============================================================
-- PIXEL-FIDELITY CORRECTIONS — 5 July 2026
-- Source: live meraki.co.zm HTML/CSS fetched and cross-checked directly
-- this session (restaurant.css :root, homepage/about/cakes markup).
-- Corrects two things seeded incorrectly in the prior demo-mode pass:
--   1) site_settings.story_md held homepage "Since 2008" copy where the
--      About page's real, distinct story (founded 2014) belongs instead.
--   2) brand_palette held approximated hex values, not the real ones.
-- Also adds the 3 real "Pre designed cake" products from the real /cakes
-- page (previously we only had fabricated demo cake-slice items).
-- Uses DO UPDATE (not DO NOTHING) because the prior migration already
-- seeded the wrong values into the live database.
-- ============================================================

INSERT INTO public.site_settings (key, value) VALUES
  ('story_md', '"Meraki is a wholly Zambian brand that is creating a love mark with local consumers. The business was founded in 2014 by Chomba Mwansa, a former banker who dared to pursue her passion for food by starting a small business out of her home kitchen. The brand has since blossomed into three upmarket restaurants, a pioneering confectionery business and a food processing factory from which a wide range of convenience foods are distributed to major supermarkets countrywide. These include over 20 various packaged products that range from dry ready to bake cake pre-mixes, frozen desserts and pastries. The business is now venturing into other lines of fresh food value addition and possibly exports. The business currently employs 94 staff, all based in Lusaka, Zambia."'::jsonb),
  ('vision', '"To become the best loved food products and services provider in Zambia and the region."'::jsonb),
  ('mission', '"To create happiness through the creation of food products and services where every stage of the customer''s experience is packed with quality and excellence."'::jsonb),
  ('values', '"Innovation, Excellence, Quality, Growth, and Caring for each other and our community."'::jsonb),
  ('products_services_md', '"We offer a wide range of handcrafted quality cakes and pastries. Our services include catering for events, takeaway, and dine-in options. From everyday treats to special occasions, we cater to all your culinary needs with excellence and care."'::jsonb),
  ('hero_image_url', '"https://res.cloudinary.com/davidharven/image/upload/v1735744139/meraki/jkh5lsf2syrm4wspxfjn.jpg"'::jsonb),
  ('brand_palette', '{"source":"sampled directly from meraki.co.zm restaurant.css :root, 2026-07-05","confirmed":true,"mint":"#89CCB4","cream":"#f9f6f3","paper":"#FFFFFF","charcoal":"#383632","black":"#282725","medium_gray":"#8d8987","red":"#d51f0f","yellow":"#ECBA23","green":"#46b57e"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- Real "Pre designed cake" products (verbatim copy from the live /cakes page,
-- including its own rough phrasing — this is a fidelity clone, not a rewrite).
-- Negative sort_order so they lead the cakes grid ahead of the existing
-- demo cake-slice catalog.
INSERT INTO public.menu_items (
  slug, name, category, description, price_kwacha, image_url, image_alt,
  size_class_id, dimensions_label, glb_url, available_branches, is_signature, sort_order
)
SELECT
  v.slug, v.name, v.category, v.description, v.price_kwacha, v.image_url, v.image_alt,
  (SELECT id FROM public.size_classes WHERE name = 'cake-8inch'),
  'Whole cake — ask in store for size options',
  'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/Duck/glTF-Binary/Duck.glb',
  ARRAY['rhodespark','eastpark','kabulonga'], true, v.sort_order
FROM (VALUES
  ('birthday-cakes', 'Birthday Cakes', 'cakes', 'Wish your loved on a happy birthday in grand style', 1500,
    'https://res.cloudinary.com/davidharven/image/upload/v1735821004/IMG_9477_8abb01d59c.jpg',
    'Decorated Meraki celebration birthday cake', -3),
  ('featured-delicious', 'Delicious', 'cakes', 'This Cake is nice', 2300,
    'https://res.cloudinary.com/davidharven/image/upload/v1735826510/th_03d1fd2300.jpg',
    'Featured Meraki celebration cake', -2),
  ('valentine-cakes', 'Valentine Cakes', 'cakes', 'For the sake of love', 3400,
    'https://res.cloudinary.com/davidharven/image/upload/v1736771463/IMG_9477_1a72c485f5.jpg',
    'Meraki Valentine''s celebration cake', -1)
) AS v(slug, name, category, description, price_kwacha, image_url, image_alt, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.menu_items WHERE slug = v.slug);
