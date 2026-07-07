-- ============================================================
-- ABOUT PAGE CONTENT CORRECTIONS — cross-checked directly against the
-- live meraki.co.zm/about page this session. The prior pixel-fidelity
-- pass (20260705190000) truncated two pieces of real copy:
--   1) vision was missing its second sentence.
--   2) story_md was missing its closing paragraph, and was stored as a
--      single run-on paragraph instead of the real page's four.
-- ============================================================

UPDATE public.site_settings SET value = '"To become the best loved food products and services provider in Zambia and the region. From very humble beginnings, we envision to become a great local success story."'::jsonb, updated_at = now()
  WHERE key = 'vision';

UPDATE public.site_settings SET value = to_jsonb(
$story$Meraki is a wholly Zambian brand that is creating a love mark with local consumers. The business was founded in 2014 by Chomba Mwansa, a former banker who dared to pursue her passion for food by starting a small business out of her home kitchen.

The brand has since blossomed into three upmarket restaurants, a pioneering confectionery business and a food processing factory from which a wide range of convenience foods are distributed to major supermarkets countrywide.

These include over 20 various packaged products that range from dry ready to bake cake pre-mixes, frozen desserts and pastries. The business is now venturing into other lines of fresh food value addition and possibly exports. The business currently employs 94 staff, all based in Lusaka, Zambia.

Some of the things that stand out in our business strategy include re-investing in our core competencies, packaging, location, customer diversification and visibility of our ideals. Our aim is to keep our customers happy by delivering simple, fresh and delicious at every interaction.$story$::text
), updated_at = now()
  WHERE key = 'story_md';
