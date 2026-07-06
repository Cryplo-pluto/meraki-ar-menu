-- ============================================================
-- FIX BROKEN MENU IMAGES — three seeded Unsplash photo IDs now 404
-- (upstream photos removed/renamed since the demo seed was written).
-- Verified working replacements below (HTTP 200, checked this session).
--   - scone-jam-cream: was showing raw alt text instead of a photo.
--   - red-velvet, salmon-poke: also seeded with dead photo IDs.
-- ============================================================

UPDATE public.menu_items SET image_url = 'https://images.unsplash.com/photo-1611337848619-0a468832fcea?w=1200&q=80'
  WHERE slug = 'scone-jam-cream';

UPDATE public.menu_items SET image_url = 'https://plus.unsplash.com/premium_photo-1713920189876-e07a673cd572?w=1200&q=80'
  WHERE slug = 'red-velvet';

UPDATE public.menu_items SET image_url = 'https://plus.unsplash.com/premium_photo-1701113208728-51959e2d8834?w=1200&q=80'
  WHERE slug = 'salmon-poke';
