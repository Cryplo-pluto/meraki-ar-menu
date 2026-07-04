
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin','staff');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.tg_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- SIZE CLASSES (AR reference models)
CREATE TABLE public.size_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  reference_glb_url text NOT NULL,
  reference_usdz_url text,
  dimensions_label text NOT NULL,
  width_cm numeric,
  depth_cm numeric,
  height_cm numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.size_classes TO anon, authenticated;
GRANT ALL ON public.size_classes TO service_role;
ALTER TABLE public.size_classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "size classes public read" ON public.size_classes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "size classes admin write" ON public.size_classes FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- BRANCHES
CREATE TABLE public.branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  address text NOT NULL,
  phone text NOT NULL,
  lat numeric,
  lng numeric,
  hours jsonb NOT NULL DEFAULT '{"mon":"07:00-21:00","tue":"07:00-21:00","wed":"07:00-21:00","thu":"07:00-21:00","fri":"07:00-21:00","sat":"07:00-21:00","sun":"07:00-21:00"}'::jsonb,
  map_embed text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.branches TO anon, authenticated;
GRANT ALL ON public.branches TO service_role;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "branches public read" ON public.branches FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "branches admin write" ON public.branches FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER branches_touch BEFORE UPDATE ON public.branches FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- MENU ITEMS (includes cakes with category = 'cakes')
CREATE TABLE public.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL,
  description text NOT NULL DEFAULT '',
  price_kwacha integer NOT NULL DEFAULT 0,
  image_url text NOT NULL DEFAULT '',
  image_alt text NOT NULL DEFAULT '',
  allergens text[] NOT NULL DEFAULT '{}',
  size_class_id uuid REFERENCES public.size_classes(id),
  dimensions_label text NOT NULL DEFAULT '',
  width_cm numeric, depth_cm numeric, height_cm numeric,
  glb_url text,
  usdz_url text,
  available_branches text[] NOT NULL DEFAULT '{}',
  is_available boolean NOT NULL DEFAULT true,
  is_signature boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX menu_items_category_idx ON public.menu_items(category);
GRANT SELECT ON public.menu_items TO anon, authenticated;
GRANT ALL ON public.menu_items TO service_role;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "menu items public read" ON public.menu_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "menu items admin write" ON public.menu_items FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER menu_items_touch BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- CAKE BUILDER OPTIONS
CREATE TABLE public.cake_builder_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step text NOT NULL,
  name text NOT NULL,
  price_modifier integer NOT NULL DEFAULT 0,
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cake_builder_options TO anon, authenticated;
GRANT ALL ON public.cake_builder_options TO service_role;
ALTER TABLE public.cake_builder_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cake opts public read" ON public.cake_builder_options FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "cake opts admin write" ON public.cake_builder_options FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ORDERS
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE DEFAULT ('MK-' || to_char(now(),'YYMMDD') || '-' || substring(gen_random_uuid()::text,1,6)),
  branch_slug text NOT NULL,
  channel text NOT NULL DEFAULT 'website',
  fulfillment text NOT NULL DEFAULT 'pickup',
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  delivery_address text,
  notes text,
  subtotal_kwacha integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'received',
  payment_method text,
  payment_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.orders TO anon, authenticated;
GRANT SELECT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders guest insert" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "orders staff read" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "orders staff update" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'admin')) WITH CHECK (true);
CREATE TRIGGER orders_touch BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_slug text NOT NULL,
  name text NOT NULL,
  quantity int NOT NULL DEFAULT 1,
  unit_price_kwacha integer NOT NULL,
  notes text
);
GRANT INSERT ON public.order_items TO anon, authenticated;
GRANT SELECT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order items guest insert" ON public.order_items FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "order items staff read" ON public.order_items FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'admin'));

-- SITE SETTINGS (socials, hero copy, etc.)
CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings public read" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "settings admin write" ON public.site_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
