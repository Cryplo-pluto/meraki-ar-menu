
-- 1) Lock down has_role EXECUTE
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 2) Replace always-true guest insert policies with sanity checks
DROP POLICY IF EXISTS "orders guest insert" ON public.orders;
CREATE POLICY "orders guest insert"
  ON public.orders
  FOR INSERT
  WITH CHECK (
    length(btrim(customer_name)) > 0
    AND length(btrim(customer_phone)) > 0
    AND subtotal_kwacha >= 0
    AND status = 'pending'
    AND payment_status = 'pending'
  );

DROP POLICY IF EXISTS "order items guest insert" ON public.order_items;
CREATE POLICY "order items guest insert"
  ON public.order_items
  FOR INSERT
  WITH CHECK (
    quantity > 0
    AND unit_price_kwacha >= 0
    AND length(btrim(name)) > 0
    AND length(btrim(menu_item_slug)) > 0
  );

-- 3) Admin management policies on user_roles
CREATE POLICY "user_roles admin insert"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "user_roles admin update"
  ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "user_roles admin delete"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "user_roles admin read all"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
