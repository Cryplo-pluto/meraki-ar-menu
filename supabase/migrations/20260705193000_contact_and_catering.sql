-- ============================================================
-- CONTACT + CATERING — guest-insert forms for the real /contact and
-- /catering pages (real site's field sets, transcribed live this session).
-- Follows the same hardened guest-insert pattern already used for orders
-- (length caps, format checks, admin-only read via private.has_role).
-- ============================================================

CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contact messages guest insert" ON public.contact_messages FOR INSERT
  WITH CHECK (
    length(btrim(name)) BETWEEN 1 AND 120
    AND length(btrim(message)) BETWEEN 1 AND 2000
    AND (email IS NULL OR (length(email) <= 254 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'))
    AND (phone IS NULL OR length(btrim(phone)) BETWEEN 6 AND 20)
  );
CREATE POLICY "contact messages staff read" ON public.contact_messages FOR SELECT
  USING (private.has_role(auth.uid(), 'staff') OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "contact messages staff update" ON public.contact_messages FOR UPDATE
  USING (private.has_role(auth.uid(), 'staff') OR private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'staff') OR private.has_role(auth.uid(), 'admin'));

CREATE TABLE public.catering_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  event_date date NOT NULL,
  event_type text NOT NULL,
  guests int NOT NULL,
  requirements text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.catering_requests TO anon, authenticated;
GRANT SELECT, UPDATE ON public.catering_requests TO authenticated;
GRANT ALL ON public.catering_requests TO service_role;
ALTER TABLE public.catering_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "catering requests guest insert" ON public.catering_requests FOR INSERT
  WITH CHECK (
    length(btrim(full_name)) BETWEEN 1 AND 120
    AND length(email) <= 254 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(btrim(phone)) BETWEEN 6 AND 20
    AND event_type IN ('Wedding','Corporate Event','Birthday Party','Anniversary','Other')
    AND guests BETWEEN 1 AND 5000
    AND (requirements IS NULL OR length(requirements) <= 2000)
  );
CREATE POLICY "catering requests staff read" ON public.catering_requests FOR SELECT
  USING (private.has_role(auth.uid(), 'staff') OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "catering requests staff update" ON public.catering_requests FOR UPDATE
  USING (private.has_role(auth.uid(), 'staff') OR private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'staff') OR private.has_role(auth.uid(), 'admin'));
