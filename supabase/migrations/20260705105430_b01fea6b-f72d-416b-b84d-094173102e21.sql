
-- Demo prep: hero flag, sample reviews, agency credit setting.

ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS is_hero boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS menu_items_is_hero_idx ON public.menu_items (is_hero) WHERE is_hero;

-- Sample reviews (approved, flagged as sample content for admin awareness).
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_first_name text NOT NULL,
  body text NOT NULL,
  rating smallint NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  branch_slug text,
  status text NOT NULL DEFAULT 'approved',
  is_sample boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT ALL ON public.reviews TO service_role;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews public read approved" ON public.reviews;
CREATE POLICY "reviews public read approved" ON public.reviews
  FOR SELECT TO anon, authenticated
  USING (status = 'approved');

DROP POLICY IF EXISTS "reviews admin write" ON public.reviews;
CREATE POLICY "reviews admin write" ON public.reviews
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS reviews_touch ON public.reviews;
CREATE TRIGGER reviews_touch BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();
