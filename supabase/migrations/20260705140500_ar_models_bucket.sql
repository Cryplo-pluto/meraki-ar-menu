
-- Storage bucket for admin-uploaded, scale-normalized GLB models. Public read
-- (model-viewer/AR fetch these directly from the client); writes restricted
-- to admins. The upload path itself uses the service-role client, so these
-- policies are defense-in-depth against direct client/API writes.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('ar-models', 'ar-models', true, 26214400, ARRAY['model/gltf-binary', 'application/octet-stream'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "ar-models public read" ON storage.objects;
CREATE POLICY "ar-models public read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'ar-models');

DROP POLICY IF EXISTS "ar-models admin write" ON storage.objects;
CREATE POLICY "ar-models admin write" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'ar-models' AND private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "ar-models admin update" ON storage.objects;
CREATE POLICY "ar-models admin update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'ar-models' AND private.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'ar-models' AND private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "ar-models admin delete" ON storage.objects;
CREATE POLICY "ar-models admin delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'ar-models' AND private.has_role(auth.uid(), 'admin'));
