
-- 1) Move has_role to a private schema not exposed via Data API
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Rewrite policies that reference public.has_role to use private.has_role
-- branches
DROP POLICY IF EXISTS "branches admin write" ON public.branches;
CREATE POLICY "branches admin write" ON public.branches FOR ALL
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

-- cake_builder_options
DROP POLICY IF EXISTS "cake opts admin write" ON public.cake_builder_options;
CREATE POLICY "cake opts admin write" ON public.cake_builder_options FOR ALL
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

-- menu_items
DROP POLICY IF EXISTS "menu items admin write" ON public.menu_items;
CREATE POLICY "menu items admin write" ON public.menu_items FOR ALL
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

-- size_classes
DROP POLICY IF EXISTS "size classes admin write" ON public.size_classes;
CREATE POLICY "size classes admin write" ON public.size_classes FOR ALL
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

-- site_settings
DROP POLICY IF EXISTS "settings admin write" ON public.site_settings;
CREATE POLICY "settings admin write" ON public.site_settings FOR ALL
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

-- user_roles
DROP POLICY IF EXISTS "user_roles admin delete" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles admin insert" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles admin update" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles admin read all" ON public.user_roles;
CREATE POLICY "user_roles admin delete" ON public.user_roles FOR DELETE
  USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "user_roles admin insert" ON public.user_roles FOR INSERT
  WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "user_roles admin update" ON public.user_roles FOR UPDATE
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "user_roles admin read all" ON public.user_roles FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

-- orders staff read/update
DROP POLICY IF EXISTS "orders staff read" ON public.orders;
CREATE POLICY "orders staff read" ON public.orders FOR SELECT
  USING (private.has_role(auth.uid(), 'staff') OR private.has_role(auth.uid(), 'admin'));

-- 2) Fix RLS_ALWAYS_TRUE: orders staff update WITH CHECK true
DROP POLICY IF EXISTS "orders staff update" ON public.orders;
CREATE POLICY "orders staff update" ON public.orders FOR UPDATE
  USING (private.has_role(auth.uid(), 'staff') OR private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'staff') OR private.has_role(auth.uid(), 'admin'));

-- order_items staff read
DROP POLICY IF EXISTS "order items staff read" ON public.order_items;
CREATE POLICY "order items staff read" ON public.order_items FOR SELECT
  USING (private.has_role(auth.uid(), 'staff') OR private.has_role(auth.uid(), 'admin'));

-- Drop the old public.has_role function now that policies no longer reference it
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

-- 3) Tighten guest orders insert: length caps, email format, phone length
DROP POLICY IF EXISTS "orders guest insert" ON public.orders;
CREATE POLICY "orders guest insert" ON public.orders FOR INSERT
  WITH CHECK (
    status = 'pending'
    AND payment_status = 'pending'
    AND subtotal_kwacha >= 0
    AND subtotal_kwacha <= 1000000
    AND length(btrim(customer_name)) BETWEEN 1 AND 120
    AND length(btrim(customer_phone)) BETWEEN 6 AND 20
    AND (customer_email IS NULL OR (
      length(customer_email) <= 254
      AND customer_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    ))
    AND (notes IS NULL OR length(notes) <= 1000)
    AND (delivery_address IS NULL OR length(delivery_address) <= 500)
    AND length(btrim(branch_slug)) BETWEEN 1 AND 80
  );

-- 4) order_items guest insert: require parent order to be freshly created & pending
DROP POLICY IF EXISTS "order items guest insert" ON public.order_items;
CREATE POLICY "order items guest insert" ON public.order_items FOR INSERT
  WITH CHECK (
    quantity > 0 AND quantity <= 100
    AND unit_price_kwacha >= 0 AND unit_price_kwacha <= 1000000
    AND length(btrim(name)) BETWEEN 1 AND 200
    AND length(btrim(menu_item_slug)) BETWEEN 1 AND 120
    AND (notes IS NULL OR length(notes) <= 500)
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND o.status = 'pending'
        AND o.payment_status = 'pending'
        AND o.created_at > now() - interval '60 seconds'
    )
  );
