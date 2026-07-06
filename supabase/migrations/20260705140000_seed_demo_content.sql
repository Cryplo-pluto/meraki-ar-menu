
-- Seed content for the demo build. Captures data that currently exists only
-- in the live database (added directly, outside migrations) so a fresh
-- environment reproduces the same demo state. Guarded per-table so this is a
-- no-op anywhere the table is already populated.

-- SIZE CLASSES
INSERT INTO public.size_classes (name, reference_glb_url, dimensions_label, width_cm, depth_cm, height_cm)
SELECT * FROM (VALUES
  ('plate-regular',   'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/Duck/glTF-Binary/Duck.glb', 'Served on a 26cm plate',        26::numeric, 26::numeric, 6::numeric),
  ('bowl-regular',    'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/Duck/glTF-Binary/Duck.glb', '18cm bowl — a proper meal',     18, 18, 8),
  ('burger-standard', 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/Duck/glTF-Binary/Duck.glb', '11cm across, stacked high',     11, 11, 10),
  ('glass-tall',      'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/Duck/glTF-Binary/Duck.glb', 'Tall 400ml glass',              8,  8,  16),
  ('cake-8inch',      'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/Duck/glTF-Binary/Duck.glb', '20cm round — serves 10–12',     20, 20, 10),
  ('cake-6inch',      'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/Duck/glTF-Binary/Duck.glb', '15cm round — serves 6–8',       15, 15, 10)
) AS v(name, reference_glb_url, dimensions_label, width_cm, depth_cm, height_cm)
WHERE NOT EXISTS (SELECT 1 FROM public.size_classes);

-- BRANCHES
INSERT INTO public.branches (slug, name, address, phone, lat, lng, sort_order)
SELECT * FROM (VALUES
  ('rhodespark', 'Meraki Rhodespark', 'Rhodes Park, Lusaka',                     '+260 97 8063799', -15.4033::numeric, 28.3105::numeric, 1),
  ('eastpark',   'Meraki Eastpark',   'East Park Mall, Great East Road, Lusaka', '+260 97 5948210', -15.3928, 28.3272, 2),
  ('kabulonga',  'Meraki Kabulonga',  'Kabulonga Road, Lusaka',                  '+260 76 4170860', -15.4293, 28.3269, 3)
) AS v(slug, name, address, phone, lat, lng, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.branches);

-- CAKE BUILDER OPTIONS
INSERT INTO public.cake_builder_options (step, name, price_modifier, sort_order)
SELECT * FROM (VALUES
  ('sponge', 'Vanilla', 0, 1),
  ('sponge', 'Chocolate', 0, 2),
  ('sponge', 'Red velvet', 50, 3),
  ('sponge', 'Carrot & walnut', 50, 4),
  ('sponge', 'Lemon', 30, 5),
  ('filling', 'Vanilla buttercream', 0, 1),
  ('filling', 'Chocolate ganache', 40, 2),
  ('filling', 'Cream cheese frosting', 40, 3),
  ('filling', 'Whipped cream & berries', 60, 4),
  ('filling', 'Salted caramel', 60, 5),
  ('finish', 'Smooth buttercream', 0, 1),
  ('finish', 'Chocolate drip', 50, 2),
  ('finish', 'Fresh fruit & flowers', 80, 3),
  ('finish', 'Sprinkles & candles', 30, 4),
  ('size', '6-inch round (serves 6–8)', 0, 1),
  ('size', '8-inch round (serves 10–12)', 150, 2),
  ('size', '10-inch round (serves 16–20)', 350, 3),
  ('size', '2-tier (serves 30+)', 700, 4)
) AS v(step, name, price_modifier, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.cake_builder_options);

-- SAMPLE REVIEWS
INSERT INTO public.reviews (author_first_name, body, rating, branch_slug, status, is_sample, sort_order)
SELECT * FROM (VALUES
  ('Chola', 'Cakes are always fresh and the coffee at Rhodespark is the best morning in Lusaka. Staff know my order by heart.', 5, 'rhodespark', 'approved', true, 1),
  ('Natasha', 'Booked a birthday cake through the site and it turned out exactly like the reference photo. Everyone at the party asked where it was from.', 5, 'kabulonga', 'approved', true, 2),
  ('Kunda', 'Went for the full breakfast on a Sunday and stayed three hours. Menu has grown a lot — the poke bowl is a new favourite.', 5, 'eastpark', 'approved', true, 3)
) AS v(author_first_name, body, rating, branch_slug, status, is_sample, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.reviews);

-- SITE SETTINGS
INSERT INTO public.site_settings (key, value) VALUES
  ('socials', '{"website":"https://www.meraki.co.zm/","facebook":"https://web.facebook.com/merakicafezm","instagram":"https://www.instagram.com/merakicentrolimited"}'::jsonb),
  ('story_md', '"Meraki is a homemade cafe and cakery, serving Lusaka since 2008 from three branches: Rhodespark, Eastpark and Kabulonga. We cook homemade food, bake cakes, and pour coffee — and every dish on this site can be viewed at true real-world size in AR."'::jsonb),
  ('confirmed_hours', '{}'::jsonb),
  ('hero_image_url', '"https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1920&q=80"'::jsonb),
  ('cakes_teaser_image_url', '"https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=1200&q=80"'::jsonb),
  ('builder_teaser_image_url', '"https://images.unsplash.com/photo-1557979619-445218f326b9?w=1200&q=80"'::jsonb),
  ('agency_credit', '{"url":"https://lovable.dev","label":"Concept build by Studio Meraki Digital"}'::jsonb),
  ('brand_palette', '{"mint":"#86CBB9","cream":"#F1F2E3","paper":"#FFFFFF","source":"sampled from printed menu scans 2026-07-04","charcoal":"#383832","confirmed":false,"mint_tint":"#E5F2E8"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- MENU ITEMS
INSERT INTO public.menu_items (
  slug, name, category, description, price_kwacha, image_url, image_alt, allergens,
  size_class_id, dimensions_label, glb_url, available_branches, is_signature, is_hero, sort_order
)
SELECT
  v.slug, v.name, v.category, v.description, v.price_kwacha, v.image_url, v.image_alt, v.allergens,
  (SELECT id FROM public.size_classes WHERE name = v.size_class_name),
  v.dimensions_label,
  'https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/Duck/glTF-Binary/Duck.glb',
  v.available_branches, v.is_signature, v.is_hero, v.sort_order
FROM (VALUES
  ('meraki-full-breakfast', 'Meraki Full Breakfast', 'all-day-breakfast', 'Two farm eggs any style, streaky bacon, pork sausage, grilled tomato, sautéed mushrooms and buttered sourdough. The one people drive across town for.', 185, 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=1200&q=80', 'A full breakfast plate with eggs, bacon, sausage, tomato and toast', ARRAY['gluten','egg','pork'], 'plate-regular', '26cm plate — plenty for one hungry morning', ARRAY['rhodespark','eastpark','kabulonga'], true, false, 1),
  ('french-toast-berries', 'French Toast & Berries', 'all-day-breakfast', 'Thick-cut brioche soaked in vanilla custard, pan-fried golden, topped with mascarpone, seasonal berries and warm maple syrup.', 145, 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=1200&q=80', 'French toast dusted with icing sugar, topped with berries', ARRAY['gluten','egg','dairy'], 'plate-regular', '26cm plate — sweet start or brunch treat', ARRAY['rhodespark','eastpark','kabulonga'], false, true, 2),
  ('shakshuka', 'Shakshuka', 'all-day-breakfast', 'Two eggs baked in a spiced tomato and pepper sugo with feta and fresh coriander, served with warm flatbread.', 130, 'https://images.unsplash.com/photo-1590412200988-a436970781fa?w=1200&q=80', 'Cast-iron pan of shakshuka with baked eggs and herbs', ARRAY['egg','dairy','gluten'], 'bowl-regular', '18cm skillet — shareable or hearty solo', ARRAY['rhodespark','kabulonga'], false, false, 3),
  ('avocado-smash', 'Avocado Smash on Sourdough', 'all-day-breakfast', 'Ripe avocado on toasted sourdough with chilli flakes, lemon, feta and a poached egg on top.', 120, 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=1200&q=80', 'Toast topped with mashed avocado and a poached egg', ARRAY['gluten','egg','dairy'], 'plate-regular', '26cm plate — light but filling', ARRAY['rhodespark','eastpark','kabulonga'], true, false, 4),

  ('grain-power-bowl', 'Grain Power Bowl', 'bowls', 'Brown rice and quinoa, roasted sweet potato, chickpeas, avocado, pickled cabbage, seeds and a lemon-tahini dressing.', 140, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=80', 'Grain bowl with roasted vegetables, avocado and seeds', ARRAY['sesame'], 'bowl-regular', '18cm bowl — a proper meal', ARRAY['rhodespark','eastpark','kabulonga'], true, false, 1),
  ('peri-chicken-bowl', 'Peri Chicken Bowl', 'bowls', 'Grilled peri-peri chicken thigh, rice, charred corn, black beans, avocado, tomato salsa and coriander crema.', 155, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=80', 'Bowl of rice topped with grilled chicken and vegetables', ARRAY['dairy'], 'bowl-regular', '18cm bowl', ARRAY['rhodespark','eastpark','kabulonga'], false, false, 2),
  ('salmon-poke', 'Salmon Poke Bowl', 'bowls', 'Cured salmon over sushi rice with edamame, cucumber, avocado, pickled ginger and a soy-sesame dressing.', 195, 'https://images.unsplash.com/photo-1563379091339-03246963d51a?w=1200&q=80', 'Poke bowl with salmon, avocado and rice', ARRAY['fish','soy','sesame'], 'bowl-regular', '18cm bowl', ARRAY['kabulonga'], false, false, 3),
  ('mediterranean-bowl', 'Mediterranean Bowl', 'bowls', 'Falafel, hummus, tabbouleh, cucumber, tomato, olives, feta and warm flatbread.', 140, 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&q=80', 'Mediterranean bowl with falafel, hummus and salad', ARRAY['gluten','dairy','sesame'], 'bowl-regular', '18cm bowl', ARRAY['rhodespark','eastpark'], false, false, 4),

  ('meraki-classic-burger', 'Meraki Classic Burger', 'burgers', '200g Zambian beef patty, aged cheddar, caramelised onion, gem lettuce, tomato and our house sauce in a toasted brioche bun. Comes with skin-on fries.', 175, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=80', 'Beef burger with melted cheese and lettuce on a brioche bun', ARRAY['gluten','dairy','egg'], 'burger-standard', '11cm stack — proper two-hand burger', ARRAY['rhodespark','eastpark','kabulonga'], true, true, 1),
  ('chicken-crunch-burger', 'Chicken Crunch Burger', 'burgers', 'Buttermilk-fried chicken thigh, slaw, pickles and smoked chilli mayo in a milk bun. Comes with fries.', 160, 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=1200&q=80', 'Crispy fried chicken burger with pickles and slaw', ARRAY['gluten','dairy','egg'], 'burger-standard', '11cm stack', ARRAY['rhodespark','eastpark','kabulonga'], false, true, 2),
  ('halloumi-burger', 'Halloumi & Roast Pepper Burger', 'burgers', 'Grilled halloumi, roasted red pepper, rocket and basil pesto in a milk bun. Vegetarian, comes with fries.', 155, 'https://images.unsplash.com/photo-1550317138-10000687a72b?w=1200&q=80', 'Vegetarian burger with halloumi and roasted peppers', ARRAY['gluten','dairy'], 'burger-standard', '11cm stack', ARRAY['rhodespark','kabulonga'], false, false, 3),
  ('double-smash', 'Double Smash', 'burgers', 'Two thin-smashed beef patties, American cheese, pickles, onions and our smash sauce. Diner-style, unapologetic.', 195, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=1200&q=80', 'Double smash burger with melted American cheese', ARRAY['gluten','dairy','egg'], 'burger-standard', '11cm stack, double patty', ARRAY['eastpark'], false, false, 4),

  ('black-forest', 'Black Forest', 'cakes', 'Layers of dark chocolate sponge soaked in cherry syrup, filled with whipped cream and cherries, finished with chocolate shavings. Serves 10–12. A favourite for birthdays and just-because Fridays. Order by 12:00 for next-day collection, or choose delivery at checkout.', 650, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&q=80', 'Whole black forest cake with cherries and cream', ARRAY['gluten','dairy','egg'], 'cake-8inch', '20cm round — serves 10–12', ARRAY['rhodespark','eastpark','kabulonga'], true, true, 1),
  ('red-velvet', 'Red Velvet', 'cakes', 'Buttermilk red velvet sponge with cream cheese frosting and a soft crumb. Serves 10–12. Order by 12:00 for next-day collection.', 680, 'https://images.unsplash.com/photo-1586788680434-30d324ee2991?w=1200&q=80', 'Red velvet cake with cream cheese frosting', ARRAY['gluten','dairy','egg'], 'cake-8inch', '20cm round — serves 10–12', ARRAY['rhodespark','eastpark','kabulonga'], true, false, 2),
  ('carrot-walnut-cake', 'Carrot & Walnut', 'cakes', 'Spiced carrot sponge with walnuts and cream cheese frosting. Serves 10–12. Order by 12:00 for next-day collection.', 620, 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=1200&q=80', 'Carrot cake with walnut decoration', ARRAY['gluten','dairy','egg','nuts'], 'cake-8inch', '20cm round — serves 10–12', ARRAY['rhodespark','eastpark','kabulonga'], false, false, 3),
  ('lemon-drizzle-cake', 'Lemon Drizzle', 'cakes', 'Zesty lemon sponge soaked in lemon syrup and finished with a crackly lemon glaze. Serves 8–10. Order by 12:00 for next-day collection.', 560, 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=1200&q=80', 'Lemon drizzle cake with icing on top', ARRAY['gluten','dairy','egg'], 'cake-6inch', '15cm round — serves 6–8', ARRAY['rhodespark','eastpark','kabulonga'], false, false, 4),
  ('chocolate-fudge-cake', 'Chocolate Fudge', 'cakes', 'Rich chocolate sponge with dark chocolate ganache and fudge frosting. Serves 10–12. Order by 12:00 for next-day collection.', 700, 'https://images.unsplash.com/photo-1578775887804-699de7086ff9?w=1200&q=80', 'Chocolate fudge cake with glossy ganache', ARRAY['gluten','dairy','egg'], 'cake-8inch', '20cm round — serves 10–12', ARRAY['rhodespark','eastpark','kabulonga'], true, false, 5),
  ('vanilla-birthday-cake', 'Vanilla Birthday', 'cakes', 'Vanilla sponge with vanilla buttercream and rainbow sprinkles. Serves 10–12. Order by 12:00 for next-day collection.', 600, 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=1200&q=80', 'Birthday cake with buttercream and sprinkles', ARRAY['gluten','dairy','egg'], 'cake-8inch', '20cm round — serves 10–12', ARRAY['rhodespark','eastpark','kabulonga'], false, false, 6),
  ('tres-leches', 'Tres Leches', 'cakes', 'Vanilla sponge soaked in three milks, topped with whipped cream and cinnamon. Serves 8–10. Order by 12:00 for next-day collection.', 640, 'https://images.unsplash.com/photo-1587248720327-8eb72564be1e?w=1200&q=80', 'Tres leches cake with cream and cinnamon', ARRAY['gluten','dairy','egg'], 'cake-6inch', '15cm round — serves 6–8', ARRAY['rhodespark','kabulonga'], false, false, 7),
  ('white-forest', 'White Forest', 'cakes', 'Vanilla sponge with white chocolate ganache, whipped cream and cherries. Serves 10–12. Order by 12:00 for next-day collection.', 680, 'https://images.unsplash.com/photo-1557979619-445218f326b9?w=1200&q=80', 'White forest cake with white chocolate curls', ARRAY['gluten','dairy','egg'], 'cake-8inch', '20cm round — serves 10–12', ARRAY['rhodespark','eastpark','kabulonga'], false, false, 8),

  ('flat-white', 'Flat White', 'coffee', 'Double shot of our house espresso with silky steamed milk. Local beans, roasted small-batch.', 35, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&q=80', 'Flat white with latte art in a white cup', ARRAY['dairy'], 'glass-tall', '180ml cup', ARRAY['rhodespark','eastpark','kabulonga'], true, true, 1),
  ('iced-latte', 'Iced Latte', 'coffee', 'Cold double shot over milk and ice. Simple, honest, cold.', 40, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=1200&q=80', 'Iced latte in a tall glass with layers of milk and coffee', ARRAY['dairy'], 'glass-tall', '400ml tall glass', ARRAY['rhodespark','eastpark','kabulonga'], false, false, 2),
  ('rooibos-latte', 'Rooibos Latte', 'coffee', 'Rooibos steeped in steamed milk with a touch of honey. Caffeine-free, cosy.', 40, 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=1200&q=80', 'Warm rooibos latte in a mug', ARRAY['dairy'], 'glass-tall', '250ml mug', ARRAY['rhodespark','kabulonga'], false, false, 3),
  ('fresh-orange', 'Fresh Orange Juice', 'coffee', 'Just oranges, just squeezed. Nothing else.', 55, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=1200&q=80', 'Glass of freshly squeezed orange juice', ARRAY[]::text[], 'glass-tall', '400ml tall glass', ARRAY['rhodespark','eastpark','kabulonga'], false, false, 4),

  ('mango-morning', 'Mango Morning', 'smoothies', 'Mango, banana, orange, ginger and a squeeze of lime. Sunshine in a glass.', 65, 'https://images.unsplash.com/photo-1546173159-315724a31696?w=1200&q=80', 'Tall glass of bright orange mango smoothie', ARRAY[]::text[], 'glass-tall', '400ml tall glass', ARRAY['rhodespark','eastpark','kabulonga'], true, false, 1),
  ('green-glow', 'Green Glow', 'smoothies', 'Spinach, apple, cucumber, pineapple, mint and coconut water.', 70, 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=1200&q=80', 'Green smoothie in a tall glass with a straw', ARRAY[]::text[], 'glass-tall', '400ml tall glass', ARRAY['rhodespark','eastpark','kabulonga'], false, false, 2),
  ('berry-boost', 'Berry Boost', 'smoothies', 'Mixed berries, banana, yoghurt, honey and oats. Breakfast on the go.', 75, 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=1200&q=80', 'Deep purple berry smoothie topped with berries', ARRAY['dairy'], 'glass-tall', '400ml tall glass', ARRAY['rhodespark','eastpark','kabulonga'], false, true, 3),
  ('cocoa-almond', 'Cocoa Almond', 'smoothies', 'Banana, cocoa, almond butter, dates and oat milk. Tastes like a milkshake, does not eat like one.', 80, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=1200&q=80', 'Chocolate almond smoothie in a tall glass', ARRAY['nuts'], 'glass-tall', '400ml tall glass', ARRAY['rhodespark','kabulonga'], false, false, 4),

  ('lemon-poppyseed-loaf', 'Lemon Poppyseed Loaf', 'sweets', 'Buttery loaf cake with lemon curd swirl and a crackly lemon glaze. Sold by the slice.', 45, 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=1200&q=80', 'Slice of lemon poppyseed loaf on a plate', ARRAY['gluten','dairy','egg'], 'plate-regular', 'Slice on a 26cm plate', ARRAY['rhodespark','eastpark','kabulonga'], false, false, 1),
  ('salted-caramel-brownie', 'Salted Caramel Brownie', 'sweets', 'Dense fudgy brownie with a ribbon of salted caramel and Maldon flakes on top.', 55, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=1200&q=80', 'Square salted caramel brownie with a shiny caramel top', ARRAY['gluten','dairy','egg'], 'plate-regular', 'Slice on a 26cm plate', ARRAY['rhodespark','eastpark','kabulonga'], true, false, 2),
  ('scone-jam-cream', 'Scone with Jam & Cream', 'sweets', 'Warm buttermilk scone, house strawberry jam and whipped cream. Order two.', 50, 'https://images.unsplash.com/photo-1587244141471-9f157d9c1e9d?w=1200&q=80', 'Scone split open with jam and cream', ARRAY['gluten','dairy','egg'], 'plate-regular', 'Scone on a 26cm plate', ARRAY['rhodespark','kabulonga'], false, false, 3),
  ('carrot-cake-slice', 'Carrot Cake Slice', 'sweets', 'Spiced carrot and walnut cake with cream cheese frosting.', 60, 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=1200&q=80', 'Slice of carrot cake with cream cheese frosting', ARRAY['gluten','dairy','egg','nuts'], 'plate-regular', 'Slice on a 26cm plate', ARRAY['rhodespark','eastpark','kabulonga'], false, false, 4)
) AS v(slug, name, category, description, price_kwacha, image_url, image_alt, allergens, size_class_name, dimensions_label, available_branches, is_signature, is_hero, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.menu_items);
