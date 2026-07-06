-- ============================================================
-- REMOVE LOVABLE AGENCY CREDIT — the footer's "Concept build by Studio
-- Meraki Digital" line linked to lovable.dev. This project no longer
-- carries any Lovable branding, so the credit is cleared (the Footer
-- component already hides the line entirely when agency_credit is null).
-- ============================================================

UPDATE public.site_settings SET value = 'null'::jsonb, updated_at = now()
  WHERE key = 'agency_credit';
