-- ============================================================
-- QUOTE REQUESTS — guest-insert form for /quote/request-a-quote
-- (real site's field set: Your Details + Add Product rows).
-- Same hardened guest-insert pattern as contact_messages and
-- catering_requests (length caps, format checks, staff-only read).
-- ============================================================

CREATE TABLE public.quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  company text,
  email text NOT NULL,
  phone text NOT NULL,
  street_address text NOT NULL,
  town_city text NOT NULL,
  products jsonb NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.quote_requests TO anon, authenticated;
GRANT SELECT, UPDATE ON public.quote_requests TO authenticated;
GRANT ALL ON public.quote_requests TO service_role;
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quote requests guest insert" ON public.quote_requests FOR INSERT
  WITH CHECK (
    length(btrim(first_name)) BETWEEN 1 AND 80
    AND length(btrim(last_name)) BETWEEN 1 AND 80
    AND (company IS NULL OR length(btrim(company)) <= 120)
    AND length(email) <= 254 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(btrim(phone)) BETWEEN 6 AND 20
    AND length(btrim(street_address)) BETWEEN 1 AND 200
    AND length(btrim(town_city)) BETWEEN 1 AND 120
    AND jsonb_typeof(products) = 'array'
    AND jsonb_array_length(products) BETWEEN 1 AND 30
  );
CREATE POLICY "quote requests staff read" ON public.quote_requests FOR SELECT
  USING (private.has_role(auth.uid(), 'staff') OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "quote requests staff update" ON public.quote_requests FOR UPDATE
  USING (private.has_role(auth.uid(), 'staff') OR private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'staff') OR private.has_role(auth.uid(), 'admin'));
