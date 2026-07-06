-- ============================================================
-- GUEST FEEDBACK — "Enjoyed our food?" star-rating form on the homepage.
-- Lands as status='pending' so submissions never appear in the public
-- reviews strip (listApprovedReviews only selects status='approved')
-- until staff review and flip them to 'approved'. Follows the same
-- hardened guest-insert pattern as contact_messages / catering_requests.
-- ============================================================

GRANT INSERT ON public.reviews TO anon, authenticated;

CREATE POLICY "reviews guest insert pending" ON public.reviews FOR INSERT
  WITH CHECK (
    status = 'pending'
    AND is_sample = false
    AND length(btrim(author_first_name)) BETWEEN 1 AND 60
    AND length(btrim(body)) BETWEEN 1 AND 600
    AND rating BETWEEN 1 AND 5
  );
