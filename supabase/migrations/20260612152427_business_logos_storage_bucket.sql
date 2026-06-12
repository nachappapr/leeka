-- ─────────────────────────────────────────────────────────────────────────────
-- AP-36: business-logos Storage bucket + tenant-scoped Storage RLS
--
-- Bucket is PRIVATE (public=false).
-- Object path convention: {business_id}/{filename}
-- RLS uses (storage.foldername(name))[1] to extract the leading path segment
-- and casts it to uuid for the EXISTS check against business_members.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Create the private bucket (2 MB limit, restricted MIME types)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-logos',
  'business-logos',
  false,
  2097152,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
);

-- Helper note: (storage.foldername(name))[1] returns the leading path segment,
-- i.e. the business_id, from paths of the form "{business_id}/{filename}".

-- 2. SELECT — members may read objects in their own business folder
CREATE POLICY "business_logos_select"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'business-logos'
  AND EXISTS (
    SELECT 1
    FROM public.business_members
    WHERE business_members.business_id = (storage.foldername(name))[1]::uuid
      AND business_members.user_id = (SELECT auth.uid())
  )
);

-- 3. INSERT — members may upload objects into their own business folder
CREATE POLICY "business_logos_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'business-logos'
  AND EXISTS (
    SELECT 1
    FROM public.business_members
    WHERE business_members.business_id = (storage.foldername(name))[1]::uuid
      AND business_members.user_id = (SELECT auth.uid())
  )
);

-- 4. UPDATE — members may update objects in their own business folder
CREATE POLICY "business_logos_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'business-logos'
  AND EXISTS (
    SELECT 1
    FROM public.business_members
    WHERE business_members.business_id = (storage.foldername(name))[1]::uuid
      AND business_members.user_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  bucket_id = 'business-logos'
  AND EXISTS (
    SELECT 1
    FROM public.business_members
    WHERE business_members.business_id = (storage.foldername(name))[1]::uuid
      AND business_members.user_id = (SELECT auth.uid())
  )
);

-- 5. DELETE — members may delete objects in their own business folder
CREATE POLICY "business_logos_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'business-logos'
  AND EXISTS (
    SELECT 1
    FROM public.business_members
    WHERE business_members.business_id = (storage.foldername(name))[1]::uuid
      AND business_members.user_id = (SELECT auth.uid())
  )
);
