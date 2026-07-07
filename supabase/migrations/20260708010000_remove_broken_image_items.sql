-- Remove menu items whose stock photos are permanently broken (404).
--
-- salmon-poke, red-velvet and scone-jam-cream shipped with Unsplash URLs that
-- 404, so they rendered the grey "no image" placeholder. A previous migration
-- (20260706020000_fix_broken_menu_images) tried to repoint them at other stock
-- URLs, but those died too. Rather than keep chasing stock photos, we drop the
-- items entirely — a menu with gaps looks unprofessional in the pitch.
--
-- Safe to hard-delete: nothing references menu_items by foreign key
-- (order_items.menu_item_slug is free text, not an FK constraint).

DELETE FROM public.menu_items
WHERE slug IN ('salmon-poke', 'red-velvet', 'scone-jam-cream');
